import React, { useState, useCallback, useMemo } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { GlitchSketch } from './components/GlitchSketch';
import { DEFAULT_PARAMS, SketchParams } from './types';

// Debounce helper to prevent heavy render lag on slider drag
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const App: React.FC = () => {
  // Parameters for the UI (instant feedback)
  const [params, setParams] = useState<SketchParams>(DEFAULT_PARAMS);
  // Parameters for the Sketch (delayed/debounced)
  const debouncedParams = useDebounce(params, 50); // 50ms delay is enough to smooth out drags but feel responsive

  const [downloadTrigger, setDownloadTrigger] = useState(false);

  const handleDownload = useCallback(() => {
    setDownloadTrigger(true);
  }, []);

  const handleDownloadComplete = useCallback(() => {
    setDownloadTrigger(false);
  }, []);

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden text-slate-800 font-sans">
      
      {/* Sidebar Controls */}
      <aside className="w-80 md:w-96 h-full flex-shrink-0 z-20">
        <ControlPanel 
          params={params} 
          onChange={setParams} 
          onDownload={handleDownload}
          isGenerating={false}
        />
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-4 md:p-8 bg-gray-100 overflow-auto">
        
        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-[90vh]">
            <div className="relative group">
                {/* Sketch Container */}
                <GlitchSketch 
                    params={debouncedParams} 
                    triggerDownload={downloadTrigger}
                    onDownloadComplete={handleDownloadComplete}
                />
                
                {/* Decorative border/glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 -z-10"></div>
            </div>

            <div className="max-w-md text-center">
                <p className="text-gray-400 text-xs uppercase tracking-widest font-medium">
                  {debouncedParams.canvasSize} x {debouncedParams.canvasSize} PX &bull; Seed {debouncedParams.seed.toFixed(1)}
                </p>
            </div>
        </div>

      </main>

      {/* Mobile-only overlay warning (optional, since sidebar is fixed width) */}
      <div className="md:hidden absolute top-0 left-0 w-full h-full bg-white z-50 flex items-center justify-center p-8 text-center pointer-events-none opacity-0 hidden">
        <p>Please view on a larger screen for the best experience.</p>
      </div>
    </div>
  );
};

export default App;