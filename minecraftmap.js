var cClickRadius = 12;   // How far from the center of the icon is clickable
var cMapRange    = 6000; // measured in minecraft blocks from the center
var cTextOffset  = 14;   // How far under the center of the icon should the text be drawn
var cCustomIconIndexStart = 32; // IconIndexes with this value or higher should be loaded from gCustomIcons
var gCustomIcons = new Image();
var gCustomIconsLoaded = false;

var gXOffset     = 0;    // Sets the x coord for the center of the map
var gZOffset     = 0;    // Sets the z coord for the center of the map


/*

var gLocationInfo = parseURL(location);


// Set any constants specified by the URL (instead of using the default value)
if ('range' in gLocationInfo.params) {	
	cMapRange = gLocationInfo.params.range;
}

// if "title" is specified on the URL then relabel the page
if ('title' in gLocationInfo.params  && isString(gLocationInfo.params.title)) {
	$("#mainTitle").text(decodeURIComponent(gLocationInfo.params.title));
	document.title = gLocationInfo.params.title;
}	

// if "blurb" is specified on the URL then change the tag line
if ('blurb' in gLocationInfo.params  && isString(gLocationInfo.params.blurb)) {
	$("#tagline").text(decodeURIComponent(gLocationInfo.params.blurb));
}	

// if "x" is specified on the URL then change the center of the map
if ('x' in gLocationInfo.params) {
	var new_x = parseInt(gLocationInfo.params.x);
	if (!isNaN(new_x)) gXOffset = new_x
}

// if "z" is specified on the URL then change the center of the map
if ('z' in gLocationInfo.params) {
	var new_z = parseInt(gLocationInfo.params.z);
	if (!isNaN(new_z)) gZOffset = new_z
}	
*/

// Code snippet
function isEmpty(str) {
    return (!str || 0 === str.length);
}

// Code snippet
function isString(str) {
	return (typeof str == 'string' || str instanceof String);
}

// Code snippet
function isFunction(item) {
	return is("Function", item);
}

// Code snippet (http://james.padolsey.com/javascript/parsing-urls-with-the-dom/)
// 
// This function creates a new anchor element and uses location
// properties (inherent) to get the desired URL data. Some String
// operations are used (to normalize results across browsers). 
//
// Usage:
//   var myURL = parseURL('http://abc.com:8080/dir/index.html?id=255&m=hello#top');
//   gives: 
//     myURL.file;     // = 'index.html'
//     myURL.hash;     // = 'top'
//     myURL.host;     // = 'abc.com'
//     myURL.query;    // = '?id=255&m=hello'
//     myURL.params;   // = Object = { id: 255, m: hello }
//     myURL.path;     // = '/dir/index.html'
//     myURL.segments; // = Array = ['dir', 'index.html']
//     myURL.port;     // = '8080'
//     myURL.protocol; // = 'http'
//     myURL.source;   // = 'http://abc.com:8080/dir/index.html?id=255&m=hello#top'
function parseURL(url) {
    var a =  document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':',''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function(){
            var ret = {},
                seg = a.search.replace(/^\?/,'').split('&'),
                len = seg.length, i = 0, s;
            for (;i<len;i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
        hash: a.hash.replace('#',''),
        path: a.pathname.replace(/^([^\/])/,'/$1'),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
        segments: a.pathname.replace(/^\//,'').split('/')
    };
}


var LocationType = {
  Village:         {iconIndex: 0, name: "Village",        href: "http://minecraft.gamepedia.com/Village"}, 
  DesertVillage:   {iconIndex: 1, name: "Desert village", href: "http://minecraft.gamepedia.com/Village"}, 
  JungleTemple:    {iconIndex: 2, name: "Jungle temple",  href: "http://minecraft.gamepedia.com/Jungle_temple"},
  DesertTemple:    {iconIndex: 3, name: "Desert temple",  href: "http://minecraft.gamepedia.com/Desert_temple"},
  WitchHut:        {iconIndex: 4, name: "Witch's hut",    href: "http://minecraft.gamepedia.com/Generated_structures#Witch_Huts"},
  NetherPortal:    {iconIndex: 5, name: "Portal",         href: "http://minecraft.gamepedia.com/Nether_Portal"},
  
  Forest:          {iconIndex: 6, name: "Forest",         href: "http://minecraft.gamepedia.com/Biome#Forest"},
  
  Spawn:           {iconIndex: 7, name: "Spawn", href: ""},
  PlayerStructure: {iconIndex: 8, name: "",      href: ""},  
  Label:           {iconIndex: -1, name: "",      href: ""}  
};


// Object constructor functions
// ----------------------------

function MapConfiguration() {

	// Leave fields undefined unless specifically set (or call SetDefaults())
}

MapConfiguration.prototype.SetDefaults = function() {

	// MapDataUri has no default - it MUST be set from the "src" param on the URL.
	if (!('LabelsLevel'    in this)) this.LabelsLevel = 0;
	if (!('MapRange'       in this)) this.MapRange = cMapRange;
	if (!('Title'          in this)) this.Title = 'Map of the Overworld';
	if (!('Blurb'          in this)) this.Blurb = 'Use up/down or mousewheel to zoom, drag to scroll';
	if (!('CustomIconsUri' in this)) this.CustomIconsUri = '';
	if (!('X'              in this)) this.X = 0;
	if (!('Z'              in this)) this.Z = 0;
}

MapConfiguration.prototype.AssignFrom = function(sourceConfig) {

	if ('MapDataUri'     in sourceConfig) this.MapDataUri     = sourceConfig.MapDataUri;
	if ('LabelsLevel'    in sourceConfig) this.LabelsLevel    = sourceConfig.LabelsLevel;
	if ('MapRange'       in sourceConfig) this.MapRange       = sourceConfig.MapRange;
	if ('Title'          in sourceConfig) this.Title          = sourceConfig.Title;
	if ('Blurb'          in sourceConfig) this.Blurb          = sourceConfig.Blurb;
	if ('CustomIconsUri' in sourceConfig) this.CustomIconsUri = sourceConfig.CustomIconsUri;
	if ('X'              in sourceConfig) this.X              = sourceConfig.X;
	if ('Z'              in sourceConfig) this.Z              = sourceConfig.Z;
}

MapConfiguration.prototype.GetXTranslationFunction = function(mapSize) {
	var halfMapSize = mapSize / 2;
	var mapX = this.X;
	var mapRange = this.MapRange;
	
	return function(coord) {
		// this closure syntax doesn't work, fix it
		return ((coord - mapX) * halfMapSize / mapRange) + halfMapSize;
	}
}

MapConfiguration.prototype.GetZTranslationFunction = function(mapSize) {
	var halfMapSize = mapSize / 2;
	var mapZ = this.Z;
	var mapRange = this.MapRange;

	return function(coord) {
		// this closure syntax doesn't work, fix it
		return ((coord - mapZ) * halfMapSize / mapRange) + halfMapSize;
	}
}

MapConfiguration.prototype.AssignFromRow = function(rowString) {

	var posEquals = rowString.indexOf('=');
	if (posEquals > 0) {
		var key = rowString.substring(0, posEquals).trim().toLowerCase();
		var value = rowString.slice(posEquals + 1).trim();
		
		if (key == 'z') {
			var new_z = parseInt(value);
			if (!isNaN(new_z)) this.Z = new_z;
		}
		if (key == 'x') {
			var new_x = parseInt(value);
			if (!isNaN(new_x)) this.X = new_x;
		}
		if (key == 'labelslevel') {
			var new_LabelsLevel = parseInt(value);
			if (!isNaN(new_LabelsLevel)) this.LabelsLevel = new_LabelsLevel;
		}
		if (key == 'maprange') {
			var new_MapRange = parseInt(value);
			if (!isNaN(new_MapRange)) this.MapRange = new_MapRange;
		}
		if (key == 'title' && isString(value)) {
			this.Title = unquoteString(value);
		}
		if (key == 'blurb' && isString(value)) {
			this.Blurb = unquoteString(value);
		}
		if (key == 'icons' && isString(value)) {
			this.CustomIconsUri = unquoteString(value);
		}
	}
}

// x, z: coords in Minecraft.
// Type: should be an element of LocationType
function Location (x, z, type, description, owner, href, iconIndex) {
    this.x = x;
    this.z = z;
	this.type = type;
	this.labelOverride = description;
	this.hrefOverride = href;
	this.iconIndexOverride = iconIndex;
	this.owner = owner;
}

Location.prototype.getHref = function() {
    return isEmpty(this.hrefOverride) ? this.type.href : this.hrefOverride;
};

Location.prototype.getLabel = function() {
    return isEmpty(this.labelOverride) ? this.type.name : this.labelOverride;
};

Location.prototype.getIconIndex = function() {
    return (isNaN(this.iconIndexOverride) || this.iconIndexOverride < 0) ? this.type.iconIndex : this.iconIndexOverride;
};

Location.prototype.getAlt = function() {

    var result = this.getLabel();	
	if (isEmpty(result) && !isEmpty(this.owner)) result = this.owner;

    return result;
};

// -----------------------------
 

// Format for commaSeperatedValues:
//   type, x, z, "description", "owner", "href", iconIndex
//
// The first 3 values are required, and determine whether a location
// will be returned.
function createLocationFromRow(commaSeperatedValues) {
	
	var result = null;
	
	var values = commaSeperatedValues.split(',');
	
	var i = 0;
	for(i = 0; i < values.length; i++) {
		values[i] = values[i].trim();
	}		
	// The wiki treats camelcase words like "PlayerStructure" as wikiwords and 
	// puts a questionmark after them so remove any trailing questionmark, and 
	// also try unquoting it incase the wikipage editors put some in.
	var typeName = unquoteString(values[0]);
	if (typeName[typeName.length - 1] == '?') typeName = typeName.substring(0, typeName.length - 1);
			
	if (typeName in LocationType) {
		var new_type      = LocationType[typeName];
		var new_x         = parseInt(values[1]);
		var new_z         = parseInt(values[2]);
		var new_iconIndex = parseInt(values[6]);		
		
		if (!isNaN(new_x) && !isNaN(new_z)) {
			// type and coords check out, can return a real location.
			result = new Location(new_x, new_z, new_type, unquoteString(values[3]), unquoteString(values[4]), unquoteString(values[5]), new_iconIndex);			
		}
	}
	return result;
}
 
// Strings may be surrounded in doublequotes (") to allow leading or trailing 
// whitespace and inclusion of newlines etc, if they are then the quotes are 
// removed and the string is parsed into a string
function unquoteString(str) {
	
	var result = str;
	
	if (isString(str) && str.length >= 2) {
		if (str[0] == '"' && str[str.length - 1] == '"') {
			var parsedStr = jQuery.parseJSON( '{"value":' + str + '}' );
			result = parsedStr.value;
		}	
	}
	return result;
}
 
function parseTextLocations(data, callback) {

	var config = new MapConfiguration();
	var locationList = [];

	lines = data.split('\n');
	var i = 0;
	for(i = 0; i < lines.length; i++) {
		var newLocation = createLocationFromRow(lines[i]);	
		if (newLocation instanceof Location) {
			locationList.push(newLocation);		
		} else {
			config.AssignFromRow(lines[i]);
		}
	}
	callback(config, locationList);
}

function parseHtmlLocations(data, callback) {
	
	var config = new MapConfiguration();
	var locationList = [];
	
	var htmlDom = jQuery.parseHTML( data );
	
	// scrape any locations contained in tables
	$(htmlDom).find('tr').each(
		function() {
	
			var rowString = "";
		
			$(this).find('td').each(
				function() {
					rowString += this.textContent + ',';
				}
			);
			
			var newLocation = createLocationFromRow(rowString);	
			if (newLocation instanceof Location) {
				locationList.push(newLocation);					
			} else {
				config.AssignFromRow(rowString);
			}
		}
	);

	// scrape any locations contained in unordered lists and ordered lists
	$(htmlDom).find('ul, ol').each(
		function() {
			$(this).find('li').each(
				function() {			
					var newLocation = createLocationFromRow(this.textContent);	
					if (newLocation instanceof Location) {
						locationList.push(newLocation);
					} else {
						config.AssignFromRow(this.textContent);
					}
				}
			);			
		}
	);
	
	callback(config, locationList);
}
 
// callback will be given two arguments - a dictionary of settings and an array of Location instances
function getSettingsAndMapLocations(callback) {

	var configFromUrl = getConfigurationFromUrl();
	
	if ('MapDataUri' in configFromUrl) {
		getMapDataAndLocationsFromUrl(
			configFromUrl.MapDataUri,  
			function(configFromAjax, locationsFromAjax) {
			
				var mapConfig = new MapConfiguration();
				mapConfig.SetDefaults();
				mapConfig.AssignFrom(configFromUrl);
				mapConfig.AssignFrom(configFromAjax);
				
				ApplyMapConfiguration(mapConfig);
				
				if (!isEmpty(mapConfig.CustomIconsUri)) {
					// Load the custom icons
					
					// I'm getting the impression there is no reliable way to wait for
					// an image to load, see caveats in http://api.jquery.com/load-event/		
					// If that's the case then custom icons won't work on browsers with broken
					// onload event.
					$(gCustomIcons).bind({
						load: function() {
							gCustomIconsLoaded = true;		
							callback(mapConfig, locationsFromAjax);
						},
						error: function() {
							// Image didn't load, probably a 404
							callback(mapConfig, locationsFromAjax);
						}
					});		
					gCustomIcons.src = gLocationInfo.params.icons;
					
				} else {	
					callback(mapConfig, locationsFromAjax);
				}
			}
		);
	} else {
		alert('no "src=" url was specified to scrape the location data from.');
	}	
	
	function ApplyMapConfiguration(config) {

		gXOffset = config.X;
		gZOffset = config.Z;
				
		document.title = config.Title;
		$("#mainTitle").text(config.Title);
		$("#tagline").text(config.blurb);
	}	

		
	function getMapDataAndLocationsFromUrl(dataUrl, callback) {
		if (isString(dataUrl)) {	
			var dataTypeIsText = dataUrl.match(/\.txt$|\.csv$/); // Assume HTML unless the dataUrl ends in .txt or .csv
					
			$.ajax({
				 url: dataUrl,
				 dataType: (dataTypeIsText ? 'text' : 'html'),
				 success: function(data, textStatus, jqXHR) {
					if (dataTypeIsText) {
						parseTextLocations(data, callback);
					} else {
						parseHtmlLocations(data, callback);
					}
				 },
				 error:function(jqXHR, textStatus, errorThrown){
					alert('Failed to load locations from src "' + dataUrl + '", something went wrong: ' + textStatus + ', ' + errorThrown);
				}
			});
					
		} else {
			alert('Internal error: dataUrl not string');
		}	
	}
	

	function getConfigurationFromUrl() {
	
		var result = new MapConfiguration();

		var locationInfo = parseURL(location);
		
		// if "labelslevel" is specified on the URL, then only display labels when
		// the map is zoomed in more levels than the value of labelslevel.
		// i.e. 0 means always show labels, while 2 means don't show labels unless zoomed twice or more.
		if ('labelslevel' in locationInfo.params) {
			result.LabelsLevel = locationInfo.params.labelslevel;
		}	

		// Set any constants specified by the URL (instead of using the default value)
		if ('range' in locationInfo.params) {	
			result.MapRange = locationInfo.params.range;
		}

		// if "title" is specified on the URL then relabel the page
		if ('title' in locationInfo.params  && isString(locationInfo.params.title)) {
			$("#mainTitle").text(decodeURIComponent(locationInfo.params.title));
			result.Title = locationInfo.params.title;
		}	

		// if "blurb" is specified on the URL then change the tag line
		if ('blurb' in locationInfo.params  && isString(locationInfo.params.blurb)) {
			result.Blurb = decodeURIComponent(locationInfo.params.blurb);
		}	
		
		// if "icons" is specified on the URL then set the CustomIconsUri to load the images.
		if ('icons' in locationInfo.params && isString(locationInfo.params.icons)) {
			result.CustomIconsUri = locationInfo.params.icons;
		}

		// if "x" is specified on the URL then change the center of the map
		if ('x' in locationInfo.params) {
			var new_x = parseInt(locationInfo.params.x);
			if (!isNaN(new_x)) result.X = new_x
		}

		// if "z" is specified on the URL then change the center of the map
		if ('z' in locationInfo.params) {
			var new_z = parseInt(locationInfo.params.z);
			if (!isNaN(new_z)) result.Z = new_z
		}	
		
		if ('src' in locationInfo.params && isString(locationInfo.params.src)) {		
			result.MapDataUri = decodeURIComponent(locationInfo.params.src);
		}
		
		return result;
	}
}
 
 /*
// callback will be given one argument - an array of Location instances
function getMapLocations(callback) {
	
	if ('icons' in gLocationInfo.params && isString(gLocationInfo.params.icons) && !gCustomIconsLoaded) {
		// Load the custom icons

		// I'm getting the impression there is no reliable way to wait for
		// an image to load, see caveats in http://api.jquery.com/load-event/		
		// If that's the case then custom icons won't work on browsers with broken
		// onload event.
		$(gCustomIcons).bind({
			load: function() {
				gCustomIconsLoaded = true;			
				continueGetMapLocations(callback);
			},
			error: function() {
				// Image didn't load, probably a 404
				continueGetMapLocations(callback);
			}
		});		
		gCustomIcons.src = gLocationInfo.params.icons;
		
	} else {	
		continueGetMapLocations(callback);
	}
	
	
	function continueGetMapLocations(callback) {
		if ('src' in gLocationInfo.params && isString(gLocationInfo.params.src)) {	
			var dataUrl = decodeURIComponent(gLocationInfo.params.src);
			var dataTypeIsText = dataUrl.match(/\.txt$|\.csv$/); // Assume HTML unless the dataUrl ends in .txt or .csv
					
			$.ajax({
				 url: dataUrl,
				 dataType: (dataTypeIsText ? 'text' : 'html'),
				 success: function(data, textStatus, jqXHR) {
					if (dataTypeIsText) {
						parseTextLocations(data, callback);
					} else {
						parseHtmlLocations(data, callback);
					}
				 },
				 error:function(jqXHR, textStatus, errorThrown){
					alert('Failed to load locations from src "' + dataUrl + '", something went wrong: ' + textStatus + ', ' + errorThrown);
				}
			});
					
		} else {
			alert('no "src=" url was specified to scrape the location data from.');
		}	
	}
}
*/

function drawMapDetails(canvas, config, locations, iconsOnly)
{
	var ctx = canvas.getContext("2d");
	var mapSize = canvas.width > canvas.height ? canvas.width : canvas.height;
	var halfMapSize = mapSize / 2;

	var tilesImage = document.getElementById('map-tileset');
	
	var translateCoord_x = config.GetXTranslationFunction(mapSize);
	var translateCoord_z = config.GetZTranslationFunction(mapSize);
	/*	
	function translateCoord_x(coord)
	{
		return ((coord - gXOffset) * halfMapSize / cMapRange) + halfMapSize;
	}

	function translateCoord_z(coord)
	{
		return ((coord - gZOffset) * halfMapSize / cMapRange) + halfMapSize;
	}*/
	
	function drawMultilineCenteredText(x, y, text) {

		var textOffset = 0;
		
		if (!isEmpty(text) && !iconsOnly) {
			var lines = text.split(/\r\n|\n|\r/);;
			var lineNo;
			for(lineNo = 0; lineNo < lines.length; lineNo++) {
			
				// y value for filltext is the baseline of the text
				ctx.fillText(
					lines[lineNo], 
					x - (ctx.measureText(lines[lineNo]).width / 2),
					y + textOffset
				);
				textOffset += 9;
			}
		}
	}

	function drawIcon(index, drawMask, x, z) {
	
		if (!isNaN(index) && index >= 0) {
		
			if (index >= cCustomIconIndexStart) {
				// it's a custom icon				
				if (gCustomIconsLoaded) {
					drawGlyph(ctx, gCustomIcons, index - cCustomIconIndexStart, drawMask, translateCoord_x(x), translateCoord_z(z));			
				}				
			} else {			
				drawGlyph(ctx, tilesImage, index, drawMask, translateCoord_x(x), translateCoord_z(z));			
			}
		}
	}
	
	// Adjust this to adjust which pass the different map parts are rendered in
	var RenderLayer = {
		Masks:            0,
		Captions:         1,
		UncaptionedIcons: 2,
		CaptionedIcons:   3,
		
		First:            0,
		Last:             3
	}
		
	
	
	function drawLocation(locationInstance, renderLayer) {
			
		var text = "";

		// Use labelOverride instead of getLabel so that default labels will be dropped (the icon will be enough)
		if (isEmpty(locationInstance.labelOverride)) {
			if (!isEmpty(locationInstance.owner)) text += locationInstance.owner;
		} else {
			text += locationInstance.labelOverride;
		}
		
		if (!isEmpty(locationInstance.owner) && text.indexOf(locationInstance.owner) == -1) {
			// The owner was specified, and is not named in the description, add in brackets at the bottom
			text += '\n(' + locationInstance.owner + ')';
		}

		if (!isEmpty(text) && renderLayer == RenderLayer.Captions) {
		
			var iconIndex = locationInstance.getIconIndex();
			var textOffset = cTextOffset;
			if (isNaN(iconIndex) || iconIndex < 0) textOffset = 3; // Put the text where the icon would be. Text is 6px to 8px high, so add half of that
		
			drawMultilineCenteredText(translateCoord_x(locationInstance.x), translateCoord_z(locationInstance.z) + textOffset, text);
		}
		
		if (renderLayer == RenderLayer.Masks) {		
			drawIcon(locationInstance.getIconIndex(), true, locationInstance.x, locationInstance.z);
		}

		if (isEmpty(text)) {
			if (renderLayer == RenderLayer.UncaptionedIcons) {		
				drawIcon(locationInstance.getIconIndex(), false, locationInstance.x, locationInstance.z);
			}
		} else {
			if (renderLayer == RenderLayer.CaptionedIcons) {		
				drawIcon(locationInstance.getIconIndex(), false, locationInstance.x, locationInstance.z);
			}		
		}
		
	}

	// Make the paper-background scaling pixelated on as many browsers as possible (to match Minecraft's artistic direction)
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
	
	ctx.drawImage(
		document.getElementById('map-background'),
		0, 0,
		canvas.width, canvas.height);
		
	var crosshairSize = 10;
	var originX = translateCoord_x(0);
	var originZ = translateCoord_z(0);
		
	ctx.moveTo(originX, originZ - crosshairSize);
	ctx.lineTo(originX, originZ + crosshairSize);
	ctx.stroke();
	ctx.moveTo(originX - crosshairSize, originZ);
	ctx.lineTo(originX + crosshairSize, originZ);
	ctx.stroke();

	ctx.font = "10px Arial";

	var renderLayer;
	for (renderLayer = RenderLayer.First; renderLayer <= RenderLayer.Last; renderLayer++) {
	
		var index;
		for (index = 0; index < locations.length; ++index) {

			drawLocation(locations[index], renderLayer);
		}	
	}
}

function createMapImageInDiv(divElementName, aWidth, aHeight, config, locations, iconsOnly) {

	var canvas = document.createElement('canvas');
	canvas.width = aWidth;
	canvas.height = aHeight;
	
	drawMapDetails(canvas, config, locations, iconsOnly);	
	var areaMapId = CreateAreaMapInDiv(divElementName, aWidth, aHeight, locations);
	
	var newImage = document.createElement('img');
	newImage.src = canvas.toDataURL("image/png");
	newImage.useMap = '#' + areaMapId;
	$(newImage).appendTo(document.getElementById(divElementName));
}

// returns the name of the map
 function CreateAreaMapInDiv(divElementName, aWidth, aHeight, locations){

	var result = divElementName + '-areamap';

	var mapSize = aWidth > aHeight ? aWidth : aHeight;
	var halfMapSize = mapSize / 2;

	function translateCoord_x(coord)
	{
		return ((coord - gXOffset) * halfMapSize / cMapRange) + halfMapSize;
	}

	function translateCoord_z(coord)
	{
		return ((coord - gZOffset) * halfMapSize / cMapRange) + halfMapSize;
	}
	
	var newmap = document.createElement('map')
	newmap.name = result;

	var index;
	for (index = 0; index < locations.length; ++index) {
	
		var location = locations[index];
		var href = location.getHref();

		if (!isEmpty(href)) {
		
			var newArea = document.createElement('area');
			newArea.shape = 'circle';
			newArea.coords = [translateCoord_x(location.x), translateCoord_z(location.z), cClickRadius];
			newArea.href = href;
			newArea.alt = location.getAlt();
			
			$(newArea).appendTo(newmap);
		}
	}
	$(newmap).appendTo(document.getElementById(divElementName));
	
	return result;
}

// Assumes tiles are square, arranged beside each other in the tileImage left to right in two 
// rows (top row icons, bottom row masks) and should be drawn centered.
// This means user can change size of icons just by changing the images the tiles are in.
function drawGlyph(canvasContext, tilesImage, tileIndex, drawMask, x, y) {

	var width = tilesImage.height / 2;
	var halfWidth = width / 2;

	canvasContext.drawImage(
		tilesImage,
		tileIndex * width,
		drawMask ? width : 0,
		width,
		width,
		x - halfWidth,
		y - halfWidth,
		width,
		width
	);
}

