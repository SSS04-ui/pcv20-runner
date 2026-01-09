
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment } from './components/World/Environment';
import { Player } from './components/World/Player';
import { LevelManager } from './components/World/LevelManager';
import { Effects } from './components/World/Effects';
import { HUD } from './components/UI/HUD';
import { useStore } from './store';

// Fix for missing Three.js JSX types in this environment
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any; mesh: any; points: any; bufferGeometry: any; bufferAttribute: any; pointsMaterial: any;
      planeGeometry: any; meshBasicMaterial: any; shaderMaterial: any; color: any; fog: any;
      ambientLight: any; directionalLight: any; pointLight: any; instancedMesh: any; boxGeometry: any;
      meshStandardMaterial: any; cylinderGeometry: any; torusGeometry: any; icosahedronGeometry: any;
      circleGeometry: any; sphereGeometry: any; capsuleGeometry: any;
    }
  }
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        group: any; mesh: any; points: any; bufferGeometry: any; bufferAttribute: any; pointsMaterial: any;
        planeGeometry: any; meshBasicMaterial: any; shaderMaterial: any; color: any; fog: any;
        ambientLight: any; directionalLight: any; pointLight: any; instancedMesh: any; boxGeometry: any;
        meshStandardMaterial: any; cylinderGeometry: any; torusGeometry: any; icosahedronGeometry: any;
        circleGeometry: any; sphereGeometry: any; capsuleGeometry: any;
      }
    }
  }
}

// Dynamic Camera Controller
const CameraController = () => {
  const { camera, size } = useThree();
  const { laneCount } = useStore();
  
  useFrame((state, delta) => {
    const aspect = size.width / size.height;
    const isMobile = aspect < 0.8; // More aggressive mobile check for portrait

    // Adjusted factors for mobile visibility
    const heightFactor = isMobile ? 3.0 : 0.5;
    const distFactor = isMobile ? 6.0 : 1.0;
    const verticalOffset = isMobile ? 2.5 : 0;

    const extraLanes = Math.max(0, laneCount - 3);

    const targetY = (isMobile ? 8.5 : 5.5) + (extraLanes * heightFactor) + verticalOffset;
    const targetZ = (isMobile ? 12.0 : 8.0) + (extraLanes * distFactor);

    const targetPos = new THREE.Vector3(0, targetY, targetZ);
    
    // Smoothly interpolate camera position
    camera.position.lerp(targetPos, delta * 3.0);
    // Look further ahead to keep player in the bottom-middle of the screen on mobile
    camera.lookAt(0, isMobile ? 1.0 : 0, -30); 
  });
  
  return null;
};

function Scene() {
  return (
    <>
        <Environment />
        <group>
            <group userData={{ isPlayer: true }} name="PlayerGroup">
                 <Player />
            </group>
            <LevelManager />
        </group>
        <Effects />
    </>
  );
}

function App() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <HUD />
      <Canvas
        shadows
        dpr={[1, 1.5]} 
        gl={{ antialias: false, stencil: false, depth: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 6, 12], fov: 60 }}
      >
        <CameraController />
        <Suspense fallback={null}>
            <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
