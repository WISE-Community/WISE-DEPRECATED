// WebFont Loader must be initialized
WebFont.load({
    fontinactive: function (family, fvd) {
        switch(family) {
            case 'Hind':
                console.log('Hind inactive');
                WebFont.load({
                    custom: {
                        families: ['Hind:n4'],
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
        families: ['Hind:n4', 'Material Icons']
    }
});