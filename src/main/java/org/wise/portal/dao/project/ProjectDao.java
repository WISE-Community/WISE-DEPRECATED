/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.dao.project;

import java.util.List;
import java.util.Set;

import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.SimpleDao;
import org.wise.portal.domain.project.FamilyTag;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectInfo;
import org.wise.portal.domain.user.User;

/**
 * @author Hiroki Terashima
 */
public interface ProjectDao<T extends Project> extends SimpleDao<T> {

  /**
   * Create a new Project
   * @return An empty project
   */
  T createEmptyProject();

  /**
   * Returns a <code>List</code> of <code>Project</code> from the data store that
   * is associated with the given <code>User</code> user and <code>String</code>
   * role. For instance role='bookmarker', 'sharedowner' or 'owner'
   * @param <code>User</code> user
   * @param <code>String</code> role
   * @return <code>List<T></code>
   */
  List<T> getProjectListByUAR(User user, String role);

  List<T> getSharedProjectsWithoutRun(User user);

  /**
   * Returns a list of Projects that is owned by the specified user
   * @param owner <code>User</code>
   * @return List<Project> - list of projects owned by the specified user
   */
  List<Project> getProjectListByOwner(User owner);

  /**
   * Given a <code>Set<String></code> set of tag names, returns a <code>List<Project></code>
   * list of projects from the data store that contain all of those tags.
   *
   * @param Set<String> - set of tags
   * @return List<Project> - list of projects
   */
  List<T> getProjectListByTagNames(Set<String> tagNames);

  /**
   * Given a partial author name (e.g. "hiro", "hiroki"), returns a list of projects
   * that were authored by that person
   * @param authorName<String> partial or full author name
   * @return List<Project> - list of projects
   */
  List<Project> getProjectListByAuthorName(String authorName);

  /**
   * Given a partial title (e.g. "Global", "Global Climate"), returns a list of projects
   * that match that title
   * @param projectLookupValue <String> partial or full project title
   * @return List<Project> - list of projects
   */
  List<Project> getProjectListByTitle(String title);

  /**
   * Retrieves and returns a list of projects that are copies of the
   * specified project (has projectId as parentfk)
   *
   * @param projectId
   * @return
   */
  List<Project> getProjectCopies(Long projectId);

  List<Project> getProjectsWithoutRuns(User user);

  List<Project> getAllSharedProjects();

  long getMaxProjectId();
}
