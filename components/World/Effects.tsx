import React from 'react';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

export function Effects() {
  return (
    /* Changed disableNormalPass to enableNormalPass={false} to fix the property name error */
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom 
        luminanceThreshold={0.75} 
        mipmapBlur 
        intensity={1.0} 
        radius={0.6}
        levels={8}
      />
      <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.1} darkness={0.5} />
    </EffectComposer>
  );
}
