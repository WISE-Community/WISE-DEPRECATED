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

import org.hibernate.NonUniqueResultException;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

import vle.domain.PersistableDomain;
import vle.domain.node.Node;
import vle.hibernate.HibernateUtil;

@Entity
@Table(name="peerreviewgate")
@Inheritance(strategy=InheritanceType.JOINED)
public class PeerReviewGate extends PersistableDomain {

	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;

	@Column(name="runId")
	private Long runId = null;
	
	@Column(name="periodId")
	private Long periodId = null;
	
	@ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.MERGE})
	private Node node;

//	@Column(name="numWorkgroupsSubmitted")
//	private Long numWorkgroupsSubmitted = null;
//	
//	@Column(name="numWorkgroupsInPeriod")
//	private Long numWorkgroupsInPeriod = null;
	
	@Column(name="open")
	private boolean open = false;
	
//	@Column(name="openPercentageTrigger")
//	private Long openPercentageTrigger = null;
//	
//	@Column(name="openNumberTrigger")
//	private Long openNumberTrigger = null;

	@Override
	protected Class<?> getObjectClass() {
		// TODO Auto-generated method stub
		return null;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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

	public Node getNode() {
		return node;
	}

	public void setNode(Node node) {
		this.node = node;
	}

	public boolean isOpen() {
		return open;
	}

	public void setOpen(boolean open) {
		this.open = open;
	}
	
	
	public static PeerReviewGate getByRunIdPeriodIdNodeId(Long runId, Long periodId, Node node) {
		try {
			Session session = HibernateUtil.getSessionFactory().getCurrentSession();
			session.beginTransaction();
			PeerReviewGate result = (PeerReviewGate) session.createCriteria(PeerReviewGate.class).add(Restrictions.eq("runId", runId)).add(Restrictions.eq("periodId", periodId)).add(Restrictions.eq("node", node)).uniqueResult();
			session.getTransaction().commit();
			return result;
		} catch (NonUniqueResultException e) {
			//System.err.println("workgroupId: " + id);
			throw e;
		}
	}
	
	public static PeerReviewGate getOrCreateByRunIdPeriodIdNodeId(Long runId, Long periodId, Node node) {
		PeerReviewGate peerReviewGate = getByRunIdPeriodIdNodeId(runId, periodId, node);
		if(peerReviewGate == null) {
			peerReviewGate = new PeerReviewGate();
			peerReviewGate.setRunId(runId);
			peerReviewGate.setPeriodId(periodId);
			peerReviewGate.setNode(node);
			peerReviewGate.saveOrUpdate();
		}
		return peerReviewGate;
	}
	
	public static boolean calculatePeerReviewOpen(Long runId, Long periodId, Node node,
			int numWorkgroups, int openPercentageTrigger, int openNumberTrigger) {
		PeerReviewGate peerReviewGate = getByRunIdPeriodIdNodeId(runId, periodId, node);
		
		if(peerReviewGate == null) {
			return false;
		} else if(!peerReviewGate.isOpen()) {
			List<PeerReviewWork> peerReviewWorkForRunPeriodNode = PeerReviewWork.getPeerReviewWorkByRunPeriodNode(runId, periodId, node);
			
			int numWorkgroupsSubmitted = peerReviewWorkForRunPeriodNode.size();
			
			if(openPercentageTriggerSatisfied(numWorkgroupsSubmitted, numWorkgroups, openPercentageTrigger) &&
					openNumberTriggerSatisfied(numWorkgroupsSubmitted, openNumberTrigger)) {
				peerReviewGate.setOpen(true);
				peerReviewGate.saveOrUpdate();
				return true;
			} else {
				return false;
			}
		} else {
			return true;
		}
	}
	
	private static boolean openPercentageTriggerSatisfied(int numWorkgroupsSubmitted, int numWorkgroups, int openPercentageTrigger) {
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

	private static boolean openNumberTriggerSatisfied(int numWorkgroupsSubmitted, int openNumberTrigger) {
		if(openNumberTrigger == 0) {
			return true;
		}
		
		if(numWorkgroupsSubmitted >= openNumberTrigger) {
			return true;
		} else {
			return false;
		}
	}
	
}