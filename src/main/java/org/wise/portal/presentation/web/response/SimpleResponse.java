package org.wise.portal.presentation.web.response;

import java.util.HashMap;

import org.json.JSONException;
import org.json.JSONObject;

import lombok.Getter;

@Getter
public class SimpleResponse {

  private String status;
  private String messageCode;

  public SimpleResponse() {
    this.status = "";
    this.messageCode = "";
  }

  public SimpleResponse(String status, String messageCode) {
    this.status = status;
    this.messageCode = messageCode;
  }

  public JSONObject toJSONObject() throws JSONException {
    JSONObject response = new JSONObject();
    response.put("status", status);
    response.put("messageCode", messageCode);
    return response;
  }

  public String toJSONString() throws JSONException {
    return toJSONObject().toString();
  }

  public HashMap<String, Object> toMap() {
    HashMap<String, Object> map = new HashMap<String, Object>();
    map.put("status", status);
    map.put("messageCode", messageCode);
    return map;
  }
}
