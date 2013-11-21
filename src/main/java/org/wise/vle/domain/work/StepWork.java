/**
 * 
 */
package org.wise.vle.domain.work;

import java.sql.Timestamp;

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

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.vle.domain.PersistableDomain;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.user.UserInfo;


/**
 * Domain representing work for a step
 * @author hirokiterashima
 */
@Entity
@Table(name="stepwork")
@Inheritance(strategy=InheritanceType.JOINED)
public class StepWork extends PersistableDomain {

	protected static String fromQuery = "from StepWork";

	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;

	@ManyToOne(cascade = {CascadeType.PERSIST})
	private UserInfo userInfo;
	
	@ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.MERGE})
	private Node node;

	@Column(name="postTime")
	private Timestamp postTime;

	@Column(name="startTime")
	private Timestamp startTime;

	@Column(name="endTime")
	private Timestamp endTime;
	
	@Column(name="duplicateId")
	private String duplicateId;
	
	@Column(name="data", length=5120000)
	private String data;

    public Long getId() {
        return id;
    }

    @SuppressWarnings("unused")
	private void setId(Long id) {
        this.id = id;
    }


	public UserInfo getUserInfo() {
		return userInfo;
	}

	public void setUserInfo(UserInfo userInfo) {
		this.userInfo = userInfo;
	}

	/**
	 * @return the node
	 */
	public Node getNode() {
		return node;
	}

	/**
	 * @param node the node to set
	 */
	public void setNode(Node node) {
		this.node = node;
	}

	/**
	 * @return the postTime
	 */
	public Timestamp getPostTime() {
		return postTime;
	}

	/**
	 * @param postTime the postTime to set
	 */
	public void setPostTime(Timestamp postTime) {
		this.postTime = postTime;
	}

	/**
	 * @return the startTime
	 */
	public Timestamp getStartTime() {
		return startTime;
	}

	/**
	 * @param startTime the startTime to set
	 */
	public void setStartTime(Timestamp startTime) {
		this.startTime = startTime;
	}

	/**
	 * @return the endTime
	 */
	public Timestamp getEndTime() {
		return endTime;
	}

	/**
	 * @param endTime the endTime to set
	 */
	public void setEndTime(Timestamp endTime) {
		this.endTime = endTime;
	}
	
	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}

	public void populateData(String nodeVisit) {
		this.data = nodeVisit;
	}
	
	public void populateData(JSONObject nodeVisitJSON) {
		this.data = nodeVisitJSON.toString();
	}

	/**
	 * @see org.wise.vle.domain.PersistableDomain#getObjectClass()
	 */
	@Override
	protected Class<?> getObjectClass() {
		return StepWork.class;
	}
	
	/**
	 * Returns the node state object within this stepwork with the specified timestamp
	 * or null if does not exist.
	 * @param timestamp
	 * @return
	 */
	public JSONObject getNodeStateByTimestamp(Long timestampIn) {
		try {
			JSONObject dataJSON = new JSONObject(this.data);
			if (dataJSON != null) {
				JSONArray valueArray = dataJSON.getJSONArray("nodeStates");
				if (valueArray != null) {
					for (int i=0; i<valueArray.length(); i++) {
						JSONObject nodeStateObj = valueArray.getJSONObject(i);
						long timestampFromNodeState = nodeStateObj.getLong("timestamp");
						if (timestampIn != null && timestampIn.equals(timestampFromNodeState)) {
							return nodeStateObj;
						}
						
					}
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return null;		
	}
	
	/**
	 * If this StepWork contains response for a CRater item, return the
	 * CRaterItemId. Otherwise, return null.
	 * @return
	 */
	public String getCRaterItemId() {
		String cRaterItemId = null;
		
		try {
			JSONObject dataJSON = new JSONObject(this.data);
			if (dataJSON != null) {
				JSONArray nodeStateArray = dataJSON.getJSONArray("nodeStates");
				if (nodeStateArray != null) {
					for (int i=0; i<nodeStateArray.length(); i++) {
						JSONObject nodeStateObj = nodeStateArray.getJSONObject(i);
						
						if(nodeStateObj.has("cRaterItemId")) {
							cRaterItemId = nodeStateObj.getString("cRaterItemId");
							break;
						}
					}
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		return cRaterItemId;
	}
	
	/**
	 * If this StepWork contains response for a CRater item, return the
	 * CRaterItemType. Otherwise, return null.
	 * @return
	 */
	public String getCRaterItemType() {
		String cRaterItemType = null;
		
		try {
			JSONObject dataJSON = new JSONObject(this.data);
			if (dataJSON != null) {
				JSONArray nodeStateArray = dataJSON.getJSONArray("nodeStates");
				if (nodeStateArray != null) {
					for (int i=0; i<nodeStateArray.length(); i++) {
						JSONObject nodeStateObj = nodeStateArray.getJSONObject(i);
						
						if(nodeStateObj.has("cRaterItemType")) {
							cRaterItemType = nodeStateObj.getString("cRaterItemType");
							break;
						}
					}
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		return cRaterItemType;
	}
	/**
	 * Returns the timestamp of the latest NodeState in this StepWork. 
	 * This is the same as the NodeStateId. If no NodeState exists in this StepWork,
	 * return 0.
	 * @return 0 or the timestamp of the latest NodeState in this StepWork.
	 */
	public long getLastNodeStateTimestamp() {
		long timestamp = 0;

		try {
			JSONObject dataJSON = new JSONObject(this.data);
			if (dataJSON != null) {
				JSONArray nodeStateArray = dataJSON.getJSONArray("nodeStates");
				if (nodeStateArray != null && nodeStateArray.length() > 0) {
					JSONObject nodeStateObj = nodeStateArray.getJSONObject(nodeStateArray.length() - 1);
					if(nodeStateObj.has("timestamp")) {
						timestamp = nodeStateObj.getLong("timestamp");
					}
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}

		return timestamp;
	}
	
	/**
	 * @return the duplicateId
	 */
	public String getDuplicateId() {
		return duplicateId;
	}

	/**
	 * @param duplicateId the duplicateId to set
	 */
	public void setDuplicateId(String duplicateId) {
		this.duplicateId = duplicateId;
	}
}
