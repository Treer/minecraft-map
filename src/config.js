/********************************************
 Map configuration and location data code and classes.

 Copyright 2014 Glenn Fisher

 This is not a standalone file, it is part of minecraftmap.pp.js
*****/

var LocationType = {
  Village:         {iconIndex:  0, name: "Plains Village",  href: "http://minecraft.gamepedia.com/Village#Plains"}, 
  DesertVillage:   {iconIndex:  1, name: "Desert village",  href: "http://minecraft.gamepedia.com/Village#Desert"}, 
  SavannahVillage: {iconIndex:  0, name: "Savannah village",href: "http://minecraft.gamepedia.com/Village#Savannah"}, 
  WitchHut:        {iconIndex:  3, name: "Witch's hut",     href: "http://minecraft.gamepedia.com/Generated_structures#Witch_Huts"},
  JungleTemple:    {iconIndex:  4, name: "Jungle temple",   href: "http://minecraft.gamepedia.com/Jungle_temple"},
  DesertTemple:    {iconIndex:  5, name: "Desert temple",   href: "http://minecraft.gamepedia.com/Desert_temple"},
  NetherFortress:  {iconIndex:  6, name: "Nether Fortress", href: "http://minecraft.gamepedia.com/Nether_Fortress"},
  NetherPortal:    {iconIndex:  7, name: "Portal",          href: "http://minecraft.gamepedia.com/Nether_Portal"},
  
  Forest:          {iconIndex: 28, name: "Forest",          href: "http://minecraft.gamepedia.com/Biome#Forest"},
  FlowerForest:    {iconIndex: 26, name: "Flower forest",   href: "http://minecraft.gamepedia.com/Flower_forest"},
  MushroomIsland:  {iconIndex: 29, name: "Mushroom island", href: "http://minecraft.gamepedia.com/Mushroom_Island"},
  Horse:           {iconIndex: 34, name: "",                href: "http://minecraft.gamepedia.com/Horse"},
  Wolf:            {iconIndex: 35, name: "",                href: "http://minecraft.gamepedia.com/Wolf"},
  Dragon:          {iconIndex: 36, name: "",                href: ""}, // No default href as dragon symbol could be used for many things, stronghold, "Here be dragons" etc
  SeaMonster:      {iconIndex: 46, name: "",                href: ""}, 
  Ship:            {iconIndex: 38, name: "",                href: ""}, // No default href as ship is probably used for map decoration
  IcePlainsSpikes: {iconIndex: 47, name: "Ice plains spikes", href: "http://minecraft.gamepedia.com/Biome/Ice_Plains_Spikes"}, 

  Spawn:           {iconIndex: 40, name: "Spawn", href: ""},
  PlayerStructure: {iconIndex:  8, name: "",      href: ""},  
  PlayerCastle:    {iconIndex:  9, name: "",      href: ""},  
  PlayerHouse:     {iconIndex: 10, name: "",      href: ""},  
  PlayerFarm:      {iconIndex: 14, name: "Farm",  href: ""},  
  PlayerMachine:   {iconIndex: 12, name: "",      href: ""},  
  EnchantingRoom:  {iconIndex: 44, name: "",      href: "http://minecraft.gamepedia.com/Enchantment_Table"}, 
  Label:           {iconIndex: -1, name: "",      href: ""},  
  
  FenceOverlay:    {iconIndex: 13, name: "",      href: ""},  
  IslandOverlay:   {iconIndex: 30, name: "",      href: ""}    
};


var LabellingStyle = {
  none:  0, // draw no labels (i.e. when zoomlevel < hidelabelsabove. Note that a level of 0 is 'higher' than a level of 1)
  smart: 1, // draw only the labels that have room, in order of importance (showlabelsbelow >= zoom level < hidelabelsabove. Note that a level of 0 is 'higher' than a level of 1)
  all:   2  // draw all labels (zoom level >= showlabelsbelow. Note that a level of 0 is 'higher' than a level of 1)
}

var LabellingStyleOverride = {
  normal:   0, // don't override - i.e. draw the label if the LabellingStyle of the zoomlevel says to.
  suppress: 1, // suppress the label from the map rendering (only shown on hover etc.)
  always:   2  // always draw the label regardless of whether there is room for it, and regardless of whether LabellingStyle is none
}

// This array allows hints to be given about how labels should avoid the stock icons.
// The earth won't end if this data is a little wrong, and working it out from the icon
// images would waste a lot of CPU time.
// Icons not in this list are assumed to be 20x20.
// Overlays have their width set to 0, but text offset information can be stored in the height.
// (to check it, switch cShowBoundingBoxes to true and view legend.csv)
var IconBoundsInformation = {
	 0: {width: 14, height: 14, yOffset: -1}, // village plain
	 1: {width: 14, height: 16, yOffset: -1}, // village desert
	 2: {width: 12, height: 20, yOffset:  0}, // skull
	 3: {width: 14, height: 20, yOffset: -4}, // witch
	 4: {width: 16, height: 17, yOffset: -2}, // jungle temple
	 5: {width: 10, height: 17, yOffset:  0}, // desert temple
	 6: {width: 10, height: 14, yOffset: -2}, // Nether fortress
	 7: {width: 10, height: 13, yOffset: -1}, // Portal
	 8: {width: 10, height: 10, yOffset:  0}, // PlayerStructure
	 9: {width: 10, height: 14, yOffset: -2}, // PlayerCastle
	10: {width: 12, height: 11, yOffset:  0}, // PlayerHouse
	11: {width: 15, height:  8, yOffset:  0}, // Rail
	12: {width: 10, height: 18, yOffset: -4}, // PlayerMachine
	13: {width:  0, height:  8, yOffset:  5}, // fence overlay
	14: {width: 16, height: 16, yOffset: -1}, // wheat
	15: {width: 12, height: 13, yOffset:  0}, // chicken
	16: {width: 10, height: 10, yOffset:  0}, // pig
	17: {width: 10, height: 10, yOffset:  0}, // cow
	18: {width: 10, height: 10, yOffset:  0}, // sheep
	19: {width: 12, height: 12, yOffset:  0}, // Pumpkin
	20: {width: 16, height: 16, yOffset:  0}, // Sarsen stones
	21: {width:  4, height: 18, yOffset:  0}, // Obelisk
	22: {width: 14, height: 24, yOffset: -4}, // Maoi
	23: {width: 15, height: 16, yOffset: -1}, // tree
	24: {width: 15, height: 16, yOffset: -1}, // tree (sapling)
	25: {width: 15, height: 16, yOffset: -1}, // tree (palms)	
	26: {width: 20, height: 22, yOffset:  0}, // flower forest
	27: {width: 20, height: 18, yOffset: -3}, // Forest (dark)
	28: {width: 24, height: 22, yOffset: -4}, // Forest 
	29: {width: 17, height: 16, yOffset: -1}, // Mushroom
	30: {width:  0, height: 16, yOffset:  8}, // island overlay
	31: {width: 30, height: 18, yOffset:  0}, // Mountains
	32: {width: 30, height: 20, yOffset: -1}, // Mountain
	33: {width: 18, height: 16, yOffset: -1}, // Cave	
	34: {width: 18, height: 17, yOffset:  0}, // Horse
	35: {width: 17, height: 13, yOffset:  0}, // Wolf
	36: {width: 30, height: 26, yOffset:  1}, // Dragon
	37: {width: 27, height: 27, yOffset:  1}, // Ship 1
	38: {width: 29, height: 30, yOffset:  0}, // Ship 2
	39: {width: 20, height: 27, yOffset: -2}, // Compass points	
	40: {width: 14, height: 12, yOffset:  0}, // Spawn
	41: {width: 18, height: 16, yOffset:  0}, // Marker
	42: {width: 14, height: 22, yOffset: -4}, // Marker2
	43: {width: 14, height: 16, yOffset: -1}, // Chest
	44: {width: 14, height: 16, yOffset: -1}, // EnchantingRoom
	45: {width: 11, height: 13, yOffset:  0}, // Anvil
	46: {width: 28, height: 18, yOffset:  1}, // Sea monster
	47: {width: 28, height: 30, yOffset:  1}  // Ice spikes
}


// Object constructor functions
// ----------------------------

// Constructor
function MapConfiguration() {
	// Leave fields undefined unless specifically set (or call SetDefaults())
}


// screenWidth and screenHeight are optional parameters - provide them if you have them
// and they will be used to pick a sensible default for HideLabelsAbove.
MapConfiguration.prototype.SetDefaults = function(screenWidth, screenHeight) {

	var hideLabelsAbove_Default = 0;
	/* commented out because I think smart-labels will work well at any screen size
	if (screenWidth > 0 || screenHeight > 0) {
		// small or tiny viewports will have hidelabelsabove set to 1 instead of 0, as
		// they don't have room for captions at the most zoomed out level.
		hideLabelsAbove_Default = (head.screen.height < 800 || head.screen.height < 800) ? 1 : 0;		
	} */

	// MapDataUri has no default - it MUST represent the "src" param on the URL.
	if (!('HideLabelsAbove'    in this)) this.HideLabelsAbove = hideLabelsAbove_Default;
	if (!('ShowLabelsBelow'    in this)) this.ShowLabelsBelow = 3; // 0 is the most zoomed out map, 1 is the first level of zooming in, etc. The levels in between HideLabelsAbove & ShowLabelsBelow will use smart-labels. 
	if (!('MapRange'           in this)) this.MapRange = cMapRangeDefault;
	if (!('Title'              in this)) this.Title = 'Map of the Overworld';
	if (!('Blurb'              in this)) this.Blurb = 'Use up/down or mousewheel to zoom, drag to scroll';
	if (!('CustomIconsUri'     in this)) this.CustomIconsUri = '';
	if (!('X'                  in this)) this.X = 0;
	if (!('Z'                  in this)) this.Z = 0;
	if (!('ShowOrigin'         in this)) this.ShowOrigin = true;
	if (!('ShowScale'          in this)) this.ShowScale = true;
	if (!('ShowCoordinates'    in this)) this.ShowCoordinates = false;
	if (!('DisableCoordinates' in this)) this.DisableCoordinates = false;
	if (!('OceanTheme'         in this)) this.OceanTheme = 'BlueCoastline';	
	if (!('HardCoastlines'     in this)) this.HardCoastlines = false;	
	if (!('OceanMapUri'        in this)) this.OceanMapUri = '';	
}

MapConfiguration.prototype.AssignFrom = function(sourceConfig) {
	
	if ('MapDataUri'         in sourceConfig) this.MapDataUri         = sourceConfig.MapDataUri;
	if ('HideLabelsAbove'    in sourceConfig) this.HideLabelsAbove    = sourceConfig.HideLabelsAbove;
	if ('ShowLabelsBelow'    in sourceConfig) this.ShowLabelsBelow    = sourceConfig.ShowLabelsBelow;
	if ('MapRange'           in sourceConfig) this.MapRange           = sourceConfig.MapRange;
	if ('Title'              in sourceConfig) this.Title              = sourceConfig.Title;
	if ('Blurb'              in sourceConfig) this.Blurb              = sourceConfig.Blurb;
	if ('CustomIconsUri'     in sourceConfig) this.CustomIconsUri     = sourceConfig.CustomIconsUri;
	if ('X'                  in sourceConfig) this.X                  = sourceConfig.X;
	if ('Z'                  in sourceConfig) this.Z                  = sourceConfig.Z;
	if ('ShowOrigin'         in sourceConfig) this.ShowOrigin         = sourceConfig.ShowOrigin;
	if ('ShowScale'          in sourceConfig) this.ShowScale          = sourceConfig.ShowScale;
	if ('ShowCoordinates'    in sourceConfig) this.ShowCoordinates    = sourceConfig.ShowCoordinates;	
	if ('DisableCoordinates' in sourceConfig) this.DisableCoordinates = sourceConfig.DisableCoordinates;	
	if ('OceanTheme'         in sourceConfig) this.OceanTheme         = sourceConfig.OceanTheme;	
	if ('HardCoastlines'     in sourceConfig) this.HardCoastlines     = sourceConfig.HardCoastlines;	
	if ('OceanMapUri'        in sourceConfig) this.OceanMapUri        = sourceConfig.OceanMapUri;	
}

MapConfiguration.prototype.AssignFromRow = function(rowString) {

	var posEquals = rowString.indexOf('=');
	if (posEquals > 0) {
		var key = trim(rowString.substring(0, posEquals)).toLowerCase();
		var value = trim(rowString.slice(posEquals + 1));
		
		if (key == 'z') {
			var new_z = parseInt(value);
			if (!isNaN(new_z)) this.Z = new_z;
			
		} else if (key == 'x') {
			var new_x = parseInt(value);
			if (!isNaN(new_x)) this.X = new_x;
			
		} else if (key == 'hidelabelsabove') {
			var new_HideLabelsAbove = parseInt(value);
			if (!isNaN(new_HideLabelsAbove)) this.HideLabelsAbove = new_HideLabelsAbove;
			
		} else if (key == 'showlabelsbelow') {
			var new_ShowLabelsBelow = parseInt(value);
			if (!isNaN(new_ShowLabelsBelow)) this.ShowLabelsBelow = new_ShowLabelsBelow;
			
		} else if (key == 'range') {
			var new_MapRange = parseInt(value);
			if (!isNaN(new_MapRange)) this.MapRange = new_MapRange;
			
		} else if (key == 'title' && isString(value)) {
			this.Title = unquoteString(value);
			
		} else if (key == 'blurb' && isString(value)) {
			this.Blurb = unquoteString(value);
			
		} else if (key == 'icons' && isString(value)) {
			this.CustomIconsUri = unquoteString(value);
			
		} else if (key == 'googleicons' && isString(value)) {
			this.CustomIconsUri = 'https://googledrive.com/host/' + unquoteString(value);
			
		} else if (key == 'showorigin' && isString(value)) {
			this.ShowOrigin = stringToBool(value);
			
		} else if (key == 'showscale' && isString(value)) {
			this.ShowScale = stringToBool(value);
			
		} else if (key == 'showcoordinates' && isString(value)) {
			this.ShowCoordinates = stringToBool(value);
			
		} else if (key == 'disablecoordinates' && isString(value)) {
			this.DisableCoordinates = stringToBool(value);
			
		} else if (key == 'oceantheme' && isString(value)) {
			this.OceanTheme = unquoteString(value);
			this.HardCoastlines = this.OceanTheme.lastIndexOf("hard") == (this.OceanTheme.length - 4) && (this.OceanTheme.length > 3);
			if (this.HardCoastlines) this.OceanTheme = this.OceanTheme.substr(0, this.OceanTheme.length - 4);
			
		} else if (key == 'oceansrc' && isString(value)) {
			this.OceanMapUri = unquoteString(value);
			
		} else if (key == 'oceangooglesrc' && isString(value)) {
			this.OceanMapUri = 'https://googledrive.com/host/' + unquoteString(value);
		}
	}
}

MapConfiguration.prototype.AssignFromUrl = function(urlString) {

	var locationInfo = parseURL(urlString);
	
	if (Object.keys !== undefined && Object.keys(locationInfo.params).length == 0) {
		// Check for the Google bug (where GoogleDrive intermittently performs a 301 redirect and 
		// loses all of the URL paramters in the process)
		if (location.host.indexOf("googledrive.com") > 20) {
			// there are no URL parameters and the URL has been changed to something like
			// https://85b5da109cbab0a781619b9c891f667f8ebe60b8.googledrive.com/host/0B35KCzsTLKY1QTB6MEdoYkp2VGs/index.html
			// (See http://stackoverflow.com/questions/24188499)
		
			alert(
				'no "src=" url was specified to scrape the location data from.\n\n' + 
				'(On the off-chance you did specify a src parameter and it\'s gone, then Google Drive could be experiencing problems again:\n' +
				'See http://buildingwithblocks.info/googlebug for more details)'
			);
			this.Abort = true;
		}			
	}
	
	// if "hidelabelsabove" is specified on the URL, then only display labels when
	// the map is zoomed in more levels than the value of hidelabelsabove.
	// i.e. 0 means always allow labels, while 2 means don't show labels unless zoomed twice or more.
	if ('hidelabelsabove' in locationInfo.params) {
		this.HideLabelsAbove = locationInfo.params.hidelabelsabove;
	}	

	// if "showlabelsbelow" is specified on the URL, then display all labels when
	// the map is zoomed in more levels than the value of showlabelsbelow.
	// 0 is the most zoomed out map, 1 is the first level of zooming in, etc. The levels in between HideLabelsAbove & ShowLabelsBelow will use smart-labels. 
	// i.e. 0 means always show *all* labels, while 2 means force all labels to be shown at level 3 (full zoom)
	if ('showlabelsbelow' in locationInfo.params) {
		this.ShowLabelsBelow = locationInfo.params.showlabelsbelow;
	}			
	
	// Set any constants specified by the URL (instead of using the default value)
	if ('range' in locationInfo.params) {	
		this.MapRange = locationInfo.params.range;
	}

	// if "title" is specified on the URL then relabel the page
	if ('title' in locationInfo.params  && isString(locationInfo.params.title)) {
		// Google Drive has a bug in its redirect where %20 gets turned into + instead of being
		// preserved, and decodeURIComponent doesn't decode +, so turn them back into %20 first.
		this.Title = decodeURIComponent(locationInfo.params.title.replace(/\+/g, " "));
	}	

	// if "blurb" is specified on the URL then change the tag line
	if ('blurb' in locationInfo.params  && isString(locationInfo.params.blurb)) {
		// Google Drive has a bug in its redirect where %20 gets turned into + instead of being
		// preserved, and decodeURIComponent doesn't decode +, so turn them back into %20 first.
		this.Blurb = decodeURIComponent(locationInfo.params.blurb.replace(/\+/g, " "));
	}	
	
	// if "x" is specified on the URL then change the center of the map
	if ('x' in locationInfo.params) {
		var new_x = parseInt(locationInfo.params.x);
		if (!isNaN(new_x)) this.X = new_x
	}

	// if "z" is specified on the URL then change the center of the map
	if ('z' in locationInfo.params) {
		var new_z = parseInt(locationInfo.params.z);
		if (!isNaN(new_z)) this.Z = new_z
	}	
	
	// if "hideorigin" or "hidescale" is on the url then set ShowOrigin to false, likewise with ShowScale
	if ('hideorigin' in locationInfo.params) this.ShowOrigin = false;
	if ('hidescale' in locationInfo.params)  this.ShowScale  = false;
	// or showoroigin and showscale could be specified explicitly
	if ('showorigin' in locationInfo.params && isString(locationInfo.params.showorigin)) {
		this.ShowOrigin = stringToBool(locationInfo.params.showorigin);
	}
	if ('showscale' in locationInfo.params && isString(locationInfo.params.showscale)) {
		this.ShowScale = stringToBool(locationInfo.params.showscale);
	}
	if ('showcoordinates' in locationInfo.params && isString(locationInfo.params.showcoordinates)) {
		this.ShowCoordinates = stringToBool(locationInfo.params.showcoordinates);
	}

	// if "icons" is specified on the URL then set the CustomIconsUri to load the images.
	if ('icons' in locationInfo.params && isString(locationInfo.params.icons)) {
		this.CustomIconsUri = locationInfo.params.icons;
	}
	if ('googleicons' in locationInfo.params && isString(locationInfo.params.googleicons)) {
		this.CustomIconsUri = 'https://googledrive.com/host/' + locationInfo.params.googleicons;
	}
	
	if ('src' in locationInfo.params && isString(locationInfo.params.src)) {		
		this.MapDataUri = decodeURIComponent(locationInfo.params.src);
	}	
	// Some extra support for hosting via Google Drive, as google drive is a good way to make
	// the map collaborative while avoiding cross-domain data headaches.
	if ('googlesrc' in locationInfo.params && isString(locationInfo.params.googlesrc)) {

		if (locationInfo.params.googlesrc.toLowerCase().indexOf('http') == 0) {
			// User has used googlesrc when they should have used src. Rather than 
			// explain the error just correct it.
			this.MapDataUri = locationInfo.params.googlesrc;
		} else {
			this.MapDataUri = 'https://googledrive.com/host/' + locationInfo.params.googlesrc;
			
			// People frequently create location files in Google Documents instead of .txt files,
			// until support for Google docs can be added, try to detect this mistake so the error
			// message can be meaningful. I don't know much about Google's id strings, but the doc
			// ones always seem to long and the file ones short, e.g:
			//
			// Example Google Doc id:        1nKzgtZKPzY8UKAGVtcktIAaU8cukUTjOg--ObQbMtPs
			// Example Google Drive file id: 0B35KCzsTLKY1YkVMeWRBemtKdHM
			// (28 chars vs 44)
			if (locationInfo.params.googlesrc.length > 40) this.GoogleSrcLooksLikeDoc = true;			
		}
	}
		
	if ('oceansrc' in locationInfo.params && isString(locationInfo.params.oceansrc)) {
		this.OceanMapUri = locationInfo.params.oceansrc;
	}
	if ('oceangooglesrc' in locationInfo.params && isString(locationInfo.params.oceangooglesrc)) {

		if (locationInfo.params.oceangooglesrc.toLowerCase().indexOf('http') == 0) {
			// User has used googlesrc when they should have used src. Rather than 
			// explain the error just correct it.
			this.OceanMapUri = locationInfo.params.oceangooglesrc;
		} else {
			this.OceanMapUri = 'https://googledrive.com/host/' + locationInfo.params.oceangooglesrc;
		}
	}

	if ('oceantheme' in locationInfo.params && isString(locationInfo.params.oceantheme)) {		
		this.OceanTheme = locationInfo.params.oceantheme;
		this.HardCoastlines = this.OceanTheme.lastIndexOf("hard") == (this.OceanTheme.length - 4) && (this.OceanTheme.length > 3);
		if (this.HardCoastlines) this.OceanTheme = this.OceanTheme.substr(0, this.OceanTheme.length - 4);		
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
// labellingStyleOverride: an enumeration of type LabellingStyleOverride indicating whether the text should 
// be suppressed from the map rendering (only shown on hover etc.), always drawn regardless of the labellingStyle
// of the zoom level, or drawn when suitable (default)
function SuppressableLabel(text, labellingStyleOverride) {
	this.text = text;
	
	if (labellingStyleOverride === undefined) {
		this.displayOverride = LabellingStyleOverride.normal;
	} else {
		this.displayOverride = labellingStyleOverride
	}	
	this.suppress = this.displayOverride == LabellingStyleOverride.suppress;	
	this.always   = this.displayOverride == LabellingStyleOverride.always;	
}

SuppressableLabel.prototype.toString = function() {
	return this.text;
}

// Parses "suppression-marked-up" text and returns a SuppressableLabel.
//  * If 'markedupLabel' is surrounded by cLabel_DontDrawChar (~), then
//    they are removed and .suppress is set to true.
//  * If 'markedupLabel' is surrounded by cLabel_AlwaysDrawChar (!), then
//    they are removed and .always is set to true.
SuppressableLabel.parse = function(markedupLabel) {

	var result = new SuppressableLabel(markedupLabel);

	if (isString(markedupLabel)) {
		var trimLabelStr = trim(markedupLabel);
		if (trimLabelStr.length >= 2) {
			if (trimLabelStr[0] == cLabel_DontDrawChar && trimLabelStr[trimLabelStr.length - 1] == cLabel_DontDrawChar) {		
				result = new SuppressableLabel(trimLabelStr.substring(1, trimLabelStr.length - 1), LabellingStyleOverride.suppress);
			} else if (trimLabelStr[0] == cLabel_AlwaysDrawChar && trimLabelStr[trimLabelStr.length - 1] == cLabel_AlwaysDrawChar) {		
				result = new SuppressableLabel(trimLabelStr.substring(1, trimLabelStr.length - 1), LabellingStyleOverride.always);
			}
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

// overrideOnly is an optional boolean, if true then only an hrefOverride value will
// be returned, i.e. no default hrefs
Location.prototype.getHrefAndTarget = function(overrideOnly) {
	if (this.hrefOverride == "-") {
		// Don't defer to the default href
		return new HrefAndTarget("");
	} else {
		return new HrefAndTarget(
			(isEmpty(this.hrefOverride) && overrideOnly != true) ? this.type.href : this.hrefOverride
		);
	}
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
function HrefAndTarget(urlString) {
	// the target is optional, if the urlString begins with an underscore
	// then assume the url has been prefixed with the target, delimited with 
	// another underscore.
	
	this.target = gHrefTargetDefault;
	
	if (isEmpty(urlString)) {
		this.href = "";
	} else {
		if(urlString[0] == '_') {
			var splitPos = urlString.indexOf("_", 1);
			if (splitPos > 0) {
				// A target was specified in this string, split the string into target and href.
				this.target = urlString.substring(0, splitPos);
				this.href = urlString.substring(splitPos + 1);
			} else {
				this.href = urlString;
			}
		} else {
			this.href = urlString;
		}
	}
}


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

// Set url to an empty string if you want to make the ?src= URL parameter required,
// or use it to avoid needing the ?src= parameter by "hardcoding" where the locations 
// are loaded from.
function SetDefaultSrc(url) {
	if (isString(url)) {
		gMapDataUriDefault = url;
	} else {
		alert("SetDefaultSrc() was passed a non-string value");
	}
}

// Set the target to use for urls that don't specify a target. 
// Normally it doesn't matter but when running in an iframe you should set the 
// default target to be '_parent'
// Valid values would be '_blank', '_self', '_parent', or '_top'
// (See HrefAndTarget() for details about how to explicitly include a target in a url)
function SetDefaultHrefTarget(target) {
	if (isString(target)) {
		gHrefTargetDefault = target;
	} else {
		alert("SetDefaultHrefTarget() was passed a non-string value");
	}
}
 
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

	var lines = data.split('\n');
	var i = 0;
	for(i = 0; i < lines.length; i++) {
		var line = lines[i];
		if (line[0] != '/') { // Comments don't need to start with // since any non-valid line is just ignored, but perhaps skipping these will save some time or RAM?
			var newLocation = createLocationFromRow(i + 1, lines[i]);	
			if (newLocation instanceof Location) {
				locationList.push(newLocation);		
			} else {
				config.AssignFromRow(lines[i]);
			}
		}
	}
	callback(config, locationList);
}

function parseHtmlLocations(data, callback) {
	
	function encodeForCsv(value) {
		// if value contains any quotemarks or commas and is not already quoted then 
		// wrap it in quotes so it can safely be concatenated csv-style		
		var result = value;
		
		var trimValue = trim(value);
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
 
 

 