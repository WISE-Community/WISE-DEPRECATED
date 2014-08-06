package org.wise.portal.service.portal;

import java.util.List;

import org.wise.portal.domain.portal.PortalStatistics;

public interface PortalStatisticsService {
	public List<PortalStatistics> getPortalStatistics();
	
	public PortalStatistics getLatestPortalStatistics();
}
