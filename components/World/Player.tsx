/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH, GameStatus, SLIDE_DURATION } from '../../types';
import { audio } from '../System/Audio';

const GRAVITY = 50;
const JUMP_FORCE = 16; 

const TORSO_GEO = new THREE.CylinderGeometry(0.25, 0.15, 0.6, 4);
const JETPACK_GEO = new THREE.BoxGeometry(0.3, 0.4, 0.15);
const GLOW_STRIP_GEO = new THREE.PlaneGeometry(0.05, 0.2);
const HEAD_GEO = new THREE.BoxGeometry(0.25, 0.3, 0.3);
const ARM_GEO = new THREE.BoxGeometry(0.12, 0.6, 0.12);
const JOINT_SPHERE_GEO = new THREE.SphereGeometry(0.07);
const HIPS_GEO = new THREE.CylinderGeometry(0.16, 0.16, 0.2);
const LEG_GEO = new THREE.BoxGeometry(0.15, 0.7, 0.15);
const SHADOW_GEO = new THREE.CircleGeometry(0.5, 32);

export const Player: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const { status, takeDamage, hasDoubleJump, activateImmortality, isImmortalityActive, laneCount } = useStore();
  
  const isJumping = useRef(false);
  const isSliding = useRef(false);
  const slideTimer = useRef(0);
  
  const velocityY = useRef(0);
  const jumpsPerformed = useRef(0); 
  const spinRotation = useRef(0); 

  // Lane logic
  const currentLane = useRef(1); // 0, 1, 2 for 3 lanes
  const targetX = useRef(0);

  // Touch State
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const SWIPE_THRESHOLD = 30;

  const isInvincible = useRef(false);
  const lastDamageTime = useRef(0);

  const { armorMaterial, jointMaterial, glowMaterial, shadowMaterial } = useMemo(() => {
      const isGold = isImmortalityActive;
      return {
          armorMaterial: new THREE.MeshStandardMaterial({ 
              color: isGold ? '#ffff00' : '#00ffff', roughness: 0.2, metalness: 0.6, emissive: isGold ? '#aa8800' : '#0066cc', emissiveIntensity: 0.6
          }),
          jointMaterial: new THREE.MeshStandardMaterial({ color: '#333333', roughness: 0.7, metalness: 0.5 }),
          glowMaterial: new THREE.MeshBasicMaterial({ color: isGold ? '#ffffff' : '#ccffff' }),
          shadowMaterial: new THREE.MeshBasicMaterial({ color: '#000000', opacity: 0.3, transparent: true })
      };
  }, [isImmortalityActive]); 

  useEffect(() => {
      if (status === GameStatus.PLAYING) {
          isJumping.current = false;
          isSliding.current = false;
          slideTimer.current = 0;
          jumpsPerformed.current = 0;
          velocityY.current = 0;
          spinRotation.current = 0;
          currentLane.current = 1;
          targetX.current = 0;
          
          if (groupRef.current) {
              groupRef.current.position.y = 0;
              groupRef.current.position.x = 0;
              groupRef.current.userData.isSliding = false;
          }
          if (bodyRef.current) bodyRef.current.rotation.x = 0;
      }
  }, [status]);
  
  const triggerJump = () => {
    if (isSliding.current) { isSliding.current = false; slideTimer.current = 0; }
    const maxJumps = hasDoubleJump ? 2 : 1;
    if (!isJumping.current) {
        audio.init(); audio.playJump(false);
        isJumping.current = true; jumpsPerformed.current = 1; velocityY.current = JUMP_FORCE;
    } else if (jumpsPerformed.current < maxJumps) {
        audio.playJump(true); jumpsPerformed.current += 1; velocityY.current = JUMP_FORCE; spinRotation.current = 0; 
    }
  };

  const triggerSlide = () => {
      if (isJumping.current) return;
      if (!isSliding.current) { audio.init(); audio.playSlide(); }
      isSliding.current = true; slideTimer.current = SLIDE_DURATION;
  };

  const moveLane = (dir: number) => {
    const nextLane = THREE.MathUtils.clamp(currentLane.current + dir, 0, laneCount - 1);
    if (nextLane !== currentLane.current) {
        currentLane.current = nextLane;
        targetX.current = (nextLane - Math.floor(laneCount / 2)) * LANE_WIDTH;
        // Optional: play side move sound
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;
      switch(e.key) {
          case 'ArrowUp': case 'w': case ' ': triggerJump(); break;
          case 'ArrowDown': case 's': triggerSlide(); break;
          case 'ArrowLeft': case 'a': moveLane(-1); break;
          case 'ArrowRight': case 'd': moveLane(1); break;
          case 'Enter': activateImmortality(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, hasDoubleJump, activateImmortality, laneCount]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
        if (status !== GameStatus.PLAYING) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        const deltaY = e.changedTouches[0].clientY - touchStartY.current;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (Math.max(absX, absY) > SWIPE_THRESHOLD) {
            if (absX > absY) { // Horizontal
                if (deltaX > 0) moveLane(1);
                else moveLane(-1);
            } else { // Vertical
                if (deltaY < 0) triggerJump();
                else triggerSlide();
            }
        } else { triggerJump(); }
    };
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [status, hasDoubleJump, activateImmortality, laneCount]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    if (status !== GameStatus.PLAYING) return;

    groupRef.current.userData.isSliding = isSliding.current;

    // Lane Lerp
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX.current, delta * 15);

    if (isSliding.current) {
        slideTimer.current -= delta;
        if (slideTimer.current <= 0) isSliding.current = false;
    }

    if (isJumping.current) {
        groupRef.current.position.y += velocityY.current * delta;
        velocityY.current -= GRAVITY * delta;
        if (groupRef.current.position.y <= 0) {
            groupRef.current.position.y = 0;
            isJumping.current = false; jumpsPerformed.current = 0; velocityY.current = 0;
            if (bodyRef.current) bodyRef.current.rotation.x = 0;
        }
        if (jumpsPerformed.current === 2 && bodyRef.current) {
             spinRotation.current -= delta * 15;
             if (spinRotation.current < -Math.PI * 2) spinRotation.current = -Math.PI * 2;
             bodyRef.current.rotation.x = spinRotation.current;
        }
    }

    if (isSliding.current) {
        if (bodyRef.current) {
            bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, -Math.PI / 2.5, delta * 20);
            bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 0.4, delta * 20);
        }
    } else {
        if (!isJumping.current) {
            groupRef.current.rotation.x = 0.05; 
            if (bodyRef.current) bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, delta * 20);
        } else if (bodyRef.current && jumpsPerformed.current !== 2) {
             bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, 0, delta * 20);
        }
    }

    const time = state.clock.elapsedTime * 25; 
    if (isSliding.current) {
        if (leftArmRef.current) leftArmRef.current.rotation.x = Math.PI;
        if (rightArmRef.current) rightArmRef.current.rotation.x = Math.PI;
        if (leftLegRef.current) leftLegRef.current.rotation.x = 0.2;
        if (rightLegRef.current) rightLegRef.current.rotation.x = 0.2;
    } else if (!isJumping.current) {
        if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(time) * 0.7;
        if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time + Math.PI) * 0.7;
        if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time + Math.PI) * 1.0;
        if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time) * 1.0;
        if (bodyRef.current) bodyRef.current.position.y = 1.1 + Math.abs(Math.sin(time)) * 0.1;
    }

    if (shadowRef.current) {
        const height = groupRef.current.position.y;
        let scale = Math.max(0.2, 1 - (height / 2.5) * 0.5); 
        let opacity = Math.max(0.1, 0.3 - (height / 2.5) * 0.2);
        if (isSliding.current) { scale *= 1.2; opacity *= 1.2; }
        shadowRef.current.scale.set(scale, scale, scale);
        const material = shadowRef.current.material as THREE.MeshBasicMaterial;
        if (material && !Array.isArray(material)) material.opacity = opacity;
    }

    const showFlicker = isInvincible.current || isImmortalityActive;
    if (showFlicker) {
        if (isInvincible.current) {
             if (Date.now() - lastDamageTime.current > 1500) { isInvincible.current = false; groupRef.current.visible = true; }
             else groupRef.current.visible = Math.floor(Date.now() / 50) % 2 === 0;
        } 
    } else groupRef.current.visible = true;
  });

  useEffect(() => {
     const checkHit = (e: any) => {
        if (isInvincible.current || isImmortalityActive) return;
        audio.playDamage(); takeDamage();
        isInvincible.current = true; lastDamageTime.current = Date.now();
     };
     window.addEventListener('player-hit', checkHit);
     return () => window.removeEventListener('player-hit', checkHit);
  }, [takeDamage, isImmortalityActive]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <group ref={bodyRef} position={[0, 1.1, 0]}> 
        <mesh castShadow position={[0, 0.2, 0]} geometry={TORSO_GEO} material={armorMaterial} />
        <mesh position={[0, 0.2, -0.2]} geometry={JETPACK_GEO} material={jointMaterial} />
        <mesh position={[-0.08, 0.1, -0.28]} geometry={GLOW_STRIP_GEO} material={glowMaterial} />
        <mesh position={[0.08, 0.1, -0.28]} geometry={GLOW_STRIP_GEO} material={glowMaterial} />
        <group ref={headRef} position={[0, 0.6, 0]}>
            <mesh castShadow geometry={HEAD_GEO} material={armorMaterial} />
        </group>
        <group position={[0.32, 0.4, 0]}>
            <group ref={rightArmRef}>
                <mesh position={[0, -0.25, 0]} castShadow geometry={ARM_GEO} material={armorMaterial} />
                <mesh position={[0, -0.55, 0]} geometry={JOINT_SPHERE_GEO} material={glowMaterial} />
            </group>
        </group>
        <group position={[-0.32, 0.4, 0]}>
            <group ref={leftArmRef}>
                 <mesh position={[0, -0.25, 0]} castShadow geometry={ARM_GEO} material={armorMaterial} />
                 <mesh position={[0, -0.55, 0]} geometry={JOINT_SPHERE_GEO} material={glowMaterial} />
            </group>
        </group>
        <mesh position={[0, -0.15, 0]} geometry={HIPS_GEO} material={jointMaterial} />
        <group position={[0.12, -0.25, 0]}>
            <group ref={rightLegRef}>
                 <mesh position={[0, -0.35, 0]} castShadow geometry={LEG_GEO} material={armorMaterial} />
            </group>
        </group>
        <group position={[-0.12, -0.25, 0]}>
            <group ref={leftLegRef}>
                 <mesh position={[0, -0.35, 0]} castShadow geometry={LEG_GEO} material={armorMaterial} />
            </group>
        </group>
      </group>
      <mesh ref={shadowRef} position={[0, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]} geometry={SHADOW_GEO} material={shadowMaterial} />
    </group>
  );
};
