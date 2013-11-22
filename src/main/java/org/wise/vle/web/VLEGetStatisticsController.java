package org.wise.vle.web;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.wise.portal.service.vle.VLEService;
import org.wise.vle.domain.statistics.VLEStatistics;


public class VLEGetStatisticsController extends AbstractController {

	private static final long serialVersionUID = 1L;
	
	private VLEService vleService;
	
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request, HttpServletResponse response) throws Exception {
		if (request.getMethod() == AbstractController.METHOD_GET) {
			return doGet(request, response);
		}
		return null;
	}

	public ModelAndView doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//get all the vle statistics
		List<VLEStatistics> vleStatisticsList = vleService.getVLEStatistics();
		
		//create a JSONArray to store all the vle statistics
		JSONArray vleStatisticsJSONArray = new JSONArray();
		
		//loop through all the vle statistics and put them into the array
		for(int x=0; x<vleStatisticsList.size(); x++) {
			VLEStatistics vleStatistics = vleStatisticsList.get(x);
			
			if(vleStatistics != null) {
				JSONObject vleStatisticsJSONObject = vleStatistics.getJSONObject();
				
				if(vleStatisticsJSONObject != null) {
					vleStatisticsJSONArray.put(vleStatisticsJSONObject);					
				}
			}
		}

		//return the JSONArray in string form
		response.getWriter().write(vleStatisticsJSONArray.toString());
		
		return null;
	}
	
	public VLEService getVleService() {
		return vleService;
	}

	public void setVleService(VLEService vleService) {
		this.vleService = vleService;
	}
}
