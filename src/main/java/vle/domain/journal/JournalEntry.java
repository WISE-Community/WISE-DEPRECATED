/**
 * 
 */
package vle.domain.journal;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import vle.domain.PersistableDomain;
import vle.domain.node.Node;

/**
 * Domain object for storing student journal entries
 * @author hirokiterashima
 */
@Entity
@Table(name="journalentry")
public class JournalEntry extends PersistableDomain {

	protected static String fromQuery = "from JournalEntry";

	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;
	
	@ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.MERGE})
	private Node node;  // which node this entry is for. Nullable.

	@Column(name="data", length=1024)
	private String data;

	@ManyToOne
	@JoinColumn(name="journal_fk", insertable=false, updatable=false)
	private Journal journal;
	
    public Long getId() {
        return id;
    }

    @SuppressWarnings("unused")
	private void setId(Long id) {
        this.id = id;
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
    
	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
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
		return JournalEntry.class;
	}

	/**
	 * Returns a XML String representation of this journal entry.
	 * @return
	 */
	public String toXMLString() {
		int pageId = this.getJournal().getEntries().indexOf(this) + 1;
		String xmlStringSoFar = "<journalPage journalPageId='" + pageId + "' pageCreatedTime='' + pageLastEditedTime='' nodeId='"+ this.node.getNodeId()+"'>";
		xmlStringSoFar += "<![CDATA[" + this.data + "]]>";
		xmlStringSoFar += "</journalPage>";
		return xmlStringSoFar;
	}

}
