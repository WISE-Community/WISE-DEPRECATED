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
import net.sf.sail.webapp.dao.sds.HttpStatusCodeException;
import net.sf.sail.webapp.dao.sds.SdsCurnitDao;
import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.impl.CurnitImpl;
import net.sf.sail.webapp.domain.impl.CurnitParameters;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.service.curnit.CurnitService;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.transaction.annotation.Transactional;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public class CurnitServiceImpl implements CurnitService {

    protected SdsCurnitDao sdsCurnitDao;

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
     * @param sdsCurnitDao
     *            the sdsCurnitDao to set
     */
    @Required
    public void setSdsCurnitDao(SdsCurnitDao sdsCurnitDao) {
        this.sdsCurnitDao = sdsCurnitDao;
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
		SdsCurnit sdsCurnit = new SdsCurnit();
		sdsCurnit.setName(curnitParameters.getName());
		sdsCurnit.setUrl(curnitParameters.getUrl());
	    this.sdsCurnitDao.save(sdsCurnit);  
		
		Curnit curnit = new CurnitImpl();
		curnit.setSdsCurnit(sdsCurnit);
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
	 * @see net.sf.sail.webapp.service.curnit.CurnitService#changeCurnitName(net.sf.sail.webapp.domain.Curnit, java.lang.String)
	 */
	@Transactional()
	public void changeCurnitName(Curnit curnit, String newName) {
		// The name is stored in SdsCurnit, so only SdsCurnit should be 
		// modified and saved.
		SdsCurnit sdsCurnit = curnit.getSdsCurnit();
		sdsCurnit.setName(newName);
		this.sdsCurnitDao.save(sdsCurnit);
	}

	/**
	 * @see net.sf.sail.webapp.service.curnit.CurnitService#updateCurnit(net.sf.sail.webapp.domain.Curnit)
	 */
	@Transactional()
	public void updateCurnit(Curnit curnit) {
		SdsCurnit sdsCurnit = curnit.getSdsCurnit();
		this.sdsCurnitDao.save(sdsCurnit);
		this.curnitDao.save(curnit);
	}

	/**
	 * @see net.sf.sail.webapp.service.curnit.CurnitService#getLatestId()
	 */
	public Long getLatestId(){
		return this.curnitDao.getLatestId();
	}
}