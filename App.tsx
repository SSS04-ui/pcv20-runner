
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
import { HUD } from './components/UI/HUD';
import { useStore } from './store';

// Aliases for Three.js intrinsic elements to bypass JSX type check issues
const Group = 'group' as any;

// Dynamic Camera Controller
const CameraController = () => {
  const { camera, size } = useThree();
  const { laneCount } = useStore();
  
  useFrame((state, delta) => {
    const aspect = size.width / size.height;
    const isMobile = aspect < 1.0; 
    const isTablet = aspect >= 1.0 && aspect < 1.4;

    // Responsive framing adjustments
    const extraLanes = Math.max(0, laneCount - 3);
    
    // Position parameters: y (height), z (distance)
    let targetY = 16.0;
    let targetZ = 22.0;
    let lookAtY = -10.0;

    if (isMobile) {
      // Pull back more on phones to see the player and obstacles under the top HUD
      targetY = aspect < 0.5 ? 36.0 : 28.0; 
      targetZ = aspect < 0.5 ? 54.0 : 42.0;
      lookAtY = -28.0; // Aim much lower to lift the player up in the screen frame
    } else if (isTablet) {
      targetY = 22.0;
      targetZ = 32.0;
      lookAtY = -15.0;
    }

    targetY += extraLanes * (isMobile ? 3.0 : 1.5);
    targetZ += extraLanes * (isMobile ? 6.0 : 2.5);

    const targetPos = new THREE.Vector3(0, targetY, targetZ);
    
    // Smoothly interpolate camera position
    camera.position.lerp(targetPos, delta * 3.5);
    
    // Smoothly aim camera
    const currentLookAt = new THREE.Vector3(0, lookAtY, -35);
    camera.lookAt(currentLookAt); 
    
    if (camera instanceof THREE.PerspectiveCamera) {
        // Adjust FOV slightly based on orientation to reduce edge stretching on wide devices
        const targetFov = isMobile ? 60 : 64;
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, delta * 2);
        camera.updateProjectionMatrix();
    }
  });
  
  return null;
};

const Scene = () => {
  return (
    <Group>
        <Environment />
        <Group name="PlayerGroup">
             <Player />
        </Group>
        <LevelManager />
    </Group>
  );
};

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <HUD />
      <Canvas
        shadows
        dpr={[1, 1.5]} 
        gl={{ antialias: false, stencil: false, depth: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 10, 20], fov: 65 }}
      >
        <CameraController />
        <Suspense fallback={null}>
            <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default App;
