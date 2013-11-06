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
package org.telscenter.sail.webapp.domain.project;

import java.util.List;

import org.telscenter.sail.webapp.domain.project.impl.ExternalProjectImpl;
import org.telscenter.sail.webapp.domain.project.impl.LaunchProjectParameters;
import org.telscenter.sail.webapp.domain.project.impl.LaunchReportParameters;
import org.telscenter.sail.webapp.domain.workgroup.WISEWorkgroup;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.project.ExternalProjectService;
import org.telscenter.sail.webapp.service.project.ProjectService;
import org.telscenter.sail.webapp.service.project.impl.ExternalProjectServiceImpl;

import net.sf.sail.webapp.domain.Persistable;

/**
 * Object to communicate to external portals
 * 
 * @author hirokiterashima
 * @version $Id$
 */
public interface ProjectCommunicator  extends Persistable {

	public List<ExternalProject> getProjectList();
	
	/**
	 * Returns the address of this project communicator. 
	 * e.g. "Berkeley, CA", "Concord, Massachusetts", "123 Main St, Texas, USA"
	 * @return
	 */
	public String getAddress();
	
	/**
	 * Returns the Longitude coordinates of this project communicator
	 * @return
	 */
	public String getLongitude();

	/**
	 * Returns the Latitude coordinates of this project communicator
	 * @return
	 */
	public String getLatitude();

	@Deprecated
	public Object previewProject(ExternalProject externalProject);

	public String getPreviewProjectUrl(ExternalProjectImpl externalProject);

	/**
	 * @param externalProjectService
	 * @param externalProject
	 * @param workgroup
	 * @return
	 */
	public String getLaunchProjectUrl(ExternalProjectService externalProjectService, LaunchProjectParameters launchProjectParameters);

	/**
	 * Returns url where the report can be viewed
	 */
	public String getLaunchReportUrl(LaunchReportParameters launchReportParameters);
	
	public void setProjectService(ProjectService projectService);

	public void setRunService(RunService runService);

	/**
	 * Returns an xmlDocument representation containing information about
	 * this projectcommunicator.
	 * @return
	 */
	public String getXMLDocument();
}
