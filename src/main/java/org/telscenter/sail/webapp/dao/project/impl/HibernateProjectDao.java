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
package org.telscenter.sail.webapp.dao.project.impl;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;
import net.sf.sail.webapp.domain.User;

import org.telscenter.sail.webapp.dao.project.ProjectDao;
import org.telscenter.sail.webapp.domain.project.FamilyTag;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.ProjectInfo;
import org.telscenter.sail.webapp.domain.project.Tag;
import org.telscenter.sail.webapp.domain.project.impl.ProjectImpl;

import edu.emory.mathcs.backport.java.util.Collections;

/**
 * @author Hiroki Terashima
 *
 * @version $Id$
 */
public class HibernateProjectDao extends AbstractHibernateDao<Project> implements
		ProjectDao<Project> {
	
    	private static final String FIND_ALL_QUERY = "from ProjectImpl";

	/**
	 * @see org.telscenter.sail.webapp.dao.offering.RunDao#retrieveByRunCode(String)
	 */
	@SuppressWarnings("unchecked")
	public List<Project> retrieveListByTag(FamilyTag familytag) throws ObjectNotFoundException {
		List<Project> projects = this
						.getHibernateTemplate()
						.findByNamedParam(
								"from ProjectImpl as project where project.familytag = :familytag",
								"familytag", familytag);
		if (projects == null)
			throw new ObjectNotFoundException(familytag, this
					.getDataObjectClass());
		return projects;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.dao.offering.RunDao#retrieveByRunCode(String)
	 */
	@SuppressWarnings("unchecked")
	public List<Project> retrieveListByTag(String projectinfotag) throws ObjectNotFoundException {
		List<Project> projects = this
		.getHibernateTemplate()
		.findByNamedParam(
				"from ProjectImpl as project where upper(project.projectinfotag) = :projectinfotag",
				"projectinfotag", projectinfotag.toString().toUpperCase());
		if (projects == null)
			throw new ObjectNotFoundException(projectinfotag, this
					.getDataObjectClass());
		return projects;
	}
	
	/**
	 * @see net.sf.sail.webapp.dao.impl.AbstractHibernateDao#getFindAllQuery()
	 */
	@Override
	protected String getFindAllQuery() {
		return FIND_ALL_QUERY;
	}
	
	/**
	 * @see net.sf.sail.webapp.dao.impl.AbstractHibernateDao#getDataObjectClass()
	 */
	@Override
	protected Class<? extends ProjectImpl> getDataObjectClass() {
		return ProjectImpl.class;
	}

	public Project createEmptyProject() {
		return new ProjectImpl();
	}

	public List<Project> retrieveListByInfo(ProjectInfo projectinfo)
		throws ObjectNotFoundException {
	    
	    return this.retrieveListByTag(projectinfo.getFamilyTag());
	}
	
	/**
	 * @see org.telscenter.sail.webapp.dao.project.ProjectDao#getProjectListByUAR(net.sf.sail.webapp.domain.User, java.lang.String)
	 */
	public List<Project> getProjectListByUAR(User user, String role){
		String q = "select project from ProjectImpl project inner join project." +
			role + "s " + role + " where " + role + ".id='" + user.getId() + "'";
		return this.getHibernateTemplate().find(q);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.dao.project.ProjectDao#getProjectList(java.lang.String)
	 */
	public List<Project> getProjectList(String query){
		return this.getHibernateTemplate().find(query);
	}

	/**
	 * @see net.sf.sail.webapp.dao.SimpleDao#getList()
	 */
	@SuppressWarnings("unchecked")
	@Override
	public List<Project> getList() {
		return this.getHibernateTemplate().find(this.getFindAllQuery());
	}
	
	/**
	 * @see net.sf.sail.webapp.dao.SimpleDao#getById(java.lang.Integer)
	 */
	@SuppressWarnings("unchecked")
	@Override
	public Project getById(Serializable id) throws ObjectNotFoundException {
		Project object = null;
		try {
			object = (Project) this.getHibernateTemplate().get(
					this.getDataObjectClass(),  Long.valueOf(id.toString()));
		} catch (NumberFormatException e) {
			return null;
		}
		if (object == null)
			throw new ObjectNotFoundException((Long) id, this.getDataObjectClass());
		
		return object;
		//return this.metadataDao.addMetadataToProject(object);
	}

	/**
	 * @see org.telscenter.sail.webapp.dao.project.ProjectDao#getProjectListByTags(java.util.Set)
	 */
	@SuppressWarnings("unchecked")
	public List<Project> getProjectListByTagNames(Set<String> tagNames) {
		String tagString = "";
		int counter = 0;
		for(String name : tagNames){
			tagString += "'" + name + "',";
			counter ++;
		}
		tagString = tagString.substring(0, tagString.length() - 1);
		
		String q = "select distinct project from ProjectImpl project inner join project.tags tag with tag.name in (" + tagString + ") ";			
		
		List<Project> projects = this.getHibernateTemplate().find(q);
		List<Project> result = new ArrayList<Project>();
		for (Project project : projects) {
			int numMatches = 0;
			for (Tag projectTag : project.getTags()) {
				if (tagNames.contains(projectTag.getName())) {
					numMatches++;
				}
			}
			if (numMatches == tagNames.size()) {
				result.add(project);
			}
		}
		return result;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.dao.project.ProjectDao#getProjectWithoutMetadata(java.lang.Long)
	 */
	public Project getProjectWithoutMetadata(Long projectId){
		try {
			return (Project) this.getHibernateTemplate().get(this.getDataObjectClass(),  projectId);
		} catch (NumberFormatException e) {
			return null;
		}
	}

	/**
	 * @see org.telscenter.sail.webapp.dao.project.ProjectDao#getProjectCopies(java.lang.Long)
	 */
	public List<Project> getProjectCopies(Long projectId) {
		List<Project> projects = this
		.getHibernateTemplate()
		.findByNamedParam(
				"from ProjectImpl as project where project.parentProjectId = :parentProjectId",
				"parentProjectId", projectId);
		return projects;
	}
}
