/**
 * 
 */
package vle.domain.node;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import vle.domain.PersistableDomain;

/**
 * @author hirokiterashima
 */
@Entity
@Table(name="node")
public class Node extends PersistableDomain {

	protected static String fromQuery = "from Node";
	
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;
	
	@Column(name="nodeId")
	private String nodeId;
	
	@Column(name="runId")
	private String runId;
	
	@Column(name="nodeType")
	private String nodeType;

	public Long getId() {
        return id;
    }

    @SuppressWarnings("unused")
	private void setId(Long id) {
        this.id = id;
    }

	/**
	 * @return the nodeId
	 */
	public String getNodeId() {
		return nodeId;
	}

	/**
	 * @param nodeId the nodeId to set
	 */
	public void setNodeId(String nodeId) {
		this.nodeId = nodeId;
	}

	/**
	 * @return the runId
	 */
	public String getRunId() {
		return runId;
	}

	/**
	 * @param runId the runId to set
	 */
	public void setRunId(String runId) {
		this.runId = runId;
	}
	
	/**
	 * 
	 */
    public String getNodeType() {
		return nodeType;
	}

    /**
     * 
     * @param nodeType
     */
	public void setNodeType(String nodeType) {
		this.nodeType = nodeType;
	}

	/**
	 * @see vle.domain.PersistableDomain#getObjectClass()
	 */
	@Override
	protected Class<?> getObjectClass() {
		return Node.class;
	}
}
