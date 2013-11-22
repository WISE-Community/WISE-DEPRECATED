package org.wise.portal.dao.statistics;

import java.util.List;

import org.wise.vle.domain.statistics.VLEStatistics;

import net.sf.sail.webapp.dao.SimpleDao;

public interface VLEStatisticsDao<T extends VLEStatistics> extends SimpleDao<T> {

	public List<VLEStatistics> getVLEStatistics();
}
