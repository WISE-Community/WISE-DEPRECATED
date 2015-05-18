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
	this.width = 450;
	this.height = 600;
	this.labelContent = {
        "labels": [],
        "total": 0 
    };
	this.enableImport = false;
	this.bg = '';
	
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
		        context.bg = data.backgroundImg;
		    }
		    if(data.hasOwnProperty('enableImport') && data.enableImport){
		        context.enableImport = data.enableImport;
		    }
			context.init();   // load step content
	});
};

ANNOTATOR.prototype.setBg = function(imgSrc, callback){
    var context = this;
    var bgUrl = imgSrc;
    var xPos = 1, yPos = 1;
    var svgString = '<svg width="' + this.width + '" height="' + this.height + '" xmlns="http://www.w3.org/2000/svg" ' +
        'xmlns:xlink="http://www.w3.org/1999/xlink"><g><title>background</title></g>' +
        '<g><title>student</title></g></svg>'; // default svg content;
    var h = context.height, w = context.width;
    
    function setContent(dimensions){
        
    }
    
    context.getImageDimensions(bgUrl, function(dimensions){
        if(dimensions){
            //context.bg = imgSrc;
            var height = dimensions.height,
                width = dimensions.width,
                ratio = height/width,
                maxH = 600,
                maxW = 600;
            
            if(height > width || height === width){
                if(height > maxH){
                    context.bgRatio = maxH/height;
                    height = maxH;
                    width = height/ratio;
                }
            } else {
                if(width > maxW){
                    context.bgRatio = maxW/width;
                    width = maxW;
                    height = width*ratio;
                }
            }
            
            context.height = height;
            context.width = width;
            
            var padding = context.bgPadding*2;
            h = height + padding;
            w = width + padding;
            var rightX = w-width-1,
                centerX = (rightX+1)/2,
                bottomY = h-height-1,
                middleY = (bottomY+1)/2;
            xPos = centerX, yPos = middleY;
            var bg = '<image x="' + xPos + '" y="' + yPos + '" width="' + width + '" height="' + height + '" xlink:href="' + bgUrl + '" />';
            
            // clear background img and insert new one
            //var svgString = svgCanvas.getSvgString();
            svgString = svgString.replace(/<title>background<\/title>((.*?\n\s)*?)<\/g>/g, "<title>background</title>$1"+bg+"</g>");
            
            // xmlns:xlink="http://www.w3.org/1999/xlink" <- make sure this is in xml namespace.
            //if (svgString.indexOf('xmlns:xlink="http://www.w3.org/1999/xlink"') == -1) {
                //svgString = svgString.replace("<svg ", "<svg " + 'xmlns:xlink="http://www.w3.org/1999/xlink" ');
            //}
        }
        
        var success = svgCanvas.setSvgString(svgString) !== false;
        if (success) {
            // re-initialize labels
            svgEditor.ext_labels.content(context.labelContent);
            // reset svg content dimensions
            svgCanvas.setResolution(w, h);
            svgEditor.resizeCanvas();
            
            if(callback){ callback(); }
        } else {
            alert('Loading failed. Please check with an administrator.');
        }
    });
};

//populate description/annotation text and snapshots
ANNOTATOR.prototype.init = function() {
	var ready = true,
		node = this.node,
		view = this.view,
		context = this,
		wiseExtensions = ['ext-prompt.js', 'ext-description.js', 'ext-clearlayer.js', 'ext-labels.js', 'ext-wise.js'];
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
				context.content = studentWork.labelContent;
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
		
		if(data.hasOwnProperty('importedBg') && isNonWSString(data.importedBg) && context.enableImport){
            context.bg = data.importedBg;
        }
        
        context.setBg(context.bg, false, function(){
            //setTimeout(function(){
                $('#svgcontent g').add('#svgcanvas').css('pointer-events', 'none');
                //svgEditor.resizeCanvas();
                $('#loading_overlay').fadeOut();
            //},500); 
        });
		
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
    
    function notFound(){
        callback(null);
    }
    
    if(isNonWSString(url)){
        var myImage = new Image();
        myImage.name = url;
        myImage.onload = findHHandWW;
        myImage.onerror = notFound;
        myImage.src = url;
    } else {
        callback(null);
    }
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