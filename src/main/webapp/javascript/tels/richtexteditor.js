var myEditor;

var showeditor = function(richTextAllowed, type) {
	
	if(type=='OPEN_RESPONSE') { //only load editor for OPEN RESPONSE question types
	    //Setup some private variables
	    var Dom = YAHOO.util.Dom,
	        Event = YAHOO.util.Event;
	
	        //The SimpleEditor config
	        var myConfig = null;
	        if (richTextAllowed === true || richTextAllowed == 'true') {
	        myConfig = {
	            height: '300px',
	            width: '600px',
	            dompath: false,
	            focusAtStart: true,
	            toolbar: {
	        	collapse: true,
	        	titlebar: 'Editor',
	        	draggable: false,
	        	buttons: [        	      
	        	    { group: 'fontstyle', label: 'Font Name and Size',
	        	        buttons: [
	        	            { type: 'select', label: 'Arial', value: 'fontname', disabled: true,
	        	                menu: [
	        	                    { text: 'Arial', checked: true },
	        	                    { text: 'Arial Black' },
	        	                    { text: 'Comic Sans MS' },
	        	                    { text: 'Courier New' },
	        	                    { text: 'Lucida Console' },
	        	                    { text: 'Tahoma' },
	        	                    { text: 'Times New Roman' },
	        	                    { text: 'Trebuchet MS' },
	        	                    { text: 'Verdana' }
	        	                ]
	        	            },
	        	            { type: 'spin', label: '13', value: 'fontsize', range: [ 9, 75 ], disabled: true }
	        	        ]
	        	    },
	        	    { type: 'separator' },
	        	    { group: 'textstyle', label: 'Font Style',
	        	        buttons: [
	        	            { type: 'push', label: 'Bold CTRL + SHIFT + B', value: 'bold' },
	        	            { type: 'push', label: 'Italic CTRL + SHIFT + I', value: 'italic' },
	        	            { type: 'push', label: 'Underline CTRL + SHIFT + U', value: 'underline' },
	        	            { type: 'separator' },
	        	            { type: 'color', label: 'Font Color', value: 'forecolor', disabled: true },
	        	            { type: 'color', label: 'Background Color', value: 'backcolor', disabled: true }
	        	        ]
	        	    },
	        	    { type: 'separator' },
	        	    { group: 'indentlist', label: 'Lists',
	        	        buttons: [
	        	            { type: 'push', label: 'Create an Unordered List', value: 'insertunorderedlist' },
	        	            { type: 'push', label: 'Create an Ordered List', value: 'insertorderedlist' }
	        	        ]
	        	    },
	        	    { type: 'separator' },
	        	    { group: 'insertitem', label: 'Insert Item',
	        	        buttons: [
	        	            { type: 'push', label: 'HTML Link CTRL + SHIFT + L', value: 'createlink', disabled: true },
	        	            { type: 'push', label: 'Insert Image', value: 'insertimage' }
	        	        ]
	        	    }
	        	]
	        }
	
	        };
	    } else {
	        myConfig = {
	                height: '300px',
	                width: '600px',
	                dompath: false,
	                focusAtStart: true,
	                toolbar: {
	            	collapse: false,
	            	titlebar: 'Text Editing Tools',
	            	draggable: false,
	            	buttons: [ { group: 'textstyle', label: 'Font Style',
	        	        buttons: [
	              	            { type: 'push', label: 'Bold CTRL + SHIFT + B', value: 'bold' },
	              	            { type: 'push', label: 'Italic CTRL + SHIFT + I', value: 'italic' },
	              	            { type: 'push', label: 'Underline CTRL + SHIFT + U', value: 'underline' },
	              	            { type: 'separator' },
	              	            { type: 'color', label: 'Font Color', value: 'forecolor', disabled: true },
	              	            { type: 'color', label: 'Background Color', value: 'backcolor', disabled: true }
	              	        ]
	              	    }
	          	      ]
	                }
	         };        
	
	    }
	
	    //Now let's load the SimpleEditor..
	    myEditor = new YAHOO.widget.Editor('editor', myConfig);
	    myEditor._defaultToolbar.titlebar = false;   // move the titlebar
	    
	    myEditor.on('toolbarLoaded', function() {
	        if (richTextAllowed === true || richTextAllowed == 'true') {
	        } else {
	            this.toolbar.collapse(true);                 
	        }
	    }, myEditor, true);
	
	
	    myEditor.render();
	
	    //Inside an event handler after the Editor is rendered
	    YAHOO.util.Event.on('submitResponse', 'click', function() {
		
			//Put the HTML back into the text area
			myEditor.saveHTML();
			
			//The var html will now have the contents of the textarea
			var html = myEditor.get('element').value;
			
			if(validate()){
				post();
			};	
	    });
    
    } else {
    	YAHOO.util.Event.on('submitResponse', 'click', function() {
    		if(validate()){
				post();
			};
		});	
    };
};