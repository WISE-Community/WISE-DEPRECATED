package org.wise.portal.presentation.web.controllers.teacher.run;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;
import org.wise.vle.domain.WebSocketMessage;
import org.wise.vle.domain.HelloMessage;

@RestController
public class TeacherRunAPIController {

  @MessageMapping("/pause/{runId}/{periodId}")
  @SendTo("/topic/classroom/{runId}/{periodId}")
  public WebSocketMessage pausePeriod(HelloMessage message,
      @DestinationVariable Integer runId,
      @DestinationVariable Integer periodId) throws Exception {
    return new WebSocketMessage("pause", HtmlUtils.htmlEscape(message.getName()) + "! runId: " + runId + " periodId: " + periodId);
  }

  @MessageMapping("/unpause/{runId}/{periodId}")
  @SendTo("/topic/classroom/{runId}/{periodId}")
  public WebSocketMessage unpausePeriod(HelloMessage message,
      @DestinationVariable Integer runId,
      @DestinationVariable Integer periodId) throws Exception {
    return new WebSocketMessage("unpause", HtmlUtils.htmlEscape(message.getName()) + "! runId: " + runId + " periodId: " + periodId);
  }


  /*
  @MessageMapping("/messages/{runId}/{periodId}")
  @SendTo("/topic/student/{runId}/{periodId}")
  public void studentLoggedIn(StudentLoggedIn studentLoggedIn) {

  }

  @MessageMapping("/run/{runId}")
  public void studentWork(StudentWork studentWork) {

  }
  */

}
