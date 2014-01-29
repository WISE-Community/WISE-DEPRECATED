package org.wise.vle.domain.work;

import java.sql.Timestamp;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import org.wise.vle.domain.PersistableDomain;
import org.wise.vle.domain.user.UserInfo;


/**
 * A Cache for students' work, for quicker access.
 * @author hirokiterashima
 */
@Entity
@Table(name="stepwork_cache")
public class StepWorkCache extends PersistableDomain {

	protected static String fromQuery = "from StepWorkCache";

	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;
	
	@OneToOne(cascade = {CascadeType.PERSIST})
	private UserInfo userInfo;
	
	@Column(name="cacheTime")
	private Timestamp cacheTime;

	@Column(name="data", length=2147483647)
	private String data;
	
	@Column(name="getRevisions")
	private boolean getRevisions;
	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	/**
	 * @return the userInfo
	 */
	public UserInfo getUserInfo() {
		return userInfo;
	}

	/**
	 * @param userInfo the userInfo to set
	 */
	public void setUserInfo(UserInfo userInfo) {
		this.userInfo = userInfo;
	}

	/**
	 * @return the cacheTime
	 */
	public Timestamp getCacheTime() {
		return cacheTime;
	}

	/**
	 * @param cacheTime the cacheTime to set
	 */
	public void setCacheTime(Timestamp cacheTime) {
		this.cacheTime = cacheTime;
	}

	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}
	
	public boolean isGetRevisions() {
		return getRevisions;
	}

	public void setGetRevisions(boolean getRevisions) {
		this.getRevisions = getRevisions;
	}

	/**
	 * @see org.wise.vle.domain.PersistableDomain#getObjectClass()
	 */
	@Override
	protected Class<?> getObjectClass() {
		return StepWorkCache.class;
	}

}
