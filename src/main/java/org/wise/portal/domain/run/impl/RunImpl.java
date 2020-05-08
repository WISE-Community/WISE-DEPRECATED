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
package org.wise.portal.domain.run.impl;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SortNatural;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.portal.domain.PeriodNotFoundException;
import org.wise.portal.domain.attendance.StudentAttendance;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;

import javax.persistence.*;
import java.util.*;

/**
 * WISE "run" domain object A WISE run is an run with more information, such as starttime, stoptime,
 * runcode
 *
 * @author Hiroki Terashima
 */
@Entity
@Table(name = RunImpl.DATA_STORE_NAME)
public class RunImpl implements Run {

  @Transient
  public static final String DATA_STORE_NAME = "runs";

  @Transient
  public static final String COLUMN_NAME_STARTTIME = "start_time";

  @Transient
  public static final String COLUMN_NAME_ENDTIME = "end_time";

  @Transient
  public static final String COLUMN_NAME_RUN_CODE = "run_code";

  @Transient
  public static final String COLUMN_NAME_ARCHIVE_REMINDER_TIME = "archive_reminder";

  @Transient
  public static final String PERIODS_JOIN_TABLE_NAME = "runs_related_to_groups";

  @Transient
  public static final String PERIODS_JOIN_COLUMN_NAME = "groups_fk";

  @Transient
  public static final String RUNS_JOIN_COLUMN_NAME = "runs_fk";

  @Transient
  private static final String PROJECTS_JOIN_COLUMN_NAME = "project_fk";

  @Transient
  private static final String OWNER_COLUMN_NAME = "owner_fk";

  @Transient
  public static final String SHARED_OWNERS_JOIN_TABLE_NAME = "runs_related_to_shared_owners";

  @Transient
  public static final String SHARED_OWNERS_JOIN_COLUMN_NAME = "shared_owners_fk";

  @Transient
  public static final long serialVersionUID = 1L;

  @Transient
  private static final String COLUMN_NAME_RUNNAME = "name";

  @Transient
  private static final String COLUMN_NAME_INFO = "info";

  @Transient
  private static final String COLUMN_NAME_EXTRAS = "extras";

  @Transient
  private static final String COLUMN_NAME_MAX_WORKGROUP_SIZE = "maxWorkgroupSize";

  @Transient
  private static final String COLUMN_NAME_LOGGING_LEVEL = "loggingLevel";

  @Transient
  private static final String COLUMN_NAME_POST_LEVEL = "postLevel";

  @Transient
  private static final String COLUMN_NAME_LAST_RUN = "lastRun";

  @Transient
  private static final String COLUMN_NAME_TIMES_RUN = "timesRun";

  @Transient
  private static final String COLUMN_NAME_VERSION_ID = "versionId";

  @Transient
  private static final String COLUMN_NAME_PRIVATE_NOTES = "private_notes";

  @Transient
  private static final String COLUMN_NAME_SURVEY = "survey";

  @Transient
  private static final String COLUMN_NAME_IS_LOCKED_AFTER_END_DATE = "isLockedAfterEndDate";

  @Id
  @Getter
  @Setter
  private Long id = null;

  @Column(name = RunImpl.COLUMN_NAME_LAST_RUN)
  @Getter
  @Setter
  private Date lastRun;

  @Column(name = RunImpl.COLUMN_NAME_TIMES_RUN)
  @Getter
  @Setter
  private Integer timesRun;

  @Column(name = RunImpl.COLUMN_NAME_STARTTIME, nullable = false)
  @Getter
  @Setter
  private Date starttime;

  @Column(name = RunImpl.COLUMN_NAME_ENDTIME)
  @Getter
  @Setter
  private Date endtime;

  @Column(name = RunImpl.COLUMN_NAME_RUN_CODE, nullable = false, unique = true)
  @Getter
  @Setter
  private String runcode;

  @Column(name = RunImpl.COLUMN_NAME_ARCHIVE_REMINDER_TIME, nullable = false)
  @Getter
  @Setter
  private Date archiveReminderTime;

  @OneToMany(targetEntity = PersistentGroup.class, fetch = FetchType.LAZY)
  @JoinTable(name = PERIODS_JOIN_TABLE_NAME, joinColumns = {
      @JoinColumn(name = RUNS_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = PERIODS_JOIN_COLUMN_NAME, nullable = false))
  @SortNatural
  @Getter
  @Setter
  private Set<Group> periods = new TreeSet<Group>();

  @ManyToOne(targetEntity = UserImpl.class, fetch = FetchType.LAZY)
  @JoinColumn(name = OWNER_COLUMN_NAME, nullable = false, unique = false)
  @Getter
  @Setter
  private User owner;

  @ManyToOne(targetEntity = ProjectImpl.class, fetch = FetchType.LAZY)
  @JoinColumn(name = PROJECTS_JOIN_COLUMN_NAME, nullable = false, unique = false)
  @Getter
  @Setter
  private Project project;

  @ManyToMany(targetEntity = UserImpl.class, fetch = FetchType.LAZY)
  @JoinTable(name = SHARED_OWNERS_JOIN_TABLE_NAME, joinColumns = {
      @JoinColumn(name = RUNS_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = SHARED_OWNERS_JOIN_COLUMN_NAME, nullable = false))
  @Getter
  @Setter
  private Set<User> sharedowners = new TreeSet<User>();

  @Column(name = COLUMN_NAME_RUNNAME)
  @Getter
  @Setter
  private String name;

  @Column(name = COLUMN_NAME_INFO)
  @Getter
  @Setter
  private String info; // other info pertaining to the run

  @Column(name = COLUMN_NAME_MAX_WORKGROUP_SIZE, nullable = true)
  @Getter
  @Setter
  private Integer maxWorkgroupSize;

  @Column(name = COLUMN_NAME_EXTRAS, length = 5120000, columnDefinition = "mediumtext")
  @Getter
  @Setter
  private String extras;

  @Transient
  @Getter
  @Setter
  private List<StudentAttendance> studentAttendance;

  @Column(name = RunImpl.COLUMN_NAME_LOGGING_LEVEL)
  @Getter
  @Setter
  private Integer loggingLevel;

  @Column(name = RunImpl.COLUMN_NAME_POST_LEVEL, nullable = false)
  @Getter
  @Setter
  private Integer postLevel;

  @Column(name = RunImpl.COLUMN_NAME_VERSION_ID)
  @Getter
  @Setter
  private String versionId;

  @Column(name = COLUMN_NAME_PRIVATE_NOTES, length = 32768, columnDefinition = "text")
  @Getter
  @Setter
  private String privateNotes; // text (blob) 2^15

  @Column(name = COLUMN_NAME_SURVEY, length = 32768, columnDefinition = "text")
  @Getter
  @Setter
  private String survey; // text (blob) 2^15

  @Column(name = RunImpl.COLUMN_NAME_IS_LOCKED_AFTER_END_DATE, nullable = true)
  protected boolean isLockedAfterEndDate;

  public Group getPeriodByName(String periodName) throws PeriodNotFoundException {
    Set<Group> periods = getPeriods();
    for (Group period : periods) {
      if (period.getName().equals(periodName)) {
        return period;
      }
    }
    throw new PeriodNotFoundException("Period " + periodName + " does not exist");
  }

  public boolean isEnded() {
    return this.endtime != null && this.endtime.before(Calendar.getInstance().getTime());
  }

  public boolean isStudentAssociatedToThisRun(User studentUser) {
    return getPeriodOfStudent(studentUser) != null;
  }

  public Group getPeriodOfStudent(User studentUser) {
    for (Group period : getPeriods()) {
      if (period.getMembers().contains(studentUser)) {
        return period;
      }
    }
    return null;
  }

  public boolean isOwner(User user) {
    User owner = getOwner();
    return user.getId() == owner.getId();
  }

  public boolean isTeacherAssociatedToThisRun(User teacherUser) {
    User owner = getOwner();
    Set<User> sharedOwners = getSharedowners();
    return owner.equals(teacherUser) || sharedOwners.contains(teacherUser);
  }

  public List<User> getSharedOwnersOrderedAlphabetically() {
    List<User> sharedOwnersList = new ArrayList<User>();
    sharedOwnersList.addAll(sharedowners);
    UserAlphabeticalComparator userAlphabeticalComparator = new UserAlphabeticalComparator();
    Collections.sort(sharedOwnersList, userAlphabeticalComparator);
    return sharedOwnersList;
  }

  public boolean isPaused() {
    if (this.info != null) {
      int start = this.info.indexOf("<isPaused>");
      if (start >= 0) {
        int end = this.info.indexOf("</isPaused>");
        String isPausedStr = this.info.substring(start + 10, end);
        System.out.println(isPausedStr);
        return new Boolean(isPausedStr).booleanValue();
      }
    }
    return false;
  }

  public boolean isRealTimeEnabled() {
    String runInfoStr = this.getInfo();
    if (runInfoStr != null && runInfoStr != null) {
      try {
        JSONObject runInfo = new JSONObject(runInfoStr);
        if (runInfo.has("isRealTimeEnabled")) {
          return runInfo.getBoolean("isRealTimeEnabled");
        }
      } catch (JSONException e) {
        e.printStackTrace();
        return false;
      }
    }
    return false;
  }

  public void setRealTimeEnabled(boolean isRealTimeEnabled) {
    String runInfoStr = this.getInfo();
    JSONObject runInfo = null;
    try {
      if (runInfoStr != null && runInfoStr != null) {
        runInfo = new JSONObject(runInfoStr);
      } else {
        runInfo = new JSONObject();
      }
      runInfo.put("isRealTimeEnabled", isRealTimeEnabled);
      this.setInfo(runInfo.toString());
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  public boolean isIdeaManagerEnabled() {
    String runInfoStr = this.getInfo();
    if (runInfoStr != null && runInfoStr != null) {
      try {
        JSONObject runInfo = new JSONObject(runInfoStr);
        if (runInfo.has("isIdeaManagerEnabled")) {
          return runInfo.getBoolean("isIdeaManagerEnabled");
        }
      } catch (JSONException e) {
        e.printStackTrace();
        return false;
      }
    }
    return false;
  }

  public boolean isStudentAssetUploaderEnabled() {
    String runInfoStr = this.getInfo();
    if (runInfoStr != null && runInfoStr != null) {
      try {
        JSONObject runInfo = new JSONObject(runInfoStr);
        if (runInfo.has("isStudentAssetUploaderEnabled")) {
          return runInfo.getBoolean("isStudentAssetUploaderEnabled");
        }
      } catch (JSONException e) {
        e.printStackTrace();
        return false;
      }
    }
    return false;
  }

  public void setIdeaManagerEnabled(boolean isIdeaManagerEnabled) {
    String runInfoStr = this.getInfo();
    JSONObject runInfo = null;
    try {
      if (runInfoStr != null && runInfoStr != null) {
        runInfo = new JSONObject(runInfoStr);
      } else {
        runInfo = new JSONObject();
      }
      runInfo.put("isIdeaManagerEnabled", isIdeaManagerEnabled);
      this.setInfo(runInfo.toString());
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  public void setStudentAssetUploaderEnabled(boolean isStudentAssetUploaderEnabled) {
    String runInfoStr = this.getInfo();
    JSONObject runInfo = null;
    try {
      if (runInfoStr != null && runInfoStr != null) {
        runInfo = new JSONObject(runInfoStr);
      } else {
        runInfo = new JSONObject();
      }
      runInfo.put("isStudentAssetUploaderEnabled", isStudentAssetUploaderEnabled);
      this.setInfo(runInfo.toString());
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  public Long getStartTimeMilliseconds() {
    return this.starttime.getTime();
  }

  public Long getEndTimeMilliseconds() {
    if (this.endtime == null) {
      return null;
    } else {
      return this.endtime.getTime();
    }
  }

  public int getNumStudents() {
    int numStudents = 0;
    for (Group period : periods) {
      Set<User> members = period.getMembers();
      numStudents += members.size();
    }
    return numStudents;
  }

  public static class UserAlphabeticalComparator implements Comparator<User> {

    /**
     * Compares the user names of two User objects
     * 
     * @param user1
     *                a user object
     * @param user2
     *                a user object
     * @return -1 if the user1 user names comes before the user2 user name 0 if the user1 user name
     *         is the same as the user2 user name 1 if the user1 user name comes after the user2
     *         user name
     */
    @Override
    public int compare(User user1, User user2) {
      int result = 0;

      if (user1 != null && user2 != null) {
        MutableUserDetails userDetails1 = user1.getUserDetails();
        MutableUserDetails userDetails2 = user2.getUserDetails();
        if (userDetails1 != null && userDetails2 != null) {
          String username1 = userDetails1.getUsername();
          String username2 = userDetails2.getUsername();
          if (username1 != null && username2 != null) {
            String username1LowerCase = username1.toLowerCase();
            String username2LowerCase = username2.toLowerCase();
            result = username1LowerCase.compareTo(username2LowerCase);
          }
        }
      }
      return result;
    }
  }

  public Boolean isActive() {
    Date currentDate = new Date();
    if (currentDate.before(this.starttime)) {
      return false;
    } else if (this.endtime != null && currentDate.after(this.endtime)
        && this.isLockedAfterEndDate) {
      return false;
    } else {
      return true;
    }
  }

  public boolean isSharedTeacher(User user) {
    return this.getSharedowners().contains(user);
  }

  public boolean isLockedAfterEndDate() {
    return isLockedAfterEndDate;
  }

  public void setLockedAfterEndDate(boolean isLockedAfterEndDate) {
    this.isLockedAfterEndDate = isLockedAfterEndDate;
  }
}
