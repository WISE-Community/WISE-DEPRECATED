package org.wise.portal.presentation.web.controllers.teacher.run;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.vle.wise5.VLEService;
import org.wise.portal.spring.data.redis.MessagePublisher;
import org.wise.vle.domain.status.StudentStatus;

@RestController
public class TeacherRunAPIController {

  @Autowired
  private MessagePublisher redisPublisher;

  @Autowired
  private UserService userService;

  @Autowired
  private RunService runService;

  @Autowired
  private VLEService vleService;

  /**
   * Handles GET requests from the teacher when a teacher requests for all the student statuses for
   * a given run id
   *
   * @param response
   * @throws ObjectNotFoundException
   * @throws IOException
   */
  @Secured({ "ROLE_TEACHER" })
  @GetMapping("/api/teacher/run/{runId}/student-status")
  public List<StudentStatus> getStudentStatus(Authentication auth, @PathVariable Long runId)
      throws ObjectNotFoundException {
    User user = userService.retrieveUserByUsername(auth.getName());
    Run run = runService.retrieveById(runId);
    if (run.isTeacherAssociatedToThisRun(user) || user.isAdmin()) {
      return vleService.getStudentStatusesByRunId(runId);
    }
    return new ArrayList<StudentStatus>();
  }

  @MessageMapping("/pause/{runId}/{periodId}")
  public void pausePeriod(@DestinationVariable Integer runId, @DestinationVariable Integer periodId)
      throws Exception {
    JSONObject message = new JSONObject();
    message.put("type", "pause");
    message.put("topic", String.format("/topic/classroom/%s/%s", runId, periodId));
    redisPublisher.publish(message.toString());
  }

  @MessageMapping("/unpause/{runId}/{periodId}")
  public void unpausePeriod(@DestinationVariable Integer runId,
      @DestinationVariable Integer periodId) throws Exception {
    JSONObject message = new JSONObject();
    message.put("type", "unpause");
    message.put("topic", String.format("/topic/classroom/%s/%s", runId, periodId));
    redisPublisher.publish(message.toString());
  }

  @MessageMapping("/api/teacher/run/{runId}/node-to-period/{periodId}")
  public void sendNodeToPeriod(Authentication auth,
      @DestinationVariable Long runId, @DestinationVariable Long periodId, @Payload String node)
      throws ObjectNotFoundException, JSONException {
    Run run = runService.retrieveById(runId);
    if (runService.hasReadPermission(auth, run)) {
      JSONObject msg = new JSONObject();
      msg.put("type", "node");
      msg.put("node", new JSONObject(node));
      msg.put("topic", String.format("/topic/classroom/%s/%s", runId, periodId));
      redisPublisher.publish(msg.toString());
    }
  }
}
