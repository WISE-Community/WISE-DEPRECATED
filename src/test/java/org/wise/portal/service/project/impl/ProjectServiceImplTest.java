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
package org.wise.portal.service.project.impl;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Properties;

import org.apache.commons.io.FileUtils;
import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.security.acls.domain.BasePermission;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.authentication.GrantedAuthorityDao;
import org.wise.portal.dao.project.ProjectDao;
import org.wise.portal.domain.authentication.MutableGrantedAuthority;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.project.impl.ProjectMetadataImpl;
import org.wise.portal.domain.project.impl.ProjectParameters;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;

/**
 * @author Hiroki Terashima
 */
@RunWith(EasyMockRunner.class)
public class ProjectServiceImplTest {

  @TestSubject
  private ProjectService projectServiceImpl = new ProjectServiceImpl();

  @Mock
  private ProjectDao<Project> projectDao;

  @Mock
  private Properties appProperties;

  @Mock
  private AclService<Project> mockAclService;

  @Mock
  private RunService runService;

  @Mock
  private GrantedAuthorityDao<MutableGrantedAuthority> grantedAuthorityDao;

  private static final Long EXISTING_PROJECT_ID = new Long(10);

  private static final Long NONEXISTING_PROJECT_ID = new Long(103);

  private static final String tempProjectFolderPath = "src/test/webapp/curriculum/temp";

  private User projectOwner;

  @Before
  public void setUp() throws Exception {
    TeacherUserDetails userDetails = new TeacherUserDetails();
    userDetails.setFirstname("SpongeBob");
    userDetails.setLastname("SquarePants");
    projectOwner = new UserImpl();
    projectOwner.setUserDetails(userDetails);
    File tempProjectFolder = new File(tempProjectFolderPath);
    tempProjectFolder.mkdir();
    tempProjectFolder.deleteOnExit();
  }

  @After
  public void tearDown() throws Exception {
    projectServiceImpl = null;
    projectOwner = null;
  }

  @Test
  public void getById_ExistingProject_ShouldReturnProject() throws Exception {
    Project expectedProject = new ProjectImpl();
    expect(projectDao.getById(EXISTING_PROJECT_ID)).andReturn(expectedProject);
    replay(projectDao);
    assertEquals(expectedProject, projectServiceImpl.getById(EXISTING_PROJECT_ID));
    verify(projectDao);
  }

  @Test
  public void getById_ProjectNotExist_ShouldThrowException() throws Exception {
    expect(projectDao.getById(NONEXISTING_PROJECT_ID))
        .andThrow(new ObjectNotFoundException(NONEXISTING_PROJECT_ID, Project.class));
    replay(projectDao);
    try {
      projectServiceImpl.getById(NONEXISTING_PROJECT_ID);
      fail("ObjectNotFoundException expected but was not thrown");
    } catch (ObjectNotFoundException e) {
    }
    verify(projectDao);
  }

  @Test
  public void createProject_NewProject_ShouldSucceed() throws ObjectNotFoundException {
    Project projectToCreate = new ProjectImpl();
    expect(projectDao.createEmptyProject()).andReturn(projectToCreate);
    projectToCreate.setName("Airbags");
    projectDao.save(projectToCreate);
    expectLastCall();
    replay(projectDao);
    FileUtils fileUtils = mock(FileUtils.class);
    replay(fileUtils);
    replay(appProperties);

    ProjectParameters projectParameters = new ProjectParameters();
    projectParameters.setProjectname("Airbags");
    projectParameters.setModulePath("/1/project.json");
    projectParameters.setOwner(projectOwner);
    projectParameters.setMetadata(new ProjectMetadataImpl());
    Project createdProject = projectServiceImpl.createProject(projectParameters);
    assertEquals("Airbags", createdProject.getName());
    verify(projectDao);
    verify(fileUtils);
    verify(appProperties);
  }

  @Test
  public void getProjectURI_WISE4Project_ShouldReturnWISE4URI() {
    Project project = new ProjectImpl();
    project.setId(12L);
    project.setWISEVersion(4);
    expect(appProperties.getProperty("wise4.hostname")).andReturn("http://localhost:8080/legacy");
    replay(appProperties);
    String uri = projectServiceImpl.getProjectURI(project);
    assertEquals("http://localhost:8080/legacy/previewproject.html?projectId=12", uri);
    verify(appProperties);
  }

  @Test
  public void getProjectURI_WISE5Project_ShouldReturnWISE5URI() {
    Project project = new ProjectImpl();
    project.setId(155L);
    project.setWISEVersion(5);
    expect(appProperties.getProperty("wise.hostname")).andReturn("http://localhost:8080");
    replay(appProperties);
    String uri = projectServiceImpl.getProjectURI(project);
    assertEquals("http://localhost:8080/preview/unit/155", uri);
    verify(appProperties);
  }

  @Test
  public void saveProjectFile_shouldWriteTheProjectFile() {
    Project project = new ProjectImpl();
    project.setModulePath("/temp/project.json");
    expect(appProperties.getProperty("curriculum_base_dir"))
        .andReturn("src/test/webapp/curriculum");
    replay(appProperties);
    String projectJSONString = "{\"metadata\":{\"title\":\"New Title\"}}";
    String projectFilePath = tempProjectFolderPath + "/project.json";
    File projectFile = new File(projectFilePath);
    projectFile.delete();
    try {
      projectServiceImpl.saveProjectContentToDisk(projectJSONString, project);
      String projectText = FileUtils.readFileToString(new File(projectFilePath), "UTF-8");
      assertEquals(projectText, projectJSONString);
    } catch (Exception e) {
      fail();
    }
    projectFile.deleteOnExit();
  }

  @Test
  public void saveProjectToDatabase_shouldMakeACallToSaveToDatabase() {
    Project project = new ProjectImpl();
    project.setId(1L);
    project.setModulePath("/temp/project.json");
    ProjectMetadata oldProjectMetadata = new ProjectMetadataImpl();
    oldProjectMetadata.setTitle("Old Title");
    oldProjectMetadata.setAuthors("[\"Old Authors\"]");
    project.setMetadata(oldProjectMetadata);
    User user = new UserImpl();
    TeacherUserDetails userDetails = new TeacherUserDetails();
    userDetails.addAuthority(null);
    userDetails.removeAuthority(null);
    user.setUserDetails(userDetails);
    String projectJSONString = "{\"metadata\":{\"title\":\"New Title\",\"authors\":[]}}";
    expect(runService.getProjectRuns(1L)).andReturn(new ArrayList());
    replay(runService);
    expect(mockAclService.hasPermission(project, BasePermission.ADMINISTRATION, user))
        .andReturn(true);
    replay(mockAclService);
    projectDao.save(project);
    expectLastCall();
    replay(projectDao);
    try {
      projectServiceImpl.saveProjectToDatabase(project, user, projectJSONString);
      verify(projectDao);
    } catch (Exception e) {
      fail();
    }
  }

  @Test
  public void updateMetadataAndLicenseIfNecessary_shouldUpdateMetadataAndWriteLicenseFile() {
    Project project = new ProjectImpl();
    project.setModulePath("/temp/project.json");
    project.setWISEVersion(5);
    ProjectMetadata oldProjectMetadata = new ProjectMetadataImpl();
    oldProjectMetadata.setTitle("Old Title");
    oldProjectMetadata.setAuthors("[\"Old Authors\"]");
    project.setMetadata(oldProjectMetadata);
    String licenseFilePath = tempProjectFolderPath + "/license.txt";
    File projectFile = new File(licenseFilePath);
    projectFile.delete();
    try {
      projectFile.createNewFile();
      JSONObject projectJSON = new JSONObject();
      JSONObject metadata = new JSONObject();
      JSONArray newAuthors = new JSONArray();
      JSONObject newAuthor = new JSONObject();
      newAuthor.put("firstName", "Spongebob");
      newAuthor.put("lastName", "Squarepants");
      newAuthors.put(newAuthor);
      metadata.put("authors", newAuthors);
      metadata.put("title", "New Title");
      projectJSON.put("metadata", metadata);
      projectServiceImpl.updateMetadataAndLicenseIfNecessary(project, projectJSON.toString());
      assertEquals(metadata.get("title"), project.getMetadata().getTitle());
      String licenseText = FileUtils.readFileToString(new File(licenseFilePath), "UTF-8");
      assertTrue(licenseText.contains("licensed under CC BY-SA by\nSpongebob Squarepants"));
    } catch (JSONException e) {
      fail();
    } catch (IOException e) {
      e.printStackTrace();
      fail();
    }
    projectFile.deleteOnExit();
  }

  @Test
  public void updateProjectNameIfNecessary_whenMetadataHasName_shouldUpdateNameInProjectObject() {
    Project project = new ProjectImpl();
    project.setName("Old Project Name");
    String newProjectName = "New Project Name";
    JSONObject projectMetadataJSON = new JSONObject();
    try {
      projectMetadataJSON.put("title", newProjectName);
      projectServiceImpl.updateProjectNameIfNecessary(project, projectMetadataJSON);
      assertEquals(newProjectName, project.getName());
    } catch (JSONException e) {
      fail();
    }
  }
}
