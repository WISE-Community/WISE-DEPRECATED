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
package net.sf.sail.webapp.service.offering.impl;

import java.util.List;
import java.util.Set;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.curnit.CurnitDao;
import net.sf.sail.webapp.dao.offering.OfferingDao;
import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.impl.OfferingImpl;
import net.sf.sail.webapp.domain.impl.OfferingParameters;
import net.sf.sail.webapp.domain.webservice.http.HttpStatusCodeException;
import net.sf.sail.webapp.service.AclService;
import net.sf.sail.webapp.service.offering.OfferingService;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.transaction.annotation.Transactional;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public class OfferingServiceImpl implements OfferingService {

	private OfferingDao<Offering> offeringDao;

	protected CurnitDao<Curnit> curnitDao;

	protected AclService<Offering> aclService;

	/**
	 * @param offeringDao
	 *            the offeringDao to set
	 */
	@Required
	public void setOfferingDao(OfferingDao<Offering> offeringDao) {
		this.offeringDao = offeringDao;
	}

	/**
	 * @param curnitDao
	 *            the curnitDao to set
	 */
	@Required
	public void setCurnitDao(CurnitDao<Curnit> curnitDao) {
		this.curnitDao = curnitDao;
	}

	/**
	 * @param offeringAclService
	 *            the offeringAclService to set
	 */
	@Required
	public void setAclService(AclService<Offering> aclService) {
		this.aclService = aclService;
	}

	/**
	 * @see net.sf.sail.webapp.service.offering.OfferingService#getOfferingList()
	 */
	public List<Offering> getOfferingList() {
		return offeringDao.getList();
	}

	/**
	 * @throws ObjectNotFoundException 
	 * @see net.sf.sail.webapp.service.offering.OfferingService#getOffering(java.lang.Long)
	 */
	public Offering getOffering(Long id) throws ObjectNotFoundException {
		return offeringDao.getById(id);
	}

	/**
	 * @see net.sf.sail.webapp.service.offering.OfferingService#createOffering(Offering)
	 */
	@Transactional(rollbackFor = { HttpStatusCodeException.class, ObjectNotFoundException.class })
	public Offering createOffering(OfferingParameters offeringParameters)
			throws ObjectNotFoundException {
		Offering offering = new OfferingImpl();
		this.offeringDao.save(offering);

		this.aclService.addPermission(offering, BasePermission.ADMINISTRATION);

		return offering;
	}

	/**
	 * @see net.sf.sail.webapp.service.offering.OfferingService#getWorkgroupsForOffering(Long)
	 */
	public Set<Workgroup> getWorkgroupsForOffering(Long offeringId)
			throws ObjectNotFoundException {
		return this.offeringDao.getWorkgroupsForOffering(offeringId);
	}

}