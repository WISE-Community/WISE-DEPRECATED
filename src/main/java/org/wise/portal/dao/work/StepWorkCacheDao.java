package org.wise.portal.dao.work;

import org.wise.portal.dao.SimpleDao;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWorkCache;


public interface StepWorkCacheDao<T extends StepWorkCache> extends SimpleDao<T> {

	public StepWorkCache getStepWorkCacheById(Long id);
	
	public void saveStepWorkCache(StepWorkCache stepWorkCache);
	
	public StepWorkCache getStepWorkCacheByUserInfo(UserInfo userInfo);
	
	public StepWorkCache getStepWorkCacheByUserInfoGetRevisions(UserInfo userInfo, boolean getRevisions);
}
