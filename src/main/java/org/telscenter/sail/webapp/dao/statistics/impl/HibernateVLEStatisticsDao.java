package org.telscenter.sail.webapp.dao.statistics.impl;

import java.util.List;

import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;

import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.telscenter.sail.webapp.dao.statistics.VLEStatisticsDao;

import vle.domain.statistics.VLEStatistics;
import vle.hibernate.HibernateUtil;

public class HibernateVLEStatisticsDao extends AbstractHibernateDao<VLEStatistics> implements VLEStatisticsDao<VLEStatistics> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends VLEStatistics> getDataObjectClass() {
		return null;
	}

	/**
	 * Get all the vle statistics rows ordered from oldest to newest
	 * @return a list of all the vle statistics
	 */
	public List<VLEStatistics> getVLEStatistics() {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        
        //get the vle statistics from oldest to newest
        List<VLEStatistics> result =  session.createCriteria(VLEStatistics.class).addOrder(Order.asc("timestamp")).list();
        
        session.getTransaction().commit();
        return result;
	}
}
