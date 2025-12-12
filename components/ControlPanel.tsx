import React from 'react';
import { SketchParams } from '../types';

interface ControlPanelProps {
  params: SketchParams;
  onChange: (newParams: SketchParams) => void;
  onDownload: () => void;
  isGenerating: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  params, 
  onChange, 
  onDownload,
  isGenerating
}) => {
  
  const handleChange = (key: keyof SketchParams, value: number | boolean | string) => {
    onChange({ ...params, [key]: value });
  };

  const handleTextureToggle = () => {
    const newMode = !params.textureMode;
    // Apply preset colors when enabling texture mode for better UX, 
    // but allow customization afterwards.
    if (newMode) {
      onChange({
        ...params,
        textureMode: true,
        color1: '#232328', // Charcoal
        color2: '#faf7f2'  // Warm Paper
      });
    } else {
      onChange({
        ...params,
        textureMode: false,
        color1: '#000000',
        color2: '#ffffff'
      });
    }
  };

  const handleInvert = () => {
    onChange({
        ...params,
        color1: params.color2,
        color2: params.color1
    });
  };

  const handleRandomize = () => {
    const r = (min: number, max: number) => Math.random() * (max - min) + min;
    const rInt = (min: number, max: number) => Math.floor(r(min, max));
    const rColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };
    
    const patterns: ('circles' | 'checkerboard' | 'stripes')[] = ['circles', 'checkerboard', 'stripes'];

    onChange({
        ...params,
        seed: r(0, 100),
        noiseScale: r(0.002, 0.02),
        displacementAmt: rInt(50, 250),
        bandWidth: rInt(10, 60),
        contrast: rInt(30, 70),
        distortionSteps: Math.random() > 0.7 ? rInt(2, 4) : 1, // Mostly 1 step, sometimes more
        patternType: patterns[Math.floor(Math.random() * patterns.length)],
        turbulence: Math.random() > 0.6,
        color1: rColor(),
        color2: rColor(),
        // Keep texture settings conservative
        textureMode: Math.random() > 0.7, 
        textureStrength: rInt(30, 70)
    });
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border-r border-gray-200 h-full w-full overflow-y-auto p-6 flex flex-col gap-8 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Glitch Contour</h1>
          <p className="text-sm text-gray-500 mt-1">Generative Topography Tool</p>
        </div>
      </div>
      
      <button 
        onClick={handleRandomize}
        className="w-full py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        Surprise Me
      </button>

      <div className="space-y-6 flex-1">
        
        {/* Pattern Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Base Pattern</label>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(['circles', 'checkerboard', 'stripes'] as const).map((type) => (
               <button
                key={type}
                onClick={() => handleChange('patternType', type)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                  params.patternType === type 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-3">
             <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Color Palette</label>
                <button 
                    onClick={handleInvert}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    title="Swap Colors"
                >
                    Swap
                </button>
             </div>
             <div className="flex gap-3">
                 <div className="flex-1 space-y-1">
                     <input 
                        type="color" 
                        value={params.color1}
                        onChange={(e) => handleChange('color1', e.target.value)}
                        className="w-full h-10 rounded cursor-pointer border-0 p-0"
                     />
                     <p className="text-[10px] text-gray-400 uppercase tracking-wide">Ink</p>
                 </div>
                 <div className="flex-1 space-y-1">
                     <input 
                        type="color" 
                        value={params.color2}
                        onChange={(e) => handleChange('color2', e.target.value)}
                        className="w-full h-10 rounded cursor-pointer border-0 p-0"
                     />
                     <p className="text-[10px] text-gray-400 uppercase tracking-wide">Paper</p>
                 </div>
             </div>
        </div>

        {/* Band Width */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">
              Pattern Scale
            </label>
            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{params.bandWidth}px</span>
          </div>
          <input
            type="range"
            min="2"
            max="100"
            step="1"
            value={params.bandWidth}
            onChange={(e) => handleChange('bandWidth', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {/* Edge Sharpness (Contrast) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">Edge Sharpness</label>
            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{params.contrast}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={params.contrast}
            onChange={(e) => handleChange('contrast', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <div className="h-px bg-gray-100 my-2" />

        {/* Turbulence Toggle */}
        <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Turbulence Mode</label>
            <button 
            onClick={() => handleChange('turbulence', !params.turbulence)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${params.turbulence ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${params.turbulence ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
        </div>

        {/* Distortion Steps */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">Flow Iterations</label>
            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{params.distortionSteps}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={params.distortionSteps}
            onChange={(e) => handleChange('distortionSteps', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {/* Displacement */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">Displacement</label>
            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{params.displacementAmt}</span>
          </div>
          <input
            type="range"
            min="0"
            max="300"
            step="5"
            value={params.displacementAmt}
            onChange={(e) => handleChange('displacementAmt', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        {/* Noise Scale */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">Noise Zoom</label>
            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{params.noiseScale.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min="0.001"
            max="0.05"
            step="0.001"
            value={params.noiseScale}
            onChange={(e) => handleChange('noiseScale', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

         {/* Seed (Time Offset) */}
         <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">Pattern Seed</label>
            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{params.seed.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={params.seed}
            onChange={(e) => handleChange('seed', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

         {/* Options */}
         <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Paper Texture</label>
              <button 
                onClick={handleTextureToggle}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${params.textureMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${params.textureMode ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
            
            {params.textureMode && (
              <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                 <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Intensity</label>
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{params.textureStrength}%</span>
                 </div>
                 <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={params.textureStrength}
                    onChange={(e) => handleChange('textureStrength', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
              </div>
            )}
         </div>

      </div>

      <div className="pt-6 border-t border-gray-100">
        <button
            onClick={onDownload}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-medium transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Download High-Res
        </button>
      </div>
    </div>
  );
};