/**
 * The following are helper functions which should be appended to jQuery
 */
$.escapeId = function(id){
	if(id){
		return id.replace(/(:|\.)/g,'\\$1');
	}
};

// gets the cursor position 
// sample call: $("#myTextBoxSelector").getCursorPosition();
(function ($, undefined) {
    $.fn.getCursorPosition = function() {
        var el = $(this).get(0);
        var pos = 0;
        if('selectionStart' in el) {
            pos = el.selectionStart;
        } else if('selection' in document) {
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
        }
        return pos;
    };
})(jQuery);

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/jquery/js/jqueryhelper.js');
}