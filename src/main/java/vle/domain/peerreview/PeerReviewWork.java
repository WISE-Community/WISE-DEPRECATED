package vle.domain.peerreview;

import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

import vle.domain.PersistableDomain;
import vle.domain.annotation.Annotation;
import vle.domain.node.Node;
import vle.domain.user.UserInfo;
import vle.domain.work.StepWork;
import vle.hibernate.HibernateUtil;

@Entity
@Table(name="peerreviewwork")
@Inheritance(strategy=InheritanceType.JOINED)
public class PeerReviewWork extends PersistableDomain {

	protected static Long authorWorkgroupId = -2L;
	
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;

	@Column(name="runId")
	private Long runId = null;
	
	@Column(name="periodId")
	private Long periodId = null;
	
	@ManyToOne(cascade = {CascadeType.PERSIST})
	private UserInfo userInfo;
	
	@ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.MERGE})
	private Node node;
	
	@ManyToOne(cascade = {CascadeType.PERSIST})
	private StepWork stepWork;
	
	@ManyToOne(cascade = {CascadeType.PERSIST})
	private UserInfo reviewerUserInfo;
	
	@ManyToOne(cascade = {CascadeType.PERSIST})
	private Annotation annotation;
	
	@Override
	protected Class<?> getObjectClass() {
		// TODO Auto-generated method stub
		return null;
	}
	
	
	public Long getRunId() {
		return runId;
	}

	public void setRunId(Long runId) {
		this.runId = runId;
	}

	public Long getPeriodId() {
		return periodId;
	}

	public void setPeriodId(Long periodId) {
		this.periodId = periodId;
	}

	public UserInfo getUserInfo() {
		return userInfo;
	}

	public void setUserInfo(UserInfo userInfo) {
		this.userInfo = userInfo;
	}

	public Node getNode() {
		return node;
	}

	public void setNode(Node node) {
		this.node = node;
	}

	public StepWork getStepWork() {
		return stepWork;
	}

	public void setStepWork(StepWork stepWork) {
		this.stepWork = stepWork;
	}

	public UserInfo getReviewerUserInfo() {
		return reviewerUserInfo;
	}

	public void setReviewerUserInfo(UserInfo reviewerUserInfo) {
		this.reviewerUserInfo = reviewerUserInfo;
	}

	public Annotation getAnnotation() {
		return annotation;
	}

	public void setAnnotation(Annotation annotation) {
		this.annotation = annotation;
	}

	public static List<PeerReviewWork> getPeerReviewWorkByRun(Long runId) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<PeerReviewWork> result =  session.createCriteria(PeerReviewWork.class).add(
        		Restrictions.eq("runId", runId)).list();
        session.getTransaction().commit();
        return result;
	}
	
	public static List<PeerReviewWork> getPeerReviewWorkByRunPeriodNode(Long runId, Long periodId, Node node) {
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
	
	public static List<PeerReviewWork> getUnassignedPeerReviewWorkList(Long runId, Long periodId, Node node) {
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
	
	public static PeerReviewWork getPeerReviewWorkByRunPeriodNodeStepWorkReviewer(
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
	
	public static PeerReviewWork setPeerReviewAnnotation(
			Long runId, Long periodId, Node node, StepWork stepWork, UserInfo reviewer, Annotation annotation) {
		PeerReviewWork peerReviewWork = getPeerReviewWorkByRunPeriodNodeStepWorkReviewer(runId, periodId, node, stepWork, reviewer);
		peerReviewWork.setAnnotation(annotation);
		peerReviewWork.saveOrUpdate();
		return peerReviewWork;
	}


	public static PeerReviewWork getPeerReviewWorkByRunPeriodNodeReviewerUserInfo(Long runId, Long periodId, Node node, UserInfo reviewerUserInfo) {
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

	public static PeerReviewWork getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(Long runId, Long periodId, Node node, UserInfo worker) {
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
	
	public static PeerReviewWork getPeerReviewWorkByRunPeriodNodeWorkerUserInfoReviewerUserInfo(
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
	public static void setAuthorAsReviewer(PeerReviewWork peerReviewWork) {
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
	public static boolean isAuthorSetAsReviewer(PeerReviewWork peerReviewWork) {
		UserInfo reviewerUserInfo = peerReviewWork.getReviewerUserInfo();
		
		if(reviewerUserInfo == null) {
			//there is no reviewer set yet
			return false;
		} else if(reviewerUserInfo.getWorkgroupId().equals(getAuthorWorkgroupId())) {
			//the author is set as the reviewer
			return true;
		} else {
			//the author is not set as the reviewer
			return false;
		}
	}
	
	public static Long getAuthorWorkgroupId() {
		return authorWorkgroupId;
	}
	
	/**
	 * Get the author UserInfo which has a workgroupId of -2
	 * @return the author UserInfo
	 */
	public static UserInfo getAuthorUserInfo() {
		//get the author UserInfo which is workgroupId=-2
		UserInfo authorUserInfo = UserInfo.getOrCreateByWorkgroupId(getAuthorWorkgroupId());
		authorUserInfo.saveOrUpdate();
		return authorUserInfo;
	}
	
	public static PeerReviewWork getOrCreateAuthorReviewWork(Long runId, Long periodId, Node node, UserInfo reviewerUserInfo) {
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
	
	public static PeerReviewWork setUserAsAuthorReviewer(Long runId, Long periodId, Node node, UserInfo userInfo) {
		return getOrCreateAuthorReviewWork(runId, periodId, node, userInfo);
	}
	
	public static void matchUserToAuthor(Long runId, Long periodId, Node node, UserInfo userInfo, PeerReviewWork userWork) {
		setUserAsAuthorReviewer(runId, periodId, node, userInfo);
		setAuthorAsReviewer(userWork);
	}
	
	public static boolean isUserReviewingAuthor(Long runId, Long periodId, Node node, UserInfo userInfo) {
		UserInfo authorUserInfo = getAuthorUserInfo();
		PeerReviewWork authorWork = getPeerReviewWorkByRunPeriodNodeWorkerUserInfoReviewerUserInfo(runId, periodId, node, authorUserInfo, userInfo);
		
		if(authorWork == null) {
			return false;
		} else {
			return true;
		}
	}
}