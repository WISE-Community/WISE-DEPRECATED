package org.telscenter.sail.webapp.service.portal.impl;

import java.util.List;

import org.telscenter.sail.webapp.dao.portal.PortalStatisticsDao;
import org.telscenter.sail.webapp.domain.portal.PortalStatistics;
import org.telscenter.sail.webapp.service.portal.PortalStatisticsService;

public class PortalStatisticsServiceImpl implements PortalStatisticsService {
	
	private PortalStatisticsDao<PortalStatistics> portalStatisticsDao;

	/**
	 * Get all the portal statistics ordered by timestamp from oldest to newest
	 */
	public List<PortalStatistics> getPortalStatistics() {
		List<PortalStatistics> portalStatisticsList = portalStatisticsDao.getAllPortalStatistics();
		
		return portalStatisticsList;
	}
	
	public PortalStatisticsDao<PortalStatistics> getPortalStatisticsDao() {
		return portalStatisticsDao;
	}

	public void setPortalStatisticsDao(PortalStatisticsDao<PortalStatistics> portalStatisticsDao) {
		this.portalStatisticsDao = portalStatisticsDao;
	}
	
}
