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
package org.wise.portal.domain.run;

import org.wise.portal.domain.PeriodNotFoundException;
import org.wise.portal.domain.Persistable;
import org.wise.portal.domain.attendance.StudentAttendance;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.user.User;

import java.util.Date;
import java.util.List;
import java.util.Set;

/**
 * WISE representation for a length of time in which the project becomes available for the students
 *
 * @author Hiroki Terashima
 */
public interface Run extends Persistable {

  /**
   * @return the id of this run
   */
  Long getId();

  void setId(Long id);

  /**
   * @return the endtime
   */
  Date getEndtime();

  /**
   * @param endtime
   *                  the endtime to set
   */
  void setEndtime(Date endtime);

  /**
   * @return the starttime
   */
  Date getStarttime();

  /**
   * @param starttime
   *                    the starttime to set
   */
  void setStarttime(Date starttime);

  /**
   * @return the runcode
   */
  String getRuncode();

  /**
   * @param runcode
   *                  the runcode to set
   */
  void setRuncode(String runcode);

  /**
   * @return the periods associated with this run
   */
  Set<Group> getPeriods();

  /**
   * @param periods
   *                  the periods to set
   */
  void setPeriods(Set<Group> periods);

  /**
   * @return User who owns this run
   */
  User getOwner();

  /**
   * @param owner
   *                User who owns this run
   */
  void setOwner(User owner);

  /**
   * Gets the project that this run uses
   *
   * @return <code>Project</code> that this run uses
   */
  Project getProject();

  /**
   * Set the project that this run uses
   *
   * @param project
   *                  <code>Project</code> to use for this run
   */
  void setProject(Project project);

  /**
   * Returns the period with periodName that is associated with this run
   * 
   * @param periodName
   * @return Group the period with the periodName that is associated with this run
   * @throws <code>PeriodNotFoundException</code>
   * if the provided period does not exist in the database for this run
   */
  Group getPeriodByName(String periodName) throws PeriodNotFoundException;

  /**
   * Returns whether this run has ended
   *
   * @return true iff this run has ended
   */
  boolean isEnded();

  /**
   * Returns whether the given student is already associated with this run, in any of the periods
   * that the run is available for
   *
   * @param studentUser
   *                      <code>User</code> to check
   * @return true iff the given student is associated in this <code>Run</code> in any of the
   *         periods.
   */
  boolean isStudentAssociatedToThisRun(User studentUser);

  boolean isOwner(User user);

  /**
   * @param teacherUser
   *                      A user object.
   * @return Whether the user is the owner or shared owner of the run.
   */
  boolean isTeacherAssociatedToThisRun(User teacherUser);

  /**
   * Returns the Period (<code>Group</code>) that this student is in for this run.
   *
   * @param studentUser
   *                      <code>User</code> to check
   * @return the period that the student is in for this run
   */
  Group getPeriodOfStudent(User studentUser);

  /**
   * Returns the shared owners for this run
   *
   * @return <code>Set<User></code>
   */
  Set<User> getSharedowners();

  /**
   * Sets the shared owners for this run
   *
   * @param sharedOwners
   *                       <code>Set<User></code>
   */
  void setSharedowners(Set<User> sharedOwners);

  /**
   * Returns name of the run.
   *
   * @return <cod>String</code> name of the run
   */
  String getName();

  /**
   * Sets name of the run.
   *
   * @param name
   *               of the run to save
   */
  void setName(String name);

  /**
   * @return the isPaused
   */
  boolean isPaused();

  /**
   * @return the isPaused
   */
  String getInfo();

  /**
   * @param info
   *               the isPaused to set
   */
  void setInfo(String info);

  /**
   * Sets whether or not student asset uploading is enabled for this run.
   * 
   * @return
   */
  void setStudentAssetUploaderEnabled(boolean isStudentAssetUploaderEnabled);

  /**
   * Returns whether or not student asset uploading is enabled for this run.
   * 
   * @return
   */
  boolean isStudentAssetUploaderEnabled();

  /**
   * Sets whether or not idea manager is enabled for this run.
   * 
   * @return
   */
  void setIdeaManagerEnabled(boolean isIdeaManagerEnabled);

  /**
   * Returns whether or not idea manager is enabled for this run.
   * 
   * @return
   */
  boolean isIdeaManagerEnabled();

  /**
   * @return <code>Integer</code> maxWorkgroupSize
   */
  Integer getMaxWorkgroupSize();

  /**
   * @param maxWorkgroupSize
   */
  void setMaxWorkgroupSize(Integer maxWorkgroupSize);

  /**
   * @return <code>Date</code> archive reminder date
   */
  Date getArchiveReminderTime();

  /**
   * @param archiveReminderTime
   *                              to set
   */
  void setArchiveReminderTime(Date archiveReminderTime);

  /**
   * @return the extras
   */
  String getExtras();

  /**
   * @param extras
   *                 the extras to set
   */
  void setExtras(String extras);

  /**
   * @return the loggingLevel
   */
  Integer getLoggingLevel();

  /**
   * @param loggingLevel
   *                       the loggingLevel to set
   */
  void setLoggingLevel(Integer loggingLevel);

  /**
   * @return the postLevel
   */
  Integer getPostLevel();

  /**
   * @param postLevel
   *                    the postLevel to set
   */
  void setPostLevel(Integer postLevel);

  /**
   * @return Date - that this run was last run
   */
  Date getLastRun();

  /**
   * @param lastRun
   *                  - when this run was last run
   */
  void setLastRun(Date lastRun);

  /**
   * @return Integer - number of times this run was run
   */
  Integer getTimesRun();

  /**
   * @param timesRun
   *                   - number of times this run was run
   */
  void setTimesRun(Integer timesRun);

  /**
   * @return the versionId
   */
  String getVersionId();

  /**
   * @param versionId
   *                    the versionId to set
   */
  void setVersionId(String versionId);

  /**
   *
   * @return
   */
  boolean isRealTimeEnabled();

  /**
   *
   * @param isRealTimeEnabled
   */
  void setRealTimeEnabled(boolean isRealTimeEnabled);

  /**
   * sets student attendance for this run
   * 
   * @param studentAttendance
   */
  void setStudentAttendance(List<StudentAttendance> studentAttendance);

  /**
   * gets student attendance for this run
   */
  List<StudentAttendance> getStudentAttendance();

  /**
   * Gets private notes for this run
   * 
   * @return String private notes for this run
   */
  String getPrivateNotes();

  /**
   * Sets private notes for this run
   * 
   * @param privateNotes
   *                       private notes for this run
   */
  void setPrivateNotes(String privateNotes);

  /**
   * Gets survey for this run
   * 
   * @return String survey for this run
   */
  String getSurvey();

  /**
   * Sets survey for this run
   * 
   * @return String survey for this run
   */
  void setSurvey(String survey);

  Long getStartTimeMilliseconds();

  Long getEndTimeMilliseconds();

  Boolean isActive();

  boolean isSharedTeacher(User user);

  int getNumStudents();

  boolean isLockedAfterEndDate();

  void setLockedAfterEndDate(boolean isLockedAfterEndDate);
}
