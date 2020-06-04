package org.wise.vle.web.wise5;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.vle.wise5.VLEService;
import org.wise.portal.service.workgroup.WorkgroupService;
import org.wise.portal.spring.data.redis.MessagePublisher;
import org.wise.vle.domain.notification.Notification;

/**
 * Controller for handling GET and POST of WISE5 Notifications
 * @author Hiroki Terashima
 */
@Controller
public class NotificationController {

  @Autowired
  private VLEService vleService;

  @Autowired
  private RunService runService;

  @Autowired
  private UserService userService;

  @Autowired
  private WorkgroupService workgroupService;

  @Autowired
  private MessagePublisher redisPublisher;

  public void broadcastNotification(Notification notification) throws JSONException {
    notification.convertToClientNotification();
    JSONObject message = new JSONObject();
    message.put("type", "notification");
    message.put("topic", String.format("/topic/workgroup/%s", notification.getToWorkgroupId()));
    message.put("notification", notification.toJSON());
    redisPublisher.publish(message.toString());
  }

  @GetMapping("/notification/{runId}")
  @ResponseBody
  protected List<Notification> getNotifications(
      Authentication auth,
      @PathVariable Long runId,
      @RequestParam(value = "id", required = false) Integer id,
      @RequestParam(value = "periodId", required = false) Integer periodId,
      @RequestParam(value = "toWorkgroupId", required = false) Long toWorkgroupId,
      @RequestParam(value = "groupId", required = false) String groupId,
      @RequestParam(value = "nodeId", required = false) String nodeId,
      @RequestParam(value = "componentId", required = false) String componentId)
      throws ObjectNotFoundException {
    User user = userService.retrieveUserByUsername(auth.getName());
    Run run = runService.retrieveById(new Long(runId));
    if (toWorkgroupId != null) {
      Workgroup workgroup = workgroupService.retrieveById(new Long(toWorkgroupId));
      if (user.getUserDetails() instanceof StudentUserDetails &&
        (!run.isStudentAssociatedToThisRun(user) ||
          !workgroup.getMembers().contains(user))) {
        return new ArrayList<Notification>();
      }
    } else if (!user.isAdmin() && !runService.hasRunPermission(run, user, BasePermission.READ)) {
      return new ArrayList<Notification>();
    }
    return vleService.getNotifications(id, runId, periodId,
        toWorkgroupId, groupId, nodeId, componentId);
  }

  @RequestMapping(method = RequestMethod.POST, value = "/notification/{runId}")
  protected void saveNotification(
      @PathVariable Integer runId,
      @RequestParam(value = "notificationId", required = false) Integer notificationId,
      @RequestParam(value = "periodId", required = true) Integer periodId,
      @RequestParam(value = "fromWorkgroupId", required = false) Integer fromWorkgroupId,
      @RequestParam(value = "toWorkgroupId", required = false) Integer toWorkgroupId,
      @RequestParam(value = "groupId", required = false) String groupId,
      @RequestParam(value = "nodeId", required = false) String nodeId,
      @RequestParam(value = "componentId", required = false) String componentId,
      @RequestParam(value = "componentType", required = false) String componentType,
      @RequestParam(value = "type", required = false) String type,
      @RequestParam(value = "message", required = false) String message,
      @RequestParam(value = "data", required = false) String data,
      @RequestParam(value = "timeGenerated", required = true) String timeGenerated,
      @RequestParam(value = "timeDismissed", required = false) String timeDismissed,
      HttpServletResponse response) throws Exception {
    User signedInUser = ControllerUtil.getSignedInUser();
    Run run = runService.retrieveById(new Long(runId));
    if (signedInUser.isAdmin() || runService.hasRunPermission(run, signedInUser, BasePermission.READ)) {
    } else if (notificationId != null) {
      Notification notification = vleService.getNotificationById(notificationId);
      if (notification == null ||
        !notification.getToWorkgroup().getMembers().contains(signedInUser)) {
        return;
      }
    } else if (fromWorkgroupId != null) {
      Workgroup fromWorkgroup = workgroupService.retrieveById(new Long(fromWorkgroupId));
      if (signedInUser.getUserDetails() instanceof StudentUserDetails &&
        (!run.isStudentAssociatedToThisRun(signedInUser) ||
          !fromWorkgroup.getMembers().contains(signedInUser))) {
        return;
      }
    } else if (toWorkgroupId != null) {
      if (fromWorkgroupId == null) {
        if ("CRaterResult".equals(type)) {
        } else {
          return;
        }
      } else {
        Workgroup fromWorkgroup = workgroupService.retrieveById(new Long(fromWorkgroupId));
        if (signedInUser.getUserDetails() instanceof StudentUserDetails &&
          (!run.isStudentAssociatedToThisRun(signedInUser) ||
            !fromWorkgroup.getMembers().contains(signedInUser))) {
          return;
        }
      }
    }
    Notification notification = vleService.saveNotification(
        notificationId,
        runId,
        periodId,
        fromWorkgroupId,
        toWorkgroupId,
        groupId,
        nodeId,
        componentId,
        componentType,
        type,
        message,
        data,
        timeGenerated,
        timeDismissed);
    response.getWriter().write(notification.toJSON().toString());
    broadcastNotification(notification);
  }

  @RequestMapping(method = RequestMethod.POST, value = "/notification/{runId}/dismiss")
  protected void dismissNotification(
      @PathVariable Integer runId,
      @RequestParam(value = "notificationId", required = true) Integer notificationId,
      @RequestParam(value = "periodId", required = false) Integer periodId,
      @RequestParam(value = "type", required = true) String type,
      @RequestParam(value = "fromWorkgroupId", required = false) Integer fromWorkgroupId,
      @RequestParam(value = "toWorkgroupId", required = false) Integer toWorkgroupId,
      @RequestParam(value = "groupId", required = false) String groupId,
      @RequestParam(value = "timeDismissed", required = false) String timeDismissed,
      HttpServletResponse response) throws IOException, ObjectNotFoundException, JSONException {
    User signedInUser = ControllerUtil.getSignedInUser();
    Notification notification = vleService.getNotificationById(notificationId);
    Run run = runService.retrieveById(new Long(runId));
    if (canDismissNotification(signedInUser, notification, run)) {
      notification = vleService.dismissNotification(notification, timeDismissed);
      if (groupId != null && "CRaterResult".equals(type)) {
        List<Notification> notificationsInGroup = vleService.getNotificationsByGroupId(groupId);
        for (Notification notificationInGroup : notificationsInGroup) {
          if (notificationInGroup.getId().equals(notification.getId())) {
            continue;
          }
          vleService.dismissNotification(notificationInGroup, timeDismissed);
          broadcastNotification(notificationInGroup);
        }
      }
      response.getWriter().write(notification.toJSON().toString());
    }
  }

  private boolean canDismissNotification(User signedInUser, Notification notification, Run run) {
    return signedInUser.isAdmin() ||
        runService.hasRunPermission(run, signedInUser, BasePermission.READ) ||
        notification.getToWorkgroup().getMembers().contains(signedInUser);
  }
}
