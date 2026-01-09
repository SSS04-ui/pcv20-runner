
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

// Dynamic Camera Controller
const CameraController = () => {
  const { camera, size } = useThree();
  const { laneCount } = useStore();
  
  useFrame((state, delta) => {
    const aspect = size.width / size.height;
    const isMobile = aspect < 1.0; 

    // Mobile Optimization: Pull back significantly more and tilt higher
    const extraLanes = Math.max(0, laneCount - 3);
    
    // Base height and distance
    let targetY = isMobile ? 12.0 : 6.0;
    let targetZ = isMobile ? 16.0 : 9.0;

    // Adjust for more lanes if needed
    targetY += extraLanes * (isMobile ? 3.0 : 0.5);
    targetZ += extraLanes * (isMobile ? 6.0 : 1.0);

    const targetPos = new THREE.Vector3(0, targetY, targetZ);
    
    // Smoothly interpolate camera position
    camera.position.lerp(targetPos, delta * 3.0);
    
    // Look ahead to center the action. On mobile, we look lower to push the player higher in the screen
    const lookAtY = isMobile ? -2.0 : 0;
    camera.lookAt(0, lookAtY, -30); 
  });
  
  return null;
};

const Scene = () => {
  return (
    <group>
        <Environment />
        <group name="PlayerGroup">
             <Player />
        </group>
        <LevelManager />
        <Effects />
    </group>
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
