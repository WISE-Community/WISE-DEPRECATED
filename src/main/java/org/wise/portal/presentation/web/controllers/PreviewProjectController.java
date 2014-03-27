/**
 * 
 */
package org.wise.portal.presentation.web.controllers;

import java.util.Set;
import java.util.TreeSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.springframework.web.servlet.view.RedirectView;
import org.wise.portal.domain.project.FamilyTag;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.PreviewProjectParameters;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.project.ProjectService;

/**
 * Controller for previewing a specific project
 * Parameters can be projectId, runId, and externalId.
 * 
 * @author Matt Fishbach
 * @author Hiroki Terashima
 * @version $Id:$
 */
public class PreviewProjectController extends AbstractController {
	
	private static final String PROJECT_ID_PARAM_NAME = "projectId";
	
	private static final String PROJECT_ID_PARAM_NAME_LOWERCASE = "projectid";

	private static final String RUN_ID_PARAM_NAME = "runId";
	
	private static final String VERSION_ID = "versionId";

	private static final String STEP = "step";
	
	private static final String IS_CONSTRAINTS_DISABLED = "isConstraintsDisabled";

	private ProjectService projectService;
	
	private RunService runService;

	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		String projectIdStr = request.getParameter(PROJECT_ID_PARAM_NAME);
		if (projectIdStr == null) {
			projectIdStr = request.getParameter(PROJECT_ID_PARAM_NAME_LOWERCASE);
		}
		String runIdStr = request.getParameter(RUN_ID_PARAM_NAME);
		Project project = null;
		if (projectIdStr != null) {
			project = projectService.getById(projectIdStr);
		} else if (runIdStr != null) {
			project = runService.retrieveById(Long.valueOf(runIdStr)).getProject();
		} else {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Could not determine project to preview.");
			return null;
		}
		
		Set<String> tagNames = new TreeSet<String>();
		tagNames.add("library");

		User user = ControllerUtil.getSignedInUser();

		if(project.hasTags(tagNames) || 
				project.getFamilytag().equals(FamilyTag.TELS) || this.projectService.canReadProject(project, user)){
			PreviewProjectParameters params = new PreviewProjectParameters();
			params.setUser(user);
			params.setProject(project);
			params.setHttpServletRequest(request);
			params.setVersionId(request.getParameter(VERSION_ID));
			params.setStep(request.getParameter(STEP));

			String isConstraintsDisabledStr = request.getParameter(IS_CONSTRAINTS_DISABLED);
			if (isConstraintsDisabledStr != null) {
				params.setConstraintsDisabled(Boolean.parseBoolean(isConstraintsDisabledStr));
			}
			
			return (ModelAndView) projectService.previewProject(params);
		} else {
			//get the context path e.g. /wise
			String contextPath = request.getContextPath();
			
			return new ModelAndView(new RedirectView(contextPath + "/accessdenied.html"));
		}
    }
	
	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}
	
	public void setRunService(RunService runService) {
		this.runService = runService;
	}

}
