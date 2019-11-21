package org.wise.portal.presentation.web.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.OAuth2ClientContext;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.resource.OAuth2ProtectedResourceDetails;
import org.springframework.security.oauth2.client.token.grant.code.AuthorizationCodeResourceDetails;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableOAuth2Client;

import java.util.Arrays;

@Configuration
@EnableOAuth2Client
public class GoogleOpenIdConnectConfig {

  @Value("${google.clientId:}")
  private String googleClientId;

  @Value("${google.clientSecret:}")
  private String googleClientSecret;

  @Value("${google.accessTokenUri:}")
  private String googleAccessTokenUri;

  @Value("${google.userAuthorizationUri:}")
  private String googleUserAuthorizationUri;

  @Value("${google.redirectUri:}")
  private String googleRedirectUri;

  @Bean
  public OAuth2ProtectedResourceDetails googleOpenId() {
    final AuthorizationCodeResourceDetails details = new AuthorizationCodeResourceDetails();
    details.setClientId(googleClientId);
    details.setClientSecret(googleClientSecret);
    details.setAccessTokenUri(googleAccessTokenUri);
    details.setUserAuthorizationUri(googleUserAuthorizationUri);
    details.setScope(Arrays.asList("openid", "email"));
    details.setPreEstablishedRedirectUri(googleRedirectUri);
    details.setUseCurrentUri(false);
    return details;
  }

  @Bean
  public OAuth2RestTemplate googleOpenIdRestTemplate(final OAuth2ClientContext clientContext) {
    final OAuth2RestTemplate template = new OAuth2RestTemplate(googleOpenId(), clientContext);
    return template;
  }
}
