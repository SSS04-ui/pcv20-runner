
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore, MILESTONE_VACCINE_COUNT } from '../../store';
import { LANE_WIDTH, GameStatus } from '../../types';

// Aliases for Three.js intrinsic elements to bypass JSX type check issues
const InstancedMesh = 'instancedMesh' as any;
const BoxGeometry = 'boxGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const PlaneGeometry = 'planeGeometry' as any;
const MeshBasicMaterial = 'meshBasicMaterial' as any;
const Group = 'group' as any;
const Mesh = 'mesh' as any;
const AmbientLight = 'ambientLight' as any;
const DirectionalLight = 'directionalLight' as any;
const PointLight = 'pointLight' as any;
const TorusGeometry = 'torusGeometry' as any;
const Color = 'color' as any;
const Fog = 'fog' as any;

const CITY_BUILDING_COUNT = 120; 

const CityBackground: React.FC = () => {
  const { speed, status } = useStore();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const buildings = useMemo(() => {
    return new Array(CITY_BUILDING_COUNT).fill(0).map(() => {
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = (Math.random() * 140 + 70) * side; 
      const h = 20 + Math.random() * 180;
      const w = 15 + Math.random() * 30;
      const d = 15 + Math.random() * 30;
      
      const colors = ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#0ea5e9', '#64748b'];
      const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);

      return {
        x,
        z: -800 + Math.random() * 1000,
        w,
        h,
        d,
        color,
        speedMult: 0.1 + Math.random() * 0.3
      };
    });
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current || status === GameStatus.PAUSED) return;
    
    const activeSpeed = (status === GameStatus.PLAYING) ? speed : 0;
    
    buildings.forEach((b, i) => {
      b.z += activeSpeed * delta * b.speedMult;
      if (b.z > 250) b.z = -800;
      
      dummy.position.set(b.x, b.h / 2 - 20, b.z);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, b.color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <InstancedMesh ref={meshRef} args={[undefined, undefined, CITY_BUILDING_COUNT]}>
      <BoxGeometry args={[1, 1, 1]} />
      <MeshStandardMaterial roughness={0.5} metalness={0.1} vertexColors />
    </InstancedMesh>
  );
};

const Track: React.FC = () => {
    const { laneCount, speed, status, vaccineCount } = useStore();
    const markersRef = useRef<THREE.Group>(null);
    const offsetRef = useRef(0);
    const isUltimateStage = vaccineCount >= MILESTONE_VACCINE_COUNT;

    const trackWidth = laneCount * LANE_WIDTH;

    const laneTiles = useMemo(() => {
        const tiles = [];
        const startX = -(trackWidth / 2);
        for (let i = 0; i < laneCount; i++) {
            tiles.push({
                x: startX + (i * LANE_WIDTH) + (LANE_WIDTH / 2),
                id: i
            });
        }
        return tiles;
    }, [laneCount, trackWidth]);

    useFrame((state, delta) => {
        if (markersRef.current && status !== GameStatus.PAUSED) {
            const activeSpeed = (status === GameStatus.PLAYING) ? speed : 0;
            offsetRef.current += activeSpeed * delta;
            markersRef.current.position.z = (offsetRef.current % 12);
        }
    });

    return (
        <Group position={[0, 0, 0]}>
            <Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, -50]}>
                <PlaneGeometry args={[trackWidth + 15, 1000]} />
                <MeshStandardMaterial color={isUltimateStage ? "#0c0a2d" : "#cbd5e1"} />
            </Mesh>

            {laneTiles.map((tile) => (
                <Mesh key={tile.id} position={[tile.x, -0.08, -50]} rotation={[-Math.PI / 2, 0, 0]}>
                    <PlaneGeometry args={[LANE_WIDTH - 0.6, 1000]} />
                    <MeshStandardMaterial 
                        color={isUltimateStage ? (tile.id % 2 === 0 ? "#080b14" : "#020617") : (tile.id % 2 === 0 ? "#f8fafc" : "#ffffff")} 
                        roughness={0.2} 
                        metalness={0.1}
                    />
                </Mesh>
            ))}

            {Array.from({ length: laneCount + 1 }).map((_, i) => {
                const x = -(trackWidth / 2) + (i * LANE_WIDTH);
                return (
                    <Mesh key={`sep-${i}`} position={[x, 0.04, -50]} rotation={[-Math.PI / 2, 0, 0]}>
                        <PlaneGeometry args={[0.6, 1000]} />
                        <MeshStandardMaterial 
                            color={isUltimateStage ? "#ef4444" : "#0ea5e9"} 
                            emissive={isUltimateStage ? "#ef4444" : "#0ea5e9"}
                            emissiveIntensity={isUltimateStage ? 4.0 : 0.8}
                            roughness={0.1} 
                        />
                    </Mesh>
                );
            })}

            <Group ref={markersRef}>
                {Array.from({ length: 40 }).map((_, zi) => (
                    <Group key={`row-${zi}`} position={[0, 0.08, -zi * 16]}>
                        {Array.from({ length: laneCount }).map((_, li) => {
                            const x = -(trackWidth / 2) + (li * LANE_WIDTH) + (LANE_WIDTH / 2);
                            return (
                                <Mesh key={`mark-${li}`} position={[x, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                                    <PlaneGeometry args={[0.8, 5.0]} />
                                    <MeshBasicMaterial color={isUltimateStage ? "#f87171" : "#0ea5e9"} transparent opacity={isUltimateStage ? 0.8 : 0.6} />
                                </Mesh>
                            );
                        })}
                    </Group>
                ))}
            </Group>

            <Mesh position={[(trackWidth / 2) + 1.2, 0.5, -50]}>
                <BoxGeometry args={[1.2, 1.0, 1000]} />
                <MeshStandardMaterial color={isUltimateStage ? "#ef4444" : "#475569"} />
            </Mesh>
            <Mesh position={[-(trackWidth / 2) - 1.2, 0.5, -50]}>
                <BoxGeometry args={[1.2, 1.0, 1000]} />
                <MeshStandardMaterial color={isUltimateStage ? "#ef4444" : "#475569"} />
            </Mesh>
        </Group>
    );
};

export const Environment: React.FC = () => {
  const vaccineCount = useStore(state => state.vaccineCount);
  const isUltimateStage = vaccineCount >= MILESTONE_VACCINE_COUNT; 

  let bgColor = '#f1f5f9'; 
  let fogColor = '#f1f5f9';
  let ambientIntensity = 1.6;
  let lightColor = '#ffffff';
  let fogNear = 100;
  let fogFar = 600;
  
  if (isUltimateStage) {
      bgColor = '#020617';
      fogColor = '#2b0707'; 
      ambientIntensity = 1.0;
      lightColor = '#fecaca'; 
      fogNear = 75; // Pushed out from 65 for better visibility at 80% pass rate
      fogFar = 250; // Maintained for smooth falloff
  }

  return (
    <>
      <Color attach="background" args={[bgColor]} />
      <Fog attach="fog" args={[fogColor, fogNear, fogFar]} />
      
      <AmbientLight intensity={ambientIntensity} color={lightColor} />
      <DirectionalLight 
        position={[150, 250, 150]} 
        intensity={isUltimateStage ? 3.5 : 2.5} 
        color={lightColor}
        castShadow
      />
      <PointLight position={[0, 150, -300]} intensity={isUltimateStage ? 8.0 : 2.0} color={isUltimateStage ? "#ff3333" : "#0ea5e9"} />
      
      <CityBackground />
      <Track />
      
      <Group position={[0, 0, -600]}>
          <Mesh rotation={[Math.PI / 2, 0, 0]}>
              <TorusGeometry args={[300, 2.0, 16, 100]} />
              <MeshBasicMaterial color={isUltimateStage ? "#ef4444" : "#0ea5e9"} transparent opacity={isUltimateStage ? 0.7 : 0.25} />
          </Mesh>
      </Group>
    </>
  );
};
