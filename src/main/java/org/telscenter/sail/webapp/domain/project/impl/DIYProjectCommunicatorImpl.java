/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.telscenter.sail.webapp.domain.project.impl;

import java.io.DataInputStream;
import java.io.IOException;
import java.io.Serializable;
import java.math.BigInteger;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.servlet.http.HttpServletRequest;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.sds.impl.AbstractHttpRestCommand;
import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.webservice.http.AbstractHttpRequest;
import net.sf.sail.webapp.domain.webservice.http.HttpPostRequest;
import net.sf.sail.webapp.domain.webservice.http.HttpRestTransport;
import net.sf.sail.webapp.domain.webservice.http.impl.HttpRestTransportImpl;
import net.sf.sail.webapp.spring.SpringConfiguration;

import org.apache.commons.httpclient.HttpStatus;
import org.jdom.Document;
import org.jdom.Element;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.project.ExternalProject;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.workgroup.WISEWorkgroup;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.project.ExternalProjectService;
import org.telscenter.sail.webapp.service.project.ProjectService;
import org.telscenter.sail.webapp.service.project.impl.ExternalProjectServiceImpl;
import org.telscenter.sail.webapp.service.project.impl.ProjectServiceImpl;
import org.telscenter.sail.webapp.spring.impl.SpringConfigurationImpl;

/**
 * ProjectCommunicator for External DIY Projects
 * 
 * @author hirokiterashima
 * @version $Id$
 */
@Entity
@Table(name = DIYProjectCommunicatorImpl.DATA_STORE_NAME)
public class DIYProjectCommunicatorImpl extends ProjectCommunicatorImpl {

	@Transient
	private static final long serialVersionUID = 1L;

	@Transient
	public static final String DATA_STORE_NAME = "diyprojectcommunicators";
	
	@Transient
	private static final String COLUMN_NAME_PREVIEW_DIY_PROJECT_SUFFIX = "previewdiyprojectsuffix";

	@Transient
	private static final String COLUMN_NAME_DIY_PORTAL_HOSTNAME = "diyportalhostname";
	
	@Column(name = DIYProjectCommunicatorImpl.COLUMN_NAME_PREVIEW_DIY_PROJECT_SUFFIX)
	private String previewProjectSuffix = "/sail_jnlp/6/1/authoring";
	
	@Column(name = DIYProjectCommunicatorImpl.COLUMN_NAME_DIY_PORTAL_HOSTNAME)
	private String diyportalhostname;
	
	@Transient
	private String launchProjectSuffix = "/sail_jnlp/6";

	@Transient
	private RunService runService;

	@Transient
	private ProjectService projectService = new ProjectServiceImpl();

	@Transient
	private SpringConfiguration springConfiguration = new SpringConfigurationImpl();

	@SuppressWarnings("unchecked")
	@Override
	public List<ExternalProject> getProjectList() {
		String getProjectListUrlStr = baseUrl + "/external_otrunk_activities.xml";
		Document doc = null;
		// retrieve xml and parse
		try {
			URL getProjectListUrl = new URL(getProjectListUrlStr);
			URLConnection getProjectListConnection = getProjectListUrl.openConnection();
			DataInputStream dis;

			dis = new DataInputStream(getProjectListConnection.getInputStream());
			doc = this.convertXmlInputStreamToXmlDocument(dis);
			dis.close();
		} catch (MalformedURLException me) {
			System.out.println("MalformedURLException: " + me);
		} catch (IOException ioe) {
			System.out.println("IOException: " + ioe);
		}

		List<ExternalProject> diyProjects = new ArrayList<ExternalProject>();
		Element diy = doc.getRootElement();
		List<Element> children = diy.getChildren("external-otrunk-activity");
		for (Element child : children) {
			// create a DIY Project, add to the List
			String name = child.getChildText("name");
			ExternalProjectImpl project = new ExternalProjectImpl();
			project.setName(name);
			String externalDIYId = child.getChildText("id");
			project.setExternalId(Long.valueOf(externalDIYId));
			project.setProjectCommunicator(this);
			diyProjects.add(project);
		}

		return diyProjects;
	}
	
	@Override
	public ModelAndView previewProject(ExternalProject externalProject) {
		Serializable id = externalProject.getExternalId();
		String previewProjectUrl = baseUrl + "/external_otrunk_activities/" + id + previewProjectSuffix;
		return new ModelAndView(new RedirectView(previewProjectUrl));
	}

    /**
     * @see org.telscenter.sail.webapp.domain.project.ProjectCommunicator#getPreviewProjectUrl(org.telscenter.sail.webapp.domain.project.impl.ExternalProjectImpl)
     */
	@Override
	public String getPreviewProjectUrl(ExternalProjectImpl externalProject) {
		Serializable id = externalProject.getExternalId();
		String previewProjectUrl = baseUrl + "/external_otrunk_activities/" + id + previewProjectSuffix;
		return previewProjectUrl;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.project.impl.ProjectCommunicatorImpl#getLaunchProjectUrl(org.telscenter.sail.webapp.service.project.ExternalProjectService, org.telscenter.sail.webapp.domain.project.ExternalProject, org.telscenter.sail.webapp.domain.workgroup.WISEWorkgroup)
	 */
	@Override
	public String getLaunchProjectUrl(ExternalProjectService externalProjectService,
			LaunchProjectParameters launchProjectParameters) {
		Run run = launchProjectParameters.getRun();

		ExternalProject externalProject = null;
		try {
			externalProject = (ExternalProject) externalProjectService.getById(run.getProject().getId());
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
		Serializable id = externalProject.getExternalId();
		
		WISEWorkgroup workgroup = launchProjectParameters.getWorkgroup();
		if (workgroup.getExternalId() == null) {
			Long createUserIDInDIY = createUserInDIY(workgroup);  // creates and sets this workgroup's user id.
	        workgroup.setExternalId(createUserIDInDIY);
	        ((ExternalProjectServiceImpl) externalProjectService).getWorkgroupDao().save(workgroup);
		}
		Long externalDIYUserId = workgroup.getExternalId();

		Set<Workgroup> workgroups = null;
		try {
			workgroups = runService.getWorkgroups(new Long(run.getId()));
		} catch (ObjectNotFoundException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		
		String workgroupIds = generateWorkgroupIdListString(workgroups);
		
		HttpServletRequest request = launchProjectParameters.getHttpServletRequest();
		
		Group period = workgroup.getPeriod();
		String uniqueIdMD5 = generateUniqueIdMD5(run, request, period.getId().toString());
		
		
		String launchProjectUrl = baseUrl + "/external_otrunk_activities/" + id + launchProjectSuffix + "/" + externalDIYUserId;
		launchProjectUrl += "?group_list=" + workgroupIds;
		launchProjectUrl += "&group_id=" + uniqueIdMD5;
		return launchProjectUrl;
	}

	private String generateUniqueIdMD5(Run run, HttpServletRequest request, String groupIdString) {
		String portalUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
		String uniqueportalUrl = portalUrl + "run:" + run.getId().toString() + "group:" + groupIdString;
	    MessageDigest m = null;
		try {
			m = MessageDigest.getInstance("MD5");
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
	    m.update(uniqueportalUrl.getBytes(),0,uniqueportalUrl.length());
	    String uniqueIdMD5 = new BigInteger(1,m.digest()).toString(16);
		return uniqueIdMD5;
	}

	/**
	 * @param workgroups
	 * @return
	 */
	private String generateWorkgroupIdListString(Set<Workgroup> workgroups) {
		String workgroupIds = "";
		for (Workgroup workgroup2 : workgroups) {
			if (!((WISEWorkgroup) workgroup2).isTeacherWorkgroup()) {
				workgroupIds += ((WISEWorkgroup) workgroup2).getExternalId() + ",";
			}
		}
		
		// strip out last comma
		if (workgroupIds.length() > 0) {
			workgroupIds = workgroupIds.substring(0, workgroupIds.length() - 1);
		}
		return workgroupIds;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.domain.project.impl.ProjectCommunicatorImpl#getLaunchReportUrl(org.telscenter.sail.webapp.domain.project.impl.LaunchReportParameters)
	 */
	@Override
	public String getLaunchReportUrl(
			LaunchReportParameters launchReportParameters) {
		Run run = launchReportParameters.getRun();
		Serializable projectId = run.getProject().getId();
		Project retrievedProject = null;
		try {
			retrievedProject = projectService.getById(projectId);
		} catch (ObjectNotFoundException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		ExternalProject project = (ExternalProject) retrievedProject;
		Serializable externalId = project.getExternalId();
		Set<Workgroup> workgroups = launchReportParameters.getWorkgroups();
		String workgroupIds = generateWorkgroupIdListString(workgroups);
		
		Set<Group> periods = run.getPeriods();
		String periodName = "replacemeperiodname";
		for (Group period : periods) {
			periodName = period.getName();
		}
		
		Set<User> owners = run.getOwners();
		String teacherName = "replacemeteachername";
		teacherName = owners.iterator().next().getUserDetails().getUsername();
		
		String runName = run.getName();
		
		HttpServletRequest request = launchReportParameters.getHttpServletRequest();
		String groupIdString = request.getParameter("groupId");
		String uniqueIdMD5 = generateUniqueIdMD5(run, request, groupIdString);

		
		// [diy root]/external_otrunk_activities/[activity_id]/run_report?type=[report type uri]
		//	?users=91%2C92%2C95%2C96      // comma-separated list of external workgroupIds
		//	&system.report.class.name=LOOPS+Test+Class+200902    // period name
		//	&system.report.teacher.name=Loops+Teacher            // teacher name
		//	&system.report.activity.name=Pick+N+Test             // run name
		String launchReportUrl = baseUrl + "/external_otrunk_activities/" + externalId + "/run_report?type=http://code.google.com/p/sailportal/diy_report_types/run_management_report";
		launchReportUrl += "&users=" + workgroupIds;
		launchReportUrl += "&group_list=" + workgroupIds;
		launchReportUrl += "&group_id=" + uniqueIdMD5;
		launchReportUrl += "&system.report.class.name=" + periodName;
		launchReportUrl += "&system.report.teacher.name=" + teacherName;
		launchReportUrl += "&system.report.activity.name=" + runName;
		
		return launchReportUrl;
	}
	
	class DIYCreateUserRestCommand extends AbstractHttpRestCommand {
		WISEWorkgroup workgroup;
		
		/**
		 * @param workgroup the workgroup to set
		 */
		public void setWorkgroup(WISEWorkgroup workgroup) {
			this.workgroup = workgroup;
		}

		public Long run() {
			String diyportalhostname2 = getDiyportalhostname();
	        final String bodyData = "<user><disable-javascript type=\"boolean\" nil=\"true\"/>" 
	        	+ "<email>" + workgroup.getId() + "@" + diyportalhostname2 + "</email>"
	        	+ "<first-name>members:</first-name>"
	        	+ "<last-name>"+ workgroup.generateWorkgroupName() +"</last-name>"
	        	+ "<login>" + workgroup.getId() + "@" + diyportalhostname2 + "</login>"
	        	+ "<password>" + workgroup.getId() + "@" + diyportalhostname2 + "</password>"
	        	+ "<password-confirmation>" + workgroup.getId() + "@" + diyportalhostname2 + "</password-confirmation>"	        	
	        	+ "<vendor-interface-id type=\"integer\">" + 6 + "</vendor-interface-id></user>";
	        	
	        final String url = "/users.xml";
	        
	        HttpPostRequest httpPostRequestData = new HttpPostRequest(REQUEST_HEADERS_CONTENT, EMPTY_STRING_MAP,
	        bodyData, url, HttpStatus.SC_CREATED);
			
			
			Map<String, String> responseHeaders = this.transport.post(httpPostRequestData);
	        final String locationHeader = responseHeaders.get("Location");
	        Long diyUserId = new Long(locationHeader
	        		.substring(locationHeader.lastIndexOf("/") + 1));
	        
	        return diyUserId;
		}

	}
	
	/**
	 * Creates a user in the external DIY for this given workgroup and
	 * sets its externalId.  If the workgroup already has an externalId, do nothing.
	 * 
	 * @param workgroup
	 * @return generated userId in DIY
	 */
	private Long createUserInDIY(WISEWorkgroup workgroup) {
		
		DIYCreateUserRestCommand restCommand = new DIYCreateUserRestCommand();
		HttpRestTransportImpl restTransport = new HttpRestTransportImpl();
		restTransport.setBaseUrl(this.baseUrl);
		
		restCommand.setTransport(restTransport);
		restCommand.setWorkgroup(workgroup);
		return restCommand.run();
	}

	/**
	 * @param previewProjectSuffix the previewProjectSuffix to set
	 */
	public void setPreviewProjectSuffix(String previewProjectSuffix) {
		this.previewProjectSuffix = previewProjectSuffix;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.domain.project.impl.ProjectCommunicatorImpl#getXMLDocument()
	 */
	@Override
	public String getXMLDocument() {
		String xmlDoc = "<projectcommunicator>";
		xmlDoc += "<id>" + this.getId() + "</id>";
		xmlDoc += "<type>diy</type>";
		xmlDoc += "<baseurl>" + this.baseUrl + "</baseurl>";
		xmlDoc += "<address>" + this.address + "</address>";		
		xmlDoc += "<longitude>" + this.longitude + "</longitude>";
		xmlDoc += "<latitude>" + this.latitude + "</latitude>";
		xmlDoc += "</projectcommunicator>";
		return xmlDoc;
	}

	/**
	 * @param launchProjectSuffix the launchProjectSuffix to set
	 */
	public void setLaunchProjectSuffix(String launchProjectSuffix) {
		this.launchProjectSuffix = launchProjectSuffix;
	}

	/**
	 * @return the diyportalhostname
	 */
	public String getDiyportalhostname() {
		return diyportalhostname;
	}

	/**
	 * @param diyportalhostname the diyportalhostname to set
	 */
	public void setDiyportalhostname(String diyportalhostname) {
		this.diyportalhostname = diyportalhostname;
	}
	
	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}

	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}
}
