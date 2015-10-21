/** @Preserve
*	jQuery Mapz v1.0
*
*	by Danny van Kooten - http://dannyvankooten.com
*	Last Modification: 20/06/2011
*
*	For more information, visit:
*	http://dannyvankooten.com/jquery-plugins/mapz/
*
*	Licensed under the Creative Commons Attribution 2.5 License - http://creativecommons.org/licenses/by/2.5/
*		- Free for use in both personal and commercial projects
*		- Attribution requires leaving author name, author link, and the license info intact.	
*/

(function( $ ){
	$.fn.mapz = function(options) {
  
		var settings = {
			'zoom'       : false,
			'createmaps' : false,
			'mousewheel' : false,
			'pinchzoom'  : false
		};
		
		if ( options ) { 
			$.extend( settings, options );
		}
  
		var viewport = this.parent('.map-viewport');
		var map = this;
		var constraint = $(document.createElement('div')).addClass('mapz-constraint').css('position','absolute').appendTo(viewport);
		
		// Add current-level class to first map level
		map.children(".level:first").addClass('current-level');
		
		{
			// Set map size to match current level, and create a constraint for current level.
			var currentlvl = map.children(".current-level");
			updateMapSizeAndConstraint(currentlvl, currentlvl);
		}		
		
		// Is zooming enabled?
		if(settings.zoom) {

			$(document).keydown(function(e){
				// Pressed UP or DOWN key? -> zoom in or out accordingly
				if (e.keyCode == 38) { zoom('in'); return false; } else if(e.keyCode == 40) { zoom('out'); return false; }	
			});
			
			if(settings.mousewheel) {
				map.bind('mousewheel', function(event, delta) {
					var dir = delta > 0 ? 'in' : 'out';
					zoom(dir);
					return false;
				});
			}
			
			if(settings.pinchzoom) {
				// pinchzoom option requires jquery.hammer-full.js
				if (typeof(Hammer) === "function") {
					// threshold indicates how much scaling must happen between the positions of the two
					// fingers before we register a map zoom... in theory - hard to tell how accurate the events are.
					var cThreshold = 0.12;
					
					// Each time a zoom is triggered during a pinch, we change scaleAdjust to ensure that more
					// pinching is required for the next zoom.
					var scaleAdjust = 0;
								
					// Notes on hammer-related crapness
					//  * the version from the official site doesn't work, dunno where the fuck http://solinitiative.com/demo/jquery.hammer.min.js came from, or what version it is, but it seems to work.		
					//  * despite what others suggest, combining multiple events in one handler results in only the last event being hooked
					//  * pinchin & pinchout might seem to be backwards (i.e. you move you fingers apart/out as a gesture to zoom in)
					this.hammer().on(
						'pinchin', 
						function(ev) { 
							if ((ev.gesture.scale + scaleAdjust) < (1 - cThreshold)) {
								scaleAdjust += cThreshold;
								zoom('out'); 
							}
						}
					);

					this.hammer().on(
						'pinchout', 
						function(ev) { 
							if ((ev.gesture.scale + scaleAdjust) > (1 + cThreshold)) {
								scaleAdjust -= cThreshold;
								zoom('in'); 
							}
						}
					);

					// reset the scaleAdjust every time the pinch event ends, 'release' seems to
					// be the closest event hammer provides to that.
					this.hammer().on(
						'release', 
						function(ev) { scaleAdjust = 0; }
					);				
				} else {
					// pinchzoom option requires jquery.hammer-full.js
					alert('pinchzoom cannot be turned on without hammer library');
				}
			}
			
			
			// Create HTML maps for zoomed levels?
			if(settings.createmaps) createMaps();
		}		
					
		map.draggable({
			 containment : constraint
		});
		
		function createMaps(){
			
			var htmlmap = viewport.children('map');
			var scale = 1;
			var i = 0;
			
			// Loop through zoom levels
			map.children('.level').each(function() {
				i++;
				
				// If current map level, return. This one should have a map already.
				if($(this).hasClass('current-level')) return;
				
				// Get scales for map to create
				scale = $(this).width() / map.width();
				
				// Create new map element
				var newmap = $(document.createElement('map')).attr('name',map.attr('id') + '-map-' + i);
				
				// Calculate new coords for each area element
				htmlmap.children('area').each(function() {
					var newArea = $(this).clone();
					
					var coords = $(this).attr('coords').split(',');
					
					for(var c in coords) {
						coords[c] = Math.ceil(coords[c] * scale);
					}
					
					newArea.attr('coords',coords).appendTo(newmap);
				});
				
				// Append new map to viewport and hook to zoom level
				newmap.appendTo(viewport);
				$(this).attr('usemap','#' + map.attr('id') + '-map-' + i);
				
				
			});
		}
		
		// Create a constraint div so map can't be dragged out of view.
		function createConstraint()
		{
			constraint.css({
				left : -(map.width()) + viewport.width(),
				top : -(map.height()) + viewport.height(),
				width : 2 * map.width() - viewport.width(),
				height : 2 * map.height() - viewport.height()
			});
			
			// Check if map is currently out of bounds, revert to closest position if so
			if(map.position().left < constraint.position().left) map.css('left',constraint.position().left);
			if(map.position().top < constraint.position().top) map.css('top',constraint.position().top);

			// Set the mouse cursor to cue whether scrolling is possible
			if(constraint.width() <= map.width() && constraint.height() <= map.height()) {
				map.css('cursor', 'default');
			} else {
				map.css('cursor', 'all-scroll');			
			}			
		}
		
		function zoom(direction) {
			var currentlvl = map.children(".current-level");
			
			// Set direction and check if there is a deeper level to zoom to.
			switch(direction) {
				
				case 'in':
					if(map.children(".current-level").next().length == 0) return;
					var targetlvl = currentlvl.next();
				break;
				
				case 'out':
					if(map.children(".current-level").prev().length == 0) return;
					var targetlvl = currentlvl.prev();
				break;
				
			}

			
			// Switch levels and rezoom to viewed position
			targetlvl.addClass('current-level');
			currentlvl.removeClass('current-level');
			
			updateMapSizeAndConstraint(targetlvl, currentlvl);
		}
		
		function updateMapSizeAndConstraint(newLevel, oldLevel) {
			
			var pos = map.position();
			
			var halfViewWidth = viewport.width()  / 2;
			var halfViewHeight = viewport.height() / 2;
			var viewportX = -pos.left;
			var viewportY = -pos.top;
			
			var newViewportX = ((newLevel.width()  / oldLevel.width())  * (viewportX + halfViewWidth)  - halfViewWidth);
			var newViewportY = ((newLevel.height() / oldLevel.height()) * (viewportY + halfViewHeight) - halfViewHeight);

			if (newViewportX < 0) newViewportX = 0;
			if (newViewportY < 0) newViewportY = 0;
			
			map.css({
				left : -newViewportX, 
				top :  -newViewportY, 
				width : newLevel.width(),
				height : newLevel.height()
			});
			
			// Since we zoomed to another level we need to recreate constraint div
			createConstraint();			
		}
   
	};
})( jQuery );