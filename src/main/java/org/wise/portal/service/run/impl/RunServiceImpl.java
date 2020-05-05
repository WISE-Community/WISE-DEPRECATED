/**
 * Copyright (c) 2007-2019 Regents of the University of California (Regents).
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
package org.wise.portal.service.run.impl;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Properties;
import java.util.Random;
import java.util.Set;
import java.util.TreeSet;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.security.acls.model.Permission;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.group.GroupDao;
import org.wise.portal.dao.project.ProjectDao;
import org.wise.portal.dao.run.RunDao;
import org.wise.portal.dao.user.UserDao;
import org.wise.portal.domain.PeriodNotFoundException;
import org.wise.portal.domain.Persistable;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.impl.AddSharedTeacherParameters;
import org.wise.portal.domain.portal.Portal;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.run.impl.RunParameters;
import org.wise.portal.domain.run.impl.RunPermission;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.presentation.web.exception.TeacherAlreadySharedWithRunException;
import org.wise.portal.presentation.web.response.SharedOwner;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.portal.PortalService;
import org.wise.portal.service.project.ProjectService;
import org.wise.portal.service.run.DuplicateRunCodeException;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.workgroup.WorkgroupService;

/**
 * Services for WISE Run
 * 
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 */
@Service
public class RunServiceImpl implements RunService {

  private String DEFAULT_RUNCODE_PREFIXES = "Tiger,Lion,Fox,Owl,Panda,Hawk,Mole,"
      + "Falcon,Orca,Eagle,Manta,Otter,Cat,Zebra,Flea,Wolf,Dragon,Seal,Cobra,"
      + "Bug,Gecko,Fish,Koala,Mouse,Wombat,Shark,Whale,Sloth,Slug,Ant,Mantis,"
      + "Bat,Rhino,Gator,Monkey,Swan,Ray,Crow,Goat,Marmot,Dog,Finch,Puffin,Fly,"
      + "Camel,Kiwi,Spider,Lizard,Robin,Bear,Boa,Cow,Crab,Mule,Moth,Lynx,Moose,"
      + "Skunk,Mako,Liger,Llama,Shrimp,Parrot,Pig,Clam,Urchin,Toucan,Frog,Toad,"
      + "Turtle,Viper,Trout,Hare,Bee,Krill,Dodo,Tuna,Loon,Leech,Python,Wasp,Yak,"
      + "Snake,Duck,Worm,Yeti";

  private static final int MAX_RUNCODE_DIGIT = 1000;

  @Autowired
  private PortalService portalService;

  @Autowired
  private RunDao<Run> runDao;

  @Autowired
  private ProjectDao<Project> projectDao;

  @Autowired
  private GroupDao<Group> groupDao;

  @Autowired
  private UserDao<User> userDao;

  @Autowired
  private Properties appProperties;

  @Autowired
  protected AclService<Persistable> aclService;

  @Autowired
  private WorkgroupService workgroupService;

  @Autowired
  private ProjectService projectService;

  @Transactional(readOnly = true)
  public List<Run> getRunList() {
    // for some reason, runDao.getList returns all runs, when it should
    // only return runs with the right privileges according to Acegi.
    return runDao.getList();
  }

  @Transactional(readOnly = true)
  public List<Run> getRunList(User user) {
    return runDao.getRunListByUser(user);
  }

  @Transactional(readOnly = true)
  public List<Run> getRunListByOwner(User owner) {
    // for some reason, runDao.getList returns all runs, when it should
    // only return runs with the right privileges according to Acegi.
    return runDao.getRunListByOwner(owner);
  }

  @Transactional(readOnly = true)
  public List<Run> getRunListBySharedOwner(User owner) {
    // for some reason, runDao.getList returns all runs, when it should
    // only return runs with the right privileges according to Acegi.
    return runDao.getRunListBySharedOwner(owner);
  }

  @Transactional(readOnly = true)
  public List<Run> getAllRunList() {
    return runDao.getList();
  }

  /**
   * Generate a random runcode
   * 
   * @param locale
   * @return the randomly generated runcode.
   */
  String generateRunCode(Locale locale) {
    Random rand = new Random();
    Integer digits = rand.nextInt(MAX_RUNCODE_DIGIT);
    StringBuffer sb = new StringBuffer(digits.toString());

    int max_runcode_digit_length = Integer.toString(MAX_RUNCODE_DIGIT).length() - 1;
    while (sb.length() < max_runcode_digit_length) {
      sb.insert(0, "0");
    }
    String language = locale.getLanguage(); // languages is two-letter ISO639 code, like en
    String runcodePrefixesStr = appProperties.getProperty("runcode_prefixes_en",
        DEFAULT_RUNCODE_PREFIXES);
    if (appProperties.containsKey("runcode_prefixes_" + language)) {
      runcodePrefixesStr = appProperties.getProperty("runcode_prefixes_" + language);
    }
    String[] runcodePrefixes = runcodePrefixesStr.split(",");
    String word = runcodePrefixes[rand.nextInt(runcodePrefixes.length)];
    String runCode = (word + sb.toString());
    return runCode;
  }

  /**
   * Creates a run based on input parameters provided.
   * 
   * @param runParameters
   * @return The run created.
   * @throws ObjectNotFoundException
   */
  @Transactional()
  public Run createRun(RunParameters runParameters) {
    Project project = runParameters.getProject();
    Run run = new RunImpl();
    run.setId((Long) project.getId());
    run.setEndtime(runParameters.getEndTime());
    run.setLockedAfterEndDate(runParameters.getIsLockedAfterEndDate());
    run.setStarttime(runParameters.getStartTime());
    run.setRuncode(generateUniqueRunCode(runParameters.getLocale()));
    run.setOwner(runParameters.getOwner());
    run.setMaxWorkgroupSize(runParameters.getMaxWorkgroupSize());
    run.setProject(project);
    run.setName("" + runParameters.getProject().getName());

    Calendar reminderCal = Calendar.getInstance();
    reminderCal.add(Calendar.DATE, 30);
    run.setArchiveReminderTime(reminderCal.getTime());
    Set<String> periodNames = runParameters.getPeriodNames();
    if (periodNames != null) {
      Set<Group> periods = new TreeSet<Group>();
      for (String periodName : runParameters.getPeriodNames()) {
        Group group = new PersistentGroup();
        group.setName(periodName);
        groupDao.save(group);
        periods.add(group);
      }
      run.setPeriods(periods);
    }
    run.setPostLevel(runParameters.getPostLevel());

    Boolean enableRealTime = runParameters.getEnableRealTime();
    run.setRealTimeEnabled(enableRealTime);

    // set default survey template for this run, if any
    try {
      Portal portal = portalService.getById(new Integer(1));
      String runSurveyTemplate = portal.getRunSurveyTemplate();
      if (runSurveyTemplate != null) {
        run.setSurvey(runSurveyTemplate);
      }
    } catch (Exception e) {
      // it's ok if the code block above fails
    }

    runDao.save(run);
    aclService.addPermission(run, BasePermission.ADMINISTRATION);
    return run;
  }

  public Run createRun(Long projectId, User user, Set<String> periodNames,
      Integer maxStudentsPerTeam, Long startDate, Long endDate, Boolean isLockedAfterEndDate,
      Locale locale) throws Exception {
    Project project = projectService.copyProject(projectId, user);
    RunParameters runParameters = createRunParameters(project, user, periodNames,
        maxStudentsPerTeam, startDate, endDate, isLockedAfterEndDate, locale);
    Run run = createRun(runParameters);
    createTeacherWorkgroup(run, user);
    return run;
  }

  public RunParameters createRunParameters(Project project, User user, Set<String> periodNames,
      Integer maxStudentsPerTeam, Long startDate, Long endDate, Boolean isLockedAfterEndDate,
      Locale locale) {
    RunParameters runParameters = new RunParameters();
    runParameters.setOwner(user);
    runParameters.setName(project.getName());
    runParameters.setProject(project);
    runParameters.setLocale(locale);
    runParameters.setPostLevel(5);
    runParameters.setPeriodNames(periodNames);
    runParameters.setMaxWorkgroupSize(maxStudentsPerTeam);
    runParameters.setStartTime(new Date(startDate));
    if (endDate == null || endDate <= startDate) {
      runParameters.setEndTime(null);
    } else {
      runParameters.setEndTime(new Date(endDate));
    }
    runParameters.setIsLockedAfterEndDate(isLockedAfterEndDate);
    return runParameters;
  }

  private void createTeacherWorkgroup(Run run, User user) throws Exception {
    HashSet<User> members = new HashSet<>();
    members.add(user);
    workgroupService.createWorkgroup("teacher", members, run, null);
  }

  public void addSharedTeacher(AddSharedTeacherParameters addSharedTeacherParameters) {
    Run run = addSharedTeacherParameters.getRun();
    String sharedOwnerUsername = addSharedTeacherParameters.getSharedOwnerUsername();
    User user = userDao.retrieveByUsername(sharedOwnerUsername);
    run.getSharedowners().add(user);
    runDao.save(run);

    Project project = run.getProject();
    project.getSharedowners().add(user);
    projectDao.save(project);

    String permission = addSharedTeacherParameters.getPermission();
    if (permission.equals(UserDetailsService.RUN_GRADE_ROLE)) {
      aclService.removePermission(run, BasePermission.READ, user);
      aclService.removePermission(project, BasePermission.READ, user);
      aclService.addPermission(run, BasePermission.WRITE, user);
      aclService.addPermission(project, BasePermission.WRITE, user);
    } else if (permission.equals(UserDetailsService.RUN_READ_ROLE)) {
      aclService.removePermission(run, BasePermission.WRITE, user);
      aclService.removePermission(project, BasePermission.WRITE, user);
      aclService.addPermission(run, BasePermission.READ, user);
      aclService.addPermission(project, BasePermission.READ, user);
    }
  }

  public void updateSharedTeacherForRun(AddSharedTeacherParameters updateSharedTeacherParameters) {
    Run run = updateSharedTeacherParameters.getRun();
    String sharedOwnerUsername = updateSharedTeacherParameters.getSharedOwnerUsername();
    User user = userDao.retrieveByUsername(sharedOwnerUsername);
    if (run.getSharedowners().contains(user)) {
      Project project = run.getProject();
      String permission = updateSharedTeacherParameters.getPermission();
      if (permission.equals(UserDetailsService.RUN_GRADE_ROLE)) {
        aclService.removePermission(run, BasePermission.READ, user);
        aclService.removePermission(project, BasePermission.READ, user);
        aclService.addPermission(run, BasePermission.WRITE, user);
        aclService.addPermission(project, BasePermission.WRITE, user);
      } else if (permission.equals(UserDetailsService.RUN_READ_ROLE)) {
        aclService.removePermission(run, BasePermission.WRITE, user);
        aclService.removePermission(project, BasePermission.WRITE, user);
        aclService.addPermission(run, BasePermission.READ, user);
        aclService.addPermission(project, BasePermission.READ, user);
      }
    }
  }

  @Transactional
  public JSONObject transferRunOwnership(Long runId, String teacherUsername)
      throws ObjectNotFoundException {
    Run run = retrieveById(runId);
    Project project = run.getProject();
    User oldOwner = run.getOwner();
    User newOwner = userDao.retrieveByUsername(teacherUsername);
    projectService.transferProjectOwnership(project, newOwner);
    if (run.isSharedTeacher(newOwner)) {
      removeSharedTeacherAndPermissions(run, newOwner);
    }
    setOwner(run, newOwner);
    addSharedTeacherWithViewAndGradePermissions(run, oldOwner);
    removeAministrationPermission(run, oldOwner);
    createSharedTeacherWorkgroupIfNecessary(run, newOwner);
    runDao.save(run);
    try {
      return ControllerUtil.getRunJSON(run);
    } catch (JSONException e) {
      return null;
    }
  }

  private void removeSharedTeacherAndPermissions(Run run, User user) {
    removeSharedTeacher(run, user);
    removePermissions(run, user);
  }

  private void removeSharedTeacher(Run run, User user) {
    run.getSharedowners().remove(user);
  }

  private void removePermissions(Run run, User user) {
    List<Permission> permissions = aclService.getPermissions(run, user.getUserDetails());
    for (Permission permission : permissions) {
      aclService.removePermission(run, permission, user);
    }
  }

  private void setOwner(Run run, User user) {
    run.setOwner(user);
    aclService.addPermission(run, BasePermission.ADMINISTRATION, user);
  }

  private void addSharedTeacherWithViewAndGradePermissions(Run run, User user) {
    if (!run.isSharedTeacher(user)) {
      run.getSharedowners().add(user);
    }
    aclService.addPermission(run, RunPermission.VIEW_STUDENT_NAMES, user);
    aclService.addPermission(run, RunPermission.GRADE_AND_MANAGE, user);
  }

  private void removeAministrationPermission(Run run, User user) {
    aclService.removePermission(run, BasePermission.ADMINISTRATION, user);
  }

  public SharedOwner addSharedTeacher(Long runId, String username)
      throws ObjectNotFoundException, TeacherAlreadySharedWithRunException {
    User user = userDao.retrieveByUsername(username);
    Run run = retrieveById(runId);
    if (!run.getSharedowners().contains(user)) {
      run.getSharedowners().add(user);
      runDao.save(run);

      Project project = run.getProject();
      project.getSharedowners().add(user);
      projectDao.save(project);

      aclService.addPermission(run, RunPermission.VIEW_STUDENT_WORK, user);
      List<Integer> newPermissions = new ArrayList<>();
      newPermissions.add(RunPermission.VIEW_STUDENT_WORK.getMask());
      createSharedTeacherWorkgroupIfNecessary(run, user);
      return new SharedOwner(user.getId(), user.getUserDetails().getUsername(),
          user.getUserDetails().getFirstname(), user.getUserDetails().getLastname(),
          newPermissions);
    } else {
      throw new TeacherAlreadySharedWithRunException(
          user.getUserDetails().getUsername() + " is already shared with this run");
    }
  }

  private Workgroup createSharedTeacherWorkgroupIfNecessary(Run run, User user)
      throws ObjectNotFoundException {
    if (workgroupService.getWorkgroupListByRunAndUser(run, user).size() == 0) {
      return createSharedTeacherWorkgroup(run, user);
    }
    return null;
  }

  private Workgroup createSharedTeacherWorkgroup(Run run, User user)
      throws ObjectNotFoundException {
    if (user.isTeacher()) {
      Set<User> sharedOwners = new HashSet<User>();
      sharedOwners.add(user);
      return workgroupService.createWorkgroup("teacher", sharedOwners, run, null);
    }
    return null;
  }

  public void addSharedTeacherPermission(Long runId, Long userId, Integer permissionId)
      throws ObjectNotFoundException {
    User user = userDao.getById(userId);
    Run run = retrieveById(runId);
    if (run.getSharedowners().contains(user)) {
      aclService.addPermission(run, new RunPermission(permissionId), user);
    }
  }

  public void removeSharedTeacherPermission(Long runId, Long userId, Integer permissionId)
      throws ObjectNotFoundException {
    User user = userDao.getById(userId);
    Run run = retrieveById(runId);
    if (run.getSharedowners().contains(user)) {
      aclService.removePermission(run, new RunPermission(permissionId), user);
    }
  }

  public void removeSharedTeacher(String username, Long runId) throws ObjectNotFoundException {
    Run run = retrieveById(runId);
    User user = userDao.retrieveByUsername(username);
    if (run == null || user == null) {
      return;
    }

    if (run.getSharedowners().contains(user)) {
      run.getSharedowners().remove(user);
      runDao.save(run);
      Project runProject = (Project) run.getProject();
      runProject.getSharedowners().remove(user);
      projectDao.save(runProject);

      try {
        List<Permission> runPermissions = aclService.getPermissions(run, user.getUserDetails());
        for (Permission runPermission : runPermissions) {
          aclService.removePermission(run, runPermission, user);
        }
        List<Permission> projectPermissions = aclService.getPermissions(runProject,
            user.getUserDetails());
        for (Permission projectPermission : projectPermissions) {
          aclService.removePermission(runProject, projectPermission, user);
        }
      } catch (Exception e) {
        // do nothing. permissions might get be deleted if
        // user requesting the deletion is not the owner of the run.
      }
    }
  }

  public String getSharedTeacherRole(Run run, User user) {
    List<Permission> permissions = aclService.getPermissions(run, user.getUserDetails());
    // for runs, a user can have at most one permission per run
    if (!permissions.isEmpty()) {
      Permission permission = permissions.get(0);
      if (permission.equals(BasePermission.READ)) {
        return UserDetailsService.RUN_READ_ROLE;
      } else if (permission.equals(BasePermission.WRITE)) {
        return UserDetailsService.RUN_GRADE_ROLE;
      }
    }
    return null;
  }

  public List<Permission> getSharedTeacherPermissions(Run run, User sharedTeacher) {
    return aclService.getPermissions(run, sharedTeacher.getUserDetails());
  }

  private String generateUniqueRunCode(Locale locale) {
    String tempRunCode = generateRunCode(locale);
    while (true) {
      try {
        checkForRunCodeDuplicate(tempRunCode);
      } catch (DuplicateRunCodeException e) {
        tempRunCode = generateRunCode(locale);
        continue;
      }
      break;
    }
    return tempRunCode;
  }

  /**
   * Checks if the given runcode is unique.
   * 
   * @param runCode
   *                  A unique string.
   * @throws DuplicateRunCodeException
   *                                     if the run's runcde already exists in the data store
   */
  private void checkForRunCodeDuplicate(String runCode) throws DuplicateRunCodeException {
    try {
      runDao.retrieveByRunCode(runCode);
    } catch (ObjectNotFoundException e) {
      return;
    }
    throw new DuplicateRunCodeException("Runcode " + runCode + " already exists.");
  }

  public Run retrieveRunByRuncode(String runcode) throws ObjectNotFoundException {
    return runDao.retrieveByRunCode(runcode);
  }

  public Run retrieveById(Long runId) throws ObjectNotFoundException {
    return runDao.getById(runId);
  }

  @Transactional()
  public void endRun(Run run) {
    if (run.getEndtime() == null) {
      run.setEndtime(Calendar.getInstance().getTime());
      runDao.save(run);
    }
  }

  @Transactional()
  public void restartRun(Run run) {
    run.setEndtime(null);
    runDao.save(run);
  }

  @Transactional()
  public void startRun(Run run) {
    if (run.getEndtime() != null) {
      run.setEndtime(null);
      Calendar reminderCal = Calendar.getInstance();
      reminderCal.add(Calendar.DATE, 30);
      run.setArchiveReminderTime(reminderCal.getTime());
      runDao.save(run);
    }
  }

  public List<Workgroup> getWorkgroups(Long runId) {
    return runDao.getWorkgroupsForRun(runId);
  }

  public List<Workgroup> getWorkgroups(Long runId, Long periodId) {
    return runDao.getWorkgroupsForRunAndPeriod(runId, periodId);
  }

  @Transactional()
  public void setInfo(Long runId, String isPaused, String showNodeId) throws Exception {
    Run run = retrieveById(runId);
    String runInfoString = "<isPaused>" + isPaused + "</isPaused>";
    if (showNodeId != null) {
      runInfoString += "<showNodeId>" + showNodeId + "</showNodeId>";
    }

    /*
     * when we use the info field for more info than just isPaused this will need to be changed so
     * it doesn't just completely overwrite the info field
     */
    run.setInfo(runInfoString);
    runDao.save(run);
  }

  @Transactional()
  public void extendArchiveReminderTime(Long runId) throws ObjectNotFoundException {
    Run run = retrieveById(runId);
    Calendar moreTime = Calendar.getInstance();
    moreTime.add(Calendar.DATE, 30);
    run.setArchiveReminderTime(moreTime.getTime());
    runDao.save(run);
  }

  @Transactional()
  public Integer getProjectUsage(Long id) {
    List<Run> runList = runDao.getRunsOfProject(id);
    if (runList == null) {
      return 0;
    } else {
      return runList.size();
    }
  }

  @Transactional()
  public List<Run> getProjectRuns(Long projectId) {
    return runDao.getRunsOfProject(projectId);
  }

  @Transactional()
  public void setExtras(Run run, String extras) throws Exception {
    run.setExtras(extras);
    runDao.save(run);
  }

  public boolean hasReadPermission(Authentication authentication, Run run) {
    return ((MutableUserDetails) authentication.getPrincipal()).isAdminUser()
        || aclService.hasPermission(authentication, run, BasePermission.READ)
        || aclService.hasPermission(authentication, run, BasePermission.WRITE);
  }

  public boolean hasWritePermission(Authentication authentication, Run run) {
    return ((MutableUserDetails) authentication.getPrincipal()).isAdminUser()
        || aclService.hasPermission(authentication, run, BasePermission.WRITE);
  }

  public boolean hasRunPermission(Run run, User user, Permission permission) {
    return aclService.hasPermission(run, permission, user.getUserDetails());
  }

  public boolean hasSpecificPermission(Run run, User user, Permission permission) {
    return aclService.hasSpecificPermission(run, permission, user.getUserDetails());
  }

  public boolean canDecreaseMaxStudentsPerTeam(Long runId) {
    List<Workgroup> workgroups = getWorkgroups(runId);
    if (workgroups != null) {
      for (Workgroup workgroup : workgroups) {
        if (workgroup.isStudentWorkgroup() && workgroup.getMembers().size() > 1) {
          return false;
        }
      }
    }
    return true;
  }

  public List<Run> getRunsRunWithinTimePeriod(String period) {
    return runDao.getRunsRunWithinTimePeriod(period);
  }

  public List<Run> getRunsByActivity() {
    return runDao.getRunsByActivity();
  }

  public List<Run> getRunsByTitle(String runTitle) {
    return runDao.retrieveByField("name", "like", "%" + runTitle + "%");
  }

  @Transactional()
  public void updateRunStatistics(Long runId) {
    try {
      Run run = retrieveById(runId);
      run.setLastRun(Calendar.getInstance().getTime());
      if (run.getTimesRun() == null) {
        run.setTimesRun(1);
      } else {
        run.setTimesRun(run.getTimesRun() + 1);
      }
      runDao.save(run);
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }
  }

  @Transactional()
  public void updateRunName(Long runId, String name) {
    try {
      Run run = retrieveById(runId);
      run.setName(name);
      runDao.save(run);
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }
  }

  @Transactional()
  public void addPeriodToRun(Long runId, String name) {
    try {
      Run run = retrieveById(runId);
      Set<Group> periods = run.getPeriods();
      Group group = new PersistentGroup();
      group.setName(name);
      groupDao.save(group);
      periods.add(group);
      runDao.save(run);
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }
  }

  @Transactional()
  public void deletePeriodFromRun(Long runId, String name) {
    try {
      Run run = retrieveById(runId);
      Group period = run.getPeriodByName(name);
      Set<Group> periods = run.getPeriods();
      periods.remove(period);
      runDao.save(run);
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    } catch (PeriodNotFoundException e) {
      e.printStackTrace();
    }
  }

  @Transactional()
  public void setMaxWorkgroupSize(Long runId, Integer maxStudentsPerTeam) {
    try {
      Run run = retrieveById(runId);
      run.setMaxWorkgroupSize(maxStudentsPerTeam);
      runDao.save(run);
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }
  }

  @Transactional()
  public void setStartTime(Long runId, Long startTime) {
    try {
      Run run = retrieveById(runId);
      run.setStarttime(new Date(startTime));
      runDao.save(run);
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }
  }

  @Transactional()
  public void setEndTime(Long runId, Long endTime) {
    try {
      Run run = retrieveById(runId);
      if (endTime == null) {
        run.setEndtime(null);
      } else {
        run.setEndtime(new Date(endTime));
      }
      runDao.save(run);
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }
  }

  @Transactional()
  public void setIsLockedAfterEndDate(Long runId, Boolean isLockedAfterEndDate) {
    try {
      Run run = retrieveById(runId);
      run.setLockedAfterEndDate(isLockedAfterEndDate);
      runDao.save(run);
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }
  }

  @Transactional
  public void setIdeaManagerEnabled(Long runId, boolean isEnabled) throws ObjectNotFoundException {
    Run run = retrieveById(runId);
    run.setIdeaManagerEnabled(isEnabled);
    runDao.save(run);
  }

  @Transactional
  public void setStudentAssetUploaderEnabled(Long runId, boolean isEnabled)
      throws ObjectNotFoundException {
    Run run = retrieveById(runId);
    run.setStudentAssetUploaderEnabled(isEnabled);
    runDao.save(run);
  }

  @Transactional
  public void setRealTimeEnabled(Long runId, boolean isEnabled) throws ObjectNotFoundException {
    Run run = retrieveById(runId);
    run.setRealTimeEnabled(isEnabled);
    runDao.save(run);
  }

  @Transactional
  public void updateNotes(Long runId, String privateNotes) throws ObjectNotFoundException {
    Run run = retrieveById(runId);
    run.setPrivateNotes(privateNotes);
    runDao.save(run);
  }

  @Transactional
  public void updateSurvey(Long runId, String survey) throws ObjectNotFoundException {
    Run run = retrieveById(runId);
    run.setSurvey(survey);
    runDao.save(run);
  }

  public boolean isAllowedToViewStudentWork(Run run, User user) {
    return run.isOwner(user) || hasSpecificPermission(run, user, RunPermission.VIEW_STUDENT_WORK);
  }

  public boolean isAllowedToGradeStudentWork(Run run, User user) {
    return run.isOwner(user) || hasSpecificPermission(run, user, RunPermission.GRADE_AND_MANAGE);
  }

  public boolean isAllowedToViewStudentNames(Run run, User user) {
    return run.isOwner(user) || hasSpecificPermission(run, user, RunPermission.VIEW_STUDENT_NAMES);
  }

}
