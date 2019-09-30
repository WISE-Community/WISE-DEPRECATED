package org.wise.portal.presentation.web.response;

public class SimpleResponse {

  public String status;

  public String message;

  public SimpleResponse(String status, String message) {
    this.status = status;
    this.message = message;
  }
}
