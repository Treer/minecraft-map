/********************************************
 Javascript map drawing functions.

 Copyright 2014 Glenn Fisher

 This is not a standalone file, it is part of minecraftmap.pp.js
****/


// zoomLevelNumber indicates which level of zoom we are creating the map for. 0 is the most zoomed
// out map, 1 is the first level of zooming in, etc.
function createMapImageInDiv(zoomLevelNumber, divElementName, aWidth, aHeight, config, locations, finishedCallback) {

	var canvas = document.createElement('canvas');
	canvas.width = aWidth;
	canvas.height = aHeight;

	var labellingStyle;

	if (zoomLevelNumber < config.HideLabelsAbove) {
		labellingStyle = LabellingStyle.none;
	} else if (zoomLevelNumber >= config.ShowLabelsBelow) {
		labellingStyle = LabellingStyle.all;	
	} else {
		labellingStyle = LabellingStyle.smart;
	}
	
	drawMapDetails(canvas, config, locations, labellingStyle);	
	var areaMapId = CreateAreaMapInDiv(divElementName, aWidth, aHeight, config, locations);
	
	// Set the image's display style to block so that it doesn't default to vertically aligning
	// to the font baseline and leaving 4 pixels of space underneath - that screws up the drag size calculation.
	var newImage = $(document.createElement('img')).css('display', 'block')[0];	
	
	// assigning to newImage.src (even from canvas.toDataURL()) doesn't always update the width and height before 
	// returning, so we have to defer until the onload event has fired to avoid race condition. (I sure hope onload 
	// can be relied upon in all browsers).
	var deferUntilImageLoaded = $.Deferred();	
	newImage.onload = function() { deferUntilImageLoaded.resolve(); }	
	
	newImage.src = canvas.toDataURL("image/png");
	newImage.useMap = '#' + areaMapId;	
	
	var divElement = document.getElementById(divElementName);
	$(newImage).appendTo(divElement);
	
	// finishedCallback is called once this function has finished AND newImage was updated.
	$.when(deferUntilImageLoaded).done(finishedCallback);
}

// returns the name of the map
 function CreateAreaMapInDiv(divElementName, aWidth, aHeight, config, locations){

	var result = divElementName + '-areamap';

	var mapSize = aWidth > aHeight ? aWidth : aHeight;
	
	var translateCoord_x = config.GetXTranslationFunction(mapSize);
	var translateCoord_z = config.GetZTranslationFunction(mapSize);
	
	var newmap = document.createElement('map')
	newmap.name = result;

	// Start at the top of the list (index = 0), as the first area
	// elements we add appear to occlude later areas we add - in 
	// Firefox at least. And we want higher locations in the list to 
	// have higher priority.	
	var index;
	for (index = 0; index < locations.length; ++index) {
	
		var location = locations[index];
		var hrefAndTarget = location.getHrefAndTarget();
		var includeArea = false;

		var newArea = document.createElement('area');

		if (!isEmpty(hrefAndTarget.href)) {
			newArea.href = hrefAndTarget.href;
			newArea.target = hrefAndTarget.target;
			includeArea = true;
		}
		
		var htmlString = generateHtmlLabel(
			location, 
			config.ShowCoordinates && !config.DisableCoordinates
		);
		if (htmlString.length > 0) {
			$(newArea).mouseover(CreateHandler_mouseover(htmlString));
			$(newArea).mouseout(Handle_mouseout);
			includeArea = true;
		}
		
		if (includeArea) {		
			newArea.shape = 'circle';
			newArea.coords = [translateCoord_x(location.x), translateCoord_z(location.z), cClickRadius * gLocationIconScale];
			newArea.alt = location.getAlt();
		
			$(newArea).appendTo(newmap);
		}
	}
	$(newmap).appendTo(document.getElementById(divElementName));
	
	return result;
}


function CreateHandler_mouseover(htmlLabel) {
	// Creates a closure so the event handler keeps a reference to the label
	return function(eventObject) { 
		$("#locationDesc").empty();
		$("#locationDesc").append(htmlLabel);
		$("#hoverFrame").removeClass('hidden-hoverFrame');
	}
}

function Handle_mouseout(eventObject) {
	$("#hoverFrame").addClass('hidden-hoverFrame');
	$("#locationDesc").empty();
}

function generateHtmlLabel(location, includeCoordinates)
{
	var result = "";

	var label = location.getLabel();
	if (isNotEmptyString(label)) label = strToHtml(trim(label));

	var owner = location.owner.text;
	if (isNotEmptyString(owner)) owner = strToHtml(trim(owner));

	var ownerPos = isNotEmptyString(owner) ? label.indexOf(owner) : -1;	
	var htmlOwner = '<span class="locationHoverOwner">' + owner + '</span>';
	var showOwner = true;
	
	if (isNotEmptyString(label) && label != owner) {
	
		var htmlLabel = label;
		if (ownerPos >= 0) {
			// The location label contains the owner, mark-up the owner name portion of the label
			htmlLabel = 
				label.substring(0, ownerPos) + 
				htmlOwner +
				label.substring(ownerPos + owner.length);	
			showOwner = false; // Owner is already shown
		}
		htmlLabel = '<span class="locationHoverPlacename">' + htmlLabel + '</span>';
	
		result = htmlLabel;
		if (isNotEmptyString(owner) && showOwner) {
			result += '<br/>';		
		}
	}
	if (isNotEmptyString(owner) && showOwner) result += htmlOwner;		

	if (isNotEmptyString(result) && includeCoordinates) {
		result += '<span class="locationHoverCoordinates"><br/>' + location.x + ', ' + location.z + '</span>';
	}
	if (isNotEmptyString(result) && isNotEmptyString(location.getHrefAndTarget(true).href)) {
		result += '<div style="height: 11px"><img src="img/link.png" height="7" style="vertical-align: middle"></div>';
	}
	
	
	return result;
}

function strToHtml(str) {
	return str.replace("\n", " ").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
}


// if labellingStyle is set LabellingStyle.none then no captions will be rendered.
function drawMapDetails(canvas, config, locations, labellingStyle)
{
	var cTextLineHeight = 10 * gLocationFontScale;

	var ctx = canvas.getContext("2d");
	var mapSize = canvas.width > canvas.height ? canvas.width : canvas.height;
	var halfMapSize = mapSize / 2;

	var tilesImage = document.getElementById('map-tileset');
	
	var translateCoord_x = config.GetXTranslationFunction(mapSize);
	var translateCoord_z = config.GetZTranslationFunction(mapSize);
	
	var occupiedSpace = []; // an array of Rectangles representing where to not draw labels	
	
	function splitIntoLines(text) {
		return text.split(/\r\n|\n|\r/);
	}
	
	// Returns an array of bounding boxes for the multiline-centered label of a location
	function locationLabel_bounds(locationInstance, finalizedCaption, pixelOffsetFromLocation_y) {
	
		var boundsAtOrigin;
		if ('BoundsAtOrigin' in locationInstance) {
			boundsAtOrigin = locationInstance.BoundsAtOrigin; // It's already been calculated (assumes finalizedCaption doesn't change)
		} else {
			// It hasn't been calculated yet, so do that now.
			// We cache it from a position 0, 0 because the actual translation will
			// change depending on the zoom level.
			// (I'm caching it because I assume that determining graphical text width is slow - could be wrong, need to test)
			boundsAtOrigin = multilineCenteredText_bounds(0, pixelOffsetFromLocation_y, finalizedCaption, 1);
			locationInstance.BoundsAtOrigin = boundsAtOrigin; // cache it
		}
		
		var result = [];
		var i;
		for(i = 0; i < boundsAtOrigin.length; i++) {
			result[i] = boundsAtOrigin[i].copy(translateCoord_x(locationInstance.x), translateCoord_z(locationInstance.z));
		}
		
		return result;
	}
	
	// returns an array of bounding Rectangle instances that enclose the text which
	// would be rendered by multilineCenteredText_draw()
	function multilineCenteredText_bounds(x, y, text, padding) {
	
		var result = [];
		if (!(padding < 0) && !(padding > 0)) padding = 0;

		if (!isEmpty(text)) {
			
			var textOffset = 1 * gLocationFontScale; // a starting offset of 1 is better by eye than 0, dunno if it's due to font, browser, or canvas
			var lines = splitIntoLines(text);
			var lineNo;
			for(lineNo = 0; lineNo < lines.length; lineNo++) {
			
				var lineWidth = ctx.measureText(lines[lineNo]).width;
				var leftTrim_lineWidth = ctx.measureText(trimLeft(lines[lineNo])).width;
				var rightTrim_lineWidth = ctx.measureText(trimRight(lines[lineNo])).width;
				var leftMargin = lineWidth - leftTrim_lineWidth;
				var rightMargin = lineWidth - rightTrim_lineWidth;
				var bound_x = x - (lineWidth - 1) / 2;
				var bound_y = y + textOffset;
				
				result[lineNo] = new Rectangle(
					bound_x + leftMargin - padding,
					bound_y - cTextLineHeight - padding,
					bound_x + (lineWidth - 1) - rightMargin + padding,
					bound_y + padding
				);
				textOffset += cTextLineHeight;
			}
		}
		return result;
	}
	
	function multilineCenteredText_draw(x, y, text) {

		var textOffset = 0;
		
		if (!isEmpty(text)) {
			var lines = splitIntoLines(text);
			var lineNo;
			for(lineNo = 0; lineNo < lines.length; lineNo++) {
			
				// y value for filltext is the baseline of the text
				ctx.fillText(
					lines[lineNo], 
					x - (ctx.measureText(lines[lineNo]).width / 2),
					y + textOffset
				);
				textOffset += cTextLineHeight;
			}
		}
	}

	// returns the IconBoundsInformation for the specified icon, or width/height/offset
	// information of 0 if there is no icon.
	function getIconBoundsHint(iconIndex) {
		
		var result;
		
		if (isNaN(iconIndex) || iconIndex < 0) {
			result = {width: 0, height: 0, yOffset: 0, pixelArt: true};			
		} else {	
			var iconBounds = IconBoundsInformation[iconIndex];
			if (iconBounds === undefined) {
				// The icon is not specified in IconBoundsInformation array, use default values
				result = {width: 20, height: 20, yOffset: 0, pixelArt: true};			
			} else {
				// Clone it if we are scaling it so we don't screw up the IconBoundsInformation 
				// array when we scale the result
				result = (gLocationIconScale == 1) ? iconBounds : {
					width:    iconBounds.width,
					height:   iconBounds.height,
					yOffset:  iconBounds.yOffset,
					pixelArt: iconBounds.pixelArt
				};
			}
		}
		result.width   *= gLocationIconScale;
		result.height  *= gLocationIconScale;
		result.yOffset *= gLocationIconScale;
		return result;
	}
	
	// Returns an array of Rectangle, which will be empty if the
	// index indicates no icon, or if the IconBoundsInformation 
	// indicates a 0 width or 0 height.
	function icon_bounds(index, x, z, margin) {
		// most icons fit in 20x20
		// todo: hardcode any exceptions
		var result = [];
		
		if (isNaN(index) || index < 0) {
			// no icon
		} else {
			var iconBoundsHint = getIconBoundsHint(index);
			if (iconBoundsHint.width != 0 && iconBoundsHint.height != 0) {
				var topLeft_x = x - iconBoundsHint.width / 2;
				var topLeft_z = z + iconBoundsHint.yOffset - iconBoundsHint.height / 2;
				result[0] = new Rectangle(
					topLeft_x, 
					topLeft_z, 
					topLeft_x + iconBoundsHint.width - 1,
					topLeft_z + iconBoundsHint.height - 1
				);
			}
		}
		
		return result;
	}
	
	
	function icon_draw(index, drawMask, x, z) {
	
		if (!isNaN(index) && index >= 0) {
		
			if (index >= cCustomIconIndexStart) {
				// it's a custom icon				
				if (gCustomIconsLoaded) {
					drawGlyph(ctx, gCustomIcons, index - cCustomIconIndexStart, true, drawMask, x, z);			
				}				
			} else {			
				drawGlyph(ctx, tilesImage, index, IconBoundsInformation[index].pixelArt, drawMask, x, z);			
			}
		}
	}
	
	// Adjust this to adjust which pass the different map parts are rendered in
	var RenderLayer = {
		Masks:            0,
		Origin:           1,    
		Captions:         2,
		UncaptionedIcons: 3,
		CaptionedIcons:   4,
		Scale:            5,
		
		First:            0,
		Last:             5
	}
			
	function drawLocation(locationInstance, renderLayer) {
			
		var text = "";
		var location_x = translateCoord_x(locationInstance.x);
		var location_z = translateCoord_z(locationInstance.z);

		// don't show icons within 1/128th of the border (each map pixel is 1/64, so we're not showing icons closer than half a map pixel from the border).
		var clipLimit = Math.max(mapSize / 128, 8 * gLocationIconScale);
		if (location_x > clipLimit && location_z > clipLimit && location_x < (mapSize - clipLimit) && location_z < (mapSize - clipLimit)) {
				
			// Use labelOverride instead of getLabel so that default labels will be dropped (the icon will be enough)
			if (isEmpty(locationInstance.labelOverride.text) || locationInstance.labelOverride.suppress) {
				if (!isEmpty(locationInstance.owner.text) && !locationInstance.owner.suppress) text += locationInstance.owner.text;
			} else {
				text += locationInstance.labelOverride.text;
			}
			
			if (!isEmpty(locationInstance.owner.text) && (text.indexOf(locationInstance.owner.text) == -1) && !locationInstance.owner.suppress) {
				// The owner was specified, and is not named in the description, add in brackets at the bottom
				text += '\n(' + locationInstance.owner.text + ')';
			}

			if (!isEmpty(text) && renderLayer == RenderLayer.Captions && labellingStyle != LabellingStyle.none) {
			
				var iconIndex = locationInstance.getIconIndex();
				
				var textOffset;
				if (isNaN(iconIndex) || iconIndex < 0) {
					// Put the text where the icon would be. Text is 6px to 8px high, so add half of that
					textOffset = 3 * gLocationFontScale; 
				} else {
					var boundsInfo = getIconBoundsHint(iconIndex);
					textOffset = (cCaptionSpacer_vertical * gLocationFontScale) + boundsInfo.yOffset + (boundsInfo.height / 2);
				}
			
				var drawLabel = true;
				var drawLabelRegardless = locationInstance.labelOverride.always || locationInstance.owner.always;
				
				if (labellingStyle == LabellingStyle.smart) {			
					// check the space needed by the label isn't already occupied
					var boundingboxes = locationLabel_bounds(locationInstance, text, textOffset);

					var boxIndex
					for(boxIndex = 0; boxIndex < boundingboxes.length; boxIndex++) {
					
						var box = boundingboxes[boxIndex];
						var	i;
						for(i = 0; i < occupiedSpace.length; i++) {
							if (box.intersects(occupiedSpace[i])) {
								// a label or icon already occupies this space
								
								// make sure it's not the bounding box of our own icon that we collided with
								var ourIconBounds = icon_bounds(locationInstance.getIconIndex(), location_x, location_z, 0);
								if (ourIconBounds.length == 0 || !ourIconBounds[0].equals(occupiedSpace[i])) {							
									drawLabel = false;
									break;
								}
							}
						}
						if (!drawLabel) break;
					}
					if (drawLabel || drawLabelRegardless) {
						// Add the space taken by this label to occupiedSpace
						occupiedSpace = occupiedSpace.concat(boundingboxes);
					}				
				}
					
				if (drawLabel || drawLabelRegardless) { 
					multilineCenteredText_draw(location_x, location_z + textOffset, text);
				}
				
				if (cShowBoundingBoxes) {
					// debug code for showing bounding boxes
					ctx.lineWidth = 1;
					ctx.strokeStyle="#0000FF";
					var boxes = locationLabel_bounds(locationInstance, text);
					var i;
					for(i = 0; i < boxes.length; i++) {
						boxes[i].stroke(ctx);
					}
				}
			}
			
			if (renderLayer == RenderLayer.Masks) {		
				icon_draw(locationInstance.getIconIndex(), true, location_x, location_z);
			}

			if (isEmpty(text)) {
				if (renderLayer == RenderLayer.UncaptionedIcons) {		
					icon_draw(locationInstance.getIconIndex(), false, location_x, location_z);
				}
			} else {
				if (renderLayer == RenderLayer.CaptionedIcons) {		
					icon_draw(locationInstance.getIconIndex(), false, location_x, location_z);
				}		
			}
		}
	}
	
	function drawOrigin() {
		var crosshairSize = 8 * gLocationIconScale;
		var originX = Math.round(translateCoord_x(0));
		var originZ = Math.round(translateCoord_z(0));
			
		ctx.lineWidth = 2 * gLocationIconScale;
		ctx.strokeStyle="#6e5830";
		ctx.moveTo(originX, originZ - crosshairSize);
		ctx.lineTo(originX, originZ + crosshairSize);
		ctx.moveTo(originX - crosshairSize, originZ);
		ctx.lineTo(originX + crosshairSize, originZ);
		ctx.stroke();
	}
	
	function drawScale() {
		var pixelsInBackground = $('#map-background').width();
		var blockDistance = (config.MapRange * 2) / pixelsInBackground;
		var blockDistance_str = Math.round(blockDistance).toString();
		var blockSize = canvas.width / pixelsInBackground;
		var scaleLength_bl = 5; // with cMapRangeDefault of 6400 and a map-background resolution of 64, 5 blocks is a nice visual size and also gives a nice round 1km 
		var scaleStartX = Math.round(6 * blockSize);
		var scaleStartY = Math.round(($('#map-background').height() - 6) * blockSize);
		var notchHeight = Math.round(blockSize * 0.4);

		ctx.lineWidth = 2 * gLocationFontScale;
		ctx.strokeStyle="#6e5830";
		ctx.moveTo(scaleStartX, scaleStartY);
		ctx.lineTo(scaleStartX + Math.round(blockSize * scaleLength_bl), scaleStartY);
		ctx.lineTo(scaleStartX + Math.round(blockSize * scaleLength_bl), scaleStartY + notchHeight);
		ctx.moveTo(scaleStartX, scaleStartY - notchHeight);
		ctx.lineTo(scaleStartX, scaleStartY + notchHeight);
		ctx.moveTo(scaleStartX + Math.round(blockSize), scaleStartY - notchHeight);
		ctx.lineTo(scaleStartX + Math.round(blockSize), scaleStartY);
		ctx.stroke();

		var text_y1 = scaleStartY - notchHeight - 4;
		var text_y2 = scaleStartY + notchHeight + cTextLineHeight;
		multilineCenteredText_draw(scaleStartX + blockSize, text_y1, blockDistance_str);		
		multilineCenteredText_draw(scaleStartX, text_y2, '0');
		multilineCenteredText_draw(scaleStartX + blockSize * scaleLength_bl, text_y2, Math.round(blockDistance * scaleLength_bl).toString());
	}

	var mapBackground = document.getElementById('map-background');	
	
	// Make the paper-background scaling pixelated on as many browsers as possible (to match Minecraft's artistic direction)
	setCanvasScalingToPixelated(ctx);
	ctx.drawImage(
		mapBackground,
		0, 0,
		canvas.width, canvas.height);

	// prefil the occupiedSpace array with boxes indicating where graphics are.
	ctx.lineWidth = 1;
	ctx.strokeStyle="#FF00FF";
	var i;
	for (i = 0; i < locations.length; i++) {
		var locationInstance = locations[i];
		var bounds = icon_bounds(locationInstance.getIconIndex(), translateCoord_x(locationInstance.x), translateCoord_z(locationInstance.z), 0);
		if (bounds.length > 0) {
			occupiedSpace[occupiedSpace.length] = bounds[0];
			if (cShowBoundingBoxes) bounds[0].stroke(ctx); // debug code for showing bounding boxes			
		}
	}	

		
	ctx.font = cTextLineHeight + "px Arial";
	ctx.font = cTextLineHeight + "px 'Merienda', Arial, sans-serif";	
	if (gLocationFontScale > 1) ctx.fillStyle = '#553A24'; // At a scale of 1, text is so thin it's better to leave the color as black. Otherwise dark brown.
	
	var renderLayer;
	for (renderLayer = RenderLayer.First; renderLayer <= RenderLayer.Last; renderLayer++) {
	
		if (renderLayer == RenderLayer.Origin) {
			if (config.ShowOrigin) drawOrigin();
			
		} else if (renderLayer == RenderLayer.Scale) {
			if (config.ShowScale)  drawScale();

		} else if (renderLayer == RenderLayer.Captions) {		
			// Labels are rendered first to last, so that with smart-labels, locations 
			// higher in the list reserve their label space first.
			var index;
			for (index = 0; index < locations.length; index++) {
				drawLocation(locations[index], renderLayer);
			}	
		} else {	
			// Render last to first, so that locations higher in the list are drawn 
			// over the top of locations lower in the list
			var index;
			for (index = locations.length - 1; index >= 0; index--) {
				drawLocation(locations[index], renderLayer);
			}	
		}
	}
}

function setCanvasScalingToPixelated(ctx, makePixelated) {

	if (makePixelated === undefined) makePixelated = true;

	// Make the paper-background scaling pixelated on as many browsers as possible (to match Minecraft's artistic direction)
	ctx.mozImageSmoothingEnabled = !makePixelated;
	ctx.webkitImageSmoothingEnabled = !makePixelated;
	ctx.msImageSmoothingEnabled = !makePixelated;
	ctx.imageSmoothingEnabled = !makePixelated;
}

// Put any rendering tasks in here that should be performed only once (instead
// of being performed for every zoom level)
function PreRender(config) {
	
	if (gOceanMapImage != null) {
		// An oceanmask has been provided, render a new map-background with
		// it instead of using the default one.
	
		var mapBackgroundImage = document.getElementById('map-background');

		var newMapBackgroundCanvas = renderOcean(
			config,
			mapBackgroundImage,
			gOceanMapImage
		);		
		mapBackgroundImage.src = newMapBackgroundCanvas.toDataURL("image/png");
	}	
}


// Assumes tiles are square, arranged beside each other in the tileImage left to right in two 
// rows (top row icons, bottom row masks) and should be drawn centered.
// This means user can change size of icons just by changing the images the tiles are in.
//
// tilesImage: an img element
// drawMask: if True, the icon mask will be drawn (i.e. the bottom row)
function drawGlyph(canvasContext, tilesImage, tileIndex, isPixelArt, drawMask, x, y) {

	var width = tilesImage.height / 2;
	var halfDestWidth = (width / 2) * gLocationIconScale;

	
	if (gLocationIconScale != 1) {
		// Icon is being scaled, determine which way to scale it
		setCanvasScalingToPixelated(canvasContext, isPixelArt && !drawMask);
	}
	
	canvasContext.drawImage(
		tilesImage,
		tileIndex * width,
		drawMask ? width : 0,
		width,
		width,
		x - halfDestWidth,
		y - halfDestWidth,
		width * gLocationIconScale,
		width * gLocationIconScale
	);
}
