package org.wise.portal.presentation.web.controllers.teacher.run;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;
import org.wise.vle.domain.Greeting;
import org.wise.vle.domain.HelloMessage;

@RestController
public class TeacherRunAPIController {

  @MessageMapping("/pause/{runId}/{periodId}")
  @SendTo("/topic/pause/{runId}/{periodId}")
  public Greeting pausePeriod(HelloMessage message,
      @DestinationVariable Integer runId,
      @DestinationVariable Integer periodId) throws Exception {
    return new Greeting("Pause, " + HtmlUtils.htmlEscape(message.getName()) + "! runId: " + runId + " periodId: " + periodId);
  }

  @MessageMapping("/unpause/{runId}/{periodId}")
  @SendTo("/topic/unpause/{runId}/{periodId}")
  public Greeting unpausePeriod(HelloMessage message,
      @DestinationVariable Integer runId,
      @DestinationVariable Integer periodId) throws Exception {
    return new Greeting("Unpause, " + HtmlUtils.htmlEscape(message.getName()) + "! runId: " + runId + " periodId: " + periodId);
  }


}
