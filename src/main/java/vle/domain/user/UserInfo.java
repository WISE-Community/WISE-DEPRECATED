/**
 * 
 */
package vle.domain.user;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import vle.domain.PersistableDomain;
import vle.domain.journal.Journal;

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
	
	@OneToOne(mappedBy = "userInfo")
	public Journal journal;
	
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
	 * @return the journal
	 */
	public Journal getJournal() {
		return journal;
	}

	/**
	 * @param journal the journal to set
	 */
	public void setJournal(Journal journal) {
		this.journal = journal;
	}

	/**
	 * @see vle.domain.PersistableDomain#getObjectClass()
	 */
	@Override
	protected Class<?> getObjectClass() {
		return UserInfo.class;
	}
}
