package org.wise.portal.dao.statistics.impl;

import java.util.List;


import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.statistics.VLEStatisticsDao;
import org.wise.vle.domain.statistics.VLEStatistics;


public class HibernateVLEStatisticsDao extends AbstractHibernateDao<VLEStatistics> implements VLEStatisticsDao<VLEStatistics> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends VLEStatistics> getDataObjectClass() {
		return null;
	}

	public VLEStatistics getVLEStatisticsById(Long id) {
		VLEStatistics vleStatistics = null;
		
		try {
			vleStatistics = getById(id);
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
		
		return vleStatistics;
	}
	
	@Transactional
	public void saveVLEStatistics(VLEStatistics vleStatistics) {
		save(vleStatistics);
	}
	
	/**
	 * Get all the vle statistics rows ordered from oldest to newest
	 * @return a list of all the vle statistics
	 */
	public List<VLEStatistics> getVLEStatistics() {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        session.beginTransaction();
        
        //get the vle statistics from oldest to newest
        List<VLEStatistics> result =  session.createCriteria(VLEStatistics.class).addOrder(Order.asc("timestamp")).list();
        
        session.getTransaction().commit();
        return result;
	}
}
