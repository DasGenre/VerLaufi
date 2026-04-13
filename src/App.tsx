/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import GradientCanvas from './components/GradientCanvas';
import Controls from './components/Controls';

export default function App() {
  // Initial colors matched to the reference image
  const [colors, setColors] = useState([
    '#65f090', // Neon green
    '#ff9b42', // Apricot/Orange
    '#004b5a', // Petrol/Dark Blue
    '#8b5a2b'  // Bronze/Brown
  ]);
  
  // Initial dimensions matching the portrait aspect ratio of the reference
  const [dimensions, setDimensions] = useState({ width: 800, height: 1000 });
  
  // Parameters tuned for the sweeping, folded look
  const [scale, setScale] = useState(1.5);
  const [warp, setWarp] = useState(1.2);
  const [bendX, setBendX] = useState(0.5);
  const [bendY, setBendY] = useState(0.5);
  const [complexity, setComplexity] = useState(1.5);
  const [grain, setGrain] = useState(0.18);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-950 flex">
      {/* Canvas Container - scrollable if canvas is larger than screen */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-8 relative custom-scrollbar">
        {/* Checkerboard background to show transparency if needed, though canvas is opaque */}
        <div 
          style={{ 
            width: dimensions.width, 
            height: dimensions.height,
            minWidth: dimensions.width,
            minHeight: dimensions.height
          }} 
          className="relative shadow-2xl shrink-0 bg-black transition-all duration-300"
        >
          <GradientCanvas
            colors={colors}
            scale={scale}
            warp={warp}
            bendX={bendX}
            bendY={bendY}
            complexity={complexity}
            grain={grain}
          />
        </div>
      </div>

      {/* Sidebar Controls */}
      <Controls
        colors={colors}
        setColors={setColors}
        dimensions={dimensions}
        setDimensions={setDimensions}
        scale={scale}
        setScale={setScale}
        warp={warp}
        setWarp={setWarp}
        bendX={bendX}
        setBendX={setBendX}
        bendY={bendY}
        setBendY={setBendY}
        complexity={complexity}
        setComplexity={setComplexity}
        grain={grain}
        setGrain={setGrain}
      />
    </div>
  );
}
