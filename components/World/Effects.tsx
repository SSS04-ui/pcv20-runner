
import React from 'react';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export function Effects() {
  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom 
        luminanceThreshold={0.9} 
        mipmapBlur 
        intensity={0.2} 
        radius={0.4}
        levels={4}
      />
      <Noise opacity={0.03} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.1} darkness={0.4} />
    </EffectComposer>
  );
}
