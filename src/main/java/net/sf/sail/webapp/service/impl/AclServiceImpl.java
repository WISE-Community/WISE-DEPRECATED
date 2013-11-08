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
package net.sf.sail.webapp.service.impl;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import net.sf.sail.webapp.domain.Persistable;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.service.AclService;


import org.springframework.beans.factory.annotation.Required;
import org.springframework.security.core.Authentication;
import org.springframework.security.acls.model.AccessControlEntry;
import org.springframework.security.acls.model.MutableAcl;
import org.springframework.security.acls.model.MutableAclService;
import org.springframework.security.acls.model.NotFoundException;
import org.springframework.security.acls.model.Permission;
import org.springframework.security.acls.model.ObjectIdentity;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.security.acls.domain.ObjectIdentityImpl;
import org.springframework.security.acls.domain.PrincipalSid;
import org.springframework.security.acls.model.Sid;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * A class which allows creation of access control lists for any object.
 * 
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public class AclServiceImpl<T extends Persistable> implements AclService<T> {

	private MutableAclService mutableAclService;

	/**
	 * @param mutableAclService
	 *            the mutableAclService to set
	 */
	@Required
	public void setMutableAclService(MutableAclService mutableAclService) {
		this.mutableAclService = mutableAclService;
	}

	/**
	 * @see net.sf.sail.webapp.service.AclService#addPermission(java.lang.Object)
	 */
	public void addPermission(T object, Permission permission) {
		if (object != null) {	
			MutableAcl acl = null;
			ObjectIdentity objectIdentity = new ObjectIdentityImpl(object.getClass(), object
					.getId());

	        try {
	            acl = (MutableAcl) mutableAclService.readAclById(objectIdentity);
	        } catch (NotFoundException nfe) {
	            acl = mutableAclService.createAcl(objectIdentity);
	        }
	        // add this new ace at the end of the acl.
			acl.insertAce(acl.getEntries().size(), permission,
					new PrincipalSid(this.getAuthentication()), true);
			this.mutableAclService.updateAcl(acl);
		} else {
			throw new IllegalArgumentException(
					"Cannot create ACL. Object not set.");
		}
	}

	/**
	 * @see net.sf.sail.webapp.service.AclService#addPermission(java.lang.Object, org.acegisecurity.acls.Permission, org.acegisecurity.Authentication)
	 */
	public void addPermission(T object, Permission permission, User user) {
		if (object != null) {	
			MutableAcl acl = null;
			ObjectIdentity objectIdentity = new ObjectIdentityImpl(object.getClass(), object
					.getId());
			
	        try {
	            acl = (MutableAcl) mutableAclService.readAclById(objectIdentity);
	        } catch (NotFoundException nfe) {
	            acl = mutableAclService.createAcl(objectIdentity);
	        }
	        // add this new ace at the end of the acl.
			acl.insertAce(acl.getEntries().size(), permission,
					new PrincipalSid(user.getUserDetails().getUsername()), true);
			this.mutableAclService.updateAcl(acl);
		} else {
			throw new IllegalArgumentException(
					"Cannot create ACL. Object not set.");
		}
	}

	/**
	 * @see net.sf.sail.webapp.service.AclService#removePermission(java.lang.Object, org.acegisecurity.acls.Permission, net.sf.sail.webapp.domain.User)
	 */
	public void removePermission(T object, Permission permission, User user) {
		if (object != null) {	
			MutableAcl acl = null;
			ObjectIdentity objectIdentity = new ObjectIdentityImpl(object.getClass(), object
					.getId());
			List<Sid> sid = new ArrayList<Sid>();
			sid.add(new PrincipalSid(user.getUserDetails().getUsername()));
			
	        try {
	            acl = (MutableAcl) mutableAclService.readAclById(objectIdentity, sid);
	        } catch (NotFoundException nfe) {
	        	return;
	        }
	        List<AccessControlEntry> aces = acl.getEntries();
	        for (int i=0; i < aces.size(); i++) {
	        	AccessControlEntry ace = aces.get(i);
	        	if (ace.getPermission().equals(permission) && ace.getSid().equals(sid.get(0))) {
	        		acl.deleteAce(i);
	        	}
	        }
			this.mutableAclService.updateAcl(acl);
		} else {
			throw new IllegalArgumentException(
					"Cannot delete ACL. Object not set.");
		}		
	}

	private Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

	public List<Permission> getPermissions(T object, User user) {
		List<Permission> permissions = new ArrayList<Permission>();
		if (object != null) {	
			MutableAcl acl = null;
			ObjectIdentity objectIdentity = new ObjectIdentityImpl(object.getClass(), object
					.getId());
			List<Sid> sid = new ArrayList<Sid>();
			sid.add(new PrincipalSid(user.getUserDetails().getUsername()));
			
	        try {
	            acl = (MutableAcl) mutableAclService.readAclById(objectIdentity, sid);
	        } catch (NotFoundException nfe) {
	        	return permissions;
	        }
	        List<AccessControlEntry> aces = acl.getEntries();
	        for (AccessControlEntry ace : aces) {
	        	if (ace.getSid().equals(sid.get(0))) {
	        		permissions.add(ace.getPermission());
	        	}
	        }
	        return permissions;
		} else {
			throw new IllegalArgumentException(
					"Cannot retrieve ACL. Object not set.");
		}		
	}
	
	public List<Permission> getPermissions(T object, UserDetails userDetails) {
		List<Permission> permissions = new ArrayList<Permission>();
		if (object != null) {	
			MutableAcl acl = null;
			ObjectIdentity objectIdentity = new ObjectIdentityImpl(object.getClass(), object
					.getId());
			List<Sid> sid = new ArrayList<Sid>();
			sid.add(new PrincipalSid(userDetails.getUsername()));
			
	        try {
	            acl = (MutableAcl) mutableAclService.readAclById(objectIdentity, sid);
	        } catch (NotFoundException nfe) {
	        	return permissions;
	        }
	        List<AccessControlEntry> aces = acl.getEntries();
	        for (AccessControlEntry ace : aces) {
	        	if (ace.getSid().equals(sid.get(0))) {
	        		permissions.add(ace.getPermission());
	        	}
	        }
	        return permissions;
		} else {
			throw new IllegalArgumentException(
					"Cannot retrieve ACL. Object not set.");
		}		
	}
	
	/**
	 * @see net.sf.sail.webapp.service.AclService#hasPermission(java.lang.Object, org.springframework.security.acls.Permission, net.sf.sail.webapp.domain.User)
	 */
	public boolean hasPermission(T object, Permission permission, User user){
		
		if(object != null && permission != null && user != null){
			List<Permission> permissions = this.getPermissions(object, user);
			for(Permission p : permissions){
				if(p.getMask() >= permission.getMask()){
					return true;
				}
			}
		}
		
		return false;
	}

	/**
	 * @see net.sf.sail.webapp.service.AclService#hasPermission(java.lang.Object, org.springframework.security.acls.Permission, net.sf.sail.webapp.domain.User)
	 */
	public boolean hasPermission(T object, Permission permission, UserDetails userDetails){
		
		if(object != null && permission != null && userDetails != null){
			List<Permission> permissions = this.getPermissions(object, userDetails);
			for(Permission p : permissions){
				if(p.getMask() >= permission.getMask()){
					return true;
				}
			}
		}
		
		return false;
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
		// separate possibly comma-separated permissions string into array of permissions
		String[] permissions = ((String) permission).split(",");
		boolean hasAllPermissions = true;
		for (String permissionStr : permissions) {
			int permissionMask = Integer.valueOf((String) permissionStr);
			Permission p = null;

			if (permissionMask == BasePermission.ADMINISTRATION.getMask()) {
				p = BasePermission.ADMINISTRATION;			
			} else if (permissionMask == BasePermission.READ.getMask()) {
				p = BasePermission.READ;
			} else if (permissionMask == BasePermission.WRITE.getMask()) {
				p = BasePermission.WRITE;
			}
			hasAllPermissions &= this.hasPermission((T) targetDomainObject, p, (UserDetails) authentication.getPrincipal());
		}
		return hasAllPermissions;
	}

	@Override
	public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
		// TODO Auto-generated method stub
		return false;
	}
}
