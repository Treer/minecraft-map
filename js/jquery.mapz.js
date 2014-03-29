/**
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
			'zoom'			:	false,
			'createmaps' 	:	false,
			'mousewheel' 	: 	false
		};
		
		 if ( options ) { 
			$.extend( settings, options );
		}
  
		var viewport = this.parent('.map-viewport');
		var map = this;
		var constraint = $(document.createElement('div')).addClass('mapz-constraint').css('position','absolute').appendTo(viewport);
		
		// Add current-level class to first map level
		map.children(".level:first").addClass('current-level');
		
		// Create constraint for current level.
		createConstraint();
		
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
			
			// Loop trough zoom levels
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
					
					for(c in coords) {
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
			currentlvl.removeClass('current-level');
			targetlvl.addClass('current-level');
			
			var pos = map.position();
			
			var halfViewWidth = viewport.width()  / 2;
			var halfViewHeight = viewport.height() / 2;
			var viewportX = -map.position().left;
			var viewportY = -map.position().top;
			
			var newViewportX = ((targetlvl.width()  / currentlvl.width())  * (viewportX + halfViewWidth)  - halfViewWidth);
			var newViewportY = ((targetlvl.height() / currentlvl.height()) * (viewportY + halfViewHeight) - halfViewHeight);

			if (newViewportX < 0) newViewportX = 0;
			if (newViewportY < 0) newViewportY = 0;
			
			map.css({
				left : -newViewportX, 
				top :  -newViewportY, 
				width : targetlvl.width(),
				height : targetlvl.height()
			});
			
			// Since we zoomed to another level we need to recreate constraint div
			createConstraint();
			
		}
   
  };
})( jQuery );