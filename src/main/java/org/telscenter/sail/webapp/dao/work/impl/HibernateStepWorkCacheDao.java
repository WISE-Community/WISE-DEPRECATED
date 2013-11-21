package org.telscenter.sail.webapp.dao.work.impl;

import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;

import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.telscenter.sail.webapp.dao.work.StepWorkCacheDao;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWorkCache;
import org.wise.vle.hibernate.HibernateUtil;


public class HibernateStepWorkCacheDao extends AbstractHibernateDao<StepWorkCache> implements StepWorkCacheDao<StepWorkCache> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends StepWorkCache> getDataObjectClass() {
		return null;
	}

	/**
	 * Returns the specified userInfo's StepWorkCache. If no cache is found,
	 * returns null
	 */
	public StepWorkCache getStepWorkCacheByUserInfo(UserInfo userInfo) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        StepWorkCache result =  (StepWorkCache) session.createCriteria(StepWorkCache.class).add(Restrictions.eq("userInfo", userInfo)).uniqueResult();
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * Returns the specified userInfo's StepWorkCache with revisions or not. If no cache is found,
	 * returns null.
	 * @param userInfo
	 * @param getRevisions a boolean value whether to get the cache that contains all the revisions (true)
	 * or only the latest revision (false)
	 */
	public StepWorkCache getStepWorkCacheByUserInfoGetRevisions(UserInfo userInfo, boolean getRevisions) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        StepWorkCache result =  (StepWorkCache) session.createCriteria(StepWorkCache.class).add(Restrictions.eq("userInfo", userInfo)).add(Restrictions.eq("getRevisions", getRevisions)).uniqueResult();
        session.getTransaction().commit();
        return result;
	}
}
