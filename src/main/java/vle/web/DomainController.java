/**
 * 
 */
package vle.web;

 import java.io.IOException;
import java.util.List;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import vle.domain.PersistableDomain;

/**
 * @author hirokiterashima
 *
 */
public abstract class DomainController extends HttpServlet {

	private static final long serialVersionUID = 1L;

	protected abstract String getHomePath();
	
	protected abstract String getObjectAttributeName();
	
	protected abstract String getObjectListAttributeName();
	
	protected abstract PersistableDomain getObjectById(Long id);
	
	protected abstract List<? extends PersistableDomain> getObjectList();
	
	protected void doGet(
			HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		String action = request.getParameter("action");
		if (action == null || action.equals("manage")) {
			handleManageAction(request, response);
		} else if (action.equals("create")) {
			handleCreateAction(request, response);
		} else if (action.equals("delete")) {
			handleDeleteAction(request, response);
		} else if (action.equals("update")) {
			handleUpdateAction(request, response);
		}
	}
	

	/**
	 * Deletes the Environment with id that is specified in the request parameter.
	 * Returns User to the Manage Environments page.
	 * @param request
	 * @param response
	 * @throws IOException 
	 * @throws ServletException 
	 */
	private void handleDeleteAction(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		String id = request.getParameter("id");
		
		PersistableDomain domain = getObjectById(new Long(id));
		domain.delete();
		response.sendRedirect(getHomePath());
	}
	
	/**
	 * Edits the 
	 * @param request
	 * @param response
	 * @throws ServletException
	 * @throws IOException
	 */
	private void handleUpdateAction(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		String id = request.getParameter("id");
		PersistableDomain domain = getObjectById(new Long(id));

		RequestDispatcher requestDispatcher = request.getRequestDispatcher("/" + getHomePath() + "/update.jsp");
		request.setAttribute(getObjectAttributeName(), domain);
		requestDispatcher.forward(request, response);
	}
	
	/**
	 * @param request
	 * @param response
	 * @throws ServletException
	 * @throws IOException
	 */
	protected void handleCreateAction(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		RequestDispatcher requestDispatcher = request.getRequestDispatcher("/" + getHomePath() + "/create.jsp");
		requestDispatcher.forward(request, response);
	}

	/**
	 * @param request
	 * @param response
	 * @throws ServletException
	 * @throws IOException
	 */
	@SuppressWarnings("unchecked")
	private void handleManageAction(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		List<PersistableDomain> domainList = (List<PersistableDomain>) getObjectList();
		RequestDispatcher requestDispatcher = request.getRequestDispatcher("/" + getHomePath() + "/manage.jsp");
		request.setAttribute(getObjectListAttributeName(), domainList);
		requestDispatcher.forward(request, response);
	}


}
