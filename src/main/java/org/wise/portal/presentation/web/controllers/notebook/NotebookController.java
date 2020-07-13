package org.wise.portal.presentation.web.controllers.notebook;

import java.nio.file.AccessDeniedException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.vle.wise5.VLEService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.vle.domain.work.NotebookItem;
import org.wise.vle.domain.work.NotebookItemAlreadyInGroupException;

/**
 * Notebooks and NotebookItems API
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
@Controller
@RequestMapping(value = {"/student/notebook/run", "/teacher/notebook/run"})
public class NotebookController {

  @Autowired
  private VLEService vleService;

  @Autowired
  private RunService runService;

  @Autowired
  private WorkgroupService workgroupService;

  @Autowired
  private UserService userService;

  @Secured("ROLE_TEACHER")
  @ResponseBody
  @GetMapping("/{runId}")
  protected List<NotebookItem> getNotebookItems(@PathVariable Long runId, Authentication auth,
      @RequestParam(required = false) String exportType) throws ObjectNotFoundException,
      AccessDeniedException {
    Run run = runService.retrieveById(runId);
    if (runService.hasReadPermission(auth, run)) {
      if ("allNotebookItems".equals(exportType)) {
        return vleService.getNotebookItemsExport(run);
      } else if ("latestNotebookItems".equals(exportType)) {
        return vleService.getLatestNotebookItemsExport(run);
      } else {
        return vleService.getNotebookItems(run);
      }
    }
    throw new AccessDeniedException("Not allowed to view notebook items");
  }

  @Secured("ROLE_STUDENT")
  @ResponseBody
  @GetMapping("/{runId}/workgroup/{workgroupId}")
  protected List<NotebookItem> getNotebookItems(@PathVariable Long runId,
      @PathVariable Long workgroupId, Authentication auth) throws ObjectNotFoundException,
      AccessDeniedException {
    if (!isUserInRunAndWorkgroup(auth, runId, workgroupId)) {
      throw new AccessDeniedException("Not allowed to view notebook items");
    }
    Run run = runService.retrieveById(runId);
    Workgroup workgroup = workgroupService.retrieveById(workgroupId);
    return vleService.getNotebookItems(run, workgroup);
  }

  @ResponseBody
  @PostMapping("/{runId}")
  protected NotebookItem saveNotebookItem(
      @PathVariable Long runId,
      @RequestParam(value = "periodId", required = false) Integer periodId,
      @RequestParam(value = "workgroupId", required = true) Long workgroupId,
      @RequestParam(value = "notebookItemId", required = false) Integer notebookItemId,
      @RequestParam(value = "nodeId", required = false) String nodeId,
      @RequestParam(value = "componentId", required = false) String componentId,
      @RequestParam(value = "studentWorkId", required = false) Integer studentWorkId,
      @RequestParam(value = "studentAssetId", required = false) Integer studentAssetId,
      @RequestParam(value = "localNotebookItemId", required = false) String localNotebookItemId,
      @RequestParam(value = "type", required = false) String type,
      @RequestParam(value = "title", required = false) String title,
      @RequestParam(value = "content", required = false) String content,
      @RequestParam(value = "groups", required = false) String groups,
      @RequestParam(value = "clientSaveTime", required = true) String clientSaveTime,
      @RequestParam(value = "clientDeleteTime", required = false) String clientDeleteTime,
      Authentication auth) throws ObjectNotFoundException, AccessDeniedException {
    if (!isUserInRunAndWorkgroup(auth, runId, workgroupId)) {
      throw new AccessDeniedException("Not allowed to save notebook items");
    }
    NotebookItem notebookItem = vleService.saveNotebookItem(notebookItemId, runId.intValue(),
        periodId, workgroupId.intValue(), nodeId, componentId, studentWorkId, studentAssetId,
        localNotebookItemId, type, title, content, groups, clientSaveTime, clientDeleteTime);
    return notebookItem;
  }

  @ResponseBody
  @PostMapping("/{runId}/group/{group}")
  protected NotebookItem addNotebookItemToGroup(
      @PathVariable Long runId,
      @PathVariable String group,
      @RequestParam(value = "workgroupId", required = true) Long workgroupId,
      @RequestParam(value = "notebookItemId", required = true) Integer notebookItemId,
      @RequestParam(value = "clientSaveTime", required = true) String clientSaveTime,
      Authentication auth) throws ObjectNotFoundException, NotebookItemAlreadyInGroupException,
      AccessDeniedException {
    if (!isUserInRunAndWorkgroup(auth, runId, workgroupId)) {
      throw new AccessDeniedException("Not allowed to add notebook item to group");
    }
    return vleService.addNotebookItemToGroup(notebookItemId, group, clientSaveTime);
  }

  @ResponseBody
  @DeleteMapping("/{runId}/group/{group}")
  protected NotebookItem removeNotebookItemFromGroup(
      @PathVariable Long runId,
      @PathVariable String group,
      @RequestParam(value = "workgroupId", required = true) Long workgroupId,
      @RequestParam(value = "notebookItemId", required = true) Integer notebookItemId,
      @RequestParam(value = "clientSaveTime", required = true) String clientSaveTime,
      Authentication auth) throws ObjectNotFoundException, AccessDeniedException {
    if (!isUserInRunAndWorkgroup(auth, runId, workgroupId)) {
      throw new AccessDeniedException("Not allowed to remove notebook item from group");
    }
    return vleService.removeNotebookItemFromGroup(notebookItemId, group, clientSaveTime);
  }

  @ResponseBody
  @GetMapping("/{runId}/group/{group}")
  protected List<NotebookItem> getNotebookItemsInGroup(
      @PathVariable Long runId,
      @PathVariable String group,
      @RequestParam(value = "periodId", required = false) Integer periodId,
      Authentication auth) throws AccessDeniedException, ObjectNotFoundException {
    User user = userService.retrieveUserByUsername(auth.getName());
    if (!isUserAssociatedWithRun(user, runId)) {
      throw new AccessDeniedException("Not allowed to get notebook items in group");
    }
    return vleService.getNotebookItemsByGroup(runId.intValue(), group);
  }

  @ResponseBody
  @PostMapping("/{runId}/parent/{parentNotebookItemId}")
  protected NotebookItem copyNotebookItem(
      @PathVariable Long runId,
      @PathVariable Integer parentNotebookItemId,
      @RequestParam(value = "workgroupId", required = true) Long workgroupId,
      @RequestParam(value = "clientSaveTime", required = true) String clientSaveTime,
      Authentication auth) throws ObjectNotFoundException, AccessDeniedException {
    if (!isUserInRunAndWorkgroup(auth, runId, workgroupId)) {
      throw new AccessDeniedException("Not allowed to copy notebook items");
    }
    return vleService.copyNotebookItem(workgroupId.intValue(), parentNotebookItemId,
        clientSaveTime);
  }

  private boolean isUserAssociatedWithRun(User user, Long runId) throws ObjectNotFoundException {
    Run run = runService.retrieveById(runId);
    if (user.isStudent() && run.isStudentAssociatedToThisRun(user)) {
      return true;
    } else if (user.isTeacher() && run.isTeacherAssociatedToThisRun(user)) {
      return true;
    }
    return false;
  }

  private boolean isUserInRunAndWorkgroup(Authentication auth, Long runId, Long workgroupId)
      throws ObjectNotFoundException {
    User signedInUser = userService.retrieveUserByUsername(auth.getName());
    Run run = runService.retrieveById(runId);
    Workgroup workgroup = workgroupService.retrieveById(workgroupId);
    return isUserAssociatedWithRun(signedInUser, runId) &&
        workgroupService.isUserInWorkgroupForRun(signedInUser, run, workgroup);
  }
}
