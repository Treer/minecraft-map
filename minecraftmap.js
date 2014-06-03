// v1.5
//
// Copyright 2014 Glenn Fisher
//
// While in development, I'm making this file GPL v3 licence until I 
// get time to sort out licensing properly. Note that other files in 
// this project have their own licence.
//
// (bitcoin 1BcjNaumW41vZSJUkeSw2GVFcB6DFsuCB1)

var cMapRangeDefault    = 3200; // measured in minecraft blocks from the center. (Since the map we use for the background is 64 pixels wide, a range of 3200 gives map squares of a nice round scale of 100)
var cClickRadius        = 12;   // How far from the center of the icon is clickable
var cTextOffset         = 14;   // How far under the center of the icon should the text be drawn
var cSuppressLabelsChar = '~'; // The tilde is illegal in a Minecraft name, so should make a good character to enclose labels with.

var cCustomIconIndexStart = 64; // IconIndexes with this value or higher should be loaded from gCustomIcons
var gCustomIcons = new Image();
var gCustomIconsLoaded = false;


// ---------------------------------------------
// Javascript helper functions for type checking.
function isEmpty(str) {
    return (!str || 0 === str.length);
}

function isString(str) {
	return (typeof str == 'string' || str instanceof String);
}

function isNotEmptyString(str) {
	return (typeof str == 'string' || str instanceof String) && str.length > 0;
}

function isFunction(item) {
	return is("Function", item);
}
// ---------------------------------------------


function stringToBool(value){
	switch(value.trim().toLowerCase()){
		case "true": 
		case "yes": 
		case "1": 
			return true;
		case "false": 
		case "no": 
		case "0": 
		case null: 
			return false;
		default: 
			return Boolean(string);
	}
}

// Code snippet (from http://james.padolsey.com/javascript/parsing-urls-with-the-dom/)
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
  Village:         {iconIndex:  0, name: "Village",         href: "http://minecraft.gamepedia.com/Village#Plains"}, 
  DesertVillage:   {iconIndex:  1, name: "Desert village",  href: "http://minecraft.gamepedia.com/Village#Desert"}, 
  SavannahVillage: {iconIndex:  0, name: "Desert village",  href: "http://minecraft.gamepedia.com/Village#Savannah"}, 
  WitchHut:        {iconIndex:  3, name: "Witch's hut",     href: "http://minecraft.gamepedia.com/Generated_structures#Witch_Huts"},
  JungleTemple:    {iconIndex:  4, name: "Jungle temple",   href: "http://minecraft.gamepedia.com/Jungle_temple"},
  DesertTemple:    {iconIndex:  5, name: "Desert temple",   href: "http://minecraft.gamepedia.com/Desert_temple"},
  NetherFortress:  {iconIndex:  6, name: "Nether Fortress", href: "http://minecraft.gamepedia.com/Nether_Fortress"},
  NetherPortal:    {iconIndex:  7, name: "Portal",          href: "http://minecraft.gamepedia.com/Nether_Portal"},
  
  Forest:          {iconIndex: 19, name: "Forest",          href: "http://minecraft.gamepedia.com/Biome#Forest"},
  FlowerForest:    {iconIndex: 19, name: "Flower forest",   href: "http://minecraft.gamepedia.com/Flower_forest"},
  MushroomIsland:  {iconIndex: 20, name: "Mushroom island", href: "http://minecraft.gamepedia.com/Mushroom_Island"},
  Horse:           {iconIndex: 24, name: "",                href: "http://minecraft.gamepedia.com/Horse"},
  Wolf:            {iconIndex: 25, name: "",                href: "http://minecraft.gamepedia.com/Wolf"},
  Dragon:          {iconIndex: 26, name: "",                href: ""}, // No default href as dragon symbol could be used for many things, stronghold, "Here be dragons" etc
  Ship:            {iconIndex: 32, name: "",                href: ""}, // No default href as ship is probably used for map decoration
	// island
  
  Spawn:           {iconIndex: 27, name: "Spawn", href: ""},
  PlayerStructure: {iconIndex: 8,  name: "",      href: ""},  
  PlayerCastle:    {iconIndex: 9,  name: "",      href: ""},  
  PlayerHouse:     {iconIndex: 10, name: "",      href: ""},  
  PlayerFarm:      {iconIndex:  8, name: "Farm",  href: ""},  
  PlayerMachine:   {iconIndex:  8, name: "",      href: ""},  
  EnchantingRoom:  {iconIndex: 30, name: "",      href: "http://minecraft.gamepedia.com/Enchantment_Table"}, 
  Label:           {iconIndex: -1, name: "",      href: ""}  
};


var LabellingStyle = {
  none:  0, // draw no labels (labelslevel >= zoom level)
  smart: 1, // draw only the labels that have room, in order of importance (labelslevel < zoom level <= alllabelslevel)
  all:   2  // draw all labels (zoom level > alllabelslevel)
}

// Object constructor functions
// ----------------------------

// Constructor
function MapConfiguration() {
	// Leave fields undefined unless specifically set (or call SetDefaults())
}


// screenWidth and screenHeight are optional parameters - provide them if you have them
// and they will be used to pick a sensible default for LabelsLevel.
MapConfiguration.prototype.SetDefaults = function(screenWidth, screenHeight) {

	var labelsLevelDefault = 0;
	if (screenWidth > 0 || screenHeight > 0) {
		// small or tiny viewports will have labelslevel set to 1 instead of 0, as
		// they don't have room for captions at the most zoomed out level.
		labelsLevelDefault = (head.screen.height < 800 || head.screen.height < 800) ? 1 : 0;
	}

	// MapDataUri has no default - it MUST be set from the "src" param on the URL.
	if (!('LabelsLevel'     in this)) this.LabelsLevel = labelsLevelDefault;
	if (!('AllLabelsLevel'  in this)) this.AllLabelsLevel = 3; // The levels in between LabelsLevel & AllLabelsLevel will use smartlabels
	if (!('MapRange'        in this)) this.MapRange = cMapRangeDefault;
	if (!('Title'           in this)) this.Title = 'Map of the Overworld';
	if (!('Blurb'           in this)) this.Blurb = 'Use up/down or mousewheel to zoom, drag to scroll';
	if (!('CustomIconsUri'  in this)) this.CustomIconsUri = '';
	if (!('X'               in this)) this.X = 0;
	if (!('Z'               in this)) this.Z = 0;
	if (!('ShowOrigin'      in this)) this.ShowOrigin = true;
	if (!('ShowScale'       in this)) this.ShowScale = true;
	if (!('ShowCoordinates' in this)) this.ShowCoordinates = false;
}

MapConfiguration.prototype.AssignFrom = function(sourceConfig) {
	
	if ('MapDataUri'      in sourceConfig) this.MapDataUri      = sourceConfig.MapDataUri;
	if ('LabelsLevel'     in sourceConfig) this.LabelsLevel     = sourceConfig.LabelsLevel;
	if ('AllLabelsLevel'  in sourceConfig) this.AllLabelsLevel  = sourceConfig.AllLabelsLevel;
	if ('MapRange'        in sourceConfig) this.MapRange        = sourceConfig.MapRange;
	if ('Title'           in sourceConfig) this.Title           = sourceConfig.Title;
	if ('Blurb'           in sourceConfig) this.Blurb           = sourceConfig.Blurb;
	if ('CustomIconsUri'  in sourceConfig) this.CustomIconsUri  = sourceConfig.CustomIconsUri;
	if ('X'               in sourceConfig) this.X               = sourceConfig.X;
	if ('Z'               in sourceConfig) this.Z               = sourceConfig.Z;
	if ('ShowOrigin'      in sourceConfig) this.ShowOrigin      = sourceConfig.ShowOrigin;
	if ('ShowScale'       in sourceConfig) this.ShowScale       = sourceConfig.ShowScale;
	if ('ShowCoordinates' in sourceConfig) this.ShowCoordinates = sourceConfig.ShowCoordinates;	
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
		if (key == 'range') {
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
		if (key == 'showorigin' && isString(value)) {
			this.ShowOrigin = stringToBool(value);
		}
		if (key == 'showscale' && isString(value)) {
			this.ShowScale = stringToBool(value);
		}
		if (key == 'notchgavesteveacompassnotagps' && isString(value)) {
			this.ShowCoordinates = !stringToBool(value);
		}		
	}
}

// Returns a function that converts Minecraft coordinates into canvas coordinates
MapConfiguration.prototype.GetXTranslationFunction = function(mapSize) {

	var halfMapSize = mapSize / 2;
	// the closure won't automatically keep a reference to 'this' so take a copy.
	var mapX = this.X;
	var mapRange = this.MapRange;
	
	return function(coord) {
		return ((coord - mapX) * halfMapSize / mapRange) + halfMapSize;
	}
}

// Returns a function that converts Minecraft coordinates into canvas coordinates
MapConfiguration.prototype.GetZTranslationFunction = function(mapSize) {

	var halfMapSize = mapSize / 2;
	// the closure won't automatically keep a reference to 'this' so take a copy.
	var mapZ = this.Z;
	var mapRange = this.MapRange;

	return function(coord) {
		return ((coord - mapZ) * halfMapSize / mapRange) + halfMapSize;
	}
}

// -----------------------------

// Constructor
// text: the text of the label. 
// suppress: a boolean indicating whether the text should be suppressed from the 
//           map rendering (only shown on hover etc.)
function SuppressableLabel(text, suppress) {
	this.text = text;
	this.suppress = suppress;
}

SuppressableLabel.prototype.toString = function() {
	return this.text;
}

// Parses "suppression-marked-up" text and returns a SuppressableLabel.
// If 'markedupLabel' is surrounded by cSuppressLabelsChars (~), then
// they are removed and suppress is set to true.
SuppressableLabel.parse = function(markedupLabel) {

	var result = new SuppressableLabel(markedupLabel, false);

	if (isString(markedupLabel)) {
		var trimLabelStr = markedupLabel.trim();
		if (trimLabelStr.length >= 2 && trimLabelStr[0] == cSuppressLabelsChar && trimLabelStr[trimLabelStr.length - 1] == cSuppressLabelsChar) {		
			result = new SuppressableLabel(trimLabelStr.substring(1, trimLabelStr.length - 1), true);
		}
	}	
	return result;
}

// -----------------------------


// Constructor
// x, z: coords in Minecraft.
// Type: should be an element of LocationType
function Location (x, z, type, description, owner, href, iconIndex) {
    this.x = x;
    this.z = z;
	this.type = type;
	this.labelOverride = SuppressableLabel.parse(description);
	this.hrefOverride = href;
	this.iconIndexOverride = iconIndex;
	this.owner = SuppressableLabel.parse(owner);	
}

Location.prototype.getHref = function() {
    return isEmpty(this.hrefOverride) ? this.type.href : this.hrefOverride;
};

Location.prototype.getLabel = function() {
    return isEmpty(this.labelOverride.text) ? this.type.name : this.labelOverride.text;
};

Location.prototype.getIconIndex = function() {
    return (isNaN(this.iconIndexOverride) || this.iconIndexOverride < 0) ? this.type.iconIndex : this.iconIndexOverride;
};

Location.prototype.getAlt = function() {

    var result = this.getLabel();	
	if (isEmpty(result) && !isEmpty(this.owner.text)) result = this.owner.text;

    return result;
};

// -----------------------------


// Constructor
function Rectangle(x1, y1, x2, y2) {
	this.x1 = Math.min(x1, x2);
	this.y1 = Math.min(y1, y2);
	this.x2 = Math.max(x1, x2);
	this.y2 = Math.max(y1, y2);
	this.width  = 1 + x2 - x1;
	this.height = 1 + y2 - y1;
}

// translate_x and translate_y are optional
Rectangle.prototype.stroke = function(canvasContext, translate_x, translate_y) {
	if(translate_x === undefined) translate_x = 0;
	if(translate_y === undefined) translate_y = 0;
	canvasContext.strokeRect(
		this.x1 + translate_x,
		this.y1 + translate_y,
		this.width,
		this.height
	);
}

// translate_x are translate_y optional
Rectangle.prototype.copy = function(translate_x, translate_y) {
	if(translate_x === undefined) translate_x = 0;
	if(translate_y === undefined) translate_y = 0;

	return new Rectangle(this.x1 + translate_x, this.y1 + translate_y, this.x2 + translate_x, this.y2 + translate_y);
}

// Returns true if the interior of this rectangle intersects with the interior of a supplied rectangle. 
// When they are just touching each other it's considered non-intersecting.
Rectangle.prototype.intersects = function(rectangle) {
	return (
		this.x2 > rectangle.x1 && 
		this.x1 < rectangle.x2 &&
		this.y2 > rectangle.y1 && 
		this.y1 < rectangle.y2
	);
}

Rectangle.prototype.equals = function(rectangle) {
	return (
		this.x1 == rectangle.x1 && 
		this.y1 == rectangle.y1 &&
		this.x2 == rectangle.x2 && 
		this.y2 == rectangle.y2
	);
}


// -----------------------------

 
// entryNumber is given to the user if there is an error parsing the entry
//
// Format for commaSeperatedValues:
//   type, x, z, "description, etc.", "owner", "href", iconIndex
//
// The first 3 values are required, and determine whether a location
// will be returned.
function createLocationFromRow(entryNumber, commaSeperatedValues) {
	
	var result = null;
	
	var values;
	try {
		CSV.DETECT_TYPES = false;
		CSV.TRIM_UNQUOTED_VALUES = true;	
		CSV.EXPAND_QUOTED_NEWLINES = true;
		values = CSV.parse(commaSeperatedValues)[0];
	} catch(err) {
		alert('Could not parse comma seperated values for entry/line ' + entryNumber.toString() + ': ' + err);
	}
	
	var typeName = values[0];
	
	// Wikis can treat camelcase words like "PlayerStructure" as wikiwords and 
	// put a questionmark after them so remove any trailing questionmark.
	if (typeName[typeName.length - 1] == '?') typeName = typeName.substring(0, typeName.length - 1);
			
	if (typeName in LocationType) {
		var new_type      = LocationType[typeName];
		var new_x         = parseInt(values[1]);
		var new_z         = parseInt(values[2]);
		var new_iconIndex = parseInt(values[6]);		
		
		if (!isNaN(new_x) && !isNaN(new_z)) {
			// type and co-ords check out, can return a real location.
			result = new Location(new_x, new_z, new_type, unquoteString(values[3]), unquoteString(values[4]), unquoteString(values[5]), new_iconIndex);			
		}
	}
	return result;
}
 
// Strings may be surrounded in double-quotes (") to allow leading or trailing 
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
		var newLocation = createLocationFromRow(i + 1, lines[i]);	
		if (newLocation instanceof Location) {
			locationList.push(newLocation);		
		} else {
			config.AssignFromRow(lines[i]);
		}
	}
	callback(config, locationList);
}

function parseHtmlLocations(data, callback) {
	
	function encodeForCsv(value) {
		// if value contains any quotemarks or commas and is not already quoted then 
		// wrap it in quotes so it can safely be concatenated csv-style		
		var result = value;
		
		var trimValue = value.trim();
		var isQuoted = trimValue.length >= 2 && trimValue[0] == '"' && trimValue[trimValue.length - 1] == '"';
		
		if (!isQuoted) {
			if (trimValue.indexOf(',') >= 0 || trimValue.indexOf('"') >= 0) {
				// This string needs to be quoted
				result = '"' + trimValue.replace(/"/g,'""') + '"';
			}		
		}	
		return result;
	}	
	
	var config = new MapConfiguration();
	var locationList = [];
	
	var htmlDom = jQuery.parseHTML( data );
	var entryNumber = 0;
	
	// scrape any locations contained in tables
	$(htmlDom).find('tr').each(
		function() {
	
			var rowString = "";
			entryNumber++;
		
			$(this).find('td').each(
				function() {
					rowString += encodeForCsv(this.textContent) + ',';
				}
			);
			
			var newLocation = createLocationFromRow(entryNumber, rowString);	
			if (newLocation instanceof Location) {
				locationList.push(newLocation);					
			} else {
				config.AssignFromRow(rowString);
			}
		}
	);

	// scrape any locations contained in unordered lists and ordered lists
	entryNumber = 0;
	$(htmlDom).find('ul, ol').each(
		function() {
			$(this).find('li').each(
				function() {
					entryNumber++;
					var newLocation = createLocationFromRow(entryNumber, this.textContent);	
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
function getSettingsAndMapLocations(screenWidth, screenHeight, callback) {

	var configFromUrl = getConfigurationFromUrl();
	
	if ('MapDataUri' in configFromUrl) {
		getMapDataAndLocationsFromUrl(
			configFromUrl.MapDataUri,  
			function(configFromAjax, locationsFromAjax) {
			
				var mapConfig = new MapConfiguration();
				mapConfig.SetDefaults(screenWidth, screenHeight);
				mapConfig.AssignFrom(configFromAjax);
				mapConfig.AssignFrom(configFromUrl);
				
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
					gCustomIcons.src = mapConfig.CustomIconsUri;
					
				} else {	
					callback(mapConfig, locationsFromAjax);
				}
			}
		);
	} else {
		alert('no "src=" url was specified to scrape the location data from.');
	}	
	
	function ApplyMapConfiguration(config) {

		document.title = config.Title;
		$("#mainTitle").text(config.Title);
		$("#tagline").text(config.Blurb);
	}	

		
	function getMapDataAndLocationsFromUrl(dataUrl, callback) {
		if (isString(dataUrl)) {	
			// Assume HTML unless the dataUrl ends in .txt or .csv (wikis etc often won't end in .html)
			var testDataType = new RegExp("\.txt$|\.csv$", "i");
			var dataTypeIsText = testDataType.test(dataUrl); 
					
			$.ajax({
				 url: dataUrl,
				 dataType: (dataTypeIsText ? 'text' : 'html'),
				 success: function(data, textStatus, jqXHR) {
				 
					var contenType = jqXHR.getResponseHeader("content-type") || "";
					
					if (contenType.indexOf("text/plain") >= 0 || contenType.indexOf("text/csv") >= 0 || dataTypeIsText) {
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
			result.Title = decodeURIComponent(locationInfo.params.title);
		}	

		// if "blurb" is specified on the URL then change the tag line
		if ('blurb' in locationInfo.params  && isString(locationInfo.params.blurb)) {
			result.Blurb = decodeURIComponent(locationInfo.params.blurb);
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
		
		// if "hideorigin" or "hidescale" is on the url then set ShowOrigin to false, likewise with ShowScale
		if ('hideorigin' in locationInfo.params) result.ShowOrigin = false;
		if ('hidescale' in locationInfo.params)  result.ShowScale  = false;
		// or showoroigin and showscale could be specified explicitly
		if ('showorigin' in locationInfo.params && isString(locationInfo.params.showorigin)) {
			result.ShowOrigin = stringToBool(locationInfo.params.showorigin);
		}
		if ('showscale' in locationInfo.params && isString(locationInfo.params.showscale)) {
			result.ShowScale = stringToBool(locationInfo.params.showscale);
		}
		if ('notchgavesteveacompassnotagps' in locationInfo.params && isString(locationInfo.params.notchgavesteveacompassnotagps)) {
			result.ShowCoordinates = !stringToBool(locationInfo.params.notchgavesteveacompassnotagps);
		}

		if ('src' in locationInfo.params && isString(locationInfo.params.src)) {		
			result.MapDataUri = decodeURIComponent(locationInfo.params.src);
		}
		
		// if "icons" is specified on the URL then set the CustomIconsUri to load the images.
		if ('icons' in locationInfo.params && isString(locationInfo.params.icons)) {
			result.CustomIconsUri = locationInfo.params.icons;
		}
		
		// Some extra support for hosting via Google Drive, as google drive is a good way to make
		// the map collaborative while avoiding cross-domain data headaches.
		if ('googlesrc' in locationInfo.params && isString(locationInfo.params.googlesrc)) {		
			result.MapDataUri = 'https://googledrive.com/host/' + locationInfo.params.googlesrc;
		}
		if ('googleicons' in locationInfo.params && isString(locationInfo.params.googleicons)) {
			result.CustomIconsUri = 'https://googledrive.com/host/' + locationInfo.params.googleicons;
		}

		return result;
	}
}
 
// if labellingStyle is set LabellingStyle.none then no captions will be rendered.
function drawMapDetails(canvas, config, locations, labellingStyle)
{
	var cTextLineHeight = 10;

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
	
	// Returns an array of bounding boxes for the label and icon of a location
	function location_bounds(locationInstance, finalizedCaption) {
	
		var boundsAtOrigin;
		if ('BoundsAtOrigin' in locationInstance) {
			boundsAtOrigin = locationInstance.BoundsAtOrigin; // It's already been calculated (assumes finalizedCaption doesn't change)
		} else {
			// It hasn't been calculated yet, so do that now.
			// We cache it from a position 0, 0 because the actual translation will
			// change depending on the zoom level.
			// I'm caching it because I assume that measuring text width is slow - could be wrong, need to test.
			boundsAtOrigin = multilineCenteredText_bounds(0, cTextOffset, finalizedCaption, 1);
			//boundsAtOrigin = boundsAtOrigin.concat(
			//	icon_bounds(locationInstance.getIconIndex(), 0, 0, 0)
			//);		
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
	function multilineCenteredText_bounds(x, y, text, margin) {
	
		var result = [];
		if (!(margin < 0) && !(margin > 0)) margin = 0;

		if (!isEmpty(text)) {
			
			var textOffset = 1; // a starting offset of 1 is better by eye than 0, dunno if it's due to font, browser, or canvas
			var lines = splitIntoLines(text);
			var lineNo;
			for(lineNo = 0; lineNo < lines.length; lineNo++) {
			
				var lineWidth = ctx.measureText(lines[lineNo]).width;
				var bound_x = x - (lineWidth - 1) / 2;
				var bound_y = y + textOffset;
				
				result[lineNo] = new Rectangle(
					bound_x - margin,
					bound_y - cTextLineHeight - margin,
					bound_x + (lineWidth - 1) + margin,
					bound_y + margin
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

	function icon_bounds(index, x, z, margin) {
		// most icons fit in 20x20
		// todo: hardcode any exceptions
		var translated_x = translateCoord_x(x);
		var translated_z = translateCoord_z(z);
		
		
		var result = [];
		
		if (isNaN(index) || index < 0) {
			// no icon
		} else {
			result[0] = new Rectangle(translated_x - 10, translated_z - 11, translated_x + 10, translated_z + 9);
		}
		
		return result;
	}
	
	
	function icon_draw(index, drawMask, x, z) {
	
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
			
			// TODO! put this edgecase into the bounding boxes
			var textOffset = cTextOffset;
			if (isNaN(iconIndex) || iconIndex < 0) textOffset = 3; // Put the text where the icon would be. Text is 6px to 8px high, so add half of that
		
			var drawLabel = true;
			if (labellingStyle == LabellingStyle.smart) {			
				// check the space needed by the label isn't already occupied
				var boundingboxes = location_bounds(locationInstance, text);

				var boxIndex
				for(boxIndex = 0; boxIndex < boundingboxes.length; boxIndex++) {
				
					var box = boundingboxes[boxIndex];
					var	i;
					for(i = 0; i < occupiedSpace.length; i++) {
						if (box.intersects(occupiedSpace[i])) {
							// a label or icon already occupies this space
							
							// make sure it's not the bounding box of our own icon that we collided with
							var ourIconBounds = icon_bounds(locationInstance.getIconIndex(), locationInstance.x, locationInstance.z, 0);
							if (ourIconBounds.length == 0 || !ourIconBounds[0].equals(occupiedSpace[i])) {							
								drawLabel = false;
								break;
							}
						}
					}
					if (!drawLabel) break;
				}
				if (drawLabel) {
					// Add the space taken by this label to occupiedSpace
					occupiedSpace = occupiedSpace.concat(boundingboxes);
				}				
			}
				
			if (drawLabel) { 
				multilineCenteredText_draw(translateCoord_x(locationInstance.x), translateCoord_z(locationInstance.z) + textOffset, text);
			}
			
			/* debug code for showing bounding boxes
			ctx.lineWidth = 1;
			var boxes = location_bounds(locationInstance, text);
			var i;
			for(i = 0; i < boxes.length; i++) {
				boxes[i].stroke(ctx);
			}
			//*/			
		}
		
		if (renderLayer == RenderLayer.Masks) {		
			icon_draw(locationInstance.getIconIndex(), true, locationInstance.x, locationInstance.z);
		}

		if (isEmpty(text)) {
			if (renderLayer == RenderLayer.UncaptionedIcons) {		
				icon_draw(locationInstance.getIconIndex(), false, locationInstance.x, locationInstance.z);
			}
		} else {
			if (renderLayer == RenderLayer.CaptionedIcons) {		
				icon_draw(locationInstance.getIconIndex(), false, locationInstance.x, locationInstance.z);
			}		
		}
		
	}
	
	function drawOrigin() {
		var crosshairSize = 8;
		var originX = Math.round(translateCoord_x(0));
		var originZ = Math.round(translateCoord_z(0));
			
		ctx.lineWidth = 2;
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

		ctx.lineWidth = 2;
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
		var text_y2 = scaleStartY + notchHeight + cTextOffset - 4;
		multilineCenteredText_draw(scaleStartX + blockSize, text_y1, blockDistance_str);		
		multilineCenteredText_draw(scaleStartX, text_y2, '0');
		multilineCenteredText_draw(scaleStartX + blockSize * scaleLength_bl, text_y2, Math.round(blockDistance * scaleLength_bl).toString());
	}

	// Make the paper-background scaling pixelated on as many browsers as possible (to match Minecraft's artistic direction)
	setCanvasScalingToPixelated(ctx);
	
	ctx.drawImage(
		document.getElementById('map-background'),
		0, 0,
		canvas.width, canvas.height);

	// prefil the occupiedSpace array with boxes indicating where graphics are.
	var i;
	for (i = 0; i < locations.length; i++) {
		var locationInstance = locations[i];
		var bounds = icon_bounds(locationInstance.getIconIndex(), locationInstance.x, locationInstance.z, 0);
		if (bounds.length > 0) occupiedSpace[occupiedSpace.length] = bounds[0];
	}	

		
	ctx.font = "10px Arial";	
	ctx.font = "10px 'Merienda', Arial, sans-serif";	
	
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

function setCanvasScalingToPixelated(ctx) {
	// Make the paper-background scaling pixelated on as many browsers as possible (to match Minecraft's artistic direction)
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
}

// zoomLevelNumber indicates which level of zoom we are creating the map for. 0 is the most zoomed
// out map, 1 is the first level of zooming in, etc.
function createMapImageInDiv(zoomLevelNumber, divElementName, aWidth, aHeight, config, locations) {

	var canvas = document.createElement('canvas');
	canvas.width = aWidth;
	canvas.height = aHeight;

	var labellingStyle;

	if (config.LabelsLevel > zoomLevelNumber) {
		labellingStyle = LabellingStyle.none;
	} else if (config.AllLabelsLevel > zoomLevelNumber) {
		labellingStyle = LabellingStyle.smart;
	} else {
		labellingStyle = LabellingStyle.all;	
	}
	
	drawMapDetails(canvas, config, locations, labellingStyle);	
	var areaMapId = CreateAreaMapInDiv(divElementName, aWidth, aHeight, config, locations);
	
	var newImage = document.createElement('img');
	newImage.src = canvas.toDataURL("image/png");
	newImage.useMap = '#' + areaMapId;
	$(newImage).appendTo(document.getElementById(divElementName));
}

// returns the name of the map
 function CreateAreaMapInDiv(divElementName, aWidth, aHeight, config, locations){

	var result = divElementName + '-areamap';

	var mapSize = aWidth > aHeight ? aWidth : aHeight;
	
	var translateCoord_x = config.GetXTranslationFunction(mapSize);
	var translateCoord_z = config.GetZTranslationFunction(mapSize);
	
	var newmap = document.createElement('map')
	newmap.name = result;

	var index;
	for (index = 0; index < locations.length; ++index) {
	
		var location = locations[index];
		var href = location.getHref();

		var newArea = document.createElement('area');
		newArea.shape = 'circle';
		newArea.coords = [translateCoord_x(location.x), translateCoord_z(location.z), cClickRadius];
		if (!isEmpty(href)) newArea.href = href;
		newArea.alt = location.getAlt();
		
		var htmlString = generateHtmlLabel(location, config.ShowCoordinates);
		if (htmlString.length > 0) {
			$(newArea).mouseover(CreateHandler_mouseover(htmlString));
			$(newArea).mouseout(Handle_mouseout);
		}
		
		$(newArea).appendTo(newmap);
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
	if (isNotEmptyString(label)) label = strToHtml(label.trim());

	var owner = location.owner.text;
	if (isNotEmptyString(owner)) owner = strToHtml(owner.trim());

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
		if (isNotEmptyString(owner) && ownerPos == -1) {
			result += '<br/>';		
		}
	}
	if (isNotEmptyString(owner) && showOwner) result += htmlOwner;		

	if (isNotEmptyString(result) && includeCoordinates) {
		result += '<span class="locationHoverCoordinates"><br/>' + location.x + ', ' + location.z + '</span>';
	}
	
	return result;
}

function strToHtml(str) {
	return str.replace("\n", " ").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
}

// Assumes tiles are square, arranged beside each other in the tileImage left to right in two 
// rows (top row icons, bottom row masks) and should be drawn centered.
// This means user can change size of icons just by changing the images the tiles are in.
//
// tilesImage: an img element
// drawMask: if True, the icon mask will be drawn (i.e. the bottom row)
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

