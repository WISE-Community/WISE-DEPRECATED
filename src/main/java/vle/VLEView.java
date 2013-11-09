package vle;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;

public class VLEView extends HttpServlet {

	private static final long serialVersionUID = 1L;

	@SuppressWarnings("unused")
	private static final String PROJECT_PATHS = "";
	
	static JSONArray projectsJSONArray;
	
	{
		try {
			// Read properties file.
			InputStream resourceAsStream = this.getClass().getResourceAsStream("projects.json");
			BufferedReader br = new BufferedReader(new InputStreamReader(resourceAsStream));
			StringBuffer fileData = new StringBuffer(1000);
			char[] buf = new char[1024];
			int numRead=0;
			while((numRead=br.read(buf)) != -1){
				fileData.append(buf, 0, numRead);
			}
			br.close();
			String projectsJSONString = fileData.toString();
			projectsJSONArray = new JSONArray(projectsJSONString);
		} catch (Exception e) {
			System.err.println("vleview.java could not read projects.json file");
			e.printStackTrace();
		}
         /*
		try {
			projectsJSONString = readFileAsString(projectsJSONURL.getPath());
			projectsJSONArray = new JSONArray(projectsJSONString);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 
		*/
	}
	
	static String readFileAsString(String filePath)
    throws java.io.IOException{
        StringBuffer fileData = new StringBuffer(1000);
        BufferedReader reader = new BufferedReader(
                new FileReader(filePath));
        char[] buf = new char[1024];
        int numRead=0;
        while((numRead=reader.read(buf)) != -1){
            fileData.append(buf, 0, numRead);
        }
        reader.close();
        return fileData.toString();
    }
	
	public void doGet(HttpServletRequest request, HttpServletResponse response) {		
		String projectId = request.getParameter("projectId");
		if (projectId != null) {
			String vleConfigUrl = getServletUrl(request) + "/VLEConfig";
			vleConfigUrl += "?projectId=" + projectId;

			request.setAttribute("vleconfig_url", vleConfigUrl);
			
			RequestDispatcher dispatcher = getServletConfig().getServletContext().getRequestDispatcher("/view.jsp");
			try {
				//pass the request to the jsp page so it can retrieve the urls in the attributes
				dispatcher.include(request, response);
			} catch (ServletException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}			
		} else {
			request.setAttribute("projectsJSONString", projectsJSONArray.toString());
			RequestDispatcher dispatcher = getServletConfig().getServletContext().getRequestDispatcher("/view.jsp");
			
			try {
				dispatcher.forward(request, response);
			} catch (ServletException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
			
		}
	}
	
	/**
	 * Returns a '|' delimited String of all projects, returns an empty
	 * String if no projects exist
	 * 
	 * @return String
	 */
	/*
	private String getProjectList(HttpServletRequest request)throws IOException{
		String rawPaths = request.getParameter(PROJECT_PATHS);
		String[] paths = rawPaths.split("~");
		List<String> visited = new ArrayList<String>();
		List<String> projects = new ArrayList<String>();
		String projectList = "";
		
		if(paths!=null && paths.length>0){
			for(int p=0;p<paths.length;p++){
				File f = new File(paths[p]);
				getProjectFiles(f, projects, visited);
			}
			Collections.sort(projects, new CompareByLastModified());
			for(int q=0;q<projects.size();q++){
				projectList += projects.get(q);
				if(q!=projects.size()-1){
					projectList += "|";
				}
			}
			return projectList;
		} else {
			return "";
		}
	}
	*/
	
	private String getServletUrl(HttpServletRequest request) {
		return request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + request.getContextPath();
	}
}
