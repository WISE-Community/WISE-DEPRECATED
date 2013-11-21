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
package net.sf.sail.webapp.service.curnit.impl;

import java.util.List;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.curnit.CurnitDao;
import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.impl.CurnitImpl;
import net.sf.sail.webapp.domain.impl.CurnitParameters;
import net.sf.sail.webapp.domain.webservice.http.HttpStatusCodeException;
import net.sf.sail.webapp.service.curnit.CurnitService;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional(rollbackFor = { HttpStatusCodeException.class })
	public Curnit createCurnit(CurnitParameters curnitParameters) {
		
		Curnit curnit = new CurnitImpl();
        this.curnitDao.save(curnit);
        return curnit;
	}

    /**
     * @throws net.sf.sail.webapp.dao.ObjectNotFoundException 
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