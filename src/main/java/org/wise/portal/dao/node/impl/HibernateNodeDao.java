/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * 
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 * 
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 * 
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.dao.node.impl;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.node.NodeDao;
import org.wise.vle.domain.PersistableDomain;
import org.wise.vle.domain.node.Node;

@Repository
public class HibernateNodeDao extends AbstractHibernateDao<Node> implements NodeDao<Node> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends Node> getDataObjectClass() {
		return null;
	}
	
	public Node getNodeById(Long id) {
		Node node = null;
		
		try {
			node = getById(id);
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
		
		return node;
	}
	
	@Transactional
	public void saveNode(Node node) {
		save(node);
	}

	/**
	 * @param nodeId
	 * @param runId
	 * @return node
	 */
	@Transactional(readOnly=true)
	public Node getNodeByNodeIdAndRunId(String nodeId, String runId) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        PersistableDomain result = (PersistableDomain) session.createCriteria(Node.class)
        	.add( Restrictions.eq("nodeId", nodeId))
        	.add( Restrictions.eq("runId", runId)).uniqueResult();
        
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
			saveNode(node);
		}
        return node;
	}
	
	/**
	 * Get a List of Node objects given a list of node ids and the run id
	 * @param nodeIds a List of node id strings
	 * @param runId the run id as a string
	 * @return a List of Node objects
	 */
	@Transactional(readOnly=true)
	public List<Node> getNodesByNodeIdsAndRunId(List<String> nodeIds, String runId) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        List<Node> result =  session.createCriteria(Node.class).add(Restrictions.eq("runId", runId)).add(createNodeOrCriterion(nodeIds, 0)).list();
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
	@Transactional(readOnly=true)
	public List<Node> getNodesByRunId(String runId) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        List<Node> result = session.createCriteria(Node.class)
        	.add( Restrictions.eq("runId", runId)).list();
        
        return result;
	}
}
