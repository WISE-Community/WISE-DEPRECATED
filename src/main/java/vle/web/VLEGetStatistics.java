package vle.web;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import vle.VLEServlet;
import vle.domain.statistics.VLEStatistics;

public class VLEGetStatistics extends VLEServlet {

	private static final long serialVersionUID = 1L;

	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//get all the vle statistics
		List<VLEStatistics> vleStatisticsList = VLEStatistics.getVLEStatistics();
		
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
	}
}
