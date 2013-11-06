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
package org.telscenter.sail.webapp.service.offering.impl;

import java.util.Calendar;
import java.util.List;
import java.util.Locale;
import java.util.Properties;
import java.util.Random;
import java.util.Set;
import java.util.TreeSet;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.group.GroupDao;
import net.sf.sail.webapp.dao.sds.HttpStatusCodeException;
import net.sf.sail.webapp.dao.user.UserDao;
import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.Jnlp;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.group.impl.PersistentGroup;
import net.sf.sail.webapp.domain.impl.OfferingParameters;
import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.service.offering.impl.OfferingServiceImpl;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.security.acls.model.Permission;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.transaction.annotation.Transactional;
import org.telscenter.sail.webapp.dao.offering.RunDao;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.announcement.Announcement;
import org.telscenter.sail.webapp.domain.impl.AddSharedTeacherParameters;
import org.telscenter.sail.webapp.domain.impl.RunImpl;
import org.telscenter.sail.webapp.domain.impl.RunParameters;
import org.telscenter.sail.webapp.domain.project.ExternalProject;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.impl.ProjectJnlpVisitor;
import org.telscenter.sail.webapp.domain.project.impl.ProjectType;
import org.telscenter.sail.webapp.service.authentication.UserDetailsService;
import org.telscenter.sail.webapp.service.offering.DuplicateRunCodeException;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * Services for WISE's Run Domain Object
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
public class RunServiceImpl extends OfferingServiceImpl implements RunService {

	private String DEFAULT_RUNCODE_PREFIXES = "Tiger,Lion,Fox,Owl,Panda,Hawk,Mole,Falcon,Orca,Eagle,Manta,Otter,Cat,Zebra,Flea,Wolf,Dragon,Seal,Cobra,Bug,Gecko,Fish,Koala,Mouse,Wombat,Shark,Whale,Sloth,Slug,Ant,Mantis,Bat,Rhino,Gator,Monkey,Swan,Ray,Crow,Goat,Marmot,Dog,Finch,Puffin,Fly,Camel,Kiwi,Spider,Lizard,Robin,Bear,Boa,Cow,Crab,Mule,Moth,Lynx,Moose,Skunk,Mako,Liger,Llama,Shrimp,Parrot,Pig,Clam,Urchin,Toucan,Frog,Toad,Turtle,Viper,Trout,Hare,Bee,Krill,Dodo,Tuna,Loon,Leech,Python,Wasp,Yak,Snake,Duck,Worm,Yeti";

	private static final int MAX_RUNCODE_DIGIT = 1000;

	private RunDao<Run> runDao;

	private GroupDao<Group> groupDao;
	
	private UserDao<User> userDao;
	
	private ProjectService projectService;
	
	private Properties portalProperties;

	/**
	 * @param groupDao
	 *            the groupDao to set
	 */
	@Required
	public void setGroupDao(GroupDao<Group> groupDao) {
		this.groupDao = groupDao;
	}

	/**
	 * @param runDao
	 *            the runDao to set
	 */
	@Required
	public void setRunDao(RunDao<Run> runDao) {
		this.runDao = runDao;
	}

	/**
	 * @see net.sf.sail.webapp.service.offering.OfferingService#getOfferingList()
	 */
	@Transactional()
	public List<Run> getRunList() {
		// for some reason, runDao.getList returns all runs, when it should
		// only return runs with the right privileges according to Acegi.
		return runDao.getList();
	}
	
	/**
	 * @see net.sf.sail.webapp.service.offering.OfferingService#getRunListByOwner()
	 */
	@Transactional()
	public List<Run> getRunListByOwner(User owner) {
		// for some reason, runDao.getList returns all runs, when it should
		// only return runs with the right privileges according to Acegi.
		return runDao.getRunListByOwner(owner);
	}
	
	/**
	 * @see net.sf.sail.webapp.service.offering.OfferingService#getRunListByOwner()
	 */
	@Transactional()
	public List<Run> getRunListBySharedOwner(User owner) {
		// for some reason, runDao.getList returns all runs, when it should
		// only return runs with the right privileges according to Acegi.
		return runDao.getRunListBySharedOwner(owner);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.offering.RunService#getAllRunList()
	 */
	@Transactional()
	public List<Run> getAllRunList() {
		return runDao.getList();
	}

	/**
	 * @see org.telscenter.sail.webapp.service.offering.RunService#getRunList(net.sf.sail.webapp.domain.User)
	 */
	public List<Run> getRunList(User user) {
		return this.runDao.getRunListByUserInPeriod(user);
	}

	/**
	 * Generate a random runcode
	 * @param locale 
	 * 
	 * @return the randomly generated runcode.
	 * 
	 */
	String generateRunCode(Locale locale) {
		Random rand = new Random();
		Integer digits = rand.nextInt(MAX_RUNCODE_DIGIT);
		StringBuffer sb = new StringBuffer(digits.toString());

		int max_runcode_digit_length = Integer.toString(MAX_RUNCODE_DIGIT)
				.length() - 1;
		while (sb.length() < max_runcode_digit_length) {
			sb.insert(0, "0");
		}
		String language = locale.getLanguage();  // languages is two-letter ISO639 code, like en, es, he, etc.
		
		// read in runcode prefixes from portal.properties.
		String runcodePrefixesStr = portalProperties.getProperty("runcode_prefixes_en", DEFAULT_RUNCODE_PREFIXES);
		if (portalProperties.containsKey("runcode_prefixes_"+language)) {
			runcodePrefixesStr = portalProperties.getProperty("runcode_prefixes_"+language);
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
	 * @throws CurnitNotFoundException
	 * 
	 */
	@Transactional(rollbackFor = { HttpStatusCodeException.class })
	public Run createRun(RunParameters runParameters)
			throws ObjectNotFoundException {
		Project project = runParameters.getProject();
		//Project projectCopy = projectService.copyProject(project);
		Run run = new RunImpl();
		run.setEndtime(null);
		run.setStarttime(Calendar.getInstance().getTime());
		run.setRuncode(generateUniqueRunCode(runParameters.getLocale()));
		run.setOwners(runParameters.getOwners());
		run.setMaxWorkgroupSize(runParameters.getMaxWorkgroupSize());
		run.setProject(project);
		
		//use the project name for the run name
		run.setName("" + runParameters.getProject().getName());
		
		Calendar reminderCal = Calendar.getInstance();
		reminderCal.add(Calendar.DATE, 30);
		run.setArchiveReminderTime(reminderCal.getTime());
		if (!(run.getProject() instanceof ExternalProject)) {
			if(run.getProject().getProjectType()!=ProjectType.ROLOO && run.getProject().getProjectType()!=ProjectType.LD){
				run.setSdsOffering(generateSdsOfferingFromParameters(runParameters));
			}
		}
		Set<String> periodNames = runParameters.getPeriodNames();
		if (periodNames != null) {
			Set<Group> periods = new TreeSet<Group>();
			for (String periodName : runParameters.getPeriodNames()) {
				Group group = new PersistentGroup();
				group.setName(periodName);
				this.groupDao.save(group);
				periods.add(group);
			}
			run.setPeriods(periods);
		}
		run.setPostLevel(runParameters.getPostLevel());

		/* if this is an LD project take snapshot of project for run and set versionId 
		if(run.getProject().getProjectType()==ProjectType.LD){
			String requester = run.getOwners().iterator().next().getUserDetails().getUsername();
			String versionId = this.projectService.takeSnapshot(run.getProject(), requester, "For Run " + run.getName());
			if(versionId==null || versionId.equals("failed")){
				throw new ObjectNotFoundException("Snapshot of project failed when creating the run.", RunImpl.class);
			} else{
				run.setVersionId(versionId);
			}
		}
		*/
		
		this.runDao.save(run);
		this.aclService.addPermission(run, BasePermission.ADMINISTRATION);
		return run;
	}
	
	/**
	 * Based on the type of the project, the sds_curnit_map generation request url
	 * is different.
	 * 
	 * @see net.sf.sail.webapp.service.offering.impl.OfferingServiceImpl#generateSdsOfferingFromParameters(net.sf.sail.webapp.domain.impl.OfferingParameters)
	 */
	@Override
	protected SdsOffering generateSdsOfferingFromParameters(
			OfferingParameters offeringParameters)
			throws ObjectNotFoundException {
		RunParameters runParameters = (RunParameters) offeringParameters;
		SdsOffering sdsOffering = new SdsOffering();
		sdsOffering.setName(runParameters.getName());
		Curnit curnit = runParameters.getProject().getCurnit();
		sdsOffering.setSdsCurnit(curnit.getSdsCurnit());
		Jnlp jnlp = (Jnlp) runParameters.getProject().accept(new ProjectJnlpVisitor());
		
		if (jnlp == null) {
			List<Jnlp> jnlpList = this.jnlpDao.getList();
			jnlp = jnlpList.get(0);
		}
		sdsOffering.setSdsJnlp(jnlp.getSdsJnlp());
		
		this.sdsOfferingDao.save(sdsOffering);
		return sdsOffering;
	}

	
	/**
	 * @see org.telscenter.sail.webapp.service.offering.RunService#addRolesToSharedTeacher(java.lang.Long, java.lang.Long, java.util.Set)
	 */
	public void addRolesToSharedTeacher(Long runId, Long userId,
			Set<String> roles) throws ObjectNotFoundException {
		// TODO Auto-generated method stub
		
		Run run = runDao.getById(runId);
		User user = userDao.getById(userId);
		//user.getUserDetails().
		//aclService.addPermission(run, permission)
	}

	/**
	 * @override @see org.telscenter.sail.webapp.service.offering.RunService#addSharedTeacherToRun(org.telscenter.sail.webapp.domain.impl.AddSharedTeacherParameters)
	 */
	public void addSharedTeacherToRun(
			AddSharedTeacherParameters addSharedTeacherParameters) {
		Run run = addSharedTeacherParameters.getRun();
		String sharedOwnerUsername = addSharedTeacherParameters.getSharedOwnerUsername();
		User user = userDao.retrieveByUsername(sharedOwnerUsername);
		run.getSharedowners().add(user);
		this.runDao.save(run);

		String permission = addSharedTeacherParameters.getPermission();
		if (permission.equals(UserDetailsService.RUN_GRADE_ROLE)) {
			this.aclService.removePermission(run, BasePermission.READ, user);
			this.aclService.addPermission(run, BasePermission.WRITE, user);	
		} else if (permission.equals(UserDetailsService.RUN_READ_ROLE)) {
			this.aclService.removePermission(run, BasePermission.WRITE, user);
			this.aclService.addPermission(run, BasePermission.READ, user);
		}
	}
	
	/**
	 * @throws ObjectNotFoundException 
	 * @see org.telscenter.sail.webapp.service.offering.RunService#removeSharedTeacherFromRun(java.lang.String, java.lang.Long)
	 */
	public void removeSharedTeacherFromRun(String username, Long runId) throws ObjectNotFoundException {
		Run run = this.retrieveById(runId);
		User user = userDao.retrieveByUsername(username);
		if (run == null || user == null) {
			return;
		}
		
		if (run.getSharedowners().contains(user)) {
			run.getSharedowners().remove(user);
			this.runDao.save(run);
			try {
				List<Permission> permissions = this.aclService.getPermissions(run, user);
				for (Permission permission : permissions) {
					this.aclService.removePermission(run, permission, user);
				}
			} catch (Exception e) {
				// do nothing. permissions might get be deleted if user requesting the deletion is not the owner of the run.
			}
			
		}
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.offering.RunService#getSharedTeacherRole(org.telscenter.sail.webapp.domain.Run, net.sf.sail.webapp.domain.User)
	 */
	public String getSharedTeacherRole(Run run, User user) {
		List<Permission> permissions = this.aclService.getPermissions(run, user);
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

	
	/**
	 * @see org.telscenter.sail.webapp.service.offering.RunService#addSharedTeacherToRun(java.lang.Long, java.lang.Long)
	 */
	@Transactional()
	public void addSharedTeacherToRun(Long runId, Long userId)
			throws ObjectNotFoundException {
		Set<String> roles = new TreeSet<String>();
		roles.add(UserDetailsService.RUN_READ_ROLE);
		
		addRolesToSharedTeacher(runId, userId, roles);
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
	 *            A unique string.
	 * 
	 * @throws DuplicateRunCodeException
	 *             if the run's runcde already exists in the data store
	 */
	private void checkForRunCodeDuplicate(String runCode)
			throws DuplicateRunCodeException {
		try {
			this.runDao.retrieveByRunCode(runCode);
		} catch (ObjectNotFoundException e) {
			return;
		}
		throw new DuplicateRunCodeException("Runcode " + runCode
				+ " already exists.");
	}

	// /**
	// * @see
	// org.telscenter.sail.webapp.service.offering.RunService#isRunCodeInDB(java.lang.String)
	// */
	// public boolean isRunCodeInDB(String runcode) {
	// return runDao.hasRuncode(runcode);
	// }

	/**
	 * @see org.telscenter.sail.webapp.service.offering.RunService#retrieveRunByRuncode(java.lang.String)
	 */
	public Run retrieveRunByRuncode(String runcode)
			throws ObjectNotFoundException {
		return runDao.retrieveByRunCode(runcode);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.offering.RunService#retrieveById(java.lang.Long)
	 */
	public Run retrieveById(Long runId) throws ObjectNotFoundException {
		return runDao.getById(runId);
	}

	/**
	 * @see org.telscenter.sail.webapp.service.offering.RunService#endRun(Run)
	 */
	@Transactional()
	public void endRun(Run run) {
		if (run.getEndtime() == null) {
			run.setEndtime(Calendar.getInstance().getTime());
			this.runDao.save(run);
		}
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.offering.RunService#startRun(Run)
	 */
	@Transactional()
	public void startRun(Run run) {
		if (run.getEndtime() != null) {
			run.setEndtime(null);
			Calendar reminderCal = Calendar.getInstance();
			reminderCal.add(Calendar.DATE, 30);
			run.setArchiveReminderTime(reminderCal.getTime());
			this.runDao.save(run);
		}
	}

	/**
	 * @see org.telscenter.sail.webapp.service.offering.RunService#getWorkgroups(Long)
	 */
	public Set<Workgroup> getWorkgroups(Long runId) 
	     throws ObjectNotFoundException {
		return this.runDao.getWorkgroupsForOffering(runId);
	}

	/**
	 * @override @see org.telscenter.sail.webapp.service.offering.RunService#getWorkgroups(java.lang.Long, net.sf.sail.webapp.domain.group.Group)
	 */
	public Set<Workgroup> getWorkgroups(Long runId, Long periodId)
			throws ObjectNotFoundException {
		return this.runDao.getWorkgroupsForOfferingAndPeriod(runId, periodId);
	}

	/**
	 * @param userDao the userDao to set
	 */
	public void setUserDao(UserDao<User> userDao) {
		this.userDao = userDao;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.offering.RunService#addAnnouncementToRun(java.lang.Long, org.telscenter.sail.webapp.domain.announcement.Announcement)
	 */
	@Transactional()
	public void addAnnouncementToRun(Long runId, Announcement announcement) throws Exception{
		Run run = this.retrieveById(runId);
		run.getAnnouncements().add(announcement);
		this.runDao.save(run);
	}
	

	/**
	 * @see org.telscenter.sail.webapp.service.offering.RunService#removeAnnouncementFromRun(java.lang.Long, org.telscenter.sail.webapp.domain.announcement.Announcement)
	 */
	@Transactional()
	public void removeAnnouncementFromRun(Long runId, Announcement announcement) throws Exception{
		Run run = this.retrieveById(runId);
		run.getAnnouncements().remove(announcement);
		this.runDao.save(run);
	}
	
	@Transactional()
	public void setInfo(Long runId, String isPaused, String showNodeId) throws Exception {
		Run run = this.retrieveById(runId);

		String runInfoString = "<isPaused>" + isPaused + "</isPaused>";
		if (showNodeId != null) {
			runInfoString += "<showNodeId>" + showNodeId + "</showNodeId>";
		}
		
		/*
		 * when we use the info field for more info than just isPaused this
		 * will need to be changed so it doesn't just completely overwrite
		 * the info field
		 */
		run.setInfo(runInfoString);
		this.runDao.save(run);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.offering.RunService#extendArchiveReminderTime(java.lang.Long)
	 */
	@Transactional()
	public void extendArchiveReminderTime(Long runId) throws ObjectNotFoundException{
		Run run = this.retrieveById(runId);
		
		Calendar moreTime = Calendar.getInstance();
		moreTime.add(Calendar.DATE, 30);
		
		run.setArchiveReminderTime(moreTime.getTime());
		this.runDao.save(run);
	}
	
	@Transactional()
	public Integer getProjectUsage(Long id){
		List<Run> runList = this.runDao.getRunsOfProject(id);
		if(runList == null){
			return 0;
		} else {
			return runList.size();
		}
	}
	
	@Transactional()
	public List<Run> getProjectRuns(Long id){
		List<Run> runList = this.runDao.getRunsOfProject(id);
		return runList;
	}
	
	@Transactional()
	public void setExtras(Run run, String extras) throws Exception {
		run.setExtras(extras);
		this.runDao.save(run);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.offering.RunService#hasRunPermission(org.telscenter.sail.webapp.domain.Run, net.sf.sail.webapp.domain.User, org.springframework.security.acls.Permission)
	 */
	public boolean hasRunPermission(Run run, User user, Permission permission){
		return this.aclService.hasPermission(run, permission, user);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.offering.RunService#getRunsRunWithinPeriod(java.lang.String)
	 */
	public List<Run> getRunsRunWithinPeriod(String period){
		return this.runDao.getRunsRunWithinPeriod(period);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.offering.RunService#getRunsByActivity()
	 */
	public List<Run> getRunsByActivity(){
		return this.runDao.getRunsByActivity();
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.offering.RunService#updateRunStatistics(org.telscenter.sail.webapp.domain.Run)
	 */
	@Transactional()
	public void updateRunStatistics(Long runId){
		
		try {
			Run run = retrieveById(runId);
			
			/* set the current time as the last time this run was run */
			run.setLastRun(Calendar.getInstance().getTime());
			
			/* increment the number of times this run has been run, if 
			 * the run has not yet been run, the times run will be null */
			if(run.getTimesRun()==null){
				run.setTimesRun(1);
			} else {
				run.setTimesRun(run.getTimesRun() + 1);
			}
			
			/* save changes */
			this.runDao.save(run);
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
	}

	/**
	 * @see org.telscenter.sail.webapp.service.offering.RunService#updateRunName(java.lang.Long, java.lang.String)
	 */
	@Transactional()
	public void updateRunName(Long runId, String name){
		try{
			Run run = this.retrieveById(runId);
			run.setName(name);
			this.runDao.save(run);
		} catch(ObjectNotFoundException e){
			e.printStackTrace();
		}
	}
	
	@Transactional()
	public void addPeriodToRun(Long runId, String name){
		try{
			Run run = this.retrieveById(runId);
			Set<Group> periods = run.getPeriods();
			Group group = new PersistentGroup();
			group.setName(name);
			this.groupDao.save(group);
			periods.add(group);
			this.runDao.save(run);
		} catch(ObjectNotFoundException e){
			e.printStackTrace();
		}
	}
	
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}

	/**
	 * @throws ObjectNotFoundException 
	 * @see org.telscenter.sail.webapp.service.offering.RunService#setIdeaManagerEnabled(java.lang.Long, boolean)
	 */
	@Transactional
	public void setIdeaManagerEnabled(Long runId, boolean isEnabled) throws ObjectNotFoundException {
		Run run = this.retrieveById(runId);
		run.setIdeaManagerEnabled(isEnabled);
		this.runDao.save(run);
	}

	/**
	 * @throws ObjectNotFoundException 
	 * @see org.telscenter.sail.webapp.service.offering.RunService#setStudentAssetUploaderEnabled(java.lang.Long, boolean)
	 */
	@Transactional
	public void setStudentAssetUploaderEnabled(Long runId, boolean isEnabled) throws ObjectNotFoundException {
		Run run = this.retrieveById(runId);
		run.setStudentAssetUploaderEnabled(isEnabled);
		this.runDao.save(run);
	}
	
	/**
	 * @throws ObjectNotFoundException 
	 * @see org.telscenter.sail.webapp.service.offering.RunService#setXMPPEnabled(java.lang.Long, boolean)
	 */
	@Transactional
	public void setXMPPEnabled(Long runId, boolean isEnabled) throws ObjectNotFoundException {
		Run run = this.retrieveById(runId);
		run.setXMPPEnabled(isEnabled);
		this.runDao.save(run);
	}

	public void setPortalProperties(Properties portalProperties) {
		this.portalProperties = portalProperties;
	}
}
