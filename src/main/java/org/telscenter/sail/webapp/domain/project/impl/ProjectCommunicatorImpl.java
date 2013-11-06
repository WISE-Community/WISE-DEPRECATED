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

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

import org.jdom.Document;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.telscenter.sail.webapp.domain.project.ExternalProject;
import org.telscenter.sail.webapp.domain.project.ProjectCommunicator;
import org.telscenter.sail.webapp.domain.workgroup.WISEWorkgroup;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.project.ExternalProjectService;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * @author hirokiterashima
 * @version $Id$
 */
@Entity
@Table(name = ProjectCommunicatorImpl.DATA_STORE_NAME)
@Inheritance(strategy = InheritanceType.JOINED)
public class ProjectCommunicatorImpl implements ProjectCommunicator {

	@Transient
	private static final long serialVersionUID = 1L;

	@Transient
	private static final String COLUMN_NAME_BASE_URL = "baseurl";

	@Transient
	public static final String DATA_STORE_NAME = "projectcommunicators";

	@Transient
	private static final String COLUMN_NAME_LATITUDE = "latitude";

	@Transient
	private static final String COLUMN_NAME_LONGITUDE = "longitude";

	@Transient
	private static final String COLUMN_NAME_ADDRESS = "address";

	@Column(name = ProjectCommunicatorImpl.COLUMN_NAME_BASE_URL)
	protected String baseUrl;
	
	@Column(name = ProjectCommunicatorImpl.COLUMN_NAME_LATITUDE)
	protected String latitude;
	
	@Column(name = ProjectCommunicatorImpl.COLUMN_NAME_LONGITUDE)
	protected String longitude;
	
	@Column(name = ProjectCommunicatorImpl.COLUMN_NAME_ADDRESS)
	protected String address;
	
	@Transient
	private Properties portalProperties;
	
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id = null;

    @Version
    @Column(name = "OPTLOCK")
    private Integer version = null;
	
	public List<ExternalProject> getProjectList() {
		return new ArrayList<ExternalProject>();
	}        
	
	protected Document convertXmlInputStreamToXmlDocument(InputStream inputStream) {
	    SAXBuilder builder = new SAXBuilder();
	    Document doc = null;
	    try {
	        doc = builder.build(inputStream);
	    } catch (JDOMException e) {
	    } catch (IOException e) {
	    } finally {
	        try {
	            inputStream.close();
	        } catch (IOException e) {
	        }
	    }
	    return doc;
	}

	public Object previewProject(ExternalProject externalProject) {
		return null;
	}
	
	/**
     * @return the id
     */
    public Long getId() {
        return id;
    }

    /**
     * @param id
     *            the id to set
     */
    @SuppressWarnings("unused")
    private void setId(Long id) {
        this.id = id;
    }

    /**
     * @return the version
     */
    @SuppressWarnings("unused")
    private Integer getVersion() {
        return version;
    }

    /**
     * @param version
     *            the version to set
     */
    @SuppressWarnings("unused")
    private void setVersion(Integer version) {
        this.version = version;
    }

    /**
     * @see org.telscenter.sail.webapp.domain.project.ProjectCommunicator#getPreviewProjectUrl(org.telscenter.sail.webapp.domain.project.impl.ExternalProjectImpl)
     */
	public String getPreviewProjectUrl(ExternalProjectImpl externalProject) {
		return null;
	}

	/**
	 * @return the latitude
	 */
	public String getLatitude() {
		return latitude;
	}

	/**
	 * @param latitude the latitude to set
	 */
	public void setLatitude(String latitude) {
		this.latitude = latitude;
	}

	/**
	 * @return the longitude
	 */
	public String getLongitude() {
		return longitude;
	}

	/**
	 * @param longitude the longitude to set
	 */
	public void setLongitude(String longitude) {
		this.longitude = longitude;
	}

	/**
	 * @return the address
	 */
	public String getAddress() {
		return address;
	}

	/**
	 * @param address the address to set
	 */
	public void setAddress(String address) {
		this.address = address;
	}

	public String getXMLDocument() {
		return null;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.project.ProjectCommunicator#getLaunchProjectUrl(org.telscenter.sail.webapp.service.project.ExternalProjectService, org.telscenter.sail.webapp.domain.project.ExternalProject, org.telscenter.sail.webapp.domain.workgroup.WISEWorkgroup)
	 */
	public String getLaunchProjectUrl(ExternalProjectService externalProjectService, LaunchProjectParameters launchProjectParameters) {
		// TODO Auto-generated method stub
		return null;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.domain.project.ProjectCommunicator#getLaunchReportUrl(org.telscenter.sail.webapp.domain.project.impl.LaunchReportParameters)
	 */
	public String getLaunchReportUrl(
			LaunchReportParameters launchReportParameters) {
		// TODO Auto-generated method stub
		return null;
	}

	/**
	 * @param portalProperties the portalProperties to set
	 */
	public void setPortalProperties(Properties portalProperties) {
		this.portalProperties = portalProperties;
	}

	public void setProjectService(ProjectService projectService) {
		// TODO Auto-generated method stub
		
	}

	public void setRunService(RunService runService) {
		// TODO Auto-generated method stub
		
	}

}
