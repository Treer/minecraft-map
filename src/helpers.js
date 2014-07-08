/********************************************
 Javascript miscellaneous helper functions.

 Copyright 2014 Glenn Fisher

 This is not a standalone file, it is part of minecraftmap.pp.js
****/


// ---------------------------------------------
// Type checking.
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
	return typeof item === 'function';
}

// ---------------------------------------------
// Type conversion
function stringToBool(value){
	switch(trim(value).toLowerCase()){
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
			return Boolean(string);
	}
}

function imageToCanvas(image) {
	var canvas = document.createElement("canvas");
	canvas.width = image.width;
	canvas.height = image.height;
	canvas.getContext("2d").drawImage(image, 0, 0);
	return canvas;
}	


// ---------------------------------------------
// Wow, Internet Explorer doesn't have trim functions, include some.
function trimRight(stringValue){
	if (isFunction(stringValue.trimRight)) {
		return stringValue.trimRight();
	} else {
		return stringValue.replace(/\s+$/, "");
	}
}
function trimLeft(stringValue){
	if (isFunction(stringValue.trimLeft)) {
		return stringValue.trimLeft();
	} else {
		return stringValue.replace(/^\s+/, "");
	}
}
function trim(stringValue){
	if (isFunction(stringValue.trim)) {
		return stringValue.trim();
	} else {
		return stringValue.replace(/^\s+|\s+$/g, ''); 
	}
}

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

