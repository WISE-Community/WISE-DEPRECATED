package org.wise.portal.presentation.web.controllers.user;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;

import java.util.Properties;

/**
 * Controller for Student REST API
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
@RestController
@RequestMapping("/site/api/user")
public class UserAPIController {

  @Autowired
  private Properties wiseProperties;

  @RequestMapping(value = "/user", method = RequestMethod.GET)
  protected String handleGET(ModelMap modelMap,
      @RequestParam(value = "pLT", required = false) String previousLoginTime) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    if (user != null) {
      MutableUserDetails userDetails = user.getUserDetails();

      Boolean isStudent = false;
      Boolean isAdmin = false;
      Boolean isResearcher = false;
      Boolean isTeacher = false;
      for (GrantedAuthority authority : userDetails.getAuthorities()) {
        if (authority.getAuthority().equals("ROLE_STUDENT")) {
          isStudent = true;
          break;
        } else if (authority.getAuthority().equals("ROLE_ADMINISTRATOR")) {
          isAdmin = true;
          break;
        } else if (authority.getAuthority().equals("ROLE_RESEARCHER")) {
          isResearcher = true;
        } else if (authority.getAuthority().equals("ROLE_TEACHER")) {
          isTeacher = true;
        }
      }

      JSONObject userJSON = new JSONObject();
      userJSON.put("id", user.getId());
      userJSON.put("firstName", userDetails.getFirstname());
      userJSON.put("lastName", userDetails.getLastname());
      userJSON.put("userName", userDetails.getUsername());

      if (isStudent) {
        userJSON.put("role", "student");
      } else if (isAdmin) {
        userJSON.put("role", "admin");
      } else if (isResearcher) {
        userJSON.put("role", "researcher");
      } else if (isTeacher) {
        userJSON.put("role", "teacher");
      }
      return userJSON.toString();
    } else {
      JSONObject userJSON = new JSONObject();
      return userJSON.toString();
    }
  }

  @RequestMapping(value = "/config", method = RequestMethod.GET)
  protected String getConfig(ModelMap modelMap) throws JSONException {
    JSONObject configJSON = new JSONObject();
    configJSON.put("logOutURL", wiseProperties.get("wiseBaseURL") + "/logout");
    return configJSON.toString();
  }
}
