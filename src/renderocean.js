/********************************************
 renders a new map-background (if an oceanmap has been provided)

 Copyright 2014 Glenn Fisher

 This is not a standalone file, it is part of minecraftmap.pp.js
****/

var cOceanBlocksPerPixel     = 16; // scale of the oceanMaskImage
var cWorkingCanvasOversample = 4;  // the "workingCanvas" should be much smaller than the ocean mask to save processing time, but is still detailed enough to scale down to map-background size afterwards without visible aliasing.	
var cColor_Black             = new RGB(0, 0, 0);
var cColor_White             = new RGB(255, 255, 255);


function renderOcean(config, mapImage, oceanMaskImage) {

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
	workingContext = workingCanvas.getContext("2d");
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
	
	var blurCanvas = cloneCanvas(transformedOceanMask_Canvas);		
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
		
	stackBlurCanvasRGB( blurCanvas, 0, 0, transformedOceanMask_Canvas.width, transformedOceanMask_Canvas.height, blurRadius );

	var working_width  = transformedOceanMask_Canvas.width;
	var working_height = transformedOceanMask_Canvas.height;
	var workingImage_Context = transformedOceanMask_Canvas.getContext("2d");

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

		var shade = i / 255.0;
		
		// A shade of 0 means coastline (cColor_BlueCoast + cColor_ShallowCoast)
		// A shade of 255 means ocean (cColor_lightOcean)
		
		color = cColor_BlueCoast.Blend(cColor_lightOcean, shade);
		// lets make the shading a little non-linear
		if (shade <= 0.6) color = color.Blend(cColor_ShallowCoast, (0.6 - shade));

		colorTable_R[i] = color.R;
		colorTable_G[i] = color.G;
		colorTable_B[i] = color.B;
	}
	var colorLand_R = cColor_Land.R, colorLand_G = cColor_Land.G, colorLand_B = cColor_Land.B; // avoid using classes, for speed.
	
	
	var x = 0;
	var z = 0;
	var index = 0;
	
	for ( z = 0; z < working_height; z++ ) {
		for ( x = 0; x < working_width; x++ ) {
						
			// the blurPixels value of the tip of peninsulas (for a range 3200 map) sometimes gets as low as 80, 
			// and we want the value as high as we can get away with to eliminate small islands, as they turn 
			// the map parchment texture to noise, but still keep the larger land masses. Looks like the sweet 
			// spot is between 70 to 80.
			//			
			// 75 is perfect for a map range of 3200. But doesn't work well for a map range of 5000 etc, because
			// of this we have changed the blurRadius using blurScale - now 75 should be perfect for all ranges.			
			var isLand = workingPixels[index] > 128 && blurPixels[index] > 75; 
						
			var alpha;
			if (isLand) {
				// land
				alpha = cAlpha_Land;			
				
				workingPixels[index]     = colorLand_R;
				workingPixels[index + 1] = colorLand_G;
				workingPixels[index + 2] = colorLand_B;		
				
				//alpha = 255;	
				//workingPixels[index]     = 255;
				//workingPixels[index + 2] = blurPixels[index] > 75 ? 0 : 255;
			} else {
				// ocean
				var oceanDepth = (255 - blurPixels[index]) / 255.0; // 0 to 1, 1 is deep, 0 is shallow
				alpha = Math.round(cAlpha_Ocean * (1 - oceanDepth) + cAlpha_DeepOcean * oceanDepth); // chooses an alpha value between cAlpha_Ocean and cAlpha_DeepOcean, depending on oceanDepth
				
				// After blurring the black ocean-mask with the white land-mask, dark areas in blurPixels[] 
				// means deep ocean, calculate a tableIndex where 0 is coast and 255 is deep ocean.
				// (workingPixels[] is white for land, black for ocean, and grey for both)
				var tableIndex = Math.round((255 - blurPixels[index]) * 0.7);
				if (tableIndex > 255) tableIndex = 255;
				if (tableIndex < 0)   tableIndex = 0;
				
				workingPixels[index]     = colorTable_R[tableIndex];
				workingPixels[index + 1] = colorTable_G[tableIndex];
				workingPixels[index + 2] = colorTable_B[tableIndex];		
			}						
			workingPixels[index + 3] = alpha;
			
			index += 4;
		}
	}
	workingImage_Context.putImageData( workingImageData, 0, 0);	

	// Scale the processed ocean down to the same size as the mapImage, and
	// overlay it onto the paper texture of mapImage
	var mapBackgroundCopy_Canvas = cloneCanvas(map_Image);
	var mapBackgroundCopy_Context = mapBackgroundCopy_Canvas.getContext("2d");
	
	mapBackgroundCopy_Context.drawImage(
		transformedOceanMask_Canvas, // we've updated transformedOceanMask_Canvas with putImageData()
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
	
	var blurCanvas = cloneCanvas(transformedOceanMask_Canvas);		
	var blurRadius = Math.round(cWorkingCanvasOversample * map_Image.width / 8); // about 8 blocks on the final map		
	stackBlurCanvasRGB( blurCanvas, 0, 0, transformedOceanMask_Canvas.width, transformedOceanMask_Canvas.height, blurRadius );

	var working_width  = transformedOceanMask_Canvas.width;
	var working_height = transformedOceanMask_Canvas.height;
	var workingImage_Context = transformedOceanMask_Canvas.getContext("2d");

	var blurPixels = blurCanvas.getContext("2d").getImageData(0, 0, blurCanvas.width, blurCanvas.height).data;
	var workingImageData = workingImage_Context.getImageData(0, 0, working_width, working_height);
	var workingPixels = workingImageData.data;	
	
	var colorLand_R = cColor_Land.R, colorLand_G = cColor_Land.G, colorLand_B = cColor_Land.B; // avoid using classes, for speed.
	var colorOcean_R = cColor_Ocean.R, colorOcean_G = cColor_Ocean.G, colorOcean_B = cColor_Ocean.B; // avoid using classes, for speed.
	
	
	var x = 0;
	var z = 0;
	var index = 0;
	
	for ( z = 0; z < working_height; z++ ) {
		for ( x = 0; x < working_width; x++ ) {
						
			var alpha;
			if (workingPixels[index] > 200) {
				// land
				alpha = cAlpha_Land;			
				
				workingPixels[index]     = colorLand_R;
				workingPixels[index + 1] = colorLand_G;
				workingPixels[index + 2] = colorLand_B;
			} else {
				// ocean
				alpha = Math.round(blurPixels[index] * (cAlpha_Ocean - cAlphaFloor_Ocean) / 255.0) + cAlphaFloor_Ocean;							
				
				workingPixels[index]     = colorOcean_R;
				workingPixels[index + 1] = colorOcean_G;
				workingPixels[index + 2] = colorOcean_B;
			}
						
			workingPixels[index + 3] = alpha;
			
			index += 4;
		}
	}
	workingImage_Context.putImageData( workingImageData, 0, 0);	

	// Scale the processed ocean down to the same size as the mapImage, and
	// overlay it onto the paper texture of mapImage
	var mapBackgroundCopy_Canvas = cloneCanvas(map_Image);
	var mapBackgroundCopy_Context = mapBackgroundCopy_Canvas.getContext("2d");
	
	mapBackgroundCopy_Context.drawImage(
		transformedOceanMask_Canvas, // we've updated transformedOceanMask_Canvas with putImageData()
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
	
	var blurCanvas = cloneCanvas(transformedOceanMask_Canvas);		
	var blurRadius = Math.round(cWorkingCanvasOversample * map_Image.width / 20); // about 3 blocks on the final map		
	stackBlurCanvasRGB( blurCanvas, 0, 0, transformedOceanMask_Canvas.width, transformedOceanMask_Canvas.height, blurRadius );

	var working_width  = transformedOceanMask_Canvas.width;
	var working_height = transformedOceanMask_Canvas.height;
	var workingImage_Context = transformedOceanMask_Canvas.getContext("2d");

	var blurPixels = blurCanvas.getContext("2d").getImageData(0, 0, blurCanvas.width, blurCanvas.height).data;
	var workingImageData = workingImage_Context.getImageData(0, 0, working_width, working_height);
	var workingPixels = workingImageData.data;	
	
	var colorCoast_R = cColor_Coastline.R, colorCoast_G = cColor_Coastline.G, colorCoast_B = cColor_Coastline.B; // avoid using classes, for speed.
	
	var x = 0;
	var z = 0;
	var index = 0;
	
	for ( z = 0; z < working_height; z++ ) {
		for ( x = 0; x < working_width; x++ ) {
											
			var landAlpha = 255 - workingPixels[index];
			var oceanAlpha = blurPixels[index];
								
			workingPixels[index]     = colorCoast_R;
			workingPixels[index + 1] = colorCoast_G;
			workingPixels[index + 2] = colorCoast_B;
			workingPixels[index + 3] = landAlpha < oceanAlpha ? landAlpha : oceanAlpha;
			
			index += 4;
		}
	}
	workingImage_Context.putImageData( workingImageData, 0, 0);	

	// Scale the processed ocean down to the same size as the mapImage, and
	// overlay it onto the paper texture of mapImage
	var mapBackgroundCopy_Canvas = cloneCanvas(map_Image);
	var mapBackgroundCopy_Context = mapBackgroundCopy_Canvas.getContext("2d");
	
	mapBackgroundCopy_Context.drawImage(
		transformedOceanMask_Canvas, // we've updated transformedOceanMask_Canvas with putImageData()
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



// Returns a new canvas where interior_Canvas fades out into the edges defined by map_Image
function ApplyMapEdgesToCanvas(interior_Canvas, map_Image, edgeFadeStart, edgeFadeDistance, edgeFadeAlpha) {

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


// ===========================
// functions that could be split off into a helpers_graphics.js file
// ===========================

// Constructor
// alapha is optional 
function RGB(red, green, blue, alpha) {
	this.R = red;
	this.G = green;
	this.B = blue;
	this.A = (alpha === undefined) ? 255 : alpha;
}

// weight is a value between 0 and 1 which indicate how the result is 
// split between the instance and the colour provided as a parameter 
// (1 = 100% the colour provided as a parameter)
RGB.prototype.Blend = function(color_rgb, weight) {
	
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
RGB.prototype.MatchesRGB = function(red, green, blue) {
	return red == this.R && green == this.G && blue == this.B;
}

// Returns true if the colour components match, regardless of alpha
RGB.prototype.Matches = function(color_rgb) {
	return (color_rgb instanceof RGB) && color_rgb.R == this.R && color_rgb.G == this.G && color_rgb.B == this.B;
}


function cloneCanvas(oldCanvasOrImage) {
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


