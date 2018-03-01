/// <reference path="MinecraftMap.graphics.ts" />

/********************************************
 renders a new map-background (if an oceanmap has been provided)

 Copyright 2015 Glenn Fisher

****/
namespace MinecraftMap {
	"use strict";

	var cOceanBlocksPerPixel     = 16; // scale of the oceanMaskImage
	var cWorkingCanvasOversample = 4;  // the "workingCanvas" should be much smaller than the ocean mask to save processing time, but is still detailed enough to scale down to map-background size afterwards without visible aliasing.
	var cColor_Black             = new RGB(0, 0, 0);
	var cColor_White             = new RGB(255, 255, 255);


	export function renderOcean(config, mapImage, oceanMaskImage) {

		// OceanMaskImage must be wider than 0 to avoid divide by zero
		if (oceanMaskImage.width == 0) {
			alert('Invalid ocean mask - width 0');
			return imageToCanvas(mapImage);
		}

		// Work out the bounding box that the map at its current scale and position occupies
		// inside the oceanMaskImage - (mask_x, mask_z) with size (maskWidth, maskWidth)
		var maskCenter_x = oceanMaskImage.width / 2;
		var maskCenter_z = oceanMaskImage.height / 2;
		var maskWidth = Math.round((config.MapRange * 2) / cOceanBlocksPerPixel);
		var mask_x = Math.round(maskCenter_x + (config.X - config.MapRange) / cOceanBlocksPerPixel);
		var mask_z = Math.round(maskCenter_z + (config.Z - config.MapRange) / cOceanBlocksPerPixel);

		// adjust the mask co-ords so they stay inside the bounds of the oceanMaskImage
		var adj_mask_x = mask_x < 0 ? 0 : mask_x;
		var adj_mask_z = mask_z < 0 ? 0 : mask_z;

		var adj_mask_width  = maskWidth - (adj_mask_x - mask_x);
		var adj_mask_height = maskWidth - (adj_mask_z - mask_z);
		adj_mask_width  = adj_mask_width  > oceanMaskImage.width  ? oceanMaskImage.width  : adj_mask_width;
		adj_mask_height = adj_mask_height > oceanMaskImage.height ? oceanMaskImage.height : adj_mask_height;

		// adjust the destination coords to take into account any clamping of the mask co-ords done to stay
		// inside the oceanMaskImage bounds.
		// (If the map range fits entirely in the oceanMaskImage, then (dest_x, dest_z) will be (0, 0) and
		// dest_width and dest_height will match the width and height of mapImage)
		var destScale = mapImage.width / maskWidth;
		var dest_x = Math.round((adj_mask_x - mask_x) * destScale);
		var dest_z = Math.round((adj_mask_z - mask_z) * destScale);
		var dest_width = Math.round(adj_mask_width * destScale);
		var dest_height = Math.round(adj_mask_height * destScale);


		// create a "workingCanvas" that is much smaller than the ocean mask, and
		// will take less time to process, but is still detailed enough to scale
		// down to the map-background size afterwards without visible aliasing.
		var working_width = dest_width * cWorkingCanvasOversample; // calculate the working canvas size based off the destination coords
		var working_height = dest_height * cWorkingCanvasOversample;

		var workingCanvas = document.createElement('canvas');
		workingCanvas.width = working_width;
		workingCanvas.height = working_height;
		var workingContext = workingCanvas.getContext("2d");
		workingContext.drawImage(
			oceanMaskImage,
			adj_mask_x,
			adj_mask_z,
			adj_mask_width,
			adj_mask_height,
			0,
			0,
			working_width,
			working_height
		);


		var theme = config.OceanTheme.toLowerCase();
		if (theme == "darkseas") {
			return renderTheme_DarkSeas(config, mapImage, workingCanvas, dest_x, dest_z, dest_width, dest_height);
		} else if (theme == "coastalrelief") {
			return renderTheme_CoastalRelief(config, mapImage, workingCanvas, dest_x, dest_z, dest_width, dest_height);
		} else {
			return renderTheme_BlueCoastline(config, mapImage, workingCanvas, dest_x, dest_z, dest_width, dest_height);
		}
	}

	// Land is dark-coloured, with blue coastlines fading out to light-coloured oceans
	// Theme inspired by http://www.elfwood.com/~bell1973/Pirate-Treasure-map.2567659.html
	//
	// Returns a canvas to use as the map background. The size of the canvas returned should match the size of map_Image
	// Parameters:
	//   map_Image - the img object containing the default map-background image
	//   transformedOceanMask_Context - oceanMask that has been cropped and translated so it can be copied straight into map_Image
	//   dest_x, dest_z, dest_width, dest_height - the position to place transformedOceanMask_Context into map_Image
	function renderTheme_BlueCoastline(config, map_Image, transformedOceanMask_Canvas, dest_x, dest_z, dest_width, dest_height) {

		var cColor_BlueCoast    = new RGB(127, 130, 146);
		var cColor_ShallowCoast = new RGB(  0,  30,  30);
		var cColor_lightOcean   = new RGB(243, 226, 194);
		var cColor_Land         = new RGB(208, 177, 120);
		var cAlpha_Ocean        = Math.round(0.8 * 255);
		var cAlpha_DeepOcean    = Math.round(0.6 * 255);
		var cAlpha_Land         = Math.round(0.2  * 255);

		var workingImage = CreateWorkingCanvas(config, transformedOceanMask_Canvas, dest_width, dest_height);
		var workingImage_Context = workingImage.getContext('2d');
		var working_width  = workingImage.width;
		var working_height = workingImage.height;

		// Now that workingImage is a copy of transformedOceanMask_Canvas, we can use transformedOceanMask_Canvas as
		// our blurCanvas and not worry about losing its unblurred image.
		var blurCanvas = transformedOceanMask_Canvas;
		var blurRadius = Math.round(cWorkingCanvasOversample * map_Image.width / 8); // about 8 blocks on the final map

		// The blur radius is balancing two roles - providing a nice ocean gradient, and removing small islands from the
		// map (kind of like a low pass filter) - since the islands make the final map look noisy. (We could separate these
		// roles but it would require a second blurCanvas, and a second blur operation).
		//
		// blurRadius is currently tuned for the first role (providing a nice ocean gradient), we're now going to adjust it
		// to make it complete the second role. The blurRadius is currently perfect for Minecraft 1.7 land shapes shown on a map
		// with range 3200, but if you increase the map range, the oceans get smaller, and the blurPixels become too white to
		// use to remove islands, so we will scale the blurRadius with the map range. Plus this way a deep ocean should look like a
		// deep ocean no matter what scale the map.
		var blurScale = 3200.0 / config.MapRange;
		if (blurScale > 3) blurScale = 3; // Put a cap on it to stop stupid extremes
		blurRadius *= blurScale;
		stackBlurCanvasRGB( blurCanvas, 0, 0, blurCanvas.width, blurCanvas.height, blurRadius );


		var blurPixels = blurCanvas.getContext("2d").getImageData(0, 0, blurCanvas.width, blurCanvas.height).data;
		var workingImageData = workingImage_Context.getImageData(0, 0, working_width, working_height);
		var workingPixels = workingImageData.data;

		// Build a colour lookup table for the ocean, because anything involving classes is
		// way too slow (e.g. RGB.Blend())
		var colorTable_R = new Array(256);
		var colorTable_G = new Array(256);
		var colorTable_B = new Array(256);
		var i;
		for (i = 0; i < colorTable_R.length; i++) {

			// A shade of 0.0 means coastline (cColor_BlueCoast + cColor_ShallowCoast)
			// A shade of 1.0 means ocean (cColor_lightOcean)
			var shade = i / 255.0;
			var color = cColor_BlueCoast.Blend(cColor_lightOcean, shade);

			// lets make the shading a little non-linear (but include the blurScale so that our
			// coastlines don't get too sharp and pixelated as the map zooms out).
			var coastBlendStartShade = 0.5 / blurScale;
			// Clamp coastBlendStartShade between 0.5 and 0.7
			if (coastBlendStartShade < 0.5) { coastBlendStartShade = 0.5; } else if (coastBlendStartShade > 0.7) { coastBlendStartShade = 0.7; }

			if (shade <= coastBlendStartShade) color = color.Blend(cColor_ShallowCoast, 0.5 - (0.5 * shade / coastBlendStartShade));

			colorTable_R[i] = color.R;
			colorTable_G[i] = color.G;
			colorTable_B[i] = color.B;
		}
		// avoid using classes, for speed.
		var colorLand_R = cColor_Land.R, colorLand_G = cColor_Land.G, colorLand_B = cColor_Land.B;

		// the blurCanvas might be higher resolution than the workingImage and need different increments
		// (if a "hard" ocean theme is selected)
		var blurPixelXInc = 4 * blurCanvas.width / working_width;
		var blurPixelYInc = 4 * blurCanvas.width * ((blurCanvas.height / working_height) - 1);

		var x = 0;
		var z = 0;
		var index = 0;
		var blurIndex = 0;

		for ( z = 0; z < working_height; z++ ) {
			for ( x = 0; x < working_width; x++ ) {

				var blurPixel = blurPixels[blurIndex];

				// the blurPixels value of the tip of peninsulas (for a range 3200 map) sometimes gets as low as 80,
				// and we want the value as high as we can get away with to eliminate small islands, as they turn
				// the map parchment texture to noise, but still keep the larger land masses. Looks like the sweet
				// spot is between 70 to 80.
				//
				// 75 is perfect for a map range of 3200. But doesn't work well for a map range of 5000 etc, because
				// of this we have changed the blurRadius using blurScale - now 75 should be perfect for all ranges.
				var isLand = workingPixels[index] > 128 && blurPixel > 75;

				var alpha;
				if (isLand) {
					// land
					alpha = cAlpha_Land;

					workingPixels[index]     = colorLand_R;
					workingPixels[index + 1] = colorLand_G;
					workingPixels[index + 2] = colorLand_B;

					//alpha = 255;
					//workingPixels[index + 2] = blurPixels[index] > 75 ? 0 : 255;
				} else {
					// ocean
					var oceanDepth = (255 - blurPixel) / 255.0; // 0 to 1, 1 is deep, 0 is shallow
					alpha = Math.round(cAlpha_Ocean * (1 - oceanDepth) + cAlpha_DeepOcean * oceanDepth); // chooses an alpha value between cAlpha_Ocean and cAlpha_DeepOcean, depending on oceanDepth

					// After blurring the black ocean-mask with the white land-mask, dark areas in blurPixels[]
					// means deep ocean, calculate a tableIndex where 0 is coast and 255 is deep ocean.
					// (workingPixels[] is white for land, black for ocean, and grey for both)
					var tableIndex = Math.round((255 - blurPixel) * 0.7);
					if (tableIndex > 255) tableIndex = 255;
					if (tableIndex < 0)   tableIndex = 0;

					workingPixels[index]     = colorTable_R[tableIndex];
					workingPixels[index + 1] = colorTable_G[tableIndex];
					workingPixels[index + 2] = colorTable_B[tableIndex];
				}
				workingPixels[index + 3] = alpha;

				index += 4;
				blurIndex += blurPixelXInc;
			}
			blurIndex += blurPixelYInc;
		}
		workingImage_Context.putImageData( workingImageData, 0, 0);

		// Scale the processed ocean down to the same size as the mapImage, and
		// overlay it onto the paper texture of mapImage
		var mapBackgroundCopy_Canvas = cloneCanvas(map_Image);
		var mapBackgroundCopy_Context = mapBackgroundCopy_Canvas.getContext("2d");

		mapBackgroundCopy_Context.drawImage(
			workingImage,
			0,
			0,
			working_width,
			working_height,
			dest_x,
			dest_z,
			dest_width,
			dest_height
		);

		return ApplyMapEdgesToCanvas(mapBackgroundCopy_Canvas, map_Image, 1, 1);
	}

	// Land is light-coloured, with dark coastlines and oceans
	//
	// Returns a canvas to use as the map background. The size of the canvas returned should match the size of map_Image
	// Parameters:
	//   map_Image - the img object containing the default map-background image
	//   transformedOceanMask_Context - oceanMask that has been cropped and translated so it can be copied straight into map_Image
	//   dest_x, dest_z, dest_width, dest_height - the position to place transformedOceanMask_Context into map_Image
	function renderTheme_DarkSeas(config, map_Image, transformedOceanMask_Canvas, dest_x, dest_z, dest_width, dest_height) {

		var cColor_Ocean = new RGB(144, 104,  67);
		var cColor_Land  = new RGB(249, 232, 206);
		var cAlpha_Ocean = Math.round(0.7 * 255);
		var cAlphaFloor_Ocean = Math.round(0.2 * 255);
		var cAlpha_Land  = Math.round(0.25  * 255);

		var workingImage = CreateWorkingCanvas(config, transformedOceanMask_Canvas, dest_width, dest_height);
		var workingImage_Context = workingImage.getContext('2d');
		var working_width  = workingImage.width;
		var working_height = workingImage.height;

		// Now that workingImage is a copy of transformedOceanMask_Canvas, we can use transformedOceanMask_Canvas as
		// our blurCanvas and not worry about losing its unblurred image.
		var blurCanvas = transformedOceanMask_Canvas;
		var blurRadius = Math.round(cWorkingCanvasOversample * map_Image.width / 8); // about 8 blocks on the final map

		// The blur radius is balancing two roles - providing a nice ocean gradient, and removing small islands from the
		// map (kind of like a low pass filter) - since the islands make the final map look noisy. (We could separate these
		// roles but it would require a second blurCanvas, and a second blur operation).
		//
		// blurRadius is currently tuned for the first role (providing a nice ocean gradient), we're now going to adjust it
		// to make it complete the second role. The blurRadius is currently perfect for Minecraft 1.7 land shapes shown on a map
		// with range 3200, but if you increase the map range, the oceans get smaller, and the blurPixels become too white to
		// use to remove islands, so we will scale the blurRadius with the map range. Plus this way a deep ocean should look like a
		// deep ocean no matter what scale the map.
		var blurScale = 3200.0 / config.MapRange;
		if (blurScale > 3) blurScale = 3; // Put a cap on it to stop stupid extremes
		blurRadius *= blurScale;
		stackBlurCanvasRGB( blurCanvas, 0, 0, blurCanvas.width, blurCanvas.height, blurRadius );


		var blurPixels = blurCanvas.getContext("2d").getImageData(0, 0, blurCanvas.width, blurCanvas.height).data;
		var workingImageData = workingImage_Context.getImageData(0, 0, working_width, working_height);
		var workingPixels = workingImageData.data;

		// avoid using classes, for speed.
		var colorLand_R = cColor_Land.R, colorLand_G = cColor_Land.G, colorLand_B = cColor_Land.B;
		var colorOcean_R = cColor_Ocean.R, colorOcean_G = cColor_Ocean.G, colorOcean_B = cColor_Ocean.B;

		// the blurCanvas might be higher resolution than the workingImage and need different increments
		// (if a "hard" ocean theme is selected)
		var blurPixelXInc = 4 * blurCanvas.width / working_width;
		var blurPixelYInc = 4 * blurCanvas.width * ((blurCanvas.height / working_height) - 1);

		var x = 0;
		var z = 0;
		var index = 0;
		var blurIndex = 0;

		for ( z = 0; z < working_height; z++ ) {
			for ( x = 0; x < working_width; x++ ) {

				var blurPixel = blurPixels[blurIndex];

				// the blurPixels value of the tip of peninsulas (for a range 3200 map) sometimes gets as low as 80,
				// and we want the value as high as we can get away with to eliminate small islands, as they turn
				// the map parchment texture to noise, but still keep the larger land masses. Looks like the sweet
				// spot is between 70 to 80.
				//
				// 75 is perfect for a map range of 3200. But doesn't work well for a map range of 5000 etc, because
				// of this we have changed the blurRadius using blurScale - now 75 should be perfect for all ranges.
				var isLand = workingPixels[index] > 128 && blurPixel > 75;

				var alpha;
				if (isLand) {
					// land
					alpha = cAlpha_Land;

					workingPixels[index]     = colorLand_R;
					workingPixels[index + 1] = colorLand_G;
					workingPixels[index + 2] = colorLand_B;
				} else {
					// ocean
					// pick an alpha between cAlpha_Ocean and cAlphaFloor_Ocean based on blurPixel, where
					// blurPixel of 255 = cAlpha_Ocean and blurPixel of 0 = cAlphaFloor_Ocean
					alpha = Math.round(blurPixel * (cAlpha_Ocean - cAlphaFloor_Ocean) / 255.0) + cAlphaFloor_Ocean;

					workingPixels[index]     = colorOcean_R;
					workingPixels[index + 1] = colorOcean_G;
					workingPixels[index + 2] = colorOcean_B;
				}
				workingPixels[index + 3] = alpha;

				index += 4;
				blurIndex += blurPixelXInc;
			}
			blurIndex += blurPixelYInc;
		}
		workingImage_Context.putImageData( workingImageData, 0, 0);

		// Scale the processed ocean down to the same size as the mapImage, and
		// overlay it onto the paper texture of mapImage
		var mapBackgroundCopy_Canvas = cloneCanvas(map_Image);
		var mapBackgroundCopy_Context = mapBackgroundCopy_Canvas.getContext("2d");

		mapBackgroundCopy_Context.drawImage(
			workingImage,
			0,
			0,
			working_width,
			working_height,
			dest_x,
			dest_z,
			dest_width,
			dest_height
		);

		return ApplyMapEdgesToCanvas(mapBackgroundCopy_Canvas, map_Image, 1, 1);
	}

	// Land and ocean are the same colour, only the coastline is drawn in
	//
	// Returns a canvas to use as the map background. The size of the canvas returned should match the size of map_Image
	// Parameters:
	//   map_Image - the img object containing the default map-background image
	//   transformedOceanMask_Context - oceanMask that has been cropped and translated so it can be copied straight into map_Image
	//   dest_x, dest_z, dest_width, dest_height - the position to place transformedOceanMask_Context into map_Image
	function renderTheme_CoastalRelief(config, map_Image, transformedOceanMask_Canvas, dest_x, dest_z, dest_width, dest_height) {

		var cColor_DarkBrown = new RGB(144, 104,  67);
		var cColor_Coastline = cColor_DarkBrown.Blend(cColor_Black, 0.45);

		var workingImage = CreateWorkingCanvas(config, transformedOceanMask_Canvas, dest_width, dest_height);
		var workingImage_Context = workingImage.getContext('2d');
		var working_width  = workingImage.width;
		var working_height = workingImage.height;

		// Now that workingImage is a copy of transformedOceanMask_Canvas, we can use transformedOceanMask_Canvas as
		// our blurCanvas and not worry about losing its unblurred value.
		var blurCanvas = transformedOceanMask_Canvas;
		var blurRadius = Math.round(cWorkingCanvasOversample * map_Image.width / 20); // about 3 blocks on the final map, regardless of MapRange

		stackBlurCanvasRGB( blurCanvas, 0, 0, blurCanvas.width, blurCanvas.height, blurRadius );

		var blurPixels = blurCanvas.getContext("2d").getImageData(0, 0, blurCanvas.width, blurCanvas.height).data;
		var workingImageData = workingImage_Context.getImageData(0, 0, working_width, working_height);
		var workingPixels = workingImageData.data;

		// avoid using classes, for speed.
		var colorCoast_R = cColor_Coastline.R, colorCoast_G = cColor_Coastline.G, colorCoast_B = cColor_Coastline.B;

		// the blurCanvas might be higher resolution than the workingImage and need different increments
		// (if a "hard" ocean theme is selected)
		var blurPixelXInc = 4 * blurCanvas.width / working_width;
		var blurPixelYInc = 4 * blurCanvas.width * ((blurCanvas.height / working_height) - 1);

		var x = 0;
		var z = 0;
		var index = 0;
		var blurIndex = 0;

		for ( z = 0; z < working_height; z++ ) {
			for ( x = 0; x < working_width; x++ ) {

				var landAlpha = 255 - workingPixels[index];
				var oceanAlpha = blurPixels[blurIndex];

				workingPixels[index]     = colorCoast_R;
				workingPixels[index + 1] = colorCoast_G;
				workingPixels[index + 2] = colorCoast_B;
				workingPixels[index + 3] = landAlpha < oceanAlpha ? landAlpha : oceanAlpha;

				index += 4;
				blurIndex += blurPixelXInc;
			}
			blurIndex += blurPixelYInc;
		}
		workingImage_Context.putImageData( workingImageData, 0, 0);

		// Scale the processed ocean down to the same size as the mapImage, and
		// overlay it onto the paper texture of mapImage
		var mapBackgroundCopy_Canvas = cloneCanvas(map_Image);
		var mapBackgroundCopy_Context = mapBackgroundCopy_Canvas.getContext("2d");

		mapBackgroundCopy_Context.drawImage(
			workingImage,
			0,
			0,
			working_width,
			working_height,
			dest_x,
			dest_z,
			dest_width,
			dest_height
		);

		return ApplyMapEdgesToCanvas(mapBackgroundCopy_Canvas, map_Image, 1, 0);
	}

	// Returns a canvas that's a copy of transformedOceanMask_Canvas, either at the same size as transformedOceanMask_Canvas, or at
	// the size of the map background image (dest_width, dest_height), depending on whether config.HardCoastlines is set.
	// transformedOceanMask_Canvas should be oversampled by cWorkingCanvasOversample, but if HardCoastlines is set then we want pixels
	// in the final map background to be either land or ocean - rather than the combination of several land and several ocean pixels, so
	// by returning a working canvas that won't be scaled when copied onto the map background we can enable hard pixelated coastlines.
	//
	// Parameters:
	//   transformedOceanMask_Context - oceanMask that has been cropped and translated so it can be copied straight into the map background image
	//   dest_width, dest_height - the size of the eventual destination map background image.
	function CreateWorkingCanvas(config, transformedOceanMask_Canvas, dest_width, dest_height) {

		if (transformedOceanMask_Canvas.width % dest_width != 0 || transformedOceanMask_Canvas.height % dest_height != 0 || transformedOceanMask_Canvas.width / dest_width != cWorkingCanvasOversample) {
			// Assert this here, if it fails then the logic for stepping through image data (in later code) will not be reliable.
			// (transformedOceanMask_Canvas.width divided by dest_width should exactly equal cWorkingCanvasOversample)
			alert("CreateWorkingCanvas called with transformedOceanMask_Canvas size not a multiple of output size");
		}

		var result = document.createElement('canvas');

		if (config.HardCoastlines) {

			result.width  = dest_width;
			result.height = dest_height;
			var context = result.getContext('2d');

			context.drawImage(
				transformedOceanMask_Canvas,
				0,
				0,
				transformedOceanMask_Canvas.width,
				transformedOceanMask_Canvas.height,
				0,
				0,
				dest_width,
				dest_height
			);
		} else {
			result = cloneCanvas(transformedOceanMask_Canvas);
		}
		return result;
	}


	// Returns a new canvas where interior_Canvas fades out into the edges defined by map_Image
	function ApplyMapEdgesToCanvas(interior_Canvas: HTMLCanvasElement, map_Image: HTMLCanvasElement, edgeFadeStart?: number, edgeFadeDistance?: number, edgeFadeAlpha?: number): HTMLCanvasElement {

		if (edgeFadeStart    === undefined) edgeFadeStart    = 2;
		if (edgeFadeDistance === undefined) edgeFadeDistance = 4;
		if (edgeFadeAlpha    === undefined) edgeFadeAlpha    = 0;

		var mapBorders_Canvas = cloneCanvas(map_Image);
		var mapBorders_Context = mapBorders_Canvas.getContext("2d");
		var mapBordersData = mapBorders_Context.getImageData(0, 0, mapBorders_Canvas.width, mapBorders_Canvas.height);
		var mapBordersPixels = mapBordersData.data;

		var interior_Context = interior_Canvas.getContext("2d");
		var interiorData = interior_Context.getImageData(0, 0, interior_Canvas.width, interior_Canvas.height);
		var interiorPixels = interiorData.data;

		// Calculate a table of alpha values for how interior_Canvas should fade into map_Image at the edges
		var edgeFadeTable = new Array(mapBorders_Canvas.width);
		var i = 0;
		for (i = 0; i < edgeFadeTable.length; i++ ) edgeFadeTable[i] = 255;
		for (i = 0; i < edgeFadeStart; i++ ) {
			edgeFadeTable[i] = edgeFadeAlpha;
			edgeFadeTable[edgeFadeTable.length - (i + 1)] = edgeFadeAlpha;
		}
		for (i = 0; i < edgeFadeDistance; i++ ) {
			var alpha = edgeFadeAlpha + Math.round(((255 - edgeFadeAlpha) * (i + 1)) / (edgeFadeDistance + 1));

			edgeFadeTable[i + edgeFadeStart] = alpha;
			edgeFadeTable[edgeFadeTable.length - (i + 1 + edgeFadeStart)] = alpha;
		}

		var x = 0;
		var z = 0;
		var index = 0;
		var foundBorder = false;
		var border_R, border_G, border_B;

		for ( z = 0; z < mapBorders_Canvas.height; z++ ) {

			var edgeFade_z = edgeFadeTable[z]; // Like a lot of this code, assumes the map_Image is square

			for ( x = 0; x < mapBorders_Canvas.width; x++ ) {

				if (mapBordersPixels[index + 3] == 0) {
					// mapBordersPixels is transparent - i.e. beyond the tattered edge of the map
					// Don't show the interior either.
					interiorPixels[index + 3] = 0;

				} else if (foundBorder) {

					if (mapBordersPixels[index] == border_R && mapBordersPixels[index + 1] == border_G && mapBordersPixels[index + 2] == border_B) {
						// Show only the border from map_Image
						interiorPixels[index + 3] = 0;

					} else {
						// make the interior map transparent near the edges.
						var edgeFade_x = edgeFadeTable[x];
						var edgeFade = edgeFade_x < edgeFade_z ? edgeFade_x : edgeFade_z;
						interiorPixels[index + 3] = edgeFade;
					}
				} else {
					// This is the first non-transparent pixel in map_Image, assume it
					// to be the border colour.
					foundBorder = true;
					border_R = mapBordersPixels[index];
					border_G = mapBordersPixels[index + 1];
					border_B = mapBordersPixels[index + 2];

					// Show only the border from map_Image
					interiorPixels[index + 3] = 0;
				}
				index += 4;
			}
		}
		interior_Context.putImageData(interiorData, 0, 0);

		mapBorders_Context.drawImage(interior_Canvas, 0, 0);
		return mapBorders_Canvas;
	}
}
