/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes Safari >= 10, Chrome >= 55 (including Opera),
 * Edge >= 13 on the desktop, and iOS 10 and Chrome on mobile.
 *
 * Learn more in https://angular.io/guide/browser-support
 */

/***************************************************************************************************
* BROWSER POLYFILLS
*/



/**
 * Required to support Web Animations `@angular/platform-browser/animations`.
 * Needed for: All but Chrome, Firefox and Opera. http://caniuse.com/#feat=web-animation
 **/
// import 'web-animations-js';  // Run `npm install --save web-animations-js`.



/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js/dist/zone';  // Included with Angular CLI.



/***************************************************************************************************
 * APPLICATION IMPORTS
 */
import * as jQuery from 'jquery';
import * as fabric from 'fabric';
import * as StompJS from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import * as Highcharts from '../../lib/highcharts/highcharts.src';
import * as hopscotch from 'hopscotch';
import * as EventEmitter2 from 'eventemitter2';

window['$'] = jQuery;
window['jQuery'] = jQuery;
window['fabric'] = fabric.fabric;
window['SockJS'] = SockJS;
window['Stomp'] = StompJS.Stomp;
window['hopscotch'] = hopscotch;
window['Highcharts'] = Highcharts;
window['EventEmitter2'] = EventEmitter2;
import * as summernote from 'summernote';
window['summernote'] = summernote;
