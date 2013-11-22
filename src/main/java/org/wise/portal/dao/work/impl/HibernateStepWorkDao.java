package org.wise.portal.dao.work.impl;

import java.util.List;

import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;

import org.hibernate.Session;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.wise.portal.dao.work.StepWorkDao;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;
import org.wise.vle.hibernate.HibernateUtil;


public class HibernateStepWorkDao extends AbstractHibernateDao<StepWork> implements StepWorkDao<StepWork> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends StepWork> getDataObjectClass() {
		return null;
	}

	
	/**
	 * Returns a list of StepWork done by the specified workgroup with the specified id or null
	 * if no such StepWork exists. The list will be ordered oldest to newest.
	 * @param id
	 * @param clazz 
	 * @return 
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<StepWork> getStepWorksByUserInfo(UserInfo userInfo) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<StepWork> result =  session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo)).addOrder(Order.asc("endTime")).list();
        session.getTransaction().commit();
        return result;
	}

	/**
	 * Returns the latest StepWork done by the specified workgroup with the specified id or null
	 * if no such StepWork exists.
	 * @param id
	 * @param clazz 
	 * @return 
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public StepWork getLatestStepWorkByUserInfo(UserInfo userInfo) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<StepWork> list = session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo)).addOrder(Order.desc("endTime")).list();
        StepWork result = null;
        if (list.size() > 0) {
        	result = list.get(0);
        }
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * Returns the latest StepWork done by the specified workgroup with the specified id and specified node
	 * or null if no such StepWork exists.
	 * @param id
	 * @param clazz 
	 * @return 
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public StepWork getLatestStepWorkByUserInfoAndNode(UserInfo userInfo,Node node) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<StepWork> list = session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo))
        	.add(Restrictions.eq("node",node)).addOrder(Order.desc("endTime")).list();
        StepWork result = null;
        if (list.size() > 0) {
        	result = list.get(0);
        }
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * Get the StepWork for the given UserInfo and Node. The list will be ordered from
	 * newest to oldest.
	 * @param userInfo
	 * @param node
	 * @return a list of StepWork for the user and node
	 */
	@SuppressWarnings("unchecked")
	public List<StepWork> getStepWorksByUserInfoAndNode(UserInfo userInfo,Node node) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<StepWork> result = session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo))
        	.add(Restrictions.eq("node",node)).addOrder(Order.desc("endTime")).list();

        session.getTransaction().commit();
        return result;
	}
	
	
	/**
	 * Returns a list of StepWork done by the specified UserInfo user and have 
	 * a nodeId that is in the nodeList. The list will be ordered oldest to newest.
	 * @param userInfo a UserInfo object
	 * @param nodeList a list of Node objects
	 * @return a list of StepWork objects
	 */
	@SuppressWarnings("unchecked")
	public List<StepWork> getStepWorksByUserInfoAndNodeList(UserInfo userInfo, List<Node> nodeList) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<StepWork> result =  session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo)).add(createNodeOrCriterion(nodeList, 0)).addOrder(Order.asc("endTime")).list();
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * A recursive function that chains "or" restrictions of nodes together
	 * @param nodeList a list of Node objects, the list must not be empty
	 * @param index the current index in the list to utilize
	 * @return a Criterion of nodes "or"ed together
	 */
	private Criterion createNodeOrCriterion(List<Node> nodeList, int index) {
		if(index == (nodeList.size() - 1)) {
			/*
			 * base case if the list has only one element just return a
			 * restriction with the node
			 */
			return Restrictions.eq("node", nodeList.get(index));
		} else {
			/*
			 * "or" together this first element with the recursive call
			 * on the rest of the list
			 */
			return Restrictions.or(Restrictions.eq("node", nodeList.get(index)), createNodeOrCriterion(nodeList, index + 1));
		}
	}
	
	/**
	 * Returns a list of StepWork done by the specified workgroup with the specified id or null
	 * if no such Environment exists. The list will be ordered oldest to newest.
	 * @param id
	 * @param clazz 
	 * @return 
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<StepWork> getStepWorksByUserInfosAndNode(List<UserInfo> userInfos, Node node) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<StepWork> result =  session.createCriteria(StepWork.class).add(createUserInfoOrCriterion(userInfos, 0)).add(Restrictions.eq("node", node)).addOrder(Order.asc("endTime")).list();
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * A recursive function that chains "or" restrictions of userInfos together
	 * @param userInfos a list of UserInfo objects, the list must not be empty
	 * @param index the current index in the list to utilize
	 * @return a Criterion of UserInfo "or"ed together
	 */
	private Criterion createUserInfoOrCriterion(List<UserInfo> userInfos, int index) {
		if(index == (userInfos.size() - 1)) {
			/*
			 * base case if the list has only one element just return a
			 * restriction with the UserInfo
			 */
			return Restrictions.eq("userInfo", userInfos.get(index));
		} else {
			/*
			 * "or" together this first element with the recursive call
			 * on the rest of the list
			 */
			return Restrictions.or(Restrictions.eq("userInfo", userInfos.get(index)), createUserInfoOrCriterion(userInfos, index + 1));			
		}
	}
	
	/**
	 * A recursive function that chains "or" restrictions of ids together
	 * @param ids a list of ids, the list must not be empty
	 * @param index the current index in the list to utilize
	 * @return a Criterion of id "or"ed together
	 */
	private Criterion createIdOrCriterion(List<Long> ids, int index) {
		if(index == (ids.size() - 1)) {
			/*
			 * base case if the list has only one element just return a
			 * restriction with the id
			 */
			return Restrictions.eq("id", ids.get(index));
		} else {
			/*
			 * "or" together this first element with the recursive call
			 * on the rest of the list
			 */
			return Restrictions.or(Restrictions.eq("id", ids.get(index)), createIdOrCriterion(ids, index + 1));			
		}
	}
	
	/**
	 * Returns an Environment with the specified id or null
	 * if no such Environment exists. The list will be ordered
	 * oldest to newest.
	 * @param id
	 * @param clazz 
	 * @return 
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<StepWork> getStepWorksByNodeId(Long id) {
    	Node node = (Node) Node.getById(new Long(id), Node.class);
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<StepWork> result =  session.createCriteria(StepWork.class).add(Restrictions.eq("node", node)).addOrder(Order.asc("endTime")).list();
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * Returns the StepWork with the specified id
	 * @param id
	 * @return the StepWork object with the specified id
	 */
	public StepWork getStepWorkByStepWorkId(Long id) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        StepWork result =  (StepWork) session.createCriteria(StepWork.class).add(Restrictions.eq("id", id)).uniqueResult();
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * Returns the StepWork with the specified userInfo and data
	 * @param userInfo UserInfo of user to check
	 * @param data String data to check for
	 * @return the StepWork object with the specified userInfo and data or null if DNE.
	 */
	public StepWork getStepWorkByUserIdAndData(UserInfo userInfo,String data) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        StepWork result =  (StepWork) session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo)).add(Restrictions.eq("data",data)).uniqueResult();
        session.getTransaction().commit();
        return result;
	}

}
