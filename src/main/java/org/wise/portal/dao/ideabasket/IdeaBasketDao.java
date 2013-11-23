package org.wise.portal.dao.ideabasket;

import java.util.List;

import org.wise.vle.domain.ideabasket.IdeaBasket;

import net.sf.sail.webapp.dao.SimpleDao;

public interface IdeaBasketDao<T extends IdeaBasket> extends SimpleDao<IdeaBasket> {

	public IdeaBasket getIdeaBasketById(Long id);
	
	public void saveIdeaBasket(IdeaBasket ideaBasket);
	
	public IdeaBasket getIdeaBasketByRunIdWorkgroupId(long runId, long workgroupId);
	
	public List<IdeaBasket> getLatestIdeaBasketsForRunId(long runId);
	
	public List<IdeaBasket> getLatestIdeaBasketsForRunIdWorkgroupIds(long runId, List<Long> workgroupIds);
	
	public List<IdeaBasket> getIdeaBasketsForRunId(long runId);
	
	public IdeaBasket getPublicIdeaBasketForRunIdPeriodId(long runId, long periodId);
}
