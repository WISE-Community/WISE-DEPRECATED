/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
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
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.dao.peerreview.impl;

import java.util.List;

import org.hibernate.NonUniqueResultException;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.peerreview.PeerReviewGateDao;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.peerreview.PeerReviewGate;
import org.wise.vle.domain.peerreview.PeerReviewWork;

@Repository
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
	
	@Transactional
	public void savePeerReviewGate(PeerReviewGate peerReviewGate) {
		save(peerReviewGate);
	}
	
	@Transactional(readOnly=true)
	public PeerReviewGate getPeerReviewGateByRunIdPeriodIdNodeId(Long runId, Long periodId, Node node) {
		try {
			Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
			PeerReviewGate result = (PeerReviewGate) session.createCriteria(PeerReviewGate.class).add(Restrictions.eq("runId", runId)).add(Restrictions.eq("periodId", periodId)).add(Restrictions.eq("node", node)).uniqueResult();
			return result;
		} catch (NonUniqueResultException e) {
			//System.err.println("workgroupId: " + id);
			throw e;
		}
	}
	
	@Transactional
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
	
	@Transactional
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
	
	@Transactional(readOnly=true)
	private List<PeerReviewWork> getPeerReviewWorkByRunPeriodNode(Long runId, Long periodId, Node node) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        List<PeerReviewWork> result =  session.createCriteria(PeerReviewWork.class).add(
        		Restrictions.eq("runId", runId)).add(
        				Restrictions.eq("periodId", periodId)).add(
        						Restrictions.eq("node", node)).add(
        								Restrictions.isNotNull("stepWork")).list();
        return result;
	}
}
