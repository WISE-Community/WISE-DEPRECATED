package org.telscenter.sail.webapp.service.portal;

import java.util.List;

import org.telscenter.sail.webapp.dao.portal.PortalStatisticsDao;
import org.telscenter.sail.webapp.domain.portal.PortalStatistics;

public interface PortalStatisticsService {
	public List<PortalStatistics> getPortalStatistics();
	
	public PortalStatisticsDao<PortalStatistics> getPortalStatisticsDao();

	public void setPortalStatisticsDao(PortalStatisticsDao<PortalStatistics> portalStatisticsDao);
}
