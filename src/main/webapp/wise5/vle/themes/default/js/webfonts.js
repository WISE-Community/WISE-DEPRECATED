import webfontloader from 'webfontloader';

// WebFont Loader must be initialized
webfontloader.load({
    fontinactive: function (family, fvd) {
        switch(family) {
            case 'RobotoDraft':
                webfontloader.load({
                    custom: {
                        families: ['RobotoDraft:300,400,500,700,i4'],
                        urls: [ 'wise5/style/fonts/localFonts.css' ]
                    }
                });
                break;
            case 'Material Icons':
                webfontloader.load({
                    custom: {
                        families: ['Material Icons'],
                        urls: [ 'wise5/style/fonts/localIconFonts.css' ]
                    }
                });
                break;
        }
    },
    google: {
        families: ['RobotoDraft:300,400,500,700,i4', 'Material Icons']
    }
});
