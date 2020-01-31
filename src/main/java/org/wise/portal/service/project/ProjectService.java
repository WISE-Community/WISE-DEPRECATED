/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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
package org.wise.portal.service.project;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.acls.model.Permission;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.impl.AddSharedTeacherParameters;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.project.impl.PreviewProjectParameters;
import org.wise.portal.domain.project.impl.ProjectParameters;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.presentation.web.exception.TeacherAlreadySharedWithProjectException;
import org.wise.portal.presentation.web.response.SharedOwner;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.Serializable;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * A Service for Projects
 * @author Hiroki Terashima
 */
public interface ProjectService {

  /**
   * Get a <code>List</code> of <code>Project</code> that the specified user owns.
   * @return a <code>List</code> of <code>Project</code>
   */
  @Transactional
  @Secured( { "ROLE_USER", "AFTER_ACL_COLLECTION_READ" })
  List<Project> getProjectList(User user);

  /**
   * Get a <code>List</code> of <code>Project</code> that have been shared with the specified user.
   * @return a <code>List</code> of <code>Project</code>
   */
  @Transactional
  @Secured( { "ROLE_USER", "AFTER_ACL_COLLECTION_READ" })
  List<Project> getSharedProjectList(User user);

  @Transactional
  @Secured( { "ROLE_USER", "AFTER_ACL_COLLECTION_READ" })
  List<Project> getSharedProjectsWithoutRun(User user);

  /**
   * Retrieves a <code>List</code> of <code>Project</code> that  has been bookmarked
   * by the given <code>User</code>.
   * @param bookmarker User who we're looking up
   * @return <code>List<Project></code>
   * @throws ObjectNotFoundException
   */
  @Transactional
  List<Project> getBookmarkerProjectList(User bookmarker) throws ObjectNotFoundException;

  /**
   * Adds the given <code>User</code> bookmarker to the <code>Project</code> project.
   * @param project the project to bookmark
   * @param bookmarker User that wants to bookmark the project
   */
  @Transactional
  void addBookmarkerToProject(Project project, User bookmarker) throws ObjectNotFoundException;

  /**
   * Removes the given <code>User</code> bookmarker from the <code>Project</code> project.
   * @param project <code>Project</code>
   * @param bookmarker <code>User</code>
   */
  @Transactional
  void removeBookmarkerFromProject(Project project, User bookmarker) throws ObjectNotFoundException;

  /**
   * Returns the permission that the specified user has on the specified project.
   * @param project The <code>Project</code> that is shared.
   * @param user The <code>User</code> that shares the <code>Project</code>
   * @return A <code>String</code> containing the permission that the user has on the project.
   * If the user does not have permission on the project, null is returned.
   */
  @Transactional(readOnly = true)
  String getSharedTeacherRole(Project project, User user);

  /**
   * Add shared teacher to a project.
   * @param addSharedTeacherParameters
   */
  @Secured( {"ROLE_TEACHER"} )
  @Transactional()
  void addSharedTeacherToProject(AddSharedTeacherParameters addSharedTeacherParameters)
      throws ObjectNotFoundException;

  @Secured( {"ROLE_TEACHER"} )
  @Transactional()
  void removeSharedTeacherFromProject(Project project, User user) throws ObjectNotFoundException;

  /**
   * Creates a new <code>Project</code>.
   * @param projectParameters <code>ProjectParameters</code> the project parameters object
   * @return the <code>Project</code> that was created
   * @throws ObjectNotFoundException when projectparameters references objects that do not exist
   * in the datastore
   */
  Project createProject(ProjectParameters projectParameters) throws ObjectNotFoundException;

  /**
   * Saves the project
   * @param project <code>Project</code> contains updated Project.
   */
  @Transactional()
  void updateProject(Project project, User user) throws NotAuthorizedException;

  /**
   * Launches the VLE for the specified Workgroup.
   * @param workgroup Workgroup requesting to launch the project
   * @return
   * @throws Exception
   */
  ModelAndView launchProject(Workgroup workgroup, String contextPath) throws Exception;

  String generateStudentStartProjectUrlString(Workgroup workgroup, String contextPath);

  /**
   * Launches a Preview of the Project.
   * @param previewProjectParameters parameters required to preview the project
   * @throws ObjectNotFoundException when the specified projectId does not exist
   * @throws IOException when the url cannot be loaded
   */
  Object previewProject(PreviewProjectParameters previewProjectParameters) throws Exception;

  /**
   * Gets a project with the given projectId.
   * @param projectId the id of the project
   * @return <code>Project</code> with the specified projectId
   * @throws ObjectNotFoundException when the specified projectId does not exist
   */
  Project getById(Serializable projectId) throws ObjectNotFoundException;

  /**
   * Given a <code>Project</code> project and <code>User</code> user, returns
   * <code>boolean</code> true if the user is allowed to create a run from that
   * project (ie, project is TELS, owner, sharedOwner), returns false otherwise.
   * @param project
   * @param user
   * @return boolean
   */
  boolean canCreateRun(Project project, User user);

  /**
   * Given a <code>Project</code> project and <code>User</code> user, returns true if the user is
   * allowed to author that particular project, returns false otherwise.
   * @param project
   * @param user
   * @return boolean
   */
  boolean canAuthorProject(Project project, User user);

  /**
   * Given a <code>Project</code> project and a <code>User</code> user, returns true if the user
   * has read access to that particular project, returns false otherwise.
   * @param project
   * @param user
   * @return
   */
  boolean canReadProject(Project project, User user);

  /**
   * Returns a <code>List<Project></code> list of all projects in the data store.
   * @return List<Project> projects
   */
  List<Project> getAdminProjectList();

  /**
   * Returns a <code>List<Project></code> list of library projects
   * Library projects show up in "Browse Library" page but not on the homepage.
   * Library projects show up in both "Browse Library" page and in the homepage.
   * @return List<Project> - list of library projects
   */
  List<Project> getPublicLibraryProjectList();

  List<Project> getTeacherSharedProjectList();

  /**
   * Returns a <code>List<Project></code> list of library projects.
   * Library projects show up in "Browse Library" page but not on the homepage.
   * Library projects show up in both "Browse Library" page and in the homepage.
   * @return List<Project> - list of library projects
   */
  List<Project> getLibraryProjectList();

  /**
   * Given a <code>Set<String></code> set of tag names, returns a
   * <code>List<Project></code> list of projects with all of the tag names.
   * @param tagNames Set<String> - set of tagNames
   * @return List<Project> - list of projects
   */
  List<Project> getProjectListByTagNames(Set<String> tagNames);

  /**
   * Given a partial author name (e.g. "hiro", "hiroki"), returns a list of projects
   * that were authored by that person.
   * @param authorName<String> partial or full author name
   * @return List<Project> - list of projects
   */
  List<Project> getProjectListByAuthorName(String authorName);

  /**
   * Given a partial title (e.g. "Global", "Global Climate"), returns a list of projects
   * that match that title.
   * @param title <String> partial or full project title
   * @return List<Project> - list of projects
   */
  List<Project> getProjectListByTitle(String title);

  /**
   * Given a <code>String</code> and a <code>Project</code> adds the tag to the project.
   * @param tag
   * @param projectId
   */
  @Transactional
  Integer addTagToProject(String tag, Long projectId);

  /**
   * Given a <code>Tag</code> and a <code>Project</code>, removes the tag from the project.
   * @param tagId - Integer id of tag
   * @param projectId - id of project
   */
  @Transactional
  void removeTagFromProject(Integer tagId, Long projectId);

  /**
   * Given a <code>Long</code> tag id, a project id and a name, updates that
   * project tag to that name, returning the resulting tag Id.
   * @param tagId - Integer id of tag
   * @param projectId id of project
   * @param name name of tag
   * @return Integer - tag id
   */
  Integer updateTag(Integer tagId, Long projectId, String name);

  /**
   * Given a Project and a <code>String</code> tag name, returns <code>boolean</code> true
   * if the project contains a tag with that name, false otherwise.
   * @param project
   * @param name name of tag
   * @return boolean
   */
  boolean projectContainsTag(Project project, String name);

  /**
   * Given a <code>User</code> user and a <code>String</code> tag name, returns true if that user
   * is authorized to create a tag with that name, returns false otherwise.
   * @param user
   * @param name
   * @return boolean
   */
  boolean isAuthorizedToCreateTag(User user, String name);

  /**
   * Given a project id, returns projects that are copies of the project.
   * @param projectId
   * @return
   */
  List<Project> getProjectCopies(Long projectId);

  /**
   * Given a project, gets the project id for the project's root level project.
   * @param project
   * @return id of the root project
   * @throws ObjectNotFoundException
   */
  Long identifyRootProjectId(Project project) throws ObjectNotFoundException;

  long getNextAvailableProjectId();

  Project copyProject(Long projectId, User user) throws Exception;

  void saveProjectContentToDisk(String projectJSONString, Project project)
      throws FileNotFoundException, IOException;

  List<Permission> getSharedTeacherPermissions(Project project, User sharedTeacher);

  SharedOwner addSharedTeacher(Long projectId, String username)
      throws ObjectNotFoundException, TeacherAlreadySharedWithProjectException;

  void removeSharedTeacher(Long projectId, String username) throws ObjectNotFoundException;

  void addSharedTeacherPermission(Long projectId, Long userId, Integer permissionId)
      throws ObjectNotFoundException;

  void removeSharedTeacherPermission(Long projectId, Long userId, Integer permissionId)
      throws ObjectNotFoundException;

  void transferProjectOwnership(Project project, User newOwner) throws ObjectNotFoundException;

  List<Project> getProjectsWithoutRuns(User user);

  List<Project> getAllSharedProjects();

  Map<String, Object> getDirectoryInfo(File directory);

  String getProjectURI(Project project);

  String getProjectPath(Project project);

  String getLicensePath(Project project);

  List<HashMap<String, Object>> getProjectSharedOwnersList(Project project);

  void writeProjectLicenseFile(Project project) throws JSONException;

  void replaceMetadataInProjectJSONFile(String projectFilePath, ProjectMetadata metadata)
      throws IOException, JSONException;

  public void saveProjectToDatabase(Project project, User user, String projectJSONString)
      throws JSONException, NotAuthorizedException;

  public void updateMetadataAndLicenseIfNecessary(Project project, String projectJSONString)
      throws JSONException;

  public void updateProjectNameIfNecessary(Project project, JSONObject projectMetadataJSON)
      throws JSONException;
}
