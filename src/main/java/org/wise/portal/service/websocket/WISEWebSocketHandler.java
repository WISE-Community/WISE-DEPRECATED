package org.wise.portal.service.websocket;

import org.wise.portal.domain.user.User;

/**
 * An interface that exposes the handleMessage() function of a websocket handler
 */
public interface WISEWebSocketHandler {

	/*
	 * exposes the function that allows us to send a websocket message to the 
	 * websocket handler. the websocket handler then sends the message to the  
	 * appropriate clients currently connected to websockets.
	 * @param user the user that is sending the message
	 * @param message the text message
	 */
	public void handleMessage(User user, String message);
}
