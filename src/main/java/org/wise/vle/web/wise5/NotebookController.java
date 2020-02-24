package org.wise.vle.web.wise5;

import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.vle.wise5.VLEService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.vle.domain.work.NotebookItem;
import org.wise.vle.domain.work.NotebookItemAlreadyInGroupException;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

/**
 * Controller for handling GET and POST of WISE Notebooks and Notebook Items
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
@Controller
@RequestMapping(value = {"/student/notebook", "/teacher/notebook"})
public class NotebookController {

  @Autowired
  private VLEService vleService;

  @Autowired
  private RunService runService;

  @Autowired
  private WorkgroupService workgroupService;

  @GetMapping("/{runId}")
  protected void getNotebookItemsForTeacher(
      @PathVariable Integer runId,
      @RequestParam(value = "id", required = false) Integer id,
      @RequestParam(value = "periodId", required = false) Integer periodId,
      @RequestParam(value = "workgroupId", required = false) Integer workgroupId,
      @RequestParam(value = "nodeId", required = false) String nodeId,
      @RequestParam(value = "componentId", required = false) String componentId,
      HttpServletResponse response) throws IOException {
    User signedInUser = ControllerUtil.getSignedInUser();
    if (!signedInUser.isAdmin() && !isUserAssociatedWithRun(signedInUser, runId)) {
      response.sendError(400);
      return;
    }
    JSONArray notebookItems =
      getNotebookItems(runId, id, periodId, workgroupId, nodeId, componentId, response);
    response.getWriter().write(notebookItems.toString());
  }

  @PostMapping("/{runId}")
  protected void saveNotebookItem(
      @PathVariable Integer runId,
      @RequestParam(value = "periodId", required = false) Integer periodId,
      @RequestParam(value = "workgroupId", required = true) Integer workgroupId,
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
      HttpServletResponse response) throws IOException, ObjectNotFoundException {
    if (!isUserInRunAndWorkgroup(runId, workgroupId)) {
      return;
    }
    NotebookItem notebookItem = vleService.saveNotebookItem(
      notebookItemId,
      runId,
      periodId,
      workgroupId,
      nodeId,
      componentId,
      studentWorkId,
      studentAssetId,
      localNotebookItemId,
      type,
      title,
      content,
      groups,
      clientSaveTime,
      clientDeleteTime
    );
    response.getWriter().write(notebookItem.toJSON().toString());
  }

  @RequestMapping(method = RequestMethod.POST, value = "/{runId}/group/{group}")
  protected void addNotebookItemToGroup(
      @PathVariable Integer runId,
      @PathVariable String group,
      @RequestParam(value = "workgroupId", required = true) Integer workgroupId,
      @RequestParam(value = "notebookItemId", required = true) Integer notebookItemId,
      @RequestParam(value = "clientSaveTime", required = true) String clientSaveTime,
      HttpServletResponse response) throws IOException, ObjectNotFoundException {
    if (!isUserInRunAndWorkgroup(runId, workgroupId)) {
      return;
    }
    try {
      NotebookItem notebookItem = vleService.addNotebookItemToGroup(notebookItemId, group, clientSaveTime);
      response.getWriter().write(notebookItem.toJSON().toString());
    } catch (NotebookItemAlreadyInGroupException e) {
      response.sendError(406, e.getMessage());
    }
  }

  @RequestMapping(method = RequestMethod.DELETE, value = "/{runId}/group/{group}")
  protected void removeNotebookItemFromGroup(
      @PathVariable Integer runId,
      @PathVariable String group,
      @RequestParam(value = "workgroupId", required = true) Integer workgroupId,
      @RequestParam(value = "notebookItemId", required = true) Integer notebookItemId,
      @RequestParam(value = "clientSaveTime", required = true) String clientSaveTime,
      HttpServletResponse response) throws ObjectNotFoundException, IOException {
    if (!isUserInRunAndWorkgroup(runId, workgroupId)) {
      return;
    }
    NotebookItem notebookItem = vleService.removeNotebookItemFromGroup(
      notebookItemId, group, clientSaveTime);
    response.getWriter().write(notebookItem.toJSON().toString());
  }

  @RequestMapping(method = RequestMethod.GET, value = "/{runId}/{workgroupId}")
  protected void getNotebookItemsForStudent(
      @PathVariable Integer runId,
      @PathVariable Integer workgroupId,
      @RequestParam(value = "id", required = false) Integer id,
      @RequestParam(value = "periodId", required = false) Integer periodId,
      @RequestParam(value = "nodeId", required = false) String nodeId,
      @RequestParam(value = "componentId", required = false) String componentId,
      HttpServletResponse response) throws IOException {
    try {
      if (!isUserInRunAndWorkgroup(runId, workgroupId)) {
        return;
      }
      JSONArray notebookItems =
        getNotebookItems(runId, id, periodId, workgroupId, nodeId, componentId, response);
      response.getWriter().write(notebookItems.toString());
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
      response.sendError(400);
    }
  }

  @RequestMapping(method = RequestMethod.GET, value = "/{runId}/group/{group}")
  protected void getNotebookItemsInGroup(
      @PathVariable Integer runId,
      @PathVariable String group,
      @RequestParam(value = "periodId", required = false) Integer periodId,
      HttpServletResponse response) throws IOException {
    User signedInUser = ControllerUtil.getSignedInUser();
    if (!isUserAssociatedWithRun(signedInUser, runId)) {
      return;
    }
    Integer id = null;
    String nodeId = null;
    String componentId = null;
    List<NotebookItem> notebookItemsByGroup = vleService.getNotebookItemsByGroup(runId, group);
    JSONArray notebookItems = new JSONArray();
    for (NotebookItem notebookItem : notebookItemsByGroup) {
      notebookItems.put(notebookItem.toJSON());
    }
    response.getWriter().write(notebookItems.toString());
  }

  @RequestMapping(method = RequestMethod.POST, value = "/{runId}/parent/{parentNotebookItemId}")
  protected void copyNotebookItem(
      @PathVariable Integer runId,
      @PathVariable Integer parentNotebookItemId,
      @RequestParam(value = "workgroupId", required = true) Integer workgroupId,
      @RequestParam(value = "clientSaveTime", required = true) String clientSaveTime,
      HttpServletResponse response) throws IOException, ObjectNotFoundException {
    if (!isUserInRunAndWorkgroup(runId, workgroupId)) {
      return;
    }
    NotebookItem notebookItem =
      vleService.copyNotebookItem(workgroupId, parentNotebookItemId, clientSaveTime);
    response.getWriter().write(notebookItem.toJSON().toString());
  }

  private JSONArray getNotebookItems(
      Integer runId,
      Integer id,
      Integer periodId,
      Integer workgroupId,
      String nodeId,
      String componentId,
      HttpServletResponse response) throws IOException {
    List<NotebookItem> notebookItemList = vleService.getNotebookItems(
      id, runId, periodId, workgroupId, nodeId, componentId);
    JSONArray notebookItems = new JSONArray();
    for (NotebookItem notebookItem : notebookItemList) {
      notebookItems.put(notebookItem.toJSON());
    }
    return notebookItems;
  }

  private boolean isUserAssociatedWithRun(User user, Integer runId) {
    try {
      Run run = runService.retrieveById(new Long(runId));
      if (user.isStudent()) {
        if (run.isStudentAssociatedToThisRun(user)) {
          return true;
        }
      } else if (user.isTeacher()) {
        if (run.isTeacherAssociatedToThisRun(user)) {
          return true;
        }
      }
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }
    return false;
  }

  private boolean isUserInWorkgroup(User user, Run run, Workgroup workgroup) {
    return workgroupService.isUserInWorkgroupForRun(user, run, workgroup);
  }

  private boolean isUserInRunAndWorkgroup(Integer runId, Integer workgroupId)
    throws ObjectNotFoundException {
    User signedInUser = ControllerUtil.getSignedInUser();
    Run run = runService.retrieveById(new Long(runId));
    Workgroup workgroup = workgroupService.retrieveById(new Long(workgroupId));
    if (isUserAssociatedWithRun(signedInUser, runId) &&
      workgroupService.isUserInWorkgroupForRun(signedInUser, run, workgroup)) {
      return true;
    }
    return false;
  }
}
