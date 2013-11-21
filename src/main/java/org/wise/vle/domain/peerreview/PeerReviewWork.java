package org.wise.vle.domain.peerreview;

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

import org.wise.vle.domain.PersistableDomain;
import org.wise.vle.domain.annotation.Annotation;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;


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
	
	public static Long getAuthorWorkgroupId() {
		return authorWorkgroupId;
	}
}