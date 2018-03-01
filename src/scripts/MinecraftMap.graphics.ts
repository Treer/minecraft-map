/********************************************
 helper functions for rendering graphics

 Copyright 2015 Glenn Fisher
****/
namespace MinecraftMap {
	"use strict";

	export class RGB {

		R: number;
		G: number;
		B: number;
		A: number;

		/** alapha is optional */
		constructor(red: number, green: number, blue: number, alpha?: number) {
			this.R = red;
			this.G = green;
			this.B = blue;
			this.A = (alpha === undefined) ? 255 : alpha;
		}

		// weight is a value between 0 and 1 which indicate how the result is
		// split between the instance and the colour provided as a parameter
		// (1 = 100% the colour provided as a parameter)
		Blend(color_rgb: RGB, weight: number): RGB {

			// clamp the weight to between 0 and 1
			weight = (weight < 0) ? 0.0 : ((weight > 1) ? 1.0 : weight);

			var counterweight = 1.0 - weight;

			return new RGB(
				Math.round((color_rgb.R * weight) + (this.R * counterweight)),
				Math.round((color_rgb.G * weight) + (this.G * counterweight)),
				Math.round((color_rgb.B * weight) + (this.B * counterweight))
			);
		}

		// Returns true if the colour components match, regardless of alpha
		MatchesRGB(red: number, green: number, blue: number): boolean {
			return red == this.R && green == this.G && blue == this.B;
		}

		// Returns true if the colour components match, regardless of alpha
		Matches(color_rgb: RGB): boolean {
			return (color_rgb instanceof RGB) && color_rgb.R == this.R && color_rgb.G == this.G && color_rgb.B == this.B;
		}
	}

	export function cloneCanvas(oldCanvasOrImage: HTMLCanvasElement): HTMLCanvasElement {
		var newCanvas = document.createElement('canvas');
		newCanvas.width = oldCanvasOrImage.width;
		newCanvas.height = oldCanvasOrImage.height;
		var context = newCanvas.getContext('2d');
		context.drawImage(oldCanvasOrImage, 0, 0);
		return newCanvas;
	}
	/*
	function cloneCanvasFromImage(oldImage) {
		var newCanvas = document.createElement('canvas');
		newCanvas.width = oldImage.width;
		newCanvas.height = oldImage.height;
		var context = newCanvas.getContext('2d');
		context.drawImage(oldImage, 0, 0);
		return newCanvas;
	}*/
}
