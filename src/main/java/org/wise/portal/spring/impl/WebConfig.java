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

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.core.Ordered;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.ui.context.ThemeSource;
import org.springframework.ui.context.support.ResourceBundleThemeSource;
import org.springframework.web.context.request.RequestContextListener;
import org.springframework.web.context.support.ServletContextAttributeExporter;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.RequestToViewNameTranslator;
import org.springframework.web.servlet.ThemeResolver;
import org.springframework.web.servlet.ViewResolver;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.handler.SimpleUrlHandlerMapping;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;
import org.springframework.web.servlet.mvc.UrlFilenameViewController;
import org.springframework.web.servlet.theme.FixedThemeResolver;
import org.springframework.web.servlet.view.DefaultRequestToViewNameTranslator;
import org.springframework.web.servlet.view.JstlView;
import org.springframework.web.servlet.view.UrlBasedViewResolver;

@EnableWebMvc
@Configuration
@ComponentScan(basePackages = { "org.wise.portal.presentation", "org.wise.portal.service",
    "org.wise.portal.dao", "org.wise.vle.web" })
public class WebConfig implements WebMvcConfigurer {

  @Value("${google_analytics_id:}")
  private String googleAnalyticsId;

  @Autowired
  private ObjectMapper objectMapper;

  public void addResourceHandlers(final ResourceHandlerRegistry registry) {
    registry.setOrder(Ordered.HIGHEST_PRECEDENCE);
    registry.addResourceHandler("/pages/resources/**")
        .addResourceLocations("/portal/pages/resources/");
    registry.addResourceHandler("/portal/javascript/**")
        .addResourceLocations("/portal/javascript/");
    registry.addResourceHandler("/portal/themes/**").addResourceLocations("/portal/themes/");
    registry.addResourceHandler("/portal/translate/**").addResourceLocations("/portal/translate/");
    registry.addResourceHandler("/vle/**").addResourceLocations("/vle/");
    registry.addResourceHandler("/wise5/**").addResourceLocations("/wise5/");
    registry.addResourceHandler("/tinymce/**").addResourceLocations("/site/dist/tinymce/");
    registry.addResourceHandler("/site/**").addResourceLocations("/site/");
    registry.addResourceHandler("/curriculum/**").addResourceLocations("/curriculum/");
    registry.addResourceHandler("/studentuploads/**").addResourceLocations("/studentuploads/");
    registry.addResourceHandler("/curriculumWISE5/**").addResourceLocations("/curriculumWISE5/");
    registry.addResourceHandler("/assets/**").addResourceLocations("/site/dist/assets/");
    registry.addResourceHandler("/*.css*").addResourceLocations("/site/dist/");
    registry.addResourceHandler("/*.js*").addResourceLocations("/site/dist/");
  }

  @Bean
  public RequestContextListener requestContextListener() {
    return new RequestContextListener();
  }

  @Bean
  public ViewResolver urlBasedViewResolver() {
    UrlBasedViewResolver resolver = new UrlBasedViewResolver();
    resolver.setViewClass(JstlView.class);
    resolver.setPrefix("/portal/");
    resolver.setSuffix(".jsp");
    return resolver;
  }

  @Bean
  public LocaleResolver localeResolver() {
    SessionLocaleResolver resolver = new SessionLocaleResolver();
    resolver.setDefaultLocale(Locale.US);
    return resolver;
  }

  @Bean
  public LocaleChangeInterceptor localeChangeInterceptor() {
    LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
    interceptor.setParamName("lang");
    return interceptor;
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(localeChangeInterceptor());
  }

  @Bean
  public ThemeResolver themeResolver() {
    FixedThemeResolver resolver = new FixedThemeResolver();
    resolver.setDefaultThemeName("default");
    return resolver;
  }

  @Bean
  public ThemeSource themeSource() {
    ResourceBundleThemeSource source = new ResourceBundleThemeSource();
    source.setBasenamePrefix("themes/");
    return source;
  }

  @Bean
  public RequestToViewNameTranslator viewNameTranslator() {
    return new DefaultRequestToViewNameTranslator();
  }

  @Bean
  public UrlFilenameViewController urlFilenameViewController() {
    return new UrlFilenameViewController();
  }

  @Bean
  public ReloadableResourceBundleMessageSource messageSource() {
    ReloadableResourceBundleMessageSource messageBundle = new ReloadableResourceBundleMessageSource();
    messageBundle.setBasename("classpath:i18n/i18n");
    messageBundle.setDefaultEncoding("UTF-8");
    messageBundle.setFallbackToSystemLocale(false);
    return messageBundle;
  }

  @Bean
  public ServletContextAttributeExporter servletContextAttributeExporter() {
    ServletContextAttributeExporter exporter = new ServletContextAttributeExporter();
    Map<String, Object> attributes = new HashMap<String, Object>();
    attributes.put("google_analytics_id", googleAnalyticsId);
    exporter.setAttributes(attributes);
    return exporter;
  }

  @Bean
  public WISESimpleMappingExceptionResolver exceptionResolver() {
    WISESimpleMappingExceptionResolver resolver = new WISESimpleMappingExceptionResolver();
    Properties mappings = new Properties();
    mappings.setProperty("org.springframework.web.multipart.MaxUploadSizeExceededException",
        "errors/maxUploadSizeExceededError");
    mappings.setProperty("java.lang.Exception", "errors/friendlyError");
    mappings.setProperty("org.springframework.security.access.AccessDeniedException",
        "errors/accessdenied");
    mappings.setProperty("org.wise.portal.presentation.web.exception.NotAuthorizedException",
        "errors/accessdenied");
    resolver.setExceptionMappings(mappings);
    return resolver;
  }

  @Bean
  public SimpleUrlHandlerMapping simpleUrlHandlerMapping() {
    SimpleUrlHandlerMapping simpleUrlHandlerMapping = new SimpleUrlHandlerMapping();
    simpleUrlHandlerMapping.setOrder(2);
    Properties mappings = new Properties();
    mappings.setProperty("/**/*", "urlFilenameViewController");
    simpleUrlHandlerMapping.setMappings(mappings);
    simpleUrlHandlerMapping.setInterceptors(localeChangeInterceptor());
    return simpleUrlHandlerMapping;
  }

  @Override
  public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
    converters.add(2, new MappingJackson2HttpMessageConverter(this.objectMapper));
  }
}
