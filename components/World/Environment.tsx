
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH } from '../../types';

const StarField: React.FC = () => {
  const speed = useStore(state => state.speed);
  const count = 3000; 
  const meshRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      let x = (Math.random() - 0.5) * 400;
      let y = (Math.random() - 0.5) * 200 + 50; 
      let z = -550 + Math.random() * 650;

      if (Math.abs(x) < 5 && y > -5 && y < 20) {
          if (x < 0) x -= 10;
          else x += 10;
      }

      pos[i * 3] = x;     
      pos[i * 3 + 1] = y; 
      pos[i * 3 + 2] = z; 
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const activeSpeed = speed > 0 ? speed : 2; 

    for (let i = 0; i < count; i++) {
        let z = positions[i * 3 + 2];
        z += activeSpeed * delta * 2.0; 
        
        if (z > 100) {
            z = -550 - Math.random() * 50; 
            let x = (Math.random() - 0.5) * 400;
            let y = (Math.random() - 0.5) * 200 + 50;
            
            if (Math.abs(x) < 5 && y > -5 && y < 20) {
                if (x < 0) x -= 10;
                else x += 10;
            }

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
        }
        positions[i * 3 + 2] = z;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

const LaneGuides: React.FC = () => {
    const { laneCount, vaccineCount } = useStore();
    
    const separators = useMemo(() => {
        const lines: number[] = [];
        const startX = -(laneCount * LANE_WIDTH) / 2;
        
        for (let i = 0; i <= laneCount; i++) {
            lines.push(startX + (i * LANE_WIDTH));
        }
        return lines;
    }, [laneCount]);

    const isFinalStage = vaccineCount >= 15;
    const isUltimateStage = vaccineCount >= 19;
    
    let guideColor = '#ffffff';
    if (isUltimateStage) guideColor = '#ffaa00';
    else if (isFinalStage) guideColor = '#ffcc00';

    return (
        <group position={[0, 0.02, 0]}>
            <mesh position={[0, -0.02, -20]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[laneCount * LANE_WIDTH, 200]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.9} />
            </mesh>

            {separators.map((x, i) => (
                <mesh key={`sep-${i}`} position={[x, 0, -20]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.05, 200]} /> 
                    <meshBasicMaterial 
                        color={guideColor} 
                        transparent 
                        opacity={isUltimateStage ? 0.8 : 0.4} 
                    />
                </mesh>
            ))}
        </group>
    );
};

const RetroShield: React.FC = () => {
    const matRef = useRef<THREE.ShaderMaterial>(null);
    const groupRef = useRef<THREE.Group>(null);
    const vaccineCount = useStore(state => state.vaccineCount);

    useFrame((state, delta) => {
        if (matRef.current) {
            matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
        if (groupRef.current) {
            groupRef.current.position.y = 55 + Math.sin(state.clock.elapsedTime * 0.5) * 2.0; 
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;

            const targetScale = 0.15 + (vaccineCount / 20.0) * 0.85; 
            const currentScale = groupRef.current.scale.x;
            const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 2.0);
            groupRef.current.scale.setScalar(nextScale);
        }
    });

    const geometry = useMemo(() => {
        const s = new THREE.Shape();
        const w = 45; 
        const hTop = 35;
        const hSide = 15;
        
        s.moveTo(-w, hTop);
        s.lineTo(w, hTop);           
        s.lineTo(w, hSide);          
        
        s.bezierCurveTo(w, -30, 0, -60, 0, -70); 
        s.bezierCurveTo(0, -60, -w, -30, -w, hSide);
        
        s.lineTo(-w, hTop);          

        const geo = new THREE.ExtrudeGeometry(s, {
            depth: 8, 
            bevelEnabled: true,
            bevelThickness: 3,
            bevelSize: 2,
            bevelSegments: 5
        });
        
        geo.center();
        
        const pos = geo.attributes.position;
        const uv = geo.attributes.uv;
        geo.computeBoundingBox();
        const { min, max } = geo.boundingBox!;
        const rangeX = max.x - min.x;
        const rangeY = max.y - min.y;
        
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const u = (x - min.x) / rangeX;
            const v = (y - min.y) / rangeY;
            uv.setXY(i, u, v);
        }
        uv.needsUpdate = true;
        
        return geo;
    }, []);

    const isUltimateStage = vaccineCount >= 19;
    const rimColor = isUltimateStage ? '#ffaa00' : '#ffffff';

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColorBase: { value: new THREE.Color('#111111') }, 
        uColorGrid: { value: new THREE.Color('#444444') }, 
        uColorRim: { value: new THREE.Color(rimColor) },
        uColorCross: { value: new THREE.Color(rimColor) }
    }), [rimColor]);

    return (
        <group ref={groupRef} position={[0, 55, -200]} scale={[0.15, 0.15, 0.15]}>
            <mesh geometry={geometry}>
                <shaderMaterial
                    ref={matRef}
                    uniforms={uniforms}
                    transparent={true}
                    depthWrite={true} 
                    vertexShader={`
                        varying vec2 vUv;
                        varying vec3 vNormal;
                        varying vec3 vViewPosition;

                        void main() {
                            vUv = uv;
                            vNormal = normalize(normalMatrix * normal);
                            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                            vViewPosition = -mvPosition.xyz;
                            gl_Position = projectionMatrix * mvPosition;
                        }
                    `}
                    fragmentShader={`
                        varying vec2 vUv;
                        varying vec3 vNormal;
                        varying vec3 vViewPosition;

                        uniform float uTime;
                        uniform vec3 uColorBase;
                        uniform vec3 uColorGrid;
                        uniform vec3 uColorRim;
                        uniform vec3 uColorCross;

                        void main() {
                            vec3 normal = normalize(vNormal);
                            vec3 viewDir = normalize(vViewPosition);
                            float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 2.5);
                            
                            float gridScale = 25.0;
                            vec2 gridUV = vUv * gridScale;
                            gridUV.y += uTime * 2.0;
                            
                            float gridLineX = step(0.9, fract(gridUV.x));
                            float gridLineY = step(0.9, fract(gridUV.y));
                            float gridMask = max(gridLineX, gridLineY);
                            
                            vec2 center = vec2(0.5, 0.55); 
                            vec2 dist = abs(vUv - center);
                            float thickness = 0.12; 
                            float barLength = 0.35;    
                            float crossMask = 0.0;
                            if ((dist.y < thickness && dist.x < barLength) || 
                                (dist.x < thickness && dist.y < barLength)) {
                                crossMask = 1.0;
                            }
                            
                            float pulsePhase = mod(uTime * 1.5, 1.0);
                            float heartbeat = exp(-pulsePhase * 4.0) * 0.8; 
                            float pulsePhase2 = mod(uTime * 1.5 + 0.3, 1.0);
                            heartbeat += exp(-pulsePhase2 * 4.0) * 0.4;
                            
                            vec3 finalColor = uColorBase;
                            finalColor += uColorGrid * gridMask * 0.5;
                            vec3 crossColor = uColorCross + (vec3(0.5, 0.5, 0.5) * heartbeat);
                            finalColor = mix(finalColor, crossColor, crossMask);
                            
                            float crossGlow = (1.0 - length(vUv - center) * 2.0) * heartbeat;
                            crossGlow = max(0.0, crossGlow);
                            finalColor += uColorRim * crossGlow * 0.5;
                            finalColor += uColorRim * fresnel * 0.5;

                            float alpha = 0.4 + (fresnel * 0.4) + (crossMask * 0.4);
                            gl_FragColor = vec4(finalColor, alpha);
                        }
                    `}
                />
            </mesh>
        </group>
    );
};

const MovingGrid: React.FC = () => {
    const { speed, vaccineCount } = useStore();
    const isFinalStage = vaccineCount >= 15;
    const isUltimateStage = vaccineCount >= 19;
    
    const meshRef = useRef<THREE.Mesh>(null);
    const offsetRef = useRef(0);
    
    let gridColor = '#ffffff';
    let gridOpacity = 0.08;

    if (isUltimateStage) {
        gridColor = '#ffaa00';
        gridOpacity = 0.4;
    } else if (isFinalStage) {
        gridColor = '#ff4444';
        gridOpacity = 0.2;
    }

    useFrame((state, delta) => {
        if (meshRef.current) {
             const activeSpeed = speed > 0 ? speed : 5;
             offsetRef.current += activeSpeed * delta;
             const cellSize = 10;
             const zPos = -100 + (offsetRef.current % cellSize);
             meshRef.current.position.z = zPos;
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -100]}>
            <planeGeometry args={[300, 400, 30, 40]} />
            <meshBasicMaterial 
                color={gridColor}
                wireframe 
                transparent 
                opacity={gridOpacity} 
            />
        </mesh>
    );
};

export const Environment: React.FC = () => {
  const vaccineCount = useStore(state => state.vaccineCount);
  const isFinalStage = vaccineCount >= 15;
  const isUltimateStage = vaccineCount >= 19;

  let bgColor = '#050505';
  let fogColor = '#050505';
  let ambientColor = '#333333';
  let dirLightColor = '#ffffff';
  let pointLightColor = '#ffffff';
  let pointLightIntensity = 1;

  if (isUltimateStage) {
      bgColor = '#221100';
      fogColor = '#331a00';
      ambientColor = '#442200';
      dirLightColor = '#ffcc00';
      pointLightColor = '#ffaa00';
      pointLightIntensity = 6;
  } else if (isFinalStage) {
      bgColor = '#220000'; 
      fogColor = '#330000'; 
      ambientColor = '#441111';
      dirLightColor = '#ffaa00'; 
      pointLightColor = '#ff3300';
      pointLightIntensity = 4;
  }

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[fogColor, 40, 160]} />
      
      <ambientLight intensity={0.5} color={ambientColor} />
      <directionalLight position={[0, 20, -10]} intensity={1.5} color={dirLightColor} />
      <pointLight position={[0, 25, -150]} intensity={pointLightIntensity} color={pointLightColor} distance={200} decay={2} />
      
      <StarField />
      <MovingGrid />
      <LaneGuides />
      
      <RetroShield />
    </>
  );
};
