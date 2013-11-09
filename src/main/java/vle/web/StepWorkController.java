/**
 * 
 */
package vle.web;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import vle.domain.user.UserInfo;
import vle.domain.work.StepWork;

/**
 * @author hirokiterashima
 */
public class StepWorkController extends DomainController {

	private static final long serialVersionUID = 1L;
	
	protected String homePath = "stepwork";
	
	protected String attributeName = "stepwork";
	
	protected String listAttributeName = "stepworks";
	
	protected static Class<StepWork> getObjectClass() {
		return StepWork.class;
	}
	
	protected String getHomePath() {
		return homePath;
	}
	
	@Override
	protected String getObjectAttributeName() {
		return attributeName;
	}

	@Override
	protected String getObjectListAttributeName() {
		return listAttributeName;
	}
	
	protected StepWork getObjectById(Long id) {
		return (StepWork) StepWork.getById(id, StepWork.class);
	}
	
	@SuppressWarnings("unchecked")
	protected List<StepWork> getObjectList() {
		return (List<StepWork>) StepWork.getList(StepWork.class);
	}

	protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response) throws ServletException, IOException {
		String action = request.getParameter("action");
		if (action == null || action.equals("create")) {
			StepWork env = new StepWork();
			env.saveOrUpdate();
			response.sendRedirect(homePath);
		} else {
			 String id = request.getParameter("id");
			 StepWork env = (StepWork) StepWork.getById(new Long(id), StepWork.class);
			 env.saveOrUpdate();
			response.sendRedirect(homePath);
		}
    }
	
	public static void main(String[] args) {
		if (args[0].equals("deleteAll") && args[1] != null) {
			String userInfoId = args[1];
			UserInfo userInfo = (UserInfo) UserInfo.getById(new Long(userInfoId), UserInfo.class);
			deleteAllWorkForUser(userInfo);
		}
	}

	/**
	 * Deletes all work done by the specified user
	 * @param userInfo
	 */
	private static void deleteAllWorkForUser(UserInfo userInfo) {
		List<StepWork> allWorkByUser = StepWork.getByUserInfo(userInfo);
		for (StepWork workByUser : allWorkByUser) {
			workByUser.delete();
		}
	}
}
