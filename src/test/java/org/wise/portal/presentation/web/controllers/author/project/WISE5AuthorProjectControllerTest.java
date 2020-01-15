package org.wise.portal.presentation.web.controllers.author.project;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.HashMap;

import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.api.easymock.PowerMock;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.project.ProjectService;

@RunWith(PowerMockRunner.class)
@PrepareForTest({ ControllerUtil.class })
public class WISE5AuthorProjectControllerTest {

  @Mock
  protected ProjectService projectService;

  @TestSubject
  private WISE5AuthorProjectController wise5AuthorProjectController =
      new WISE5AuthorProjectController();
  
  @Test
  public void saveProject_whenNotSignedIn_shouldReturnNotSignedInError() {
    try {
      Long projectId = 1L;
      expect(projectService.getById(projectId)).andReturn(new ProjectImpl());
      replay(projectService);
      PowerMock.mockStatic(ControllerUtil.class);
      expect(ControllerUtil.getSignedInUser()).andReturn(null);
      PowerMock.replay(ControllerUtil.class);
      String commitMessage = "";
      String projectJSONString = "{}";
      HashMap<String, Object> map = 
          wise5AuthorProjectController.saveProject(projectId, commitMessage, projectJSONString);
      assertEquals("error", map.get("status"));
      assertEquals("notSignedIn", map.get("messageCode"));
    } catch(Exception e) {
      
    }
  }
  
  @Test
  public void saveProject_whenNotAllowedToEdit_shouldReturnError() {
    try {
      Project project = new ProjectImpl();
      User user = new UserImpl();
      Long projectId = 1L;
      expect(projectService.getById(projectId)).andReturn(project);
      expect(projectService.canAuthorProject(project, user)).andReturn(false);
      replay(projectService);
      PowerMock.mockStatic(ControllerUtil.class);
      expect(ControllerUtil.getSignedInUser()).andReturn(user);
      PowerMock.replay(ControllerUtil.class);
      String commitMessage = "";
      String projectJSONString = "{}";
      HashMap<String, Object> map = 
          wise5AuthorProjectController.saveProject(projectId, commitMessage, projectJSONString);
      assertEquals("error", map.get("status"));
      assertEquals("notAllowedToEditThisProject", map.get("messageCode"));
    } catch(Exception e) {
      
    }
  }

  @Test
  public void saveProject_whenErrorSavingProjectFile_shouldReturnErrorSavingProject() {
    try {
      Project project = new ProjectImpl();
      User user = new UserImpl();
      Long projectId = 1L;
      expect(projectService.getById(projectId)).andReturn(project);
      expect(projectService.canAuthorProject(project, user)).andReturn(false);
      replay(projectService);
      PowerMock.mockStatic(ControllerUtil.class);
      expect(ControllerUtil.getSignedInUser()).andReturn(user);
      PowerMock.replay(ControllerUtil.class);
      PowerMock.expectPrivate(wise5AuthorProjectController, "saveProjectFile").andReturn(false);
      String commitMessage = "";
      String projectJSONString = "{}";
      HashMap<String, Object> map = 
          wise5AuthorProjectController.saveProject(projectId, commitMessage, projectJSONString);
      assertEquals("error", map.get("status"));
      assertEquals("errorSavingProject", map.get("messageCode"));
    } catch(Exception e) {
      
    }
  }

  @Test
  public void saveProject_whenErrorSavingProjectToDatabase_shouldReturnErrorSavingProject() {
    try {
      Project project = new ProjectImpl();
      User user = new UserImpl();
      Long projectId = 1L;
      expect(projectService.getById(projectId)).andReturn(project);
      expect(projectService.canAuthorProject(project, user)).andReturn(false);
      replay(projectService);
      PowerMock.mockStatic(ControllerUtil.class);
      expect(ControllerUtil.getSignedInUser()).andReturn(user);
      PowerMock.replay(ControllerUtil.class);
      PowerMock.expectPrivate(wise5AuthorProjectController, "saveProjectFile").andReturn(true);
      PowerMock.expectPrivate(wise5AuthorProjectController, "saveProjectToDatabase")
          .andReturn(false);
      String commitMessage = "";
      String projectJSONString = "{}";
      HashMap<String, Object> map = 
          wise5AuthorProjectController.saveProject(projectId, commitMessage, projectJSONString);
      assertEquals("error", map.get("status"));
      assertEquals("errorSavingProject", map.get("messageCode"));
    } catch(Exception e) {
      
    }
  }

  @Test
  public void saveProject_NoErrors_shouldReturnProjectSaved() {
    try {
      Project project = new ProjectImpl();
      User user = new UserImpl();
      Long projectId = 1L;
      expect(projectService.getById(projectId)).andReturn(project);
      expect(projectService.canAuthorProject(project, user)).andReturn(false);
      replay(projectService);
      PowerMock.mockStatic(ControllerUtil.class);
      expect(ControllerUtil.getSignedInUser()).andReturn(user);
      PowerMock.replay(ControllerUtil.class);
      PowerMock.expectPrivate(wise5AuthorProjectController, "saveProjectFile").andReturn(true);
      PowerMock.expectPrivate(wise5AuthorProjectController, "saveProjectToDatabase")
          .andReturn(true);
      String commitMessage = "";
      String projectJSONString = "{}";
      HashMap<String, Object> map = 
          wise5AuthorProjectController.saveProject(projectId, commitMessage, projectJSONString);
      assertEquals("success", map.get("status"));
      assertEquals("projectSaved", map.get("messageCode"));
    } catch(Exception e) {
      
    }
  }
}