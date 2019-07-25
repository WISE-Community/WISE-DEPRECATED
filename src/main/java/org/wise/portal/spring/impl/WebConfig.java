package org.wise.portal.spring.impl;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.core.Ordered;
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
@ComponentScan(basePackages = {"org.wise.portal.presentation", "org.wise.vle.web"})
public class WebConfig implements WebMvcConfigurer {

  @Value("${google_analytics_id:}")
  private String googleAnalyticsId;

  public void addResourceHandlers(final ResourceHandlerRegistry registry) {
    registry.setOrder(Ordered.HIGHEST_PRECEDENCE);
    registry.addResourceHandler("/pages/resources/**").addResourceLocations("/portal/pages/resources/");
    registry.addResourceHandler("/portal/javascript/**").addResourceLocations("/portal/javascript/");
    registry.addResourceHandler("/portal/themes/**").addResourceLocations("/portal/themes/");
    registry.addResourceHandler("/portal/translate/**").addResourceLocations("/portal/translate/");
    registry.addResourceHandler("/vle/**").addResourceLocations("/vle/");
    registry.addResourceHandler("/wise5/**").addResourceLocations("/wise5/");
    registry.addResourceHandler("/curriculum/**").addResourceLocations("/curriculum/");
    registry.addResourceHandler("/studentuploads/**").addResourceLocations("/studentuploads/");
    registry.addResourceHandler("/curriculumWISE5/**").addResourceLocations("/curriculumWISE5/");
    registry.addResourceHandler("/index.html").addResourceLocations("/site/dist/");
    registry.addResourceHandler("/assets/**").addResourceLocations("/site/dist/assets/");
    registry.addResourceHandler("/*.js").addResourceLocations("/site/dist/");
    registry.addResourceHandler("/*.css").addResourceLocations("/site/dist/");
    registry.addResourceHandler("/*.ico").addResourceLocations("/site/dist/");
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
  public RequestToViewNameTranslator viewNameTranslator () {
    return new DefaultRequestToViewNameTranslator();
  }

  @Bean
  public UrlFilenameViewController urlFilenameViewController() {
    return new UrlFilenameViewController();
  }

  @Bean(name = "messageSource")
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

  @Bean(name = "exceptionResolver")
  public WISESimpleMappingExceptionResolver wiseSimpleMappingExceptionResolver() {
    WISESimpleMappingExceptionResolver resolver = new WISESimpleMappingExceptionResolver();
    Properties mappings = new Properties();
    mappings.setProperty("org.springframework.web.multipart.MaxUploadSizeExceededException",
        "errors/maxUploadSizeExceededError");
    mappings.setProperty("java.lang.Exception", "errors/friendlyError");
    mappings.setProperty("org.acegisecurity.AccessDeniedException", "errors/securityFriendlyError");
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
}