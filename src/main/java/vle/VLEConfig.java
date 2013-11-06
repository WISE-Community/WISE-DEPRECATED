package vle;


import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Servlet implementation class VLEConfig
 */
public class VLEConfig extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public VLEConfig() {
        super();
        // TODO Auto-generated constructor stub
    }

	private String getServletUrl(HttpServletRequest request) {
		return request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + request.getContextPath();
	}
	
	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String base_www = getServletUrl(request);
		String projectId = request.getParameter("projectId");
		String contentUrl = content_location(projectId);
		String contentBaseUrl = contentUrl.substring(0, contentUrl.lastIndexOf('/') + 1) + "/";  //.substring(0, contentUrl.lastIndexOf('/') + 1);
		String postDataUrl = base_www + "/script/postVisits.php";
		String getDataUrl = base_www + "/getdata.html";
		String userInfoUrl = base_www + "/vle/VLEGetUser";
		try {
			JSONObject config = new JSONObject();
			config.put("runId", 3);
			config.put("mode", "developerpreview");
			config.put("getFlagsUrl", "dummyflagsurl");
			config.put("getUserInfoUrl", userInfoUrl);
			config.put("getContentUrl", contentUrl);
			config.put("getContentBaseUrl", contentBaseUrl);
			config.put("getDataUrl", getDataUrl);
			config.put("postDataUrl", postDataUrl);
			config.put("getRunInfoUrl", "dummy");
			config.put("theme", "WISE");
			config.put("enableAudio", false);
			config.put("runInfoRequestInterval", -1);
			config.put("getProjectMetadataUrl", userInfoUrl + "x");
			response.setHeader("Cache-Control", "no-cache");
			response.setHeader("Pragma", "no-cache");
			response.setDateHeader ("Expires", 0);
			
			response.setContentType("text/json");
			//response.getWriter().print(vleConfigString.toString());
			response.getWriter().print(config.toString());
		} catch (JSONException e) {
			
		}
	}


	private String content_location(String projectId) {
		try {
			for (int i=0; i <  VLEView.projectsJSONArray.length(); i++) {
				if (VLEView.projectsJSONArray.getJSONObject(i).get("id").equals(projectId)) {
					JSONObject projectJSONObj =  (JSONObject) VLEView.projectsJSONArray.getJSONObject(i);
					String contentPath = (String) projectJSONObj.get("contentpath");
					return contentPath;
				}
			}
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "";
	}
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

}
