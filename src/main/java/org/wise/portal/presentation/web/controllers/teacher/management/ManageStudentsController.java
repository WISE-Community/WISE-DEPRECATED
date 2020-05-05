/**
 * Copyright (c) 2007-2017 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.presentation.web.controllers.teacher.management;

import java.text.DateFormat;
import java.util.*;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.support.SessionStatus;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.impl.ChangePeriodParameters;
import org.wise.portal.domain.impl.ChangeWorkgroupParameters;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.Projectcode;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.teacher.management.ViewMyStudentsPeriod;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.validators.teacher.ChangePeriodParametersValidator;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.group.GroupService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.student.StudentService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WorkgroupService;

/**
 * Controller for managing students in the run, like displaying students,
 * exporting student names, and updating workgroup memberships
 *
 * @author Patrick Lawler
 * @author Hiroki Terashima
 */
@Controller
@SessionAttributes("changePeriodParameters")
public class ManageStudentsController {

  @Autowired
  private RunService runService;

  @Autowired
  private WorkgroupService workgroupService;

  @Autowired
  private UserService userService;

  @Autowired
  private GroupService groupService;

  @Autowired
  private AclService<Run> aclService;

  @Autowired
  private StudentService studentService;

  @Autowired
  protected ChangePeriodParametersValidator changePeriodParametersValidator;

  /**
   * Handles request for viewing students in the specified run
   *
   * @param runId id of the Run
   * @param servletRequest HttpServletRequest
   * @return modelAndView containing information needed to view students
   * @throws Exception
   */
  @RequestMapping("/teacher/management/viewmystudents")
  protected ModelAndView viewMyStudents(@RequestParam("runId") Long runId,
      HttpServletRequest servletRequest) throws Exception {
    User user = ControllerUtil.getSignedInUser();
    Run run = runService.retrieveById(runId);
    if (userCanViewRun(user, run)) {
      List<Workgroup> allworkgroups = runService.getWorkgroups(runId);
      String workgroupsWithoutPeriod = "";
      Set<ViewMyStudentsPeriod> viewmystudentsallperiods = new TreeSet<ViewMyStudentsPeriod>();

      // retrieves the get parameter periodName to determine which
      // period the link is requesting
      String periodName = servletRequest.getParameter("periodName");

      int tabIndex = 0;
      int periodCounter = 0;

      for (Group period : run.getPeriods()) {
        ViewMyStudentsPeriod viewmystudentsperiod = new ViewMyStudentsPeriod();
        viewmystudentsperiod.setRun(run);
        viewmystudentsperiod.setPeriod(period);
        Set<Workgroup> periodworkgroups = new TreeSet<Workgroup>();
        Set<User> grouplessStudents = new HashSet<User>();
        grouplessStudents.addAll(period.getMembers());
        for (Workgroup workgroup : allworkgroups) {
          grouplessStudents.removeAll(workgroup.getMembers());
          try {
            // don't include workgroups with no members
            if (workgroup.getMembers().size() > 0
                && !workgroup.isTeacherWorkgroup()
                && workgroup.getPeriod().getId().equals(period.getId())) {
              periodworkgroups.add(workgroup);
            }
          } catch (NullPointerException npe) {
            // if a workgroup is not in a period, make a list of them and let teacher put them in a period...
            // this should not be the case if the code works correctly and associates workgroups with periods when workgroups are created.
            workgroupsWithoutPeriod += workgroup.getId().toString() + ",";
          }
        }
        viewmystudentsperiod.setGrouplessStudents(grouplessStudents);
        viewmystudentsperiod.setWorkgroups(periodworkgroups);
        viewmystudentsallperiods.add(viewmystudentsperiod);

        // determines which period tab to show in the AJAX tab object
        if (periodName != null && periodName.equals(period.getName())) {
          tabIndex = periodCounter;
        }
        periodCounter++;
      }

      if (servletRequest.getParameter("tabIndex") != null) {
        tabIndex = Integer.valueOf(servletRequest.getParameter("tabIndex"));
      }

      ModelAndView modelAndView = new ModelAndView();
      modelAndView.addObject("user", user);
      modelAndView.addObject("viewmystudentsallperiods", viewmystudentsallperiods);
      modelAndView.addObject("run", run);
      modelAndView.addObject("tabIndex", tabIndex);
      modelAndView.addObject("workgroupsWithoutPeriod", workgroupsWithoutPeriod);
      return modelAndView;
    } else {
      return new ModelAndView("errors/accessdenied");
    }
  }

  private boolean userCanViewRun(User user, Run run) {
    return user.isAdmin() ||
        user.getUserDetails().hasGrantedAuthority(UserDetailsService.RESEARCHER_ROLE) ||
        aclService.hasPermission(run, BasePermission.ADMINISTRATION, user) ||
        aclService.hasPermission(run, BasePermission.READ, user);
  }

  @GetMapping("/teacher/management/changestudentperiod")
  public String showChangePeriodForm(ModelMap model,
       @RequestParam("userId") Long userId,
       @RequestParam("runId") Long runId,
       @RequestParam("projectCode") String projectCode) throws Exception {
    ChangePeriodParameters params = new ChangePeriodParameters();
    params.setStudent(userService.retrieveById(userId));
    params.setRun(runService.retrieveById(runId));
    params.setProjectcode(projectCode);
    model.addAttribute("changePeriodParameters", params);
    return "teacher/management/changestudentperiod";
  }

  @PostMapping("/teacher/management/changestudentperiod")
  protected String changeStudentPeriod(
      @ModelAttribute("changePeriodParameters") ChangePeriodParameters params,
      BindingResult bindingResult) {
    changePeriodParametersValidator.validate(params, bindingResult);
    if (bindingResult.hasErrors()) {
      return "errors/accessdenied";
    } else {
      User user = ControllerUtil.getSignedInUser();
      if (runService.hasRunPermission(params.getRun(), user, BasePermission.WRITE) ||
          runService.hasRunPermission(params.getRun(), user, BasePermission.ADMINISTRATION)) {
        try {
          if (!params.getProjectcodeTo().equals(params.getProjectcode())) {
            studentService.removeStudentFromRun(params.getStudent(), params.getRun());
            studentService.addStudentToRun(params.getStudent(),
                new Projectcode(params.getRun().getRuncode(), params.getProjectcodeTo()));
          }
        } catch (Exception e) {
        }
        return "teacher/management/changestudentperiodsuccess";
      } else {
        return "errors/accessdenied";
      }
    }
  }

  /**
   * Get the students in the specified run and returns them in the model
   * @param runId id of the Run
   * @return modelAndView containing information needed to get student list
   * @throws Exception
   */
  @RequestMapping("/teacher/management/studentlist")
  protected ModelAndView getStudentList(@RequestParam("runId") Long runId) throws Exception {
    Run run = runService.retrieveById(runId);
    if (userCanViewRun(ControllerUtil.getSignedInUser(), run)) {
      Set<Group> periods = run.getPeriods();
      Set<Group> requestedPeriods = new TreeSet<Group>();
      for (Group period : periods) {
        // TODO in future: filter by period...for now, include all periods
        requestedPeriods.add(period);
      }
      ModelAndView modelAndView = new ModelAndView();
      modelAndView.addObject("run", run);
      modelAndView.addObject("periods", requestedPeriods);
      return modelAndView;
    } else {
      return new ModelAndView("errors/accessdenied");
    }
  }

  /**
   * Handles request to export a list of students in the run
   *
   * @param runId id of the Run
   * @param response response to write the export into
   * @throws Exception
   */
  @RequestMapping("/teacher/management/studentListExport")
  protected void exportStudentList(@RequestParam("runId") Long runId,
      HttpServletResponse response) throws Exception {
    Run run = runService.retrieveById(runId);
    Project project = run.getProject();
    User owner = run.getOwner();
    List<Workgroup> teacherWorkgroups = workgroupService.getWorkgroupListByRunAndUser(run, owner);
    // there should only be one workgroup for the owner
    Workgroup teacherWorkgroup = teacherWorkgroups.get(0);
    String teacherUsername = teacherWorkgroup.generateWorkgroupName();

    // get the meta data for the project
    Long projectId = (Long) project.getId();
    Long parentProjectId = project.getParentProjectId();
    String parentProjectIdStr = "N/A";
    if (parentProjectId != null) {
      parentProjectIdStr = parentProjectId.toString();
    }
    String projectName = project.getName();
    String runName = run.getName();
    Date startTime = run.getStarttime();
    Date endTime = run.getEndtime();

    int rowCounter = 0;
    int columnCounter = 0;

    int maxColumn = 0;
    HSSFWorkbook wb = new HSSFWorkbook();
    HSSFSheet mainSheet = wb.createSheet();

    columnCounter = 0;
    HSSFRow metaDataHeaderRow = mainSheet.createRow(rowCounter++);
    metaDataHeaderRow.createCell(columnCounter++).setCellValue("Teacher Login");
    metaDataHeaderRow.createCell(columnCounter++).setCellValue("Project Id");
    metaDataHeaderRow.createCell(columnCounter++).setCellValue("Parent Project Id");
    metaDataHeaderRow.createCell(columnCounter++).setCellValue("Project Name");
    metaDataHeaderRow.createCell(columnCounter++).setCellValue("Run Id");
    metaDataHeaderRow.createCell(columnCounter++).setCellValue("Run Name");
    metaDataHeaderRow.createCell(columnCounter++).setCellValue("Start Date");
    metaDataHeaderRow.createCell(columnCounter++).setCellValue("End Date");

    if (columnCounter > maxColumn) {
      maxColumn = columnCounter;
    }

    columnCounter = 0;
    HSSFRow metaDataRow = mainSheet.createRow(rowCounter++);
    metaDataRow.createCell(columnCounter++).setCellValue(teacherUsername);
    metaDataRow.createCell(columnCounter++).setCellValue(projectId);
    metaDataRow.createCell(columnCounter++).setCellValue(parentProjectIdStr);
    metaDataRow.createCell(columnCounter++).setCellValue(projectName);
    metaDataRow.createCell(columnCounter++).setCellValue(runId);
    metaDataRow.createCell(columnCounter++).setCellValue(runName);
    metaDataRow.createCell(columnCounter++).setCellValue(timestampToFormattedString(startTime));
    metaDataRow.createCell(columnCounter++).setCellValue(timestampToFormattedString(endTime));

    if (columnCounter > maxColumn) {
      maxColumn = columnCounter;
    }

    rowCounter++;

    columnCounter = 0;
    HSSFRow studentHeaderRow = mainSheet.createRow(rowCounter++);
    studentHeaderRow.createCell(columnCounter++).setCellValue("Period");
    studentHeaderRow.createCell(columnCounter++).setCellValue("Workgroup Id");
    studentHeaderRow.createCell(columnCounter++).setCellValue("Wise Id");
    studentHeaderRow.createCell(columnCounter++).setCellValue("Student Username");
    studentHeaderRow.createCell(columnCounter++).setCellValue("Student Name");

    Set<Group> periods = run.getPeriods();
    Iterator<Group> periodsIterator = periods.iterator();
    while(periodsIterator.hasNext()) {
      Group group = periodsIterator.next();

      String periodName = group.getName();
      Set<User> periodMembers = group.getMembers();
      Iterator<User> periodMembersIterator = periodMembers.iterator();
      while(periodMembersIterator.hasNext()) {
        User user = periodMembersIterator.next();
        List<Workgroup> workgroupListByRunAndUser = workgroupService.getWorkgroupListByRunAndUser(run, user);
        Long workgroupId = null;
        if (workgroupListByRunAndUser.size() > 0) {
          Workgroup workgroup = workgroupListByRunAndUser.get(0);
          workgroupId = workgroup.getId();
        }
        Long wiseId = user.getId();
        MutableUserDetails userDetails = (MutableUserDetails) user.getUserDetails();

        String username = "";
        String firstName = "";
        String lastName = "";
        String fullName = "";

        if (userDetails != null) {
          username = userDetails.getUsername();
          firstName = userDetails.getFirstname();
          lastName = userDetails.getLastname();
          fullName = firstName + " " + lastName;
        }

        columnCounter = 0;
        HSSFRow studentDataRow = mainSheet.createRow(rowCounter++);
        if (periodName != null && !periodName.equals("")) {
          try {
            studentDataRow.createCell(columnCounter).setCellValue(Long.parseLong(periodName));
          } catch(NumberFormatException e) {
            e.printStackTrace();
            studentDataRow.createCell(columnCounter).setCellValue(periodName);
          }
        }

        columnCounter++;
        if (workgroupId == null) {
          studentDataRow.createCell(columnCounter++).setCellValue("N/A");
        } else {
          studentDataRow.createCell(columnCounter++).setCellValue(workgroupId);
        }
        studentDataRow.createCell(columnCounter++).setCellValue(wiseId);
        studentDataRow.createCell(columnCounter++).setCellValue(username);
        studentDataRow.createCell(columnCounter++).setCellValue(fullName);

        if (columnCounter > maxColumn) {
          maxColumn = columnCounter;
        }
      }
    }
    response.setContentType("application/vnd.ms-excel");
    response.setHeader("Content-Disposition", "attachment; filename=\"" + projectName + "-" + runId + "-student-names.xls\"");
    ServletOutputStream outputStream = response.getOutputStream();
    if (wb != null) {
      wb.write(outputStream);
    }
  }

  /**
   * Handle teacher's request to update workgroup membership.
   * Possible scenarios:
   * 0) workgroupFrom and workgroupTo are equal. -> do nothing
   * 1) workgroupFrom and workgroupTo are both positive and exist
   * 2) workgroupFrom is groupless and workgroupTo is positive
   * 3) workgroupFrom is groupless and workgroupTo is negative
   * 4) workgroupFrom is positive and workgroupTo is groupless
   * 5) workgroupFrom is positive and workgroupTo is negative
   *
   * @param request
   * @param response
   * @throws Exception
   */
  @RequestMapping(method = RequestMethod.POST, value = "/teacher/management/submitworkgroupchanges")
  protected void handleWorkgroupChanges(HttpServletRequest request,
      HttpServletResponse response) throws Exception {
    String periodId = request.getParameter("periodId");
    String runId = request.getParameter("runId");
    String tabIndex = request.getParameter("tabIndex");

    int numChanges = Integer.parseInt(request.getParameter("numChanges"));
    Map<Long, ArrayList<ChangeWorkgroupParameters>> newWorkgroupMap =
      new HashMap<Long, ArrayList<ChangeWorkgroupParameters>>();
    for (int i = 0; i < numChanges; i++) {
      String userId = request.getParameter("userId_" + i);
      String workgroupFromId = request.getParameter("workgroupFrom_" + i);
      String workgroupToId = request.getParameter("workgroupTo_" + i);
      if (workgroupFromId.equals(workgroupToId)) {
        continue;
      }
      ChangeWorkgroupParameters params = new ChangeWorkgroupParameters();
      params.setRunId(Long.valueOf(runId));
      params.setPeriodId(Long.valueOf(periodId));
      params.setStudent(userService.retrieveById(Long.valueOf(userId)));
      if (!workgroupFromId.equals("groupless")) {
        params.setWorkgroupFrom(workgroupService.retrieveById(Long.valueOf(workgroupFromId)));
      }
      if (!workgroupToId.equals("groupless")) {
        Long workgroupToIdLong = Long.valueOf(workgroupToId);
        // handle cases when workgroupTo is negative separately (see below)
        if (workgroupToIdLong < 0) {
          ArrayList<ChangeWorkgroupParameters> newWGParams =
            newWorkgroupMap.get(workgroupToIdLong);
          if (newWGParams == null) {
            newWGParams = new ArrayList<ChangeWorkgroupParameters>();
          }
          newWGParams.add(params);
          newWorkgroupMap.put(workgroupToIdLong, newWGParams);
          continue;
        }
        params.setWorkgroupTo(workgroupService.retrieveById(workgroupToIdLong));
        params.setWorkgroupToId(Long.valueOf(workgroupToId));
      }
      try {
        workgroupService.updateWorkgroupMembership(params);
      } catch (Exception e) {
        throw e;
      }
    }

    for (Long key : newWorkgroupMap.keySet()) {
      ArrayList<ChangeWorkgroupParameters> newWGList =
        newWorkgroupMap.get(key);
      ChangeWorkgroupParameters params = newWGList.get(0);
      Set<User> members = new HashSet<User>();
      members.add(params.getStudent());
      String name = "newWorkgroup";
      Run run = runService.retrieveById(params.getRunId());
      Group period = groupService.retrieveById(params.getPeriodId());
      params.setWorkgroupToId(new Long(-1));  // to indicate that we want to create a new workgroup
      Workgroup newWorkgroup = workgroupService.updateWorkgroupMembership(params);
      for (int j = 1; j < newWGList.size(); j++) {
        params = newWGList.get(j);
        params.setWorkgroupTo(newWorkgroup);
        params.setWorkgroupToId(newWorkgroup.getId());
        workgroupService.updateWorkgroupMembership(params);
      }
    }
    response.getWriter().print(tabIndex);
  }

  /**
   * Get the timestamp as a string
   * @param date the date object
   * @return the timstamp as a string
   * e.g.
   * Mar 9, 2011 8:50:47 PM
   */
  private String timestampToFormattedString(Date date) {
    String timestampString = "";
    if (date != null) {
      DateFormat dateTimeInstance = DateFormat.getDateTimeInstance();
      long time = date.getTime();
      Date timestampDate = new Date(time);
      timestampString = dateTimeInstance.format(timestampDate);
    }
    return timestampString;
  }
}
