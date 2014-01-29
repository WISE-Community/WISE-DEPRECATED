/**
 * Copyright (c) 2007 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.domain.run.impl;

import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.hibernate.annotations.Sort;
import org.hibernate.annotations.SortType;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.portal.domain.PeriodNotFoundException;
import org.wise.portal.domain.announcement.Announcement;
import org.wise.portal.domain.announcement.impl.AnnouncementImpl;
import org.wise.portal.domain.attendance.StudentAttendance;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.run.OfferingVisitor;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.RunStatus;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;

/**
 * WISE "run" domain object A WISE run is an offering with more information,
 * such as starttime, stoptime, runcode
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
@Entity
@Table(name = RunImpl.DATA_STORE_NAME)
public class RunImpl extends OfferingImpl implements Run {

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
    public static final String OWNERS_JOIN_TABLE_NAME = "runs_related_to_owners";
    
    @Transient
    public static final String OWNERS_JOIN_COLUMN_NAME = "owners_fk";
    
    @Transient
	private static final String PROJECTS_JOIN_COLUMN_NAME = "project_fk";
    
    @Transient
    public static final String SHARED_OWNERS = "shared_owners";
    
    @Transient
    public static final String SHARED_OWNERS_JOIN_TABLE_NAME = "runs_related_to_shared_owners";
    
    @Transient
    public static final String SHARED_OWNERS_JOIN_COLUMN_NAME = "shared_owners_fk";
    
    @Transient
    public static final String ANNOUNCEMENTS_JOIN_TABLE_NAME = "runs_related_to_announcements";
    
    @Transient
    public static final String ANNOUNCEMENTS_JOIN_COLUMN_NAME = "announcements_fk";

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
    
    @Column(name = RunImpl.COLUMN_NAME_LAST_RUN)
    private Date lastRun;
    
    @Column(name = RunImpl.COLUMN_NAME_TIMES_RUN)
    private Integer timesRun;

    @Column(name = RunImpl.COLUMN_NAME_STARTTIME, nullable = false)
    private Date starttime;

    @Column(name = RunImpl.COLUMN_NAME_ENDTIME)
    private Date endtime;

    @Column(name = RunImpl.COLUMN_NAME_RUN_CODE, nullable = false, unique = true)
    private String runcode;
    
    @Column(name = RunImpl.COLUMN_NAME_ARCHIVE_REMINDER_TIME, nullable = false)
    private Date archiveReminderTime;

	@OneToMany(targetEntity = PersistentGroup.class, fetch = FetchType.LAZY)
    @JoinTable(name = PERIODS_JOIN_TABLE_NAME, joinColumns = { @JoinColumn(name = RUNS_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = PERIODS_JOIN_COLUMN_NAME, nullable = false))
    @Sort(type = SortType.NATURAL)
    private Set<Group> periods = new TreeSet<Group>();
    
    @ManyToMany(targetEntity = UserImpl.class, fetch = FetchType.EAGER)
    @JoinTable(name = OWNERS_JOIN_TABLE_NAME, joinColumns = { @JoinColumn(name =  RUNS_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = OWNERS_JOIN_COLUMN_NAME, nullable = false))
    private Set<User> owners = new TreeSet<User>();
    
    @ManyToOne(targetEntity = ProjectImpl.class, fetch = FetchType.EAGER)
    @JoinColumn(name = PROJECTS_JOIN_COLUMN_NAME, nullable = false, unique = false)
    private Project project;
    
    @ManyToMany(targetEntity = UserImpl.class, fetch = FetchType.LAZY)
    @JoinTable(name = SHARED_OWNERS_JOIN_TABLE_NAME, joinColumns = { @JoinColumn(name =  RUNS_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = SHARED_OWNERS_JOIN_COLUMN_NAME, nullable = false))
    private Set<User> sharedowners = new TreeSet<User>();
  
    @OneToMany(targetEntity = AnnouncementImpl.class, fetch = FetchType.LAZY)
    @JoinTable(name = ANNOUNCEMENTS_JOIN_TABLE_NAME, joinColumns = { @JoinColumn(name = RUNS_JOIN_COLUMN_NAME, nullable = false) }, inverseJoinColumns = @JoinColumn(name = ANNOUNCEMENTS_JOIN_COLUMN_NAME, nullable = false))
    @Sort(type = SortType.NATURAL)
    private Set<Announcement> announcements = new TreeSet<Announcement>();
    
    @Column(name = COLUMN_NAME_RUNNAME)
    private String name;

    @Column(name = COLUMN_NAME_INFO)
    private String info;   // other info pertaining to the run
    
    @Column(name = COLUMN_NAME_MAX_WORKGROUP_SIZE, nullable = true)
    private Integer maxWorkgroupSize;

    @Column(name = COLUMN_NAME_EXTRAS, length=5120000)
    private String extras;

	//@OneToOne(cascade = CascadeType.ALL, targetEntity = RunStatusImpl.class)
    //@JoinColumn(name = COLUMN_NAME_RUNSTATUS, unique = true)
    @Transient
    private RunStatus runStatus;
    
    @Transient
    private List<StudentAttendance> studentAttendance;
    
    @Column(name = RunImpl.COLUMN_NAME_LOGGING_LEVEL)
    private Integer loggingLevel;
    
    @Column(name = RunImpl.COLUMN_NAME_POST_LEVEL)
    private Integer postLevel;
    
    @Column(name = RunImpl.COLUMN_NAME_VERSION_ID)
    private String versionId;
    
    /**
     * @return the endtime
     */
    public Date getEndtime() {
        return endtime;
    }

    /**
     * @param endtime
     *            the endtime to set
     */
    public void setEndtime(Date endtime) {
        this.endtime = endtime;
    }

    /**
     * @return the starttime
     */
    public Date getStarttime() {
        return starttime;
    }

    /**
     * @param starttime
     *            the starttime to set
     */
    public void setStarttime(Date starttime) {
        this.starttime = starttime;
    }

    /**
     * @return the runcode
     */
    public String getRuncode() {
        return runcode;
    }

    /**
     * @param runcode
     *            the runcode to set
     */
    public void setRuncode(String runcode) {
        this.runcode = runcode;
    }

	/**
	 * @return the periods
	 */
	public Set<Group> getPeriods() {
		return periods;
	}

	/**
	 * @param periods the periods to set
	 */
	public void setPeriods(Set<Group> periods) {
		this.periods = periods;
	}
	
	/**
	 * @return a <code>Set</code> of Users who own this run
	 */
	public Set<User> getOwners() {
		return owners;
	}

	/**
	 * @param owners <code>Set</code> of Users who own this run
	 */
	public void setOwners(Set<User> owners) {
		this.owners = owners;
	}
	
	/**
	 * @see org.wise.portal.domain.Run#getProject()
	 */
	public Project getProject() {
		return project;
	}

	/**
	 * @see org.wise.portal.domain.Run#setProject(org.wise.portal.domain.project.Project)
	 */
	public void setProject(Project project) {
		this.project = project;
	}
	
	/**
	 * @see org.wise.portal.domain.Run#getPeriodByName(java.lang.String)
	 */
	public Group getPeriodByName(String periodName) throws PeriodNotFoundException {
		Set<Group> periods = getPeriods();
		for (Group period : periods) {
			if (period.getName().equals(periodName)) {
				return period;
			}
		}
		throw new PeriodNotFoundException("Period " + periodName + 
				" does not exist");
	}

	/**
	 * @see org.wise.portal.domain.Run#isEnded()
	 */
	public boolean isEnded() {
		return this.endtime != null;
	}

	/**
	 * @see org.wise.portal.domain.Run#isStudentAssociatedToThisRun(User)
	 */
	public boolean isStudentAssociatedToThisRun(User studentUser) {
		return getPeriodOfStudent(studentUser) != null;
	}

	/**
	 * @see org.wise.portal.domain.Run#getPeriodOfStudent(User)
	 */
	public Group getPeriodOfStudent(User studentUser) {
		Set<Group> periods = getPeriods();
		for (Group period : periods) {
			if (period.getMembers().contains(studentUser)) {
				return period;
			}
		}
		return null;
	}

	/**
	 * @see org.wise.portal.domain.Run#getSharedowners()
	 */
	public Set<User> getSharedowners() {
		return sharedowners;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.Run#setSharedOwners(Set<User>)
	 */
	public void setSharedowners(Set<User> sharedOwners) {
		this.sharedowners = sharedOwners;		
	}

	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param name the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}
	
	/**
	 * @return the announcements
	 */
	public Set<Announcement> getAnnouncements() {
		return announcements;
	}

	/**
	 * @param announcements the announcements to set
	 */
	public void setAnnouncements(Set<Announcement> announcements) {
		this.announcements = announcements;
	}

	/**
	 * @see org.wise.portal.domain.Run#getRunStatus()
	 */
	public RunStatus getRunStatus() {
		return this.runStatus;
	}

	/**
	 * @param runStatus the runStatus to set
	 */
	public void setRunStatus(RunStatus runStatus) {
		this.runStatus = runStatus;
	}
	
    /**
	 * @return the isPaused
	 */
	public boolean isPaused() {
		if (this.info != null) {
			int start = this.info.indexOf("<isPaused>");
			if (start >=0) {
				int end = this.info.indexOf("</isPaused>");
				String isPausedStr = this.info.substring(start+10, end);
				System.out.println(isPausedStr);
				return new Boolean(isPausedStr).booleanValue();
			}
		}
		return false;
	}

	/**
	 * @param isPaused the isPaused to set
	 */
	public void setPaused(boolean isPaused) {
		this.runStatus.setPaused(isPaused);
	}

	/**
	 * @return the info
	 */
	public String getInfo() {
		return info;
	}

	/**
	 * @param info the info to set
	 */
	public void setInfo(String info) {
		this.info = info;
	}
	
	/**
	 * @return <code>Integer</code> maxWorkgroupSize
	 */
	public Integer getMaxWorkgroupSize() {
		return maxWorkgroupSize;
	}

	/**
	 * @param <code>Integer</code> maxWorkgroupSize
	 */
	public void setMaxWorkgroupSize(Integer maxWorkgroupSize) {
		this.maxWorkgroupSize = maxWorkgroupSize;
	}
	
    /**
     * @see net.sf.sail.webapp.domain.Offering#accept(net.sf.sail.webapp.domain.OfferingVisitor)
     */
	public Object accept(OfferingVisitor visitor) {
		return visitor.visit(this);
	}
	
	/**
	 * @see org.wise.portal.domain.Run#getArchiveReminderTime()
	 */
	public Date getArchiveReminderTime() {
		return archiveReminderTime;
	}

	/**
	 * @see org.wise.portal.domain.Run#setArchiveReminderTime(java.util.Date)
	 */
	public void setArchiveReminderTime(Date archiveReminderTime) {
		this.archiveReminderTime = archiveReminderTime;
	}

	/**
	 * @return the extras
	 */
	public String getExtras() {
		return extras;
	}

	/**
	 * @param extras the extras to set
	 */
	public void setExtras(String extras) {
		this.extras = extras;
	}

	/**
	 * @return the loggingLevel
	 */
	public Integer getLoggingLevel() {
		return loggingLevel;
	}

	/**
	 * @param loggingLevel the loggingLevel to set
	 */
	public void setLoggingLevel(Integer loggingLevel) {
		this.loggingLevel = loggingLevel;
	}

	/**
	 * @return the postLevel
	 */
	public Integer getPostLevel() {
		return postLevel;
	}

	/**
	 * @param postLevel the postLevel to set
	 */
	public void setPostLevel(Integer postLevel) {
		this.postLevel = postLevel;
	}

	public Date getLastRun() {
		return lastRun;
	}

	public void setLastRun(Date lastRun) {
		this.lastRun = lastRun;
	}

	public Integer getTimesRun() {
		return timesRun;
	}

	public void setTimesRun(Integer timesRun) {
		this.timesRun = timesRun;
	}
	
	/**
	 * @return the versionId
	 */
	public String getVersionId() {
		return versionId;
	}

	/**
	 * @param versionId the versionId to set
	 */
	public void setVersionId(String versionId) {
		this.versionId = versionId;
	}
	
	public boolean isXMPPEnabled() {
		String runInfoStr = this.getInfo();
		if (runInfoStr != null && runInfoStr != null) {
			try {
				JSONObject runInfo = new JSONObject(runInfoStr);
				if (runInfo.has("isXMPPEnabled")) {
					return runInfo.getBoolean("isXMPPEnabled");
				}
			} catch (JSONException e) {
				e.printStackTrace();
				return false;
			}
		}
		return false;
	}
	
	public void setXMPPEnabled(boolean isXMPPEnabled) {
		String runInfoStr = this.getInfo();
		JSONObject runInfo = null;
		try {
			if (runInfoStr != null && runInfoStr != null) {
				runInfo = new JSONObject(runInfoStr);
			} else {
				runInfo = new JSONObject();
			}
			runInfo.put("isXMPPEnabled", isXMPPEnabled);
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

	public void setStudentAssetUploaderEnabled(
			boolean isStudentAssetUploaderEnabled) {
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

	@Override
	public void setStudentAttendance(
			List<StudentAttendance> studentAttendance) {
		this.studentAttendance = studentAttendance;
	}

	@Override
	public List<StudentAttendance> getStudentAttendance() {
		return this.studentAttendance;
	}
}