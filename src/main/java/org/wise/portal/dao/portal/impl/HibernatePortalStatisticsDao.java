package org.wise.portal.dao.portal.impl;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.springframework.stereotype.Repository;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.portal.PortalStatisticsDao;
import org.wise.portal.domain.portal.PortalStatistics;
import org.wise.vle.domain.statistics.VLEStatistics;

@Repository
public class HibernatePortalStatisticsDao extends AbstractHibernateDao<PortalStatistics> implements PortalStatisticsDao<PortalStatistics> {

	/**
	 * Get all the portal statistics rows ordered by timestamp oldest to newest
	 */
	public List<PortalStatistics> getAllPortalStatistics() {
    	String query = "select portalStatistics from PortalStatisticsImpl portalStatistics order by timestamp asc";
    	return (List<PortalStatistics>) this.getHibernateTemplate().find(query);
	}
	
	/**
	 * Get all the portal statistics rows ordered by timestamp oldest to newest
	 */
	public PortalStatistics getLatestPortalStatistics() {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        
        //get the vle statistics from oldest to newest
       return (PortalStatistics) session.createCriteria(PortalStatistics.class).addOrder(Order.asc("timestamp")).setMaxResults(1).uniqueResult();
	}
	
	@Override
	protected Class<? extends PortalStatistics> getDataObjectClass() {
		return null;
	}

	@Override
	protected String getFindAllQuery() {
		return null;
	}

}
