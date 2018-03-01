package org.wise.portal.presentation.web.controllers.user;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.method.P;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.wise.portal.domain.announcement.Announcement;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.StudentRunInfo;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.student.StudentService;

import org.json.JSONObject;
import org.json.JSONArray;

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
}
