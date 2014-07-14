package org.wise.portal.service.websocket;

import java.util.Map;

import javax.websocket.HandshakeResponse;
import javax.websocket.server.HandshakeRequest;
import javax.websocket.server.ServerEndpointConfig;

import org.springframework.web.socket.server.standard.SpringConfigurator;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;

public class WISEConfigurator extends SpringConfigurator {

	/**
	 * Intercept the websocket handshake in order to inject the signed in
	 * user into the user properties. We need to do this because we
	 * don't have a way to directly access the signed in user in the 
	 * EndPoint.onOpen() function but we will have access to the
	 * user properties object.
	 * @param sec the server endpoing config
	 * @param request the request object
	 * @param response the response object
	 */
	@Override
	public void modifyHandshake(ServerEndpointConfig sec, HandshakeRequest request, HandshakeResponse response) {
		//get the signed in user
		User signedInUser = ControllerUtil.getSignedInUser();

		//get the user properties
		Map<String, Object> userProperties = sec.getUserProperties();
		
		//add the signed in user to the user properties
		userProperties.put("signedInUser", signedInUser);
	}
}
