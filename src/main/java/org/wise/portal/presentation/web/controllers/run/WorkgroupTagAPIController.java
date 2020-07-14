package org.wise.portal.presentation.web.controllers.run;

import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.Tag;
import org.wise.portal.domain.impl.TagImpl;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.tag.TagService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.portal.spring.data.redis.MessagePublisher;

@RestController
@Secured("ROLE_USER")
@RequestMapping("/api/tag")
public class WorkgroupTagAPIController {

  @Autowired
  private RunService runService;

  @Autowired
  private WorkgroupService workgroupService;

  @Autowired
  private TagService tagService;

  @Autowired
  private UserService userService;

  @Autowired
  private MessagePublisher redisPublisher;

  @Secured("ROLE_TEACHER")
  @PostMapping("/run/{runId}/create")
  Tag createTag(@PathVariable Long runId, @RequestBody String name, Authentication auth)
      throws ObjectNotFoundException {
    Run run = runService.retrieveById(runId);
    if (runService.hasWritePermission(auth, run)) {
      return tagService.createTag(run, name);
    }
    throw new AccessDeniedException("Not permitted");
  }

  @Secured("ROLE_TEACHER")
  @PostMapping("/run/{runId}/update")
  Tag updateTag(@PathVariable Long runId, @RequestBody TagImpl tag, Authentication auth)
      throws ObjectNotFoundException {
    if (tagService.canEditTag(auth, tag)) {
      tag.setRun(runService.retrieveById(runId));
      return tagService.updateTag(tag);
    }
    throw new AccessDeniedException("Not permitted");
  }

  @Secured("ROLE_TEACHER")
  @PostMapping("/run/{runId}/delete")
  void deleteTag(@PathVariable Long runId, @RequestBody TagImpl tag, Authentication auth) {
    if (tagService.canEditTag(auth, tag)) {
      tagService.deleteTag(auth, tag);
    } else {
      throw new AccessDeniedException("Not permitted");
    }
  }

  @Secured("ROLE_TEACHER")
  @GetMapping("/run/{runId}")
  List<Tag> getTagsForRun(@PathVariable Long runId, Authentication auth)
      throws ObjectNotFoundException {
    Run run = runService.retrieveById(runId);
    if (runService.hasReadPermission(auth, run)) {
      return tagService.getTagsForRun(run);
    }
    throw new AccessDeniedException("Not permitted");
  }

  @GetMapping("/workgroup/{workgroupId}")
  Set<Tag> getTagsForWorkgroup(@PathVariable Long workgroupId, Authentication auth)
      throws ObjectNotFoundException {
    Workgroup workgroup = workgroupService.retrieveById(workgroupId);
    User user = userService.retrieveUserByUsername(auth.getName());
    if (canReadTags(auth, workgroup, user)) {
      return workgroup.getTags();
    }
    throw new AccessDeniedException("Not permitted");
  }

  @PostMapping("/workgroup/{workgroupId}/add")
  Set<Tag> addTagToWorkgroup(@PathVariable Long workgroupId, @RequestBody TagImpl tag,
      Authentication auth) throws ObjectNotFoundException, JsonProcessingException, JSONException {
    Workgroup workgroup = workgroupService.retrieveById(workgroupId);
    User user = userService.retrieveUserByUsername(auth.getName());
    if (canWriteTag(auth, workgroup, user)) {
      workgroupService.addTag(workgroup, tag);
      broadcastTags(workgroup);
      return workgroup.getTags();
    } else {
      throw new AccessDeniedException("Not permitted");
    }
  }

  @Secured("ROLE_TEACHER")
  @DeleteMapping("/workgroup/{workgroupId}/delete")
  Set<Tag> removeTagFromWorkgroup(@PathVariable Long workgroupId, @RequestBody TagImpl tag,
      Authentication auth) throws ObjectNotFoundException, JsonProcessingException, JSONException {
    Workgroup workgroup = workgroupService.retrieveById(workgroupId);
    User user = userService.retrieveUserByUsername(auth.getName());
    if (canWriteTag(auth, workgroup, user)) {
      workgroupService.removeTag(workgroup, tag);
      broadcastTags(workgroup);
      return workgroup.getTags();
    } else {
      throw new AccessDeniedException("Not permitted");
    }
  }

  private boolean canReadTags(Authentication auth, Workgroup workgroup, User user) {
    return workgroupService.isUserInWorkgroupForRun(user, workgroup.getRun(), workgroup)
        || runService.hasReadPermission(auth, workgroup.getRun());
  }

  private boolean canWriteTag(Authentication auth, Workgroup workgroup, User user) {
    return workgroupService.isUserInWorkgroupForRun(user, workgroup.getRun(), workgroup)
        || runService.hasWritePermission(auth, workgroup.getRun());
  }

  private void broadcastTags(Workgroup workgroup) throws JSONException, JsonProcessingException {
    JSONObject message = new JSONObject();
    message.put("type", "tagsToWorkgroup");
    message.put("topic", String.format("/topic/workgroup/%s", workgroup.getId()));
    ObjectMapper mapper = new ObjectMapper();
    message.put("tags", mapper.writeValueAsString(workgroup.getTags()));
    redisPublisher.publish(message.toString());
  }
}
