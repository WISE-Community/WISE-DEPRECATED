package org.wise.portal.service.websocket;

import java.util.Map;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;

public class WISEHttpSessionHandshakeInterceptor extends HttpSessionHandshakeInterceptor {

	/**
	 * Called before the websocket connection is opened
	 * @param request the http request
	 * @param response the http response
	 * @param wsHandler the websocket handler
	 * @param attributes the session attributes
	 */
	@Override
	public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
		//get the signed in user
		User signedInUser = ControllerUtil.getSignedInUser();
		
		//add the signed in user to the attributes so we can access it in the websocket handler
		attributes.put("signedInUser", signedInUser);
		
		return super.beforeHandshake(request, response, wsHandler, attributes);
	}
	
	/**
	 * Called after the websocket connection is opened
	 * @param request the http request
	 * @param response the http response
	 * @param wsHandler the websocket handler
	 */
	@Override
	public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception e) {
		super.afterHandshake(request, response, wsHandler, e);
	}
}
