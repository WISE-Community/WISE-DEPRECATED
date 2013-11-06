/*
 * ext-importStudentAsset.js
 * launches the student assets dialog
 * @author hirokiterashima
 */
svgEditor.addExtension("Import Student Asset", function() {
	
	/* Private variables */
	var loaded = false;
	
	/* Public API (accessible via svgEditor object) */
	var api = svgEditor.ext_importstudentasset = {
		/** 
		 * Gets whether extensions has completely loaded
		 * 
		 * @returns Boolean
		 */
		isLoaded: function(){
			return loaded;
		}
	};

	return {
		name: "Import Student Asset",
		svgicons: "extensions/import_student_asset.xml",
		buttons: [{
			id: "tool_import_student_asset",
			type: "mode",
			title: "Import File", 
			events: {
				'click': function() {
					eventManager.fire("viewStudentAssets", null); // TODO: customize to show only allowed file types
				}
			}
		}],
		callback: function(){
			//$('#tool_import_student_asset').insertAfter('#tool_text'); // place connector button directly after text_tool
			// reset flyout positions
			setTimeout(function(){
				$('.tools_flyout').each(function() {
					var shower = $('#' + this.id + '_show');
					var pos = shower.offset();
					var w = shower.outerWidth();
					$(this).css({left: pos.left + w, top: pos.top});
				});
			},500);
			
			loaded = true;
		}
	};
});

