package org.wise.portal.presentation.web.controllers.run;

import org.hibernate.StaleObjectStateException;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate5.HibernateOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.PeriodNotFoundException;
import org.wise.portal.domain.StudentUserAlreadyAssociatedWithRunException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.project.impl.Projectcode;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.student.StudentService;

import java.util.Set;

/**
 * Controller for Student REST API
 *
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */
@RestController
@RequestMapping("/site/api/run")
public class RunAPIController {

  @Autowired
  private RunService runService;

  @Autowired
  private StudentService studentService;

  /**
   * Get the run information to display to the student when they want to register for a run.
   * @param runCode The run code string.
   * @return A JSON object string containing information about the run such as the id, run code, title,
   * teacher name, and periods.
   */
  @RequestMapping(value = "/register/info", method = RequestMethod.GET)
  protected String getRunRegisterInfo(@RequestParam("runCode") String runCode) {
    JSONObject runRegisterInfo = new JSONObject();
    boolean foundRun = false;
    try {
      Run run = runService.retrieveRunByRuncode(runCode);
      setRunInformationForStudent(runRegisterInfo, run);
      runRegisterInfo.put("periods", this.getPeriods(run));
      foundRun = true;
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    } catch (JSONException e) {
      e.printStackTrace();
    }
    if (!foundRun) {
      try {
        runRegisterInfo.put("error", "runNotFound");
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return runRegisterInfo.toString();
  }

  /**
   * Add a student to a run.
   * @param runCode The run code string.
   * @param period The period string.
   * @return If the student is successfully added to the run, we will return a JSON object string
   * that contains the information about the run. If the student is not successfully added to the
   * run, we will return a JSON object string containing an error field with an error string.
   */
  @RequestMapping(value = "/add/student", method = RequestMethod.POST)
  protected String addStudentToRun(@RequestParam("runCode") String runCode, @RequestParam("period") String period) {
    JSONObject responseJSONObject = new JSONObject();
    String error = "";
    User user = ControllerUtil.getSignedInUser();
    Projectcode projectCode = new Projectcode(runCode, period);
    boolean addedStudent = false;
    try {
      int maxLoop = 100; // To ensure that the following while loop gets run at most this many times.
      int currentLoopIndex = 0;
      while (currentLoopIndex < maxLoop) {
        try {
          studentService.addStudentToRun(user, projectCode);
          Run run = runService.retrieveRunByRuncode(runCode);
          setRunInformationForStudent(responseJSONObject, run);
          responseJSONObject.put("period", period);
          addedStudent = true;
        } catch (HibernateOptimisticLockingFailureException holfe) {
          /*
           * Multiple students tried to create an account at the same time, resulting in this exception.
           * We will try saving again.
           */
          currentLoopIndex++;
          continue;
        } catch (StaleObjectStateException sose) {
          /*
           * Multiple students tried to create an account at the same time, resulting in this exception.
           * We will try saving again.
           */
          currentLoopIndex++;
          continue;
        } catch (JSONException je) {
          je.printStackTrace();
        }
        /*
         * If it reaches here, it means the hibernate optimistic locking exception was not thrown so we
         * can exit the loop.
         */
        break;
      }
    } catch (ObjectNotFoundException e) {
      error = "runCodeNotFound";
    } catch (PeriodNotFoundException e) {
      error = "periodNotFound";
    } catch (StudentUserAlreadyAssociatedWithRunException se) {
      error = "studentAlreadyAssociatedWithRun";
    }

    if (!error.equals("")) {
      // there was an error and we were unable to add the student to the run
      try {
        responseJSONObject.put("error", error);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    } else if (!addedStudent) {
      /*
       * there were no errors but we were unable to add the student to the
       * run for some reason so we will just return a generic error message
       */
      try {
        responseJSONObject.put("error", "failedToAddStudentToRun");
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return responseJSONObject.toString();
  }

  /**
   * Get the run information as a JSON object. We will only get the information that the student
   * needs.
   * @param responseJSONObject A JSON object to populate the values into.
   * @param run The run object.
   * @return The passed in JSON object populated with the information about the run.
   */
  private JSONObject setRunInformationForStudent(JSONObject responseJSONObject, Run run) {
    try {
      responseJSONObject.put("runTitle", run.getName());
      responseJSONObject.put("runId", run.getId());
      responseJSONObject.put("runCode", run.getRuncode());
      responseJSONObject.put("teacherName", getTeacherNameFromRun(run));
      responseJSONObject.put("startTime", run.getStarttime());
      responseJSONObject.put("endTime", run.getEndtime());
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return responseJSONObject;
  }

  /**
   * Get the periods in a run.
   * @param run The run object.
   * @return A JSON array containing strings.
   */
  private JSONArray getPeriods(Run run) {
    JSONArray periodsJSONArray = new JSONArray();
    Set<Group> periods = run.getPeriods();
    for (Group period : periods) {
      periodsJSONArray.put(period.getName());
    }
    return periodsJSONArray;
  }

  /**
   * Get the name of the teacher that owns the run.
   * @param run The run object.
   * @return A string containing the first name and last name of the teacher that owns the run.
   */
  private String getTeacherNameFromRun(Run run) {
    User owner = run.getOwner();
    MutableUserDetails userDetails = owner.getUserDetails();
    String firstName = userDetails.getFirstname();
    String lastName = userDetails.getLastname();
    return firstName + " " + lastName;
  }
}
