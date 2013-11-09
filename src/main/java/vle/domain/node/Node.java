/**
 * 
 */
package vle.domain.node;

import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.Session;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.Restrictions;

import vle.domain.PersistableDomain;
import vle.hibernate.HibernateUtil;

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

	/**
	 * @param nodeId
	 * @param runId
	 * @return node
	 */
	public static Node getByNodeIdAndRunId(String nodeId, String runId) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        PersistableDomain result = (PersistableDomain) session.createCriteria(Node.class)
        	.add( Restrictions.eq("nodeId", nodeId))
        	.add( Restrictions.eq("runId", runId)).uniqueResult();
        
        session.getTransaction().commit();
        return (Node) result;
	}
	
	/**
	 * Works similar to getByNodeIdAndRunId, except 
	 * @param nodeId
	 * @param runId
	 * @param createIfNotFound true iff a new Node should be created and persisted if
	 * it is not found
	 * @return
	 */
	public static Node getByNodeIdAndRunId(String nodeId, String runId, boolean createIfNotFound) {
		Node node = Node.getByNodeIdAndRunId(nodeId, runId);
		if (node == null && createIfNotFound) {
			node = new Node();
			node.setNodeId(nodeId);
			node.setRunId(runId);
			node.saveOrUpdate();
		}
        return node;
	}
	
	/**
	 * Get a List of Node objects given a list of node ids and the run id
	 * @param nodeIds a List of node id strings
	 * @param runId the run id as a string
	 * @return a List of Node objects
	 */
	public static List<Node> getByNodeIdsAndRunId(List<String> nodeIds, String runId) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<Node> result =  session.createCriteria(Node.class).add(Restrictions.eq("runId", runId)).add(createNodeOrCriterion(nodeIds, 0)).list();
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * Create an or criterion of all the node ids recursively
	 * @param nodeIds a List of node id strings
	 * @param index the current node id we are at in our tail recursion
	 * @return an or criterion of all the nod ids
	 */
	private static Criterion createNodeOrCriterion(List<String> nodeIds, int index) {
		if(index == (nodeIds.size() - 1)) {
			/*
			 * base case if the list has only one element just return a
			 * restriction with the node
			 */
			return Restrictions.eq("nodeId", nodeIds.get(index));
		} else {
			/*
			 * "or" together this first element with the recursive call
			 * on the rest of the list
			 */
			return Restrictions.or(Restrictions.eq("nodeId", nodeIds.get(index)), createNodeOrCriterion(nodeIds, index + 1));
		}
	}
	
	/**
	 * Returns all nodes that are in the specified runId.
	 * @param runId
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static List<Node> getByRunId(String runId) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<Node> result = session.createCriteria(Node.class)
        	.add( Restrictions.eq("runId", runId)).list();
        
        session.getTransaction().commit();
        return result;
	}
}
