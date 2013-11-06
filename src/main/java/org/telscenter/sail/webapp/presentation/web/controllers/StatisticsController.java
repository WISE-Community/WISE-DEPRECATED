package org.telscenter.sail.webapp.presentation.web.controllers;

import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;

public class StatisticsController extends AbstractController {

	private Properties portalProperties;

	/**
	 * Handle the request to the statistics page
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request, HttpServletResponse response) throws Exception {
		ModelAndView modelAndView = new ModelAndView();
		
		//add the portal base url and vlewrapper base url to the model so the jsp can access it 
		modelAndView.addObject("portal_baseurl", portalProperties.getProperty("portal_baseurl"));
		modelAndView.addObject("vlewrapper_baseurl", portalProperties.getProperty("vlewrapper_baseurl"));
		
		return modelAndView;
	}
	
	/**
	 * Get the portal properties
	 * @return
	 */
	public Properties getPortalProperties() {
		return portalProperties;
	}

	/**
	 * Set the portal properties
	 * @param portalProperties
	 */
	public void setPortalProperties(Properties portalProperties) {
		this.portalProperties = portalProperties;
	}
}
