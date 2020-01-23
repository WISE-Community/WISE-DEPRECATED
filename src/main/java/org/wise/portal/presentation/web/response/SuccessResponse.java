package org.wise.portal.presentation.web.response;

public class SuccessResponse extends SimpleResponse {

  public SuccessResponse(String messageCode) {
    super("success", messageCode);
  }
}
