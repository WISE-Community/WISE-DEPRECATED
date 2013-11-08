//TODO: Convert to prototype format

/*
 * Finds any DOM elements with the 'tooltip' class and initializes the tipTip (modified) plugin on each.
 * 
 * @param target A jQuery DOM object on which to process elements (Optional; default is entire page)
 * @param options An object to specify default tipTip settings for all tooltips (Optional; 
 * see https://github.com/indyone/TipTip for allowable options)
 * 
 * Individual tooltip options can be customized by adding jQuery data fields or HTML5 data-* attributes 
 * to the DOM element 
 * (Optional; will override default settings):
 * - tooltip-event: 'hover', 'click', 'focus', and 'manual' set the tooltip to show on mouse click,
 * mouse hover, element focus, and manual activation [via $('#element').tipTip.('show')] respectively
 * (default is 'hover')
 * - tooltip-anchor: 'bottom', 'top', 'left', and 'right' set the positions of the tooltip to bottom, top, left, 
 * and right respectively (default is 'top')
 * - tooltip-maxw: 'X' sets the max-width of the tooltip element to X pixels (default is '400');
 * - tooltip-content: String (or HTML String) to set as the tooltip's content (default is the element's 
 * title attribute)
 * - tooltip-class: String to add to the tooltip element's css class (default is none)
 * - tooltip-offset: 'X' sets the offset of the tooltip element to X pixels (default is '0')
 * - tooltip-delay: 'X' sets the appearance delay of the tooltip element to X milliseconds (default is '200')
 * - tooltip-keep: String ('true' or 'false') to specify whether the tooltip should stay visible when mouse
 * moves away from the element (and hide when the mouse leaves the tooltip or the user clicks on another
 * part of the page) (default is 'false')
 */
function insertTooltips(target,options){
	function processElement(item,options){
		item.css('cursor','pointer');
		
		// set tipTip default options
		var settings = {
			defaultPosition:'top',
			maxWidth:'400px',
			edgeOffset:2,
			fadeIn:100,
			fadOut:100,
			delay:100
		};
		if(options != null && typeof options == 'object'){
			// tipTip options have been sent in as a parameter, so merge with defaults
			$.extend(settings,options);
		}
		
		// set options based on target element attributes
		if(item.data('tooltip-event') == 'click'){
			settings['activation'] = 'click';
			settings['keepAlive'] = true;
		} else if(item.data('tooltip-event') == 'hover'){
			settings['activation'] = 'hover';
		} else if(item.data('tooltip-event') == 'manual'){
			settings['activation'] = 'manual';
		}
		if(item.data('tooltip-anchor') == 'right'){
			settings['defaultPosition'] = 'right';
		} else if (item.data('tooltip-anchor') == 'bottom'){
			settings['defaultPosition'] = 'bottom';
		} else if (item.data('tooltip-anchor') == 'left'){
			settings['defaultPosition'] = 'left';
		} else if (item.data('tooltip-anchor') == 'top'){
			settings['defaultPosition'] = 'top';
		}
		if(typeof item.data('tooltip-maxw') == 'string'){
			settings['maxWidth'] = item.data('tooltip-maxw') + 'px';
		}
		if(typeof item.data('tooltip-content') == 'string'){
			settings['content'] = item.data('tooltip-content');
		}
		if(typeof item.data('tooltip-offset') == 'string'){
			settings['edgeOffset'] = parseInt(item.data('tooltip-offset'));
		}
		if(typeof item.data('tooltip-class') == 'string'){
			settings['cssClass'] = item.data('tooltip-class');
		}
		if(typeof item.data('tooltip-delay') == 'string'){
			var delay = parseInt(item.data('tooltip-delay'));
			if(delay != 'NaN'){
				settings['delay'] = delay;
			}
		}
		if(typeof item.data('tooltip-keep') == 'string'){
			if (item.data('tooltip-keep') == 'true'){
				settings['keepAlive'] = true;
			} else if (item.data('tooltip-keep') == 'false'){
				settings['keepAlive'] = false;
			}
		}
		
		// prevent the title from showing on hover when activation is set to 'click', 'focus', or 'manual'
		if(item.attr('title') && item.attr('title') != '' && !settings.content){
			// if title is set and content is not, set content to title value and remove title
			settings['content'] = item.attr('title');
			item.removeAttr('title');
		}
		
		if(typeof item.data('tooltip-title') == 'string'){
			settings['content'] = '<h3>' + item.data('tooltip-title') + '</h3>' + settings['content'];
		}
		
		// initialize tipTip on element
		item.tipTip(settings);
		
		// remove all tooltip attributes and class from DOM element (to clean up html and so item are not re-processed if insertTooltips is called again on same page)
		item.removeAttr('data-tooltip-event').removeAttr('data-tooltip-anchor').removeAttr('data-tooltip-maxw').removeAttr('data-tooltip-content').removeAttr('data-tooltip-class').removeAttr('data-tooltip-offset').removeAttr('data-tooltip-keep').removeAttr('data-tooltip-delay').removeClass('tooltip');
	}
	
	// for all DOM elements with the 'tooltip' class, initialize tipTip
	if(target){
		if(target.hasClass('tooltip')){
			processElement(target,options);
		} else {
			$('.tooltip',target).each(function(){
				processElement($(this),options);
			});
		}
	} else {
		$('.tooltip').each(function(){
			processElement($(this),options);
		});
	}
};


/**
 * These three functions are used for the FORM HINT functionality on registration pages
 * TODO: remove and use jQuery form plugin for input hints
 */
function prepareInputsForHints() {
  var inputs = $('input');
  for (var i=0; i<inputs.length; i++){
    $(inputs[i]).on('focus', function () {
		var hint = $('.hint', $(this).parent());
		var xpos = $(this).offset().left + $(this).width() + 15 + 'px';
		var ypos = $(this).offset().top + 'px';
		hint.css({'left':xpos,'top':ypos}).show();
    });
    $(inputs[i]).on('blur', function () {
    	$('.hint', $(this).parent()).hide();
    });
  }
  var selects = $('select');
  for (var k=0; k<selects.length; k++){
	 $(selects[i]).on('focus', function () {
		var hint = $('.hint', this.parent());
		var xpos = $(this).offset().left + $(this).width() + 35 + 'px';
		var ypos = $(this).offset().top + 'px';
		hint.css({'left':xpos,'top':ypos}).show();
    });
	 $(selects[i]).on('blur', function () {
    	$('.hint', $(this).parent()).hide();
    })
  }
}

function prepareSubjectsSelect(){
	$('#closeSubjects').on('click',function(){
		$('#curriculumSubjectsBox').fadeOut();
	});
	
	$('#toggleSubjects').on('click',function(){
		showSubjectsSelect();
	});
}

/**
 * Toggle show/hide of the curriculum box
 */
function showSubjectsSelect() {
	var xpos = $('#toggleSubjects').offset().left + $('#toggleSubjects').width() + 50 + 'px';
	var ypos = $('#toggleSubjects').offset().top - 3*$('#curriculumSubjectsBox').height()/4 + 'px';
	$('#curriculumSubjectsBox').css({'left':xpos,'top':ypos}).fadeToggle();
};

if(typeof $ != 'undefined'){
	$(document).ready(function(){
		prepareInputsForHints();
		prepareSubjectsSelect();
	});
}


/* Added my MattFish to handle special Pop-Up Windows on Teacher Dashboard pages 
** TODO: remove 
*/

function popupSpecial(mylink, windowname)
		{
		if (! window.focus)return true;
		var href;
		if (typeof(mylink) == 'string')
		   href=mylink;
		else
		   href=mylink.href;
		window.open(href, windowname, 'width=850,height=600,resizable=yes,scrollbars=yes');
		return false;
		}
		

function popup640(mylink, windowname)
		{
		if (! window.focus)return true;
		var href;
		if (typeof(mylink) == 'string')
		   href=mylink;
		else
		   href=mylink.href;
		window.open(href, windowname, 'width=640,height=480,resizable=yes,scrollbars=yes');
		return false;
		}
		
function popup300(mylink, windowname)
		{
		if (! window.focus)return true;
		var href;
		if (typeof(mylink) == 'string')
		   href=mylink;
		else
		   href=mylink.href;
		window.open(href, windowname, 'width=300,height=300,resizable=yes,scrollbars=yes');
		return false;
		}
		
