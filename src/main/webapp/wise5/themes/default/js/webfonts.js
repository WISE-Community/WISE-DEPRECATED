import * as webfontloader from 'webfontloader';

webfontloader.load({
  fontinactive: function(family, fvd) {
    switch (family) {
      case 'Roboto':
        webfontloader.load({
          custom: {
            families: ['Roboto:300,400,500,700,400italic'],
            urls: ['wise5/style/fonts/roboto/roboto.css']
          }
        });
        break;
      case 'Material Icons':
        webfontloader.load({
          custom: {
            families: ['Material Icons'],
            urls: ['wise5/style/fonts/material-icons/material-icons.css']
          }
        });
        break;
    }
  },
  google: {
    families: ['Roboto:300,400,500,700,400italic', 'Material Icons']
  }
});
