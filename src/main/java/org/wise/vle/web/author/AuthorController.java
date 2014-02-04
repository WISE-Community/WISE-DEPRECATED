/**
 * 
 */
package org.wise.vle.web.author;

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author hirokiterashima
 *
 */
public class AuthorController extends HttpServlet {

	private static final long serialVersionUID = 1L;

	public void doGet(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException, IOException {
		
		String type = request.getParameter("type");
		
		//get the context path e.g. /wise
		String contextPath = request.getContextPath();
		
		ServletContext servletContext = this.getServletContext();
		ServletContext wiseContext = servletContext.getContext(contextPath);
		
		if (type == null) {
			// get student data
			response.sendRedirect(contextPath + "/author/authorproject.html");
		} else if (type.equals("flag") || type.equals("annotation")){			// get flags
			RequestDispatcher requestDispatcher = wiseContext.getRequestDispatcher("/annotations.html");
			requestDispatcher.forward(request, response);
		} 
	}
	
	public void doPost(HttpServletRequest request,
			HttpServletResponse response)
	throws ServletException, IOException {
		
	}
}
