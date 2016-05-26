(function (factory) {
    /* global define */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals
        factory(window.jQuery);
    }
}(function ($) {
    // Extends lang for print plugin.
    /*$.extend(true, $.summernote.lang, {
        'en-US': {
            customButton: {
            customButton: 'Add Notebook Item' // TODO: set as option, use project term for 'Notebook'
            }
        }
    });*/

// Extends plugins for print plugin.
$.extend($.summernote.plugins, {
    /**
    * @param {Object} context - context object has status of editor.
    */
    'customButton': function (context) {
        var self = this;

        // ui has renders to build ui elements.
        //  - you can create a button with `ui.button`
        var ui = $.summernote.ui;
        var $editor = context.layoutInfo.editor;
        var options = context.options;
        var lang = options.langInfo;

        // add add note button
        context.memo('button.customButton', function () {
            var buttonText = (options.customButton && options.customButton.buttonText) ? options.customButton.buttonText : 'Custom Button';
            var buttonClass = (options.customButton && options.customButton.buttonClass) ? options.customButton.buttonClass : '';
            var tooltip = (options.customButton && options.customButton.tooltip) ? options.customButton.tooltip : 'Do Something';
            var action = (options.customButton && options.customButton.action) ? options.customButton.action : null;
            
            // create button
            var button = ui.button({
                className: 'note-btn-custom ' + buttonClass,
                contents: buttonText,
                tooltip: tooltip,
                click: function () {
                    if (action) {
                        action();
                    } else {
                        return;
                    }
                }
            });
            // create jQuery object from button instance.
            var $customButton = button.render();
            return $customButton;
        });

        this.initialize = function () {
        };

        this.destroy = function () {
        };
    }
});
}));
