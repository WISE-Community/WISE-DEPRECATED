package org.wise.portal.presentation.web.response;

import lombok.Getter;

@Getter
public class SimpleResponse {

  private String status;

  private String message;

  public SimpleResponse(String status, String message) {
    this.status = status;
    this.message = message;
  }
}
