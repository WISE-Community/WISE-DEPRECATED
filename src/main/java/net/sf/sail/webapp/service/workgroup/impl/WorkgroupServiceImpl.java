/**
 * Copyright (c) 2007 Encore Research Group, University of Toronto
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package net.sf.sail.webapp.service.workgroup.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.lang.Exception;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.group.GroupDao;
import net.sf.sail.webapp.dao.workgroup.WorkgroupDao;
import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.impl.WorkgroupImpl;
import net.sf.sail.webapp.domain.webservice.http.HttpStatusCodeException;
import net.sf.sail.webapp.service.AclService;
import net.sf.sail.webapp.service.UserService;
import net.sf.sail.webapp.service.offering.OfferingService;
import net.sf.sail.webapp.service.workgroup.WorkgroupService;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.transaction.annotation.Transactional;
import org.telscenter.sail.webapp.domain.impl.ChangeWorkgroupParameters;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public class WorkgroupServiceImpl implements WorkgroupService {

    protected WorkgroupDao<Workgroup> workgroupDao;
    
    protected GroupDao<Group> groupDao;
    
    protected OfferingService offeringService;
    
    protected AclService<Workgroup> aclService;
    
    protected UserService userService;

    /**
	 * @param aclService the aclService to set
	 */
    @Required
	public void setAclService(AclService<Workgroup> aclService) {
		this.aclService = aclService;
	}

    /**
     * @param workgroupDao
     *            the workgroupDao to set
     */
    @Required
    public void setWorkgroupDao(WorkgroupDao<Workgroup> workgroupDao) {
        this.workgroupDao = workgroupDao;
    }  

    /**
     * @see net.sf.sail.webapp.service.workgroup.WorkgroupService#createWorkgroup(net.sf.sail.webapp.domain.Workgroup, net.sf.sail.webapp.domain.Offering)
     */
    @Transactional(rollbackFor = { HttpStatusCodeException.class })
	public Workgroup createWorkgroup(String name, Set<User> members, Offering offering) {
    	Workgroup workgroup = createWorkgroup(members, offering);

    	this.groupDao.save(workgroup.getGroup());
        this.workgroupDao.save(workgroup);
        
        this.aclService.addPermission(workgroup, BasePermission.ADMINISTRATION);

        return workgroup;
    }

	/**
	 * Creates and returns a <code>Workgroup</code> given parameters
	 * 
	 * @param members Set of users in this Workgroup
	 * @param offering which <code>Offering</code> this workgroup belongs in
	 * @return created <code>Workgroup</code>
	 */
	protected Workgroup createWorkgroup(Set<User> members, Offering offering) {
		Workgroup workgroup = new WorkgroupImpl();
        for (User member : members) {
        	workgroup.addMember(member);
        }
        workgroup.setOffering(offering);
		return workgroup;
	}

    /**
     * @see net.sf.sail.webapp.service.workgroup.WorkgroupService#getWorkgroupIterator()
     */
    @Transactional(readOnly = true)
    public List<Workgroup> getWorkgroupList() {
        return this.workgroupDao.getList();
    }

    /**
     * @see net.sf.sail.webapp.service.workgroup.WorkgroupService#getWorkgroupListByOfferingAndUser(net.sf.sail.webapp.domain.Offering,
     *      net.sf.sail.webapp.domain.User)
     */
    @Transactional(readOnly = true)
    public List<Workgroup> getWorkgroupListByOfferingAndUser(Offering offering,
            User user) {
        return this.workgroupDao.getListByOfferingAndUser(offering, user);
    }
    
	/**
	 * @see net.sf.sail.webapp.service.workgroup.WorkgroupService#getWorkgroupsForUser(net.sf.sail.webapp.domain.User)
	 */
    @Transactional(readOnly = true)
	public List<Workgroup> getWorkgroupsForUser(User user) {
		// first find all of the runs that user is in.
        return this.workgroupDao.getListByUser(user);
	}

    /**
     * @see net.sf.sail.webapp.service.workgroup.WorkgroupService#createPreviewWorkgroupForOfferingIfNecessary(net.sf.sail.webapp.domain.Offering,
     *      java.util.List, net.sf.sail.webapp.domain.User)
     */
    @Transactional(rollbackFor = { HttpStatusCodeException.class })
    public List<Workgroup> createPreviewWorkgroupForOfferingIfNecessary(
            Offering offering, List<Workgroup> workgroupList, User user,
            String previewWorkgroupName) {
        if (workgroupList.isEmpty()) {

            Workgroup workgroup = new WorkgroupImpl();
            workgroup.addMember(user);
            workgroup.setOffering(offering);
            this.groupDao.save(workgroup.getGroup());
            this.workgroupDao.save(workgroup);
            
            this.aclService.addPermission(workgroup, BasePermission.ADMINISTRATION);

            workgroupList.add(workgroup);
        }
        return workgroupList;
    }
    
    /**
     * @see net.sf.sail.webapp.service.workgroup.WorkgroupService#getWorkgroupForPreviewOffering(net.sf.sail.webapp.domain.Offering)
     */
    @Transactional(rollbackFor = { HttpStatusCodeException.class })
	public Workgroup getWorkgroupForPreviewOffering(Offering previewOffering, User previewUser) {
		List<Workgroup> listByOfferingAndUser = this.workgroupDao.getListByOfferingAndUser(previewOffering, previewUser);
		if (listByOfferingAndUser.isEmpty()) {
			Workgroup workgroup = new WorkgroupImpl();
			workgroup.addMember(previewUser);
			workgroup.setOffering(previewOffering);
			
			this.groupDao.save(workgroup.getGroup());
			this.workgroupDao.save(workgroup);

			this.aclService.addPermission(workgroup, BasePermission.ADMINISTRATION);
			return workgroup;
		} else {
			return listByOfferingAndUser.get(0);
		}
	}

    /**
     * @see net.sf.sail.webapp.service.workgroup.WorkgroupService#getPreviewWorkgroupForRooloOffering(net.sf.sail.webapp.domain.Offering, net.sf.sail.webapp.domain.User)
     */
    @Transactional(rollbackFor = { HttpStatusCodeException.class })
    public Workgroup getPreviewWorkgroupForRooloOffering(Offering previewOffering, User previewUser){
    	List<Workgroup> listByOfferingAndUser = this.workgroupDao.getListByOfferingAndUser(previewOffering, previewUser);
		if (listByOfferingAndUser.isEmpty()) {
			Workgroup workgroup = new WorkgroupImpl();
			workgroup.addMember(previewUser);
			workgroup.setOffering(previewOffering);
			this.groupDao.save(workgroup.getGroup());
			this.workgroupDao.save(workgroup);
	
			this.aclService.addPermission(workgroup, BasePermission.ADMINISTRATION);
			return workgroup;   
		} else {
			return  listByOfferingAndUser.get(0);
		}
    }

    /**
     * @see net.sf.sail.webapp.service.workgroup.WorkgroupService#addMembers(net.sf.sail.webapp.domain.Workgroup, java.util.Set)
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
     * @see net.sf.sail.webapp.service.workgroup.WorkgroupService#removeMembers(Workgroup, Set)
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
     * @see net.sf.sail.webapp.service.workgroup.WorkgroupService#updateWorkgroupMembership(net.sf.sail.webapp.domain.User, net.sf.sail.webapp.domain.Workgroup, net.sf.sail.webapp.domain.Workgroup)
     */
    @Transactional()
    public Workgroup updateWorkgroupMembership(ChangeWorkgroupParameters params)throws Exception {
    	Workgroup createdWorkgroup = null;
    	Workgroup toGroup;
    	Workgroup fromGroup;
    	User user = params.getStudent();
    	Offering offering = offeringService.getOffering(params.getOfferingId());
    	
    	fromGroup = params.getWorkgroupFrom();
    	Set<User> addMemberSet = new HashSet<User>();
    	addMemberSet.add(user);
    	if (params.getWorkgroupTo() == null) {
    		createdWorkgroup = createWorkgroup("workgroup " + user.getUserDetails().getUsername(), addMemberSet, offering);
    	} else {
    		toGroup = params.getWorkgroupTo();
        	this.addMembers(toGroup, addMemberSet);
    	}
    	
    	if(!(fromGroup == null)){
        	Set<User> removeMemberSet = new HashSet<User>();
        	removeMemberSet.add(user);
    		this.removeMembers(fromGroup, removeMemberSet);
    	}
    	return createdWorkgroup;
    }

	/**
	 * @see net.sf.sail.webapp.service.workgroup.WorkgroupService#retrieveById(Long)
	 */
    public Workgroup retrieveById(Long workgroupId) throws ObjectNotFoundException {
		return workgroupDao.getById(workgroupId);
	}


	/**
	 * @param offeringService the offeringService to set
	 */
	public void setOfferingService(OfferingService offeringService) {
		this.offeringService = offeringService;
	}

	/**
	 * @param groupDao the groupDao to set
	 */
	public void setGroupDao(GroupDao<Group> groupDao) {
		this.groupDao = groupDao;
	}

	/**
	 * @param userService the userService to set
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

    // TODO HT: create method for creating workgroupname
}