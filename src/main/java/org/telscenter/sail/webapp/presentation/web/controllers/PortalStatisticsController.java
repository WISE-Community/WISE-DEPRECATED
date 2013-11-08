package org.telscenter.sail.webapp.presentation.web.controllers;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.portal.PortalStatistics;
import org.telscenter.sail.webapp.presentation.util.json.JSONArray;
import org.telscenter.sail.webapp.presentation.util.json.JSONObject;
import org.telscenter.sail.webapp.service.portal.PortalStatisticsService;

public class PortalStatisticsController extends AbstractController {

	private PortalStatisticsService portalStatisticsService;
	
	public PortalStatisticsService getPortalStatisticsService() {
		return portalStatisticsService;
	}

	public void setPortalStatisticsService(
			PortalStatisticsService portalStatisticsService) {
		this.portalStatisticsService = portalStatisticsService;
	}

	/**
	 * Retrieve all the portal statistics and put them into a JSONArray
	 * and then return the JSONArray as a string
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request, HttpServletResponse response) throws Exception {
		
		//get all the portal statistics ordered by timestamp from oldest to newest
		List<PortalStatistics> portalStatisticsList = portalStatisticsService.getPortalStatistics();

		//the array to store all the portal statistics in JSONObject form
		JSONArray portalStatisticsArray = new JSONArray();
		
		//loop through all the portal statistics
		for(int x=0; x<portalStatisticsList.size(); x++) {
			//get a portal statistics object
			PortalStatistics portalStatistics = portalStatisticsList.get(x);
			
			//get the JSONObject representation of the portal statistics
			JSONObject portalStatisticsJSONObject = portalStatistics.getJSONObject();
			
			//add it to our array
			portalStatisticsArray.put(portalStatisticsJSONObject);
		}
		
		//send back the JSONArray that contains all the portal statistics as a string
		response.getWriter().write(portalStatisticsArray.toString());
		
		return null;
	}

}
