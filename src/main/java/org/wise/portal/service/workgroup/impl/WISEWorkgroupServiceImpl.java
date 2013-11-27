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
package org.wise.portal.service.workgroup.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;


import org.springframework.security.acls.domain.BasePermission;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.impl.ChangeWorkgroupParameters;
import org.wise.portal.domain.project.impl.ProjectTypeVisitor;
import org.wise.portal.domain.run.Offering;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.WISEWorkgroup;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WISEWorkgroupImpl;
import org.wise.portal.service.group.GroupService;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.workgroup.WISEWorkgroupService;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class WISEWorkgroupServiceImpl extends WorkgroupServiceImpl implements
WISEWorkgroupService {

	private GroupService groupService;

	/**
	 * @see org.wise.portal.service.workgroup.WISEWorkgroupService#createWISEWorkgroup(java.lang.String, java.util.Set, org.wise.portal.domain.Run, net.sf.sail.webapp.domain.group.Group)
	 */
	@Transactional()
	public WISEWorkgroup createWISEWorkgroup(String name, Set<User> members,
			Run run, Group period) throws ObjectNotFoundException {

		WISEWorkgroup workgroup = null;
		ProjectTypeVisitor typeVisitor = new ProjectTypeVisitor();
		String result = (String) run.getProject().accept(typeVisitor);
		workgroup = createWISEWorkgroup(members, run, period);

		this.groupDao.save(workgroup.getGroup());
		this.workgroupDao.save(workgroup);

		this.aclService.addPermission(workgroup, BasePermission.ADMINISTRATION);

		return workgroup;
	}

	/**
	 * A helper method to create a <code>WISEWorkgroup</code> given parameters.
	 * 
	 * A teacher can be in a WISEWorkgroup. In this case, the members
	 * provided as a parameter in this method must match the owners
	 * of the run.
	 * 
	 * @param members set of users in this workgroup
	 * @param run the <code>Run</code> that this workgroup belongs in
	 * @param period <code>Group</code> that this workgroup belongs in
	 * @return the created <code>WISEWorkgroup</code>
	 */
	private WISEWorkgroup createWISEWorkgroup(Set<User> members, Run run, Group period) {
		WISEWorkgroup workgroup = new WISEWorkgroupImpl();
		for (User member : members) {
			workgroup.addMember(member);
		}
		workgroup.setOffering(run);
		workgroup.setPeriod(period);
		if ((run.getOwners() != null && run.getOwners().containsAll(members)) ||
				(run.getSharedowners() != null && run.getSharedowners().containsAll(members))) {
			workgroup.setTeacherWorkgroup(true);
		}
		return workgroup;
	}

	/**
	 * @see net.sf.sail.webapp.service.workgroup.WorkgroupService#updateWorkgroupMembership(net.sf.sail.webapp.domain.User, net.sf.sail.webapp.domain.Workgroup, net.sf.sail.webapp.domain.Workgroup)
	 */
	@Override
	@Transactional()
	public Workgroup updateWorkgroupMembership(ChangeWorkgroupParameters params) throws Exception {
		Workgroup workgroupCreated = null;
		Workgroup toGroup;
		Workgroup fromGroup;
		User user = params.getStudent();
		Run offering = (Run) ((RunService) offeringService).retrieveById(params.getOfferingId());
		Group period = groupService.retrieveById(params.getPeriodId());

		fromGroup = params.getWorkgroupFrom();
		Set<User> addMemberSet = new HashSet<User>();
		addMemberSet.add(user);
		if (params.getWorkgroupTo() == null) {
			if ((params.getWorkgroupToId() != null) && 
					(params.getWorkgroupToId().intValue() == -1)) {   		
				workgroupCreated = createWISEWorkgroup("workgroup " + user.getUserDetails().getUsername(), addMemberSet, offering, period);
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
	 * @param groupService the groupService to set
	 */
	public void setGroupService(GroupService groupService) {
		this.groupService = groupService;
	}

	/**
	 * @see net.sf.sail.webapp.service.workgroup.WorkgroupService#getPreviewWorkgroupForRooloOffering(net.sf.sail.webapp.domain.Offering, net.sf.sail.webapp.domain.User)
	 */
	@Override
	@Transactional()
	public Workgroup getPreviewWorkgroupForRooloOffering(Offering previewOffering, User previewUser){
		List<Workgroup> listByOfferingAndUser = this.workgroupDao.getListByOfferingAndUser(previewOffering, previewUser);
		if (listByOfferingAndUser.isEmpty()) {
			WISEWorkgroup workgroup = new WISEWorkgroupImpl();
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

}
