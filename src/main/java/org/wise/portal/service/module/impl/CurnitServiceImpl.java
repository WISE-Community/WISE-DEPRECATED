/**
 * Copyright (c) 2007-2015 Encore Research Group, University of Toronto
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
package org.wise.portal.service.module.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.module.CurnitDao;
import org.wise.portal.domain.module.Curnit;
import org.wise.portal.domain.module.impl.CurnitImpl;
import org.wise.portal.domain.module.impl.CurnitParameters;
import org.wise.portal.service.module.CurnitService;

/**
 * @author Laurel Williams
 */
public class CurnitServiceImpl implements CurnitService {

    @Autowired
    protected CurnitDao<Curnit> curnitDao;

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