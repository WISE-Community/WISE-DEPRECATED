package org.wise.portal.presentation.web.response;

public class ErrorResponse extends SimpleResponse {

  public ErrorResponse(String messageCode) {
    super("error", messageCode);
  }
}
