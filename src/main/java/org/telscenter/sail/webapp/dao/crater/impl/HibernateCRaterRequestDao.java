package org.telscenter.sail.webapp.dao.crater.impl;

import java.util.List;

import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;

import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.telscenter.sail.webapp.dao.crater.CRaterRequestDao;

import vle.domain.cRater.CRaterRequest;
import vle.domain.work.StepWork;
import vle.hibernate.HibernateUtil;

public class HibernateCRaterRequestDao extends AbstractHibernateDao<CRaterRequest> implements CRaterRequestDao<CRaterRequest> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends CRaterRequest> getDataObjectClass() {
		return null;
	}

	
	/**
	 * Returns a CRaterRequest for the specified StepWork and NodeStateId.
	 * @param stepWork
	 * @param nodeStateId
	 * @return
	 */
	public CRaterRequest getCRaterRequestByStepWorkIdNodeStateId(StepWork stepWork, Long nodeStateId) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();

        CRaterRequest result = 
        	(CRaterRequest) session.createCriteria(CRaterRequest.class)
        		.add( Restrictions.eq("stepWork", stepWork))
        		.add( Restrictions.eq("nodeStateId", nodeStateId))
        		.uniqueResult();
        session.getTransaction().commit();
        return result;		
	}
	
	/**
	 * Returns a list of CRaterRequests that have not been completed.
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<CRaterRequest> getIncompleteCRaterRequests() {
		
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<CRaterRequest> result = (List<CRaterRequest>) session.createCriteria(CRaterRequest.class)
        	.add(Restrictions.isNull("timeCompleted")).list();
        session.getTransaction().commit();
        return result;
	}
}
