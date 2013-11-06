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
package net.sf.sail.webapp.service.jnlp.impl;

import java.util.List;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.jnlp.JnlpDao;
import net.sf.sail.webapp.dao.sds.HttpStatusCodeException;
import net.sf.sail.webapp.dao.sds.SdsJnlpDao;
import net.sf.sail.webapp.domain.Jnlp;
import net.sf.sail.webapp.domain.impl.JnlpImpl;
import net.sf.sail.webapp.domain.impl.JnlpParameters;
import net.sf.sail.webapp.domain.sds.SdsJnlp;
import net.sf.sail.webapp.service.jnlp.JnlpService;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.transaction.annotation.Transactional;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public class JnlpServiceImpl implements JnlpService {

    private SdsJnlpDao sdsJnlpDao;

    private JnlpDao<Jnlp> jnlpDao;

    /**
     * @param jnlpDao
     *            the jnlpDao to set
     */
    @Required
    public void setJnlpDao(JnlpDao<Jnlp> jnlpDao) {
        this.jnlpDao = jnlpDao;
    }

    /**
     * @param sdsJnlpDao
     *            the sdsJnlpDao to set
     */
    @Required
    public void setSdsJnlpDao(SdsJnlpDao sdsJnlpDao) {
        this.sdsJnlpDao = sdsJnlpDao;
    }

    /**
     * @see net.sf.sail.webapp.service.jnlp.JnlpService#createJnlp(net.sf.sail.webapp.domain.Jnlp)
     */
    @Transactional(rollbackFor = { HttpStatusCodeException.class })
    public Jnlp createJnlp(JnlpParameters jnlpParameters) {
		//TODO LAW get the sdsJnlp and JnlpImpl from bean
    	SdsJnlp sdsJnlp = new SdsJnlp();
    	sdsJnlp.setName(jnlpParameters.getName());
    	sdsJnlp.setUrl(jnlpParameters.getUrl());
        this.sdsJnlpDao.save(sdsJnlp);
   	
    	Jnlp jnlp = new JnlpImpl();
    	jnlp.setSdsJnlp(sdsJnlp);
        this.jnlpDao.save(jnlp);
        return jnlp;
    }

    /**
     * @see net.sf.sail.webapp.service.jnlp.JnlpService#getJnlpIterator()
     */
    @Transactional(readOnly = true)
    public List<Jnlp> getJnlpList() {
        return this.jnlpDao.getList();
    }

    /**
     * @see net.sf.sail.webapp.service.jnlp.JnlpService#getById(java.lang.Long)
     */
    @Transactional(readOnly = true)
	public Jnlp getById(Long jnlpId) throws ObjectNotFoundException {
		return this.jnlpDao.getById(jnlpId);
	}
    
}