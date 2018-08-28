package org.wise.portal.presentation.web.controllers.user;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.dao.SystemWideSaltSource;
import org.springframework.security.authentication.encoding.Md5PasswordEncoder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.exception.NotAuthorizedException;
import org.wise.portal.service.user.UserService;

import java.util.Properties;

/**
 * Controller for User REST API
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

  @Autowired
  protected UserService userService;

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
    configJSON.put("googleClientId", wiseProperties.get("google.clientId"));
    configJSON.put("logOutURL", wiseProperties.get("wiseBaseURL") + "/logout");
    return configJSON.toString();
  }

  @ResponseBody
  @RequestMapping(value = "/password", method = RequestMethod.POST)
  protected String changePassword(@RequestParam("username") String username,
      @RequestParam("oldPassword") String oldPassword,
      @RequestParam("newPassword") String newPassword) throws NotAuthorizedException, JSONException {
    User user = ControllerUtil.getSignedInUser();
    if (user.getUserDetails().getUsername().equals(username)) {
      User result = userService.updateUserPassword(user, oldPassword, newPassword);
      if (result != null) {
        return "success";
      } else {
        return "error";
      }
    } else {
      throw new NotAuthorizedException("username is not the same as signed in user");
    }
  }
}
