// WebFont Loader must be initialized
WebFont.load({
    fontinactive: function (family, fvd) {
        switch(family) {
            case 'RobotoDraft':
                WebFont.load({
                    custom: {
                        families: ['RobotoDraft:n3,n4,n5,n7,i4'],
                        urls: [ 'wise5/style/fonts/localFonts.css' ]
                    }
                });
                break;
            case 'Material Icons':
                WebFont.load({
                    custom: {
                        families: ['Material Icons'],
                        urls: [ 'wise5/style/fonts/localIconFonts.css' ]
                    }
                });
                break;
        }
    },
    google: {
        families: ['RobotoDraft:n3,n4,n5,n7,i4', 'Material Icons']
    }
});
