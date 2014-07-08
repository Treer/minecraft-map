/**** @Preserve
 v1.7

 Copyright 2014 Glenn Fisher

 This is an unofficial mapping system for Minecraft. It is neither produced nor 
 endorsed by Mojang.

 Licenced under GPL licence, version 3 or later
 https://www.gnu.org/copyleft/gpl.html

 Note that other files in this project have their own licence, see \licence.md
*****/

// Constants and global variables
var cMapRangeDefault      = 3200;  // measured in minecraft blocks from the center. (Since the map we use for the background is 64 pixels wide, a range of 3200 gives map squares of a nice round scale of 100)
var cClickRadius          = 12;    // How far from the center of the icon is clickable
var cTextOffset           = 14;    // How far under the center of the icon should the text be drawn
var cLabel_DontDrawChar   = '~';   // Designates labels that shouldn't be drawn on the map. The tilde is illegal in a Minecraft name, so should make a good character to enclose labels with.
var cLabel_AlwaysDrawChar = '!';   // Designates labels that should always be drawn on the map. The exclamation mark is illegal in a Minecraft name, so should make a good character to enclose labels with.
var cCustomIconIndexStart = 64;    // IconIndexes with this value or higher should be loaded from gCustomIcons
var cShowBoundingBoxes    = false; // This is for debug only

var gMapDataUriDefault    = '';    // Set this using SetDefaultSrc(), it specifies the URL to try and load locations from if no src parameter is specified in the main URL.
var gCustomIcons = new Image();
var gCustomIconsLoaded = false;


// #include "helpers.js"
// #include "config.js"
// #include "createmaps.js"


/********************************************
 .html entry-point functions
****/

// config is a MapConfiguration object
// locations is an array of Location objects
// divElementsAndSize is an array of { divName: ..., width: ..., height: ... }, one for each level of zoom
function createMapsInDivs_Async(config, locations, divElementsAndSize, finishedCallback) {
	// The purpose of createMapsInDivs_Async() was to relinquish CPU - give time back to the 
	// browser by breaking up the rendering of each zoom level into a separate function invoked 
	// using setTimeout() so the browser can execute them whenever it gets around to it.
	// 
	// This does not appear to have reduced the the browser-lockup observed when the maps are being
	// rendered, so I'm not going to bother breaking up the rendering up any further.
	// If this function causes any problems, it can be replaced by a simple loop that sequentially
	// calls createMapImageInDiv().
	
	function CreateDeferredRenderFunction(zoomLevel, deferredObj) {
	
		return function() {
			createMapImageInDiv(
				zoomLevel, 
				divElementsAndSize[zoomLevel].divName, 
				divElementsAndSize[zoomLevel].width, 
				divElementsAndSize[zoomLevel].height, 
				config, 
				locations,
				function() { 
					deferredObj.resolve();
				}
			);			
		}		
	}
	
	PreRender(config);
	
	var functionPromises = [];

	var i;
	for(i = 0; i < divElementsAndSize.length; i++) {
						
		var newDeferred = $.Deferred();		
		
		setTimeout( CreateDeferredRenderFunction(i, newDeferred), 1);		
		functionPromises[i] = newDeferred;		
	}
	$.when.apply($, functionPromises).done(finishedCallback);
}


// callback will be given two arguments - a dictionary of settings and an array of Location instances
function getSettingsAndMapLocations(screenWidth, screenHeight, callback) {

	var configFromUrl = new MapConfiguration();
	configFromUrl.AssignFromUrl(location);
		
	var srcUri = ('MapDataUri' in configFromUrl) ? configFromUrl.MapDataUri : gMapDataUriDefault;
	
	if (isNotEmptyString(srcUri)) {
		getMapDataAndLocationsFromUrl(
			srcUri,  
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
		if (configFromUrl.Abort != true) {
			alert('no "src=" url was specified to scrape the location data from.');
		}
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
					if (dataUrl == gMapDataUriDefault) {
						// No src parameter was specified, and that's most likely the error - as loading 
						// from gMapDataUriDefault failed (gMapDataUriDefault is not normally a valid uri - it's
						// only valid when the map has been set up to not need the src parameter).
						//alert('no "src=" url was specified to scrape the location data from.\n\n(also failed to load from the fallback: ' + textStatus + ', ' + errorThrown + ')');
						alert('no "src=" url was specified to scrape the location data from.\n\n(and could not load from the fallback url)');
					} else {
						alert('Failed to load locations from src "' + dataUrl + '", something went wrong: ' + textStatus + ', ' + errorThrown);
					}
				}
			});
					
		} else {
			alert('Internal error: dataUrl not string');
		}	
	}
}
