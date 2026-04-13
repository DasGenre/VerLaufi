import React from 'react';
import { Settings2, Droplets, Maximize, Palette, Waves, Activity, Spline } from 'lucide-react';

interface ControlsProps {
  colors: string[];
  setColors: (colors: string[]) => void;
  dimensions: { width: number; height: number };
  setDimensions: (dim: { width: number; height: number }) => void;
  scale: number;
  setScale: (val: number) => void;
  warp: number;
  setWarp: (val: number) => void;
  bendX: number;
  setBendX: (val: number) => void;
  bendY: number;
  setBendY: (val: number) => void;
  complexity: number;
  setComplexity: (val: number) => void;
  grain: number;
  setGrain: (val: number) => void;
}

export default function Controls({
  colors,
  setColors,
  dimensions,
  setDimensions,
  scale,
  setScale,
  warp,
  setWarp,
  bendX,
  setBendX,
  bendY,
  setBendY,
  complexity,
  setComplexity,
  grain,
  setGrain,
}: ControlsProps) {
  const handleColorChange = (index: number, value: string) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
  };

  return (
    <div className="w-80 bg-zinc-900 border-l border-white/10 p-6 text-white overflow-y-auto shrink-0 z-10 shadow-2xl">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
        <Settings2 className="w-5 h-5 text-zinc-400" />
        <h2 className="text-lg font-medium tracking-wide">Generator Settings</h2>
      </div>

      <div className="space-y-8">
        {/* Dimensions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
            <Maximize className="w-4 h-4" />
            Image Size
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Width (px)</label>
              <input
                type="number"
                value={dimensions.width}
                onChange={(e) => setDimensions({ ...dimensions, width: parseInt(e.target.value) || 100 })}
                className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Height (px)</label>
              <input
                type="number"
                value={dimensions.height}
                onChange={(e) => setDimensions({ ...dimensions, height: parseInt(e.target.value) || 100 })}
                className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
            <Palette className="w-4 h-4" />
            Color Palette
          </div>
          <div className="space-y-3">
            {colors.map((color, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-md overflow-hidden border border-white/20 shrink-0">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(i, e.target.value)}
                    className="absolute -inset-2 w-12 h-12 cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => handleColorChange(i, e.target.value)}
                  className="flex-1 bg-black/50 border border-white/10 rounded-md px-3 py-1.5 text-sm font-mono uppercase focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-6 pt-4 border-t border-white/10">
          {/* Scale */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <Maximize className="w-4 h-4" />
                Scale
              </label>
              <span className="text-xs font-mono text-zinc-500">{scale.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full accent-zinc-400"
            />
          </div>

          {/* Warp */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <Waves className="w-4 h-4" />
                Warp Distortion
              </label>
              <span className="text-xs font-mono text-zinc-500">{warp.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={warp}
              onChange={(e) => setWarp(parseFloat(e.target.value))}
              className="w-full accent-zinc-400"
            />
          </div>

          {/* Bend X */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <Spline className="w-4 h-4" />
                Bend X (Horizontal)
              </label>
              <span className="text-xs font-mono text-zinc-500">{bendX.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.05"
              value={bendX}
              onChange={(e) => setBendX(parseFloat(e.target.value))}
              className="w-full accent-zinc-400"
            />
          </div>

          {/* Bend Y */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <Spline className="w-4 h-4" />
                Bend Y (Vertical)
              </label>
              <span className="text-xs font-mono text-zinc-500">{bendY.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.05"
              value={bendY}
              onChange={(e) => setBendY(parseFloat(e.target.value))}
              className="w-full accent-zinc-400"
            />
          </div>

          {/* Complexity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <Activity className="w-4 h-4" />
                Fold Complexity
              </label>
              <span className="text-xs font-mono text-zinc-500">{complexity.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={complexity}
              onChange={(e) => setComplexity(parseFloat(e.target.value))}
              className="w-full accent-zinc-400"
            />
          </div>

          {/* Grain */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <Droplets className="w-4 h-4" />
                Grain Intensity
              </label>
              <span className="text-xs font-mono text-zinc-500">{(grain * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={grain}
              onChange={(e) => setGrain(parseFloat(e.target.value))}
              className="w-full accent-zinc-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
