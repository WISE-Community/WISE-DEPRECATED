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
@Table(name="runStatus")
public class RunStatus extends PersistableDomain {

	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;
	
	@Column(name="runId")
	private Long runId = null;
	
	@Column(name="timestamp")
	private Timestamp timestamp = null;
	
    @Column(name="status", length=5120000)
	private String status = null;
	
	/**
	 * Constructor for RunStatus
	 */
	public RunStatus() {
		
	}
	
	/**
	 * Constructor for RunStatus
	 * @param runId the run id
	 * @param status the status of the run as a JSONString
	 */
	public RunStatus(Long runId, String status) {
		//set the run id and status
		setRunId(runId);
		setStatus(status);
		
		//set the timestamp
		Calendar now = Calendar.getInstance();
		setTimestamp(new Timestamp(now.getTimeInMillis()));
	}

	
	@Override
	protected Class<?> getObjectClass() {
		return null;
	}

	public Long getRunId() {
		return runId;
	}

	public void setRunId(Long runId) {
		this.runId = runId;
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
