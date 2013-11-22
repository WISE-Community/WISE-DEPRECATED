package org.wise.portal.dao.peerreview.impl;

import java.util.List;

import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;

import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.wise.portal.dao.peerreview.PeerReviewWorkDao;
import org.wise.vle.domain.annotation.Annotation;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.peerreview.PeerReviewWork;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;
import org.wise.vle.hibernate.HibernateUtil;


public class HibernatePeerReviewWorkDao extends AbstractHibernateDao<PeerReviewWork> implements PeerReviewWorkDao<PeerReviewWork> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends PeerReviewWork> getDataObjectClass() {
		return null;
	}

	public List<PeerReviewWork> getPeerReviewWorkByRun(Long runId) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<PeerReviewWork> result =  session.createCriteria(PeerReviewWork.class).add(
        		Restrictions.eq("runId", runId)).list();
        session.getTransaction().commit();
        return result;
	}
	
	public List<PeerReviewWork> getPeerReviewWorkByRunPeriodNode(Long runId, Long periodId, Node node) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<PeerReviewWork> result =  session.createCriteria(PeerReviewWork.class).add(
        		Restrictions.eq("runId", runId)).add(
        				Restrictions.eq("periodId", periodId)).add(
        						Restrictions.eq("node", node)).add(
        								Restrictions.isNotNull("stepWork")).list();
        session.getTransaction().commit();
        return result;
	}
	
	public List<PeerReviewWork> getUnassignedPeerReviewWorkList(Long runId, Long periodId, Node node) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<PeerReviewWork> result =  session.createCriteria(PeerReviewWork.class).add(
        		Restrictions.eq("runId", runId)).add(
        				Restrictions.eq("periodId", periodId)).add(
        						Restrictions.eq("node", node)).add(
        								Restrictions.isNull("reviewerUserInfo")).add(
                								Restrictions.isNotNull("stepWork")).list();
        session.getTransaction().commit();
        return result;
	}
	
	public PeerReviewWork getPeerReviewWorkByRunPeriodNodeStepWorkReviewer(
			Long runId, Long periodId, Node node, StepWork stepWork, UserInfo reviewer) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<PeerReviewWork> result =  session.createCriteria(PeerReviewWork.class).add(
        		Restrictions.eq("runId", runId)).add(
        				Restrictions.eq("periodId", periodId)).add(
        						Restrictions.eq("node", node)).add(
        								Restrictions.eq("stepWork", stepWork)).add(
        										Restrictions.eq("reviewerUserInfo", reviewer)).add(
        		        								Restrictions.isNotNull("stepWork")).list();
        session.getTransaction().commit();
        PeerReviewWork peerReviewWork = null;
        if(result.size() > 0) {
        	peerReviewWork = result.get(0);
        }
        return peerReviewWork;
	}
	
	public PeerReviewWork setPeerReviewAnnotation(
			Long runId, Long periodId, Node node, StepWork stepWork, UserInfo reviewer, Annotation annotation) {
		PeerReviewWork peerReviewWork = getPeerReviewWorkByRunPeriodNodeStepWorkReviewer(runId, periodId, node, stepWork, reviewer);
		peerReviewWork.setAnnotation(annotation);
		peerReviewWork.saveOrUpdate();
		return peerReviewWork;
	}


	public PeerReviewWork getPeerReviewWorkByRunPeriodNodeReviewerUserInfo(Long runId, Long periodId, Node node, UserInfo reviewerUserInfo) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();
		List<PeerReviewWork> result =  session.createCriteria(PeerReviewWork.class).add(
				Restrictions.eq("runId", runId)).add(
						Restrictions.eq("periodId", periodId)).add(
								Restrictions.eq("node", node)).add(
										Restrictions.eq("reviewerUserInfo", reviewerUserInfo)).list();
		session.getTransaction().commit();
		PeerReviewWork peerReviewWork = null;
		if(result.size() > 0) {
			peerReviewWork = result.get(0);
		}
		return peerReviewWork;
	}

	public PeerReviewWork getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(Long runId, Long periodId, Node node, UserInfo worker) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<PeerReviewWork> result =  session.createCriteria(PeerReviewWork.class).add(
        		Restrictions.eq("runId", runId)).add(
        				Restrictions.eq("periodId", periodId)).add(
        						Restrictions.eq("node", node)).add(
        								Restrictions.eq("userInfo", worker)).list();
        session.getTransaction().commit();
        PeerReviewWork peerReviewWork = null;
        if(result.size() > 0) {
        	peerReviewWork = result.get(0);
        }
        return peerReviewWork;
	}
	
	public PeerReviewWork getPeerReviewWorkByRunPeriodNodeWorkerUserInfoReviewerUserInfo(
			Long runId, Long periodId, Node node, UserInfo workerUserInfo, UserInfo reviewerUserInfo) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
		session.beginTransaction();
		List<PeerReviewWork> result =  session.createCriteria(PeerReviewWork.class).add(
				Restrictions.eq("runId", runId)).add(
						Restrictions.eq("periodId", periodId)).add(
								Restrictions.eq("node", node)).add(
										Restrictions.eq("userInfo", workerUserInfo)).add(
												Restrictions.eq("reviewerUserInfo", reviewerUserInfo)).list();
		session.getTransaction().commit();
		PeerReviewWork peerReviewWork = null;
		if(result.size() > 0) {
			peerReviewWork = result.get(0);
		}
		return peerReviewWork;
	}
	
	/**
	 * Set the author as the reviewer of the PeerReviewWork
	 * @param peerReviewWork the PeerReviewWork to set
	 */
	public void setAuthorAsReviewer(PeerReviewWork peerReviewWork) {
		//get or create the author UserInfo
		UserInfo authorUserInfo = getAuthorUserInfo();
		
		//set the author UserInfo as the reviewer
		peerReviewWork.setReviewerUserInfo(authorUserInfo);
		peerReviewWork.saveOrUpdate();
	}
	
	/**
	 * Checks if the author is set as the reviewer for the given PeerReviewWork
	 * @param peerReviewWork the work to check the reviewer for
	 * @return whether the author is set as the reviewer
	 */
	public boolean isAuthorSetAsReviewer(PeerReviewWork peerReviewWork) {
		UserInfo reviewerUserInfo = peerReviewWork.getReviewerUserInfo();
		
		if(reviewerUserInfo == null) {
			//there is no reviewer set yet
			return false;
		} else if(reviewerUserInfo.getWorkgroupId().equals(PeerReviewWork.getAuthorWorkgroupId())) {
			//the author is set as the reviewer
			return true;
		} else {
			//the author is not set as the reviewer
			return false;
		}
	}
	
	/**
	 * Get the author UserInfo which has a workgroupId of -2
	 * @return the author UserInfo
	 */
	public UserInfo getAuthorUserInfo() {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		session.beginTransaction();
		UserInfo authorUserInfo = (UserInfo) session.createCriteria(UserInfo.class).add(Restrictions.eq("workgroupId", PeerReviewWork.getAuthorWorkgroupId())).uniqueResult();
		session.getTransaction().commit();
		return authorUserInfo;
	}
	
	public PeerReviewWork getOrCreateAuthorReviewWork(Long runId, Long periodId, Node node, UserInfo reviewerUserInfo) {
		UserInfo authorUserInfo = getAuthorUserInfo();
		
		PeerReviewWork authorReviewWork = getPeerReviewWorkByRunPeriodNodeWorkerUserInfoReviewerUserInfo(runId, periodId, node, authorUserInfo, reviewerUserInfo);
		
		if(authorReviewWork == null) {
			authorReviewWork = new PeerReviewWork();
			authorReviewWork.setNode(node);
			authorReviewWork.setRunId(runId);
			authorReviewWork.setUserInfo(getAuthorUserInfo());
			authorReviewWork.setReviewerUserInfo(reviewerUserInfo);
			authorReviewWork.setPeriodId(periodId);
			authorReviewWork.saveOrUpdate();
		}
		
		return authorReviewWork;
	}
	
	public PeerReviewWork setUserAsAuthorReviewer(Long runId, Long periodId, Node node, UserInfo userInfo) {
		return getOrCreateAuthorReviewWork(runId, periodId, node, userInfo);
	}
	
	public void matchUserToAuthor(Long runId, Long periodId, Node node, UserInfo userInfo, PeerReviewWork userWork) {
		setUserAsAuthorReviewer(runId, periodId, node, userInfo);
		setAuthorAsReviewer(userWork);
	}
	
	public boolean isUserReviewingAuthor(Long runId, Long periodId, Node node, UserInfo userInfo) {
		UserInfo authorUserInfo = getAuthorUserInfo();
		PeerReviewWork authorWork = getPeerReviewWorkByRunPeriodNodeWorkerUserInfoReviewerUserInfo(runId, periodId, node, authorUserInfo, userInfo);
		
		if(authorWork == null) {
			return false;
		} else {
			return true;
		}
	}
}
