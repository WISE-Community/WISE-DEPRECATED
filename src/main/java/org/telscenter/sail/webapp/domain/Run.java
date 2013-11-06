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
package org.telscenter.sail.webapp.domain;

import java.util.Date;
import java.util.List;
import java.util.Set;

import org.telscenter.sail.webapp.domain.announcement.Announcement;
import org.telscenter.sail.webapp.domain.attendance.StudentAttendance;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.run.RunStatus;

import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.group.Group;

/**
 * TELS's representation for a length of time in which the 
 * offering becomes available for the students
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public interface Run extends Offering {

	/**
	 * @return the endtime
	 */
	public Date getEndtime();

    /**
     * @param endtime
     *            the endtime to set
     */
    public void setEndtime(Date endtime);

    /**
     * @return the starttime
     */
    public Date getStarttime();

    /**
     * @param starttime
     *            the starttime to set
     */
    public void setStarttime(Date starttime);

    /**
     * @return the runcode
     */
    public String getRuncode();

    /**
     * @param runcode
     *            the runcode to set
     */
    public void setRuncode(String runcode);

	/**
	 * @return the periods associated with this run
	 */
	public Set<Group> getPeriods();

	/**
	 * @param periods the periods to set
	 */
	public void setPeriods(Set<Group> periods);
   
	/**
	 * @return a <code>Set</code> of Users who own this run
	 */
	public Set<User> getOwners();

	/**
	 * @param owners <code>Set</code> of Users who own this run
	 */
	public void setOwners(Set<User> owners);
	
	/**
	 * Gets the project that this run uses
	 * 
	 * @return <code>Project</code> that this run uses
	 */
	public Project getProject();
	
	/**
	 * Set the project that this run uses
	 * 
	 * @param project <code>Project</code> to use for this run
	 */
	public void setProject(Project project);
	
	/**
	 * Returns the period with periodName that is associated
	 * with this run
	 * @param periodName
	 * @return Group the period with the periodName that is
	 *           associated with this run
	 * @throws <code>PeriodNotFoundException</code> if the provided
	 *           period does not exist in the database for this run
	 */
	public Group getPeriodByName(String periodName) throws PeriodNotFoundException;
	
	/**
	 * Returns whether this run has ended
	 * 
	 * @return true iff this run has ended
	 */
	public boolean isEnded();
	
	/**
	 * Returns whether the given student is already associated
	 * with this run, in any of the periods that the run is available for
	 * 
	 * @param studentUser <code>User</code> to check
	 * @return true iff the given student is associated in this
	 *     <code>Run</code> in any of the periods.
	 */
	public boolean isStudentAssociatedToThisRun(User studentUser);
	
	/**
	 * Returns the Period (<code>Group</code>) that this student is in
	 * for this run.
	 * 
	 * @param studentUser <code>User</code> to check
	 * @return the period that the student is in for this run
	 */
	public Group getPeriodOfStudent(User studentUser);
	
	
	/**
	 * Returns the shared owners for this run
	 * 
	 * @return <code>Set<User></code>
	 */
	public Set<User> getSharedowners();
	
	/**
	 * Sets the shared owners for this run
	 * 
	 * @param sharedOwners <code>Set<User></code>
	 */
	public void setSharedowners(Set<User> sharedOwners);
	
	/**
	 * Returns name of the run.
	 * 
	 * @return <cod>String</code> name of the run
	 */
	public String getName();
	
	/**
	 * Sets name of the run.
	 * 
	 * @param <cod>String</code> name of the run to save
	 */
	public void setName(String name);
	
	/**
	 * @return <code>Set<Announcement></code> all announcements for this run.
	 */
	public Set<Announcement> getAnnouncements();
	
	/**
	 * Sets all announcements for this run
	 * 
	 * @param <code>Set<Announcement></code> announcements
	 */
	public void setAnnouncements(Set<Announcement> announcements);
	
	/**
	 * returns RunSettings for this run.
	 * @return
	 */
	public RunStatus getRunStatus();
	
    /**
	 * @return the isPaused
	 */
	public boolean isPaused();

	/**
	 * @param isPaused the isPaused to set
	 */
	public void setPaused(boolean isPaused);
	
    /**
	 * @return the isPaused
	 */
	public String getInfo();
	
	/**
	 * @param isPaused the isPaused to set
	 */
	public void setInfo(String info);

	/**
	 * Sets whether or not student asset uploading is enabled for this run.
	 * @return
	 */
	public void setStudentAssetUploaderEnabled(boolean isStudentAssetUploaderEnabled);

	/**
	 * Returns whether or not student asset uploading is enabled for this run.
	 * @return
	 */
	public boolean isStudentAssetUploaderEnabled();

	/**
	 * Sets whether or not idea manager is enabled for this run.
	 * @return
	 */
	public void setIdeaManagerEnabled(boolean isIdeaManagerEnabled);

	/**
	 * Returns whether or not idea manager is enabled for this run.
	 * @return
	 */
	public boolean isIdeaManagerEnabled();
	
	/**
	 * @return <code>Integer</code> maxWorkgroupSize
	 */
	public Integer getMaxWorkgroupSize();
	
	/**
	 * @param <code>Integer</code> maxWorkgroupSize
	 */
	public void setMaxWorkgroupSize(Integer maxWorkgroupSize);
	
	/**
	 * @return <code>Date</code> archive reminder date
	 */
	public Date getArchiveReminderTime();

	/**
	 * @param <code>Date</code> the archiveReminderTime to set
	 */
	public void setArchiveReminderTime(Date archiveReminderTime);
	
	/**
	 * @return the extras
	 */
	public String getExtras();

	/**
	 * @param extras the extras to set
	 */
	public void setExtras(String extras);
	
	/**
	 * @return the loggingLevel
	 */
	public Integer getLoggingLevel();

	/**
	 * @param loggingLevel the loggingLevel to set
	 */
	public void setLoggingLevel(Integer loggingLevel);
	
	/**
	 * @return the postLevel
	 */
	public Integer getPostLevel();

	/**
	 * @param postLevel the postLevel to set
	 */
	public void setPostLevel(Integer postLevel);
	
	/**
	 * @return Date - that this run was last run
	 */
	public Date getLastRun();

	/**
	 * @param Date - that this run was last run
	 */
	public void setLastRun(Date lastRun);

	/**
	 * @return Integer - number of times this run was run
	 */
	public Integer getTimesRun();

	/**
	 * @param Integer - number of times this run was run
	 */
	public void setTimesRun(Integer timesRun);
	
	/**
	 * @return the versionId
	 */
	public String getVersionId();

	/**
	 * @param versionId the versionId to set
	 */
	public void setVersionId(String versionId);
	
	/**
	 * 
	 * @return
	 */
	public boolean isXMPPEnabled();
	
	/**
	 * 
	 * @param isXMPPEnabled
	 */
	public void setXMPPEnabled(boolean isXMPPEnabled);

	/**
	 * sets student attendance for this run
	 * @param studentAttendanceByRunIdAndPeriod
	 */
	public void setStudentAttendance(
			List<StudentAttendance> studentAttendance);

	/**
	 * sets student attendance for this run
	 * @param studentAttendanceByRunIdAndPeriod
	 */
	public List<StudentAttendance> getStudentAttendance();
}
