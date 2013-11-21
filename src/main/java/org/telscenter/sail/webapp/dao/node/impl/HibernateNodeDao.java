package org.telscenter.sail.webapp.dao.node.impl;

import java.util.List;

import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;

import org.hibernate.Session;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.Restrictions;
import org.telscenter.sail.webapp.dao.node.NodeDao;

import vle.domain.PersistableDomain;
import vle.domain.node.Node;
import vle.hibernate.HibernateUtil;

public class HibernateNodeDao extends AbstractHibernateDao<Node> implements NodeDao<Node> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends Node> getDataObjectClass() {
		return null;
	}


	/**
	 * @param nodeId
	 * @param runId
	 * @return node
	 */
	public Node getNodeByNodeIdAndRunId(String nodeId, String runId) {
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
	public Node getNodeByNodeIdAndRunId(String nodeId, String runId, boolean createIfNotFound) {
		Node node = getNodeByNodeIdAndRunId(nodeId, runId);
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
	public List<Node> getNodesByNodeIdsAndRunId(List<String> nodeIds, String runId) {
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
	private Criterion createNodeOrCriterion(List<String> nodeIds, int index) {
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
	public List<Node> getNodesByRunId(String runId) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<Node> result = session.createCriteria(Node.class)
        	.add( Restrictions.eq("runId", runId)).list();
        
        session.getTransaction().commit();
        return result;
	}
}
