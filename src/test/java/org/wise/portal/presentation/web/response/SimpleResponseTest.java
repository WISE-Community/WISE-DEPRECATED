package org.wise.portal.presentation.web.response;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.HashMap;

import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Test;

public class SimpleResponseTest {

  @Test
  public void createSimpleResponse_shouldSetFields() {
    SimpleResponse simpleResponse = new SimpleResponse("success", "projectSaved");
    assertEquals("success", simpleResponse.getStatus());
    assertEquals("projectSaved", simpleResponse.getMessageCode());
  }

  @Test
  public void toJSONObject_shouldReturnJSONObjectWithPopulatedFields() {
    SimpleResponse simpleResponse = new SimpleResponse("success", "projectSaved");
    try {
      JSONObject simpleResponseJSONObject = simpleResponse.toJSONObject();
      assertEquals("success", simpleResponseJSONObject.get("status"));
      assertEquals("projectSaved", simpleResponseJSONObject.get("messageCode"));
    } catch (JSONException e) {

    }
  }

  @Test
  public void toJSONString_shouldReturnJSONString() {
    SimpleResponse simpleResponse = new SimpleResponse("success", "projectSaved");
    try {
      String simpleResponseJSONObject = simpleResponse.toJSONString();
      assertEquals("{\"messageCode\":\"projectSaved\",\"status\":\"success\"}",
          simpleResponseJSONObject);
    } catch (JSONException e) {

    }
  }

  @Test
  public void toMap_shouldReturnMapWithPopulatedFields() {
    SimpleResponse simpleResponse = new SimpleResponse("success", "projectSaved");
    HashMap<String, Object> simpleResponseMap = simpleResponse.toMap();
    assertEquals("success", simpleResponseMap.get("status"));
    assertEquals("projectSaved", simpleResponseMap.get("messageCode"));
  }
}