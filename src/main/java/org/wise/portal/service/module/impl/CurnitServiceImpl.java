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
package org.wise.portal.service.module.impl;

import java.util.List;


import org.springframework.beans.factory.annotation.Required;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.module.CurnitDao;
import org.wise.portal.domain.module.Curnit;
import org.wise.portal.domain.module.impl.CurnitImpl;
import org.wise.portal.domain.module.impl.CurnitParameters;
import org.wise.portal.service.module.CurnitService;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public class CurnitServiceImpl implements CurnitService {

    protected CurnitDao<Curnit> curnitDao;

    /**
     * @param curnitDao
     *            the curnitDao to set
     */
    @Required
    public void setCurnitDao(CurnitDao<Curnit> curnitDao) {
        this.curnitDao = curnitDao;
    }

    /**
     * @see net.sf.sail.webapp.service.curnit.CurnitService#getCurnitList()
     */
    @Transactional(readOnly = true)
    public List<? extends Curnit> getCurnitList() {
        return this.curnitDao.getList();
    }

	/**
	 * @throws Exception 
	 * @see net.sf.sail.webapp.service.curnit.CurnitService#createCurnit(net.sf.sail.webapp.domain.impl.CurnitParameters)
	 */
    @Transactional()
	public Curnit createCurnit(CurnitParameters curnitParameters) {
		
		Curnit curnit = new CurnitImpl();
        this.curnitDao.save(curnit);
        return curnit;
	}

    /**
     * @throws org.wise.portal.dao.ObjectNotFoundException 
     * @see net.sf.sail.webapp.service.curnit.CurnitService#getById(java.lang.Long)
     */
    @Transactional(readOnly = true)
	public Curnit getById(Long curnitId) throws ObjectNotFoundException {
    	return this.curnitDao.getById(curnitId);
	}

	/**
	 * @see net.sf.sail.webapp.service.curnit.CurnitService#updateCurnit(net.sf.sail.webapp.domain.Curnit)
	 */
	@Transactional()
	public void updateCurnit(Curnit curnit) {
		this.curnitDao.save(curnit);
	}

	/**
	 * @see net.sf.sail.webapp.service.curnit.CurnitService#getLatestId()
	 */
	public Long getLatestId(){
		return this.curnitDao.getLatestId();
	}
}