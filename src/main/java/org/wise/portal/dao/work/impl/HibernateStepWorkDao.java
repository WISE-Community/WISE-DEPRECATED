package org.wise.portal.dao.work.impl;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.work.StepWorkDao;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;

@Repository
public class HibernateStepWorkDao extends AbstractHibernateDao<StepWork> implements StepWorkDao<StepWork> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends StepWork> getDataObjectClass() {
		return StepWork.class;
	}

	public StepWork getStepWorkById(Long id) {
		StepWork stepWork = null;
		
		try {
			stepWork = getById(id);
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
		
		return stepWork;
	}
	
	@Transactional
	public void saveStepWork(StepWork stepWork) {
		save(stepWork);
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
	@Transactional(readOnly=true)
	public List<StepWork> getStepWorksByUserInfo(UserInfo userInfo) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
          return session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo)).addOrder(Order.asc("id")).list();
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
	@Transactional(readOnly=true)
	public StepWork getLatestStepWorkByUserInfo(UserInfo userInfo) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        List<StepWork> list = session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo)).addOrder(Order.desc("id")).list();

        StepWork result = null;
        if (list.size() > 0) {
        	result = list.get(0);
        }
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
	@Transactional(readOnly=true)
	public StepWork getLatestStepWorkByUserInfoAndNode(UserInfo userInfo,Node node) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        List<StepWork> list = session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo))
        	.add(Restrictions.eq("node",node)).addOrder(Order.desc("id")).list();
        StepWork result = null;
        if (list.size() > 0) {
        	result = list.get(0);
        }
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
	@Transactional(readOnly=true)
	public List<StepWork> getStepWorksByUserInfoAndNode(UserInfo userInfo,Node node) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        List<StepWork> result = session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo))
        	.add(Restrictions.eq("node",node)).addOrder(Order.desc("id")).list();

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
	@Transactional(readOnly=true)
	public List<StepWork> getStepWorksByUserInfoAndNodeList(UserInfo userInfo, List<Node> nodeList) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
          return session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo)).add(createNodeOrCriterion(nodeList, 0)).addOrder(Order.asc("id")).list();
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
	@Transactional(readOnly=true)
	public List<StepWork> getStepWorksByUserInfosAndNode(List<UserInfo> userInfos, Node node) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
          return session.createCriteria(StepWork.class).add(createUserInfoOrCriterion(userInfos, 0)).add(Restrictions.eq("node", node)).addOrder(Order.asc("id")).list();
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
	@Transactional(readOnly=true)
	public List<StepWork> getStepWorksByNode(Node node) {
    	  Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
          return session.createCriteria(StepWork.class).add(Restrictions.eq("node", node)).addOrder(Order.asc("id")).list();
	}
	
	/**
	 * Returns the StepWork with the specified id
	 * @param id
	 * @return the StepWork object with the specified id
	 */
	@Transactional(readOnly=true)
	public StepWork getStepWorkByStepWorkId(Long id) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
          return (StepWork) session.createCriteria(StepWork.class).add(Restrictions.eq("id", id)).uniqueResult();
	}
	
	/**
	 * Returns the StepWork with the specified userInfo and data
	 * @param userInfo UserInfo of user to check
	 * @param data String data to check for
	 * @return the StepWork object with the specified userInfo and data or null if DNE.
	 */
	@Transactional(readOnly=true)
	public StepWork getStepWorkByUserIdAndData(UserInfo userInfo,String data) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        return (StepWork) session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo)).add(Restrictions.eq("data",data)).uniqueResult();
	}

}
