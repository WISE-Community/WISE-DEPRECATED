/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.dao.userinfo.impl;

import java.util.Calendar;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Vector;

import org.hibernate.Session;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.userinfo.UserInfoDao;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;


/**
 * @author h
 * @version $Id:$
 */
public class HibernateUserInfoDao extends AbstractHibernateDao<UserInfo> implements UserInfoDao<UserInfo>{

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends UserInfo> getDataObjectClass() {
		return null;
	}
	
	public UserInfo getUserInfoById(Long id) {
		UserInfo userInfo = null;
		
		try {
			userInfo = getById(id);
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
		
		return userInfo;
	}

	@Transactional(readOnly=false)
	public void saveUserInfo(UserInfo userInfo) {
		save(userInfo);
	}
	
	@Transactional
	public UserInfo getUserInfoByWorkgroupId(Long workgroupId) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		List<UserInfo> list = session.createCriteria(UserInfo.class).add(Restrictions.eq("workgroupId", workgroupId)).list();
		
		UserInfo userInfo = null;
		
		if(list != null && list.size() > 0) {
			userInfo = list.get(0);
		}
		return userInfo;
	}

	/**
	 * Similar to getByWorkgroupId, but if the user is
	 * not found, create one. This method will always return 
	 * a non-null UserInfo.
	 * @param id
	 * @return
	 */
	@Transactional
	public synchronized UserInfo getUserInfoOrCreateByWorkgroupId(Long workgroupId) {
		UserInfo userInfo = getUserInfoByWorkgroupId(workgroupId);
		if (userInfo == null) {
			userInfo = new UserInfo();
			userInfo.setWorkgroupId(workgroupId);
			saveUserInfo(userInfo);
		}
        return userInfo;
	}
	
	/**
	 * Obtain a list of UserInfo objects from a list of workgroup ids
	 * @param workgroupIds a list of workgroup ids in String format
	 * @return a list of UserInfo objects
	 */
    @Transactional()	
	public List<UserInfo> getUserInfoByWorkgroupIds(List<String> workgroupIds) {
		//the list to hold all the UserInfo objects we will retrieve
		List<UserInfo> userInfos = new Vector<UserInfo>();
		
		//an iterator of all the workgroup ids we want
		Iterator<String> workgroupIdsIterator = workgroupIds.iterator();
		
		//loop through all the workgroup ids
		while(workgroupIdsIterator.hasNext()) {
			//get a workgroup id
			String currentWorkgroupId = workgroupIdsIterator.next();
			
			//retrieve the UserInfo object for that workgroup id
			UserInfo currentUserInfo = getUserInfoOrCreateByWorkgroupId(new Long(currentWorkgroupId));
			
			if(currentUserInfo != null) {
				//add the UserInfo object to our list
				userInfos.add(currentUserInfo);				
			}
		}
		
		return userInfos;
	}
	
	/**
	 * Create a query criterion of 'or' statements recursively
	 * @param workgroupList a list of workgroup ids as strings, the list
	 * must not be empty
	 * @param index the index within the list that we are on, for the first call
	 * it should be 0
	 * @return a Criterion object with 'or' statements combining all the workgroupIds
	 */
	private Criterion createNodeOrCriterion(List<String> workgroupList, int index) {
		if(index == (workgroupList.size() - 1)) {
			/*
			 * base case if the list has only one element just return a
			 * restriction with the workgroupId
			 */
			return Restrictions.eq("workgroupId", Long.parseLong(workgroupList.get(index)));
		} else {
			/*
			 * "or" together this first element with the recursive call
			 * on the rest of the list
			 */
			return Restrictions.or(Restrictions.eq("workgroupId", Long.parseLong(workgroupList.get(index))), createNodeOrCriterion(workgroupList, index + 1));
		}
	}
	
	
	/**
	 * Out of the list of UserInfo objects that are passed in, find the ones that have
	 * submitted any work today and return them in a list.
	 * 
	 * note: this function is currently inefficient as it queries each UserInfo individually.
	 * This should be changed so that it obtains the latest StepWork for each UserInfo
	 * all at the same time.
	 * 
	 * @param userInfos a list of UserInfo objects that we will filter
	 * @return a list of UserInfo objects that have been filtered and only
	 * contain the UserInfos that have performed any work today
	 */
	@Transactional(readOnly=true)
	public List<UserInfo> getUserInfosThatHaveWorkedToday(List<UserInfo> userInfos) {
		List<UserInfo> userInfosThatHaveWorkedToday = new Vector<UserInfo>();
		
		//get a calendar object
		Calendar calendar = Calendar.getInstance();
		
		//set the calendar to today without the hours, minutes, seconds
		calendar.set(Calendar.YEAR, Calendar.MONTH, Calendar.DAY_OF_MONTH, 0, 0, 0);
		
		//get the date object
		Date today = calendar.getTime();
		
		//loop through all the UserInfos
        for(UserInfo userInfo : userInfos) {
        	Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
            
            //get all the work for a user
        	List<StepWork> list = session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo)).addOrder(Order.desc("postTime")).list();
            StepWork result = null;
            
            //check if there were any results
            if (list.size() > 0) {
            	//get the latest work
            	result = list.get(0);
            	
            	//check if the latest work was done today
            	if(result.getPostTime().after(today)) {
            		//latest work was done today so we will add the user to our array to return it
                	userInfosThatHaveWorkedToday.add(userInfo);
                }
            }
            
        }
        
        //return the list of UserInfos that have done work today
        return userInfosThatHaveWorkedToday;
	}
}
