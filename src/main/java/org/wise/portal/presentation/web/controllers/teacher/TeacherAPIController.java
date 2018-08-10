package org.wise.portal.presentation.web.controllers.teacher;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.RunService;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

/**
 * Controller for Teacher REST API
 *
 * @author Jonathan Lim-Breitbart
 * @author Geoffrey Kwan
 * @author Hiroki Terashima
 */
@RestController
@RequestMapping("/site/api/teacher")
public class TeacherAPIController {

  @Autowired
  private Properties wiseProperties;

  @Autowired
  private ProjectService projectService;

  @Autowired
  private RunService runService;

  @RequestMapping(value = "/config", method = RequestMethod.GET)
  protected String getConfig(ModelMap modelMap) throws JSONException {
    JSONObject configJSON = new JSONObject();
    configJSON.put("logOutURL", wiseProperties.get("wiseBaseURL") + "/logout");
    return configJSON.toString();
  }

  @RequestMapping(value = "/projects", method = RequestMethod.GET)
  protected String getProjects(ModelMap modelMap) throws JSONException {
    User user = ControllerUtil.getSignedInUser();
    List<Run> runs = runService.getRunListByOwner(user);
    HashMap<Long, Run> runMap = new HashMap<>();
    for (Run run : runs) {
      runMap.put((Long) run.getProject().getId(), run);
    }
    List<Project> projects = projectService.getProjectList(user);
    JSONArray projectsArray = new JSONArray();
    for (Project project : projects) {
      Run projectRun = runMap.get(project.getId());
      projectsArray.put(getProjectJSON(project, projectRun));
    }
    return projectsArray.toString();
  }

  private JSONObject getProjectJSON(Project project, Run projectRun) throws JSONException {
    JSONObject projectJSON = new JSONObject();
    projectJSON.put("id", project.getId());
    projectJSON.put("name", project.getName());
    projectJSON.put("dateCreated", project.getDateCreated());
    projectJSON.put("dateArchived", project.getDateDeleted());
    projectJSON.put("thumbIconPath", getProjectThumbIconPath(project));
    if (projectRun != null) {
      JSONObject runJSON = new JSONObject();
      runJSON.put("id", projectRun.getId());
      runJSON.put("name", projectRun.getName());
      runJSON.put("runCode", projectRun.getRuncode());
      runJSON.put("startTime", projectRun.getStarttime());
      runJSON.put("endTime", projectRun.getEndtime());
      runJSON.put("numStudents", getNumStudentsInRun(projectRun));
      runJSON.put("teacherFirstName", projectRun.getOwner().getUserDetails().getFirstname());
      runJSON.put("teacherLastName", projectRun.getOwner().getUserDetails().getLastname());
      runJSON.put("teacherDisplayName",
        ((TeacherUserDetails) projectRun.getOwner().getUserDetails()).getDisplayname());
      projectJSON.put("run", runJSON);
    }
    return projectJSON;
  }

  private String getProjectThumbIconPath(Project project) {
    String modulePath = project.getModulePath();
    int lastIndexOfSlash = modulePath.lastIndexOf("/");
    if (lastIndexOfSlash != -1) {
      String curriculumBaseWWW = wiseProperties.getProperty("curriculum_base_www");
      return curriculumBaseWWW + modulePath.substring(0, lastIndexOfSlash) + "/assets/project_thumb.png";
    }
    return "";
  }

  private int getNumStudentsInRun(Run projectRun) {
    Set<Group> periods = projectRun.getPeriods();
    int numStudents = 0;
    for (Group period : periods) {
      Set<User> members = period.getMembers();
      numStudents += members.size();
    }
    return numStudents;
  }

  @RequestMapping(value = "/run/create", method = RequestMethod.POST)
  protected String createRun(HttpServletRequest request,
                             @RequestParam("projectId") String projectId,
                             @RequestParam("periods") String periods,
                             @RequestParam("studentsPerTeam") String studentsPerTeam,
                             @RequestParam("startDate") String startDate) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    Locale locale = request.getLocale();
    Set<String> periodNames = createPeriodNamesSet(periods);
    Run run = runService.createRun(Integer.parseInt(projectId), user, periodNames, Integer.parseInt(studentsPerTeam),
        Long.parseLong(startDate), locale);
    JSONObject createRunResponse = generateCreateRunResponse(run);
    return createRunResponse.toString();
  }

  Set<String> createPeriodNamesSet(String periodsString) {
    Set<String> periods = new TreeSet<String>();
    String[] periodsSplit = periodsString.split(",");
    for (String period : periodsSplit) {
      periods.add(period.trim());
    }
    return periods;
  }

  JSONArray createPeriodNamesArray(Set<Group> periods) {
    JSONArray periodsArray = new JSONArray();
    for (Group period : periods) {
      periodsArray.put(period.getName());
    }
    return periodsArray;
  }

  JSONObject generateCreateRunResponse(Run run) throws Exception {
    JSONObject runJSON = new JSONObject();
    runJSON.put("runId", run.getId());
    runJSON.put("projectId", run.getProject().getId());
    runJSON.put("runCode", run.getRuncode());
    runJSON.put("runName", run.getName());
    runJSON.put("periods", createPeriodNamesArray(run.getPeriods()));
    runJSON.put("startTime", run.getStarttime().getTime());
    runJSON.put("maxWorkgroupSize", run.getMaxWorkgroupSize());
    return runJSON;
  }
}
