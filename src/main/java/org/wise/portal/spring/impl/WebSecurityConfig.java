package org.wise.portal.spring.impl;

import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.wise.portal.presentation.web.listeners.WISESessionListener;

import javax.servlet.http.HttpSessionListener;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http
      .csrf().disable()
      .authorizeRequests()
      .antMatchers("/admin/**").hasAnyRole("ROLE_ADMINISTRATOR,ROLE_RESEARCHER")
      .antMatchers("/").permitAll();

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
}
