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
package org.telscenter.sail.webapp.dao.project;

import java.util.List;
import java.util.Set;

import org.telscenter.sail.webapp.domain.project.FamilyTag;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.ProjectInfo;
import org.telscenter.sail.webapp.domain.project.Tag;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.SimpleDao;
import net.sf.sail.webapp.domain.User;

/**
 * @author Hiroki Terashima
 *
 * @version $Id$
 */
public interface ProjectDao<T extends Project> extends SimpleDao<T> {
	
	
	/**
	 * Create a new Project
	 * @return An empty project
	 */
	public T createEmptyProject();
	
	
    /**
	 * Given an input string retrieve a list of corresponding records from data store.
	 * 
	 * @param family
	 *            <code>FamilyTag</code> representing the familytag of the data in
	 *            the data store.
	 * @return A list of project objects.
	 * @throws ObjectNotFoundException if list is not found.
	 */
	public List<T> retrieveListByTag(FamilyTag familytag) throws ObjectNotFoundException;

    /**
	 * Given an input string retrieve a list of corresponding records from data store.
	 * 
	 * @param family
	 *            <code>String</code> representing the projectinfotag of the data in
	 *            the data store.
	 * @return A list of project objects.
	 * @throws ObjectNotFoundException if list is not found.
	 */
	public List<T> retrieveListByTag(String projectinfotag) throws ObjectNotFoundException;

	
	/**
	 * Given some ProjectInfo retrieve a list of corresponding records from data store.
	 * 
	 * @param family
	 *            <code>ProjectInfo</code> representing the info of the data in
	 *            the data store.
	 * @return A list of project objects.
	 * @throws ObjectNotFoundException if list is not found.
	 */
	public List<T> retrieveListByInfo(ProjectInfo projectinfo) throws ObjectNotFoundException;
	
	/**
	 * Returns a <code>List</code> of <code>Project</code> from the data store that
	 * is associated with the given <code>User</code> user and <code>String</code>
	 * role. For instance role='bookmarker', 'sharedowner' or 'owner'
	 * @param <code>User</code> user
	 * @param <code>String</code> role
	 * @return <code>List<T></code>
	 */
	public List<T> getProjectListByUAR(User user, String role);
	
	/**
	 * Returns a <code>List</code> of <code>Project</code> from the data store that
	 * satisifies the given <code>String</code> query.
	 * 
	 * @param <code>String</code> query
	 * @return <code>List<Project></code>
	 */
	public List<T> getProjectList(String query);
	
	/**
	 * Given a <code>Set<String></code> set of tag names, returns a <code>List<Project></code>
	 * list of projects from the data store that contain all of those tags.
	 * 
	 * @param Set<String> - set of tags
	 * @return List<Project> - list of projects
	 */
	public List<T> getProjectListByTagNames(Set<String> tagNames);
	
	/**
	 * Retrieves and returns a <code>Project</code> from the data store without
	 * populating its metadata. This method should only be called when the use of
	 * the project will not require metadata.
	 * 
	 * @param Long - id
	 * @return Project - project
	 */
	public Project getProjectWithoutMetadata(Long projectId);


	/**
	 * Retrieves and returns a list of projects that are copies of the 
	 * specified project (has projectId as parentfk)
	 * 
	 * @param projectId
	 * @return
	 */
	public List<Project> getProjectCopies(Long projectId);
}
