package org.wise.portal.presentation.web.response;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.Test;

public class SuccessResponseTest {

  @Test
  public void createSuccessResponse_shouldSetFields() {
    SuccessResponse simpleResponse = new SuccessResponse("projectSaved");
    assertEquals("success", simpleResponse.getStatus());
    assertEquals("projectSaved", simpleResponse.getMessageCode());
  }
}