package org.wise.portal.presentation.web.controllers.student;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;
import org.wise.vle.domain.work.StudentWork;

@RestController
public class StudentRunAPIController {

  @MessageMapping("/student-work/{runId}/{periodId}")
  @SendTo("/topic/student-work/{runId}/{periodId}")
  public StudentWork broadcastStudentWork(StudentWork studentWork,
      @DestinationVariable Integer runId,
      @DestinationVariable Integer periodId) throws Exception {
    return studentWork;
  }
}
