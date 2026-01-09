
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH, GameStatus } from '../../types';

const CITY_BUILDING_COUNT = 40;

const CityBackground: React.FC = () => {
  const { speed, status } = useStore();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const buildings = useMemo(() => {
    return new Array(CITY_BUILDING_COUNT).fill(0).map(() => ({
      x: (Math.random() * 150 + 90) * (Math.random() > 0.5 ? 1 : -1),
      z: -500 + Math.random() * 600,
      w: 12 + Math.random() * 25,
      h: 60 + Math.random() * 180,
      d: 12 + Math.random() * 25,
      color: new THREE.Color('#ffffff'), 
      speedMult: 0.12 + Math.random() * 0.2
    }));
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current || status === GameStatus.PAUSED) return;
    
    const activeSpeed = (status === GameStatus.PLAYING) ? speed : 0;
    
    buildings.forEach((b, i) => {
      b.z += activeSpeed * delta * b.speedMult;
      if (b.z > 200) b.z = -500;
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
    <instancedMesh ref={meshRef} args={[undefined, undefined, CITY_BUILDING_COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.3} metalness={0.1} vertexColors />
    </instancedMesh>
  );
};

const Track: React.FC = () => {
    const { laneCount, speed, status, vaccineCount } = useStore();
    const markersRef = useRef<THREE.Group>(null);
    const offsetRef = useRef(0);
    const isUltimateStage = vaccineCount >= 15;

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
        <group position={[0, 0, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -50]}>
                <planeGeometry args={[trackWidth + 4, 600]} />
                <meshStandardMaterial color={isUltimateStage ? "#1e1b4b" : "#e2e8f0"} />
            </mesh>

            {laneTiles.map((tile) => (
                <mesh key={tile.id} position={[tile.x, -0.05, -50]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[LANE_WIDTH - 0.2, 600]} />
                    <meshStandardMaterial 
                        color={isUltimateStage ? (tile.id % 2 === 0 ? "#111827" : "#0f172a") : (tile.id % 2 === 0 ? "#ffffff" : "#f8fafc")} 
                        roughness={0.6} 
                    />
                </mesh>
            ))}

            {Array.from({ length: laneCount + 1 }).map((_, i) => {
                const x = -(trackWidth / 2) + (i * LANE_WIDTH);
                return (
                    <mesh key={`sep-${i}`} position={[x, 0.01, -50]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[0.2, 600]} />
                        <meshStandardMaterial color={isUltimateStage ? "#ef4444" : "#64748b"} roughness={0.1} />
                    </mesh>
                );
            })}

            <group ref={markersRef}>
                {Array.from({ length: 30 }).map((_, zi) => (
                    <group key={`row-${zi}`} position={[0, 0.02, -zi * 12]}>
                        {Array.from({ length: laneCount }).map((_, li) => {
                            const x = -(trackWidth / 2) + (li * LANE_WIDTH) + (LANE_WIDTH / 2);
                            return (
                                <mesh key={`mark-${li}`} position={[x, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                                    <planeGeometry args={[0.3, 2.5]} />
                                    <meshBasicMaterial color={isUltimateStage ? "#fca5a5" : "#0ea5e9"} transparent opacity={isUltimateStage ? 0.4 : 0.25} />
                                </mesh>
                            );
                        })}
                    </group>
                ))}
            </group>

            <mesh position={[(trackWidth / 2) + 0.5, 0.15, -50]}>
                <boxGeometry args={[0.4, 0.4, 600]} />
                <meshStandardMaterial color={isUltimateStage ? "#450a0a" : "#475569"} />
            </mesh>
            <mesh position={[-(trackWidth / 2) - 0.5, 0.15, -50]}>
                <boxGeometry args={[0.4, 0.4, 600]} />
                <meshStandardMaterial color={isUltimateStage ? "#450a0a" : "#475569"} />
            </mesh>
        </group>
    );
};

export const Environment: React.FC = () => {
  const vaccineCount = useStore(state => state.vaccineCount);
  const isUltimateStage = vaccineCount >= 15; // Trigger dramatic change at 15

  // Default Clinical Blue
  let bgColor = '#bae6fd'; 
  let fogColor = '#bae6fd';
  let ambientIntensity = 1.4;
  let lightColor = '#ffffff';
  
  // Phase 2: Red Alert Surge
  if (isUltimateStage) {
      bgColor = '#0f172a';
      fogColor = '#450a0a'; // Deep emergency red glow
      ambientIntensity = 0.8;
      lightColor = '#fecaca'; // Reddish directional light
  }

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[fogColor, isUltimateStage ? 20 : 60, isUltimateStage ? 200 : 400]} />
      
      <ambientLight intensity={ambientIntensity} color={lightColor} />
      <directionalLight 
        position={[100, 200, 100]} 
        intensity={isUltimateStage ? 3.0 : 2.0} 
        color={lightColor}
        castShadow
      />
      <pointLight position={[0, 100, -150]} intensity={isUltimateStage ? 4.0 : 1.5} color={isUltimateStage ? "#ff0000" : "#ffffff"} />
      
      <CityBackground />
      <Track />
      
      <group position={[0, 0, -450]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[150, 0.5, 16, 100]} />
              <meshBasicMaterial color={isUltimateStage ? "#ef4444" : "#0ea5e9"} transparent opacity={isUltimateStage ? 0.2 : 0.05} />
          </mesh>
      </group>
    </>
  );
};
