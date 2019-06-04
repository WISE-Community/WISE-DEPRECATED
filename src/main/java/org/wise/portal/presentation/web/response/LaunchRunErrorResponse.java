package org.wise.portal.presentation.web.response;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;

public class LaunchRunErrorResponse extends ErrorResponse {
  Workgroup workgroup;
  public LaunchRunErrorResponse(String errorCode, Workgroup workgroup) {
    super(errorCode);
    this.workgroup = workgroup;
  }

  public String toString() {
    JSONObject response = new JSONObject();
    try {
      response.put("status", "error");
      response.put("messageCode", this.errorCode);
      JSONArray workgroupMembers = new JSONArray();
      for (User member: this.workgroup.getMembers()) {
        JSONObject memberInfo = new JSONObject();
        memberInfo.put("id", member.getId());
        memberInfo.put("username", member.getUserDetails().getUsername());
        memberInfo.put("firstName", member.getUserDetails().getFirstname());
        memberInfo.put("lastName", member.getUserDetails().getLastname());
        memberInfo.put("isGoogleUser", member.getUserDetails().isGoogleUser());
        workgroupMembers.put(memberInfo);
      }
      response.put("workgroupMembers", workgroupMembers);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return response.toString();
  }
}
