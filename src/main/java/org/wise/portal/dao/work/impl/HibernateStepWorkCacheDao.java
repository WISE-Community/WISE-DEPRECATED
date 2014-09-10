/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). 
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * 
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
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
package org.wise.portal.dao.work.impl;

import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.work.StepWorkCacheDao;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWorkCache;

@Repository
public class HibernateStepWorkCacheDao extends AbstractHibernateDao<StepWorkCache> implements StepWorkCacheDao<StepWorkCache> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends StepWorkCache> getDataObjectClass() {
		return null;
	}
	
	public StepWorkCache getStepWorkCacheById(Long id) {
		StepWorkCache stepWorkCache = null;
		
		try {
			stepWorkCache = getById(id);
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
		
		return stepWorkCache;
	}
	
	@Transactional
	public void saveStepWorkCache(StepWorkCache stepWorkCache) {
		save(stepWorkCache);
	}

	/**
	 * Returns the specified userInfo's StepWorkCache. If no cache is found,
	 * returns null
	 */
	@Transactional(readOnly=true)
	public StepWorkCache getStepWorkCacheByUserInfo(UserInfo userInfo) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        StepWorkCache result =  (StepWorkCache) session.createCriteria(StepWorkCache.class).add(Restrictions.eq("userInfo", userInfo)).uniqueResult();
        return result;
	}
	
	/**
	 * Returns the specified userInfo's StepWorkCache with revisions or not. If no cache is found,
	 * returns null.
	 * @param userInfo
	 * @param getRevisions a boolean value whether to get the cache that contains all the revisions (true)
	 * or only the latest revision (false)
	 */
	@Transactional(readOnly=true)
	public StepWorkCache getStepWorkCacheByUserInfoGetRevisions(UserInfo userInfo, boolean getRevisions) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        StepWorkCache result =  (StepWorkCache) session.createCriteria(StepWorkCache.class).add(Restrictions.eq("userInfo", userInfo)).add(Restrictions.eq("getRevisions", getRevisions)).uniqueResult();
        return result;
	}
}
