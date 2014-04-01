
var cClickRadius = 12;   // How far from the center of the icon is clickable
var cMapRange    = 6000; // measured in minecraft blocks from the center
var cTextOffset  = 14;   // How far under the center of the icon should the text be drawn

var gLocationInfo = parseURL(location);

// Set any constants specified by the URL (instead of using the default value)
if ('range' in gLocationInfo.params) {	
	cMapRange = gLocationInfo.params.range;
}

// Code snippet
function isEmpty(str) {
    return (!str || 0 === str.length);
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
  Label:           {iconIndex: 9, name: "",      href: ""}  
};


// Object constructor functions
// ----------------------------

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
    return (this.iconIndexOverride < 0) ? this.type.iconIndex : this.iconOverride;
};

Location.prototype.getAlt = function() {

    var result = this.getLabel();	
	if (isEmpty(result) && !isEmpty(this.owner)) result = this.owner;

    return result;
};

// --------

function getMapLocations() {

	var result = [];

	function addLocation(x, z, type) {
		var newLocation = new Location(x, z, type, "", "", "", -1);		
		result.push(newLocation);	
	}

	function addLabelledLocation(x, z, type, label, href) {
		var newLocation = new Location(x, z, type, label, "", href, -1);		
		result.push(newLocation);		
	}

	function addOwnedLocation(x, z, label, owner, href) {
		var newLocation = new Location(x, z, LocationType.PlayerStructure, label, owner, href, -1);				
		result.push(newLocation);
	}

	addLabelledLocation(960,  -1096, LocationType.Spawn, "Main spawn", "http://www.arsimagica.net/cgi-bin/cgiwrap/eccles/arscuniculus.pl?Spawn_Point");
	addLabelledLocation(1872, -1168, LocationType.Spawn, "Forest\nspawn");
	addLabelledLocation(1144, -2048, LocationType.Spawn, "Taiga spawn");
	addLabelledLocation(984,  -48,   LocationType.Spawn, "Desert\nspawn");
	addLabelledLocation(256,  -1168, LocationType.Spawn, "Plain spawn");

	addLabelledLocation(1268,  -2410, LocationType.Forest, "fairy forest");
	addLabelledLocation(-1700, -700,  LocationType.Forest, "Dark oak");
	addLabelledLocation(-934,  -4676, LocationType.Forest, "Dark oak");
	
	addOwnedLocation( 1850, -1344, "Hamish", "Hamish", "");
	addOwnedLocation( 1495, -1825, "Sir Colling of Woodaswel", "Sir Colling of Woodaswel", "");
	addOwnedLocation( 1112, -2887, "Horfett Manor", "aeduna", "http://www.arsimagica.net/cgi-bin/cgiwrap/eccles/arscuniculus.pl?Horfett_Manor");
	addOwnedLocation( 1445, -1324, "Temple of Tempest", "webseer", "http://www.arsimagica.net/cgi-bin/cgiwrap/eccles/arscuniculus.pl?Temple_Of_Tempest");
	addOwnedLocation( 84,   -903,  "Small Lighthouse", "lex88", "http://www.arsimagica.net/cgi-bin/cgiwrap/eccles/arscuniculus.pl?Small_Light_House");
	addOwnedLocation( 86,    610,  "Outpost Xisle", "solusxisle", "http://www.arsimagica.net/cgi-bin/cgiwrap/eccles/arscuniculus.pl?Outpost_Xisle"); // Glass portal, grrr

	addOwnedLocation( 1017,  324,  "CookieMon's\nhovel", "CookieMon", "http://www.arsimagica.net/cgi-bin/cgiwrap/eccles/arscuniculus.pl?CookieMon");
	addOwnedLocation(-800,  -1800, "CookieMon's mountain lair", "CookieMon", "http://www.arsimagica.net/cgi-bin/cgiwrap/eccles/arscuniculus.pl?CookieMon");
	addOwnedLocation(-1048,  687,  "Crovexius", "Crovexius", "");
	addOwnedLocation( 1480, -1186, "Seaspray City", "webseer", "");
	addOwnedLocation(-1667,  781,  "Ender Cathedral", "", "");
	addOwnedLocation( 3529,  4706, "Portower", "aeduna", "");
	addOwnedLocation( 1200, -4400, "Ogdenville", "aeduna", "http://www.arsimagica.net/cgi-bin/cgiwrap/eccles/arscuniculus.pl?Ogdenville");
	addOwnedLocation( 7500, -6200, "Adam b1", "Electrobrick?", "");
	addOwnedLocation( 1148, -72,   "Map\nroom", "", "");
	addOwnedLocation( 846,   86,   "", "", ""); // Orange house, built by??
	addOwnedLocation( 2038, -1442, "", "pr0zak", "");

	addLocation( 2244, -1271, LocationType.DesertVillage);
	addLocation( 797,   153,  LocationType.DesertVillage);
	addLocation(-207,   881,  LocationType.DesertVillage);
	addLocation(-870,  -4489, LocationType.Village);
	addLabelledLocation(1236, 353, LocationType.Village, "aeduna's\nreanimated\nvillage");
	addLocation(-4056, -2487, LocationType.DesertTemple);
	addLocation(-3391,  1552, LocationType.WitchHut);
	addLocation(-3903, -4393, LocationType.WitchHut);

	// test locations
	//addLocation(-3903, -3393, LocationType.JungleTemple);
	//addLocation(-3903, -3000, LocationType.NetherPortal);
	
	return result;
}

function drawMapDetails(canvas, locations, iconsOnly)
{
	var ctx = canvas.getContext("2d");
	var mapSize = canvas.width > canvas.height ? canvas.width : canvas.height;
	var halfMapSize = mapSize / 2;

	var tilesImage = document.getElementById('map-tileset');
	
	function translateCoord(coord)
	{
		return (coord * halfMapSize / cMapRange) + halfMapSize;
	}

	function drawMultilineCenteredText(x, y, text) {

		var textOffset = 0;
		
		if (!isEmpty(text) && !iconsOnly) {
			var lines = text.split(/\r\n|\n|\r/);;
			var lineNo;
			for(lineNo = 0; lineNo < lines.length; lineNo++) {
			
				ctx.fillText(
					lines[lineNo], 
					x - (ctx.measureText(lines[lineNo]).width / 2),
					y + textOffset
				);
				textOffset += 9;
			}
		}
	}

	function drawLocation(locationInstance) {
		
		drawGlyph(ctx, tilesImage, locationInstance.getIconIndex(), translateCoord(locationInstance.x), translateCoord(locationInstance.z));
	
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

		if (!isEmpty(text)) {
			drawMultilineCenteredText(translateCoord(locationInstance.x), translateCoord(locationInstance.z) + cTextOffset, text);
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
		
	ctx.moveTo(halfMapSize, halfMapSize - crosshairSize);
	ctx.lineTo(halfMapSize, halfMapSize + crosshairSize);
	ctx.stroke();
	ctx.moveTo(halfMapSize - crosshairSize, halfMapSize);
	ctx.lineTo(halfMapSize + crosshairSize, halfMapSize);
	ctx.stroke();

	ctx.font = "10px Arial";

	var index;
	for (index = 0; index < locations.length; ++index) {

		drawLocation(locations[index]);
	}	
}

function createMapImageInDiv(divElementName, aWidth, aHeight, locations, iconsOnly) {

	var canvas = document.createElement('canvas');
	canvas.width = aWidth;
	canvas.height = aHeight;
	
	drawMapDetails(canvas, locations, iconsOnly);	
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

	function translateCoord(coord)
	{
		return (coord * halfMapSize / cMapRange) + halfMapSize;
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
			newArea.coords = [translateCoord(location.x), translateCoord(location.z), cClickRadius];
			newArea.href = href;
			newArea.alt = location.getAlt();
			
			$(newArea).appendTo(newmap);
		}
	}
	$(newmap).appendTo(document.getElementById(divElementName));
	
	return result;
}

// Assumes tiles are square, arranged beside each other in the tileImage left to right, and should be drawn centered.
// This means user can change size of icons just by changing the images the tiles are in.
function drawGlyph(canvasContext, tilesImage, tileIndex, x, y) {

	var width = tilesImage.height;
	var halfWidth = width / 2;

	canvasContext.drawImage(
		tilesImage,
		tileIndex * width,
		0,
		width,
		width,
		x - halfWidth,
		y - halfWidth,
		width,
		width
	);
}

