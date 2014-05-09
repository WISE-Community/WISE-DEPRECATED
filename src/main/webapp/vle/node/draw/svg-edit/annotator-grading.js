/**
 * @constructor
 * @param node
 * @returns
 */
function ANNOTATOR() {
	this.initTries = 0;
	this.instructions = ""; // string to hold prompt/instructions text
	this.instructionsModal;
	this.loadModules(this);
};

ANNOTATOR.prototype.loadModules = function(context){
	this.node = window.opener.$('#' + divId).data('node');
	this.view = this.node.view;
	
	// insert loading i18n text
	//$('#overlay_content > div').html(this.view.getI18NString('annotator_loading','SVGDrawNode'));
	//this.content = node.getContent().getContentJSON();
	
	var contentUrl = window.opener.$('#' + divId).data('contentUrl');
	this.contentBaseUrl = window.opener.$('#' + divId).data('contentBaseUrl');
	
	$.getJSON(contentUrl, 
		function(data){
			context.nodeData = data;
			if(data.description_active){
				context.descriptionActive = data.description_active;
			}
			if(data.prompt){
				context.instructions = data.prompt;
			}
			if(data.enableStudentTextArea){
				context.enableStudentTextArea = data.enableStudentTextArea;
			}
			if(data.textAreaInstructions){
				context.textAreaInstructions = data.textAreaInstructions;
			}
			if(data.textAreaButtonText){
				context.textAreaButtonText = data.textAreaButtonText;
			}
			if(data.backgroundImg && isNonWSString(data.backgroundImg)){
				var bgUrl = data.backgroundImg;
				var xPos = 1, yPos = 1;
				context.getImageDimensions(data.backgroundImg, function(dimensions){
					var height = dimensions.height,
						width = dimensions.width,
						ratio = height/width,
						maxH = 600,
						maxW = 600;
					
					if(height > width || height === width){
						if(height > maxH){
							height = maxH;
							width = height/ratio;
						}
					} else {
						if(width > maxW){
							width = maxW;
							height = width*ratio;
						}
					}
					
					var h = context.height = height + 50,
						w = context.width = width + 50,
						rightX = w-width-1,
						centerX = (rightX+1)/2,
						bottomY = h-height-1,
						middleY = (bottomY+1)/2;
					xPos = centerX, yPos = middleY;
					// add in project base path for relative image urls
					if (bgUrl.indexOf("http://") == -1) {
						bgUrl = context.contentBaseUrl + bgUrl;
					}
					svgString = '<svg width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg" ' +
						'xmlns:xlink="http://www.w3.org/1999/xlink"><g><title>teacher</title>' +
						'<image x="' + xPos + '" y="' + yPos + '" width="' + width + '" height="' + height + '" xlink:href="' + bgUrl + '" /></g></svg>';
					var svgString = svgString.replace("</svg>", "<g><title>student</title></g></svg>"); // add blank student layer
					svgEditor.loadFromString(svgString);
					context.init();   // load step content
				});
			} else {
				// set default blank canvas
				var svgString = '<svg width="600" height="450" xmlns="http://www.w3.org/2000/svg">' +
					'<!-- Created with SVG-edit - http://svg-edit.googlecode.com/ --><g><title>student</title></g></svg>';
				svgEditor.loadFromString(svgString);
				context.init();   // load step content
			}
	});
};

//populate description/annotation text and snapshots
ANNOTATOR.prototype.init = function() {
	var ready = true,
		node = this.node,
		view = this.view,
		context = this;
	wiseExtensions = ['ext-wise.js', 'ext-prompt.js'];
	var e = node.extensions.length-1;
	for(; e>-1; --e){
		var ext = node.extensions[e];
		if($.inArray(ext, wiseExtensions) > -1) {
			var prop = ext.replace(/\.js$/,'').replace(/^ext-/,'ext_');
			if(svgEditor.hasOwnProperty(prop)){
				if(!svgEditor[prop].isLoaded()){
					ready = false;
					break;
				}
			} else {
				ready = false;
				break;
			}
		}
	}
	
	if(ready){
		var labelsExt = svgEditor.ext_labels,
			importExt = svgEditor.ext_importstudentasset,
			data = context.nodeData,
			studentWork = JSON.parse(window.opener.$('#' + divId + '_studentWork').text()),
			promptText = window.opener.$('#' + divId).data('promptText'),
			headerText = window.opener.$('#' + divId).data('headerText');
		
		$('#label_tools').css({'font-weight':'bold', 'padding':'10px', 'font-size':'14px'});
		bootbox.hideAll(); // hide all dialogs
		
		context.nodeTitle = window.opener.$('.objectToGradeTd').text();
		
		if(labelsExt){
			if(studentWork.labels && studentWork.labels.length){
				// load existing snapshots
				labelsExt.content(studentWork);
			}
		}
		
		// initiate student text area
		if(context.enableStudentTextArea) {
			var btnText = context.textAreaButtonText,
				instructionsText = context.textAreaInstructions;
			$('#explain .button-text').text(btnText);
			$('#explain').show();
			$('#explanation_instructions').text(instructionsText);
			$('#explanationInput').val(studentWork.explanation).prop('disabled',true);
			
			// bind explain click action
			$('#explain').off('click').on('click', function(e){
				$('#explanation').slideToggle('fast');
			});
			
			$('#closeExp').off('click').on('click', function(){
				$('#explanation').slideUp('fast');
			});
		} else {
			$('#explain').hide();
		}
		
		function showPrompt(){
			context.instructionsModal = bootbox.alert({
				message: context.instructions,
				title: promptText
			});
		}
		
		// initiate prompt/instructions
		if(isNonWSString(context.instructions)){
			$('#prompt > .button-text').text(promptText).show();
			$('#prompt').off('click').on('click', function(e){
				showPrompt();
			});
		} else {
			$('#prompt').hide();
		}
		
		var titleDiv = '<div id="node_title">' + headerText + context.node.title + '</div>';
		$('#label_tools').prepend(titleDiv);
		
		setTimeout(function(){
			svgEditor.resizeCanvas();
			$('#svgcontent g').add('#svgcanvas').css('pointer-events', 'none');
			$('#loading_overlay').fadeOut();
		},500);
		
	} else {
		setTimeout(function(){
			++context.initTries;
			if(context.initTries<300){
				context.init(context);
			} else {
				console.log("Error: Unable to start enlarged view because svg-edit extension(s) failed to load.");
			}
		},100);
	}
};

/**
 * Given an image url, calculates and returns the height and width of the image in pixels.
 * Modified from: http://stackoverflow.com/questions/106828/javascript-get-image-height/952185#952185
 * @param url String identifying the url of an image file
 * @returns dimensions Object specifying height and width of the image file (defaults to 0, 0)
 */
ANNOTATOR.prototype.getImageDimensions = function(url,callback){
	var dimensions = {
		"height": 0,
		"width": 0
	};
	
	function findHHandWW() {
		if(this.height){
			dimensions.height = this.height;
		}
		if(this.width){
			dimensions.width = this.width;
		}
		callback(dimensions);
	}
	
	var context = this;
	// replace local hrefs
	if(!url.match(/^http:/)){
		url = context.contentBaseUrl + url;
	}
	var myImage = new Image();
	myImage.name = url;
	myImage.onload = findHHandWW;
	myImage.src = url;
}

/**
 * If the given item is a non-whitespace only string, return true.
 */
function isNonWSString(item){
	if(typeof item == 'string' && /\S/.test(item)){
		return true;
	};
	
	return false;
}

function xml2Str(xmlNode){
  try {
    // Gecko-based browsers, Safari, Opera.
    return (new XMLSerializer()).serializeToString(xmlNode);
  }
  catch (e) {
    try {
      // Internet Explorer.
      return xmlNode.xml;
    }
    catch (e)
    {//Strange Browser ??
     alert('XMLSerializer not supported');
    }
  }
  return false;
};