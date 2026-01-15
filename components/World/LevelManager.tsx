
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

// Aliases for Three.js intrinsic elements to bypass JSX type check issues
const InstancedMesh = 'instancedMesh' as any;
const SphereGeometry = 'sphereGeometry' as any;
const MeshBasicMaterial = 'meshBasicMaterial' as any;
const Group = 'group' as any;
const Mesh = 'mesh' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const PlaneGeometry = 'planeGeometry' as any;
const TorusGeometry = 'torusGeometry' as any;
const CylinderGeometry = 'cylinderGeometry' as any;

// --- GEOMETRY DEFINITIONS ---

const SYRINGE_BODY_GEO = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 12);
const SYRINGE_CAP_GEO = new THREE.CylinderGeometry(0.14, 0.14, 0.05, 12);
const SYRINGE_NEEDLE_GEO = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8);
const SYRINGE_PLUNGER_GEO = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
const SYRINGE_GRIP_GEO = new THREE.BoxGeometry(0.3, 0.04, 0.1);
const SYRINGE_OUTLINE_GEO = new THREE.CylinderGeometry(0.2, 0.2, 0.7, 12);
const PICKUP_HALO_GEO = new THREE.TorusGeometry(1.0, 0.06, 8, 32); 
const PICKUP_GLOW_RING_GEO = new THREE.TorusGeometry(0.9, 0.02, 4, 24);

const HURDLE_BASE_GEO = new THREE.BoxGeometry(3.3, 0.15, 0.5);
const HURDLE_TOP_BAR_GEO = new THREE.BoxGeometry(3.3, 0.25, 0.25);
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
const VACCINE_GLOW_FLOOR_GEO = new THREE.CircleGeometry(1.5, 32);
const PARTICLE_COUNT = 300;

const COLOR_JUMP = '#10b981'; // Neon Green
const COLOR_SLIDE = '#f43f5e'; // Neon Red
const COLOR_VACCINE = '#0ea5e9'; 
const COLOR_GOLD = '#fbbf24';
const COLOR_ULTIMATE_OBSTACLE = '#ffffff'; // Blinding White frame for Ultimate Stage

const ParticleSystem: React.FC = () => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const particles = useMemo(() => new Array(PARTICLE_COUNT).fill(0).map(() => ({
        life: 0, pos: new THREE.Vector3(), vel: new THREE.Vector3(), color: new THREE.Color()
    })), []);

    useEffect(() => {
        const handleExplosion = (e: CustomEvent) => {
            const { position, color } = e.detail;
            if (!position || !color) return;
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
        <InstancedMesh ref={mesh} args={[undefined, undefined, PARTICLE_COUNT]}>
            <SphereGeometry args={[0.2, 8, 8]} />
            <MeshBasicMaterial toneMapped={false} />
        </InstancedMesh>
    );
};

export const LevelManager: React.FC = () => {
  const { status, speed, collectVaccine, level, tick, laneCount, vaccineCount, showLevelUpPopup, isMilestonePaused, timeLeft } = useStore();
  const objectsRef = useRef<GameObject[]>([]);
  const [, setRenderTrigger] = useState(0);
  const playerObjRef = useRef<THREE.Object3D | null>(null);
  const totalDistance = useRef(0);
  
  const nextObstacleDistance = useRef(9999); 
  const nextVaccineDistance = useRef(21); 

  const firstSpawnDone = useRef(false);
  const obstaclesSinceLastVaccine = useRef(0);
  const totalSpawnedVaccines = useRef(0);
  const lastVaccineLaneRef = useRef<number>(-1);

  // Robust Reset Mechanism for Game Restart
  useEffect(() => {
    if (status === GameStatus.PLAYING && vaccineCount === 0) {
        objectsRef.current = [];
        totalDistance.current = 0;
        firstSpawnDone.current = false;
        obstaclesSinceLastVaccine.current = 0;
        totalSpawnedVaccines.current = 0;
        lastVaccineLaneRef.current = -1;
        nextObstacleDistance.current = 9999;
        nextVaccineDistance.current = 21;
        setRenderTrigger(t => t + 1);
    }
  }, [status, vaccineCount]);

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
    if (showLevelUpPopup) return;
    
    if (isMilestonePaused) {
        nextObstacleDistance.current = totalDistance.current + (speed * 1.0); 
        nextVaccineDistance.current = nextObstacleDistance.current + (speed * 1.5); 
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

    if (timeLeft <= 49.99 && !firstSpawnDone.current) {
        const lane = Math.floor(Math.random() * laneCount);
        currentObjects.push({
            id: 'initial-barrier',
            type: ObjectType.OBSTACLE,
            position: [getLaneX(lane), 0.4, -35], 
            active: true,
            color: COLOR_JUMP
        });
        firstSpawnDone.current = true;
        obstaclesSinceLastVaccine.current += 1;
        nextObstacleDistance.current = totalDistance.current + (speed * 0.8); 
        hasChanges = true;
    }

    for (let i = currentObjects.length - 1; i >= 0; i--) {
        const obj = currentObjects[i];
        if (!obj) continue;
        
        obj.position[2] += stepDist;
        if (obj.active) {
            const inZ = Math.abs(obj.position[2] - playerPos.z) < 1.4;
            const inX = Math.abs(obj.position[0] - playerPos.x) < 1.6;
            
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
        const isUltimate = vaccineCount >= MILESTONE_VACCINE_COUNT;
        const targetReactionTime = (isUltimate ? 0.65 : 0.8 - Math.min(0.2, level * 0.02)) * 1.43;
        const doubleLaneChance = isUltimate ? 0.3 : 0.15 + Math.min(0.2, level * 0.02);
        const type = Math.random() > 0.45 ? ObjectType.HIGH_BARRIER : ObjectType.OBSTACLE;
        const obstacleColor = type === ObjectType.HIGH_BARRIER ? COLOR_SLIDE : COLOR_JUMP;
        const isDoubleLane = Math.random() < doubleLaneChance; 
        
        nextObstacleDistance.current = totalDistance.current + (speed * targetReactionTime);
        
        if (isDoubleLane) {
            const laneA = Math.floor(Math.random() * laneCount);
            let laneB = (laneA + 1) % laneCount;
            [laneA, laneB].forEach(l => {
                currentObjects.push({
                    id: uuidv4(), type, position: [getLaneX(l), type === ObjectType.HIGH_BARRIER ? 2.5 : 0.4, -SPAWN_DISTANCE],
                    active: true, color: obstacleColor
                });
            });
            obstaclesSinceLastVaccine.current += 1;
        } else {
            const lane = Math.floor(Math.random() * laneCount);
            currentObjects.push({
                id: uuidv4(), type, position: [getLaneX(lane), type === ObjectType.HIGH_BARRIER ? 2.5 : 0.4, -SPAWN_DISTANCE],
                active: true, color: obstacleColor
            });
            obstaclesSinceLastVaccine.current += 1;
        }
        hasChanges = true;
    }

    if (totalDistance.current >= nextVaccineDistance.current && !isMilestonePaused) {
        const isPostMilestone = vaccineCount >= MILESTONE_VACCINE_COUNT;
        const barrierRequirement = isPostMilestone ? 3 : 2; 
        
        if (obstaclesSinceLastVaccine.current >= barrierRequirement && vaccineCount < MAX_VACCINES) {
            let lane = Math.floor(Math.random() * laneCount);
            
            // Constraint: No consecutive vaccines in the same lane
            if (lane === lastVaccineLaneRef.current) {
                lane = (lane + 1) % laneCount;
            }
            lastVaccineLaneRef.current = lane;
            
            // INCREASE VACCINE FREQUENCY BY ANOTHER 25%: 1.15 / 1.25 = 0.92
            nextVaccineDistance.current = totalDistance.current + (speed * 0.92);
            
            currentObjects.push({
                id: uuidv4(), 
                type: ObjectType.VACCINE, 
                position: [getLaneX(lane), 1.5, -SPAWN_DISTANCE - 10],
                active: true, 
                color: isPostMilestone ? COLOR_GOLD : COLOR_VACCINE,
                isFinalVaccine: isPostMilestone
            });
            totalSpawnedVaccines.current++;
            hasChanges = true;
        } else if (obstaclesSinceLastVaccine.current < barrierRequirement) {
            nextVaccineDistance.current = totalDistance.current + (speed * 0.2); 
        }
    }
    if (hasChanges) { 
        objectsRef.current = currentObjects; 
        setRenderTrigger(t => t + 1); 
    }
  });

  return (
    <Group>
      <ParticleSystem />
      {objectsRef.current.map(obj => obj && obj.active && <GameEntity key={obj.id} data={obj} />)}
    </Group>
  );
};

const SyringeFigure: React.FC<{ color: string, isFinal?: boolean }> = ({ color, isFinal }) => {
    const haloRef = useRef<THREE.Group>(null);
    const ringRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (haloRef.current) {
            const time = state.clock.elapsedTime;
            haloRef.current.rotation.z = time * 2;
            const s = 1 + Math.sin(time * 6) * 0.1;
            haloRef.current.scale.set(s, s, s);
        }
        if (ringRef.current) {
            const time = state.clock.elapsedTime;
            ringRef.current.rotation.y = -time * 3;
            ringRef.current.rotation.x = Math.sin(time * 2) * 0.5;
        }
    });

    return (
        <Group rotation={[0.4, 0, 0.4]}>
            <Group ref={haloRef} rotation={[Math.PI / 2, 0, 0]}>
                <Mesh geometry={PICKUP_HALO_GEO}>
                    <MeshStandardMaterial color={isFinal ? COLOR_GOLD : color} transparent opacity={0.3} emissive={isFinal ? COLOR_GOLD : color} emissiveIntensity={2} />
                </Mesh>
            </Group>
            <Group ref={ringRef}>
                <Mesh geometry={PICKUP_GLOW_RING_GEO}>
                    <MeshBasicMaterial color="#fff" transparent opacity={0.6} />
                </Mesh>
            </Group>
            <Mesh geometry={SYRINGE_OUTLINE_GEO}>
                <MeshBasicMaterial color={isFinal ? COLOR_GOLD : "#ffffff"} side={THREE.BackSide} />
            </Mesh>
            <Mesh geometry={SYRINGE_BODY_GEO}>
                <MeshStandardMaterial color={isFinal ? "#fef3c7" : "#ffffff"} transparent opacity={0.8} roughness={0.1} metalness={0.9} />
            </Mesh>
            <Mesh scale={[0.85, 0.75, 0.85]} position={[0, -0.05, 0]} geometry={SYRINGE_BODY_GEO}>
                <MeshStandardMaterial color={color} emissive={color} emissiveIntensity={isFinal ? 12 : 5} metalness={0.9} roughness={0.1} />
            </Mesh>
            <Mesh position={[0, 0.3, 0]} geometry={SYRINGE_CAP_GEO}>
                <MeshStandardMaterial color={isFinal ? "#f59e0b" : "#ccc"} metalness={1} roughness={0.2} />
            </Mesh>
            <Mesh position={[0, 0.45, 0]} geometry={SYRINGE_NEEDLE_GEO}>
                <MeshStandardMaterial color={isFinal ? "#fbbf24" : "#fff"} metalness={1} />
            </Mesh>
            <Mesh position={[0, -0.4, 0]} geometry={SYRINGE_PLUNGER_GEO}>
                <MeshStandardMaterial color={isFinal ? "#f59e0b" : "#fff"} metalness={1} />
            </Mesh>
            <Mesh position={[0, -0.32, 0]} geometry={SYRINGE_GRIP_GEO}>
                <MeshStandardMaterial color={isFinal ? "#fbbf24" : "#ccc"} metalness={1} />
            </Mesh>
        </Group>
    );
};

const GameEntity: React.FC<{ data: GameObject }> = React.memo(({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const iconRef = useRef<THREE.Group>(null);
    const floorGlowRef = useRef<THREE.Mesh>(null);
    const topBarRef = useRef<THREE.Mesh>(null);
    const emitterRef = useRef<THREE.Mesh>(null);
    const baseRef = useRef<THREE.Mesh>(null);
    const postALeftRef = useRef<THREE.Mesh>(null);
    const postARightRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const { status, showLevelUpPopup, vaccineCount } = useStore.getState();
        if (status === GameStatus.PAUSED || showLevelUpPopup) return;
        if (groupRef.current) groupRef.current.position.set(data.position[0], data.position[1], data.position[2]);
        
        const time = state.clock.elapsedTime;
        const isUltimate = vaccineCount >= MILESTONE_VACCINE_COUNT;

        if (iconRef.current) {
            iconRef.current.scale.setScalar(1 + Math.sin(time * 8) * 0.1);
            iconRef.current.position.y = (data.type === ObjectType.HIGH_BARRIER ? -1.0 : 0.8) + Math.sin(time * 4) * 0.05;
        }

        if (floorGlowRef.current) {
            floorGlowRef.current.scale.setScalar(1 + Math.sin(time * 6) * 0.15);
            (floorGlowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(time * 6) * 0.2;
        }

        if (isUltimate) {
            const pInt = 15 + Math.sin(time * 25) * 10; 
            const refs = [topBarRef, emitterRef, baseRef, postALeftRef, postARightRef];
            refs.forEach(r => { if (r.current) (r.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pInt; });
        }

        if (data.type === ObjectType.VACCINE && groupRef.current) {
            groupRef.current.rotation.y += data.isFinalVaccine ? 0.08 : 0.04;
        }
    });

    const isUltimate = useStore.getState().vaccineCount >= MILESTONE_VACCINE_COUNT;
    const frameColor = isUltimate ? COLOR_ULTIMATE_OBSTACLE : undefined;

    return (
        <Group ref={groupRef}>
            {data.type === ObjectType.VACCINE ? (
                <Mesh ref={floorGlowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -data.position[1] + 0.05, 0]} geometry={VACCINE_GLOW_FLOOR_GEO}>
                    <MeshBasicMaterial color={data.isFinalVaccine ? COLOR_GOLD : COLOR_VACCINE} transparent opacity={0.4} />
                </Mesh>
            ) : (
                <Group>
                    <Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -data.position[1] + 0.02, 0]} geometry={SHADOW_GEO}>
                        <MeshBasicMaterial color="#000" opacity={0.3} transparent />
                    </Mesh>
                </Group>
            )}

            {data.type === ObjectType.OBSTACLE && (
                <Group>
                    <Mesh ref={baseRef} position={[0, -0.35, 0]} geometry={HURDLE_BASE_GEO}>
                        <MeshStandardMaterial color={frameColor || "#0f172a"} emissive={frameColor} />
                    </Mesh>
                    <Mesh ref={topBarRef} position={[0, 0.2, 0]} geometry={HURDLE_TOP_BAR_GEO}>
                        <MeshStandardMaterial color={isUltimate ? COLOR_ULTIMATE_OBSTACLE : data.color} emissive={isUltimate ? COLOR_ULTIMATE_OBSTACLE : data.color} emissiveIntensity={isUltimate ? 15 : 1} />
                    </Mesh>
                    <Mesh ref={postALeftRef} position={[1.5, -0.1, 0]} geometry={HURDLE_POST_GEO}>
                        <MeshStandardMaterial color={frameColor || "#1e293b"} emissive={frameColor} />
                    </Mesh>
                    <Mesh ref={postARightRef} position={[-1.5, -0.1, 0]} geometry={HURDLE_POST_GEO}>
                        <MeshStandardMaterial color={frameColor || "#1e293b"} emissive={frameColor} />
                    </Mesh>
                    <Group ref={iconRef}>
                        <Mesh geometry={ICON_GEO}>
                            <MeshBasicMaterial color={data.color} />
                        </Mesh>
                    </Group>
                </Group>
            )}
            {data.type === ObjectType.HIGH_BARRIER && (
                <Group>
                    <Mesh ref={baseRef} position={[0, 0, 0]} geometry={GATE_TOP_HOUSING_GEO}>
                        <MeshStandardMaterial color={frameColor || "#0f172a"} emissive={frameColor} />
                    </Mesh>
                    <Mesh ref={emitterRef} position={[0, -0.35, 0]} geometry={GATE_EMITTER_GEO} rotation={[Math.PI, 0, 0]}>
                        <MeshStandardMaterial color={isUltimate ? COLOR_ULTIMATE_OBSTACLE : data.color} emissive={isUltimate ? COLOR_ULTIMATE_OBSTACLE : data.color} emissiveIntensity={isUltimate ? 15 : 1} />
                    </Mesh>
                    <Mesh ref={postALeftRef} position={[1.6, -1.2, 0]} geometry={GATE_SIDE_POST_GEO}>
                        <MeshStandardMaterial color={frameColor || "#1e293b"} emissive={frameColor} />
                    </Mesh>
                    <Mesh ref={postARightRef} position={[-1.6, -1.2, 0]} geometry={GATE_SIDE_POST_GEO}>
                        <MeshStandardMaterial color={frameColor || "#1e293b"} emissive={frameColor} />
                    </Mesh>
                    <Group ref={iconRef} rotation={[0, 0, Math.PI]}>
                        <Mesh geometry={ICON_GEO}>
                            <MeshBasicMaterial color={data.color} />
                        </Mesh>
                    </Group>
                </Group>
            )}
            {data.type === ObjectType.VACCINE && <SyringeFigure color={data.color!} isFinal={data.isFinalVaccine} />}
        </Group>
    );
});
