/**
 * Copyright (c) 2008-2019 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.spring.impl;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpSessionListener;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.orm.hibernate5.support.OpenSessionInViewFilter;
import org.springframework.security.access.AccessDecisionVoter;
import org.springframework.security.access.event.LoggerListener;
import org.springframework.security.access.vote.ConsensusBased;
import org.springframework.security.access.vote.RoleVoter;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.oauth2.client.filter.OAuth2ClientContextFilter;
import org.springframework.security.web.access.ExceptionTranslationFilter;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.authentication.logout.LogoutFilter;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter;
import org.springframework.security.web.session.HttpSessionEventPublisher;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.session.security.SpringSessionBackedSessionRegistry;
import org.wise.portal.presentation.web.filters.GoogleOpenIdConnectFilter;
import org.wise.portal.presentation.web.filters.WISEAuthenticationFailureHandler;
import org.wise.portal.presentation.web.filters.WISEAuthenticationProcessingFilter;
import org.wise.portal.presentation.web.filters.WISEAuthenticationSuccessHandler;
import org.wise.portal.presentation.web.filters.WISESwitchUserFilter;
import org.wise.portal.presentation.web.listeners.WISESessionListener;
import org.wise.portal.service.authentication.UserDetailsService;

@Configuration
@EnableWebSecurity(debug = false)
@Order(SecurityProperties.BASIC_AUTH_ORDER - 10)
public class WebSecurityConfig<S extends Session> extends WebSecurityConfigurerAdapter {

  @Autowired
  private FindByIndexNameSessionRepository<S> sessionRepository;

  @Autowired
  private UserDetailsService userDetailsService;

  @Autowired
  private AuthenticationManager authenticationManager;

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http
        .csrf().disable()
        .addFilterAfter(openSessionInViewFilter(), SecurityContextHolderAwareRequestFilter.class)
        .addFilterAfter(oAuth2ClientContextFilter(), OpenSessionInViewFilter.class)
        .addFilterAfter(googleOpenIdConnectFilter(), OAuth2ClientContextFilter.class)
        .addFilterAfter(authenticationProcessingFilter(), GoogleOpenIdConnectFilter.class)
        .authorizeRequests()
        .antMatchers("/admin/**").hasAnyRole("ADMINISTRATOR,RESEARCHER")
        .antMatchers("/author/**").hasAnyRole("TEACHER")
        .antMatchers("/project/notifyAuthor*/**").hasAnyRole("TEACHER")
        .antMatchers("/student/account/info").hasAnyRole("TEACHER")
        .antMatchers("/student/**").hasAnyRole("STUDENT")
        .antMatchers("/studentStatus").hasAnyRole("TEACHER,STUDENT")
        .antMatchers("/teacher/**").hasAnyRole("TEACHER")
        .antMatchers("/sso/discourse").hasAnyRole("TEACHER,STUDENT")
        .antMatchers("/").permitAll();
    http.formLogin().loginPage("/login").permitAll();
    http.sessionManagement().maximumSessions(2).sessionRegistry(sessionRegistry());
    http.logout().addLogoutHandler(wiseLogoutHandler());
    http.headers().frameOptions().sameOrigin();
  }

  @Bean
  public WISEAuthenticationProcessingFilter authenticationProcessingFilter() {
    WISEAuthenticationProcessingFilter filter = new WISEAuthenticationProcessingFilter();
    filter.setAuthenticationManager(authenticationManager);
    filter.setAuthenticationSuccessHandler(authSuccessHandler());
    filter.setAuthenticationFailureHandler(authFailureHandler());
    filter.setFilterProcessesUrl("/j_acegi_security_check");
    return filter;
  }


  @Bean
  public GoogleOpenIdConnectFilter googleOpenIdConnectFilter() {
    GoogleOpenIdConnectFilter filter = new GoogleOpenIdConnectFilter("/google-login");
    filter.setAuthenticationSuccessHandler(authSuccessHandler());
    filter.setAuthenticationFailureHandler(authFailureHandler());
    return filter;
  }


  @Bean
  public OpenSessionInViewFilter openSessionInViewFilter() {
    return new OpenSessionInViewFilter();
  }

  @Bean
  public OAuth2ClientContextFilter oAuth2ClientContextFilter() {
    return new OAuth2ClientContextFilter();
  }

  @Bean
  public LoggerListener loggerListener() {
    return new LoggerListener();
  }

  @Bean
  public LoginUrlAuthenticationEntryPoint authenticationEntryPoint() {
    return new LoginUrlAuthenticationEntryPoint("/login");
  }

  @Bean
  public ExceptionTranslationFilter exceptionTranslationFilter() {
    return new ExceptionTranslationFilter(authenticationEntryPoint());
  }

  @Bean
  public RoleVoter roleVoter() {
    return new RoleVoter();
  }

  @Bean
  public LogoutFilter logoutFilter() {
    LogoutHandler[] handlers = new LogoutHandler[]{ new SecurityContextLogoutHandler() };
    return new LogoutFilter("/", handlers);
  }

  @Bean
  public HttpSessionEventPublisher httpSessionEventPublisher() {
    return new HttpSessionEventPublisher();
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
  public AuthenticationSuccessHandler authSuccessHandler() {
    WISEAuthenticationSuccessHandler handler = new WISEAuthenticationSuccessHandler();
    handler.setDefaultTargetUrl("/student");
    return handler;
  }

  @Bean
  public AuthenticationFailureHandler authFailureHandler() {
    WISEAuthenticationFailureHandler handler = new WISEAuthenticationFailureHandler();
    handler.setAuthenticationFailureUrl("/login?failed=true");
    return handler;
  }

  @Bean
  public ConsensusBased urlAccessDecisionManager() {
    List<AccessDecisionVoter<? extends Object>> decisionVoters = new ArrayList<>();
    decisionVoters.add(roleVoter());
    ConsensusBased manager = new ConsensusBased(decisionVoters);
    manager.setAllowIfAllAbstainDecisions(false);
    return manager;
  }

  @Bean
  public WISESwitchUserFilter switchUserProcessingFilter() {
    WISESwitchUserFilter filter = new WISESwitchUserFilter();
    filter.setUserDetailsService(userDetailsService);
    filter.setSwitchUserUrl("/login/impersonate");
    filter.setExitUserUrl("/logout/impersonate");
    filter.setSuccessHandler(authSuccessHandler());
    return filter;
  }

  @Bean
  public WISELogoutHandler<Session> wiseLogoutHandler() {
    return new WISELogoutHandler<Session>();
  }
}
