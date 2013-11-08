/*
 * 	easyAccordion 0.1.3 - jQuery plugin
 *	written by Andrea Cima Serniotti	
 *	http://www.madeincima.eu
 *
 *	Copyright (c) 2010 Andrea Cima Serniotti (http://www.madeincima.eu)
 *	Dual licensed under the MIT (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses.
 *	Built for jQuery library http://jquery.com
 *
 *  0.1.1 7-05-2011 Luch Klooster
 *  Added support for Opera browser
 *  0.1.2 26-06-2011 Luch Klooster
 *  Added support for IE9, improved slide-number display for IE8 and IE9
 *  0.1.3 01-07-2011 Luch Klooster
 *  Added support for skins with activeaCorner (eg. Stitch)
 *  Added pauseOnHover
 */
 
(function(jQuery) {
	jQuery.fn.easyAccordion = function(options) {
	
	var defaults = {			
		slideNum: true,
		autoStart: false,
		pauseOnHover: false,
		slideInterval: 3000
	};
			
	this.each(function() {
		
		var settings = jQuery.extend(defaults, options);
		jQuery(this).find('dl').addClass('easy-accordion');
		
		// -------- Set the variables ------------------------------------------------------------------------------
		
		jQuery.fn.setVariables = function() {
			dlWidth = jQuery(this).width();
			dlHeight = jQuery(this).height();
			dtWidth = jQuery(this).find('dt').outerHeight();
			if (jQuery.browser.msie){ dtWidth = jQuery(this).find('dt').outerWidth();}
			dtHeight = dlHeight - (jQuery(this).find('dt').outerWidth()-jQuery(this).find('dt').width());
			slideTotal = jQuery(this).find('dt').size();
			ddWidth = dlWidth - (dtWidth*slideTotal) - (jQuery(this).find('dd').outerWidth(true)-jQuery(this).find('dd').width());
			ddHeight = dlHeight - (jQuery(this).find('dd').outerHeight(true)-jQuery(this).find('dd').height());
		};
		jQuery(this).setVariables();
		
		// -------- Fix some weird cross-browser issues due to the CSS rotation -------------------------------------

		if (jQuery.browser.safari){ var dtTop = (dlHeight-dtWidth)/2; var dtOffset = -dtTop;  /* Safari and Chrome */ }
		if (jQuery.browser.mozilla){ var dtTop = dlHeight - 20; var dtOffset = - 20; /* FF */ }
		if (jQuery.browser.msie){ var dtTop = 0; var dtOffset = 0; /* IE */ }
		if (jQuery.browser.opera){ var dtTop = (dlHeight-dtWidth)/2; var dtOffset = -dtTop; } /* Opera */
		
		// -------- Getting things ready ------------------------------------------------------------------------------
		
		var f = 1;
		var paused = false;
		jQuery(this).find('dt').each(function(){
			jQuery(this).css({'width':dtHeight,'top':dtTop,'margin-left':dtOffset});
			// add unique id to each tab
			jQuery(this).addClass('spine_' + f);
			// add activea corner
			var corner = document.createElement('div');
				corner.className = 'activeaCorner spine_' + f;
			jQuery(this).append(corner);

			if(settings.slideNum == true){
				jQuery('<span class="slide-number">'+f+'</span>').appendTo(this);
				if(jQuery.browser.msie){	
					var slideNumLeft = parseInt(jQuery(this).find('.slide-number').css('left'));
					if(jQuery.browser.version == 6.0 || jQuery.browser.version == 7.0){
						jQuery(this).find('.slide-number').css({'bottom':'auto'});
						slideNumLeft = slideNumLeft - 14;
						jQuery(this).find('.slide-number').css({'left': slideNumLeft})
					}
					if(jQuery.browser.version == 8.0 || jQuery.browser.version == 9.0){
					var slideNumTop = jQuery(this).find('.slide-number').css('bottom');
					var slideNumTopVal = parseInt(slideNumTop) + parseInt(jQuery(this).css('padding-top'))  - 20; 
					jQuery(this).find('.slide-number').css({'bottom': slideNumTopVal});
						slideNumLeft = slideNumLeft - 10;
					jQuery(this).find('.slide-number').css({'left': slideNumLeft})
					jQuery(this).find('.slide-number').css({'marginTop': 10});
					}
				} else {
					var slideNumTop = jQuery(this).find('.slide-number').css('bottom');
					var slideNumTopVal = parseInt(slideNumTop) + parseInt(jQuery(this).css('padding-top')); 
					jQuery(this).find('.slide-number').css({'bottom': slideNumTopVal}); 
				}
			}
			f = f + 1;
		});

		if(jQuery(this).find('.activea').size()) { 
			jQuery(this).find('.activea').next('dd').addClass('activea');
		} else {
			jQuery(this).find('dt:first').addClass('activea').next('dd').addClass('activea');
		}
		
		jQuery(this).find('dt:first').css({'left':'0'}).next().css({'left':dtWidth});
		jQuery(this).find('dd').css({'width':ddWidth,'height':ddHeight});	

		
		// -------- Functions ------------------------------------------------------------------------------
		
		jQuery.fn.findactiveaSlide = function() {
				var i = 1;
				this.find('dt').each(function(){
				if(jQuery(this).hasClass('activea')){
					activeaID = i; // activea slide
				} else if (jQuery(this).hasClass('no-more-activea')){
					noMoreactiveaID = i; // No more activea slide
				}
				i = i + 1;
			});
		};
			
		jQuery.fn.calculateSlidePos = function() {
			var u = 2;
			jQuery(this).find('dt').not(':first').each(function(){	
				var activeaDtPos = dtWidth*activeaID;
				if(u <= activeaID){
					var leftDtPos = dtWidth*(u-1);
					jQuery(this).animate({'left': leftDtPos});
					if(u < activeaID){ // If the item sits to the left of the activea element
						jQuery(this).next().css({'left':leftDtPos+dtWidth});	
					} else{ // If the item is the activea one
						jQuery(this).next().animate({'left':activeaDtPos});
					}
				} else {
					var rightDtPos = dlWidth-(dtWidth*(slideTotal-u+1));
					jQuery(this).animate({'left': rightDtPos});
					var rightDdPos = rightDtPos+dtWidth;
					jQuery(this).next().animate({'left':rightDdPos});	
				}
				u = u+ 1;
			});
			setTimeout( function() {
				jQuery('.easy-accordion').find('dd').not('.activea').each(function(){ 
					jQuery(this).css({'display':'none'});
				});
			}, 400);
		};
	
		jQuery.fn.activateSlide = function() {
			this.parent('dl').setVariables();	
			this.parent('dl').find('dd').css({'display':'block'});
			this.parent('dl').find('dd.plus').removeClass('plus');
			this.parent('dl').find('.no-more-activea').removeClass('no-more-activea');
			this.parent('dl').find('.activea').removeClass('activea').addClass('no-more-activea');
			this.addClass('activea').next().addClass('activea');	
			this.parent('dl').findactiveaSlide();
			if(activeaID < noMoreactiveaID){
				this.parent('dl').find('dd.no-more-activea').addClass('plus');
			}
			this.parent('dl').calculateSlidePos();	
		};
	
		jQuery.fn.rotateSlides = function(slideInterval, timerInstance) {
			var accordianInstance = jQuery(this);
			timerInstance.value = setTimeout(function(){accordianInstance.rotateSlides(slideInterval, timerInstance);}, slideInterval);
			if (paused == false){
				jQuery(this).findactiveaSlide();
				var totalSlides = jQuery(this).find('dt').size();
				var activeaSlide = activeaID;
				var newSlide = activeaSlide + 1;
				if (newSlide > totalSlides) newSlide = 1;
				jQuery(this).find('dt:eq(' + (newSlide-1) + ')').activateSlide(); // activate the new slide
			}
		}

		// -------- Let's do it! ------------------------------------------------------------------------------
		
		function trackerObject() {this.value = null}
		var timerInstance = new trackerObject();
		
		jQuery(this).findactiveaSlide();
		jQuery(this).calculateSlidePos();
		
		if (settings.autoStart == true){
			var accordianInstance = jQuery(this);
			var interval = parseInt(settings.slideInterval);
			timerInstance.value = setTimeout(function(){
				accordianInstance.rotateSlides(interval, timerInstance);
				}, interval);
		} 

		jQuery(this).find('dt').not('activea').click(function(){		
			jQuery(this).activateSlide();
			clearTimeout(timerInstance.value);
			timerInstance.value = setTimeout(function(){
				accordianInstance.rotateSlides(interval, timerInstance);
				}, interval);
		});	
				
		if (!(jQuery.browser.msie && jQuery.browser.version == 6.0)){ 
			jQuery('dt').hover(function(){
				jQuery(this).addClass('hover');
			}, function(){
				jQuery(this).removeClass('hover');
			});
		}
		if (settings.pauseOnHover == true){
			jQuery('dd').hover(function(){
				paused = true;
			}, function(){
				paused = false;
			});
		}
	});
	};
})(jQuery);