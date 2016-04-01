// Copyright 2002-2015, University of Colorado Boulder
// For licensing, please contact phethelp@colorado.edu

/**
 * Client API for connection to simulations, see https://github.com/phetsims/together/tree/gh-pages
 * @author Sam Reid (PhET Interactive Simulations)
 */
(function() {

  // The protocol version supported by this client, so that we can maintain backward compatibility when making
  // protocol changes (or at least send reasonable error messages)
  var protocol = 'phet-0.0.1';

  // Keep track of message unique IDs for matching responses.
  // Don't start at 0 or it won't pass the message.request.messageID test below!
  var messageID = 1;

  // When sending a message, the system can watch for responses that match the incoming messageID
  var responseListeners = [];

  // General listeners that just want to see what message was received, not necessarily in response to any request
  var messageListeners = [];

  // Send the specified JS object with the protocol and as JSON
  var send = function( frame, message, callback ) {
    var deliveredMessage = _.extend( { messageID: messageID, protocol: protocol }, message );
    frame.contentWindow.postMessage( JSON.stringify( deliveredMessage ), '*' );
    if ( callback ) {
      responseListeners.push( { message: deliveredMessage, callback: callback } );
    }
    messageID++;
  };

  // Listen for events from the simulation iframe
  window.addEventListener( 'message', function( event ) {
    var message = JSON.parse( event.data );

    for ( var i = 0; i < responseListeners.length; i++ ) {
      if ( message.request && message.request.messageID && responseListeners[ i ].message.messageID === message.request.messageID ) {
        responseListeners[ i ].callback( message );

        // Some responseListeners need to receive multiple callbacks.  Others should be removed.
        if ( responseListeners[ i ].message.command !== 'linkProperty' &&
             responseListeners[ i ].message.command !== 'linkCommand' &&
             responseListeners[ i ].message.command !== 'addEventListener' &&
             responseListeners[ i ].message.command !== 'addArchListener' ) {
          responseListeners.splice( i, 1 );
        }
        return; // Only one listener per message ID, though other listeners could be added elsewhere using addEventListener.
      }
    }

    for ( i = 0; i < messageListeners.length; i++ ) {
      messageListeners[ i ]( message, event );
    }
  }, false );

  window.phet = window.phet || {};
  window.phet.together = window.phet.together || {
    send: send,
    addMessageListener: function( messageListener ) {
      messageListeners.push( messageListener );
    }
  };
})();