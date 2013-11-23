package org.wise.portal.dao.peerreview.impl;

import java.util.List;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;

import org.hibernate.NonUniqueResultException;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.peerreview.PeerReviewGateDao;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.peerreview.PeerReviewGate;
import org.wise.vle.domain.peerreview.PeerReviewWork;


public class HibernatePeerReviewGateDao extends AbstractHibernateDao<PeerReviewGate> implements PeerReviewGateDao<PeerReviewGate> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends PeerReviewGate> getDataObjectClass() {
		return null;
	}

	public PeerReviewGate getPeerReviewGateById(Long id) {
		PeerReviewGate peerReviewGate = null;
		
		try {
			peerReviewGate = getById(id);
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
		
		return peerReviewGate;
	}
	
	@Transactional(readOnly = false)
	public void savePeerReviewGate(PeerReviewGate peerReviewGate) {
		save(peerReviewGate);
	}
	
	public PeerReviewGate getPeerReviewGateByRunIdPeriodIdNodeId(Long runId, Long periodId, Node node) {
		try {
			Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
			session.beginTransaction();
			PeerReviewGate result = (PeerReviewGate) session.createCriteria(PeerReviewGate.class).add(Restrictions.eq("runId", runId)).add(Restrictions.eq("periodId", periodId)).add(Restrictions.eq("node", node)).uniqueResult();
			session.getTransaction().commit();
			return result;
		} catch (NonUniqueResultException e) {
			//System.err.println("workgroupId: " + id);
			throw e;
		}
	}
	
	public PeerReviewGate getOrCreatePeerReviewGateByRunIdPeriodIdNodeId(Long runId, Long periodId, Node node) {
		PeerReviewGate peerReviewGate = getPeerReviewGateByRunIdPeriodIdNodeId(runId, periodId, node);
		if(peerReviewGate == null) {
			peerReviewGate = new PeerReviewGate();
			peerReviewGate.setRunId(runId);
			peerReviewGate.setPeriodId(periodId);
			peerReviewGate.setNode(node);
			savePeerReviewGate(peerReviewGate);
		}
		return peerReviewGate;
	}
	
	public boolean calculatePeerReviewOpen(Long runId, Long periodId, Node node,
			int numWorkgroups, int openPercentageTrigger, int openNumberTrigger) {
		PeerReviewGate peerReviewGate = getPeerReviewGateByRunIdPeriodIdNodeId(runId, periodId, node);
		
		if(peerReviewGate == null) {
			return false;
		} else if(!peerReviewGate.isOpen()) {
			List<PeerReviewWork> peerReviewWorkForRunPeriodNode = getPeerReviewWorkByRunPeriodNode(runId, periodId, node);
			
			int numWorkgroupsSubmitted = peerReviewWorkForRunPeriodNode.size();
			
			if(peerReviewGateOpenPercentageTriggerSatisfied(numWorkgroupsSubmitted, numWorkgroups, openPercentageTrigger) &&
					peerReviewGateOpenNumberTriggerSatisfied(numWorkgroupsSubmitted, openNumberTrigger)) {
				peerReviewGate.setOpen(true);
				savePeerReviewGate(peerReviewGate);
				return true;
			} else {
				return false;
			}
		} else {
			return true;
		}
	}
	
	public boolean peerReviewGateOpenPercentageTriggerSatisfied(int numWorkgroupsSubmitted, int numWorkgroups, int openPercentageTrigger) {
		if(openPercentageTrigger == 0) {
			return true;
		}
		
		if(numWorkgroups != 0) {
			double percentageSubmitted = numWorkgroupsSubmitted * 100f / numWorkgroups;
			
			if(percentageSubmitted >= openPercentageTrigger) {
				return true;
			} else {
				return false;
			}
		} else {
			//this case can technically never occur
			return false;
		}
	}

	public boolean peerReviewGateOpenNumberTriggerSatisfied(int numWorkgroupsSubmitted, int openNumberTrigger) {
		if(openNumberTrigger == 0) {
			return true;
		}
		
		if(numWorkgroupsSubmitted >= openNumberTrigger) {
			return true;
		} else {
			return false;
		}
	}
	
	private List<PeerReviewWork> getPeerReviewWorkByRunPeriodNode(Long runId, Long periodId, Node node) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<PeerReviewWork> result =  session.createCriteria(PeerReviewWork.class).add(
        		Restrictions.eq("runId", runId)).add(
        				Restrictions.eq("periodId", periodId)).add(
        						Restrictions.eq("node", node)).add(
        								Restrictions.isNotNull("stepWork")).list();
        session.getTransaction().commit();
        return result;
	}
}
