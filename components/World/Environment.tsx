
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
const NORMAL_SPEED_LINE_COUNT = 40;
const ULTIMATE_SPEED_LINE_COUNT = 100;

const SpeedLines: React.FC = () => {
  const { speed, status, vaccineCount } = useStore();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const isUltimate = vaccineCount >= MILESTONE_VACCINE_COUNT;
  const count = isUltimate ? ULTIMATE_SPEED_LINE_COUNT : NORMAL_SPEED_LINE_COUNT;

  const lines = useMemo(() => {
    return new Array(ULTIMATE_SPEED_LINE_COUNT).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 80,
      y: Math.random() * 30 + 2,
      z: Math.random() * -600,
      len: 15 + Math.random() * 30
    }));
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current || status === GameStatus.PAUSED) return;
    
    for (let i = 0; i < count; i++) {
      const l = lines[i];
      l.z += (isUltimate ? speed * 3 : speed * 1.5) * delta;
      if (l.z > 50) l.z = -600;
      
      dummy.position.set(l.x, l.y, l.z);
      dummy.scale.set(0.08, 0.08, l.len);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <InstancedMesh ref={meshRef} args={[undefined, undefined, ULTIMATE_SPEED_LINE_COUNT]}>
      <BoxGeometry args={[1, 1, 1]} />
      <MeshBasicMaterial color="#ffffff" transparent opacity={isUltimate ? 0.6 : 0.3} />
    </InstancedMesh>
  );
};

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
    const { laneCount, vaccineCount } = useStore();
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

    return (
        <Group position={[0, 0, 0]}>
            <Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, -50]}>
                <PlaneGeometry args={[trackWidth + 15, 1000]} />
                <MeshStandardMaterial color={isUltimateStage ? "#060814" : "#cbd5e1"} />
            </Mesh>

            {laneTiles.map((tile) => (
                <Mesh key={tile.id} position={[tile.x, -0.08, -50]} rotation={[-Math.PI / 2, 0, 0]}>
                    <PlaneGeometry args={[LANE_WIDTH - 0.6, 1000]} />
                    <MeshStandardMaterial 
                        color={isUltimateStage ? (tile.id % 2 === 0 ? "#02040a" : "#000000") : (tile.id % 2 === 0 ? "#f8fafc" : "#ffffff")} 
                        roughness={0.1} 
                        metalness={0.2}
                    />
                </Mesh>
            ))}

            {Array.from({ length: laneCount + 1 }).map((_, i) => {
                const x = -(trackWidth / 2) + (i * LANE_WIDTH);
                return (
                    <Mesh key={`sep-${i}`} position={[x, 0.04, -50]} rotation={[-Math.PI / 2, 0, 0]}>
                        <PlaneGeometry args={[0.6, 1000]} />
                        <MeshStandardMaterial 
                            color={isUltimateStage ? "#ff1111" : "#0ea5e9"} 
                            emissive={isUltimateStage ? "#ff1111" : "#0ea5e9"}
                            emissiveIntensity={isUltimateStage ? 10.0 : 0.8}
                            roughness={0.1} 
                        />
                    </Mesh>
                );
            })}

            <Mesh position={[(trackWidth / 2) + 1.2, 0.5, -50]}>
                <BoxGeometry args={[1.2, 1.0, 1000]} />
                <MeshStandardMaterial color={isUltimateStage ? "#440000" : "#475569"} />
            </Mesh>
            <Mesh position={[-(trackWidth / 2) - 1.2, 0.5, -50]}>
                <BoxGeometry args={[1.2, 1.0, 1000]} />
                <MeshStandardMaterial color={isUltimateStage ? "#440000" : "#475569"} />
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
      bgColor = '#000005';
      fogColor = '#100000'; 
      ambientIntensity = 0.8;
      lightColor = '#ffcccc'; 
      fogNear = 50; 
      fogFar = 200; 
  }

  return (
    <>
      <Color attach="background" args={[bgColor]} />
      <Fog attach="fog" args={[fogColor, fogNear, fogFar]} />
      
      <AmbientLight intensity={ambientIntensity} color={lightColor} />
      <DirectionalLight 
        position={[150, 250, 150]} 
        intensity={isUltimateStage ? 4.0 : 2.5} 
        color={lightColor}
        castShadow
      />
      <PointLight position={[0, 150, -300]} intensity={isUltimateStage ? 12.0 : 2.0} color={isUltimateStage ? "#ff0000" : "#0ea5e9"} />
      
      <CityBackground />
      <Track />
      <SpeedLines />
      
      <Group position={[0, 0, -600]}>
          <Mesh rotation={[Math.PI / 2, 0, 0]}>
              <TorusGeometry args={[300, 2.0, 16, 100]} />
              <MeshBasicMaterial color={isUltimateStage ? "#ff0000" : "#0ea5e9"} transparent opacity={isUltimateStage ? 0.9 : 0.25} />
          </Mesh>
      </Group>
    </>
  );
};
