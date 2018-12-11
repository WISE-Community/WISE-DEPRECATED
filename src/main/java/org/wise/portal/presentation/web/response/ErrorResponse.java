package org.wise.portal.presentation.web.response;

import org.json.JSONException;
import org.json.JSONObject;

public class ErrorResponse {
  String errorCode;

  public ErrorResponse(String errorCode) {
    this.errorCode = errorCode;
  }

  public String toString() {
    JSONObject response = new JSONObject();
    try {
      response.put("status", "error");
      response.put("messageCode", this.errorCode);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return response.toString();
  }
}
