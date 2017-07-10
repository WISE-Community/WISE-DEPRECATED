/**
 * Copyright (c) 2007-2017 Encore Research Group, University of Toronto
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 * 
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Public License for more details.
 *
 * You should have received a copy of the GNU Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.portal.service.workgroup.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.group.GroupDao;
import org.wise.portal.dao.workgroup.WorkgroupDao;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.impl.ChangeWorkgroupParameters;
import org.wise.portal.domain.project.impl.ProjectTypeVisitor;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.portal.service.acl.AclService;
import org.wise.portal.service.group.GroupService;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.user.UserService;
import org.wise.portal.service.workgroup.WorkgroupService;

/**
 * @author Cynick Young
 * @author Hiroki Terashima
 */
public class WorkgroupServiceImpl implements WorkgroupService {

	@Autowired 
    protected WorkgroupDao<Workgroup> workgroupDao;
    
    @Autowired
    protected GroupDao<Group> groupDao;
    
	private GroupService groupService;
    
    protected RunService runService;
    
    protected AclService<Workgroup> aclService;
    
    @Autowired
    protected UserService userService;

    /**
	 * @param aclService the aclService to set
	 */
    @Required
	public void setAclService(AclService<Workgroup> aclService) {
		this.aclService = aclService;
	}
	
	/**
	 * @see org.wise.portal.service.workgroup.WorkgroupService#createWorkgroup(String, Set, Run, Group)
	 */
	@Transactional()
	public Workgroup createWorkgroup(String name, Set<User> members,
			Run run, Group period) throws ObjectNotFoundException {

		Workgroup workgroup = null;
		ProjectTypeVisitor typeVisitor = new ProjectTypeVisitor();
		String result = (String) run.getProject().accept(typeVisitor);
		workgroup = createWorkgroup(members, run, period);

		this.groupDao.save(workgroup.getGroup());
		this.workgroupDao.save(workgroup);

		this.aclService.addPermission(workgroup, BasePermission.ADMINISTRATION);

		return workgroup;
	}

	/**
	 * A helper method to create a <code>Workgroup</code> given parameters.
	 * 
	 * A teacher can be in a Workgroup. In this case, the members
	 * provided as a parameter in this method must match the owners
	 * of the run.
	 * 
	 * @param members set of users in this workgroup
	 * @param run the <code>Run</code> that this workgroup belongs in
	 * @param period <code>Group</code> that this workgroup belongs in
	 * @return the created <code>Workgroup</code>
	 */
	private Workgroup createWorkgroup(Set<User> members, Run run, Group period) {
		Workgroup workgroup = new WorkgroupImpl();
		for (User member : members) {
			workgroup.addMember(member);
		}
		workgroup.setRun(run);
		workgroup.setPeriod(period);
		if ((run.getOwner() != null && members.size() == 1 && run.getOwner().equals(members.iterator().next())) ||
				(run.getSharedowners() != null && run.getSharedowners().containsAll(members))) {
			workgroup.setTeacherWorkgroup(true);
		}
		return workgroup;
	}
	
    /**
     * @see org.wise.portal.service.workgroup.WorkgroupService#getWorkgroupListByRunAndUser(Run, User)
     */
    @Transactional(readOnly = true)
    public List<Workgroup> getWorkgroupListByRunAndUser(Run run,
														User user) {
        return this.workgroupDao.getListByRunAndUser(run, user);
    }
    
	/**
	 * @see org.wise.portal.service.workgroup.WorkgroupService#getWorkgroupsForUser(User)
	 */
    @Transactional(readOnly = true)
	public List<Workgroup> getWorkgroupsForUser(User user) {
		// first find all of the runs that user is in.
        return this.workgroupDao.getListByUser(user);
	}

    /**
     * @see org.wise.portal.service.workgroup.WorkgroupService#addMembers(Workgroup, Set)
     */
    @Transactional()
	public void addMembers(Workgroup workgroup, Set<User> membersToAdd) {
    	for (User member : membersToAdd) {
    		workgroup.addMember(member);
    	}
        this.groupDao.save(workgroup.getGroup());
    	this.workgroupDao.save(workgroup);
	}
    
    /**
     * @see org.wise.portal.service.workgroup.WorkgroupService#removeMembers(Workgroup, Set)
     */
    @Transactional()
	public void removeMembers(Workgroup workgroup, Set<User> membersToRemove) {
    	
    	for (User member : membersToRemove) {
    		workgroup.removeMember(member);
    	}
        this.groupDao.save(workgroup.getGroup());
    	this.workgroupDao.save(workgroup);
	}
    
    /**
	 * @see org.wise.portal.service.workgroup.WorkgroupService#updateWorkgroupMembership(ChangeWorkgroupParameters)
	 */
	@Transactional()
	public Workgroup updateWorkgroupMembership(ChangeWorkgroupParameters params) throws Exception {
		Workgroup workgroupCreated = null;
		Workgroup toGroup;
		Workgroup fromGroup;
		User user = params.getStudent();
		Run run = (Run) runService.retrieveById(params.getRunId());
		Group period = groupService.retrieveById(params.getPeriodId());

		fromGroup = params.getWorkgroupFrom();
		Set<User> addMemberSet = new HashSet<User>();
		addMemberSet.add(user);
		if (params.getWorkgroupTo() == null) {
			if ((params.getWorkgroupToId() != null) && 
					(params.getWorkgroupToId().intValue() == -1)) {   		
				workgroupCreated = createWorkgroup("workgroup " + user.getUserDetails().getUsername(), addMemberSet, run, period);
			}
		} else {
			toGroup = params.getWorkgroupTo();
			this.addMembers(toGroup, addMemberSet);
		}

		if(!(fromGroup == null)){
			Set<User> removeMemberSet = new HashSet<User>();
			removeMemberSet.add(user);
			this.removeMembers(fromGroup, removeMemberSet);
		}
		return workgroupCreated;
	}

	/**
	 * @see org.wise.portal.service.workgroup.WorkgroupService#retrieveById(Long)
	 */
    public Workgroup retrieveById(Long workgroupId) throws ObjectNotFoundException {
		return workgroupDao.getById(workgroupId);
	}
    
	@Override
	public Workgroup retrieveById(Long workgroupId, boolean doEagerFetch) {
		return workgroupDao.getById(workgroupId, doEagerFetch);
	}

	/**
	 * @param runService the runService to set
	 */
	public void setRunService(RunService runService) {
		this.runService = runService;
	}

	/**
	 * @param groupService the groupService to set
	 */
	public void setGroupService(GroupService groupService) {
		this.groupService = groupService;
	}

	/**
	 * Check if a user is in any workgroup for the run
	 * @param user the user
	 * @param run the run
	 * @return whether the user is in a workgroup for the run
	 */
	public boolean isUserInAnyWorkgroupForRun(User user, Run run) {
	    
	    boolean result = false;
	    
	    List<Workgroup> workgroupsForUser = getWorkgroupListByRunAndUser(run, user);
	    
	    if (workgroupsForUser.size() > 0) {
	        result = true;
	    }
	    
	    return result;
	}
	
	/**
	 * Check if a user is in a specific workgroup for the run
	 * @param user the user
	 * @param run the run
	 * @param workgroup the workgroup
	 * @return whether the user is in the workgroup
	 */
	public boolean isUserInWorkgroupForRun(User user, Run run, Workgroup workgroup) {
	    
	    boolean result = false;
	    
	    if (user != null && workgroup != null) {
	        
	        // get all the workgroups the user is in
	        List<Workgroup> workgroupsForUser = getWorkgroupListByRunAndUser(run, user);
	        
	        // loop through all the workgroups the user is in
	        for (Workgroup tempWorkgroup : workgroupsForUser) {
	            
	            // check if the current workgroup is the one we are looking for
	            if (workgroup.equals(tempWorkgroup)) {
	                // the user is in the workgroup we are looking for
	                result = true;
	                break;
	            }
	        }
	    }
	    
	    return result;
	}
	
	/**
	 * Check if a user is in a workgroup besides the one provided for the run
	 * @param user the user
	 * @param run the run
	 * @param workgroup check if the user is in another workgroup besides this workgroup
	 * @return whether the user is in another workgroup for the run
	 */
	public boolean isUserInAnotherWorkgroupForRun(User user, Run run, Workgroup workgroup) {
        
        boolean result = false;
        
        if (user != null && workgroup != null) {
            
            // get all the workgroups the user is in
            List<Workgroup> workgroupsForUser = getWorkgroupListByRunAndUser(run, user);
            
            // loop through all the workgroups the user is in
            for (Workgroup tempWorkgroup : workgroupsForUser) {
                
                // check if the current workgroup is the one we are looking for
                if (!workgroup.equals(tempWorkgroup)) {
                    // the user is in the workgroup we are looking for
                    result = true;
                    break;
                }
            }
        }
        
        return result;
	}
}