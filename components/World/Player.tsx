
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH, GameStatus, SLIDE_DURATION } from '../../types';
import { audio } from '../System/Audio';

const GRAVITY = 55;
const JUMP_FORCE = 18;
const FAST_FALL_FORCE = -40;

const SHADOW_GEO = new THREE.CircleGeometry(0.8, 32);

// --- Simplified 3D Geometry Components ---
const BODY_GEO = new THREE.CapsuleGeometry(0.35, 0.6, 4, 8);
const HEAD_GEO = new THREE.BoxGeometry(0.45, 0.45, 0.4);
const LIMB_GEO = new THREE.CapsuleGeometry(0.1, 0.4, 4, 6);
const BACKPACK_GEO = new THREE.BoxGeometry(0.5, 0.6, 0.25);
const CAP_BASE_GEO = new THREE.BoxGeometry(0.48, 0.15, 0.48);
const CAP_BRIM_GEO = new THREE.BoxGeometry(0.4, 0.05, 0.3);

export const Player: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const { status, takeDamage, hasDoubleJump, activateImmortality, isImmortalityActive, laneCount, togglePause, speed } = useStore();

  const isJumping = useRef(false);
  const isSliding = useRef(false);
  const slideTimer = useRef(0);
  const velocityY = useRef(0);
  const jumpsPerformed = useRef(0);

  const currentLane = useRef(1);
  const targetX = useRef(0);
  const currentX = useRef(0);

  const isInvincible = useRef(false);
  const lastDamageTime = useRef(0);

  // Touch state
  const touchStart = useRef({ x: 0, y: 0 });

  // Materials
  const materials = useMemo(() => ({
    body: new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.5 }), // Slate Technical Parka
    skin: new THREE.MeshStandardMaterial({ color: '#ffdbac', roughness: 0.8 }),
    accent: new THREE.MeshStandardMaterial({ color: '#0ea5e9', roughness: 0.3, metalness: 0.2 }), // Cyan Accents
    core: new THREE.MeshStandardMaterial({ color: '#0ea5e9', emissive: '#0ea5e9', emissiveIntensity: 2 }),
    black: new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.2 }),
    shadow: new THREE.MeshBasicMaterial({ color: '#000000', opacity: 0.15, transparent: true })
  }), []);

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      isJumping.current = false;
      isSliding.current = false;
      slideTimer.current = 0;
      jumpsPerformed.current = 0;
      velocityY.current = 0;
      currentLane.current = 1;
      targetX.current = 0;
      currentX.current = 0;
      if (groupRef.current) groupRef.current.position.set(0, 0, 0);
    }
  }, [status]);

  const triggerJump = () => {
    if (status !== GameStatus.PLAYING) return;
    const maxJumps = hasDoubleJump ? 2 : 1;
    
    if (isSliding.current) {
      isSliding.current = false;
      slideTimer.current = 0;
    }

    if (!isJumping.current) {
      audio.init(); 
      audio.playJump(false);
      isJumping.current = true; 
      jumpsPerformed.current = 1; 
      velocityY.current = JUMP_FORCE;
    } else if (jumpsPerformed.current < maxJumps) {
      audio.playJump(true); 
      jumpsPerformed.current += 1; 
      velocityY.current = JUMP_FORCE;
    }
  };

  const triggerSlide = () => {
    if (status !== GameStatus.PLAYING) return;
    
    if (isJumping.current && velocityY.current > FAST_FALL_FORCE) {
      velocityY.current = FAST_FALL_FORCE;
    }

    if (!isSliding.current) { 
      audio.init(); 
      audio.playSlide(); 
    }
    
    isSliding.current = true; 
    slideTimer.current = SLIDE_DURATION;
  };

  const moveLane = (dir: number) => {
    if (status !== GameStatus.PLAYING) return;
    const nextLane = THREE.MathUtils.clamp(currentLane.current + dir, 0, laneCount - 1);
    if (nextLane !== currentLane.current) {
      currentLane.current = nextLane;
      targetX.current = (nextLane - Math.floor(laneCount / 2)) * LANE_WIDTH;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) { if (e.key === 'p') togglePause(); return; }
      switch (e.key) {
        case 'ArrowUp': case 'w': case ' ': triggerJump(); break;
        case 'ArrowDown': case 's': triggerSlide(); break;
        case 'ArrowLeft': case 'a': moveLane(-1); break;
        case 'ArrowRight': case 'd': moveLane(1); break;
        case 'Enter': activateImmortality(); break;
        case 'Escape': case 'p': togglePause(); break;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (status !== GameStatus.PLAYING) return;
      
      const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
      const deltaX = touchEnd.x - touchStart.current.x;
      const deltaY = touchEnd.y - touchStart.current.y;
      const swipeThreshold = 30;

      // Determine axis
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > swipeThreshold) {
          if (deltaX > 0) moveLane(1);
          else moveLane(-1);
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > swipeThreshold) {
          if (deltaY < 0) triggerJump(); // Swipe up
          else triggerSlide(); // Swipe down
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [status, hasDoubleJump, activateImmortality, laneCount]);

  useFrame((state, delta) => {
    if (!groupRef.current || !modelRef.current) return;
    if (status === GameStatus.PAUSED || status !== GameStatus.PLAYING) return;

    groupRef.current.userData.isSliding = isSliding.current;

    currentX.current = THREE.MathUtils.lerp(currentX.current, targetX.current, delta * 20);
    groupRef.current.position.x = currentX.current;

    const time = state.clock.elapsedTime;
    const runCycle = time * speed * 0.5;
    const bob = isJumping.current || isSliding.current ? 0 : Math.abs(Math.sin(runCycle)) * 0.15;

    const swingAmount = 0.5;
    if (!isJumping.current && !isSliding.current) {
        if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(runCycle) * swingAmount;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.sin(runCycle) * swingAmount;
        if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.sin(runCycle) * swingAmount;
        if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(runCycle) * swingAmount;
    } else {
        [leftArmRef, rightArmRef, leftLegRef, rightLegRef].forEach(ref => {
          if (ref.current) ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, 0, delta * 10);
        });
    }

    if (isJumping.current) {
      groupRef.current.position.y += velocityY.current * delta;
      velocityY.current -= GRAVITY * delta;
      
      if (groupRef.current.position.y <= 0) {
        groupRef.current.position.y = 0;
        isJumping.current = false; 
        jumpsPerformed.current = 0; 
        velocityY.current = 0;
        modelRef.current.scale.set(1.4, 0.6, 1.4); 
      }
    }

    if (isSliding.current) {
      slideTimer.current -= delta;
      modelRef.current.scale.y = THREE.MathUtils.lerp(modelRef.current.scale.y, 0.45, delta * 20);
      modelRef.current.scale.x = modelRef.current.scale.z = THREE.MathUtils.lerp(modelRef.current.scale.x, 1.5, delta * 20);
      modelRef.current.position.y = THREE.MathUtils.lerp(modelRef.current.position.y, 0.4, delta * 20);
      
      if (slideTimer.current <= 0) {
        isSliding.current = false;
      }
    } else if (isJumping.current) {
      const targetStretchY = velocityY.current > 0 ? 1.3 : 0.9;
      const targetStretchXZ = velocityY.current > 0 ? 0.8 : 1.1;
      modelRef.current.scale.y = THREE.MathUtils.lerp(modelRef.current.scale.y, targetStretchY, delta * 15);
      modelRef.current.scale.x = modelRef.current.scale.z = THREE.MathUtils.lerp(modelRef.current.scale.x, targetStretchXZ, delta * 15);
      modelRef.current.position.y = 1.0;
    } else {
      modelRef.current.scale.y = THREE.MathUtils.lerp(modelRef.current.scale.y, 1.0, delta * 15);
      modelRef.current.scale.x = modelRef.current.scale.z = THREE.MathUtils.lerp(modelRef.current.scale.x, 1.0, delta * 15);
      modelRef.current.position.y = 1.0 + bob;
    }

    const targetTilt = (currentX.current - targetX.current) * 0.15;
    modelRef.current.rotation.z = THREE.MathUtils.lerp(modelRef.current.rotation.z, -targetTilt, delta * 10);
    modelRef.current.rotation.x = THREE.MathUtils.lerp(modelRef.current.rotation.x, speed * 0.005, delta * 5);

    if (coreRef.current) {
        coreRef.current.scale.setScalar(1 + Math.sin(time * 10) * 0.1);
        (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 2 + Math.sin(time * 10);
    }

    if (shadowRef.current) {
      const height = groupRef.current.position.y;
      shadowRef.current.scale.setScalar(Math.max(0.2, 1.2 - height * 0.3));
      (shadowRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0.01, 0.15 - height * 0.05);
    }

    if (isInvincible.current) {
        modelRef.current.visible = Math.floor(Date.now() / 40) % 2 === 0;
        if (Date.now() - lastDamageTime.current > 1500) isInvincible.current = false;
    } else {
        modelRef.current.visible = true;
    }

    if (isImmortalityActive) {
        const glowColor = Math.sin(time * 30) > 0 ? '#ffffff' : '#0ea5e9';
        modelRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
              child.material.emissive?.set(new THREE.Color(glowColor));
              child.material.emissiveIntensity = 0.5;
            }
        });
    }
  });

  useEffect(() => {
    const checkHit = () => {
      if (isInvincible.current || isImmortalityActive) return;
      audio.playDamage(); 
      takeDamage();
      isInvincible.current = true; 
      lastDamageTime.current = Date.now();
    };
    window.addEventListener('player-hit', checkHit);
    return () => window.removeEventListener('player-hit', checkHit);
  }, [takeDamage, isImmortalityActive]);

  return (
    <group ref={groupRef}>
      <group ref={modelRef} position={[0, 1, 0]}>
        <mesh geometry={BODY_GEO} material={materials.body} position={[0, 0.1, 0]} castShadow />
        <group position={[0, 0.75, 0]}>
            <mesh geometry={HEAD_GEO} material={materials.skin} />
            <group position={[0, 0.2, 0]}>
                <mesh geometry={CAP_BASE_GEO} material={materials.accent} />
                <mesh geometry={CAP_BRIM_GEO} material={materials.accent} position={[0, 0, 0.25]} />
            </group>
        </group>
        <group position={[0, 0.1, -0.3]}>
            <mesh geometry={BACKPACK_GEO} material={materials.black} />
            <mesh ref={coreRef} geometry={new THREE.SphereGeometry(0.1, 8, 8)} material={materials.core} position={[0, 0, -0.05]} />
        </group>
        <group ref={leftArmRef} position={[-0.45, 0.35, 0]}>
            <mesh geometry={LIMB_GEO} material={materials.body} position={[0, -0.2, 0]} />
        </group>
        <group ref={rightArmRef} position={[0.45, 0.35, 0]}>
            <mesh geometry={LIMB_GEO} material={materials.body} position={[0, -0.2, 0]} />
        </group>
        <group ref={leftLegRef} position={[-0.2, -0.3, 0]}>
            <mesh geometry={LIMB_GEO} material={materials.black} position={[0, -0.2, 0]} />
        </group>
        <group ref={rightLegRef} position={[0.2, -0.3, 0]}>
            <mesh geometry={LIMB_GEO} material={materials.black} position={[0, -0.2, 0]} />
        </group>
      </group>
      <mesh ref={shadowRef} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={SHADOW_GEO} material={materials.shadow} />
    </group>
  );
};
