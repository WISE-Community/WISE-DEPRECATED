package org.wise.portal.presentation.web.response;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.Test;

public class ErrorResponseTest {

  @Test
  public void createErrorResponse_shouldSetFields() {
    ErrorResponse simpleResponse = new ErrorResponse("errorSavingProject");
    assertEquals("error", simpleResponse.getStatus());
    assertEquals("errorSavingProject", simpleResponse.getMessageCode());
  }
}