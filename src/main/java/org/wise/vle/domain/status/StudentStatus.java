package org.wise.vle.domain.status;

import java.sql.Timestamp;
import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import org.wise.vle.domain.PersistableDomain;


@Entity
@Table(name="studentStatus")
public class StudentStatus extends PersistableDomain {

	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;
	
	@Column(name="runId")
	private Long runId = null;
	
	@Column(name="periodId")
	private Long periodId = null;
	
	@Column(name="workgroupId")
	private Long workgroupId = null;
	
	@Column(name="timestamp")
	private Timestamp timestamp = null;
	
	@Column(name="status", length=5120000)
	private String status = null;
	
	/**
	 * Constructor for StudentStatuses
	 */
	public StudentStatus() {
		
	}
	
	/**
	 * Constructor for StudentStatus
	 * @param runId the run id
	 * @param periodId the period id
	 * @param workgroupId the workgroup id
	 * @param status a JSON string containing the student status
	 */
	public StudentStatus(Long runId, Long periodId, Long workgroupId, String status) {
		//set the fields
		setRunId(runId);
		setPeriodId(periodId);
		setWorkgroupId(workgroupId);
		setStatus(status);
		
		//set the timestamp
		Calendar now = Calendar.getInstance();
		setTimestamp(new Timestamp(now.getTimeInMillis()));
	}
	
	
	@Override
	protected Class<?> getObjectClass() {
		return StudentStatus.class;
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


	public Long getWorkgroupId() {
		return workgroupId;
	}


	public void setWorkgroupId(Long workgroupId) {
		this.workgroupId = workgroupId;
	}

	
	public Timestamp getTimestamp() {
		return timestamp;
	}

	
	public void setTimestamp(Timestamp timestamp) {
		this.timestamp = timestamp;
	}
	

	public String getStatus() {
		return status;
	}


	public void setStatus(String status) {
		this.status = status;
	}

}
