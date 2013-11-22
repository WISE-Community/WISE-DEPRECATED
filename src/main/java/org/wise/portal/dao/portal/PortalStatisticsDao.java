package org.wise.portal.dao.portal;

import java.util.List;

import org.wise.portal.domain.portal.PortalStatistics;

import net.sf.sail.webapp.dao.SimpleDao;

public interface PortalStatisticsDao<T extends PortalStatistics> extends SimpleDao<T> {

	public List<PortalStatistics> getAllPortalStatistics();
	
}
