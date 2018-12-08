package org.wise.portal.spring.impl;

import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.XmlWebApplicationContext;
import org.springframework.web.servlet.support.AbstractDispatcherServletInitializer;

public class WISEWebAppInitializer extends AbstractDispatcherServletInitializer {

  @Override
  protected WebApplicationContext createRootApplicationContext() {
    return null;
  }

  @Override
  protected WebApplicationContext createServletApplicationContext() {
    XmlWebApplicationContext cxt = new XmlWebApplicationContext();
    cxt.setConfigLocation("classpath:configurations/dispatcherServletContexts.xml");
    return cxt;
  }

  @Override
  protected String[] getServletMappings() {
    return new String[] { "/" };
  }
}
