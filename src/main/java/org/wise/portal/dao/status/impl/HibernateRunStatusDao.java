package org.wise.portal.dao.status.impl;

import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;

import org.hibernate.NonUniqueResultException;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.wise.portal.dao.status.RunStatusDao;
import org.wise.vle.domain.status.RunStatus;
import org.wise.vle.hibernate.HibernateUtil;


public class HibernateRunStatusDao extends AbstractHibernateDao<RunStatus> implements RunStatusDao<RunStatus> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends RunStatus> getDataObjectClass() {
		return null;
	}

	
	/**
	 * Get a RunStatus object given the run id
	 * @param runId the run id
	 * @return the RunStatus with the given run id or null if none is found
	 */
	public RunStatus getRunStatusByRunId(Long runId) {
		RunStatus result = null;
		
		try {
			Session session = HibernateUtil.getSessionFactory().getCurrentSession();
			session.beginTransaction();
			
			result = (RunStatus) session.createCriteria(RunStatus.class).add(Restrictions.eq("runId", runId)).uniqueResult();
			
			session.getTransaction().commit();
		} catch (NonUniqueResultException e) {
			throw e;
		}
		
		return result;
	}
}
