/**
 * 
 */
package vle.domain.xmpp;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import vle.domain.PersistableDomain;

/**
 * Domain representing a chat in XMPP-enabled runs
 * @author hirokiterashima
 * @author geoffreykwan
 */
@Entity
@Table(name="chatlog")
public class ChatLog extends PersistableDomain {
	
	protected static String fromQuery = "from ChatLog";
	
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;
	
	//the id of the WISE run
	@Column(name="runId", nullable=false)
	private Long runId = null;

	//the id of the WISE workgroup who authored the chat (not null)
	@Column(name="fromWorkgroupId", nullable=false)
	private Long fromWorkgroupId = null;

	//the username of people who authored of the chat, 
	//e.g. "hirokiterashima && geffreykwan"
	@Column(name="fromWorkgroupName")
	private String fromWorkgroupName = null;
	
	//the id of the WISE workgroup who should receive this chat
	@Column(name="toWorkgroupId", nullable=true)
	private Long toWorkgroupId = null;

	//the username of people who should receive this chat
	//e.g. "hirokiterashima && geffreykwan"
	@Column(name="toWorkgroupName", nullable=true)
	private String toWorkgroupName = null;

	//the id of the chatroom,
	//e.g. "node_14.bs" (for specific nodeId) or "general" (for general classroom chat)
	//or "privateMsg"
	@Column(name="chatRoomId",length=255)
	private String chatRoomId = null;

	//what type of chat is this
	//e.g. "pause", "unPause", "studentToChatRoomMsg"
	@Column(name="chatEventType",nullable=false)
	private String chatEventType = null;

	//status of the chat indicating its visibility
	//e.g. "inappropriate", "highlight"
	@Column(name="status")
	private String status = null;

	//the type of data in the chat body
	//e.g. 'stepwork', 'string', 'svgString', 'xmlString'
	@Column(name="dataType")
	private String dataType = null;

	//the data of the chat
	@Column(name="data", length=4096)
	private String data = null;
	
	//the time the chat was sent
	@Column(name="postTime",nullable=false)
	private Timestamp postTime;


	@Override
	protected Class<?> getObjectClass() {
		// TODO Auto-generated method stub
		return ChatLog.class;
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
	 * @return the fromWorkgroupId
	 */
	public Long getFromWorkgroupId() {
		return fromWorkgroupId;
	}


	/**
	 * @param fromWorkgroupId the fromWorkgroupId to set
	 */
	public void setFromWorkgroupId(Long fromWorkgroupId) {
		this.fromWorkgroupId = fromWorkgroupId;
	}


	/**
	 * @return the toWorkgroupId
	 */
	public Long getToWorkgroupId() {
		return toWorkgroupId;
	}


	/**
	 * @param toWorkgroupId the toWorkgroupId to set
	 */
	public void setToWorkgroupId(Long toWorkgroupId) {
		this.toWorkgroupId = toWorkgroupId;
	}


	/**
	 * @return the chatRoomId
	 */
	public String getChatRoomId() {
		return chatRoomId;
	}


	/**
	 * @param chatRoomId the chatRoomId to set
	 */
	public void setChatRoomId(String chatRoomId) {
		this.chatRoomId = chatRoomId;
	}


	/**
	 * @return the dataType
	 */
	public String getDataType() {
		return dataType;
	}


	/**
	 * @param dataType the dataType to set
	 */
	public void setDataType(String dataType) {
		this.dataType = dataType;
	}


	/**
	 * @return the data
	 */
	public String getData() {
		return data;
	}


	/**
	 * @param data the data to set
	 */
	public void setData(String data) {
		this.data = data;
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
	 * @return the chatEventType
	 */
	public String getChatEventType() {
		return chatEventType;
	}


	/**
	 * @param chatEventType the chatEventType to set
	 */
	public void setChatEventType(String chatEventType) {
		this.chatEventType = chatEventType;
	}


	/**
	 * @return the status
	 */
	public String getStatus() {
		return status;
	}


	/**
	 * @param status the status to set
	 */
	public void setStatus(String status) {
		this.status = status;
	}


	/**
	 * @return the fromWorkgroupName
	 */
	public String getFromWorkgroupName() {
		return fromWorkgroupName;
	}


	/**
	 * @param fromWorkgroupName the fromWorkgroupName to set
	 */
	public void setFromWorkgroupName(String fromWorkgroupName) {
		this.fromWorkgroupName = fromWorkgroupName;
	}


	/**
	 * @return the toWorkgroupName
	 */
	public String getToWorkgroupName() {
		return toWorkgroupName;
	}


	/**
	 * @param toWorkgroupName the toWorkgroupName to set
	 */
	public void setToWorkgroupName(String toWorkgroupName) {
		this.toWorkgroupName = toWorkgroupName;
	}

}
