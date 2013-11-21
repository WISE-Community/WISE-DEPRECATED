package org.telscenter.sail.webapp.dao.ideabasket.impl;

import java.util.ArrayList;
import java.util.List;

import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;

import org.hibernate.Session;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.ProjectionList;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;
import org.telscenter.sail.webapp.dao.ideabasket.IdeaBasketDao;

import vle.domain.ideabasket.IdeaBasket;
import vle.hibernate.HibernateUtil;

public class HibernateIdeaBasketDao extends AbstractHibernateDao<IdeaBasket> implements IdeaBasketDao<IdeaBasket> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends IdeaBasket> getDataObjectClass() {
		return null;
	}

	
	/**
	 * Get the latest IdeaBasket with the given run id and workgroup id
	 * @param runId the id of the run
	 * @param workgroupId the id of the workgroup
	 * @return the IdeaBasket with the matching runId and workgroupId
	 */
	public IdeaBasket getIdeaBasketByRunIdWorkgroupId(long runId, long workgroupId) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        
        //find all the IdeaBasket objects that match
        List<IdeaBasket> result =  session.createCriteria(IdeaBasket.class).add(
        		Restrictions.eq("runId", runId)).add(
        				Restrictions.eq("workgroupId", workgroupId)).addOrder(Order.desc("postTime")).list();
        session.getTransaction().commit();
        
        IdeaBasket ideaBasket = null;
        if(result.size() > 0) {
        	/*
        	 * get the first IdeaBasket from the result list since 
        	 * that will be the latest revision of that idea basket
        	 */
        	ideaBasket = result.get(0);
        }
        return ideaBasket;
	}
	
	/**
	 * Get all the latest IdeaBaskets with the given run id
	 * 
	 * we will basically be performing this query
	 * select * from vle_database.ideaBasket i where id in(SELECT max(id) FROM vle_database.ideaBasket i where runid=<insert runId> group by workgroupid)
	 * 
	 * @param runId the id of the run
	 * @return all the latest IdeaBaskets for a run id
	 */
	@SuppressWarnings("unchecked")
	public List<IdeaBasket> getLatestIdeaBasketsForRunId(long runId) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        
        /*
         * create a projection that will give us the latest idea basket id
         * for each workgroup id in the run. the projection will return 
         * an array of array objects that will look like [id, workgroupId].
         * each workgroup id will only appear once.
         */
        ProjectionList projectionList = Projections.projectionList();
        projectionList.add(Projections.max("id"));
        projectionList.add(Projections.groupProperty("workgroupId"));
        
        //this first query will filter on the runId and the projection
        List latestIdeaBasketIdsProjection =  session.createCriteria(IdeaBasket.class).add(
        		Restrictions.eq("runId", runId)).setProjection(projectionList).list();
        
        //the list that will contain all the idea basket ids we want
        List<Long> ideaBasketIds = new ArrayList<Long>();
        
        //loop through all the results from our first query
        for(int x=0; x<latestIdeaBasketIdsProjection.size(); x++) {
        	//get the idea basket id
        	Object[] projection = (Object[]) latestIdeaBasketIdsProjection.get(x);
        	Long ideaBasketId = (Long) projection[0];
        	ideaBasketIds.add(ideaBasketId);
        }
        
        List<IdeaBasket> result = new ArrayList<IdeaBasket>();
        
        if(ideaBasketIds.size() > 0) {
        	//this second query will retrieve all the idea basket ids we retrieved from the first query
        	result = session.createCriteria(IdeaBasket.class).add(createIdOrCriterion(ideaBasketIds, 0)).list();        	
        }
        
        session.getTransaction().commit();
        
        return result;
	}
	
	/**
	 * Get all the latest IdeaBaskets with the given run id
	 * 
	 * we will basically be performing this query
	 * select * from vle_database.ideaBasket i where id in(SELECT max(id) FROM vle_database.ideaBasket i where runid=<insert runId> and workgroupid in(<insert workgroup ids>) group by workgroupid)
	 * 
	 * @param runId the id of the run
	 * @param workgroupIds a list of workgroup ids
	 * @return all the latest IdeaBaskets for a run id
	 */
	@SuppressWarnings("unchecked")
	public List<IdeaBasket> getLatestIdeaBasketsForRunIdWorkgroupIds(long runId, List<Long> workgroupIds) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        
        /*
         * create a projection that will give us the latest idea basket id
         * for each workgroup id in the run. the projection will return 
         * an array of array objects that will look like [id, workgroupId].
         * each workgroup id will only appear once.
         */
        ProjectionList projectionList = Projections.projectionList();
        projectionList.add(Projections.max("id"));
        projectionList.add(Projections.groupProperty("workgroupId"));
        
        //this first query will filter on the runId and workgroupids and the projection
        List latestIdeaBasketIdsProjection =  session.createCriteria(IdeaBasket.class).add(
        		Restrictions.eq("runId", runId)).add(Restrictions.in("workgroupId", workgroupIds)).setProjection(projectionList).list();
        
        //the list that will contain all the idea basket ids we want
        List<Long> ideaBasketIds = new ArrayList<Long>();
        
        //loop through all the results from our first query
        for(int x=0; x<latestIdeaBasketIdsProjection.size(); x++) {
        	//get the idea basket id
        	Object[] projection = (Object[]) latestIdeaBasketIdsProjection.get(x);
        	Long ideaBasketId = (Long) projection[0];
        	ideaBasketIds.add(ideaBasketId);
        }
        
        List<IdeaBasket> result = new ArrayList<IdeaBasket>();
        
        if(ideaBasketIds.size() > 0) {
        	//this second query will retrieve all the idea basket ids we retrieved from the first query
        	result = session.createCriteria(IdeaBasket.class).add(createIdOrCriterion(ideaBasketIds, 0)).list();        	
        }
        
        session.getTransaction().commit();
        
        return result;
	}
	
	/**
	 * Get all the idea basket revisions for a run. The results will be
	 * ordered by workgroup id and within the ordered workgroup ids it
	 * will be ordered by post time
	 * @param runId the run id
	 * @return a list of idea baskets ordered by workgroup id and then
	 * by post time
	 */
	public List<IdeaBasket> getIdeaBasketsForRunId(long runId) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        
        //find all the IdeaBasket objects that match
        List<IdeaBasket> result =  session.createCriteria(IdeaBasket.class).add(
        		Restrictions.eq("runId", runId)).addOrder(Order.asc("workgroupId")).addOrder(Order.asc("periodId")).addOrder(Order.asc("postTime")).list();
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * Get the latest public idea basket for the given run id, period id
	 * @param runId the run id
	 * @param periodId the period id
	 * @return the latest public idea basket for this run id, period id or null if there is none
	 */
	public IdeaBasket getPublicIdeaBasketForRunIdPeriodId(long runId, long periodId) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        
        //get the latest idea basket revision that matches
        List<IdeaBasket> result =  session.createCriteria(IdeaBasket.class).add(
        		Restrictions.eq("runId", runId)).add(Restrictions.eq("periodId", periodId)).add(Restrictions.eq("isPublic", true)).addOrder(Order.desc("id")).list();
        session.getTransaction().commit();
        
        IdeaBasket ideaBasket = null;
        if(result.size() > 0) {
        	/*
        	 * get the first IdeaBasket from the result list since 
        	 * that will be the latest revision of that idea basket
        	 */
        	ideaBasket = result.get(0);
        }
        return ideaBasket;
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
}
