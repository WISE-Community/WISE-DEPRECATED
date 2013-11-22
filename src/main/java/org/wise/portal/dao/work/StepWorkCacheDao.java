package org.wise.portal.dao.work;

import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWorkCache;

import net.sf.sail.webapp.dao.SimpleDao;

public interface StepWorkCacheDao<T extends StepWorkCache> extends SimpleDao<T> {

	public StepWorkCache getStepWorkCacheByUserInfo(UserInfo userInfo);
	
	public StepWorkCache getStepWorkCacheByUserInfoGetRevisions(UserInfo userInfo, boolean getRevisions);
}
