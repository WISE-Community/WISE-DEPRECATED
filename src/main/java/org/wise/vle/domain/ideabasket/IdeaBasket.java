package org.wise.vle.domain.ideabasket;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Calendar;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import org.json.JSONException;
import org.json.JSONObject;
import org.wise.vle.domain.PersistableDomain;


@Entity
@Table(name="ideaBasket")
public class IdeaBasket extends PersistableDomain implements Serializable {

	private static final long serialVersionUID = 1L;

	//the unique id of the IdeaBasket
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;

	//the id of the run
	@Column(name="runId")
	private Long runId = null;
	
	//the id of the workgroup
	@Column(name="workgroupId")
	private Long workgroupId = null;
	
	//the id of the project
	@Column(name="projectId")
	private Long projectId = null;
	
	//the JSON string for the idea basket
	@Column(name="data", length=512000)
	private String data = null;
	
	//the time the idea basket was posted
	@Column(name="postTime")
	private Timestamp postTime;
	
	//the period id of the basket
	@Column(name="periodId")
	private Long periodId = null;
	
	//whether this basket is a public basket
	@Column(name="isPublic")
	private Boolean isPublic = false;
	
	//the action that is being performed to create this new basket revision (only used for public idea basket)
	@Column(name="action")
	private String action = "";
	
	//the workgroup id performing the action to create a new basket revision (only used for public idea basket)
	@Column(name="actionPerformer")
	private Long actionPerformer = null;
	
	//the idea id for the action being performed (only used for public idea basket)
	@Column(name="ideaId")
	private Long ideaId = null;
	
	//the workgroup id of the owner of the idea that the action is being performed on (only used for public idea basket)
	@Column(name="ideaWorkgroupId")
	private Long ideaWorkgroupId = null;

	/**
	 * the no args constructor
	 */
	public IdeaBasket() {
		
	}

	/**
	 * Constructor that does not populate the data field
	 * @param runId
	 * @param projectId
	 * @param workgroupId
	 */
	public IdeaBasket(long runId, long periodId, long projectId, long workgroupId) {
		this.runId = runId;
		this.projectId = projectId;
		this.workgroupId = workgroupId;
		Calendar now = Calendar.getInstance();
		this.postTime = new Timestamp(now.getTimeInMillis());
	}
	
	/**
	 * Constructor that populates the values
	 * @param runId the id of the run
	 * @param projectId the id of the project
	 * @param workgroupId the id of the workgroup
	 * @param data the idea basket JSON
	 */
	public IdeaBasket(long runId, long periodId, long projectId, long workgroupId, String data, boolean isPublic) {
		this.runId = runId;
		this.projectId = projectId;
		this.periodId = periodId;
		this.workgroupId = workgroupId;
		Calendar now = Calendar.getInstance();
		this.postTime = new Timestamp(now.getTimeInMillis());
		this.data = data;
		this.isPublic = isPublic;
	}
	
	/**
	 * Constructor that populates the values
	 * @param runId the id of the run
	 * @param projectId the id of the project
	 * @param workgroupId the id of the workgroup
	 * @param data the idea basket JSON
	 */
	public IdeaBasket(long runId, long periodId, long projectId, long workgroupId, String data, boolean isPublic, String action, Long actionPerformer, Long ideaId, Long ideaWorkgroupId) {
		this.runId = runId;
		this.projectId = projectId;
		this.periodId = periodId;
		this.workgroupId = workgroupId;
		Calendar now = Calendar.getInstance();
		this.postTime = new Timestamp(now.getTimeInMillis());
		this.data = data;
		this.isPublic = isPublic;
		this.action = action;
		this.actionPerformer = actionPerformer;
		this.ideaId = ideaId;
		this.ideaWorkgroupId = ideaWorkgroupId;
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

	public Long getWorkgroupId() {
		return workgroupId;
	}

	public void setWorkgroupId(Long workgroupId) {
		this.workgroupId = workgroupId;
	}

	public Long getProjectId() {
		return projectId;
	}

	public void setProjectId(Long projectId) {
		this.projectId = projectId;
	}

	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}
	
	public Timestamp getPostTime() {
		return postTime;
	}

	public void setPostTime(Timestamp postTime) {
		this.postTime = postTime;
	}
	
	public Long getPeriodId() {
		return periodId;
	}

	public void setPeriodId(Long periodId) {
		this.periodId = periodId;
	}

	public Boolean isPublic() {
		return isPublic;
	}

	public void setPublic(Boolean isPublic) {
		this.isPublic = isPublic;
	}
	
	public String getAction() {
		return action;
	}

	public void setAction(String action) {
		this.action = action;
	}

	public Long getActionPerformer() {
		return actionPerformer;
	}

	public void setActionPerformer(Long actionPerformer) {
		this.actionPerformer = actionPerformer;
	}

	public Long getIdeaId() {
		return ideaId;
	}

	public void setIdeaId(Long ideaId) {
		this.ideaId = ideaId;
	}

	public Long getIdeaWorkgroupId() {
		return ideaWorkgroupId;
	}

	public void setIdeaWorkgroupId(Long ideaWorkgroupId) {
		this.ideaWorkgroupId = ideaWorkgroupId;
	}
	
	@Override
	protected Class<?> getObjectClass() {
		return IdeaBasket.class;
	}

	/**
	 * Get the JSON object representation of the IdeaBasket
	 * @return a JSONObject containing the data from the idea basket
	 */
	public JSONObject toJSONObject() {
		JSONObject jsonObject = null;
		
		String dataString = "";
		
		dataString = getData();
		
		if(dataString == null) {
			/*
			 * the data is null so we will create and return a JSONObject
			 * that has the metadata for the idea basket
			 */
			try {
				jsonObject = new JSONObject();
				jsonObject.put("id", getId());
				jsonObject.put("runId", getRunId());
				jsonObject.put("periodId", getPeriodId());
				jsonObject.put("workgroupId", getWorkgroupId());
				jsonObject.put("projectId", getProjectId());
				jsonObject.put("isPublic", isPublic());
			} catch (JSONException e) {
				e.printStackTrace();
			}
		} else {
			/*
			 * the data is not null so we will create a JSONObject from
			 * the data string and inject metadata values if they are
			 * not already present in the data string
			 */
			try {
				jsonObject = new JSONObject(dataString);
				
				if(!jsonObject.has("id")) {
					jsonObject.put("id", getId());
				}
				
				if(!jsonObject.has("runId")) {
					jsonObject.put("runId", getRunId());
				}
				
				if(!jsonObject.has("periodId")) {
					jsonObject.put("periodId", getPeriodId());
				}
				
				if(!jsonObject.has("workgroupId")) {
					jsonObject.put("workgroupId", getWorkgroupId());
				}

				if(!jsonObject.has("projectId")) {
					jsonObject.put("projectId", getProjectId());
				}
				
				if(!jsonObject.has("isPublic")) {
					jsonObject.put("isPublic", isPublic());
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		return jsonObject;
	}
	
	/**
	 * Get the JSON string representation of the IdeaBasket
	 * @return
	 */
	public String toJSONString() {
		String jsonString = null;
		
		//get the JSONObject representation of the idea basket
		JSONObject jsonObject = toJSONObject();

		try {
			if(jsonObject != null) {
				//get the JSON string representation with indentation
				jsonString = jsonObject.toString(3);
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		return jsonString;
	}

}
