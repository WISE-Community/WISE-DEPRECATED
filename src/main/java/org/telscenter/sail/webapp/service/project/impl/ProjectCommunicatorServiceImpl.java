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
package org.telscenter.sail.webapp.service.project.impl;

import java.io.Serializable;
import java.util.List;

import net.sf.sail.webapp.dao.ObjectNotFoundException;

import org.telscenter.sail.webapp.dao.project.ProjectCommunicatorDao;
import org.telscenter.sail.webapp.domain.project.ProjectCommunicator;
import org.telscenter.sail.webapp.service.project.ProjectCommunicatorService;

/**
 * @author hirokiterashima
 * @version $Id:$
 */
public class ProjectCommunicatorServiceImpl implements
		ProjectCommunicatorService {
	
	private ProjectCommunicatorDao<ProjectCommunicator> projectCommunicatorDao;

	/**
	 * @see org.telscenter.sail.webapp.service.project.ProjectCommunicatorService#getAllProjectCommunicatorList()
	 */
	public List<ProjectCommunicator> getAllProjectCommunicatorList() {
		return projectCommunicatorDao.getList();
	}

	/**
	 * @param projectCommunicatorDao the projectCommunicatorDao to set
	 */
	public void setProjectCommunicatorDao(
			ProjectCommunicatorDao<ProjectCommunicator> projectCommunicatorDao) {
		this.projectCommunicatorDao = projectCommunicatorDao;
	}

	/**
	 * @throws ObjectNotFoundException 
	 * @see org.telscenter.sail.webapp.service.project.ProjectCommunicatorService#getById(java.io.Serializable)
	 */
	public ProjectCommunicator getById(Serializable id) throws ObjectNotFoundException {
		return projectCommunicatorDao.getById(id);
	}

}
