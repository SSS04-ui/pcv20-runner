
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';
import { useStore, MAX_VACCINES, MILESTONE_VACCINE_COUNT } from '../../store';
import { GameObject, ObjectType, SPAWN_DISTANCE, REMOVE_DISTANCE, GameStatus, LANE_WIDTH } from '../../types';
import { audio } from '../System/Audio';

// --- GEOMETRY DEFINITIONS ---

const SYRINGE_BODY_GEO = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 12);
const SYRINGE_CAP_GEO = new THREE.CylinderGeometry(0.14, 0.14, 0.05, 12);
const SYRINGE_NEEDLE_GEO = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8);
const SYRINGE_PLUNGER_GEO = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
const SYRINGE_GRIP_GEO = new THREE.BoxGeometry(0.3, 0.04, 0.1);
const SYRINGE_OUTLINE_GEO = new THREE.CylinderGeometry(0.18, 0.18, 0.65, 12);

const HURDLE_BASE_GEO = new THREE.BoxGeometry(3.3, 0.15, 0.5);
const HURDLE_TOP_BAR_GEO = new THREE.BoxGeometry(3.3, 0.2, 0.2);
const HURDLE_POST_GEO = new THREE.CylinderGeometry(0.1, 0.15, 0.6, 8);

const GATE_TOP_HOUSING_GEO = new THREE.BoxGeometry(3.4, 0.6, 0.8);
const GATE_EMITTER_GEO = new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8);
const GATE_SIDE_POST_GEO = new THREE.BoxGeometry(0.25, 3.5, 0.4);

const ARROW_SHAPE = new THREE.Shape();
ARROW_SHAPE.moveTo(0, 0.4);
ARROW_SHAPE.lineTo(0.3, 0);
ARROW_SHAPE.lineTo(0.12, 0);
ARROW_SHAPE.lineTo(0.12, -0.4);
ARROW_SHAPE.lineTo(-0.12, -0.4);
ARROW_SHAPE.lineTo(-0.12, 0);
ARROW_SHAPE.lineTo(-0.3, 0);
ARROW_SHAPE.lineTo(0, 0.4);
const ICON_GEO = new THREE.ExtrudeGeometry(ARROW_SHAPE, { depth: 0.1, bevelEnabled: false });
ICON_GEO.center();

const SHADOW_GEO = new THREE.CircleGeometry(1.2, 32);
const PARTICLE_COUNT = 300;

const COLOR_JUMP = '#10b981'; // Green for Jump
const COLOR_SLIDE = '#f43f5e'; // Rose/Red for Slide
const COLOR_VACCINE = '#0ea5e9'; 
const COLOR_GOLD = '#fbbf24';

const ParticleSystem: React.FC = () => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const particles = useMemo(() => new Array(PARTICLE_COUNT).fill(0).map(() => ({
        life: 0, pos: new THREE.Vector3(), vel: new THREE.Vector3(), color: new THREE.Color()
    })), []);

    useEffect(() => {
        const handleExplosion = (e: CustomEvent) => {
            const { position, color } = e.detail;
            let spawned = 0;
            for(let i = 0; i < PARTICLE_COUNT; i++) {
                const p = particles[i];
                if (p.life <= 0) {
                    p.life = 1.0; 
                    p.pos.set(position[0], position[1], position[2]);
                    p.vel.set((Math.random()-0.5)*15, (Math.random()-0.5)*15, (Math.random()-0.5)*15);
                    p.color.set(color);
                    if (++spawned > 40) break;
                }
            }
        };
        window.addEventListener('particle-burst', handleExplosion as any);
        return () => window.removeEventListener('particle-burst', handleExplosion as any);
    }, [particles]);

    useFrame((state, delta) => {
        const { status, showLevelUpPopup } = useStore.getState();
        if (!mesh.current || status === GameStatus.PAUSED || showLevelUpPopup) return;
        particles.forEach((p, i) => {
            if (p.life > 0) {
                p.life -= delta * 1.5;
                p.pos.addScaledVector(p.vel, delta);
                dummy.position.copy(p.pos);
                dummy.scale.setScalar(p.life * 0.4);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
                mesh.current!.setColorAt(i, p.color);
            } else {
                dummy.scale.setScalar(0);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
            }
        });
        mesh.current.instanceMatrix.needsUpdate = true;
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, PARTICLE_COUNT]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
    );
};

export const LevelManager: React.FC = () => {
  const { status, speed, collectVaccine, level, tick, laneCount, vaccineCount, showLevelUpPopup, isMilestonePaused, startTime, timeLeft } = useStore();
  const objectsRef = useRef<GameObject[]>([]);
  const [, setRenderTrigger] = useState(0);
  const playerObjRef = useRef<THREE.Object3D | null>(null);
  const totalDistance = useRef(0);
  
  const nextObstacleDistance = useRef(9999); 
  const nextVaccineDistance = useRef(21); 

  const firstSpawnDone = useRef(false);
  const prevShowPopup = useRef(false);

  const obstaclesSinceLastVaccine = useRef(0);
  const lastVaccineLane = useRef<number | null>(null);
  const consecutiveVaccineLaneCount = useRef(0);
  const totalSpawnedVaccines = useRef(0);

  const getLaneX = (lane: number) => (lane - Math.floor(laneCount / 2)) * LANE_WIDTH;

  useFrame((state, delta) => {
      if (status === GameStatus.PLAYING) {
          tick(delta);
          if (!playerObjRef.current) {
              const group = state.scene.getObjectByName('PlayerGroup');
              if (group && group.children.length > 0) playerObjRef.current = group.children[0];
          }
      }
  });

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) return;

    if (showLevelUpPopup && !prevShowPopup.current) {
        // Filter out non-vaccine objects when popup shows to clear the track visually
        objectsRef.current = objectsRef.current.filter(o => o.type === ObjectType.VACCINE);
        setRenderTrigger(t => t + 1);
    }
    prevShowPopup.current = showLevelUpPopup;

    if (showLevelUpPopup) return;
    
    // While milestone pause is active, we push the next spawn timers forward to ensure a 1s delay
    if (isMilestonePaused) {
        nextObstacleDistance.current = totalDistance.current + (speed * 1.0); 
        nextVaccineDistance.current = totalDistance.current + (speed * 1.5); 
    }

    const safeDelta = Math.min(delta, 0.05); 
    const stepDist = speed * safeDelta;
    totalDistance.current += stepDist;

    let playerPos = new THREE.Vector3();
    let isSliding = false;
    if (playerObjRef.current) {
        playerObjRef.current.getWorldPosition(playerPos);
        isSliding = playerObjRef.current.userData.isSliding || false;
    }

    const currentObjects = objectsRef.current;
    let hasChanges = false;

    // Trigger first obstacle immediately (0.05s from start) and very close (35 units)
    if (timeLeft <= 44.95 && !firstSpawnDone.current) {
        const lane = Math.floor(Math.random() * laneCount);
        currentObjects.push({
            id: 'initial-barrier',
            type: ObjectType.OBSTACLE,
            position: [getLaneX(lane), 0.4, -35], // Closer so it arrives almost instantly
            active: true,
            color: COLOR_JUMP
        });
        firstSpawnDone.current = true;
        obstaclesSinceLastVaccine.current += 1;
        nextObstacleDistance.current = totalDistance.current + (speed * 0.5); // Next one follows fast
        hasChanges = true;
    }

    for (let i = currentObjects.length - 1; i >= 0; i--) {
        const obj = currentObjects[i];
        obj.position[2] += stepDist;
        if (obj.active) {
            const inZ = Math.abs(obj.position[2] - playerPos.z) < 1.0;
            const inX = Math.abs(obj.position[0] - playerPos.x) < 1.4;
            
            if (inZ && inX) {
                if (obj.type === ObjectType.VACCINE) {
                    collectVaccine();
                    obstaclesSinceLastVaccine.current = 0;
                    audio.playLetterCollect();
                    window.dispatchEvent(new CustomEvent('particle-burst', { detail: { position: obj.position, color: obj.color } }));
                    obj.active = false;
                } else if (!isMilestonePaused) {
                    let hit = false;
                    if (obj.type === ObjectType.OBSTACLE && playerPos.y < 1.2) hit = true; 
                    if (obj.type === ObjectType.HIGH_BARRIER && !isSliding) hit = true; 
                    if (hit) { 
                        window.dispatchEvent(new Event('player-hit')); 
                        obj.active = false; 
                    }
                }
                hasChanges = true;
            }
        }
        if (obj.position[2] > REMOVE_DISTANCE) { currentObjects.splice(i, 1); hasChanges = true; }
    }

    if (firstSpawnDone.current && totalDistance.current >= nextObstacleDistance.current && !isMilestonePaused) {
        const elapsedTime = (Date.now() - startTime) / 1000;
        let targetReactionTime: number;
        let doubleLaneChance = 0.15; 
        const freqMultiplier = 1.3;

        if (elapsedTime < 2) {
            targetReactionTime = 1.0 / freqMultiplier;
        } else if (elapsedTime < 10) {
            const progress = (elapsedTime - 2) / 8;
            const baseWindow = 1.0 - (progress * 0.25);
            targetReactionTime = baseWindow / freqMultiplier;
        } else if (elapsedTime < 15) {
            targetReactionTime = 0.7;
            doubleLaneChance = 0.25; 
        } else {
            const baseWindow = 0.8;
            const difficultyReduction = Math.min(0.3, level * 0.05); 
            targetReactionTime = (baseWindow - difficultyReduction) + (Math.random() * 0.15);
            doubleLaneChance = 0.2 + Math.min(0.3, level * 0.03);
        }
        
        const type = Math.random() > 0.4 ? ObjectType.HIGH_BARRIER : ObjectType.OBSTACLE;
        const isDoubleLane = Math.random() < doubleLaneChance; 
        const safetyBuffer = isDoubleLane ? (speed * 0.4) : 0;
        nextObstacleDistance.current = totalDistance.current + (speed * targetReactionTime) + safetyBuffer;
        
        if (isDoubleLane) {
            const laneA = Math.floor(Math.random() * laneCount);
            let laneB = (laneA + 1) % laneCount;
            if (Math.random() > 0.5) laneB = (laneA + 2) % laneCount;

            [laneA, laneB].forEach(l => {
                currentObjects.push({
                    id: uuidv4(), type, position: [getLaneX(l), type === ObjectType.HIGH_BARRIER ? 2.5 : 0.4, -SPAWN_DISTANCE],
                    active: true, color: type === ObjectType.HIGH_BARRIER ? COLOR_SLIDE : COLOR_JUMP
                });
            });
            obstaclesSinceLastVaccine.current += 1;
        } else {
            const lane = Math.floor(Math.random() * laneCount);
            currentObjects.push({
                id: uuidv4(), type, position: [getLaneX(lane), type === ObjectType.HIGH_BARRIER ? 2.5 : 0.4, -SPAWN_DISTANCE],
                active: true, color: type === ObjectType.HIGH_BARRIER ? COLOR_SLIDE : COLOR_JUMP
            });
            obstaclesSinceLastVaccine.current += 1;
        }
        hasChanges = true;
    }

    if (totalDistance.current >= nextVaccineDistance.current && !isMilestonePaused) {
        let meetsBarrierRequirement = obstaclesSinceLastVaccine.current >= 2; 

        if (meetsBarrierRequirement && totalSpawnedVaccines.current < 30 && vaccineCount < MAX_VACCINES) {
            let lane = Math.floor(Math.random() * laneCount);
            if (consecutiveVaccineLaneCount.current >= 2 && lane === lastVaccineLane.current) {
                lane = (lane + 1) % laneCount;
            }

            const minGapSeconds = 1.0;
            const maxGapSeconds = 2.0;
            const reactionTime = minGapSeconds + Math.random() * (maxGapSeconds - minGapSeconds);
            const finalStageMult = vaccineCount >= MILESTONE_VACCINE_COUNT ? 1.2 : 1.0;
            const vaccineSpawnGap = (speed * reactionTime) * finalStageMult;

            nextVaccineDistance.current = totalDistance.current + vaccineSpawnGap;
            const isFinal = vaccineCount === (MAX_VACCINES - 1);
            
            currentObjects.push({
                id: uuidv4(), 
                type: ObjectType.VACCINE, 
                position: [getLaneX(lane), 1.5, -SPAWN_DISTANCE - 15],
                active: true, 
                color: isFinal ? COLOR_GOLD : COLOR_VACCINE,
                isFinalVaccine: isFinal
            });
            
            totalSpawnedVaccines.current++;

            if (lane === lastVaccineLane.current) {
                consecutiveVaccineLaneCount.current += 1;
            } else {
                lastVaccineLane.current = lane;
                consecutiveVaccineLaneCount.current = 1;
            }
            hasChanges = true;
        } else if (!meetsBarrierRequirement) {
            nextVaccineDistance.current = totalDistance.current + (speed * 0.3); 
        }
    }
    if (hasChanges) { objectsRef.current = currentObjects; setRenderTrigger(t => t + 1); }
  });

  useEffect(() => {
    if (status === GameStatus.MENU) {
        firstSpawnDone.current = false;
        totalDistance.current = 0;
        nextObstacleDistance.current = 9999;
        nextVaccineDistance.current = 21;
        prevShowPopup.current = false;
        obstaclesSinceLastVaccine.current = 0;
        lastVaccineLane.current = null;
        consecutiveVaccineLaneCount.current = 0;
        totalSpawnedVaccines.current = 0;
    }
  }, [status]);

  return (
    <group>
      <ParticleSystem />
      {objectsRef.current.map(obj => obj.active && <GameEntity key={obj.id} data={obj} />)}
    </group>
  );
};

const SyringeFigure: React.FC<{ color: string, isFinal?: boolean }> = ({ color, isFinal }) => {
    return (
        <group rotation={[0.4, 0, 0.4]}>
            <mesh geometry={SYRINGE_OUTLINE_GEO}>
                <meshBasicMaterial color={isFinal ? COLOR_GOLD : "#ffffff"} side={THREE.BackSide} />
            </mesh>
            <mesh geometry={SYRINGE_BODY_GEO}>
                <meshStandardMaterial 
                    color={isFinal ? "#fef3c7" : "#ffffff"} 
                    transparent 
                    opacity={0.6} 
                    roughness={isFinal ? 0.05 : 0} 
                    metalness={0.9} 
                />
            </mesh>
            <mesh scale={[0.8, 0.7, 0.8]} position={[0, -0.05, 0]} geometry={SYRINGE_BODY_GEO}>
                <meshStandardMaterial 
                    color={color} 
                    emissive={color} 
                    emissiveIntensity={isFinal ? 10 : 3} 
                    metalness={isFinal ? 1 : 0.5}
                    roughness={isFinal ? 0.1 : 0.5}
                />
            </mesh>
            <mesh position={[0, 0.3, 0]} geometry={SYRINGE_CAP_GEO}>
                <meshStandardMaterial color={isFinal ? "#f59e0b" : "#ccc"} metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.45, 0]} geometry={SYRINGE_NEEDLE_GEO}>
                <meshStandardMaterial color={isFinal ? "#fbbf24" : "#fff"} metalness={1} />
            </mesh>
            <mesh position={[0, -0.4, 0]} geometry={SYRINGE_PLUNGER_GEO}>
                <meshStandardMaterial color={isFinal ? "#f59e0b" : "#fff"} metalness={1} />
            </mesh>
            <mesh position={[0, -0.32, 0]} geometry={SYRINGE_GRIP_GEO}>
                <meshStandardMaterial color={isFinal ? "#fbbf24" : "#ccc"} metalness={1} />
            </mesh>
        </group>
    );
};

const GameEntity: React.FC<{ data: GameObject }> = React.memo(({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const iconRef = useRef<THREE.Group>(null);
    const warningRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const { status, showLevelUpPopup } = useStore.getState();
        if (status === GameStatus.PAUSED || showLevelUpPopup) return;
        if (groupRef.current) groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);
        if (iconRef.current) {
            const time = state.clock.elapsedTime;
            iconRef.current.scale.setScalar(1 + Math.sin(time * 8) * 0.1);
            iconRef.current.position.y = (data.type === ObjectType.HIGH_BARRIER ? -1.0 : 0.8) + Math.sin(time * 4) * 0.05;
        }
        if (warningRef.current) {
            const time = state.clock.elapsedTime;
            const material = warningRef.current.material as THREE.MeshBasicMaterial;
            if (material) {
                material.opacity = 0.2 + Math.abs(Math.sin(time * 5)) * 0.4;
            }
        }
        if (data.type === ObjectType.VACCINE && groupRef.current) {
            groupRef.current.rotation.y += data.isFinalVaccine ? 0.08 : 0.04;
        }
    });

    return (
        <group ref={groupRef}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -data.position[1] + 0.02, 0]} geometry={SHADOW_GEO}>
                <meshBasicMaterial color={data.isFinalVaccine ? COLOR_GOLD : "#000"} opacity={data.isFinalVaccine ? 0.4 : 0.15} transparent />
            </mesh>

            {(data.type === ObjectType.OBSTACLE || data.type === ObjectType.HIGH_BARRIER) && (
              <mesh ref={warningRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -data.position[1] + 0.03, 10]}>
                <planeGeometry args={[LANE_WIDTH - 0.2, 20.0]} />
                <meshBasicMaterial color={data.color} transparent opacity={0.4} />
              </mesh>
            )}

            {data.type === ObjectType.OBSTACLE && (
                <group>
                    <mesh position={[0, -0.35, 0]} geometry={HURDLE_BASE_GEO}>
                        <meshStandardMaterial color="#334155" />
                    </mesh>
                    <mesh position={[0, 0.2, 0]} geometry={HURDLE_TOP_BAR_GEO}>
                        <meshStandardMaterial color={data.color} />
                    </mesh>
                    <mesh position={[1.5, -0.1, 0]} geometry={HURDLE_POST_GEO}>
                        <meshStandardMaterial color="#64748b" />
                    </mesh>
                    <mesh position={[-1.5, -0.1, 0]} geometry={HURDLE_POST_GEO}>
                        <meshStandardMaterial color="#64748b" />
                    </mesh>
                    <group ref={iconRef}>
                        <mesh geometry={ICON_GEO}>
                            <meshBasicMaterial color={data.color} />
                        </mesh>
                    </group>
                </group>
            )}
            {data.type === ObjectType.HIGH_BARRIER && (
                <group>
                    <mesh position={[0, 0, 0]} geometry={GATE_TOP_HOUSING_GEO}>
                        <meshStandardMaterial color="#334155" />
                    </mesh>
                    <mesh position={[0, -0.35, 0]} geometry={GATE_EMITTER_GEO} rotation={[Math.PI, 0, 0]}>
                        <meshStandardMaterial color={data.color} />
                    </mesh>
                    <mesh position={[1.6, -1.2, 0]} geometry={GATE_SIDE_POST_GEO}>
                        <meshStandardMaterial color="#64748b" />
                    </mesh>
                    <mesh position={[-1.6, -1.2, 0]} geometry={GATE_SIDE_POST_GEO}>
                        <meshStandardMaterial color="#64748b" />
                    </mesh>
                    <group ref={iconRef} rotation={[0, 0, Math.PI]}>
                        <mesh geometry={ICON_GEO}>
                            <meshBasicMaterial color={data.color} />
                        </mesh>
                    </group>
                </group>
            )}
            {data.type === ObjectType.VACCINE && <SyringeFigure color={data.color!} isFinal={data.isFinalVaccine} />}
        </group>
    );
});
