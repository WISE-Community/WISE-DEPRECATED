package org.wise.portal.presentation.web.controllers.run;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;

import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.json.JSONException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.security.access.AccessDeniedException;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.Tag;
import org.wise.portal.domain.impl.TagImpl;
import org.wise.portal.presentation.web.controllers.APIControllerTest;
import org.wise.portal.service.tag.TagService;
import org.wise.portal.spring.data.redis.MessagePublisher;

@RunWith(EasyMockRunner.class)
public class WorkgroupTagAPIControllerTest extends APIControllerTest {

  @TestSubject
  private WorkgroupTagAPIController controller = new WorkgroupTagAPIController();

  @Mock
  private TagService tagService;

  @Mock
  private MessagePublisher redisPublisher;

  private String tag1Name = "Group1";

  private TagImpl tag1;

  @Before
  public void setup() {
    tag1 = new TagImpl();
    tag1.setId(1);
    tag1.setName(tag1Name);
    tag1.setRun(run3);
    workgroup1.addTag(tag1);
  }

  @Test
  public void createTag_TeacherIsAssociatedWithRun_CreateTag() throws ObjectNotFoundException {
    expect(runService.retrieveById(runId3)).andReturn(run3);
    expect(runService.hasWritePermission(teacherAuth, run3)).andReturn(true);
    expect(tagService.createTag(run3, tag1Name)).andReturn(tag1);
    replay(userService, runService, tagService);
    Tag tag = controller.createTag(runId3, tag1Name, teacherAuth);
    assertEquals(tag1Name, tag.getName());
    assertEquals(runId3, tag.getRun().getId());
    verify(userService, runService, tagService);
  }

  @Test
  public void createTag_TeacherIsNotAssociatedWithRun_AccessDenied()
      throws ObjectNotFoundException {
    expectTeacherDoesNotHaveRunWritePermission();
    replay(userService, runService, tagService);
    try {
      controller.createTag(runId3, tag1Name, teacherAuth);
      fail("should not get here");
    } catch (AccessDeniedException e) {
    }
    verify(userService, runService, tagService);
  }

  private void expectTeacherDoesNotHaveRunWritePermission() throws ObjectNotFoundException {
    expect(runService.retrieveById(runId3)).andReturn(run3);
    expect(runService.hasWritePermission(teacherAuth, run3)).andReturn(false);
  }

  @Test
  public void updateTag_TeacherDoesNotHavePermission_AccessDenied() throws ObjectNotFoundException {
    expect(tagService.canEditTag(teacherAuth, tag1)).andReturn(false);
    replay(tagService);
    try {
      controller.updateTag(runId3, tag1, teacherAuth);
      fail("should not get here");
    } catch (AccessDeniedException e) {
    }
    verify(tagService);
  }

  @Test
  public void updateTag_TeacherHasPermission_UpdateAndReturnTag() throws ObjectNotFoundException {
    expect(tagService.canEditTag(teacherAuth, tag1)).andReturn(true);
    expect(tagService.updateTag(tag1)).andReturn(tag1);
    replay(userService, tagService);
    Tag updatedTag = controller.updateTag(runId3, tag1, teacherAuth);
    assertEquals(tag1.getId(), updatedTag.getId());
    verify(userService, tagService);
  }

  @Test
  public void deleteTag_TeacherDoesNotHavePermission_AccessDenied() {
    expect(tagService.canEditTag(teacherAuth, tag1)).andReturn(false);
    replay(tagService);
    try {
      controller.deleteTag(runId3, tag1, teacherAuth);
      fail("should not get here");
    } catch (AccessDeniedException e) {
    }
    verify(tagService);
  }

  @Test
  public void deleteTag_TeacherHasPermission_DeleteTag() {
    expect(tagService.canEditTag(teacherAuth, tag1)).andReturn(true);
    tagService.deleteTag(teacherAuth, tag1);
    expectLastCall();
    replay(tagService);
    controller.deleteTag(runId3, tag1, teacherAuth);
    verify(tagService);
  }

  @Test
  public void getTagsForRun_TeacherIsNotAssociatedWithRun_AccessDenied()
      throws ObjectNotFoundException {
    expect(runService.retrieveById(runId3)).andReturn(run3);
    expect(runService.hasReadPermission(teacherAuth, run3)).andReturn(false);
    replay(userService, runService);
    try {
      controller.getTagsForRun(runId3, teacherAuth);
      fail("should not get here");
    } catch (AccessDeniedException e) {
    }
    verify(userService, runService);
  }

  @Test
  public void getTagsForRun_TeacherIsAssociatedWithRun_ReturnTags() throws ObjectNotFoundException {
    expect(runService.retrieveById(runId1)).andReturn(run1);
    expect(runService.hasReadPermission(teacherAuth, run1)).andReturn(true);
    expect(tagService.getTagsForRun(run1)).andReturn(run1Tags);
    replay(userService, runService, tagService);
    List<Tag> tags = controller.getTagsForRun(runId1, teacherAuth);
    assertEquals(run1Tags, tags);
    verify(userService, runService, tagService);
  }

  @Test
  public void removeTagFromWorkgroup_HasPermission_RemoveTag()
      throws ObjectNotFoundException, JsonProcessingException, JSONException {
    expect(workgroupService.retrieveById(workgroup1.getId())).andReturn(workgroup1);
    expect(userService.retrieveUserByUsername(teacherAuth.getName())).andReturn(teacher1);
    expect(workgroupService.isUserInWorkgroupForRun(teacher1, workgroup1.getRun(), workgroup1))
        .andReturn(false);
    expect(runService.hasWritePermission(teacherAuth, run1)).andReturn(true);
    workgroupService.removeTag(workgroup1, tag1);
    expectLastCall();
    replay(userService, runService, workgroupService);
    controller.removeTagFromWorkgroup(workgroup1.getId(), tag1, teacherAuth);
    verify(userService, runService, workgroupService);
  }

  @Test
  public void getTagsForWorkgroup_CanNotReadTags_AccessDenied() throws ObjectNotFoundException {
    expect(workgroupService.retrieveById(workgroup1.getId())).andReturn(workgroup1);
    expect(userService.retrieveUserByUsername(student1UserDetails.getUsername())).andReturn(student1);
    expect(workgroupService.isUserInWorkgroupForRun(student1, workgroup1.getRun(), workgroup1))
        .andReturn(false);
    expect(runService.hasReadPermission(studentAuth, workgroup1.getRun())).andReturn(false);
    replay(workgroupService, userService, runService);
    try {
      controller.getTagsForWorkgroup(workgroup1.getId(), studentAuth);
      fail("should not get here");
    } catch (AccessDeniedException e) {
    }
    verify(workgroupService, userService, runService);
  }
}
