package org.wise.portal.presentation.web.controllers.teacher.run;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;
import org.wise.vle.domain.WebSocketMessage;

@RestController
public class TeacherRunAPIController {

  @MessageMapping("/pause/{runId}/{periodId}")
  @SendTo("/topic/classroom/{runId}/{periodId}")
  public WebSocketMessage pausePeriod(@DestinationVariable Integer runId,
      @DestinationVariable Integer periodId) throws Exception {
    return new WebSocketMessage("pause", "RunId: " + runId + " PeriodId: " + periodId);
  }

  @MessageMapping("/unpause/{runId}/{periodId}")
  @SendTo("/topic/classroom/{runId}/{periodId}")
  public WebSocketMessage unpausePeriod(@DestinationVariable Integer runId,
      @DestinationVariable Integer periodId) throws Exception {
    return new WebSocketMessage("unpause", "RunId: " + runId + " PeriodId: " + periodId);
  }
}
