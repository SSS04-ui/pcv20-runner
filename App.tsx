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
    const isTablet = aspect >= 1.0 && aspect < 1.4;

    // Responsive framing: taller screens need a higher perspective to keep player in view
    const extraLanes = Math.max(0, laneCount - 3);
    
    // Adjusted camera height and distance for better framing on all devices
    // Significantly increased pull-back (targetZ) and height (targetY) for mobile
    let targetY = isMobile ? 38.0 : (isTablet ? 26.0 : 18.0);
    let targetZ = isMobile ? 52.0 : (isTablet ? 38.0 : 28.0);

    // Extreme dynamic adjustment for ultra-tall phone screens (e.g. 21:9)
    if (isMobile && aspect < 0.5) {
      targetY += 20.0;
      targetZ += 25.0;
    }

    targetY += extraLanes * (isMobile ? 5.5 : 2.5);
    targetZ += extraLanes * (isMobile ? 11.0 : 4.0);

    const targetPos = new THREE.Vector3(0, targetY, targetZ);
    
    // Smoothly interpolate camera position
    camera.position.lerp(targetPos, delta * 3.5);
    
    // Aim lower on mobile to shift the horizon down and push the player higher on screen
    // This ensures they are not cut off by the bottom edge or obscured by UI
    const lookAtY = isMobile ? -24.0 : -12.0;
    camera.lookAt(0, lookAtY, -35); 
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