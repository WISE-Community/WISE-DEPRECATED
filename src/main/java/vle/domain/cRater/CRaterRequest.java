/**
 * 
 */
package vle.domain.cRater;

import java.sql.Timestamp;
import java.util.Calendar;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

import vle.domain.PersistableDomain;
import vle.domain.work.StepWork;
import vle.hibernate.HibernateUtil;

/**
 * Domain representing CRaterRequests, pending and completed.
 * @author hirokiterashima
 * @author geoffreykwan
 */
@Entity
@Table(name="craterrequest")
public class CRaterRequest extends PersistableDomain {
	
protected static String fromQuery = "from CRaterRequest";
	
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;

	@Column(name="cRaterItemId", nullable=false)
	private String cRaterItemId;

	@Column(name="cRaterItemType")
	private String cRaterItemType;

	@JoinColumn(name="stepWorkId")
	@ManyToOne(cascade = {CascadeType.PERSIST})
	private StepWork stepWork;   // the work that is being cRater annotated

	@Column(name="nodeStateId", nullable=false)
	private Long nodeStateId;

	@Column(name="runId", nullable=false)
	private Long runId;

	@Column(name="timeCreated")
	private Timestamp timeCreated = null;  // when this cRater annotation request was created

	@Column(name="timeCompleted")
	private Timestamp timeCompleted = null;  // when this cRater annotation request was completed
	
	@Column(name="failCount")
	private int failCount = 0;  // number of unsuccessful cRater requests
	
	@Column(name="cRaterResponse", length=2048)
	private String cRaterResponse = null;
	
	/**
	 * Default constructor
	 */
	public CRaterRequest() {
		
	}
	
	/**
	 * @param cRaterItemId
	 * @param stepWork
	 * @param nodeStateId
	 */
	public CRaterRequest(String cRaterItemId, String cRaterItemType, StepWork stepWork,
			Long nodeStateId, Long runId) {
		super();
		this.cRaterItemId = cRaterItemId;
		this.cRaterItemType = cRaterItemType;
		this.stepWork = stepWork;
		this.nodeStateId = nodeStateId;
		Calendar now = Calendar.getInstance();
		this.timeCreated = new Timestamp(now.getTimeInMillis());
		this.runId = runId;
	}
	
	/**
	 * @see vle.domain.PersistableDomain#getObjectClass()
	 */
	@Override
	protected Class<?> getObjectClass() {
		return CRaterRequest.class;
	}

	/**
	 * @return the id
	 */
	public Long getId() {
		return id;
	}

	/**
	 * @param id the id to set
	 */
	public void setId(Long id) {
		this.id = id;
	}

	/**
	 * @return the cRaterItemId
	 */
	public String getcRaterItemId() {
		return cRaterItemId;
	}

	/**
	 * @param cRaterItemId the cRaterItemId to set
	 */
	public void setcRaterItemId(String cRaterItemId) {
		this.cRaterItemId = cRaterItemId;
	}

	/**
	 * @return the cRaterItemId
	 */
	public String getcRaterItemType() {
		return cRaterItemType;
	}

	/**
	 * @param cRaterItemType the cRaterItemType to set
	 */
	public void setcRaterItemType(String cRaterItemType) {
		this.cRaterItemType = cRaterItemType;
	}

	/**
	 * @return the stepWork
	 */
	public StepWork getStepWork() {
		return stepWork;
	}

	/**
	 * @param stepWork the stepWork to set
	 */
	public void setStepWork(StepWork stepWork) {
		this.stepWork = stepWork;
	}

	/**
	 * @return the nodeStateId
	 */
	public Long getNodeStateId() {
		return nodeStateId;
	}

	/**
	 * @param nodeStateId the nodeStateId to set
	 */
	public void setNodeStateId(Long nodeStateId) {
		this.nodeStateId = nodeStateId;
	}

	/**
	 * @return the runId
	 */
	public Long getRunId() {
		return runId;
	}

	/**
	 * @param runId the runId to set
	 */
	public void setRunId(Long runId) {
		this.runId = runId;
	}

	/**
	 * @return the timeCreated
	 */
	public Timestamp getTimeCreated() {
		return timeCreated;
	}

	/**
	 * @param timeCreated the timeCreated to set
	 */
	public void setTimeCreated(Timestamp timeCreated) {
		this.timeCreated = timeCreated;
	}

	/**
	 * @return the timeCompleted
	 */
	public Timestamp getTimeCompleted() {
		return timeCompleted;
	}

	/**
	 * @param timeCompleted the timeCompleted to set
	 */
	public void setTimeCompleted(Timestamp timeCompleted) {
		this.timeCompleted = timeCompleted;
	}

	/**
	 * @return the failCount
	 */
	public int getFailCount() {
		return failCount;
	}

	/**
	 * @param failCount the failCount to set
	 */
	public void setFailCount(int failCount) {
		this.failCount = failCount;
	}

	/**
	 * @return the cRaterResponse
	 */
	public String getcRaterResponse() {
		return cRaterResponse;
	}

	/**
	 * @param cRaterResponse the cRaterResponse to set
	 */
	public void setcRaterResponse(String cRaterResponse) {
		this.cRaterResponse = cRaterResponse;
	}
	
	/**
	 * Returns a CRaterRequest for the specified StepWork and NodeStateId.
	 * @param stepWork
	 * @param nodeStateId
	 * @return
	 */
	public static CRaterRequest getByStepWorkIdNodeStateId(StepWork stepWork,
			Long nodeStateId) {
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
	public static List<CRaterRequest> getIncompleteCRaterRequests() {
		
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<CRaterRequest> result = (List<CRaterRequest>) session.createCriteria(CRaterRequest.class)
        	.add(Restrictions.isNull("timeCompleted")).list();
        session.getTransaction().commit();
        return result;
	}

}
