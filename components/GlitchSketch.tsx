import React, { useEffect, useRef, useState } from 'react';
import { SketchParams } from '../types';

// We need to declare the p5 type if we were using TS fully strictly with library types, 
// but since we are loading via CDN for the task requirements, we treat it as 'any' or window global
declare global {
  interface Window {
    p5: any;
  }
}

interface GlitchSketchProps {
  params: SketchParams;
  onReady?: () => void;
  triggerDownload?: boolean;
  onDownloadComplete?: () => void;
}

export const GlitchSketch: React.FC<GlitchSketchProps> = ({ 
  params, 
  onReady, 
  triggerDownload, 
  onDownloadComplete 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<any>(null);
  const paramsRef = useRef<SketchParams>(params);

  // Keep ref synced for the sketch to access latest without re-running setup
  useEffect(() => {
    paramsRef.current = params;
    if (p5InstanceRef.current) {
      p5InstanceRef.current.redrawSketch();
    }
  }, [params]);

  // Handle Download
  useEffect(() => {
    if (triggerDownload && p5InstanceRef.current) {
      p5InstanceRef.current.saveCanvas('glitch-contour', 'png');
      if (onDownloadComplete) onDownloadComplete();
    }
  }, [triggerDownload, onDownloadComplete]);

  useEffect(() => {
    if (!containerRef.current || typeof window.p5 === 'undefined') return;

    const sketch = (p: any) => {
      let baseImg: any;
      let cachedBandWidth = -1;
      let cachedSize = -1;
      let cachedPatternType = '';

      p.setup = () => {
        // Create canvas with correct pixel density
        p.createCanvas(paramsRef.current.canvasSize, paramsRef.current.canvasSize);
        p.pixelDensity(1); // Keep 1:1 for performance on pixel manipulation
        p.noLoop(); // No animation loop
        p.redrawSketch();
        if (onReady) onReady();
      };

      p.redrawSketch = () => {
        const { canvasSize, bandWidth, patternType } = paramsRef.current;

        // Only regenerate base image if structural params change
        if (!baseImg || cachedBandWidth !== bandWidth || cachedSize !== canvasSize || cachedPatternType !== patternType) {
          p.resizeCanvas(canvasSize, canvasSize);
          generateBaseImage(canvasSize, bandWidth, patternType);
          cachedBandWidth = bandWidth;
          cachedSize = canvasSize;
          cachedPatternType = patternType;
        }

        renderDistortion();
      };

      const generateBaseImage = (size: number, width: number, type: 'circles' | 'checkerboard' | 'stripes') => {
        baseImg = p.createImage(size, size);
        baseImg.loadPixels();
        
        const cx = size / 2;
        const cy = size / 2;

        for (let x = 0; x < size; x++) {
          for (let y = 0; y < size; y++) {
            let val;
            
            // Use Sine waves for gradients to allow for soft edges
            if (type === 'checkerboard') {
              // Soft Checkerboard: sin(x) * sin(y)
              const sx = Math.sin((x / width) * Math.PI);
              const sy = Math.sin((y / width) * Math.PI);
              const v = (sx * sy * 0.5) + 0.5; 
              val = v * 255;
            } else if (type === 'stripes') {
                // Vertical Stripes
                const sx = Math.sin((x / width) * Math.PI);
                const v = (sx * 0.5) + 0.5;
                val = v * 255;
            } else {
              // Concentric circles logic (Sine Wave)
              const d = p.dist(x, y, cx, cy);
              const v = (Math.sin((d / width) * Math.PI) * 0.5) + 0.5;
              val = v * 255;
            }
            
            const idx = (x + y * size) * 4;
            baseImg.pixels[idx] = val;     // R
            baseImg.pixels[idx + 1] = val; // G
            baseImg.pixels[idx + 2] = val; // B
            baseImg.pixels[idx + 3] = 255; // A
          }
        }
        baseImg.updatePixels();
      };

      // Helper to lerp colors
      const lerpColor = (c1: number[], c2: number[], amt: number) => {
        return [
          c1[0] + (c2[0] - c1[0]) * amt,
          c1[1] + (c2[1] - c1[1]) * amt,
          c1[2] + (c2[2] - c1[2]) * amt
        ];
      }

      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ] : [0, 0, 0];
      }

      const renderDistortion = () => {
        const { 
          canvasSize, 
          noiseScale, 
          displacementAmt, 
          seed, 
          turbulence,
          textureMode,
          textureStrength = 50,
          distortionSteps,
          contrast,
          color1,
          color2
        } = paramsRef.current;

        // Convert user colors
        const rgb1 = hexToRgb(color1);
        const rgb2 = hexToRgb(color2);

        // Set background to "Color 2" (Light/Paper equivalent) for safety, 
        // though we overwrite every pixel.
        p.background(rgb2[0], rgb2[1], rgb2[2]);
        
        p.loadPixels();
        
        // Base image must be ready
        if (!baseImg) return;
        
        const sourcePixels = baseImg.pixels;
        const targetPixels = p.pixels;
        
        // Contrast multiplier
        const contrastMult = 1 + (contrast / 100) * 20;

        // Texture strength multipliers (Normalized 0-1)
        const strengthFactor = textureStrength / 100.0;
        const grainBase = 80 * strengthFactor; 
        const bleedBase = 150 * strengthFactor;

        for (let x = 0; x < canvasSize; x++) {
          for (let y = 0; y < canvasSize; y++) {
            
            // Iterative Displacement Calculation
            let traceX = x;
            let traceY = y;
            
            const steps = Math.max(1, distortionSteps || 1); 

            for(let i = 0; i < steps; i++) {
                const nX = p.noise(traceX * noiseScale, traceY * noiseScale, seed);
                const nY = p.noise(traceX * noiseScale, traceY * noiseScale, seed + 100);
                
                let dx, dy;

                if (turbulence) {
                    // Fix drift: Use Sine wrapping to create ridges while keeping displacement centered.
                    // nX is 0..1. Map to 0..2PI. Sin output is -1..1.
                    // This centers the displacement around the noise mean (0.5), preventing the "drift to right" issue.
                    dx = Math.sin(nX * Math.PI * 2) * displacementAmt;
                    dy = Math.sin(nY * Math.PI * 2) * displacementAmt;
                } else {
                    dx = p.map(nX, 0, 1, -displacementAmt, displacementAmt);
                    dy = p.map(nY, 0, 1, -displacementAmt, displacementAmt);
                }

                traceX += dx;
                traceY += dy;
            }

            // Source coordinates (the end of the trace)
            let sx = traceX;
            let sy = traceY;
            
            // Add texture jitter (high frequency noise)
            if (textureMode) {
                // Jitter also scaled by texture strength slightly
                sx += (Math.random() - 0.5) * 1.5 * strengthFactor;
                sy += (Math.random() - 0.5) * 1.5 * strengthFactor;
            }

            let isx = Math.floor(sx);
            let isy = Math.floor(sy);

            // Clamp/Constrain
            if (isx < 0) isx = 0;
            if (isx >= canvasSize) isx = canvasSize - 1;
            if (isy < 0) isy = 0;
            if (isy >= canvasSize) isy = canvasSize - 1;

            // Get color from source index
            const srcIdx = (isx + isy * canvasSize) * 4;
            const targetIdx = (x + y * canvasSize) * 4;

            // Raw gradient value 0-255
            let r = sourcePixels[srcIdx];
            
            // Normalize to 0-1
            let normalized = r / 255.0;
            
            // Apply Contrast / Edge Definition
            // Expand around center 0.5
            let adjusted = (normalized - 0.5) * contrastMult + 0.5;
            // Clamp back to 0-1
            let finalVal = Math.max(0, Math.min(1, adjusted));

            // Interpolate between User Colors
            // finalVal 0 = Color 1 (Ink/Dark)
            // finalVal 1 = Color 2 (Paper/Light)
            const mixed = lerpColor(rgb1, rgb2, finalVal);
            
            let finalR = mixed[0];
            let finalG = mixed[1];
            let finalB = mixed[2];
            
            if (textureMode) {
                // Texture Grain - applies to everything
                const grain = (Math.random() - 0.5) * grainBase;
                finalR += grain;
                finalG += grain;
                finalB += grain;
                
                // Ink Imperfection (if closer to Color 1 side)
                if (finalVal < 0.5) {
                    // Calculate bleed intensity: 0 at 0.5, 1 at 0.0
                    // This maps the 0.0-0.5 range to a 1.0-0.0 strength factor
                    const bleedIntensity = (0.5 - finalVal) * 2.0; 
                    
                    // Apply stronger, independent random variation to each channel
                    // simulating organic ink bleed and uneven absorption
                    const currentBleedAmount = bleedBase * bleedIntensity;
                    
                    finalR += (Math.random() - 0.5) * currentBleedAmount;
                    finalG += (Math.random() - 0.5) * currentBleedAmount;
                    finalB += (Math.random() - 0.5) * currentBleedAmount;
                }
            }

            targetPixels[targetIdx] = finalR;
            targetPixels[targetIdx + 1] = finalG;
            targetPixels[targetIdx + 2] = finalB;
            targetPixels[targetIdx + 3] = 255; // Alpha
          }
        }
        p.updatePixels();
      };
    };

    // Initialize sketch
    const myP5 = new window.p5(sketch, containerRef.current);
    p5InstanceRef.current = myP5;

    return () => {
      myP5.remove();
    };
  }, []); // Empty dependency array means setup runs once, updates handled by refs

  return (
    <div 
      ref={containerRef} 
      className="rounded-xl overflow-hidden shadow-2xl bg-white leading-[0] select-none"
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    />
  );
};