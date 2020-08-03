/**
 * Copyright (c) 2008-2019 Regents of the University of California (Regents).
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
package org.wise.portal.service.project.impl;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.Serializable;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.TreeSet;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.text.WordUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.security.acls.model.AlreadyExistsException;
import org.springframework.security.acls.model.NotFoundException;
import org.springframework.security.acls.model.Permission;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.project.ProjectDao;
import org.wise.portal.dao.run.RunDao;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.impl.AddSharedTeacherParameters;
import org.wise.portal.domain.project.FamilyTag;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.Tag;
import org.wise.portal.domain.project.impl.PreviewProjectParameters;
import org.wise.portal.domain.project.impl.ProjectMetadataImpl;
import org.wise.portal.domain.project.impl.ProjectParameters;
import org.wise.portal.domain.project.impl.ProjectPermission;
import org.wise.portal.domain.project.impl.ProjectType;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.presentation.web.exception.TeacherAlreadySharedWithProjectException;
import org.wise.portal.presentation.web.response.SharedOwner;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.tag.TagService;
import org.wise.portal.service.user.UserService;
import org.wise.vle.utils.FileManager;

/**
 * @author Patrick Lawler
 * @author Hiroki Terashima
 */
@Service
public class ProjectServiceImpl implements ProjectService {

  @Autowired
  private Properties appProperties;

  @Autowired
  private ProjectDao<Project> projectDao;

  @Autowired
  private RunDao<Run> runDao;

  @Autowired
  private AclService<Project> aclService;

  @Autowired
  private UserService userService;

  @Autowired
  private TagService tagService;

  @Autowired
  private RunService runService;

  private static final String LICENSE_PATH = "/license.txt";

  public void addBookmarkerToProject(Project project, User bookmarker) {
    project.getBookmarkers().add(bookmarker);
    projectDao.save(project);
  }

  public void addSharedTeacherToProject(AddSharedTeacherParameters addSharedTeacherParameters) {
    Project project = addSharedTeacherParameters.getProject();
    String sharedOwnerUsername = addSharedTeacherParameters.getSharedOwnerUsername();
    User user = userService.retrieveUserByUsername(sharedOwnerUsername);
    project.getSharedowners().add(user);
    projectDao.save(project);

    String permission = addSharedTeacherParameters.getPermission();
    if (permission.equals(UserDetailsService.PROJECT_WRITE_ROLE)) {
      aclService.removePermission(project, BasePermission.ADMINISTRATION, user);
      aclService.removePermission(project, BasePermission.READ, user);
      aclService.addPermission(project, BasePermission.WRITE, user);
    } else if (permission.equals(UserDetailsService.PROJECT_READ_ROLE)) {
      aclService.removePermission(project, BasePermission.ADMINISTRATION, user);
      aclService.removePermission(project, BasePermission.WRITE, user);
      aclService.addPermission(project, BasePermission.READ, user);
    } else if (permission.equals(UserDetailsService.PROJECT_SHARE_ROLE)) {
      aclService.removePermission(project, BasePermission.READ, user);
      aclService.removePermission(project, BasePermission.WRITE, user);
      aclService.addPermission(project, BasePermission.ADMINISTRATION, user);
    }
  }

  public SharedOwner addSharedTeacher(Long projectId, String username)
      throws ObjectNotFoundException, TeacherAlreadySharedWithProjectException {
    Project project = getById(projectId);
    User user = userService.retrieveUserByUsername(username);
    if (!project.isSharedTeacher(user)) {
      project.getSharedowners().add(user);
      projectDao.save(project);
      aclService.addPermission(project, ProjectPermission.VIEW_PROJECT, user);
      List<Integer> newPermissions = new ArrayList<>();
      newPermissions.add(ProjectPermission.VIEW_PROJECT.getMask());
      return new SharedOwner(user.getId(), user.getUserDetails().getUsername(),
          user.getUserDetails().getFirstname(), user.getUserDetails().getLastname(),
          newPermissions);
    } else {
      throw new TeacherAlreadySharedWithProjectException(
          user.getUserDetails().getUsername() + " is already shared with this project");
    }
  }

  public void removeSharedTeacherFromProject(Project project, User user) {
    removeSharedTeacherAndPermissions(project, user);
    projectDao.save(project);
  }

  private void removeSharedTeacherAndPermissions(Project project, User user) {
    removeSharedTeacher(project, user);
    removePermissions(project, user);
  }

  private void removeSharedTeacher(Project project, User user) {
    project.getSharedowners().remove(user);
  }

  private void removePermissions(Project project, User user) {
    List<Permission> permissions = aclService.getPermissions(project, user.getUserDetails());
    for (Permission permission : permissions) {
      aclService.removePermission(project, permission, user);
    }
  }

  @Transactional(rollbackFor = { AlreadyExistsException.class, NotFoundException.class,
      DataIntegrityViolationException.class })
  public Project createProject(ProjectParameters projectParameters) throws ObjectNotFoundException {
    Project project = projectDao.createEmptyProject();
    User owner = projectParameters.getOwner();
    project.setId(projectParameters.getProjectId());
    project.setModulePath(projectParameters.getModulePath());
    project.setName(projectParameters.getProjectname());
    project.setOwner(owner);
    project.setProjectType(projectParameters.getProjectType());
    project.setWISEVersion(projectParameters.getWiseVersion());
    ProjectMetadata metadata = projectParameters.getMetadata();
    String originalAuthorsString = metadata.getAuthors();
    Long parentProjectId = projectParameters.getParentProjectId();
    Boolean isImport = projectParameters.getIsImport();
    try {
      project = setupNewProject(project, metadata, parentProjectId, owner);
      if (isImport != null && isImport) {
        project = setupImportedProject(project, originalAuthorsString);
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return project;
  }

  private Project setupNewProject(Project project, ProjectMetadata metadata, Long parentProjectId,
      User owner) throws ObjectNotFoundException, JSONException {
    JSONArray authors = new JSONArray();
    if (parentProjectId != null) {
      Project parentProject = getById(parentProjectId);
      project.setMaxTotalAssetsSize(parentProject.getMaxTotalAssetsSize());
      ProjectMetadata parentProjectMetadata = parentProject.getMetadata();
      if (parentProjectMetadata != null) {
        try {
          JSONObject parentProjectJSON = getParentInfo(parentProjectMetadata, parentProjectId,
              getProjectURI(parentProject));
          metadata.setParentProjects(
              addToParentProjects(parentProjectJSON, parentProjectMetadata).toString());
        } catch (JSONException e) {
          e.printStackTrace();
        }
      }
      project.setParentProjectId(parentProjectId);
    } else {
      JSONObject authorJSON = new JSONObject();
      authorJSON.put("firstName", owner.getUserDetails().getFirstname());
      authorJSON.put("lastName", owner.getUserDetails().getLastname());
      authorJSON.put("id", owner.getUserDetails().getId());
      authorJSON.put("username", owner.getUserDetails().getUsername());
      authors.put(authorJSON);
    }
    metadata.setAuthors(authors.toString());
    project.setMetadata(metadata);
    // TODO -- setFamilyTag and isCurrent being set here may need to be removed
    project.setFamilytag(FamilyTag.TELS);
    project.setCurrent(true);
    project.setDateCreated(new Date());
    projectDao.save(project);
    aclService.addPermission(project, BasePermission.ADMINISTRATION);
    return project;
  }

  private Project setupImportedProject(Project project, String originalAuthorsString)
      throws JSONException {
    ProjectMetadata metadata = project.getMetadata();
    JSONObject parentProjectJSON = getParentInfo(metadata, null, metadata.getUri());
    JSONArray parentAuthors = new JSONArray();
    if (originalAuthorsString != null) {
      parentAuthors = new JSONArray(originalAuthorsString);
    }
    parentProjectJSON.put("authors", parentAuthors);
    metadata.setParentProjects(addToParentProjects(parentProjectJSON, metadata).toString());
    metadata.setUri(getProjectURI(project));
    metadata.setAuthors(new JSONArray().toString());
    project.setMetadata(metadata);
    projectDao.save(project);
    return project;
  }

  public List<Project> getBookmarkerProjectList(User bookmarker) {
    return projectDao.getProjectListByUAR(bookmarker, "bookmarkers");
  }

  @Transactional(readOnly = true)
  public Project getById(Serializable projectId) throws ObjectNotFoundException {
    Project project = projectDao.getById(projectId);
    project.populateProjectInfo();
    return project;
  }

  @Secured({ "ROLE_USER", "AFTER_ACL_COLLECTION_READ" })
  public List<Project> getProjectList(User user) {
    return projectDao.getProjectListByOwner(user);
  }

  public List<Project> getSharedProjectList(User user) {
    return projectDao.getProjectListByUAR(user, "sharedowners");
  }

  public List<Project> getSharedProjectsWithoutRun(User user) {
    return projectDao.getSharedProjectsWithoutRun(user);
  }

  public String getSharedTeacherRole(Project project, User user) {
    List<Permission> permissions = aclService.getPermissions(project, user.getUserDetails());
    // for projects, a user can have at most one permission per project
    if (!permissions.isEmpty()) {
      if (permissions.contains(BasePermission.ADMINISTRATION)) {
        return UserDetailsService.PROJECT_SHARE_ROLE;
      }
      Permission permission = permissions.get(0);
      if (permission.equals(BasePermission.READ)) {
        return UserDetailsService.PROJECT_READ_ROLE;
      } else if (permission.equals(BasePermission.WRITE)) {
        return UserDetailsService.PROJECT_WRITE_ROLE;
      }
    }
    return null;
  }

  public List<Project> getAdminProjectList() {
    return projectDao.getList();
  }

  public ModelAndView launchProject(Workgroup workgroup, String contextPath) throws Exception {
    return new ModelAndView(
        new RedirectView(generateStudentStartProjectUrlString(workgroup, contextPath)));
  }

  public ModelAndView previewProject(PreviewProjectParameters params) throws Exception {
    Project project = params.getProject();
    if (project.getWiseVersion().equals(4)) {
      return previewProjectWISE4(params, project);
    } else {
      return previewProjectWISE5(params, project);
    }
  }

  private ModelAndView previewProjectWISE4(PreviewProjectParameters params, Project project) {
    String contextPath = params.getHttpServletRequest().getContextPath();
    String wise4URL = contextPath + "/legacy/previewproject.html?projectId=" + project.getId();
    return new ModelAndView(new RedirectView(wise4URL));
  }

  private ModelAndView previewProjectWISE5(PreviewProjectParameters params, Project project) {
    String contextPath = params.getHttpServletRequest().getContextPath();
    String wise5URL = contextPath + "/preview/unit/" + project.getId();
    return new ModelAndView(new RedirectView(wise5URL));
  }

  @Transactional()
  public void removeBookmarkerFromProject(Project project, User bookmarker) {
    project.getBookmarkers().remove(bookmarker);
    projectDao.save(project);
  }

  public void updateProject(Project project, User user) throws NotAuthorizedException {
    List<Run> runList = runService.getProjectRuns((Long) project.getId());
    Run run = null;
    if (!runList.isEmpty()) {
      // since a project can now only be run once, just use the first run in the list
      run = runList.get(0);
    }

    if (canAuthorProject(project, user)
        || (run != null && runService.hasRunPermission(run, user, BasePermission.WRITE))) {
      projectDao.save(project);
    } else {
      throw new NotAuthorizedException("You are not authorized to update this project");
    }
  }

  /**
   * Returns url string for starting the run
   *
   * @param workgroup
   *                    Workgroup requesting to launch the project
   * @return url string that, when accessed, will launch the project
   */
  public String generateStudentStartProjectUrlString(Workgroup workgroup, String contextPath) {
    Run run = workgroup.getRun();
    return contextPath + "/student/unit/" + run.getId();
  }

  public boolean canCreateRun(Project project, User user) {
    Set<String> unallowed_tagnames = new HashSet<String>();
    unallowed_tagnames.add("review");
    return !project.hasTags(unallowed_tagnames) && (FamilyTag.TELS.equals(project.getFamilytag())
        || aclService.hasPermission(project, BasePermission.ADMINISTRATION, user)
        || aclService.hasPermission(project, BasePermission.READ, user));
  }

  public boolean canAuthorProject(Project project, User user) {
    return user.isAdmin() || aclService.hasPermission(project, BasePermission.ADMINISTRATION, user)
        || aclService.hasPermission(project, BasePermission.WRITE, user);
  }

  public boolean canReadProject(Project project, User user) {
    return user.isAdmin() || aclService.hasPermission(project, BasePermission.ADMINISTRATION, user)
        || aclService.hasPermission(project, BasePermission.WRITE, user)
        || aclService.hasPermission(project, BasePermission.READ, user)
        || project.isOfficialProject() || project.isCommunityProject();
  }

  public Integer addTagToProject(String tagString, Long projectId) {
    Tag tag = tagService.createOrGetTag(tagString);
    Project project = null;
    try {
      project = projectDao.getById(projectId);
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }

    if (!tagService.isFromDatabase(tag)) {
      tag = tagService.createOrGetTag(tag.getName());
    }

    project.getTags().add(tag);
    projectDao.save(project);
    return (Integer) tag.getId();
  }

  @Transactional
  public void removeTagFromProject(Integer tagId, Long projectId) {
    Tag tag = tagService.getTagById(tagId);
    Project project = null;
    try {
      project = projectDao.getById(projectId);
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }

    if (tag != null && project != null) {
      project.getTags().remove(tag);
      projectDao.save(project);
      tagService.removeIfOrphaned((Integer) tag.getId());
    }
  }

  @Transactional
  public Integer updateTag(Integer tagId, Long projectId, String name) {
    Tag currentTag = tagService.getTagById(tagId);

    // if the current tag's name is equivalent of the given name to change
    // to, then we do not need to do anything, so just return the currentTag's id
    if (currentTag.getName().toLowerCase().equals(name.toLowerCase())) {
      return (Integer) currentTag.getId();
    }

    removeTagFromProject(tagId, projectId);
    return addTagToProject(name, projectId);
  }

  public boolean isAuthorizedToCreateTag(User user, String name) {
    return user.isAdmin() || !name.toLowerCase().equals("library");
  }

  public boolean projectContainsTag(Project project, String name) {
    project.getTags().size(); // force-fetch project tags from db
    for (Tag t : project.getTags()) {
      if (t.getName().toLowerCase().equals(name.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  @Transactional
  public List<Project> getLibraryProjectList() {
    Set<String> tagNames = new TreeSet<String>();
    tagNames.add("library");
    return getProjectListByTagNames(tagNames);
  }

  @Transactional
  public List<Project> getPublicLibraryProjectList() {
    Set<String> tagNames = new TreeSet<String>();
    tagNames.add("library");
    tagNames.add("public");
    return getProjectListByTagNames(tagNames);
  }

  @Transactional
  public List<Project> getTeacherSharedProjectList() {
    Set<String> tagNames = new TreeSet<String>();
    tagNames.add("teachershared");
    tagNames.add("public");
    return getProjectListByTagNames(tagNames);
  }

  public List<Project> getProjectListByTagNames(Set<String> tagNames) {
    return projectDao.getProjectListByTagNames(tagNames);
  }

  public List<Project> getProjectListByAuthorName(String authorName) {
    return projectDao.getProjectListByAuthorName(authorName);
  }

  public List<Project> getProjectListByTitle(String title) {
    return projectDao.getProjectListByTitle(title);
  }

  public List<Project> getProjectCopies(Long projectId) {
    return projectDao.getProjectCopies(projectId);
  }

  public Long identifyRootProjectId(Project project) throws ObjectNotFoundException {
    if (project == null) {
      return null;
    } else {
      Long parentProjectId = project.getParentProjectId();
      if (parentProjectId == null || projectContainsTag(project, "library")) {
        return (Long) project.getId();
      } else {
        return identifyRootProjectId(getById(parentProjectId));
      }
    }
  }

  public long getNextAvailableProjectId() {
    String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");
    File curriculumBaseDirFile = new File(curriculumBaseDir);
    long nextId = Math.max(projectDao.getMaxProjectId(), runDao.getMaxRunId()) + 1;
    while (true) {
      File nextFolder = new File(curriculumBaseDirFile, String.valueOf(nextId));
      if (nextFolder.exists()) {
        nextId++;
      } else {
        break;
      }
    }
    return nextId;
  }

  @Transactional
  public Project copyProject(Long projectId, User user) throws Exception {
    Project parentProject = getById(projectId);
    long newProjectId = getNextAvailableProjectId();
    File parentProjectDir = new File(FileManager.getProjectFolderPath(parentProject));
    String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");
    File newProjectDir = new File(curriculumBaseDir, String.valueOf(newProjectId));
    FileManager.copy(parentProjectDir, newProjectDir);
    String projectModulePath = parentProject.getModulePath();
    String projectJSONFilename = projectModulePath
        .substring(projectModulePath.lastIndexOf("/") + 1);
    Long parentProjectId = (Long) parentProject.getId();
    ProjectParameters pParams = new ProjectParameters();
    pParams.setProjectId(newProjectId);
    pParams.setModulePath("/" + newProjectId + "/" + projectJSONFilename);
    pParams.setOwner(user);
    pParams.setProjectname(parentProject.getName());
    pParams.setProjectType(ProjectType.LD);
    pParams.setWiseVersion(parentProject.getWiseVersion());
    pParams.setParentProjectId(parentProjectId);
    ProjectMetadata parentProjectMetadata = parentProject.getMetadata();
    if (parentProjectMetadata != null) {
      ProjectMetadata newProjectMetadata = new ProjectMetadataImpl(
          parentProjectMetadata.toJSONString());
      newProjectMetadata.setAuthors(new JSONArray().toString());
      JSONObject parentProjectJSON = getParentInfo(parentProjectMetadata, parentProjectId,
          getProjectURI(parentProject));
      newProjectMetadata.setParentProjects(
          addToParentProjects(parentProjectJSON, parentProjectMetadata).toString());
      pParams.setMetadata(newProjectMetadata);
    }
    return createProject(pParams);
  }

  public List<Permission> getSharedTeacherPermissions(Project project, User sharedTeacher) {
    return aclService.getPermissions(project, sharedTeacher.getUserDetails());
  }

  SharedOwner createNewSharedOwner(String username) {
    User user = userService.retrieveUserByUsername(username);
    MutableUserDetails userDetails = user.getUserDetails();
    Long userId = user.getId();
    String firstName = userDetails.getFirstname();
    String lastName = userDetails.getLastname();
    List<Integer> permissions = new ArrayList<>();
    permissions.add(ProjectPermission.EDIT_PROJECT.getMask());
    return new SharedOwner(userId, username, firstName, lastName, permissions);
  }

  public void removeSharedTeacher(Long projectId, String username) throws ObjectNotFoundException {
    removeSharedTeacherFromProject(getById(projectId),
        userService.retrieveUserByUsername(username));
  }

  public void addSharedTeacherPermission(Long projectId, Long userId, Integer permissionId)
      throws ObjectNotFoundException {
    User user = userService.retrieveById(userId);
    Project project = getById(projectId);
    if (project.getSharedowners().contains(user)) {
      aclService.addPermission(project, new ProjectPermission(permissionId), user);
    }
  }

  public void removeSharedTeacherPermission(Long projectId, Long userId, Integer permissionId)
      throws ObjectNotFoundException {
    User user = userService.retrieveById(userId);
    Project project = getById(projectId);
    if (project.getSharedowners().contains(user)) {
      aclService.removePermission(project, new ProjectPermission(permissionId), user);
    }
  }

  @Transactional
  public void transferProjectOwnership(Project project, User newOwner)
      throws ObjectNotFoundException {
    User oldOwner = project.getOwner();
    if (project.isSharedTeacher(newOwner)) {
      removeSharedTeacherAndPermissions(project, newOwner);
    }
    setOwner(project, newOwner);
    addSharedTeacherWithViewAndEditPermissions(project, oldOwner);
    removeAdministrationPermission(project, oldOwner);
    projectDao.save(project);
  }

  private void setOwner(Project project, User user) {
    project.setOwner(user);
    aclService.addPermission(project, BasePermission.ADMINISTRATION, user);
  }

  private void addSharedTeacherWithViewAndEditPermissions(Project project, User user) {
    if (!project.isSharedTeacher(user)) {
      project.getSharedowners().add(user);
    }
    aclService.addPermission(project, ProjectPermission.VIEW_PROJECT, user);
    aclService.addPermission(project, ProjectPermission.EDIT_PROJECT, user);
  }

  private void removeAdministrationPermission(Project project, User user) {
    aclService.removePermission(project, BasePermission.ADMINISTRATION, user);
  }

  public List<Project> getProjectsWithoutRuns(User user) {
    return projectDao.getProjectsWithoutRuns(user);
  }

  public List<Project> getAllSharedProjects() {
    return projectDao.getAllSharedProjects();
  }

  private JSONObject getParentInfo(ProjectMetadata parentProjectMetadata, Long parentProjectId,
      String uri) throws JSONException {
    String parentAuthorsString = parentProjectMetadata.getAuthors();
    String parentProjectTitle = parentProjectMetadata.getTitle();
    JSONArray parentAuthors = new JSONArray();
    if (parentAuthorsString != null) {
      parentAuthors = new JSONArray(parentAuthorsString);
    }
    JSONObject parentProjectJSON = new JSONObject();
    if (parentProjectId != null) {
      parentProjectJSON.put("id", parentProjectId);
    }
    parentProjectJSON.put("title", parentProjectTitle);
    parentProjectJSON.put("authors", parentAuthors);
    parentProjectJSON.put("uri", uri);
    parentProjectJSON.put("dateCopied", new Date());
    return parentProjectJSON;
  }

  private JSONArray getParentProjects(ProjectMetadata metadata) throws JSONException {
    String parentProjectsString = metadata.getParentProjects();
    if (parentProjectsString != null) {
      return new JSONArray(parentProjectsString);
    } else {
      return new JSONArray();
    }
  }

  private JSONArray addToParentProjects(JSONObject parentProjectJSON, ProjectMetadata metadata)
      throws JSONException {
    JSONArray parentProjects = getParentProjects(metadata);
    parentProjects.put(parentProjectJSON);
    return parentProjects;
  }

  public List<HashMap<String, Object>> getProjectSharedOwnersList(Project project) {
    List<HashMap<String, Object>> sharedOwners = new ArrayList<HashMap<String, Object>>();
    for (User sharedOwner : project.getSharedowners()) {
      sharedOwners.add(getSharedOwnerMap(sharedOwner, project));
    }
    return sharedOwners;
  }

  private HashMap<String, Object> getSharedOwnerMap(User sharedOwner, Project project) {
    HashMap<String, Object> map = new HashMap<String, Object>();
    map.put("id", sharedOwner.getId());
    map.put("username", sharedOwner.getUserDetails().getUsername());
    map.put("firstName", sharedOwner.getUserDetails().getFirstname());
    map.put("lastName", sharedOwner.getUserDetails().getLastname());
    map.put("permissions", getSharedOwnerPermissions(project, sharedOwner));
    return map;
  }

  private List<Integer> getSharedOwnerPermissions(Project project, User sharedOwner) {
    List<Integer> permissions = new ArrayList<Integer>();
    for (Permission permission : getSharedTeacherPermissions(project, sharedOwner)) {
      permissions.add(permission.getMask());
    }
    return permissions;
  }

  public String getProjectPath(Project project) {
    String modulePath = project.getModulePath();
    int lastIndexOfSlash = modulePath.lastIndexOf("/");
    if (lastIndexOfSlash != -1) {
      String hostname = appProperties.getProperty("wise.hostname");
      String curriculumBaseWWW = appProperties.getProperty("curriculum_base_www");
      return hostname + curriculumBaseWWW + modulePath.substring(0, lastIndexOfSlash);
    }
    return "";
  }

  public String getProjectURI(Project project) {
    if (project.getWiseVersion().equals(4)) {
      return appProperties.getProperty("wise4.hostname") + "/previewproject.html?projectId="
          + project.getId();
    } else {
      return appProperties.getProperty("wise.hostname") + "/preview/unit/" + project.getId();
    }
  }

  private String getAuthorsString(JSONArray authors) {
    StringBuilder authorsString = new StringBuilder();
    int totalAuthors = authors.length();
    for (int i = 0; i < totalAuthors; i++) {
      JSONObject author;
      try {
        author = authors.getJSONObject(i);
        String firstName = author.getString("firstName");
        String lastName = author.getString("lastName");
        authorsString.append(firstName + " " + lastName);
        if (i < totalAuthors - 1) {
          authorsString.append(", ");
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return authorsString.toString();
  }

  public String getLicensePath(Project project) {
    String licensePath = getProjectLocalPath(project) + LICENSE_PATH;
    File licenseFile = new File(licensePath);
    if (licenseFile.isFile()) {
      return getProjectPath(project) + LICENSE_PATH;
    } else {
      return "";
    }
  }

  private String getProjectLocalPath(Project project) {
    String modulePath = project.getModulePath();
    int lastIndexOfSlash = modulePath.lastIndexOf("/");
    if (lastIndexOfSlash != -1) {
      String curriculumBaseWWW = appProperties.getProperty("curriculum_base_dir");
      return curriculumBaseWWW + modulePath.substring(0, lastIndexOfSlash);
    }
    return "";
  }

  public void writeProjectLicenseFile(Project project) throws JSONException {
    String projectFolderPath = FileManager.getProjectFolderPath(project);
    ProjectMetadata metadata = project.getMetadata();
    String title = metadata.getTitle();
    JSONArray authorsArray = new JSONArray(metadata.getAuthors());
    String authors = getAuthorsString(authorsArray);
    String titleAndUri = "\"" + title + "\" (" + getProjectURI(project) + ")";
    String license = titleAndUri + " is licensed under CC BY-SA";
    if (!authors.isEmpty()) {
      license += " by " + authors + ".";
    } else {
      license += ".";
    }
    license = WordUtils.wrap(license, 72) + "\n\n";
    JSONArray parentProjects = getParentProjects(metadata);
    for (int i = parentProjects.length() - 1; i >= 0; i--) {
      JSONObject parentProjectJSON = parentProjects.getJSONObject(i);
      String parentTitle = parentProjectJSON.getString("title");
      String parentAuthors = getAuthorsString(parentProjectJSON.getJSONArray("authors"));
      String parentURI = parentProjectJSON.getString("uri");
      String parentLicense = "\n";
      if (i == parentProjects.length() - 1) {
        parentLicense = "----\n\n";
      }
      parentLicense += WordUtils.wrap(titleAndUri, 72);
      if (authors.isEmpty()) {
        parentLicense += "\nis a copy of ";
      } else {
        parentLicense += "\nis a derivative of ";
      }
      titleAndUri = "\"" + parentTitle + "\" (" + parentURI + ")";
      parentLicense += "\n" + WordUtils.wrap(titleAndUri, 72);
      if (!parentAuthors.isEmpty()) {
        parentLicense += WordUtils.wrap("\nby " + parentAuthors, 72);
      }
      parentLicense += "\n[used under CC BY-SA, copied " + parentProjectJSON.getString("dateCopied")
          + "].\n";
      license += parentLicense;
      if (i == 0) {
        license += "\n----\n\n";
      }
      authors = parentAuthors;
    }
    license += WordUtils.wrap(
        "License pertains to original content created "
            + "by the author(s). Authors are responsible for the usage and "
            + "attribution of any third-party content linked to or included in " + "this work.",
        72);
    String ccLicenseText = "";
    InputStream ccLicense = FileManager.class.getClassLoader().getResourceAsStream("cc-by-sa.txt");
    if (ccLicense != null) {
      try {
        ccLicenseText = IOUtils.toString(ccLicense, "UTF-8");
      } catch (IOException e) {
        e.printStackTrace();
      }
    }
    license += "\n\n" + ccLicenseText;
    File licenseFile = new File(projectFolderPath, "license.txt");
    try {
      Writer writer = new BufferedWriter(
          new OutputStreamWriter(new FileOutputStream(licenseFile), "UTF-8"));
      writer.write(license);
      writer.close();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  public void replaceMetadataInProjectJSONFile(String projectFilePath, ProjectMetadata metadata)
      throws IOException, JSONException {
    String projectStr = FileUtils.readFileToString(new File(projectFilePath));
    JSONObject projectJSONObj = new JSONObject(projectStr);
    projectJSONObj.put("metadata", metadata.toJSONObject());
    File newProjectJSONFile = new File(projectFilePath);
    Writer writer = new BufferedWriter(
        new OutputStreamWriter(new FileOutputStream(newProjectJSONFile), "UTF-8"));
    writer.write(projectJSONObj.toString());
    writer.close();
  }

  public void saveProjectContentToDisk(String projectJSONString, Project project)
      throws FileNotFoundException, IOException {
    String projectJSONPath = appProperties.getProperty("curriculum_base_dir")
        + project.getModulePath();
    Writer writer = new BufferedWriter(
        new OutputStreamWriter(new FileOutputStream(new File(projectJSONPath)), "UTF-8"));
    writer.write(projectJSONString);
    writer.close();
  }

  public Map<String, Object> getDirectoryInfo(File directory) {
    HashMap<String, Object> directoryMap = new HashMap<String, Object>();
    List<HashMap<String, Object>> files = new ArrayList<HashMap<String, Object>>();
    long totalDirectorySize = 0l;
    File[] filesInProjectAssetsDir = getFilesInDirectory(directory);
    if (filesInProjectAssetsDir != null) {
      for (File file : filesInProjectAssetsDir) {
        HashMap<String, Object> fileObject = new HashMap<String, Object>();
        fileObject.put("fileName", file.getName());
        long fileSize = file.length();
        fileObject.put("fileSize", fileSize);
        totalDirectorySize += fileSize;
        files.add(fileObject);
      }
    }
    directoryMap.put("totalFileSize", totalDirectorySize);
    directoryMap.put("files", files);
    return directoryMap;
  }

  private File[] getFilesInDirectory(File directory) {
    if (directory.exists() && directory.isDirectory()) {
      return directory.listFiles();
    }
    return new File[0];
  }

  public void saveProjectToDatabase(Project project, User user, String projectJSONString)
      throws JSONException, NotAuthorizedException {
    JSONObject projectJSONObject = new JSONObject(projectJSONString);
    JSONObject projectMetadataJSON = projectJSONObject.getJSONObject("metadata");
    if (projectMetadataJSON != null) {
      updateProjectNameIfNecessary(project, projectMetadataJSON);
    }
    updateProject(project, user);
  }

  public void updateMetadataAndLicenseIfNecessary(Project project, String projectJSONString)
      throws JSONException {
    ProjectMetadata oldProjectMetadata = project.getMetadata();
    ProjectMetadata newProjectMetadata = new ProjectMetadataImpl(
        getMetadataFromProjectJSONString(projectJSONString));
    project.setMetadata(newProjectMetadata);
    if (isLicenseUpdateRequired(oldProjectMetadata, newProjectMetadata)) {
      writeProjectLicenseFile(project);
    }
  }

  private JSONObject getMetadataFromProjectJSONString(String projectJSONString) {
    try {
      JSONObject projectJSONObject = new JSONObject(projectJSONString);
      return projectJSONObject.getJSONObject("metadata");
    } catch (JSONException e) {
      e.printStackTrace();
      return null;
    }
  }

  public boolean isLicenseUpdateRequired(ProjectMetadata oldProjectMetadata,
      ProjectMetadata newProjectMetadata) {
    return titleHasChanged(oldProjectMetadata, newProjectMetadata)
        || authorsHasChanged(oldProjectMetadata, newProjectMetadata);
  }

  private boolean titleHasChanged(ProjectMetadata oldProjectMetadata,
      ProjectMetadata newProjectMetadata) {
    return !oldProjectMetadata.getTitle().equals(newProjectMetadata.getTitle());
  }

  private boolean authorsHasChanged(ProjectMetadata oldProjectMetadata,
      ProjectMetadata newProjectMetadata) {
    return !oldProjectMetadata.getAuthors().equals(newProjectMetadata.getAuthors());
  }

  public void updateProjectNameIfNecessary(Project project, JSONObject projectMetadataJSON) {
    project.setName(projectMetadataJSON.optString("title", project.getName()));
  }
}
