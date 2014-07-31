package org.wise.portal.service.websocket;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

@Configuration
@EnableWebSocket
public class WISEWebSocketConfigurer implements WebSocketConfigurer {

	/**
	 * Register the websocket handler
	 */
	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		//register our websocket handler
		registry.addHandler(webSocketHandler(), "/websocket.html").addInterceptors(new WISEHttpSessionHandshakeInterceptor());
	}
	
	/**
	 * Create the websocket container
	 * @return the server container
	 */
	@Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
    	//set the max message buffer size
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxTextMessageBufferSize(32768);
        container.setMaxBinaryMessageBufferSize(32768);
        return container;
    }

    /**
     * Get the websocket handler
     * @return the websocket handler
     */
    @Bean
	public WebSocketHandler webSocketHandler() {
		return new WISETextWebSocketHandler();
	}
}
