package org.wise.portal.dao.portal;

import java.util.List;

import org.wise.portal.dao.SimpleDao;
import org.wise.portal.domain.portal.PortalStatistics;


public interface PortalStatisticsDao<T extends PortalStatistics> extends SimpleDao<T> {

	public List<PortalStatistics> getAllPortalStatistics();
	
	public PortalStatistics getLatestPortalStatistics();
}
