/**
 * 
 */
package utils;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author patrick lawler
 *
 */
public class EchoPostData extends HttpServlet{

	private static final long serialVersionUID = 1L;
	
	private static final String DATA = "data";
	
	private static final String NAME = "name";
	
	public void doPost(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException, IOException {
		try {
			String name = request.getParameter(NAME);
			
			response.setContentType("text/plain");
			response.setHeader("Content-Disposition", "attachment; filename=\"" + name + "\"");
			response.getWriter().print(request.getParameter(DATA));
		} catch(IllegalStateException e) {
			e.printStackTrace();
		}
	}
	
	public void doGet(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException, IOException {
		response.setContentType("text/xml; charset=UTF-8");
		response.getWriter().print(request.getParameter(DATA));
	}
}
