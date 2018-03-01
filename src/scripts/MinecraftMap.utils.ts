/********************************************
 Javascript miscellaneous helper functions.

 Copyright 2015 Glenn Fisher (except for attributed code snippets)

****/
namespace MinecraftMap {
	"use strict";


	// ---------------------------------------------
	// Type checking.
	export function isEmpty(str) {
		return (!str || 0 === str.length);
	}

	export function isString(str) {
		return (typeof str === 'string' || str instanceof String);
	}

	export function isNotEmptyString(str) {
		return (typeof str === 'string' || str instanceof String) && str.length > 0;
	}

	export function isFunction(item) {
		return typeof item === 'function';
	}

	// ---------------------------------------------
	// Type conversion
	export function stringToBool(value: string): boolean {
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
				return Boolean(value);
		}
	}

	export function imageToCanvas(image) {
		var canvas = document.createElement("canvas");
		canvas.width = image.width;
		canvas.height = image.height;
		canvas.getContext("2d").drawImage(image, 0, 0);
		return canvas;
	}


	// ---------------------------------------------
	// Wow, Internet Explorer doesn't have trim functions, include some.
	export function trimRight(stringValue){
		if (isFunction(stringValue.trimRight)) {
			return stringValue.trimRight();
		} else {
			return stringValue.replace(/\s+$/, "");
		}
	}
	export function trimLeft(stringValue){
		if (isFunction(stringValue.trimLeft)) {
			return stringValue.trimLeft();
		} else {
			return stringValue.replace(/^\s+/, "");
		}
	}
	export function trim(stringValue){
		if (isFunction(stringValue.trim)) {
			return stringValue.trim();
		} else {
			return stringValue.replace(/^\s+|\s+$/g, '');
		}
	}

	export interface iUrlParts {
		file:     string;
		hash:     string;
		host:     string;
		query:    string;
		params:   any;
		path:     string;
		relative: string;
		segments: string[];
		port:     number;
		protocol: string;
		source:   string;
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
	export function parseURL(url): iUrlParts {
		var a = document.createElement('a');
		a.href = url;
		return {
			source: url,
			protocol: a.protocol.replace(':',''),
			host: a.hostname,
			port: parseInt(a.port),
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

	// ---------------------------------------------
	// code snippet from https://stereochro.me/ideas/detecting-broken-images-js
	// Returns true if the image is loaded
	export function isImageOk(img) {
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
}
