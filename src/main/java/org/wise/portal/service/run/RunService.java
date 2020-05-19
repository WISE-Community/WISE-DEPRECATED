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
package org.wise.portal.service.run;

import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.json.JSONObject;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.acls.model.Permission;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.impl.AddSharedTeacherParameters;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunParameters;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.exception.TeacherAlreadySharedWithRunException;
import org.wise.portal.presentation.web.response.SharedOwner;

/**
 * A service for working with <code>Run</code> objects
 * 
 * @author Laurel Williams
 * @author Hiroki Terashima
 */
public interface RunService {

  /**
   * Creates a new <code>Run</code> object in the local data store.
   * 
   * @param runParameters
   *                        The object that encapsulate parameters for creating a run
   * @return the run created.
   */
  Run createRun(RunParameters runParameters) throws ObjectNotFoundException;

  Run createRun(Long projectId, User user, Set<String> periodNames, Integer maxStudentsPerTeam,
      Long startDate, Long endDate, Boolean isLockedAfterEndDate, Locale locale) throws Exception;

  /**
   * Ends this run. The side effect is that the run's endtime gets set. A Run that has ended is no
   * longer eligible for classroom run. If the run is already ended, nothing happens.
   * 
   * @param run
   *              the <code>Run</code> to end
   */
  void endRun(Run run);

  /**
   * Restarts this run. The side effect is that the run's endtime gets set to null. The run
   * continues to be available for students to access.
   * 
   * @param run
   *              the <code>Run</code> to restart
   */
  void restartRun(Run run);

  /**
   * Starts this run. The side effect is that the run's endtime gets set to null. A Run that has
   * started becomes eligible for classroom run. If the run is already started, nothing happens.
   * 
   * @param run
   *              the <code>Run</code> to start
   */
  void startRun(Run run);

  /**
   * Retrieves a list of <code>Run</code>
   * 
   * @return <code>List</code> of <code>Run</code>
   */
  @Secured({ "ROLE_USER", "AFTER_ACL_COLLECTION_READ" })
  List<Run> getRunList();

  /**
   * Retrieves a list of <code>Run</code> that the specified user owns
   * 
   * @return <code>List</code> of <code>Run</code>
   */
  @Secured({ "ROLE_USER", "AFTER_ACL_COLLECTION_READ" })
  List<Run> getRunListByOwner(User owner);

  /**
   * Retrieves a list of <code>Run</code> that the specified user is an shared-owner
   * 
   * @return <code>List</code> of <code>Run</code>
   */
  @Secured({ "ROLE_USER", "AFTER_ACL_COLLECTION_READ" })
  List<Run> getRunListBySharedOwner(User user);

  /**
   * Retrieves a list of all <code>Runs</code>. Only adminstrators may invoke this method.
   * 
   * @return <code>List</code> of <code>Run</code>
   */
  @Secured({ "ROLE_ADMINISTRATOR", "ROLE_RESEARCHER" })
  List<Run> getAllRunList();

  /**
   * Retrieves a list of <code>Run</code> that the given user is associated with
   * 
   * @param user
   *               <code>User</code> that is associated with 0 or more runs
   * @return list of <code>Run</code> that the user is associated with
   */
  List<Run> getRunList(User user);

  /**
   * Allows a user to add another user as a shared teacher of a run. The shared teacher will also be
   * granted access to the project of the run.
   *
   * The invoker of this method must either: 1) have a ROLE_TEACHER authority and be the owner of
   * the run 2) have a ROLE_ADMINISTRATOR
   *
   * The shared teacher will have the role specified in the parameters
   *
   * @param addSharedTeacherParameters
   * @throws <code>RunNotFoundException</code>
   * when runId cannot be used to find an existing run
   */
  @Secured({ "ROLE_TEACHER" })
  @Transactional()
  void addSharedTeacher(AddSharedTeacherParameters addSharedTeacherParameters)
      throws ObjectNotFoundException;

  /**
   * Updates a shared teacher's permissions on a run and also the run project.
   *
   * The user specified must exist, must have a ROLE_TEACHER, and must already be a shared owner of
   * the run
   *
   * The invoker of this method must either: 1) have a ROLE_TEACHER authority and be the owner of
   * the run 2) have a ROLE_ADMINISTRATOR
   *
   * The shared teacher will have the ROLES defined in the roles parameter.
   *
   * If the user specified is already a shared teacher of the specified run, her permissions on the
   * specified run will be updated with the roles in the roles parameter.
   *
   * @param addSharedTeacherParameters
   *                                     the parameters that specify how to change the permissions
   *                                     for the teacher for the run
   * @throws <code>RunNotFoundException</code>
   * when runId cannot be used to find an existing run
   */
  @Secured({ "ROLE_TEACHER" })
  @Transactional()
  void updateSharedTeacherForRun(AddSharedTeacherParameters addSharedTeacherParameters)
      throws ObjectNotFoundException;

  @Secured({ "ROLE_TEACHER" })
  @Transactional()
  SharedOwner addSharedTeacher(Long runId, String username)
      throws ObjectNotFoundException, TeacherAlreadySharedWithRunException;

  @Secured({ "ROLE_TEACHER" })
  @Transactional()
  void addSharedTeacherPermission(Long runId, Long userId, Integer permissionId)
      throws ObjectNotFoundException;

  @Secured({ "ROLE_TEACHER" })
  @Transactional()
  void removeSharedTeacherPermission(Long runId, Long userId, Integer permissionId)
      throws ObjectNotFoundException;

  /**
   * Removes specified teacher user from specified run. Also removes any shared permission on the
   * project of the run.
   *
   * If user or run does not exist, ignore.
   *
   * @param username
   * @param runId
   * @throws ObjectNotFoundException
   */
  @Secured({ "ROLE_TEACHER" })
  @Transactional()
  void removeSharedTeacher(String username, Long runId) throws ObjectNotFoundException;

  /**
   * Returns the permission that the specified user has on the specified run
   *
   * @param run
   *               The <code>Run</code> that is shared.
   * @param user
   *               The <code>User</code> that shares the <code>Run</code>
   * @return A <code>String</code> containing the permission that the user has on the run. If the
   *         user does not have permission on the run, null is returned.
   */
  @Transactional(readOnly = true)
  String getSharedTeacherRole(Run run, User user);

  /**
   * Returns all the permission that the specified user has on the specified run
   *
   * @param run
   *               The <code>Run</code> that is shared.
   * @param user
   *               The <code>sharedTeacher</code> that shares the <code>Run</code>
   */
  @Transactional(readOnly = true)
  List<Permission> getSharedTeacherPermissions(Run run, User sharedTeacher);

  /**
   * Retrieves the Run domain object using the unique runcode
   *
   * @param runcode
   *                  The <code>String</code> runcode to use for lookup
   * @return <code>Run</code> The Run object with the runcode
   * @throws <code>RunNotFoundException</code>
   * when runcode cannot be used to find an existing run
   */
  Run retrieveRunByRuncode(String runcode) throws ObjectNotFoundException;

  /**
   * Retrieves the Run domain object using a unique runId
   *
   * @param runId
   *                <code>Long</code> runId to use for lookup
   * @return <code>Run</code> The Run object with the runId
   * @throws <code>RunNotFoundException</code>
   * when runId cannot be used to find an existing run
   */
  Run retrieveById(Long runId) throws ObjectNotFoundException;

  /**
   * Gets all of the Workgroups that are associated with this run
   * 
   * @return set of Workgroups for that are in this run
   * @throws ObjectNotFoundException
   *                                   when runId cannot be used to find an existing run
   */
  List<Workgroup> getWorkgroups(Long runId) throws ObjectNotFoundException;

  /**
   * Gets all of the Workgroups that are associated with this run
   * 
   * @return set of Workgroups for that are in this run
   * @throws ObjectNotFoundException
   *                                   when runId cannot be used to find an existing run
   * @param runId
   *                   runId to use for lookup
   * @param periodId
   *                   periodId to which all returned workgroups belong
   */
  List<Workgroup> getWorkgroups(Long runId, Long periodId) throws ObjectNotFoundException;

  /**
   * Sets whether the run is paused
   * 
   * @param runId
   *                   the id of the run
   * @param isPaused
   *                   a String that is "true" or "false"
   * @throws Exception
   */
  void setInfo(Long runId, String isPaused, String showNodeId) throws Exception;

  /**
   * Sets whether idea manager is enabled for this run or not.
   * 
   * @param runId
   * @param isEnabled
   * @throws ObjectNotFoundException
   */
  void setIdeaManagerEnabled(Long runId, boolean isEnabled) throws ObjectNotFoundException;

  /**
   * Sets whether student asset uploader is enabled for this run or not.
   * 
   * @param runId
   * @param isEnabled
   * @throws ObjectNotFoundException
   */
  void setStudentAssetUploaderEnabled(Long runId, boolean isEnabled) throws ObjectNotFoundException;

  /**
   * Sets whether real time is enabled for this run
   * 
   * @param runId
   * @param isEnabled
   * @throws ObjectNotFoundException
   */
  void setRealTimeEnabled(Long runId, boolean isEnabled) throws ObjectNotFoundException;

  /**
   * Update private run notes for this run
   * 
   * @param runId
   * @param privateNotes
   *                       String private notes
   * @throws ObjectNotFoundException
   */
  void updateNotes(Long runId, String privateNotes) throws ObjectNotFoundException;

  /**
   * Update survey for the specified run
   * 
   * @param runId
   * @param survey
   *                 String survey
   * @throws ObjectNotFoundException
   */
  void updateSurvey(Long runId, String survey) throws ObjectNotFoundException;

  /**
   * Given a <code>Long</code> runId, changes the archiveReminderTime to be 30 days from today.
   * 
   * @param runId
   * @throws <code>ObjectNotFoundException</code>
   */
  void extendArchiveReminderTime(Long runId) throws ObjectNotFoundException;

  /**
   * Given a <code>Long</code> projectId, returns the <code>Integer</code> number of runs associated
   * with that id.
   * 
   * @param id
   * @return <code>Integer</code>
   */
  Integer getProjectUsage(Long id);

  /**
   * Given a <code>Long</code> projectId, returns a <code>List<Run></code> list of runs associated
   * with that id.
   * 
   * @param projectId
   * @return <code>Integer</code>
   */
  List<Run> getProjectRuns(Long projectId);

  /**
   * Sets run extras
   * 
   * @param run
   * @param extras
   * @throws Exception
   */
  void setExtras(Run run, String extras) throws Exception;

  /**
   * Returns <code>boolean</code> true iff the given <code>User</code> user has the read permission
   * for the given <code>Run</code> run.
   * 
   * @param authentication
   * @param run
   * @return boolean
   */
  public boolean hasReadPermission(Authentication authentication, Run run);

  /**
   * Returns <code>boolean</code> true iff the given <code>User</code> user has the write permission
   * for the given <code>Run</code> run.
   * 
   * @param authentication
   * @param run
   * @return boolean
   */
  public boolean hasWritePermission(Authentication authentication, Run run);

  /**
   * Returns <code>boolean</code> true if the given <code>User</code> user has the given
   * <code>Permission</code> permission for the given <code>Run</code> run, returns false otherwise.
   * 
   * @param run
   * @param user
   * @param permission
   * @return boolean
   */
  boolean hasRunPermission(Run run, User user, Permission permission);

  /**
   * Returns <code>boolean</code> true if the run with the given <code>runId</code> does not have
   * any student workgroups that contain more than 1 user, returns false otherwise.
   * 
   * @param runId
   * @return boolean
   */
  boolean canDecreaseMaxStudentsPerTeam(Long runId);

  /**
   * Returns a <code>List<Run></code> list of runs that were run within the given
   * <code>String</code> period. Valid periods are "today","week" and "month".
   * 
   * @param period
   * @return List<Run> - run list
   */
  List<Run> getRunsRunWithinTimePeriod(String period);

  /**
   * Returns a <code>List<Run></code> list of runs ordered descending by how active they are.
   * 
   * @return List<Run> - list of runs descending by activity
   */
  List<Run> getRunsByActivity();

  /**
   * Returns a <code>List<Run></code> list of runs that have a run title similar to the the
   * specified run title.
   * 
   * @param runTitle
   * @return List<Run> - list of runs with the run title similar to the param
   */
  List<Run> getRunsByTitle(String runTitle);

  /**
   * Updates the given <code>Run</code> run's statistics which are currently the last time run and
   * the number of times run.
   * 
   * @param runId
   *                - the id of the run whose statistics should be updated.
   */
  void updateRunStatistics(Long runId);

  /**
   * Update the name of the run with the given <code>Long</code> to that of the given
   * <code>String</code> name.
   * 
   * @param runId
   *                id of the run
   * @param name
   *                new name of the run
   */
  void updateRunName(Long runId, String name);

  /**
   * Creates and adds a period with the given <code>String</code> name to the run with the given
   * <code>Long</code> runId.
   * 
   * @param runId
   *                id of the run
   * @param name
   *                name of the new period to add to the run
   */
  void addPeriodToRun(Long runId, String name);

  void deletePeriodFromRun(Long runId, String name);

  void setMaxWorkgroupSize(Long runId, Integer maxStudentsPerTeam);

  void setStartTime(Long runId, Long startTime);

  void setEndTime(Long runId, Long endTime);

  void setIsLockedAfterEndDate(Long runId, Boolean isLockedAfterEndDate);

  boolean isAllowedToViewStudentWork(Run run, User user);

  boolean isAllowedToGradeStudentWork(Run run, User user);

  boolean isAllowedToViewStudentNames(Run run, User user);

  JSONObject transferRunOwnership(Long runId, String teacherUsername)
      throws ObjectNotFoundException;
}
