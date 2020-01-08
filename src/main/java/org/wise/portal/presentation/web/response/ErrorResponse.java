package org.wise.portal.presentation.web.response;

import java.util.HashMap;

import org.json.JSONException;
import org.json.JSONObject;

public class ErrorResponse {

  String errorCode;

  public ErrorResponse(String errorCode) {
    this.errorCode = errorCode;
  }

  public String toJSONString() throws JSONException {
    JSONObject response = new JSONObject();
    response.put("status", "error");
    response.put("messageCode", errorCode);
    return response.toString();
  }

  public HashMap<String, Object> toMap() {
    HashMap<String, Object> map = new HashMap<String, Object>();
    map.put("status", "error");
    map.put("messageCode", errorCode);
    return map;
  }
}
