export interface SketchParams {
  canvasSize: number;
  noiseScale: number;
  displacementAmt: number;
  bandWidth: number;
  seed: number;
  contrast: number; // For sharp vs soft edges
  inverted: boolean;
  patternType: 'circles' | 'checkerboard' | 'stripes';
  turbulence: boolean;
  textureMode: boolean;
  textureStrength: number;
  distortionSteps: number;
  color1: string; // Start Color (e.g., Ink/Dark)
  color2: string; // End Color (e.g., Paper/Light)
}

export const DEFAULT_PARAMS: SketchParams = {
  canvasSize: 800,
  noiseScale: 0.005,
  displacementAmt: 100,
  bandWidth: 12,
  seed: 0,
  contrast: 50, // Balanced softness by default
  inverted: false,
  patternType: 'circles',
  turbulence: false,
  textureMode: false,
  textureStrength: 50,
  distortionSteps: 1,
  color1: '#000000',
  color2: '#ffffff',
};