package org.wise.portal.presentation.web.controllers.author.project;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.isA;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.HashSet;

import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.presentation.web.controllers.APIControllerTest;
import org.wise.portal.service.session.SessionService;
import org.wise.portal.spring.data.redis.MessagePublisher;

@RunWith(EasyMockRunner.class)
public class AuthorAPIControllerTest extends APIControllerTest {

  @TestSubject
  private AuthorAPIController authorAPIController = new AuthorAPIController();

  @Mock
  private SessionService sessionService;

  @Mock
  private MessagePublisher redisPublisher;

  private String projectJSONString = "";

  @Test
  public void authorProjectBegin_CanNotAuthor_NotifyAuthors() throws Exception {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    expect(projectService.getById(projectId1)).andReturn(project1);
    expect(projectService.canAuthorProject(project1, teacher1)).andReturn(false);
    replay(projectService);
    authorAPIController.authorProjectBegin(teacherAuth, projectId1);
    verify(userService);
    verify(projectService);
  }

  @Test
  public void authorProjectBegin_CanAuthor_NotifyAuthors() throws Exception {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    expect(projectService.getById(projectId1)).andReturn(project1);
    expect(projectService.canAuthorProject(project1, teacher1)).andReturn(true);
    replay(projectService);
    sessionService.addCurrentAuthor(projectId1, TEACHER_USERNAME);
    expectLastCall();
    expect(sessionService.getCurrentAuthors(projectId1)).andReturn(new HashSet<String>());
    expectLastCall();
    replay(sessionService);
    redisPublisher.publish(isA(String.class));
    expectLastCall();
    replay(redisPublisher);
    authorAPIController.authorProjectBegin(teacherAuth, projectId1);
    verify(userService);
    verify(projectService);
    verify(sessionService);
    verify(redisPublisher);
  }

  @Test
  public void authorProjectEnd_CanNotAuthor_NotifyAuthors() throws Exception {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    expect(projectService.getById(projectId1)).andReturn(project1);
    expect(projectService.canAuthorProject(project1, teacher1)).andReturn(false);
    replay(projectService);
    authorAPIController.authorProjectBegin(teacherAuth, projectId1);
    verify(userService);
    verify(projectService);
  }

  @Test
  public void authorProjectEnd_CanAuthor_NotifyAuthors() throws Exception {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    expect(projectService.getById(projectId1)).andReturn(project1);
    expect(projectService.canAuthorProject(project1, teacher1)).andReturn(true);
    replay(projectService);
    sessionService.removeCurrentAuthor(projectId1, TEACHER_USERNAME);
    expectLastCall();
    expect(sessionService.getCurrentAuthors(projectId1)).andReturn(new HashSet<String>());
    expectLastCall();
    replay(sessionService);
    redisPublisher.publish(isA(String.class));
    expectLastCall();
    replay(redisPublisher);
    authorAPIController.authorProjectEnd(teacherAuth, projectId1);
    verify(userService);
    verify(projectService);
    verify(sessionService);
    verify(redisPublisher);
  }

  @Test
  public void saveProject_CanNotAuthor_Return() throws Exception {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    expect(projectService.getById(projectId1)).andReturn(project1);
    expect(projectService.canAuthorProject(project1, teacher1)).andReturn(false);
    replay(projectService);
    authorAPIController.saveProject(teacherAuth, projectId1, projectJSONString);
    verify(userService);
    verify(projectService);
  }

  @Test
  public void copyProject_CanReadProject_ReturnCopiedProject() throws Exception {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    expect(projectService.getById(projectId1)).andReturn(project1);
    expect(projectService.canReadProject(project1, teacher1)).andReturn(true);
    expect(projectService.copyProject(projectId1, teacher1)).andReturn(new ProjectImpl());
    replay(projectService);
    authorAPIController.copyProject(teacherAuth, projectId1);
    verify(userService);
    verify(projectService);
  }

  @Test
  public void copyProject_CanNotReadProject_ReturnNull() throws Exception {
    expect(userService.retrieveUserByUsername(TEACHER_USERNAME)).andReturn(teacher1);
    replay(userService);
    expect(projectService.getById(projectId1)).andReturn(project1);
    expect(projectService.canReadProject(project1, teacher1)).andReturn(false);
    replay(projectService);
    Project copiedProject = authorAPIController.copyProject(teacherAuth, projectId1);
    assertNull(copiedProject);
    verify(userService);
    verify(projectService);
  }
}

