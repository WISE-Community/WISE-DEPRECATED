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
package org.telscenter.sail.webapp.service.offering;

import java.util.List;
import java.util.Set;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.service.offering.OfferingService;

import org.springframework.security.acls.model.Permission;
import org.springframework.security.annotation.Secured;
import org.springframework.transaction.annotation.Transactional;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.announcement.Announcement;
import org.telscenter.sail.webapp.domain.impl.AddSharedTeacherParameters;
import org.telscenter.sail.webapp.domain.impl.RunParameters;

/**
 * A service for working with <code>Run</code> objects
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public interface RunService extends OfferingService {

    /**
     * Creates a new <code>SdsOffering</code> on the SDS as well as an
     * <code>Run</code> object in the local data store. A side effect is
     * that the Run id is set to the value that the SDS assigns to the new
     * Run.
     * 
     * @param offeringParameters
     *            The object that encapsulate parameters for creating a run
     * @return the run created.
     */
//  @Secured( { "ROLE_TEACHER", "ROLE_ADMINISTRATOR", "ROLE_RESEARCHER", "ROLE_TA" })
	public Run createRun(RunParameters runParameters) throws ObjectNotFoundException;
	
	/**
	 * Ends this run. The side effect is that the run's endtime gets set.
	 * A Run that has ended is no longer eligible for classroom run. 
	 * 
	 * If the run is already ended, nothing happens.
	 * 
	 * @param run the <code>Run</code> to end
	 */
	public void endRun(Run run);

	/**
	 * Starts this run. The side effect is that the run's endtime gets set to null.
	 * A Run that has started becomes eligible for classroom run. 
	 * 
	 * If the run is already started, nothing happens.
	 * 
	 * @param run the <code>Run</code> to start
	 */
	public void startRun(Run run);

	/**
	 * Retrieves a list of <code>Run</code>
	 * 
	 * @return <code>List</code> of <code>Run</code>
	 */
    @Secured( { "ROLE_USER", "AFTER_ACL_COLLECTION_READ" })
    public List<Run> getRunList();
    
	/**
	 * Retrieves a list of <code>Run</code> that the specified user owns
	 * 
	 * @return <code>List</code> of <code>Run</code>
	 */
    @Secured( { "ROLE_USER", "AFTER_ACL_COLLECTION_READ" })
    public List<Run> getRunListByOwner(User owner);
    
	/**
	 * Retrieves a list of <code>Run</code> that the specified user is an shared-owner
	 * 
	 * @return <code>List</code> of <code>Run</code>
	 */
    @Secured( { "ROLE_USER", "AFTER_ACL_COLLECTION_READ" })
	public List<Run> getRunListBySharedOwner(User user);

    /**
     * Retrieves a list of all <code>Runs</code>. Only
     * adminstrators may invoke this method.
     * 
     * @return <code>List</code> of <code>Run</code>
     */
    @Secured( { "ROLE_ADMINISTRATOR", "ROLE_RESEARCHER" })
    public List<Run> getAllRunList();

    /**
     * Retrieves a list of <code>Run</code> that the given user
     * is associated with
     * 
     * @param user <code>User</code> that is associated with 0 or more runs
     * @return list of <code>Run</code> that the user is associated with
     */
    public List<Run> getRunList(User user);
    
    /**
     * Allows a user to add another user as a shared teacher of a run.
     * 
     * The user specified by the userId must exist and must have a 
     * ROLE_TEACHER.
     * 
     * The invoker of this method must either:
     * 1) have a ROLE_TEACHER authority and be the owner of the run specified
     * by runId
     * 2) have a ROLE_ADMINISTRATOR
     * 
     * The shared teacher will have the default ROLE_RUN_READ permission
     * 
     * If the user specified by the userId is already a shared teacher of
     * the specified run, nothing happens.
     * 
     * @param runId
     * @param userId
     * @throws <code>RunNotFoundException</code> when runId cannot be used 
     *          to find an existing run   
     */
    @Secured( {"ROLE_TEACHER"} )
    public void addSharedTeacherToRun(Long runId, Long userId) 
        throws ObjectNotFoundException;

    
    /**
     * Allows a user to add another user as a shared teacher of a run.
     * 
     * The user specified by the userId must exist and must have a 
     * ROLE_TEACHER.
     * 
     * The invoker of this method must either:
     * 1) have a ROLE_TEACHER authority and be the owner of the run specified
     * by runId
     * 2) have a ROLE_ADMINISTRATOR
     * 
     * The shared teacher will have the ROLES defined in the roles parameter.
     * 
     * If the user specified is already a shared teacher of the specified run,
     * her permissions on the specified run will be updated with the roles in
     * the roles parameter.
     * 
     * @param runId
     * @param userId
     * @param roles Set of ROLES that the shared teacher will have on the run
     * @throws <code>RunNotFoundException</code> when runId cannot be used 
     *          to find an existing run   
     */
    @Secured( {"ROLE_TEACHER"} )
    public void addRolesToSharedTeacher(Long runId, Long userId, Set<String> roles) throws ObjectNotFoundException;

    /**
     * @param addSharedTeacherParameters
     */
    @Secured( {"ROLE_TEACHER"} )
    @Transactional()
	public void addSharedTeacherToRun(AddSharedTeacherParameters addSharedTeacherParameters) throws ObjectNotFoundException;

    /**
     * Removes specified teacher user from specified run. If user or run does not exist, ignore.
     * @param addSharedTeacherParameters
     */
    @Secured( {"ROLE_TEACHER"} )
    @Transactional()
	public void removeSharedTeacherFromRun(String username, Long runId) throws ObjectNotFoundException;

    /**
     * Returns the permission that the specified user has on the specified run
     * 
     * @param run The <code>Run</code> that is shared.
     * @param user The <code>User</code> that shares the <code>Run</code>
     * @return A <code>String</code> containing the permission that 
     *     the user has on the run. If the user does not have permission on the run,
     *     null is returned.
     */
    @Transactional(readOnly = true)
    public String getSharedTeacherRole(Run run, User user);
    
    /**
     * Retrieves the Run domain object using the unique runcode
     * 
     * @param runcode
     *          The <code>String</code> runcode to use for lookup
     * @return <code>Run</code>
     *          The Run object with the runcode
     * @throws <code>RunNotFoundException</code> when runcode cannot be used 
     *          to find an existing run    
     */
    public Run retrieveRunByRuncode(String runcode) throws ObjectNotFoundException;
    
    /**
     * Retrieves the Run domain object using a unique runId
     * 
     * @param runId 
     *         <code>Long</code> runId to use for lookup
     * @return <code>Run</code>
     *          The Run object with the runId
     * @throws <code>RunNotFoundException</code> when runId cannot be used 
     *          to find an existing run   
     */
    public Run retrieveById(Long runId) throws ObjectNotFoundException;
    
    /**
     * Gets all of the Workgroups that are associated with this run
     * @return set of Workgroups for that are in this run
     * @throws ObjectNotFoundException when runId cannot be used 
     *     to find an existing run 
     */
    public Set<Workgroup> getWorkgroups(Long runId) throws ObjectNotFoundException;
    
    /**
     * Gets all of the Workgroups that are associated with this run
     * @return set of Workgroups for that are in this run
     * @throws ObjectNotFoundException when runId cannot be used 
     *     to find an existing run 
     * @param runId
     * 			<code>Long</code> runId to use for lookup
     * @param groupId
     *         <code>Long</code> periodId to which all returned workgroups belong
     */
    public Set<Workgroup> getWorkgroups(Long runId, Long periodId) throws ObjectNotFoundException;
    
    /**
     * Adds an Announcement to this run
     * 
     * @param <code>Long</code> runId
     * @param <code>Announcement</code> announcement
     * @throws <code>Exception</code>
     */
    public void addAnnouncementToRun(Long runId, Announcement announcement) throws Exception;
    
    /**
     * Removes an Announcement from this run
     * 
     * @param <code>Long</code> runId
     * @param <code>Announcement</code> announcement
     * @throws <code>Exception</code>
     */
    public void removeAnnouncementFromRun(Long runId, Announcement announcement) throws Exception;
    
    /**
     * Sets whether the run is paused
     * @param runId the id of the run
     * @param isPaused a String that is "true" or "false"
     * @throws Exception
     */
    public void setInfo(Long runId, String isPaused, String showNodeId) throws Exception;
    
    /**
     * Sets whether idea manager is enabled for this run or not.
     * @param runId
     * @param isEnabled
     * @throws ObjectNotFoundException 
     */
    public void setIdeaManagerEnabled(Long runId, boolean isEnabled) throws ObjectNotFoundException;

    /**
     * Sets whether student asset uploader is enabled for this run or not.
     * @param runId
     * @param isEnabled
     * @throws ObjectNotFoundException 
     */
    public void setStudentAssetUploaderEnabled(Long runId, boolean isEnabled) throws ObjectNotFoundException;
    
    /**
     * Sets whether xmpp is enabled for this run
     * @param runId
     * @param isEnabled
     * @throws ObjectNotFoundException
     */
    public void setXMPPEnabled(Long runId, boolean isEnabled) throws ObjectNotFoundException;
    
    /**
     * Given a <code>Long</code> runId, changes the archiveReminderTime to be 30 days
     * from today.
     * 
     * @param <code>Long</code> runId
     * @throws <code>ObjectNotFoundException</code>
     */
    public void extendArchiveReminderTime(Long runId) throws ObjectNotFoundException;
    
    /**
     * Given a <code>Long</code> projectId, returns the <code>Integer</code> number of
     * runs associated with that id.
     * 
     * @param <code>Long</code> id
     * @return <code>Integer</code>
     */
    public Integer getProjectUsage(Long id);
    
    /**
     * Given a <code>Long</code> projectId, returns a <code>List<Run></code> list of
     * runs associated with that id.
     * 
     * @param <code>Long</code> id
     * @return <code>Integer</code>
     */
    public List<Run> getProjectRuns(Long id);
    
    /**
     * 
     * @param run
     * @param nodeId
     * @param maxScoreValue
     */
    public void setExtras(Run run, String extras) throws Exception;
    
    /**
	 * Returns <code>boolean</code> true if the given <code>User</code> user has the
	 * given <code>Permission</code> permission for the given <code>Run</code> run,
	 * returns false otherwise.
	 * 
	 * @param run
	 * @param user
	 * @param permission
	 * @return boolean
	 */
    public boolean hasRunPermission(Run run, User user, Permission permission);
    
    /**
     * Returns a <code>List<Run></code> list of runs that were run within the
     * given <code>String</code> period. Valid periods are "today","week" and "month".
     * 
     * @param String - period
     * @return List<Run> - run list
     */
    public List<Run> getRunsRunWithinPeriod(String period);
    
    /**
     * Returns a <code>List<Run></code> list of runs ordered descending by how
     * active they are.
     * 
     * @return List<Run> - list of runs descending by activity
     */
    public List<Run> getRunsByActivity();
    
    /**
     * Updates the given <code>Run</code> run's statistics which are currently
     * the last time run and the number of times run.
     * 
     * @param Run - the run whose statistics should be updated.
     */
    public void updateRunStatistics(Long runId);
    
    /**
     * Update the name of the run with the given <code>Long</code> to that of
     * the given <code>String</code> name.
     * 
     * @param Long - runId
     * @param String - name
     */
    public void updateRunName(Long runId, String name);
    
    /**
     * Creates and adds a period with the given <code>String</code> name to
     * the run with the given <code>Long</code> runId.
     * 
     * @param Long - runId
     * @param String - name
     */
    public void addPeriodToRun(Long runId, String name);
}
