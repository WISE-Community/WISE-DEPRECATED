package vle.domain.peerreview;

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

import vle.domain.PersistableDomain;
import vle.domain.node.Node;

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
}