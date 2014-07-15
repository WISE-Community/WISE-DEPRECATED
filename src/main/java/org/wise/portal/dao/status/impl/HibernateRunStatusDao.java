package org.wise.portal.dao.status.impl;


import org.hibernate.NonUniqueResultException;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.status.RunStatusDao;
import org.wise.vle.domain.status.RunStatus;

@Repository
public class HibernateRunStatusDao extends AbstractHibernateDao<RunStatus> implements RunStatusDao<RunStatus> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends RunStatus> getDataObjectClass() {
		return null;
	}

	public RunStatus getRunStatusById(Long id) {
		RunStatus runStatus = null;
		
		try {
			runStatus = getById(id);
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
		
		return runStatus;
	}
	
	@Transactional
	public void saveRunStatus(RunStatus runStatus) {
		save(runStatus);
	}
	
	/**
	 * Get a RunStatus object given the run id
	 * @param runId the run id
	 * @return the RunStatus with the given run id or null if none is found
	 */
	@Transactional
	public RunStatus getRunStatusByRunId(Long runId) {
		RunStatus result = null;
		
		try {
			Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
			
			result = (RunStatus) session.createCriteria(RunStatus.class).add(Restrictions.eq("runId", runId)).uniqueResult();
			
		} catch (NonUniqueResultException e) {
			throw e;
		}
		
		return result;
	}
}
