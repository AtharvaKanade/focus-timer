import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
// We will import components as we build them
import GardenScene from './components/canvas/GardenScene';
import UIOverlay from './components/ui/UIOverlay';
import AmbientSound from './components/audio/AmbientSound';

const App = () => {
  return (
    <div className="relative w-full h-screen bg-moss-900 overflow-hidden text-sage-50 font-sans selection:bg-gold-500/30">
      {/* We will uncomment these as we implement them */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 2, 8], fov: 45 }}>
          <Suspense fallback={null}>
            <GardenScene />
          </Suspense>
        </Canvas>
      </div>

      <UIOverlay />
      <AmbientSound />
    </div>
  );
};

export default App;