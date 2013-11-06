package org.telscenter.sail.webapp.domain.attendance.impl;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.telscenter.sail.webapp.domain.attendance.StudentAttendance;
import org.telscenter.sail.webapp.presentation.util.json.JSONArray;
import org.telscenter.sail.webapp.presentation.util.json.JSONException;
import org.telscenter.sail.webapp.presentation.util.json.JSONObject;

@Entity
@Table(name = StudentAttendanceImpl.DATA_STORE_NAME)
public class StudentAttendanceImpl implements StudentAttendance {

	@Transient
	private static final long serialVersionUID = 1L;
	
	@Transient
	public static final String DATA_STORE_NAME = "student_attendance";

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id = null;
	
	@Column(name = "workgroupId")
	private Long workgroupId;
	
	@Column(name = "runId")
	private Long runId;
	
	@Column(name = "loginTimestamp")
	private Date loginTimestamp;
	
	@Column(name = "presentUserIds")
	private String presentUserIds;
	
	@Column(name = "absentUserIds")
	private String absentUserIds;
	
	public StudentAttendanceImpl() {
			
	}

	/**
	 * Constructor the populates the fields
	 * @param workgroupId
	 * @param runId
	 * @param loginTimestamp
	 * @param presentUserIds
	 * @param absentUserIds
	 */
	public StudentAttendanceImpl(Long workgroupId, Long runId, Date loginTimestamp, String presentUserIds, String absentUserIds) {
		super();
		setWorkgroupId(workgroupId);
		setRunId(runId);
		setLoginTimestamp(loginTimestamp);
		setPresentUserIds(presentUserIds);
		setAbsentUserIds(absentUserIds);
	}
	
	/**
	 * Get the JSONObject representation of this StudentAttendanceImpl object
	 * @see org.telscenter.sail.webapp.domain.attendance.StudentAttendance#toJSONObject()
	 */
	public JSONObject toJSONObject() {
		JSONObject jsonObject = new JSONObject();
		
		try {
			//set the ids
			jsonObject.put("id", getId());
			jsonObject.put("workgroupId", getWorkgroupId());
			jsonObject.put("runId", getRunId());
			
			//get the login timestamp
			Date loginTimestamp = getLoginTimestamp();
			
			if(loginTimestamp != null) {
				//get the timestamp in milliseconds
				jsonObject.put("loginTimestamp", loginTimestamp.getTime());				
			} else {
				jsonObject.put("loginTimestamp", JSONObject.NULL);
			}
			
			//set the present and absent user ids
			jsonObject.put("presentUserIds", new JSONArray(getPresentUserIds()));
			jsonObject.put("absentUserIds", new JSONArray(getAbsentUserIds()));
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		return jsonObject;
	}
	
	public Long getId() {
		return this.id;
	}
	
	public void setId(Long id) {
		this.id = id;
	}

	public Long getWorkgroupId() {
		return workgroupId;
	}

	public void setWorkgroupId(Long workgroupId) {
		this.workgroupId = workgroupId;
	}

	public Long getRunId() {
		return runId;
	}

	public void setRunId(Long runId) {
		this.runId = runId;
	}

	public Date getLoginTimestamp() {
		return loginTimestamp;
	}

	public void setLoginTimestamp(Date loginTimestamp) {
		this.loginTimestamp = loginTimestamp;
	}

	public String getPresentUserIds() {
		return presentUserIds;
	}

	public void setPresentUserIds(String presentUserIds) {
		this.presentUserIds = presentUserIds;
	}

	public String getAbsentUserIds() {
		return absentUserIds;
	}

	public void setAbsentUserIds(String absentUserIds) {
		this.absentUserIds = absentUserIds;
	}
}
