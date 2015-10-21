// Type definitions for StackBlur v0.5
// Project: http://www.quasimondo.com/StackBlurForCanvas
// Definitions by: Treer <https://github.com/Treer/>

declare function stackBlurImage(imageID: string, canvasID: string, radius: number, blurAlphaChannel: number): void;

declare function stackBlurCanvasRGBA(canvasID: string, top_x: number, top_y: number, width: number, height: number, radius: number): void;

declare function stackBlurCanvasIdRGB(canvasID: string, top_x: number, top_y: number, width: number, height: number, radius: number): void;

declare function stackBlurCanvasRGB(canvas: HTMLCanvasElement, top_x: number, top_y: number, width: number, height: number, radius: number): void;
