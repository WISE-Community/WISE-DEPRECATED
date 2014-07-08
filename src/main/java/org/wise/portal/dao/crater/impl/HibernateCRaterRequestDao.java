package org.wise.portal.dao.crater.impl;

import java.util.List;


import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.crater.CRaterRequestDao;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.vle.domain.cRater.CRaterRequest;
import org.wise.vle.domain.work.StepWork;


public class HibernateCRaterRequestDao extends AbstractHibernateDao<CRaterRequest> implements CRaterRequestDao<CRaterRequest> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends CRaterRequest> getDataObjectClass() {
		return null;
	}

	public CRaterRequest getCRaterRequestById(Long id) {
		CRaterRequest cRaterRequest = null;
		
		try {
			cRaterRequest = getById(id);
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
		
		return cRaterRequest;
	}
	
	@Transactional
	public void saveCRaterRequest(CRaterRequest cRaterRequest) {
		save(cRaterRequest);
	}
	
	/**
	 * Returns a CRaterRequest for the specified StepWork and NodeStateId.
	 * @param stepWork
	 * @param nodeStateId
	 * @return
	 */
	@Transactional(readOnly=true)
	public CRaterRequest getCRaterRequestByStepWorkIdNodeStateId(StepWork stepWork, Long nodeStateId) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();

        CRaterRequest result = 
        	(CRaterRequest) session.createCriteria(CRaterRequest.class)
        		.add( Restrictions.eq("stepWork", stepWork))
        		.add( Restrictions.eq("nodeStateId", nodeStateId))
        		.uniqueResult();
        return result;		
	}
	
	/**
	 * Returns a list of CRaterRequests that have not been completed.
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly=true)
	public List<CRaterRequest> getIncompleteCRaterRequests() {
		
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        List<CRaterRequest> result = (List<CRaterRequest>) session.createCriteria(CRaterRequest.class)
        	.add(Restrictions.isNull("timeCompleted")).list();
        return result;
	}
}
