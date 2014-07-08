/**
 * 
 */
package org.wise.portal.presentation.web.controllers;

import java.util.Set;
import java.util.TreeSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
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
@Controller
@RequestMapping("/previewproject.html")
public class PreviewProjectController {
	
	private static final String PROJECT_ID_PARAM_NAME = "projectId";
	
	private static final String PROJECT_ID_PARAM_NAME_LOWERCASE = "projectid";

	private static final String RUN_ID_PARAM_NAME = "runId";
	
	private static final String VERSION_ID = "versionId";

	private static final String STEP = "step";
	
	private static final String IS_CONSTRAINTS_DISABLED = "isConstraintsDisabled";

	@Autowired
	private ProjectService projectService;
	
	@Autowired
	private RunService runService;

	@RequestMapping(method=RequestMethod.GET)
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		String projectIdStr = request.getParameter(PROJECT_ID_PARAM_NAME);
		if (projectIdStr == null) {
			projectIdStr = request.getParameter(PROJECT_ID_PARAM_NAME_LOWERCASE);
		}
		String runIdStr = request.getParameter(RUN_ID_PARAM_NAME);
		Project project = null;
		if (projectIdStr != null) {
			// check to make sure project ID is valid long
			try {
				Long.valueOf(projectIdStr);
			} catch (NumberFormatException nfe) {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Could not determine project to preview.");
				return null;
			}
			project = projectService.getById(projectIdStr);
		} else if (runIdStr != null) {
			// check to make sure run ID is valid long
			try {
				Long.valueOf(runIdStr);
			} catch (NumberFormatException nfe) {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Could not determine project to preview.");
				return null;
			}
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
}
