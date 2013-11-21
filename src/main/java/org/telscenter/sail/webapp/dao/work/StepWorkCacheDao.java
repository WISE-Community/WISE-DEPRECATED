package org.telscenter.sail.webapp.dao.work;

import vle.domain.user.UserInfo;
import vle.domain.work.StepWorkCache;
import net.sf.sail.webapp.dao.SimpleDao;

public interface StepWorkCacheDao<T extends StepWorkCache> extends SimpleDao<T> {

	public StepWorkCache getStepWorkCacheByUserInfo(UserInfo userInfo);
	
	public StepWorkCache getStepWorkCacheByUserInfoGetRevisions(UserInfo userInfo, boolean getRevisions);
}
