package org.telscenter.sail.webapp.dao.portal.impl;

import java.util.List;

import org.telscenter.sail.webapp.dao.portal.PortalStatisticsDao;
import org.telscenter.sail.webapp.domain.portal.PortalStatistics;

import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;

public class HibernatePortalStatisticsDao extends AbstractHibernateDao<PortalStatistics> implements PortalStatisticsDao<PortalStatistics> {

	/**
	 * Get all the portal statistics rows ordered by timestamp oldest to newest
	 */
	public List<PortalStatistics> getAllPortalStatistics() {
    	String query = "select portalStatistics from PortalStatisticsImpl portalStatistics order by timestamp asc";
    	return this.getHibernateTemplate().find(query);
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
