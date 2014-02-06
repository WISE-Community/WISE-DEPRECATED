/**
 * 
 */
package org.wise.vle.domain.user;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import org.wise.vle.domain.PersistableDomain;


/**
 * @author hirokiterashima
 *
 */
@Entity
@Table(name="userinfo")
public class UserInfo extends PersistableDomain {

	protected static String fromQuery = "from UserInfo";

	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;

	@Column(name="workgroupId", unique=true)
	private Long workgroupId = null;
	
    public Long getId() {
        return id;
    }

    @SuppressWarnings("unused")
	private void setId(Long id) {
        this.id = id;
    }

	public Long getWorkgroupId() {
		return workgroupId;
	}

	public void setWorkgroupId(Long workgroupId) {
		this.workgroupId = workgroupId;
	}

	/**
	 * @see org.wise.vle.domain.PersistableDomain#getObjectClass()
	 */
	@Override
	protected Class<?> getObjectClass() {
		return UserInfo.class;
	}
}
