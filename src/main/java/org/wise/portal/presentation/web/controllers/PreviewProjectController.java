/**
 * 
 */
package org.wise.portal.presentation.web.controllers;

import java.util.Set;
import java.util.TreeSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.webservice.http.HttpRestTransport;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.springframework.web.servlet.view.RedirectView;
import org.wise.portal.dao.project.ProjectCommunicatorDao;
import org.wise.portal.domain.project.FamilyTag;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectCommunicator;
import org.wise.portal.domain.project.impl.ExternalProjectImpl;
import org.wise.portal.domain.project.impl.PreviewProjectParameters;
import org.wise.portal.presentation.util.Util;
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
	
	private static final String PROJECT_COMMUNICATOR_ID_PARAM = "projectCommunicatorId";

	private static final String PROJECT_ID_PARAM_NAME = "projectId";
	
	private static final String PROJECT_ID_PARAM_NAME_LOWERCASE = "projectid";

	private static final String RUN_ID_PARAM_NAME = "runId";

	private static final String EXTERNAL_ID_PARAM_NAME = "externalId";
	
	private static final String VERSION_ID = "versionId";
	
	private ProjectService projectService;
	
	private RunService runService;

	private ProjectCommunicatorDao<ProjectCommunicator> diyProjectCommunicator;
	
	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		String projectCommunicatorId = request.getParameter(PROJECT_COMMUNICATOR_ID_PARAM);
		if (projectCommunicatorId != null) {
			// we are trying to preview an external project
			String externalIdStr = request.getParameter(EXTERNAL_ID_PARAM_NAME);
			PreviewProjectParameters params = new PreviewProjectParameters();
			ExternalProjectImpl externalProject = new ExternalProjectImpl();
			externalProject.setExternalId(Long.valueOf(externalIdStr));
			externalProject.setProjectCommunicator(diyProjectCommunicator.getById(projectCommunicatorId));
			params.setProject(externalProject);
			return (ModelAndView) projectService.previewProject(params);
		}
		
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
			throw new Exception("Please specify a Project to Preview");
		}
		
		Set<String> tagNames = new TreeSet<String>();
		tagNames.add("library");

		User user = ControllerUtil.getSignedInUser();

		if(project.hasTags(tagNames) || 
				project.getFamilytag().equals(FamilyTag.TELS) || this.projectService.canReadProject(project, user)){
			PreviewProjectParameters params = new PreviewProjectParameters();
			params.setProject(project);
			params.setHttpServletRequest(request);
			params.setPortalUrl(Util.getPortalUrl(request));
			params.setVersionId(request.getParameter(VERSION_ID));
			return (ModelAndView) projectService.previewProject(params);
		} else {
			return new ModelAndView(new RedirectView("/wise/accessdenied.html"));
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

	/**
	 * @param diyProjectCommunicator the diyProjectCommunicator to set
	 */
	public void setDiyProjectCommunicator(
			ProjectCommunicatorDao<ProjectCommunicator> diyProjectCommunicator) {
		this.diyProjectCommunicator = diyProjectCommunicator;
	}

}
