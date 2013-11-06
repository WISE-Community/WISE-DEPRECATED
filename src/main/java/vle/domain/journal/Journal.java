/**
 * 
 */
package vle.domain.journal;

import java.io.IOException;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import vle.domain.PersistableDomain;
import vle.domain.user.UserInfo;

/**
 * Domain object for storing student journal
 * @author hirokiterashima
 * @author geoffreykwan
 */
@Entity
@Table(name="journal")
public class Journal extends PersistableDomain {

	protected static String fromQuery = "from Journal";
	
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;

	@OneToOne(cascade = {CascadeType.PERSIST})
	private UserInfo userInfo;  // who created this annotation

	/*
	@OneToMany(fetch = FetchType.EAGER)
	@JoinColumn(name="journal_fk")
	private List<JournalEntry> entries;
	*/
	@Transient
	private List<JournalEntry> entries;
	
	@Column(name="data", length=1024)
	private String data = "";
	
    public Long getId() {
        return id;
    }

    @SuppressWarnings("unused")
	private void setId(Long id) {
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
	 * @return the entries
	 */
	public List<JournalEntry> getEntries() {
		return entries;
	}

	/**
	 * @param entries the entries to set
	 */
	public void setEntries(List<JournalEntry> entries) {
		this.entries = entries;
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
	 * Returns the last JournalEntry within this journal.
	 * @return
	 */
	public JournalEntry getLastJournalEntry() {
		return this.entries.get(this.entries.size());
	}

	/**
	 * @see vle.domain.PersistableDomain#getObjectClass()
	 */
	@Override
	protected Class<?> getObjectClass() {
		return Journal.class;
	}

	/**
	 * Populates this Journal from the provided
	 * XMLString
	 * 
	 * @param xmlString
	 * ex: 
	 * <journal journalId="4" workgroupid="29">
	 * 		<journalPages>
	 * 			<journalPage journalPageId="1" pageCreatedTime="1250703294162" pageLastEditedTime="1250703297444" nodeId="node_1.or">abc</journalPage>
	 * 		</journalPages>
	 * </journal>
	 * @throws IOException 
	 * @throws SAXException 
	 */
	/*
	public void fromXMLString(String xmlString) throws SAXException, IOException {
		DOMParser parser = new DOMParser();
		parser.parse(new InputSource(new java.io.StringReader(xmlString)));
		Document doc = parser.getDocument();
		NodeList journalPages = doc.getElementsByTagName("journalPage");
		for (int i=0; i < journalPages.getLength(); i++) {
			Node journalPageNode = journalPages.item(i);
			String journalPageId = journalPageNode.getAttributes().getNamedItem("journalPageId").getNodeValue();
			String nodeId = journalPageNode.getAttributes().getNamedItem("nodeId").getNodeValue();
			String data = journalPageNode.getTextContent();
			vle.domain.node.Node node = vle.domain.node.Node.getByNodeIdAndRunId(nodeId, runId, true);
			JournalEntry journalEntry = (JournalEntry) JournalEntry.getById(new Long(journalPageId), JournalEntry.class);
			if (journalEntry == null) {
				journalEntry = new JournalEntry();
			}
			journalEntry.setData(data);
			journalEntry.setNode(node);
		}
		this.setEntries(entries);
	}
	*/
	
	/**
	 * Returns a XML String representation of this journal.
	 * @return
	 */
	public String toXMLString() {
		String xmlStringSoFar = "<journal journalId='"+ this.getId() +"' workgroupId='"+this.userInfo.getWorkgroupId() +"'><journalPages>";
		for (JournalEntry journalEntry : this.entries) {
			xmlStringSoFar += journalEntry.toXMLString();
		}
		return xmlStringSoFar + "</journalPages></journal>";
	}

}
