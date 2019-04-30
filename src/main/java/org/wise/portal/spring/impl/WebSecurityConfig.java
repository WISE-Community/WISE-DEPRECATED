package org.wise.portal.spring.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.session.security.SpringSessionBackedSessionRegistry;
import org.wise.portal.presentation.web.listeners.WISESessionListener;

import javax.servlet.http.HttpSessionListener;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig<S extends Session> extends WebSecurityConfigurerAdapter {

  @Autowired
  private FindByIndexNameSessionRepository<S> sessionRepository;

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http
      .csrf().disable()
      .authorizeRequests()
      .antMatchers("/admin/**").hasAnyRole("ADMINISTRATOR,RESEARCHER")
      .antMatchers("/").permitAll();
    http.sessionManagement().maximumSessions(2).sessionRegistry(sessionRegistry());
    http.logout().addLogoutHandler(wiseLogoutHandler());
    http.headers().frameOptions().sameOrigin();
  }

  @Override
  public void configure(WebSecurity web) throws Exception {
    web.ignoring().antMatchers("/google-login");
  }

  @Bean
  public ServletListenerRegistrationBean<HttpSessionListener> sessionListener() {
    return new ServletListenerRegistrationBean<HttpSessionListener>(new WISESessionListener());
  }

  @Bean
  public SpringSessionBackedSessionRegistry<S> sessionRegistry() {
    return new SpringSessionBackedSessionRegistry<>(this.sessionRepository);
  }

  @Bean
  public WISELogoutHandler wiseLogoutHandler() {
    return new WISELogoutHandler();
  }
}
