
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../../store';
import { GameObject, ObjectType, SPAWN_DISTANCE, REMOVE_DISTANCE, GameStatus, LANE_WIDTH } from '../../types';
import { audio } from '../System/Audio';

// Removed redundant declare global JSX.IntrinsicElements block to avoid Duplicate Index Signature errors.
// The catch-all definition in App.tsx handles these types globally.

// --- Visual Constants ---
const OBSTACLE_HEIGHT = 1.6;

// Ground Bacteria (Jump Over)
const BACTERIA_CORE_GEO = new THREE.IcosahedronGeometry(0.6, 2);
const CILIA_GEO = new THREE.ConeGeometry(0.05, 0.4, 6);
const BACTERIA_BASE_RING = new THREE.TorusGeometry(0.7, 0.04, 8, 32);

// High Bacteria (Slide Under)
const VIRUS_BODY_GEO = new THREE.CapsuleGeometry(0.35, 1.4, 8, 16); // Horizontal barrier
const TENTACLE_GEO = new THREE.CapsuleGeometry(0.04, 0.7, 4, 8);

// Indicator Geometries
const ARROW_SHAPE = new THREE.Shape();
ARROW_SHAPE.moveTo(0, 0.5);
ARROW_SHAPE.lineTo(0.3, 0);
ARROW_SHAPE.lineTo(0.12, 0);
ARROW_SHAPE.lineTo(0.12, -0.5);
ARROW_SHAPE.lineTo(-0.12, -0.5);
ARROW_SHAPE.lineTo(-0.12, 0);
ARROW_SHAPE.lineTo(-0.3, 0);
ARROW_SHAPE.lineTo(0, 0.5);
const ARROW_GEO = new THREE.ExtrudeGeometry(ARROW_SHAPE, { depth: 0.1, bevelEnabled: false });
ARROW_GEO.center();

// Vaccine Geometries
const VACCINE_BODY_GEO = new THREE.CylinderGeometry(0.25, 0.25, 0.8, 12);
const VACCINE_LIQUID_GEO = new THREE.CylinderGeometry(0.20, 0.20, 0.65, 12);
const VACCINE_CAP_GEO = new THREE.CylinderGeometry(0.28, 0.28, 0.15, 12);
const VACCINE_NEEDLE_GEO = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6);
const VACCINE_PLUNGER_GEO = new THREE.CylinderGeometry(0.22, 0.22, 0.12, 12);
const VACCINE_ROD_GEO = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
const VACCINE_HANDLE_GEO = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 12);

const SHADOW_ITEM_GEO = new THREE.PlaneGeometry(1.0, 1.0);
const SHADOW_DEFAULT_GEO = new THREE.CircleGeometry(0.8, 6);
const SHADOW_BARRIER_GEO = new THREE.PlaneGeometry(2.4, 0.5);

const PARTICLE_COUNT = 600;
// Interval 28 ensures ~45 vaccines in 60s at base speed 21 (distance 1260 / 28 = 45)
const VACCINE_INTERVAL_BASE = 28; 

// High Contrast Neon Colors
const COLOR_JUMP = '#00FF41'; // Matrix Green (Ground)
const COLOR_SLIDE = '#FF00FF'; // Neon Magenta (High)
const COLOR_VACCINE = '#00CCFF'; // Electric Blue

const ParticleSystem: React.FC = () => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const particles = useMemo(() => new Array(PARTICLE_COUNT).fill(0).map(() => ({
        life: 0,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        rot: new THREE.Vector3(),
        rotVel: new THREE.Vector3(),
        color: new THREE.Color()
    })), []);

    useEffect(() => {
        const handleExplosion = (e: CustomEvent) => {
            const { position, color } = e.detail;
            let spawned = 0;
            const burstAmount = 40; 
            for(let i = 0; i < PARTICLE_COUNT; i++) {
                const p = particles[i];
                if (p.life <= 0) {
                    p.life = 1.0 + Math.random() * 0.5; 
                    p.pos.set(position[0], position[1], position[2]);
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    const speed = 2 + Math.random() * 10;
                    p.vel.set(Math.sin(phi) * Math.cos(theta), Math.sin(phi) * Math.sin(theta), Math.cos(phi)).multiplyScalar(speed);
                    p.rot.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                    p.rotVel.set(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).multiplyScalar(5);
                    p.color.set(color);
                    spawned++;
                    if (spawned >= burstAmount) break;
                }
            }
        };
        window.addEventListener('particle-burst', handleExplosion as any);
        return () => window.removeEventListener('particle-burst', handleExplosion as any);
    }, [particles]);

    useFrame((state, delta) => {
        if (!mesh.current) return;
        const safeDelta = Math.min(delta, 0.1);
        particles.forEach((p, i) => {
            if (p.life > 0) {
                p.life -= safeDelta * 1.5;
                p.pos.addScaledVector(p.vel, safeDelta);
                p.vel.y -= safeDelta * 5; 
                p.vel.multiplyScalar(0.98);
                p.rot.x += p.rotVel.x * safeDelta;
                p.rot.y += p.rotVel.y * safeDelta;
                dummy.position.copy(p.pos);
                const scale = Math.max(0, p.life * 0.25);
                dummy.scale.set(scale, scale, scale);
                dummy.rotation.set(p.rot.x, p.rot.y, p.rot.z);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
                mesh.current!.setColorAt(i, p.color);
            } else {
                dummy.scale.set(0,0,0);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
            }
        });
        mesh.current.instanceMatrix.needsUpdate = true;
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, PARTICLE_COUNT]}>
            <octahedronGeometry args={[0.5, 0]} />
            <meshBasicMaterial toneMapped={false} transparent opacity={0.9} />
        </instancedMesh>
    );
};

export const LevelManager: React.FC = () => {
  const { 
    status, speed, collectVaccine, level, vaccineCount, tick, laneCount
  } = useStore();
  
  const objectsRef = useRef<GameObject[]>([]);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const prevStatus = useRef(status);
  const prevLevel = useRef(level);

  const playerObjRef = useRef<THREE.Object3D | null>(null);
  const distanceTraveled = useRef(0);
  const nextItemDistance = useRef(VACCINE_INTERVAL_BASE);
  
  const lastObstacleType = useRef<ObjectType | null>(null);
  const consecutiveObstacleCount = useRef(0);

  useEffect(() => {
    const isRestart = status === GameStatus.PLAYING && prevStatus.current === GameStatus.GAME_OVER;
    const isMenuReset = status === GameStatus.MENU;
    const isLevelUp = level !== prevLevel.current && status === GameStatus.PLAYING;
    const isVictoryReset = status === GameStatus.PLAYING && prevStatus.current === GameStatus.VICTORY;

    if (isMenuReset || isRestart || isVictoryReset) {
        objectsRef.current = [];
        setRenderTrigger(t => t + 1);
        distanceTraveled.current = 0;
        nextItemDistance.current = VACCINE_INTERVAL_BASE;
        lastObstacleType.current = null;
        consecutiveObstacleCount.current = 0;
    } else if (isLevelUp && level > 1) {
        objectsRef.current = objectsRef.current.filter(obj => obj.position[2] > -80);
        setRenderTrigger(t => t + 1);
    }
    prevStatus.current = status;
    prevLevel.current = level;
  }, [status, level]);

  useFrame((state, delta) => {
      if (status === GameStatus.PLAYING) {
          tick(delta);
      }
      if (!playerObjRef.current) {
          const group = state.scene.getObjectByName('PlayerGroup');
          if (group && group.children.length > 0) {
              playerObjRef.current = group.children[0];
          }
      }
  });

  const determineObstacleType = () => {
      let obstacleType = ObjectType.OBSTACLE;
      if (lastObstacleType.current !== null && consecutiveObstacleCount.current >= 2) {
          obstacleType = lastObstacleType.current === ObjectType.OBSTACLE ? ObjectType.HIGH_BARRIER : ObjectType.OBSTACLE;
      } else {
          obstacleType = Math.random() < 0.5 ? ObjectType.HIGH_BARRIER : ObjectType.OBSTACLE;
      }
      if (lastObstacleType.current === obstacleType) {
          consecutiveObstacleCount.current += 1;
      } else {
          consecutiveObstacleCount.current = 1;
      }
      lastObstacleType.current = obstacleType;
      return obstacleType;
  };

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) return;

    const safeDelta = Math.min(delta, 0.05); 
    const dist = speed * safeDelta;
    distanceTraveled.current += dist;

    let hasChanges = false;
    let playerPos = new THREE.Vector3(0, 0, 0);
    let isSliding = false;
    
    if (playerObjRef.current) {
        playerObjRef.current.getWorldPosition(playerPos);
        isSliding = playerObjRef.current.userData.isSliding || false;
    }

    const currentObjects = objectsRef.current;
    const keptObjects: GameObject[] = [];

    for (const obj of currentObjects) {
        const moveMult = obj.speedMultiplier || 1.0;
        const moveAmount = dist * moveMult;
        obj.position[2] += moveAmount;
        
        let keep = true;
        if (obj.active) {
            const inZZone = (obj.position[2] > playerPos.z - 1.0) && (obj.position[2] < playerPos.z + 1.0);
            const laneDiff = Math.abs(obj.position[0] - playerPos.x);
            const inLane = laneDiff < 1.0;

            if (inZZone && inLane) {
                 const isVaccine = obj.type === ObjectType.VACCINE;
                 if (!isVaccine) {
                     let playerBottom = playerPos.y;
                     let playerTop = playerPos.y + 1.6; 
                     if (isSliding) playerTop = playerPos.y + 0.5;
                     let objBottom = 0;
                     let objTop = 0;
                     switch(obj.type) {
                        case ObjectType.OBSTACLE: objBottom = 0; objTop = 1.3; break;
                        case ObjectType.HIGH_BARRIER: objBottom = 1.1; objTop = 2.4; break;
                     }
                     if ((playerBottom < objTop) && (playerTop > objBottom)) { 
                         window.dispatchEvent(new Event('player-hit'));
                         obj.active = false; 
                         hasChanges = true;
                     }
                 } else {
                     const dy = Math.abs(obj.position[1] - playerPos.y);
                     if (dy < 2.0) { 
                        collectVaccine();
                        audio.playLetterCollect(); 
                        window.dispatchEvent(new CustomEvent('particle-burst', { 
                            detail: { position: obj.position, color: obj.isFinalVaccine ? '#ffcc00' : (obj.color || '#00ffff') } 
                        }));
                        obj.active = false;
                        hasChanges = true;
                     }
                 }
            }
        }
        if (obj.position[2] > REMOVE_DISTANCE) {
            keep = false;
            hasChanges = true;
        }
        if (keep) keptObjects.push(obj);
    }

    let furthestZ = 0;
    if (keptObjects.length > 0) furthestZ = Math.min(...keptObjects.map(o => o.position[2]));
    else furthestZ = -20;

    if (furthestZ > -SPAWN_DISTANCE) {
         // Obstacle gap reduced to increase frequency by 30%
         const minGap = 12 + (speed * 0.3); 
         const spawnZ = Math.min(furthestZ - minGap, -SPAWN_DISTANCE);
         
         const laneIndex = Math.floor(Math.random() * laneCount);
         const spawnX = (laneIndex - Math.floor(laneCount / 2)) * LANE_WIDTH;

         if (spawnZ <= -SPAWN_DISTANCE + 10) { 
             const isItemDue = distanceTraveled.current >= nextItemDistance.current;
             if (isItemDue) {
                 const currentCount = useStore.getState().vaccineCount;
                 const isFinal = currentCount === 19;
                 
                 // 50% jump collection requirement
                 const isHigh = Math.random() < 0.5;
                 const spawnY = isHigh ? 3.5 : 1.0;

                 keptObjects.push({
                    id: uuidv4(),
                    type: ObjectType.VACCINE,
                    position: [spawnX, spawnY, spawnZ], 
                    active: true,
                    color: COLOR_VACCINE,
                    isFinalVaccine: isFinal
                 });
                 nextItemDistance.current = distanceTraveled.current + VACCINE_INTERVAL_BASE;
                 hasChanges = true;
             } else {
                const obstacleType = determineObstacleType();
                const isBarrier = obstacleType === ObjectType.HIGH_BARRIER;
                const spawnY = isBarrier ? 1.7 : 0.6; 
                const newColor = isBarrier ? COLOR_SLIDE : COLOR_JUMP;
                const storeState = useStore.getState();
                const showTut = !storeState.seenObstacles.includes(obstacleType);
                if (showTut) storeState.markObstacleSeen(obstacleType);
                keptObjects.push({
                    id: uuidv4(),
                    type: obstacleType,
                    position: [spawnX, spawnY, spawnZ],
                    active: true,
                    color: newColor,
                    showTutorial: showTut
                });
                hasChanges = true;
             }
         }
    }
    if (hasChanges) {
        objectsRef.current = keptObjects;
        setRenderTrigger(t => t + 1);
    }
  });

  return (
    <group>
      <ParticleSystem />
      {objectsRef.current.map(obj => {
        if (!obj.active) return null;
        return <GameEntity key={obj.id} data={obj} />;
      })}
    </group>
  );
};

const GameEntity: React.FC<{ data: GameObject }> = React.memo(({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const visualRef = useRef<THREE.Group>(null);
    const arrowRef = useRef<THREE.Group>(null);
    const ciliaRefs = useRef<THREE.Group[]>([]);
    
    const ciliaOffsets = useMemo(() => {
        return [...Array(14)].map(() => ({
            rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
            pos: [ (Math.random()-0.5)*0.8, (Math.random()-0.5)*0.8, (Math.random()-0.5)*0.8 ],
            speed: 5 + Math.random() * 7
        }));
    }, []);

    useFrame((state, delta) => {
        if (groupRef.current) groupRef.current.position.set(data.position[0], 0, data.position[2]);
        if (visualRef.current) {
            const time = state.clock.elapsedTime;
            const baseHeight = data.position[1];

            if (data.type === ObjectType.VACCINE) {
                const spinSpeed = data.isFinalVaccine ? 5.0 : 2.0;
                const bobSpeed = data.isFinalVaccine ? 8 : 4;
                const bobHeight = data.isFinalVaccine ? 0.2 : 0.1;
                visualRef.current.rotation.y += delta * spinSpeed;
                visualRef.current.position.y = baseHeight + Math.sin(time * bobSpeed) * bobHeight;
            } else {
                const pulseSpeed = data.type === ObjectType.OBSTACLE ? 10 : 6;
                const pulse = 1.0 + Math.sin(time * pulseSpeed) * 0.1;
                visualRef.current.scale.set(pulse, pulse, pulse);
                visualRef.current.position.y = baseHeight + Math.sin(time * 4) * 0.08;
                
                if (data.type === ObjectType.OBSTACLE) {
                    visualRef.current.rotation.y += delta * 2.5;
                } else {
                    visualRef.current.rotation.y = Math.sin(time * 0.5) * 0.3;
                    visualRef.current.rotation.x = Math.cos(time * 0.5) * 0.1;
                }

                ciliaRefs.current.forEach((ref, i) => {
                    if (ref) {
                        const offset = ciliaOffsets[i];
                        ref.rotation.x = Math.sin(time * offset.speed) * 0.7;
                        ref.rotation.z = Math.cos(time * offset.speed) * 0.5;
                    }
                });
            }
        }

        if (arrowRef.current) {
            const time = state.clock.elapsedTime;
            arrowRef.current.position.y = 4.5 + Math.sin(time * 4) * 0.4;
            arrowRef.current.rotation.y += delta * 2;
        }
    });

    const vaccineMaterial = useMemo(() => {
        if (data.type !== ObjectType.VACCINE) return null;
        if (data.isFinalVaccine) {
            return {
                glass: new THREE.MeshPhysicalMaterial({
                    color: '#ffd700', metalness: 0.9, roughness: 0.05, transmission: 0.5, transparent: true, thickness: 1.0, emissive: '#ff8800', emissiveIntensity: 6.0, clearcoat: 1.0, clearcoatRoughness: 0.1
                }),
                metal: new THREE.MeshStandardMaterial({ color: '#ffd700', metalness: 1.0, roughness: 0.02, emissive: '#ffcc00', emissiveIntensity: 1.5 }),
                liquid: new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 1.0 }),
                needle: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 3.0, metalness: 0.0, roughness: 0.0 })
            };
        }
        return {
            glass: new THREE.MeshPhysicalMaterial({ color: '#e6ffff', metalness: 0.1, roughness: 0.0, transmission: 0.9, transparent: true, thickness: 0.5, emissive: '#00ffff', emissiveIntensity: 0.8 }),
            metal: new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.1, roughness: 0.1, emissive: '#ffffff', emissiveIntensity: 0.9 }),
            liquid: new THREE.MeshBasicMaterial({ color: '#0088ff', transparent: true, opacity: 0.9 }),
            needle: new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 1.0, metalness: 0.0, roughness: 0.0 })
        };
    }, [data.type, data.isFinalVaccine]);

    return (
        <group ref={groupRef} position={[data.position[0], 0, data.position[2]]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} geometry={data.type === ObjectType.HIGH_BARRIER ? SHADOW_BARRIER_GEO : SHADOW_DEFAULT_GEO}>
                <meshBasicMaterial color="#000000" opacity={0.4} transparent />
            </mesh>

            {data.showTutorial && (
                <group ref={arrowRef} position={[0, 4.5, 0]} rotation={[data.type === ObjectType.OBSTACLE ? 0 : Math.PI, 0, 0]}>
                    <mesh geometry={ARROW_GEO}>
                        <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={2.5} toneMapped={false} />
                    </mesh>
                </group>
            )}

            <group ref={visualRef} position={[0, data.position[1], 0]}>
                
                {/* --- GROUND BACTERIA (NEON GREEN - JUMP OVER) --- */}
                {data.type === ObjectType.OBSTACLE && (
                    <group>
                        <mesh geometry={BACTERIA_CORE_GEO}>
                             <meshStandardMaterial color="#001a00" roughness={0.0} metalness={1.0} emissive={data.color} emissiveIntensity={0.3} />
                        </mesh>
                        <mesh rotation={[Math.PI/2, 0, 0]} position={[0, -0.4, 0]} geometry={BACTERIA_BASE_RING}>
                             <meshBasicMaterial color={data.color} transparent opacity={0.9} />
                        </mesh>
                        {ciliaOffsets.slice(0, 10).map((offset, i) => (
                            <group key={i} ref={el => ciliaRefs.current[i] = el!} rotation={offset.rot as any} position={offset.pos as any}>
                                <mesh geometry={CILIA_GEO} position={[0, 0.4, 0]}>
                                    <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={4.0} toneMapped={false} />
                                </mesh>
                            </group>
                        ))}
                    </group>
                )}

                {/* --- FLOATING BACTERIA (NEON MAGENTA - SLIDE UNDER) --- */}
                {data.type === ObjectType.HIGH_BARRIER && (
                    <group>
                        <mesh geometry={VIRUS_BODY_GEO} rotation={[0, 0, Math.PI / 2]}>
                             <meshStandardMaterial color="#1a001a" roughness={0.0} metalness={1.0} emissive={data.color} emissiveIntensity={0.8} />
                        </mesh>
                        {[...Array(8)].map((_, i) => (
                            <group key={i} ref={el => ciliaRefs.current[i] = el!} position={[(i - 3.5) * 0.35, -0.3, (Math.random()-0.5)*0.3]}>
                                <mesh geometry={TENTACLE_GEO} position={[0, -0.3, 0]} rotation={[Math.sin(i)*0.2, 0, Math.cos(i)*0.1]}>
                                    <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={4.0} toneMapped={false} />
                                </mesh>
                            </group>
                        ))}
                    </group>
                )}

                {/* --- VACCINE --- */}
                {data.type === ObjectType.VACCINE && vaccineMaterial && (
                    <group scale={[1.4, 1.4, 1.4]} rotation={[0, 0, Math.PI / 6]}>
                        <mesh geometry={VACCINE_BODY_GEO} material={vaccineMaterial.glass} />
                        <mesh geometry={VACCINE_LIQUID_GEO} material={vaccineMaterial.liquid} />
                        <mesh position={[0, 0.45, 0]} geometry={VACCINE_CAP_GEO} material={vaccineMaterial.metal} />
                        <mesh position={[0, 0.75, 0]} geometry={VACCINE_NEEDLE_GEO} material={vaccineMaterial.needle} />
                        <mesh position={[0, -0.35, 0]} geometry={VACCINE_PLUNGER_GEO} material={vaccineMaterial.metal} />
                        <mesh position={[0, -0.6, 0]} geometry={VACCINE_ROD_GEO} material={vaccineMaterial.metal} />
                        <mesh position={[0, -0.82, 0]} geometry={VACCINE_HANDLE_GEO} material={vaccineMaterial.metal} />
                    </group>
                )}
            </group>
        </group>
    );
});
