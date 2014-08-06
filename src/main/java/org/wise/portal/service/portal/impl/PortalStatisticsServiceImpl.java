package org.wise.portal.service.portal.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.wise.portal.dao.portal.PortalStatisticsDao;
import org.wise.portal.domain.portal.PortalStatistics;
import org.wise.portal.service.portal.PortalStatisticsService;

@Service
public class PortalStatisticsServiceImpl implements PortalStatisticsService {
	
	@Autowired
	private PortalStatisticsDao<PortalStatistics> portalStatisticsDao;

	/**
	 * Get all the portal statistics ordered by timestamp from oldest to newest
	 */
	public List<PortalStatistics> getPortalStatistics() {
		return portalStatisticsDao.getAllPortalStatistics();
	}

	public PortalStatistics getLatestPortalStatistics() {
		return portalStatisticsDao.getLatestPortalStatistics();
	}
}
