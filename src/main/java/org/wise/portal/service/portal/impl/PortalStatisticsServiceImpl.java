package org.wise.portal.service.portal.impl;

import java.util.List;

import org.wise.portal.dao.portal.PortalStatisticsDao;
import org.wise.portal.domain.portal.PortalStatistics;
import org.wise.portal.service.portal.PortalStatisticsService;

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
