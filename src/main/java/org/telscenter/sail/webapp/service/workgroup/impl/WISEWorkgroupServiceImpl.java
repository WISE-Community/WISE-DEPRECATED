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
package org.telscenter.sail.webapp.service.workgroup.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.sds.HttpStatusCodeException;
import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.impl.WorkgroupImpl;
import net.sf.sail.webapp.domain.sds.SdsWorkgroup;
import net.sf.sail.webapp.domain.webservice.http.HttpRestTransport;
import net.sf.sail.webapp.service.annotation.AnnotationBundleService;
import net.sf.sail.webapp.service.group.GroupService;
import net.sf.sail.webapp.service.workgroup.impl.WorkgroupServiceImpl;

import org.springframework.security.acls.domain.BasePermission;
import org.springframework.transaction.annotation.Transactional;
import org.telscenter.pas.emf.pas.ECurnitmap;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.ChangeWorkgroupParameters;
import org.telscenter.sail.webapp.domain.project.ExternalProject;
import org.telscenter.sail.webapp.domain.project.impl.ProjectType;
import org.telscenter.sail.webapp.domain.project.impl.ProjectTypeVisitor;
import org.telscenter.sail.webapp.domain.workgroup.WISEWorkgroup;
import org.telscenter.sail.webapp.domain.workgroup.impl.WISEWorkgroupImpl;
import org.telscenter.sail.webapp.service.grading.GradingService;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.workgroup.WISEWorkgroupService;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class WISEWorkgroupServiceImpl extends WorkgroupServiceImpl implements
		WISEWorkgroupService {

	private AnnotationBundleService annotationBundleService;
	
	private GradingService gradingService;
	
	private GroupService groupService;
	
	/**
	 * @see org.telscenter.sail.webapp.service.workgroup.WISEWorkgroupService#createWISEWorkgroup(java.lang.String, java.util.Set, org.telscenter.sail.webapp.domain.Run, net.sf.sail.webapp.domain.group.Group)
	 */
	@Transactional(rollbackFor = { HttpStatusCodeException.class })
	public WISEWorkgroup createWISEWorkgroup(String name, Set<User> members,
			Run run, Group period) throws ObjectNotFoundException {

		WISEWorkgroup workgroup = null;
		ProjectTypeVisitor typeVisitor = new ProjectTypeVisitor();
		String result = (String) run.getProject().accept(typeVisitor);
		if (result.equals("ExternalProject") || run.getProject().getProjectType()==ProjectType.ROLOO || run.getProject().getProjectType()==ProjectType.LD) {
			workgroup = createWISEWorkgroup(members, run, null, period);
			// TODO hiroki set externalid here
			//ExternalProjectService externalProjectService = 
			
	        this.groupDao.save(workgroup.getGroup());
	        this.workgroupDao.save(workgroup);
	        
	        this.aclService.addPermission(workgroup, BasePermission.ADMINISTRATION);
	        
	        return workgroup;
		} else {
			SdsWorkgroup sdsWorkgroup = createSdsWorkgroup(name, members, run);
			workgroup = createWISEWorkgroup(members, run, sdsWorkgroup, period);
	        this.sdsWorkgroupDao.save(workgroup.getSdsWorkgroup());

	        this.groupDao.save(workgroup.getGroup());
	        this.workgroupDao.save(workgroup);
	        
	        this.aclService.addPermission(workgroup, BasePermission.ADMINISTRATION);
	        
	        ECurnitmap curnitmap = gradingService.getCurnitmap(run.getId());
	        if (curnitmap != null) {
	        	this.annotationBundleService.createAnnotationBundle(workgroup, curnitmap);
	        }

	        return workgroup;
		}
		
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
	 * @param sdsWorkgroup <code>SdsWorkgroup</code> that this 
	 *     workgroup contains
	 * @param period <code>Group</code> that this workgroup belongs in
	 * @return the created <code>WISEWorkgroup</code>
	 */
	private WISEWorkgroup createWISEWorkgroup(Set<User> members, Run run,
			SdsWorkgroup sdsWorkgroup, Group period) {
		WISEWorkgroup workgroup = new WISEWorkgroupImpl();
		for (User member : members) {
			workgroup.addMember(member);
		}
		workgroup.setOffering(run);
		workgroup.setSdsWorkgroup(sdsWorkgroup);
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
	 * @param annotationService the annotationService to set
	 */
	public void setAnnotationBundleService(AnnotationBundleService annotationBundleService) {
		this.annotationBundleService = annotationBundleService;
	}

	/**
	 * @param gradingService the gradingService to set
	 */
	public void setGradingService(GradingService gradingService) {
		this.gradingService = gradingService;
	}

	/**
	 * @param groupService the groupService to set
	 */
	public void setGroupService(GroupService groupService) {
		this.groupService = groupService;
	}

	/**
	 * @see org.telscenter.sail.webapp.service.workgroup.WISEWorkgroupService#generateWorkgroupWorkPdfUrlString(net.sf.sail.webapp.domain.webservice.http.HttpRestTransport, javax.servlet.http.HttpServletRequest, org.telscenter.sail.webapp.domain.workgroup.WISEWorkgroup)
	 */
	public String generateWorkgroupWorkPdfUrlString(
			HttpRestTransport httpRestTransport, HttpServletRequest request,
			WISEWorkgroup workgroup) {
		String workgroupWorkPdfUrlString = "";
		return workgroupWorkPdfUrlString;
	}
	
	
    /**
     * @see net.sf.sail.webapp.service.workgroup.WorkgroupService#getPreviewWorkgroupForRooloOffering(net.sf.sail.webapp.domain.Offering, net.sf.sail.webapp.domain.User)
     */
	@Override
    @Transactional(rollbackFor = { HttpStatusCodeException.class })
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
