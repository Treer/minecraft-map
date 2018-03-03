/**** @Preserve

 The Ink & Parchment Map v1.7.3

 Copyright 2015 Glenn Fisher

 This is an unofficial mapping system for Minecraft. It is neither produced nor
 endorsed by Mojang.

 Licenced under GPL licence, version 3 or later
 https://www.gnu.org/copyleft/gpl.html

 Note that other files in this project have their own licence, see \licence.md
*****/
var MinecraftMap;
(function (MinecraftMap) {
    "use strict";
    var LocationType = {
        Village: { iconIndex: 0, name: "Plains Village", href: "http://minecraft.gamepedia.com/Village#Plains" },
        DesertVillage: { iconIndex: 1, name: "Desert village", href: "http://minecraft.gamepedia.com/Village#Desert" },
        SavannahVillage: { iconIndex: 0, name: "Savannah village", href: "http://minecraft.gamepedia.com/Village#Savannah" },
        WitchHut: { iconIndex: 3, name: "Witch's hut", href: "http://minecraft.gamepedia.com/Generated_structures#Witch_Huts" },
        JungleTemple: { iconIndex: 4, name: "Jungle temple", href: "http://minecraft.gamepedia.com/Jungle_temple" },
        DesertTemple: { iconIndex: 5, name: "Desert temple", href: "http://minecraft.gamepedia.com/Desert_temple" },
        NetherFortress: { iconIndex: 6, name: "Nether Fortress", href: "http://minecraft.gamepedia.com/Nether_Fortress" },
        NetherPortal: { iconIndex: 7, name: "Portal", href: "http://minecraft.gamepedia.com/Nether_Portal" },
        Forest: { iconIndex: 28, name: "Forest", href: "http://minecraft.gamepedia.com/Biome#Forest" },
        FlowerForest: { iconIndex: 26, name: "Flower forest", href: "http://minecraft.gamepedia.com/Flower_forest" },
        MushroomIsland: { iconIndex: 29, name: "Mushroom island", href: "http://minecraft.gamepedia.com/Mushroom_Island" },
        Horse: { iconIndex: 34, name: "", href: "http://minecraft.gamepedia.com/Horse" },
        Wolf: { iconIndex: 35, name: "", href: "http://minecraft.gamepedia.com/Wolf" },
        Dragon: { iconIndex: 36, name: "", href: "" },
        SeaMonster: { iconIndex: 46, name: "", href: "" },
        Ship: { iconIndex: 38, name: "", href: "" },
        IcePlainsSpikes: { iconIndex: 47, name: "Ice plains spikes", href: "http://minecraft.gamepedia.com/Ice_Plains_Spikes" },
        Spawn: { iconIndex: 40, name: "Spawn", href: "" },
        PlayerStructure: { iconIndex: 8, name: "", href: "" },
        PlayerCastle: { iconIndex: 9, name: "", href: "" },
        PlayerHouse: { iconIndex: 10, name: "", href: "" },
        PlayerFarm: { iconIndex: 14, name: "Farm", href: "" },
        PlayerMachine: { iconIndex: 12, name: "", href: "" },
        EnchantingRoom: { iconIndex: 44, name: "", href: "http://minecraft.gamepedia.com/Enchantment_Table" },
        Label: { iconIndex: -1, name: "", href: "" },
        FenceOverlay: { iconIndex: 13, name: "", href: "" },
        IslandOverlay: { iconIndex: 30, name: "", href: "" }
    };
    (function (LabellingStyle) {
        LabellingStyle[LabellingStyle["none"] = 0] = "none";
        LabellingStyle[LabellingStyle["smart"] = 1] = "smart";
        LabellingStyle[LabellingStyle["all"] = 2] = "all"; // draw all labels (zoom level >= showlabelsbelow. Note that a level of 0 is 'higher' than a level of 1)
    })(MinecraftMap.LabellingStyle || (MinecraftMap.LabellingStyle = {}));
    var LabellingStyle = MinecraftMap.LabellingStyle;
    (function (LabellingStyleOverride) {
        LabellingStyleOverride[LabellingStyleOverride["normal"] = 0] = "normal";
        LabellingStyleOverride[LabellingStyleOverride["suppress"] = 1] = "suppress";
        LabellingStyleOverride[LabellingStyleOverride["always"] = 2] = "always"; // always draw the label regardless of whether there is room for it, and regardless of whether LabellingStyle is none
    })(MinecraftMap.LabellingStyleOverride || (MinecraftMap.LabellingStyleOverride = {}));
    var LabellingStyleOverride = MinecraftMap.LabellingStyleOverride;
    // This array allows hints to be given about how labels should avoid the stock icons.
    // The earth won't end if this data is a little wrong, and working it out from the icon
    // images would waste a lot of CPU time.
    // Icons not in this list are assumed to be 20x20.
    // Overlays have their width set to 0, but text offset information can be stored in the height.
    // (to check it, switch cShowBoundingBoxes to true and view legend.csv)
    MinecraftMap.IconBoundsInformation = {
        0: { width: 14, height: 14, yOffset: -1, pixelArt: true },
        1: { width: 14, height: 16, yOffset: -1, pixelArt: true },
        2: { width: 12, height: 20, yOffset: 0, pixelArt: true },
        3: { width: 14, height: 20, yOffset: -4, pixelArt: true },
        4: { width: 16, height: 17, yOffset: -2, pixelArt: true },
        5: { width: 10, height: 17, yOffset: 0, pixelArt: true },
        6: { width: 10, height: 14, yOffset: -2, pixelArt: true },
        7: { width: 10, height: 13, yOffset: -1, pixelArt: true },
        8: { width: 10, height: 10, yOffset: 0, pixelArt: true },
        9: { width: 10, height: 14, yOffset: -2, pixelArt: true },
        10: { width: 12, height: 11, yOffset: 0, pixelArt: true },
        11: { width: 15, height: 8, yOffset: 0, pixelArt: true },
        12: { width: 10, height: 18, yOffset: -4, pixelArt: true },
        13: { width: 0, height: 8, yOffset: 5, pixelArt: true },
        14: { width: 16, height: 16, yOffset: -1, pixelArt: true },
        15: { width: 12, height: 13, yOffset: 0, pixelArt: true },
        16: { width: 10, height: 10, yOffset: 0, pixelArt: true },
        17: { width: 10, height: 10, yOffset: 0, pixelArt: true },
        18: { width: 10, height: 10, yOffset: 0, pixelArt: true },
        19: { width: 12, height: 12, yOffset: 0, pixelArt: true },
        20: { width: 16, height: 16, yOffset: 0, pixelArt: false },
        21: { width: 4, height: 18, yOffset: 0, pixelArt: false },
        22: { width: 14, height: 24, yOffset: -4, pixelArt: false },
        23: { width: 15, height: 16, yOffset: -1, pixelArt: true },
        24: { width: 15, height: 16, yOffset: -1, pixelArt: true },
        25: { width: 15, height: 16, yOffset: -1, pixelArt: true },
        26: { width: 20, height: 22, yOffset: 0, pixelArt: false },
        27: { width: 20, height: 18, yOffset: -3, pixelArt: false },
        28: { width: 24, height: 22, yOffset: -4, pixelArt: false },
        29: { width: 17, height: 16, yOffset: -1, pixelArt: false },
        30: { width: 0, height: 16, yOffset: 8, pixelArt: false },
        31: { width: 30, height: 18, yOffset: 0, pixelArt: false },
        32: { width: 30, height: 20, yOffset: -1, pixelArt: false },
        33: { width: 18, height: 16, yOffset: -1, pixelArt: false },
        34: { width: 18, height: 17, yOffset: 0, pixelArt: false },
        35: { width: 17, height: 13, yOffset: 0, pixelArt: false },
        36: { width: 30, height: 26, yOffset: 1, pixelArt: false },
        37: { width: 27, height: 27, yOffset: 1, pixelArt: false },
        38: { width: 29, height: 30, yOffset: 0, pixelArt: false },
        39: { width: 20, height: 27, yOffset: -2, pixelArt: false },
        40: { width: 14, height: 12, yOffset: 0, pixelArt: false },
        41: { width: 18, height: 16, yOffset: 0, pixelArt: false },
        42: { width: 14, height: 22, yOffset: -4, pixelArt: false },
        43: { width: 14, height: 16, yOffset: -1, pixelArt: true },
        44: { width: 14, height: 16, yOffset: -1, pixelArt: true },
        45: { width: 11, height: 13, yOffset: 0, pixelArt: true },
        46: { width: 28, height: 18, yOffset: 1, pixelArt: false },
        47: { width: 28, height: 30, yOffset: 1, pixelArt: false } // Ice spikes
    };
    // Object constructor functions
    // ----------------------------
    var MapConfiguration = (function () {
        function MapConfiguration() {
            this.MissingSrcMessageDisplayed = false;
            this.GoogleSrcLooksLikeDoc = false;
            // Leave fields undefined unless specifically set (or call SetDefaults())
        }
        // screenWidth and screenHeight are optional parameters - provide them if you have them
        // and they will be used to pick a sensible default for HideLabelsAbove.
        MapConfiguration.prototype.SetDefaults = function (screenWidth, screenHeight) {
            var hideLabelsAbove_Default = 0;
            /* commented out because I think smart-labels will work well at any screen size
            if (screenWidth > 0 || screenHeight > 0) {
                // small or tiny viewports will have hidelabelsabove set to 1 instead of 0, as
                // they don't have room for captions at the most zoomed out level.
                hideLabelsAbove_Default = (head.screen.height < 800 || head.screen.height < 800) ? 1 : 0;
            } */
            // MapDataUri has no default - it MUST represent the "src" param on the URL.
            if (!('HideLabelsAbove' in this))
                this.HideLabelsAbove = hideLabelsAbove_Default;
            if (!('ShowLabelsBelow' in this))
                this.ShowLabelsBelow = 3; // 0 is the most zoomed out map, 1 is the first level of zooming in, etc. The levels in between HideLabelsAbove & ShowLabelsBelow will use smart-labels.
            if (!('MapRange' in this))
                this.MapRange = MinecraftMap.cMapRangeDefault;
            if (!('Title' in this))
                this.Title = 'Map of the Overworld';
            if (!('Blurb' in this))
                this.Blurb = 'Use up/down or mousewheel to zoom, drag to scroll';
            if (!('CustomIconsUri' in this))
                this.CustomIconsUri = '';
            if (!('X' in this))
                this.X = 0;
            if (!('Z' in this))
                this.Z = 0;
            if (!('ShowOrigin' in this))
                this.ShowOrigin = true;
            if (!('ShowScale' in this))
                this.ShowScale = true;
            if (!('ShowCoordinates' in this))
                this.ShowCoordinates = false;
            if (!('DisableCoordinates' in this))
                this.DisableCoordinates = false;
            if (!('OceanTheme' in this))
                this.OceanTheme = 'BlueCoastline';
            if (!('HardCoastlines' in this))
                this.HardCoastlines = false;
            if (!('OceanMapUri' in this))
                this.OceanMapUri = '';
        };
        MapConfiguration.prototype.AssignFrom = function (sourceConfig) {
            if ('MapDataUri' in sourceConfig)
                this.MapDataUri = sourceConfig.MapDataUri;
            if ('HideLabelsAbove' in sourceConfig)
                this.HideLabelsAbove = sourceConfig.HideLabelsAbove;
            if ('ShowLabelsBelow' in sourceConfig)
                this.ShowLabelsBelow = sourceConfig.ShowLabelsBelow;
            if ('MapRange' in sourceConfig)
                this.MapRange = sourceConfig.MapRange;
            if ('Title' in sourceConfig)
                this.Title = sourceConfig.Title;
            if ('Blurb' in sourceConfig)
                this.Blurb = sourceConfig.Blurb;
            if ('CustomIconsUri' in sourceConfig)
                this.CustomIconsUri = sourceConfig.CustomIconsUri;
            if ('X' in sourceConfig)
                this.X = sourceConfig.X;
            if ('Z' in sourceConfig)
                this.Z = sourceConfig.Z;
            if ('ShowOrigin' in sourceConfig)
                this.ShowOrigin = sourceConfig.ShowOrigin;
            if ('ShowScale' in sourceConfig)
                this.ShowScale = sourceConfig.ShowScale;
            if ('ShowCoordinates' in sourceConfig)
                this.ShowCoordinates = sourceConfig.ShowCoordinates;
            if ('DisableCoordinates' in sourceConfig)
                this.DisableCoordinates = sourceConfig.DisableCoordinates;
            if ('OceanTheme' in sourceConfig)
                this.OceanTheme = sourceConfig.OceanTheme;
            if ('HardCoastlines' in sourceConfig)
                this.HardCoastlines = sourceConfig.HardCoastlines;
            if ('OceanMapUri' in sourceConfig)
                this.OceanMapUri = sourceConfig.OceanMapUri;
        };
        MapConfiguration.prototype.AssignFromRow = function (rowString) {
            var posEquals = rowString.indexOf('=');
            if (posEquals > 0) {
                var key = MinecraftMap.trim(rowString.substring(0, posEquals)).toLowerCase();
                var value = MinecraftMap.trim(rowString.slice(posEquals + 1));
                if (key == 'z') {
                    var new_z = parseInt(value);
                    if (!isNaN(new_z))
                        this.Z = new_z;
                }
                else if (key == 'x') {
                    var new_x = parseInt(value);
                    if (!isNaN(new_x))
                        this.X = new_x;
                }
                else if (key == 'hidelabelsabove') {
                    var new_HideLabelsAbove = parseInt(value);
                    if (!isNaN(new_HideLabelsAbove))
                        this.HideLabelsAbove = new_HideLabelsAbove;
                }
                else if (key == 'showlabelsbelow') {
                    var new_ShowLabelsBelow = parseInt(value);
                    if (!isNaN(new_ShowLabelsBelow))
                        this.ShowLabelsBelow = new_ShowLabelsBelow;
                }
                else if (key == 'range') {
                    var new_MapRange = parseInt(value);
                    if (!isNaN(new_MapRange))
                        this.MapRange = new_MapRange;
                }
                else if (key == 'title' && MinecraftMap.isString(value)) {
                    this.Title = unquoteString(value);
                }
                else if (key == 'blurb' && MinecraftMap.isString(value)) {
                    this.Blurb = unquoteString(value);
                }
                else if (key == 'icons' && MinecraftMap.isString(value)) {
                    this.CustomIconsUri = unquoteString(value);
                }
                else if (key == 'googleicons' && MinecraftMap.isString(value)) {
                    this.CustomIconsUri = 'https://googledrive.com/host/' + unquoteString(value);
                }
                else if (key == 'showorigin' && MinecraftMap.isString(value)) {
                    this.ShowOrigin = MinecraftMap.stringToBool(value);
                }
                else if (key == 'showscale' && MinecraftMap.isString(value)) {
                    this.ShowScale = MinecraftMap.stringToBool(value);
                }
                else if (key == 'showcoordinates' && MinecraftMap.isString(value)) {
                    this.ShowCoordinates = MinecraftMap.stringToBool(value);
                }
                else if (key == 'disablecoordinates' && MinecraftMap.isString(value)) {
                    this.DisableCoordinates = MinecraftMap.stringToBool(value);
                }
                else if (key == 'oceantheme' && MinecraftMap.isString(value)) {
                    this.OceanTheme = unquoteString(value);
                    this.HardCoastlines = this.OceanTheme.lastIndexOf("hard") == (this.OceanTheme.length - 4) && (this.OceanTheme.length > 3);
                    if (this.HardCoastlines)
                        this.OceanTheme = this.OceanTheme.substr(0, this.OceanTheme.length - 4);
                }
                else if (key == 'oceansrc' && MinecraftMap.isString(value)) {
                    this.OceanMapUri = unquoteString(value);
                }
                else if (key == 'oceangooglesrc' && MinecraftMap.isString(value)) {
                    this.OceanMapUri = 'https://googledrive.com/host/' + unquoteString(value);
                }
            }
        };
        MapConfiguration.prototype.AssignFromUrl = function (urlString) {
            var locationInfo = MinecraftMap.parseURL(urlString);
            if (Object.keys !== undefined && Object.keys(locationInfo.params).length == 0) {
                // Check for the Google bug (where GoogleDrive intermittently performs a 301 redirect and
                // loses all of the URL paramters in the process)
                if (location.host.indexOf("googledrive.com") > 20) {
                    // there are no URL parameters and the URL has been changed to something like
                    // https://85b5da109cbab0a781619b9c891f667f8ebe60b8.googledrive.com/host/0B35KCzsTLKY1QTB6MEdoYkp2VGs/index.html
                    // (See http://stackoverflow.com/questions/24188499)
                    alert('no "src=" url was specified to scrape the location data from.\n\n' +
                        '(On the off-chance you did specify a src parameter and it\'s gone, then Google Drive could be experiencing problems again:\n' +
                        'See http://buildingwithblocks.info/googlebug for more details)');
                    this.MissingSrcMessageDisplayed = true;
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
            if ('title' in locationInfo.params && MinecraftMap.isString(locationInfo.params.title)) {
                // Google Drive has a bug in its redirect where %20 gets turned into + instead of being
                // preserved, and decodeURIComponent doesn't decode +, so turn them back into %20 first.
                this.Title = decodeURIComponent(locationInfo.params.title.replace(/\+/g, " "));
            }
            // if "blurb" is specified on the URL then change the tag line
            if ('blurb' in locationInfo.params && MinecraftMap.isString(locationInfo.params.blurb)) {
                // Google Drive has a bug in its redirect where %20 gets turned into + instead of being
                // preserved, and decodeURIComponent doesn't decode +, so turn them back into %20 first.
                this.Blurb = decodeURIComponent(locationInfo.params.blurb.replace(/\+/g, " "));
            }
            // if "x" is specified on the URL then change the center of the map
            if ('x' in locationInfo.params) {
                var new_x = parseInt(locationInfo.params.x);
                if (!isNaN(new_x))
                    this.X = new_x;
            }
            // if "z" is specified on the URL then change the center of the map
            if ('z' in locationInfo.params) {
                var new_z = parseInt(locationInfo.params.z);
                if (!isNaN(new_z))
                    this.Z = new_z;
            }
            // if "hideorigin" or "hidescale" is on the url then set ShowOrigin to false, likewise with ShowScale
            if ('hideorigin' in locationInfo.params)
                this.ShowOrigin = false;
            if ('hidescale' in locationInfo.params)
                this.ShowScale = false;
            // or showorigin and showscale could be specified explicitly
            if ('showorigin' in locationInfo.params && MinecraftMap.isString(locationInfo.params.showorigin)) {
                this.ShowOrigin = MinecraftMap.stringToBool(locationInfo.params.showorigin);
            }
            if ('showscale' in locationInfo.params && MinecraftMap.isString(locationInfo.params.showscale)) {
                this.ShowScale = MinecraftMap.stringToBool(locationInfo.params.showscale);
            }
            if ('showcoordinates' in locationInfo.params && MinecraftMap.isString(locationInfo.params.showcoordinates)) {
                this.ShowCoordinates = MinecraftMap.stringToBool(locationInfo.params.showcoordinates);
            }
            // if "icons" is specified on the URL then set the CustomIconsUri to load the images.
            if ('icons' in locationInfo.params && MinecraftMap.isString(locationInfo.params.icons)) {
                this.CustomIconsUri = locationInfo.params.icons;
            }
            if ('googleicons' in locationInfo.params && MinecraftMap.isString(locationInfo.params.googleicons)) {
                this.CustomIconsUri = 'https://googledrive.com/host/' + locationInfo.params.googleicons;
            }
            if ('src' in locationInfo.params && MinecraftMap.isString(locationInfo.params.src)) {
                this.MapDataUri = decodeURIComponent(locationInfo.params.src);
            }
            // Some extra support for hosting via Google Drive, as google drive is a good way to make
            // the map collaborative while avoiding cross-domain data headaches.
            if ('googlesrc' in locationInfo.params && MinecraftMap.isString(locationInfo.params.googlesrc)) {
                if (locationInfo.params.googlesrc.toLowerCase().indexOf('http') == 0) {
                    // User has used googlesrc when they should have used src. Rather than
                    // explain the error just correct it.
                    this.MapDataUri = locationInfo.params.googlesrc;
                }
                else {
                    this.MapDataUri = 'https://googledrive.com/host/' + locationInfo.params.googlesrc;
                    // People frequently create location files in Google Documents instead of .txt files,
                    // until support for Google docs can be added, try to detect this mistake so the error
                    // message can be meaningful. I don't know much about Google's id strings, but the doc
                    // ones always seem to long and the file ones short, e.g:
                    //
                    // Example Google Doc id:        1nKzgtZKPzY8UKAGVtcktIAaU8cukUTjOg--ObQbMtPs
                    // Example Google Drive file id: 0B35KCzsTLKY1YkVMeWRBemtKdHM
                    // (28 chars vs 44)
                    if (locationInfo.params.googlesrc.length > 40)
                        this.GoogleSrcLooksLikeDoc = true;
                }
            }
            if ('oceansrc' in locationInfo.params && MinecraftMap.isString(locationInfo.params.oceansrc)) {
                this.OceanMapUri = decodeURIComponent(locationInfo.params.oceansrc);
            }
            if ('oceangooglesrc' in locationInfo.params && MinecraftMap.isString(locationInfo.params.oceangooglesrc)) {
                if (locationInfo.params.oceangooglesrc.toLowerCase().indexOf('http') == 0) {
                    // User has used oceangooglesrc when they should have used oceansrc. Rather than
                    // explain the error just correct it.
                    this.OceanMapUri = locationInfo.params.oceangooglesrc;
                }
                else {
                    this.OceanMapUri = 'https://googledrive.com/host/' + locationInfo.params.oceangooglesrc;
                }
            }
            if ('oceantheme' in locationInfo.params && MinecraftMap.isString(locationInfo.params.oceantheme)) {
                this.OceanTheme = locationInfo.params.oceantheme;
                this.HardCoastlines = this.OceanTheme.lastIndexOf("hard") == (this.OceanTheme.length - 4) && (this.OceanTheme.length > 3);
                if (this.HardCoastlines)
                    this.OceanTheme = this.OceanTheme.substr(0, this.OceanTheme.length - 4);
            }
        };
        /** Returns a function that converts Minecraft coordinates into canvas coordinates */
        MapConfiguration.prototype.GetXTranslationFunction = function (mapSize) {
            var halfMapSize = mapSize / 2;
            // the closure won't automatically keep a reference to 'this' so take a copy.
            var mapX = this.X;
            var mapRange = this.MapRange;
            return function (coord) {
                return ((coord - mapX) * halfMapSize / mapRange) + halfMapSize;
            };
        };
        /** Returns a function that converts Minecraft coordinates into canvas coordinates */
        MapConfiguration.prototype.GetZTranslationFunction = function (mapSize) {
            var halfMapSize = mapSize / 2;
            // the closure won't automatically keep a reference to 'this' so take a copy.
            var mapZ = this.Z;
            var mapRange = this.MapRange;
            return function (coord) {
                return ((coord - mapZ) * halfMapSize / mapRange) + halfMapSize;
            };
        };
        return MapConfiguration;
    }());
    MinecraftMap.MapConfiguration = MapConfiguration;
    // -----------------------------
    var SuppressableLabel = (function () {
        // Constructor
        // text: the text of the label.
        // displayOverride: an enumeration of type LabellingStyleOverride indicating whether the text should
        // be suppressed from the map rendering (only shown on hover etc.), always drawn regardless of the labellingStyle
        // of the zoom level, or drawn when suitable (default)
        function SuppressableLabel(text, displayOverride) {
            if (displayOverride === void 0) { displayOverride = LabellingStyleOverride.normal; }
            this.text = text;
            this.displayOverride = displayOverride;
            this.suppress = this.displayOverride === LabellingStyleOverride.suppress;
            this.always = this.displayOverride === LabellingStyleOverride.always;
        }
        SuppressableLabel.prototype.toString = function () {
            return this.text;
        };
        // Parses "suppression-marked-up" text and returns a SuppressableLabel.
        //  * If 'markedupLabel' is surrounded by cLabel_DontDrawChar (~), then
        //    they are removed and .suppress is set to true.
        //  * If 'markedupLabel' is surrounded by cLabel_AlwaysDrawChar (!), then
        //    they are removed and .always is set to true.
        SuppressableLabel.parse = function (markedupLabel) {
            var result = new SuppressableLabel(markedupLabel);
            if (MinecraftMap.isString(markedupLabel)) {
                var trimLabelStr = MinecraftMap.trim(markedupLabel);
                if (trimLabelStr.length >= 2) {
                    if (trimLabelStr[0] == MinecraftMap.cLabel_DontDrawChar && trimLabelStr[trimLabelStr.length - 1] == MinecraftMap.cLabel_DontDrawChar) {
                        result = new SuppressableLabel(trimLabelStr.substring(1, trimLabelStr.length - 1), LabellingStyleOverride.suppress);
                    }
                    else if (trimLabelStr[0] == MinecraftMap.cLabel_AlwaysDrawChar && trimLabelStr[trimLabelStr.length - 1] == MinecraftMap.cLabel_AlwaysDrawChar) {
                        result = new SuppressableLabel(trimLabelStr.substring(1, trimLabelStr.length - 1), LabellingStyleOverride.always);
                    }
                }
            }
            return result;
        };
        return SuppressableLabel;
    }());
    MinecraftMap.SuppressableLabel = SuppressableLabel;
    // -----------------------------
    var Location = (function () {
        // Constructor
        // x, z: coords in Minecraft.
        // Type: should be an element of LocationType
        function Location(x, z, type, description, owner, href, iconIndex) {
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
        Location.prototype.getHrefAndTarget = function (overrideOnly) {
            if (this.hrefOverride == "-") {
                // Don't defer to the default href
                return new HrefAndTarget("");
            }
            else {
                return new HrefAndTarget((MinecraftMap.isEmpty(this.hrefOverride) && overrideOnly !== true) ? this.type.href : this.hrefOverride);
            }
        };
        ;
        Location.prototype.getLabel = function () {
            return MinecraftMap.isEmpty(this.labelOverride.text) ? this.type.name : this.labelOverride.text;
        };
        ;
        Location.prototype.getIconIndex = function () {
            return (isNaN(this.iconIndexOverride) || this.iconIndexOverride < 0) ? this.type.iconIndex : this.iconIndexOverride;
        };
        ;
        Location.prototype.getAlt = function () {
            var result = this.getLabel();
            if (MinecraftMap.isEmpty(result) && !MinecraftMap.isEmpty(this.owner.text))
                result = this.owner.text;
            return result;
        };
        ;
        return Location;
    }());
    MinecraftMap.Location = Location;
    // -----------------------------
    var HrefAndTarget = (function () {
        // Constructor
        function HrefAndTarget(urlString) {
            // the target is optional, if the urlString begins with an underscore
            // then assume the url has been prefixed with the target, delimited with
            // another underscore.
            this.target = MinecraftMap.gHrefTargetDefault;
            if (MinecraftMap.isEmpty(urlString)) {
                this.href = "";
            }
            else {
                if (urlString[0] == '_') {
                    var splitPos = urlString.indexOf("_", 1);
                    if (splitPos > 0) {
                        // A target was specified in this string, split the string into target and href.
                        this.target = urlString.substring(0, splitPos);
                        this.href = urlString.substring(splitPos + 1);
                    }
                    else {
                        this.href = urlString;
                    }
                }
                else {
                    this.href = urlString;
                }
            }
        }
        return HrefAndTarget;
    }());
    // -----------------------------
    var Rectangle = (function () {
        // Constructor
        function Rectangle(x1, y1, x2, y2) {
            this.equals = function (rectangle) {
                return (this.x1 == rectangle.x1 &&
                    this.y1 == rectangle.y1 &&
                    this.x2 == rectangle.x2 &&
                    this.y2 == rectangle.y2);
            };
            this.x1 = Math.min(x1, x2);
            this.y1 = Math.min(y1, y2);
            this.x2 = Math.max(x1, x2);
            this.y2 = Math.max(y1, y2);
            this.width = 1 + x2 - x1;
            this.height = 1 + y2 - y1;
        }
        // translate_x and translate_y are optional
        Rectangle.prototype.stroke = function (canvasContext, translate_x, translate_y) {
            if (translate_x === undefined)
                translate_x = 0;
            if (translate_y === undefined)
                translate_y = 0;
            canvasContext.strokeRect(this.x1 + translate_x, this.y1 + translate_y, this.width, this.height);
        };
        // translate_x are translate_y optional
        Rectangle.prototype.copy = function (translate_x, translate_y) {
            if (translate_x === undefined)
                translate_x = 0;
            if (translate_y === undefined)
                translate_y = 0;
            return new Rectangle(this.x1 + translate_x, this.y1 + translate_y, this.x2 + translate_x, this.y2 + translate_y);
        };
        // Returns true if the interior of this rectangle intersects with the interior of a supplied rectangle.
        // When they are just touching each other it's considered non-intersecting.
        Rectangle.prototype.intersects = function (rectangle) {
            return (this.x2 > rectangle.x1 &&
                this.x1 < rectangle.x2 &&
                this.y2 > rectangle.y1 &&
                this.y1 < rectangle.y2);
        };
        return Rectangle;
    }());
    MinecraftMap.Rectangle = Rectangle;
    // -----------------------------
    // Set url to an empty string if you want to make the ?src= URL parameter required,
    // or use it to avoid needing the ?src= parameter by "hardcoding" where the locations
    // are loaded from.
    function SetDefaultSrc(url) {
        if (MinecraftMap.isString(url)) {
            MinecraftMap.gMapDataUriDefault = url;
        }
        else {
            alert("SetDefaultSrc() was passed a non-string value");
        }
    }
    MinecraftMap.SetDefaultSrc = SetDefaultSrc;
    // Set the target to use for urls that don't specify a target.
    // Normally it doesn't matter but when running in an iframe you should set the
    // default target to be '_parent'
    // Valid values would be '_blank', '_self', '_parent', or '_top'
    // (See HrefAndTarget() for details about how to explicitly include a target in a url)
    function SetDefaultHrefTarget(target) {
        if (MinecraftMap.isString(target)) {
            MinecraftMap.gHrefTargetDefault = target;
        }
        else {
            alert("SetDefaultHrefTarget() was passed a non-string value");
        }
    }
    MinecraftMap.SetDefaultHrefTarget = SetDefaultHrefTarget;
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
        }
        catch (err) {
            alert('Could not parse comma seperated values for entry/line ' + entryNumber.toString() + ': ' + err);
        }
        var typeName = values[0];
        // Wikis can treat camelcase words like "PlayerStructure" as wikiwords and
        // put a questionmark after them so remove any trailing questionmark.
        if (typeName[typeName.length - 1] == '?')
            typeName = typeName.substring(0, typeName.length - 1);
        if (typeName in LocationType) {
            var new_type = LocationType[typeName];
            var new_x = parseInt(values[1]);
            var new_z = parseInt(values[2]);
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
        if (MinecraftMap.isString(str) && str.length >= 2) {
            if (str[0] == '"' && str[str.length - 1] == '"') {
                var parsedStr = jQuery.parseJSON('{"value":' + str + '}');
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
        for (i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line[0] != '/') {
                var newLocation = createLocationFromRow(i + 1, lines[i]);
                if (newLocation instanceof Location) {
                    locationList.push(newLocation);
                }
                else {
                    config.AssignFromRow(lines[i]);
                }
            }
        }
        callback(config, locationList);
    }
    MinecraftMap.parseTextLocations = parseTextLocations;
    function parseHtmlLocations(data, callback) {
        function encodeForCsv(value) {
            // if value contains any quotemarks or commas and is not already quoted then
            // wrap it in quotes so it can safely be concatenated csv-style
            var result = value;
            var trimValue = MinecraftMap.trim(value);
            var isQuoted = trimValue.length >= 2 && trimValue[0] == '"' && trimValue[trimValue.length - 1] == '"';
            if (!isQuoted) {
                if (trimValue.indexOf(',') >= 0 || trimValue.indexOf('"') >= 0) {
                    // This string needs to be quoted
                    result = '"' + trimValue.replace(/"/g, '""') + '"';
                }
            }
            return result;
        }
        var config = new MapConfiguration();
        var locationList = [];
        var htmlDom = jQuery.parseHTML(data);
        var entryNumber = 0;
        // scrape any locations contained in tables
        $(htmlDom).find('tr').each(function () {
            var rowString = "";
            entryNumber++;
            $(this).find('td').each(function () {
                rowString += encodeForCsv(this.textContent) + ',';
            });
            var newLocation = createLocationFromRow(entryNumber, rowString);
            if (newLocation instanceof Location) {
                locationList.push(newLocation);
            }
            else {
                config.AssignFromRow(rowString);
            }
        });
        // scrape any locations contained in unordered lists and ordered lists
        entryNumber = 0;
        $(htmlDom).find('ul, ol').each(function () {
            $(this).find('li').each(function () {
                entryNumber++;
                var newLocation = createLocationFromRow(entryNumber, this.textContent);
                if (newLocation instanceof Location) {
                    locationList.push(newLocation);
                }
                else {
                    config.AssignFromRow(this.textContent);
                }
            });
        });
        callback(config, locationList);
    }
    MinecraftMap.parseHtmlLocations = parseHtmlLocations;
})(MinecraftMap || (MinecraftMap = {}));
/********************************************
 Javascript map drawing functions.

 Copyright 2015 Glenn Fisher

****/
var MinecraftMap;
(function (MinecraftMap) {
    "use strict";
    // zoomLevelNumber indicates which level of zoom we are creating the map for. 0 is the most zoomed
    // out map, 1 is the first level of zooming in, etc.
    function createMapImageInDiv(zoomLevelNumber, divElementName, aWidth, aHeight, config, locations, finishedCallback) {
        var canvas = document.createElement('canvas');
        canvas.width = aWidth;
        canvas.height = aHeight;
        var labellingStyle;
        if (zoomLevelNumber < config.HideLabelsAbove) {
            labellingStyle = MinecraftMap.LabellingStyle.none;
        }
        else if (zoomLevelNumber >= config.ShowLabelsBelow) {
            labellingStyle = MinecraftMap.LabellingStyle.all;
        }
        else {
            labellingStyle = MinecraftMap.LabellingStyle.smart;
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
        newImage.onload = function () { deferUntilImageLoaded.resolve(); };
        newImage.src = canvas.toDataURL("image/png");
        newImage.useMap = '#' + areaMapId;
        var divElement = document.getElementById(divElementName);
        $(newImage).appendTo(divElement);
        // finishedCallback is called once this function has finished AND newImage was updated.
        $.when(deferUntilImageLoaded).done(finishedCallback);
    }
    MinecraftMap.createMapImageInDiv = createMapImageInDiv;
    // returns the name of the map
    function CreateAreaMapInDiv(divElementName, aWidth, aHeight, config, locations) {
        var result = divElementName + '-areamap';
        var mapSize = aWidth > aHeight ? aWidth : aHeight;
        var translateCoord_x = config.GetXTranslationFunction(mapSize);
        var translateCoord_z = config.GetZTranslationFunction(mapSize);
        var newmap = document.createElement('map');
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
            if (!MinecraftMap.isEmpty(hrefAndTarget.href)) {
                newArea.href = hrefAndTarget.href;
                newArea.target = hrefAndTarget.target;
                includeArea = true;
            }
            var htmlString = generateHtmlLabel(location, config.ShowCoordinates && !config.DisableCoordinates);
            if (htmlString.length > 0) {
                $(newArea).mouseover(CreateHandler_mouseover(htmlString));
                $(newArea).mouseout(Handle_mouseout);
                includeArea = true;
            }
            if (includeArea) {
                newArea.shape = 'circle';
                newArea.coords = translateCoord_x(location.x) + ',' + translateCoord_z(location.z) + ',' + (MinecraftMap.cClickRadius * MinecraftMap.gLocationIconScale);
                newArea.alt = location.getAlt();
                $(newArea).appendTo(newmap);
            }
        }
        $(newmap).appendTo(document.getElementById(divElementName));
        return result;
    }
    function CreateHandler_mouseover(htmlLabel) {
        // Creates a closure so the event handler keeps a reference to the label
        return function (eventObject) {
            $("#locationDesc").empty();
            $("#locationDesc").append(htmlLabel);
            $("#hoverFrame").removeClass('hidden-hoverFrame');
        };
    }
    function Handle_mouseout(eventObject) {
        $("#hoverFrame").addClass('hidden-hoverFrame');
        $("#locationDesc").empty();
    }
    function generateHtmlLabel(location, includeCoordinates) {
        var result = "";
        var label = location.getLabel();
        if (MinecraftMap.isNotEmptyString(label))
            label = strToHtml(MinecraftMap.trim(label));
        var owner = location.owner.text;
        if (MinecraftMap.isNotEmptyString(owner))
            owner = strToHtml(MinecraftMap.trim(owner));
        var ownerPos = MinecraftMap.isNotEmptyString(owner) ? label.indexOf(owner) : -1;
        var htmlOwner = '<span class="locationHoverOwner">' + owner + '</span>';
        var showOwner = true;
        if (MinecraftMap.isNotEmptyString(label) && label != owner) {
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
            if (MinecraftMap.isNotEmptyString(owner) && showOwner) {
                result += '<br/>';
            }
        }
        if (MinecraftMap.isNotEmptyString(owner) && showOwner)
            result += htmlOwner;
        if (MinecraftMap.isNotEmptyString(result) && includeCoordinates) {
            result += '<span class="locationHoverCoordinates"><br/>' + location.x + ', ' + location.z + '</span>';
        }
        if (MinecraftMap.isNotEmptyString(result) && MinecraftMap.isNotEmptyString(location.getHrefAndTarget(true).href)) {
            result += '<div style="height: 11px"><img src="img/link.png" height="7" style="vertical-align: middle"></div>';
        }
        return result;
    }
    function strToHtml(str) {
        return str.replace("\n", " ").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
    // if labellingStyle is set LabellingStyle.none then no captions will be rendered.
    function drawMapDetails(canvas, config, locations, labellingStyle) {
        var cTextLineHeight = 10 * MinecraftMap.gLocationFontScale;
        var ctx = canvas.getContext("2d");
        var mapSize = canvas.width > canvas.height ? canvas.width : canvas.height;
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
            }
            else {
                // It hasn't been calculated yet, so do that now.
                // We cache it from a position 0, 0 because the actual translation will
                // change depending on the zoom level.
                // (I'm caching it because I assume that determining graphical text width is slow - could be wrong, need to test)
                boundsAtOrigin = multilineCenteredText_bounds(0, pixelOffsetFromLocation_y, finalizedCaption, 1);
                locationInstance.BoundsAtOrigin = boundsAtOrigin; // cache it
            }
            var result = [];
            var i;
            for (i = 0; i < boundsAtOrigin.length; i++) {
                result[i] = boundsAtOrigin[i].copy(translateCoord_x(locationInstance.x), translateCoord_z(locationInstance.z));
            }
            return result;
        }
        // returns an array of bounding Rectangle instances that enclose the text which
        // would be rendered by multilineCenteredText_draw()
        function multilineCenteredText_bounds(x, y, text, padding) {
            var result = [];
            if (!(padding < 0) && !(padding > 0))
                padding = 0;
            if (!MinecraftMap.isEmpty(text)) {
                var textOffset = 1 * MinecraftMap.gLocationFontScale; // a starting offset of 1 is better by eye than 0, dunno if it's due to font, browser, or canvas
                var lines = splitIntoLines(text);
                var lineNo;
                for (lineNo = 0; lineNo < lines.length; lineNo++) {
                    var lineWidth = ctx.measureText(lines[lineNo]).width;
                    var leftTrim_lineWidth = ctx.measureText(MinecraftMap.trimLeft(lines[lineNo])).width;
                    var rightTrim_lineWidth = ctx.measureText(MinecraftMap.trimRight(lines[lineNo])).width;
                    var leftMargin = lineWidth - leftTrim_lineWidth;
                    var rightMargin = lineWidth - rightTrim_lineWidth;
                    var bound_x = x - (lineWidth - 1) / 2;
                    var bound_y = y + textOffset;
                    result[lineNo] = new MinecraftMap.Rectangle(bound_x + leftMargin - padding, bound_y - cTextLineHeight - padding, bound_x + (lineWidth - 1) - rightMargin + padding, bound_y + padding);
                    textOffset += cTextLineHeight;
                }
            }
            return result;
        }
        function multilineCenteredText_draw(x, y, text) {
            var textOffset = 0;
            if (!MinecraftMap.isEmpty(text)) {
                var lines = splitIntoLines(text);
                var lineNo;
                for (lineNo = 0; lineNo < lines.length; lineNo++) {
                    // y value for filltext is the baseline of the text
                    ctx.fillText(lines[lineNo], x - (ctx.measureText(lines[lineNo]).width / 2), y + textOffset);
                    textOffset += cTextLineHeight;
                }
            }
        }
        // returns the IconBoundsInformation for the specified icon, or width/height/offset
        // information of 0 if there is no icon.
        function getIconBoundsHint(iconIndex) {
            var result;
            if (isNaN(iconIndex) || iconIndex < 0) {
                result = { width: 0, height: 0, yOffset: 0, pixelArt: true };
            }
            else {
                var iconBounds = MinecraftMap.IconBoundsInformation[iconIndex];
                if (iconBounds === undefined) {
                    // The icon is not specified in IconBoundsInformation array, use default values
                    result = { width: 20, height: 20, yOffset: 0, pixelArt: true };
                }
                else {
                    // Clone it if we are scaling it so we don't screw up the IconBoundsInformation
                    // array when we scale the result
                    result = (MinecraftMap.gLocationIconScale == 1) ? iconBounds : {
                        width: iconBounds.width,
                        height: iconBounds.height,
                        yOffset: iconBounds.yOffset,
                        pixelArt: iconBounds.pixelArt
                    };
                }
            }
            result.width *= MinecraftMap.gLocationIconScale;
            result.height *= MinecraftMap.gLocationIconScale;
            result.yOffset *= MinecraftMap.gLocationIconScale;
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
            }
            else {
                var iconBoundsHint = getIconBoundsHint(index);
                if (iconBoundsHint.width != 0 && iconBoundsHint.height != 0) {
                    var topLeft_x = x - iconBoundsHint.width / 2;
                    var topLeft_z = z + iconBoundsHint.yOffset - iconBoundsHint.height / 2;
                    result[0] = new MinecraftMap.Rectangle(topLeft_x, topLeft_z, topLeft_x + iconBoundsHint.width - 1, topLeft_z + iconBoundsHint.height - 1);
                }
            }
            return result;
        }
        function icon_draw(index, drawMask, x, z) {
            if (!isNaN(index) && index >= 0) {
                if (index >= MinecraftMap.cCustomIconIndexStart) {
                    // it's a custom icon
                    if (MinecraftMap.gCustomIcons !== null) {
                        drawGlyph(ctx, MinecraftMap.gCustomIcons, index - MinecraftMap.cCustomIconIndexStart, true, drawMask, x, z);
                    }
                }
                else {
                    drawGlyph(ctx, tilesImage, index, MinecraftMap.IconBoundsInformation[index].pixelArt, drawMask, x, z);
                }
            }
        }
        // Adjust this to adjust which pass the different map parts are rendered in
        var RenderLayer = {
            Masks: 0,
            Origin: 1,
            Captions: 2,
            UncaptionedIcons: 3,
            CaptionedIcons: 4,
            Scale: 5,
            First: 0,
            Last: 5
        };
        function drawLocation(locationInstance, renderLayer) {
            var text = "";
            var location_x = translateCoord_x(locationInstance.x);
            var location_z = translateCoord_z(locationInstance.z);
            // don't show icons within 1/128th of the border (each map pixel is 1/64, so we're not showing icons closer than half a map pixel from the border).
            var clipLimit = Math.max(mapSize / 128, 8 * MinecraftMap.gLocationIconScale);
            if (location_x > clipLimit && location_z > clipLimit && location_x < (mapSize - clipLimit) && location_z < (mapSize - clipLimit)) {
                // Use labelOverride instead of getLabel so that default labels will be dropped (the icon will be enough)
                if (MinecraftMap.isEmpty(locationInstance.labelOverride.text) || locationInstance.labelOverride.suppress) {
                    if (!MinecraftMap.isEmpty(locationInstance.owner.text) && !locationInstance.owner.suppress)
                        text += locationInstance.owner.text;
                }
                else {
                    text += locationInstance.labelOverride.text;
                }
                if (!MinecraftMap.isEmpty(locationInstance.owner.text) && (text.indexOf(locationInstance.owner.text) == -1) && !locationInstance.owner.suppress) {
                    // The owner was specified, and is not named in the description, add in brackets at the bottom
                    text += '\n(' + locationInstance.owner.text + ')';
                }
                if (!MinecraftMap.isEmpty(text) && renderLayer == RenderLayer.Captions && labellingStyle != MinecraftMap.LabellingStyle.none) {
                    var iconIndex = locationInstance.getIconIndex();
                    var textOffset;
                    if (isNaN(iconIndex) || iconIndex < 0) {
                        // Put the text where the icon would be. Text is 6px to 8px high, so add half of that
                        textOffset = 3 * MinecraftMap.gLocationFontScale;
                    }
                    else {
                        var boundsInfo = getIconBoundsHint(iconIndex);
                        textOffset = (MinecraftMap.cCaptionSpacer_vertical * MinecraftMap.gLocationFontScale) + boundsInfo.yOffset + (boundsInfo.height / 2);
                    }
                    var drawLabel = true;
                    var drawLabelRegardless = locationInstance.labelOverride.always || locationInstance.owner.always;
                    if (labellingStyle == MinecraftMap.LabellingStyle.smart) {
                        // check the space needed by the label isn't already occupied
                        var boundingboxes = locationLabel_bounds(locationInstance, text, textOffset);
                        var boxIndex;
                        for (boxIndex = 0; boxIndex < boundingboxes.length; boxIndex++) {
                            var box = boundingboxes[boxIndex];
                            var i;
                            for (i = 0; i < occupiedSpace.length; i++) {
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
                            if (!drawLabel)
                                break;
                        }
                        if (drawLabel || drawLabelRegardless) {
                            // Add the space taken by this label to occupiedSpace
                            occupiedSpace = occupiedSpace.concat(boundingboxes);
                        }
                    }
                    if (drawLabel || drawLabelRegardless) {
                        multilineCenteredText_draw(location_x, location_z + textOffset, text);
                    }
                    if (MinecraftMap.cShowBoundingBoxes) {
                        // debug code for showing bounding boxes
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = "#0000FF";
                        var boxes = locationLabel_bounds(locationInstance, text, 0);
                        var i;
                        for (i = 0; i < boxes.length; i++) {
                            boxes[i].stroke(ctx);
                        }
                    }
                }
                if (renderLayer == RenderLayer.Masks) {
                    icon_draw(locationInstance.getIconIndex(), true, location_x, location_z);
                }
                if (MinecraftMap.isEmpty(text)) {
                    if (renderLayer == RenderLayer.UncaptionedIcons) {
                        icon_draw(locationInstance.getIconIndex(), false, location_x, location_z);
                    }
                }
                else {
                    if (renderLayer == RenderLayer.CaptionedIcons) {
                        icon_draw(locationInstance.getIconIndex(), false, location_x, location_z);
                    }
                }
            }
        }
        function drawOrigin() {
            var crosshairSize = 8 * MinecraftMap.gLocationIconScale;
            var originX = Math.round(translateCoord_x(0));
            var originZ = Math.round(translateCoord_z(0));
            ctx.lineWidth = 2 * MinecraftMap.gLocationIconScale;
            ctx.strokeStyle = "#6e5830";
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
            ctx.lineWidth = 2 * MinecraftMap.gLocationFontScale;
            ctx.strokeStyle = "#6e5830";
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
        ctx.drawImage(mapBackground, 0, 0, canvas.width, canvas.height);
        // prefil the occupiedSpace array with boxes indicating where graphics are.
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#FF00FF";
        var i;
        for (i = 0; i < locations.length; i++) {
            var locationInstance = locations[i];
            var bounds = icon_bounds(locationInstance.getIconIndex(), translateCoord_x(locationInstance.x), translateCoord_z(locationInstance.z), 0);
            if (bounds.length > 0) {
                occupiedSpace[occupiedSpace.length] = bounds[0];
                if (MinecraftMap.cShowBoundingBoxes)
                    bounds[0].stroke(ctx); // debug code for showing bounding boxes
            }
        }
        ctx.font = cTextLineHeight + "px Arial";
        ctx.font = cTextLineHeight + "px 'Merienda', Arial, sans-serif";
        if (MinecraftMap.gLocationFontScale > 1)
            ctx.fillStyle = '#553A24'; // At a scale of 1, text is so thin it's better to leave the color as black. Otherwise dark brown.
        var renderLayer;
        for (renderLayer = RenderLayer.First; renderLayer <= RenderLayer.Last; renderLayer++) {
            if (renderLayer == RenderLayer.Origin) {
                if (config.ShowOrigin)
                    drawOrigin();
            }
            else if (renderLayer == RenderLayer.Scale) {
                if (config.ShowScale)
                    drawScale();
            }
            else if (renderLayer == RenderLayer.Captions) {
                // Labels are rendered first to last, so that with smart-labels, locations
                // higher in the list reserve their label space first.
                var index;
                for (index = 0; index < locations.length; index++) {
                    drawLocation(locations[index], renderLayer);
                }
            }
            else {
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
        if (makePixelated === undefined)
            makePixelated = true;
        // Make the paper-background scaling pixelated on as many browsers as possible (to match Minecraft's artistic direction)
        ctx.mozImageSmoothingEnabled = !makePixelated;
        ctx.webkitImageSmoothingEnabled = !makePixelated;
        ctx.msImageSmoothingEnabled = !makePixelated;
        ctx.imageSmoothingEnabled = !makePixelated;
    }
    // Put any rendering tasks in here that should be performed only once (instead
    // of being performed for every zoom level)
    function PreRender(config) {
        if (MinecraftMap.gOceanMapImage != null) {
            // An oceanmask has been provided, render a new map-background with
            // it instead of using the default one.
            var mapBackgroundImage = document.getElementById('map-background');
            var newMapBackgroundCanvas = MinecraftMap.renderOcean(config, mapBackgroundImage, MinecraftMap.gOceanMapImage);
            mapBackgroundImage.src = newMapBackgroundCanvas.toDataURL("image/png");
        }
    }
    MinecraftMap.PreRender = PreRender;
    // Assumes tiles are square, arranged beside each other in the tileImage left to right in two
    // rows (top row icons, bottom row masks) and should be drawn centered.
    // This means user can change size of icons just by changing the images the tiles are in.
    //
    // tilesImage: an img element
    // drawMask: if True, the icon mask will be drawn (i.e. the bottom row)
    function drawGlyph(canvasContext, tilesImage, tileIndex, isPixelArt, drawMask, x, y) {
        var width = tilesImage.height / 2;
        var halfDestWidth = (width / 2) * MinecraftMap.gLocationIconScale;
        if (MinecraftMap.gLocationIconScale != 1) {
            // Icon is being scaled, determine which way to scale it
            setCanvasScalingToPixelated(canvasContext, isPixelArt && !drawMask);
        }
        canvasContext.drawImage(tilesImage, tileIndex * width, drawMask ? width : 0, width, width, x - halfDestWidth, y - halfDestWidth, width * MinecraftMap.gLocationIconScale, width * MinecraftMap.gLocationIconScale);
    }
})(MinecraftMap || (MinecraftMap = {}));
/********************************************
 helper functions for rendering graphics

 Copyright 2015 Glenn Fisher
****/
var MinecraftMap;
(function (MinecraftMap) {
    "use strict";
    var RGB = (function () {
        /** alapha is optional */
        function RGB(red, green, blue, alpha) {
            this.R = red;
            this.G = green;
            this.B = blue;
            this.A = (alpha === undefined) ? 255 : alpha;
        }
        // weight is a value between 0 and 1 which indicate how the result is
        // split between the instance and the colour provided as a parameter
        // (1 = 100% the colour provided as a parameter)
        RGB.prototype.Blend = function (color_rgb, weight) {
            // clamp the weight to between 0 and 1
            weight = (weight < 0) ? 0.0 : ((weight > 1) ? 1.0 : weight);
            var counterweight = 1.0 - weight;
            return new RGB(Math.round((color_rgb.R * weight) + (this.R * counterweight)), Math.round((color_rgb.G * weight) + (this.G * counterweight)), Math.round((color_rgb.B * weight) + (this.B * counterweight)));
        };
        // Returns true if the colour components match, regardless of alpha
        RGB.prototype.MatchesRGB = function (red, green, blue) {
            return red == this.R && green == this.G && blue == this.B;
        };
        // Returns true if the colour components match, regardless of alpha
        RGB.prototype.Matches = function (color_rgb) {
            return (color_rgb instanceof RGB) && color_rgb.R == this.R && color_rgb.G == this.G && color_rgb.B == this.B;
        };
        return RGB;
    }());
    MinecraftMap.RGB = RGB;
    function cloneCanvas(oldCanvasOrImage) {
        var newCanvas = document.createElement('canvas');
        newCanvas.width = oldCanvasOrImage.width;
        newCanvas.height = oldCanvasOrImage.height;
        var context = newCanvas.getContext('2d');
        context.drawImage(oldCanvasOrImage, 0, 0);
        return newCanvas;
    }
    MinecraftMap.cloneCanvas = cloneCanvas;
})(MinecraftMap || (MinecraftMap = {}));
/********************************************
 Javascript miscellaneous helper functions.

 Copyright 2015 Glenn Fisher (except for attributed code snippets)

****/
var MinecraftMap;
(function (MinecraftMap) {
    "use strict";
    // ---------------------------------------------
    // Type checking.
    function isEmpty(str) {
        return (!str || 0 === str.length);
    }
    MinecraftMap.isEmpty = isEmpty;
    function isString(str) {
        return (typeof str === 'string' || str instanceof String);
    }
    MinecraftMap.isString = isString;
    function isNotEmptyString(str) {
        return (typeof str === 'string' || str instanceof String) && str.length > 0;
    }
    MinecraftMap.isNotEmptyString = isNotEmptyString;
    function isFunction(item) {
        return typeof item === 'function';
    }
    MinecraftMap.isFunction = isFunction;
    // ---------------------------------------------
    // Type conversion
    function stringToBool(value) {
        switch (trim(value).toLowerCase()) {
            case "true":
            case "on":
            case "yes":
            case "1":
                return true;
            case "false":
            case "off":
            case "no":
            case "0":
            case null:
                return false;
            default:
                return Boolean(value);
        }
    }
    MinecraftMap.stringToBool = stringToBool;
    function imageToCanvas(image) {
        var canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext("2d").drawImage(image, 0, 0);
        return canvas;
    }
    MinecraftMap.imageToCanvas = imageToCanvas;
    // ---------------------------------------------
    // Wow, Internet Explorer doesn't have trim functions, include some.
    function trimRight(stringValue) {
        if (isFunction(stringValue.trimRight)) {
            return stringValue.trimRight();
        }
        else {
            return stringValue.replace(/\s+$/, "");
        }
    }
    MinecraftMap.trimRight = trimRight;
    function trimLeft(stringValue) {
        if (isFunction(stringValue.trimLeft)) {
            return stringValue.trimLeft();
        }
        else {
            return stringValue.replace(/^\s+/, "");
        }
    }
    MinecraftMap.trimLeft = trimLeft;
    function trim(stringValue) {
        if (isFunction(stringValue.trim)) {
            return stringValue.trim();
        }
        else {
            return stringValue.replace(/^\s+|\s+$/g, '');
        }
    }
    MinecraftMap.trim = trim;
    // ---------------------------------------------
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
        var a = document.createElement('a');
        a.href = url;
        return {
            source: url,
            protocol: a.protocol.replace(':', ''),
            host: a.hostname,
            port: parseInt(a.port),
            query: a.search,
            params: (function () {
                var ret = {}, seg = a.search.replace(/^\?/, '').split('&'), len = seg.length, i = 0, s;
                for (; i < len; i++) {
                    if (!seg[i]) {
                        continue;
                    }
                    s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }
                return ret;
            })(),
            file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
            hash: a.hash.replace('#', ''),
            path: a.pathname.replace(/^([^\/])/, '/$1'),
            relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
            segments: a.pathname.replace(/^\//, '').split('/')
        };
    }
    MinecraftMap.parseURL = parseURL;
    // ---------------------------------------------
    // code snippet from https://stereochro.me/ideas/detecting-broken-images-js
    // Returns true if the image is loaded
    function isImageOk(img) {
        // During the onload event, IE correctly identifies any images that
        // weren't downloaded as not complete. Others should too. Gecko-based
        // browsers act like NS4 in that they report this incorrectly.
        if (!img.complete) {
            return false;
        }
        // However, they do have two very useful properties: naturalWidth and
        // naturalHeight. These give the true size of the image. If it failed
        // to load, either of these should be zero.
        if (typeof img.naturalWidth != "undefined" && img.naturalWidth == 0) {
            return false;
        }
        // No other way of checking: assume it's ok.
        return true;
    }
    MinecraftMap.isImageOk = isImageOk;
})(MinecraftMap || (MinecraftMap = {}));
/// <reference path="MinecraftMap.graphics.ts" />
/********************************************
 renders a new map-background (if an oceanmap has been provided)

 Copyright 2015 Glenn Fisher

****/
var MinecraftMap;
(function (MinecraftMap) {
    "use strict";
    var cOceanBlocksPerPixel = 16; // scale of the oceanMaskImage
    var cWorkingCanvasOversample = 4; // the "workingCanvas" should be much smaller than the ocean mask to save processing time, but is still detailed enough to scale down to map-background size afterwards without visible aliasing.
    var cColor_Black = new MinecraftMap.RGB(0, 0, 0);
    var cColor_White = new MinecraftMap.RGB(255, 255, 255);
    function renderOcean(config, mapImage, oceanMaskImage) {
        // OceanMaskImage must be wider than 0 to avoid divide by zero
        if (oceanMaskImage.width == 0) {
            alert('Invalid ocean mask - width 0');
            return MinecraftMap.imageToCanvas(mapImage);
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
        var adj_mask_width = maskWidth - (adj_mask_x - mask_x);
        var adj_mask_height = maskWidth - (adj_mask_z - mask_z);
        adj_mask_width = adj_mask_width > oceanMaskImage.width ? oceanMaskImage.width : adj_mask_width;
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
        workingContext.drawImage(oceanMaskImage, adj_mask_x, adj_mask_z, adj_mask_width, adj_mask_height, 0, 0, working_width, working_height);
        var theme = config.OceanTheme.toLowerCase();
        if (theme == "darkseas") {
            return renderTheme_DarkSeas(config, mapImage, workingCanvas, dest_x, dest_z, dest_width, dest_height);
        }
        else if (theme == "coastalrelief") {
            return renderTheme_CoastalRelief(config, mapImage, workingCanvas, dest_x, dest_z, dest_width, dest_height);
        }
        else {
            return renderTheme_BlueCoastline(config, mapImage, workingCanvas, dest_x, dest_z, dest_width, dest_height);
        }
    }
    MinecraftMap.renderOcean = renderOcean;
    // Land is dark-coloured, with blue coastlines fading out to light-coloured oceans
    // Theme inspired by http://www.elfwood.com/~bell1973/Pirate-Treasure-map.2567659.html
    //
    // Returns a canvas to use as the map background. The size of the canvas returned should match the size of map_Image
    // Parameters:
    //   map_Image - the img object containing the default map-background image
    //   transformedOceanMask_Context - oceanMask that has been cropped and translated so it can be copied straight into map_Image
    //   dest_x, dest_z, dest_width, dest_height - the position to place transformedOceanMask_Context into map_Image
    function renderTheme_BlueCoastline(config, map_Image, transformedOceanMask_Canvas, dest_x, dest_z, dest_width, dest_height) {
        var cColor_BlueCoast = new MinecraftMap.RGB(127, 130, 146);
        var cColor_ShallowCoast = new MinecraftMap.RGB(0, 30, 30);
        var cColor_lightOcean = new MinecraftMap.RGB(243, 226, 194);
        var cColor_Land = new MinecraftMap.RGB(208, 177, 120);
        var cAlpha_Ocean = Math.round(0.8 * 255);
        var cAlpha_DeepOcean = Math.round(0.6 * 255);
        var cAlpha_Land = Math.round(0.2 * 255);
        var workingImage = CreateWorkingCanvas(config, transformedOceanMask_Canvas, dest_width, dest_height);
        var workingImage_Context = workingImage.getContext('2d');
        var working_width = workingImage.width;
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
        if (blurScale > 3)
            blurScale = 3; // Put a cap on it to stop stupid extremes
        blurRadius *= blurScale;
        stackBlurCanvasRGB(blurCanvas, 0, 0, blurCanvas.width, blurCanvas.height, blurRadius);
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
            if (coastBlendStartShade < 0.5) {
                coastBlendStartShade = 0.5;
            }
            else if (coastBlendStartShade > 0.7) {
                coastBlendStartShade = 0.7;
            }
            if (shade <= coastBlendStartShade)
                color = color.Blend(cColor_ShallowCoast, 0.5 - (0.5 * shade / coastBlendStartShade));
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
        for (z = 0; z < working_height; z++) {
            for (x = 0; x < working_width; x++) {
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
                    workingPixels[index] = colorLand_R;
                    workingPixels[index + 1] = colorLand_G;
                    workingPixels[index + 2] = colorLand_B;
                }
                else {
                    // ocean
                    var oceanDepth = (255 - blurPixel) / 255.0; // 0 to 1, 1 is deep, 0 is shallow
                    alpha = Math.round(cAlpha_Ocean * (1 - oceanDepth) + cAlpha_DeepOcean * oceanDepth); // chooses an alpha value between cAlpha_Ocean and cAlpha_DeepOcean, depending on oceanDepth
                    // After blurring the black ocean-mask with the white land-mask, dark areas in blurPixels[]
                    // means deep ocean, calculate a tableIndex where 0 is coast and 255 is deep ocean.
                    // (workingPixels[] is white for land, black for ocean, and grey for both)
                    var tableIndex = Math.round((255 - blurPixel) * 0.7);
                    if (tableIndex > 255)
                        tableIndex = 255;
                    if (tableIndex < 0)
                        tableIndex = 0;
                    workingPixels[index] = colorTable_R[tableIndex];
                    workingPixels[index + 1] = colorTable_G[tableIndex];
                    workingPixels[index + 2] = colorTable_B[tableIndex];
                }
                workingPixels[index + 3] = alpha;
                index += 4;
                blurIndex += blurPixelXInc;
            }
            blurIndex += blurPixelYInc;
        }
        workingImage_Context.putImageData(workingImageData, 0, 0);
        // Scale the processed ocean down to the same size as the mapImage, and
        // overlay it onto the paper texture of mapImage
        var mapBackgroundCopy_Canvas = MinecraftMap.cloneCanvas(map_Image);
        var mapBackgroundCopy_Context = mapBackgroundCopy_Canvas.getContext("2d");
        mapBackgroundCopy_Context.drawImage(workingImage, 0, 0, working_width, working_height, dest_x, dest_z, dest_width, dest_height);
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
        var cColor_Ocean = new MinecraftMap.RGB(144, 104, 67);
        var cColor_Land = new MinecraftMap.RGB(249, 232, 206);
        var cAlpha_Ocean = Math.round(0.7 * 255);
        var cAlphaFloor_Ocean = Math.round(0.2 * 255);
        var cAlpha_Land = Math.round(0.25 * 255);
        var workingImage = CreateWorkingCanvas(config, transformedOceanMask_Canvas, dest_width, dest_height);
        var workingImage_Context = workingImage.getContext('2d');
        var working_width = workingImage.width;
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
        if (blurScale > 3)
            blurScale = 3; // Put a cap on it to stop stupid extremes
        blurRadius *= blurScale;
        stackBlurCanvasRGB(blurCanvas, 0, 0, blurCanvas.width, blurCanvas.height, blurRadius);
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
        for (z = 0; z < working_height; z++) {
            for (x = 0; x < working_width; x++) {
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
                    workingPixels[index] = colorLand_R;
                    workingPixels[index + 1] = colorLand_G;
                    workingPixels[index + 2] = colorLand_B;
                }
                else {
                    // ocean
                    // pick an alpha between cAlpha_Ocean and cAlphaFloor_Ocean based on blurPixel, where
                    // blurPixel of 255 = cAlpha_Ocean and blurPixel of 0 = cAlphaFloor_Ocean
                    alpha = Math.round(blurPixel * (cAlpha_Ocean - cAlphaFloor_Ocean) / 255.0) + cAlphaFloor_Ocean;
                    workingPixels[index] = colorOcean_R;
                    workingPixels[index + 1] = colorOcean_G;
                    workingPixels[index + 2] = colorOcean_B;
                }
                workingPixels[index + 3] = alpha;
                index += 4;
                blurIndex += blurPixelXInc;
            }
            blurIndex += blurPixelYInc;
        }
        workingImage_Context.putImageData(workingImageData, 0, 0);
        // Scale the processed ocean down to the same size as the mapImage, and
        // overlay it onto the paper texture of mapImage
        var mapBackgroundCopy_Canvas = MinecraftMap.cloneCanvas(map_Image);
        var mapBackgroundCopy_Context = mapBackgroundCopy_Canvas.getContext("2d");
        mapBackgroundCopy_Context.drawImage(workingImage, 0, 0, working_width, working_height, dest_x, dest_z, dest_width, dest_height);
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
        var cColor_DarkBrown = new MinecraftMap.RGB(144, 104, 67);
        var cColor_Coastline = cColor_DarkBrown.Blend(cColor_Black, 0.45);
        var workingImage = CreateWorkingCanvas(config, transformedOceanMask_Canvas, dest_width, dest_height);
        var workingImage_Context = workingImage.getContext('2d');
        var working_width = workingImage.width;
        var working_height = workingImage.height;
        // Now that workingImage is a copy of transformedOceanMask_Canvas, we can use transformedOceanMask_Canvas as
        // our blurCanvas and not worry about losing its unblurred value.
        var blurCanvas = transformedOceanMask_Canvas;
        var blurRadius = Math.round(cWorkingCanvasOversample * map_Image.width / 20); // about 3 blocks on the final map, regardless of MapRange
        stackBlurCanvasRGB(blurCanvas, 0, 0, blurCanvas.width, blurCanvas.height, blurRadius);
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
        for (z = 0; z < working_height; z++) {
            for (x = 0; x < working_width; x++) {
                var landAlpha = 255 - workingPixels[index];
                var oceanAlpha = blurPixels[blurIndex];
                workingPixels[index] = colorCoast_R;
                workingPixels[index + 1] = colorCoast_G;
                workingPixels[index + 2] = colorCoast_B;
                workingPixels[index + 3] = landAlpha < oceanAlpha ? landAlpha : oceanAlpha;
                index += 4;
                blurIndex += blurPixelXInc;
            }
            blurIndex += blurPixelYInc;
        }
        workingImage_Context.putImageData(workingImageData, 0, 0);
        // Scale the processed ocean down to the same size as the mapImage, and
        // overlay it onto the paper texture of mapImage
        var mapBackgroundCopy_Canvas = MinecraftMap.cloneCanvas(map_Image);
        var mapBackgroundCopy_Context = mapBackgroundCopy_Canvas.getContext("2d");
        mapBackgroundCopy_Context.drawImage(workingImage, 0, 0, working_width, working_height, dest_x, dest_z, dest_width, dest_height);
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
            result.width = dest_width;
            result.height = dest_height;
            var context = result.getContext('2d');
            context.drawImage(transformedOceanMask_Canvas, 0, 0, transformedOceanMask_Canvas.width, transformedOceanMask_Canvas.height, 0, 0, dest_width, dest_height);
        }
        else {
            result = MinecraftMap.cloneCanvas(transformedOceanMask_Canvas);
        }
        return result;
    }
    // Returns a new canvas where interior_Canvas fades out into the edges defined by map_Image
    function ApplyMapEdgesToCanvas(interior_Canvas, map_Image, edgeFadeStart, edgeFadeDistance, edgeFadeAlpha) {
        if (edgeFadeStart === undefined)
            edgeFadeStart = 2;
        if (edgeFadeDistance === undefined)
            edgeFadeDistance = 4;
        if (edgeFadeAlpha === undefined)
            edgeFadeAlpha = 0;
        var mapBorders_Canvas = MinecraftMap.cloneCanvas(map_Image);
        var mapBorders_Context = mapBorders_Canvas.getContext("2d");
        var mapBordersData = mapBorders_Context.getImageData(0, 0, mapBorders_Canvas.width, mapBorders_Canvas.height);
        var mapBordersPixels = mapBordersData.data;
        var interior_Context = interior_Canvas.getContext("2d");
        var interiorData = interior_Context.getImageData(0, 0, interior_Canvas.width, interior_Canvas.height);
        var interiorPixels = interiorData.data;
        // Calculate a table of alpha values for how interior_Canvas should fade into map_Image at the edges
        var edgeFadeTable = new Array(mapBorders_Canvas.width);
        var i = 0;
        for (i = 0; i < edgeFadeTable.length; i++)
            edgeFadeTable[i] = 255;
        for (i = 0; i < edgeFadeStart; i++) {
            edgeFadeTable[i] = edgeFadeAlpha;
            edgeFadeTable[edgeFadeTable.length - (i + 1)] = edgeFadeAlpha;
        }
        for (i = 0; i < edgeFadeDistance; i++) {
            var alpha = edgeFadeAlpha + Math.round(((255 - edgeFadeAlpha) * (i + 1)) / (edgeFadeDistance + 1));
            edgeFadeTable[i + edgeFadeStart] = alpha;
            edgeFadeTable[edgeFadeTable.length - (i + 1 + edgeFadeStart)] = alpha;
        }
        var x = 0;
        var z = 0;
        var index = 0;
        var foundBorder = false;
        var border_R, border_G, border_B;
        for (z = 0; z < mapBorders_Canvas.height; z++) {
            var edgeFade_z = edgeFadeTable[z]; // Like a lot of this code, assumes the map_Image is square
            for (x = 0; x < mapBorders_Canvas.width; x++) {
                if (mapBordersPixels[index + 3] == 0) {
                    // mapBordersPixels is transparent - i.e. beyond the tattered edge of the map
                    // Don't show the interior either.
                    interiorPixels[index + 3] = 0;
                }
                else if (foundBorder) {
                    if (mapBordersPixels[index] == border_R && mapBordersPixels[index + 1] == border_G && mapBordersPixels[index + 2] == border_B) {
                        // Show only the border from map_Image
                        interiorPixels[index + 3] = 0;
                    }
                    else {
                        // make the interior map transparent near the edges.
                        var edgeFade_x = edgeFadeTable[x];
                        var edgeFade = edgeFade_x < edgeFade_z ? edgeFade_x : edgeFade_z;
                        interiorPixels[index + 3] = edgeFade;
                    }
                }
                else {
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
})(MinecraftMap || (MinecraftMap = {}));
/// <reference path="MinecraftMap.utils.ts" />
/// <reference path="MinecraftMap.config.ts" />
/// <reference path="MinecraftMap.createmaps.ts" />
/// <reference path="MinecraftMap.renderocean.ts" />
/****

 The Ink & Parchment Map v1.7.3

 Copyright 2015 Glenn Fisher

 This is an unofficial mapping system for Minecraft. It is neither produced nor
 endorsed by Mojang.

 Licenced under GPL licence, version 3 or later
 https://www.gnu.org/copyleft/gpl.html

 Note that other files in this project have their own licence, see \licence.md
*****/
var MinecraftMap;
(function (MinecraftMap) {
    "use strict";
    // Constants
    MinecraftMap.cMapRangeDefault = 3200; // measured in minecraft blocks from the center. (Since the map we use for the background is 64 pixels wide, a range of 3200 gives map squares of a nice round scale of 100)
    MinecraftMap.cClickRadius = 12; // How far from the center of the icon is clickable
    MinecraftMap.cCaptionSpacer_vertical = 8; // How far under the bottom of the icon should the text be drawn. The canvas textBaseline is "alphabetic", so cCaptionSpacer_vertical should be set to roughly the ascent of the font.
    MinecraftMap.cLabel_DontDrawChar = '~'; // Designates labels that shouldn't be drawn on the map. The tilde is illegal in a Minecraft name, so should make a good character to enclose labels with.
    MinecraftMap.cLabel_AlwaysDrawChar = '!'; // Designates labels that should always be drawn on the map. The exclamation mark is illegal in a Minecraft name, so should make a good character to enclose labels with.
    MinecraftMap.cCustomIconIndexStart = 64; // IconIndexes with this value or higher should be loaded from gCustomIcons
    MinecraftMap.cShowBoundingBoxes = false; // This is for debug only
    // Global variables
    MinecraftMap.gMapDataUriDefault = ''; // Set this using SetDefaultSrc(), it specifies the URL to try and load locations from if no src parameter is specified in the main URL.
    MinecraftMap.gHrefTargetDefault = ''; // Set this using SetDefaultHrefTarget(), it specifies the target to use for hrefs that don't specify a target. Normally it doesn't matter but when running in an iframe it should be set to '_parent'
    MinecraftMap.gCustomIcons = null;
    MinecraftMap.gOceanMapImage = null; // will be set to an Image if an ocean mask is provided.
    MinecraftMap.gLocationIconScale = 1; // Allows Locations to be scaled up for better font resolution in posters
    MinecraftMap.gLocationFontScale = 1; // Allows Locations to be scaled up for better font resolution in posters
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
            return function () {
                MinecraftMap.createMapImageInDiv(zoomLevel, divElementsAndSize[zoomLevel].divName, divElementsAndSize[zoomLevel].width, divElementsAndSize[zoomLevel].height, config, locations, function () {
                    deferredObj.resolve();
                });
            };
        }
        MinecraftMap.PreRender(config);
        var functionPromises = [];
        var i;
        for (i = 0; i < divElementsAndSize.length; i++) {
            var newDeferred = $.Deferred();
            setTimeout(CreateDeferredRenderFunction(i, newDeferred), 1);
            functionPromises[i] = newDeferred;
        }
        $.when.apply($, functionPromises).done(finishedCallback);
    }
    MinecraftMap.createMapsInDivs_Async = createMapsInDivs_Async;
    // callback will be given two arguments - a dictionary of settings and an array of Location instances
    function getSettingsAndMapLocations(screenWidth, screenHeight, callback) {
        var configFromUrl = new MinecraftMap.MapConfiguration();
        configFromUrl.AssignFromUrl(location.toString());
        // Load the ocean mask and custom icons asynchronously if possible while we load the
        // locations file to avoid adding delay to the pipeline.
        var loadingOceanMap_deferredObj = loadOceanMap_Async(configFromUrl, false);
        var loadingCustomIcons_deferredObj = loadCustomIcons_Async(configFromUrl, false);
        var srcUri = ('MapDataUri' in configFromUrl) ? configFromUrl.MapDataUri : MinecraftMap.gMapDataUriDefault;
        if (MinecraftMap.isNotEmptyString(srcUri)) {
            getMapDataAndLocationsFromUrl(srcUri, (configFromUrl.GoogleSrcLooksLikeDoc === true), function (configFromAjax, locationsFromAjax) {
                var mapConfig = new MinecraftMap.MapConfiguration();
                mapConfig.SetDefaults(screenWidth, screenHeight);
                mapConfig.AssignFrom(configFromAjax);
                mapConfig.AssignFrom(configFromUrl);
                ApplyMapConfiguration(mapConfig);
                // I'm getting the impression there is no reliable way to wait for
                // an image to load, see caveats in http://api.jquery.com/load-event/
                // If that's the case then ocean maps and custom icons won't work on
                // browsers with broken onload event.
                var deferreds = [];
                if (loadingOceanMap_deferredObj == null) {
                    // The ocean map hasn't been loaded yet, perhaps the configFromAjax
                    // has provided a URL to load it from, or the HTML has loaded it.
                    loadingOceanMap_deferredObj = loadOceanMap_Async(mapConfig, true);
                }
                if (loadingOceanMap_deferredObj != null) {
                    deferreds.push(loadingOceanMap_deferredObj);
                }
                if (loadingCustomIcons_deferredObj == null) {
                    // The custom icons image hasn't been loaded yet, perhaps the configFromAjax
                    // has provided a URL to load it from, or the HTML has loaded it.
                    loadingCustomIcons_deferredObj = loadCustomIcons_Async(mapConfig, true);
                }
                if (loadingCustomIcons_deferredObj != null) {
                    deferreds.push(loadingCustomIcons_deferredObj);
                }
                $.when.apply($, deferreds).done(function () { callback(mapConfig, locationsFromAjax); });
            });
        }
        else {
            if (!configFromUrl.MissingSrcMessageDisplayed) {
                alert('no "src=" url was specified to scrape the location data from.');
            }
        }
        function ApplyMapConfiguration(config) {
            document.title = config.Title;
            $("#mainTitle").text(config.Title);
            $("#tagline").text(config.Blurb);
        }
        function getMapDataAndLocationsFromUrl(dataUrl, dataUriSuspectedToBeGoogleDoc, callback) {
            if (MinecraftMap.isString(dataUrl)) {
                // Assume HTML unless the dataUrl ends in .txt or .csv (wikis etc often won't end in .html)
                var testDataType = new RegExp("\.txt$|\.csv$", "i");
                var dataTypeIsText = testDataType.test(dataUrl);
                $.ajax({
                    url: dataUrl,
                    dataType: (dataTypeIsText ? 'text' : 'html'),
                    success: function (data, textStatus, jqXHR) {
                        var contenType = jqXHR.getResponseHeader("content-type") || "";
                        if (contenType.indexOf("text/plain") >= 0 || contenType.indexOf("text/csv") >= 0 || dataTypeIsText) {
                            MinecraftMap.parseTextLocations(data, callback);
                        }
                        else {
                            MinecraftMap.parseHtmlLocations(data, callback);
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        if (dataUrl == MinecraftMap.gMapDataUriDefault) {
                            // No src parameter was specified, and that's most likely the error - as loading
                            // from gMapDataUriDefault failed (gMapDataUriDefault is not normally a valid uri - it's
                            // only valid when the map has been set up to not need the src parameter).
                            //alert('no "src=" url was specified to scrape the location data from.\n\n(also failed to load from the fallback: ' + textStatus + ', ' + errorThrown + ')');
                            alert('no "src=" url was specified to scrape the location data from.\n\n(and could not load from the fallback url)');
                        }
                        else if (dataUriSuspectedToBeGoogleDoc) {
                            // People frequently create location files in Google Documents instead of .txt files,
                            // until support for Google docs can be added, try to detect this mistake and give
                            // a more helpful error message.
                            alert('Failed to load locations from src "' + dataUrl + '"\nThis might be a Google Doc file instead of a txt file on Google Drive.\n\nThe map viewer cannot read Doc format.');
                        }
                        else {
                            alert('Failed to load locations from src "' + dataUrl + '", something went wrong: ' + textStatus + ', ' + errorThrown);
                        }
                    }
                });
            }
            else {
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
            var returned = loadImage_Async(config.OceanMapUri, tryImgTag ? 'oceanmask' : '', 'OceanMap');
            MinecraftMap.gOceanMapImage = returned.image;
            return returned.waitObj;
        }
        // Loads the custom icon image into the global variable gCustomIcons. If
        // the config contains an CustomIconsUri then the load is attempted from
        // the Uri, otherwise attempts to load from the "customtileset" img tag in the HTML.
        //
        // Returns null if there was nothing to load, or a jquery Deferred object
        // which will be resolved when the gCustomIcons is loaded
        function loadCustomIcons_Async(config, tryImgTag) {
            var returned = loadImage_Async(config.CustomIconsUri, tryImgTag ? 'customtileset' : '', 'Custom-icons');
            MinecraftMap.gCustomIcons = returned.image;
            return returned.waitObj;
        }
        // Loads an image asynchronously. If a URI is provided then load is attempted 
        // from the URI, otherwise it attempts to use the image from an image tag in 
        // the HTML with the id specified by tryImgId.
        //
        // Returns an iLoadImageAsyncResult with a null waitObj if there was nothing 
        // to load, or a jquery Deferred object which will be resolved when the image
        // is loaded.
        function loadImage_Async(uri, tryImgId, purposeDesc) {
            var result = {
                image: null,
                waitObj: $.Deferred()
            };
            if (!MinecraftMap.isEmpty(uri)) {
                // I'm getting the impression there is no reliable way to wait for
                // an image to load, see caveats in http://api.jquery.com/load-event/
                // If that's the case then ocean maps and custom icons won't work on
                // browsers with broken onload event.
                result.image = new Image();
                var loadHandler = function () {
                    // Excellent, image is loaded
                    result.waitObj.resolve();
                };
                var errorHandler = function (err) {
                    // Image didn't load, probably a 404
                    result.image = null;
                    result.waitObj.resolve();
                    var message = 'Could not load ' + purposeDesc + ' image at "' + uri + '"';
                    alert(message);
                    console.log(message + ', useless error information follows: ' + JSON.stringify(err));
                };
                jQuery(result.image)
                    .on('load', loadHandler)
                    .on('error', errorHandler);
                // Perform a cross-origin request, requires that our image hosting supports
                // CORS and allows this.
                // Otherwise the image will be tainted and its usage restricted, causing a
                // "Tainted canvases may not be exported." error to be thrown by toDataURL().
                result.image.crossOrigin = "anonymous";
                try {
                    result.image.src = uri;
                    if (result.image.complete)
                        loadHandler();
                }
                catch (e) {
                    console.log('Failed to load ' + purposeDesc + ' image.src: ' + JSON.stringify(e));
                }
            }
            else if (MinecraftMap.isNotEmptyString(tryImgId)) {
                // The image wasn't specified in settings, but might have been loaded in an img tag in index.html
                result.image = document.getElementById(tryImgId);
                if (result.image != null) {
                    // The img appears to be present in the HTML (probably in the resources div)
                    // (It feels wrong to assign an error handler in the html just to figure out if the image is good,
                    // so I'm going with isImageOk() instead, unless it turns out to be less cross-browser compatible)
                    if (!MinecraftMap.isImageOk(result.image)) {
                        // It's a broken link.
                        result.image = null;
                        // return null to indicate the map is not loading
                        result.waitObj = null;
                    }
                    else {
                        // image was already loaded with the html
                        result.waitObj.resolve();
                    }
                }
                else {
                    // The image tag is commented out, or otherwise missing.
                    // return null to indicate the image is not loading
                    result.waitObj = null;
                }
            }
            else {
                // An image uri wasn't specified, and the value of tryImgId says not to bother checking for an img tag in index.html
                // return null to indicate the map is not loading
                result.waitObj = null;
            }
            return result;
        }
    }
    MinecraftMap.getSettingsAndMapLocations = getSettingsAndMapLocations;
})(MinecraftMap || (MinecraftMap = {}));
//# sourceMappingURL=minecraftmap.js.map