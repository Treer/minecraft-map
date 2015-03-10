/**** @Preserve
 The Ink & Parchment Map v1.7.0

 Copyright 2014 Glenn Fisher

 This is an unofficial mapping system for Minecraft. It is neither produced nor 
 endorsed by Mojang.

 Licenced under GPL licence, version 3 or later
 https://www.gnu.org/copyleft/gpl.html

 Note that other files in this project have their own licence, see \licence.md
*****/

// Constants 
var cMapRangeDefault        = 3200;  // measured in minecraft blocks from the center. (Since the map we use for the background is 64 pixels wide, a range of 3200 gives map squares of a nice round scale of 100)
var cClickRadius            = 12;    // How far from the center of the icon is clickable
var cCaptionSpacer_vertical = 8;     // How far under the bottom of the icon should the text be drawn. The canvas textBaseline is "alphabetic", so cCaptionSpacer_vertical should be set to roughly the ascent of the font.
var cLabel_DontDrawChar     = '~';   // Designates labels that shouldn't be drawn on the map. The tilde is illegal in a Minecraft name, so should make a good character to enclose labels with.
var cLabel_AlwaysDrawChar   = '!';   // Designates labels that should always be drawn on the map. The exclamation mark is illegal in a Minecraft name, so should make a good character to enclose labels with.
var cCustomIconIndexStart   = 64;    // IconIndexes with this value or higher should be loaded from gCustomIcons
var cShowBoundingBoxes      = false; // This is for debug only

// Global variables
var gMapDataUriDefault      = '';    // Set this using SetDefaultSrc(), it specifies the URL to try and load locations from if no src parameter is specified in the main URL.
var gHrefTargetDefault      = '';    // Set this using SetDefaultHrefTarget(), it specifies the target to use for hrefs that don't specify a target. Normally it doesn't matter but when running in an iframe it should be set to '_parent'
var gCustomIcons            = new Image();
var gCustomIconsLoaded      = false;
var gOceanMapImage          = null;  // will be set to an Image if an ocean mask is provided.


// #include "helpers.js"
// #include "config.js"
// #include "createmaps.js"
// #include "renderocean.js"


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
		
	// Load the ocean mask asynchronously if possible while we load the locations file, 
	// to avoid adding delay to the pipeline.
	var loadingOceanMap_deferredObj = loadOceanMap_Async(configFromUrl, false);		
		
	var srcUri = ('MapDataUri' in configFromUrl) ? configFromUrl.MapDataUri : gMapDataUriDefault;
	
	if (isNotEmptyString(srcUri)) {
		getMapDataAndLocationsFromUrl(
			srcUri, 
			(configFromUrl.GoogleSrcLooksLikeDoc == true),
			function(configFromAjax, locationsFromAjax) {
			
				var mapConfig = new MapConfiguration();
				mapConfig.SetDefaults(screenWidth, screenHeight);
				mapConfig.AssignFrom(configFromAjax);
				mapConfig.AssignFrom(configFromUrl);
				
				ApplyMapConfiguration(mapConfig);

				// I'm getting the impression there is no reliable way to wait for
				// an image to load, see caveats in http://api.jquery.com/load-event/		
				// If that's the case then ocean maps and custom icons won't work on 
				// browsers with broken onload event.
				var deferreds = [];
				var loadCustomIcons_deferredObj = $.Deferred();						
				deferreds[0] = loadCustomIcons_deferredObj;
								
				// Load the custom icons
				if (!isEmpty(mapConfig.CustomIconsUri)) {					
					$(gCustomIcons).bind({
						load: function() {
							gCustomIconsLoaded = true;		
							loadCustomIcons_deferredObj.resolve();
						},
						error: function() {
							// Image didn't load, probably a 404
							loadCustomIcons_deferredObj.resolve();
							alert('Could not load custom icons image at "' + mapConfig.CustomIconsUri + '"');							
						}
					});		
					gCustomIcons.src = mapConfig.CustomIconsUri;
					
				} else {	
					loadCustomIcons_deferredObj.resolve();
				}

				if (loadingOceanMap_deferredObj == null) {
					// The ocean map hasn't been loaded yet, perhaps the configFromAjax
					// has provided a URL to load it from, or the HTML has loaded it.
					loadingOceanMap_deferredObj = loadOceanMap_Async(mapConfig, true);						
				}
				if (loadingOceanMap_deferredObj != null) {
					deferreds[1] = loadingOceanMap_deferredObj;
				}
				
				$.when.apply($,deferreds).done(
					function() { callback(mapConfig, locationsFromAjax); }
				);
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

		
	function getMapDataAndLocationsFromUrl(dataUrl, dataUriSuspectedToBeGoogleDoc, callback) {
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

					} else if (dataUriSuspectedToBeGoogleDoc) {
						// People frequently create location files in Google Documents instead of .txt files,
						// until support for Google docs can be added, try to detect this mistake and give
						// a more helpful error message.
						alert('Failed to load locations from src "' + dataUrl + '"\nThis might be a Google Doc file instead of a txt file on Google Drive.\n\nThe map viewer cannot read Doc format.');
					
					} else {
						alert('Failed to load locations from src "' + dataUrl + '", something went wrong: ' + textStatus + ', ' + errorThrown);
					}
				}
			});
					
		} else {
			alert('Internal error: dataUrl not string');
		}	
	}
	
	// Loads the oceanmap into the global variable gOceanMapImage. If 
	// the config contains an OceanMapUri then the load is attempted from 
	// the Uri, otherwise attempts to load from the "oceanmask" img tag in the HTML.
	//
	// Returns null if there was nothing to load, or a jquery Deferred object
	// which will be resolved when the oceanmap is loaded
	function loadOceanMap_Async(config, tryImgTag) {

		var result_deferredObj = $.Deferred();				
	
		// Load the ocean map
		if (!isEmpty(config.OceanMapUri)) {		
			// I'm getting the impression there is no reliable way to wait for
			// an image to load, see caveats in http://api.jquery.com/load-event/		
			// If that's the case then ocean maps and custom icons won't work on 
			// browsers with broken onload event.
			gOceanMapImage = new Image();
			$(gOceanMapImage).bind({
				load: function() {
					// Excellent, ocean mask is loaded
					result_deferredObj.resolve();
				},
				error: function() {
					// Image didn't load, probably a 404
					gOceanMapImage = null;
					result_deferredObj.resolve();
					alert('Could not load oceam-map image at "' + config.OceanMapUri + '"');
				}
			});		
			gOceanMapImage.crossOrigin = "Anonymous";
			gOceanMapImage.src = config.OceanMapUri;
			
		} else if (tryImgTag) {	
			// Oceanmap wasn't specified in settings, but might have been loaded in an img tag in index.html
			gOceanMapImage = document.getElementById('oceanmask');	
			if (gOceanMapImage != null) {
				// The "oceanmask" img appears to be present in the HTML
				
				// (It feels wrong to assign an error handler in the html just to figure out if the image is good, 
				// so I'm going with isImageOk() instead, unless it turns out to be less cross-browser compatible)
				if (!isImageOk(gOceanMapImage)) {
					// It's a broken link.
					gOceanMapImage = null;
					// return null to indicate the map is not loading
					result_deferredObj = null;
				} else {
					// image was already loaded with the html
					result_deferredObj.resolve();
				}
			} else {			
				// The oceanmask tag is commented out, or otherwise missing.
				
				// return null to indicate the map is not loading
				result_deferredObj = null;
			}
		} else {
			// Oceanmap wasn't specified in settings, and the value of tryImgTag says not to bother checking the img tag in index.html
			
			// return null to indicate the map is not loading
			result_deferredObj = null;		
		}
		
		return result_deferredObj;	
	}
}
