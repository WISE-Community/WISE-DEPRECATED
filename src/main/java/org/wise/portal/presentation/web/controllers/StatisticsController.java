package org.wise.portal.presentation.web.controllers;

import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;

public class StatisticsController extends AbstractController {

	private Properties wiseProperties;

	/**
	 * Handle the request to the statistics page
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request, HttpServletResponse response) throws Exception {
		ModelAndView modelAndView = new ModelAndView();
		
		//add the wise base url to the model so the jsp can access it 
		modelAndView.addObject("wiseBaseURL", wiseProperties.getProperty("wiseBaseURL"));
		
		return modelAndView;
	}
	
	/**
	 * Get the portal properties
	 * @return
	 */
	public Properties getWiseProperties() {
		return wiseProperties;
	}

	/**
	 * Set the portal properties
	 * @param wiseProperties
	 */
	public void setWiseProperties(Properties wiseProperties) {
		this.wiseProperties = wiseProperties;
	}
}
