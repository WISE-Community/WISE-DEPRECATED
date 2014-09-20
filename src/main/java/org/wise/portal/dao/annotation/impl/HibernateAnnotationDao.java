/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). 
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * 
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
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
package org.wise.portal.dao.annotation.impl;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Vector;

import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.annotation.AnnotationDao;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.vle.domain.annotation.Annotation;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;

@Repository
public class HibernateAnnotationDao extends AbstractHibernateDao<Annotation> implements AnnotationDao<Annotation> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends Annotation> getDataObjectClass() {
		return null;
	}
	
	public Annotation getAnnotationById(Long id) {
		Annotation annotation = null;
		
		try {
			annotation = getById(id);
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
		
		return annotation;
	}
	
	@Transactional
	public void saveAnnotation(Annotation annotation) {
		save(annotation);
	}

	/**
	 * Returns a list of Annotation that were made from
	 * the specified workgroup to the specified workgroup.
	 * If either workgroup is null, handle for all workgroup.
	 * @return
	 */
	@Override
	@Transactional(readOnly=true)
	public List<Annotation> getAnnotationByFromWorkgroupAndWorkByToWorkgroup(UserInfo fromWorkgroup, List<StepWork> workByToWorkgroup, Class<?> clazz) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();

        List<Annotation> result = 
        	session.createCriteria(clazz)
        		.add( Restrictions.eq("fromUser", fromWorkgroup))
        		.add( Restrictions.in("stepWork", workByToWorkgroup))
        		.list();
        return result;
	}
	
	/**
	 * Get a list of Annotation objects given a list of fromWorkgroups and a toWorkgroup
	 * @param fromWorkgroups a list of from workroups
	 * @param toWorkgroup a to workgroup
	 * @param clazz
	 * @return a list of Annotation objects that match the toWorkgroup and any fromWorkgroup
	 * in the list of fromWorkgroups
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly=true)
	public List<Annotation> getAnnotationByFromWorkgroupsAndWorkByToWorkgroup(List<UserInfo> fromWorkgroups, List<StepWork> workByToWorkgroup, Class<?> clazz) {
		List<Annotation> result = new Vector<Annotation>();
		
		//check if there was any work
		if(workByToWorkgroup.size() != 0) {
			Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();

	        result = 
	        	session.createCriteria(clazz)
	        		.add( Restrictions.in("fromUser", fromWorkgroups))
	        		.add( Restrictions.in("stepWork", workByToWorkgroup))
	        		.list();
		}

        return result;
	}
	
	/**
	 * Returns a list of Annotation that are for the specified run id
	 * @param runId the id of the run we want annotations for
	 * @param clazz this Annotation.class
	 * @return a list of Annotation
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly=true)
	public List<? extends Annotation> getAnnotationByRunId(Long runId, Class<?> clazz) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();

        List<Annotation> result = 
        	session.createCriteria(clazz)
        		.add( Restrictions.eq("runId", runId))
        		.list();
        return result;
	}
	
	/**
	 * Returns a list of Annotations that are for the specified run id and
	 * have the specific annotation type
	 * @param runId the id of the run we want annotations for
	 * @param type the type of annotation we want
	 * @param clazz this Annotation.class
	 * @return a list of Annotation
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly=true)
	public List<? extends Annotation> getAnnotationByRunIdAndType(Long runId, String type, Class<?> clazz) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();

        List<Annotation> result = 
        	session.createCriteria(clazz)
        		.add(Restrictions.eq("runId", runId))
        		.add(Restrictions.eq("type", type))
        		.list();
        return result;
	}
	
	/**
	 * @param userInfo User who did the annotation
	 * @param stepWork stepWork that was annotated
	 * @return
	 */
	@Transactional(readOnly=true)
	public Annotation getAnnotationByUserInfoAndStepWork(UserInfo userInfo, StepWork stepWork, String type) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();

        Annotation result = null;
        
        if(type != null) {
        	result = 
        			(Annotation) session.createCriteria(Annotation.class)
        			.add( Restrictions.eq("fromUser", userInfo))
        			.add( Restrictions.eq("stepWork", stepWork))
        			.add( Restrictions.eq("type", type))
        			.uniqueResult();
        } else {
        	result = 
        			(Annotation) session.createCriteria(Annotation.class)
        			.add( Restrictions.eq("fromUser", userInfo))
        			.add( Restrictions.eq("stepWork", stepWork))
        			.uniqueResult();
        }
        
        return result;
	}
	
	@Transactional(readOnly=true)
	public Annotation getAnnotationByFromUserInfoToUserInfoStepWorkType(UserInfo fromUserInfo, UserInfo toUserInfo, StepWork stepWork, String type) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();

        Annotation result = null;
        
        Criteria criteria = session.createCriteria(Annotation.class)
		.add( Restrictions.eq("toUser", toUserInfo))
		.add( Restrictions.eq("type", type));
        
        if(fromUserInfo != null) {
        	criteria.add( Restrictions.eq("fromUser", fromUserInfo));
        }
        
        if(stepWork != null) {
        	criteria.add( Restrictions.eq("stepWork", stepWork));
        }
        
        result = (Annotation) criteria.uniqueResult();
        
        return result;
	}
	
	/**
	 * Get the latest annotation from user and to user for the given node id and annotation type
	 * @param fromUserInfo the user who created the annotation
	 * @param toUserInfo the user that is receiving the annotation
	 * @param nodeId the node id
	 * @param type the annotation type
	 * @see org.wise.portal.dao.annotation.AnnotationDao#getAnnotationByFromUserInfoToUserInfoNodeIdType(org.wise.vle.domain.user.UserInfo, org.wise.vle.domain.user.UserInfo, java.lang.String, java.lang.String)
	 */
	@Transactional(readOnly=true)
	public Annotation getAnnotationByFromUserInfoToUserInfoNodeIdType(UserInfo fromUserInfo, UserInfo toUserInfo, String nodeId, String type) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();

        Annotation result = null;
        
        Criteria criteria = session.createCriteria(Annotation.class)
		.add( Restrictions.eq("fromUser", fromUserInfo))
		.add( Restrictions.eq("toUser", toUserInfo))
		.add( Restrictions.eq("type", type))
		.add(Restrictions.like("data", "%\"nodeId\":\"" + nodeId + "\"%"))
		.addOrder(Order.asc("postTime"));

        List<Annotation> results = (List<Annotation>) criteria.list();
        
        if(results != null && results.size() > 0) {
        	//get the latest annotation
        	result = results.get(results.size() - 1);
        }
        
        return result;
	}
	
	/**
	 * Get the latest annotation from user and to user for the given annotation type
	 * @param fromUserInfo the user who created the annotation
	 * @param toUserInfo the user that is receiving the annotation
	 * @param type the annotation type
	 * @see org.wise.portal.dao.annotation.AnnotationDao#getAnnotationByFromUserInfoToUserInfoNodeIdType(org.wise.vle.domain.user.UserInfo, org.wise.vle.domain.user.UserInfo, java.lang.String, java.lang.String)
	 */
	@Transactional(readOnly=true)
	public Annotation getAnnotationByFromUserInfoToUserInfoType(UserInfo fromUserInfo, UserInfo toUserInfo, String type) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();

        Annotation result = null;
        
        Criteria criteria = session.createCriteria(Annotation.class)
		.add( Restrictions.eq("fromUser", fromUserInfo))
		.add( Restrictions.eq("toUser", toUserInfo))
		.add( Restrictions.eq("type", type))
		.addOrder(Order.asc("postTime"));

        List<Annotation> results = (List<Annotation>) criteria.list();
        
        if(results != null && results.size() > 0) {
        	//get the latest annotation
        	result = results.get(results.size() - 1);
        }
        
        return result;
	}
	
	/**
	 * Get all the annotations that are from any of the users in the fromWorkgroups list
	 * and to the specific step work
	 * @param fromWorkgroups a list of UserInfo objects
	 * @param stepWork a StepWork object
	 * @param clazz
	 * @return a list of annotations that are from anyone in the fromWorkgroups list
	 * to the specific step work
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly=true)
	public List<Annotation> getAnnotationByFromWorkgroupsAndStepWork(List<UserInfo> fromWorkgroups, StepWork stepWork, String type) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        
        List<Annotation> results = null;
        		
        if(type != null) {
        	results = 
                	(List<Annotation>) session.createCriteria(Annotation.class)
                		.add( Restrictions.in("fromUser", fromWorkgroups))
                		.add( Restrictions.eq("stepWork", stepWork))
                		.add( Restrictions.eq("type", type))
                		.list();
        } else {
        	results = 
                	(List<Annotation>) session.createCriteria(Annotation.class)
                		.add( Restrictions.in("fromUser", fromWorkgroups))
                		.add( Restrictions.eq("stepWork", stepWork))
                		.list();
        }

        return results;
	}
	
	/**
	 * Get all the annotations for the given stepwork
	 * @param stepWork
	 * @param clazz
	 * @return a list of annotations that are for a given stepwork
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly=true)
	public List<Annotation> getAnnotationByStepWork(StepWork stepWork, Class<?> clazz) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();

        List<Annotation> results = 
        	(List<Annotation>) session.createCriteria(clazz)
        		.add( Restrictions.eq("stepWork", stepWork))
        		.list();
        return results;
	}
	
	/**
	 * Get all the annotations for the given stepwork
	 * @param stepWork
	 * @param clazz
	 * @return a list of annotations that are for a given stepwork
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly=true)
	public List<Annotation> getAnnotationByFromUserToUserType(List<UserInfo> fromUsers, UserInfo toUser, String annotationType) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();

        List<Annotation> results = 
        	(List<Annotation>) session.createCriteria(Annotation.class)
        		.add( Restrictions.in("fromUser", fromUsers))
        		.add( Restrictions.eq("toUser", toUser))
        		.add( Restrictions.eq("type", annotationType))
        		.list();
        return results;
	}
	
	/**
	 * Get all the annotations for the given stepwork
	 * @param stepWork
	 * @param clazz
	 * @return a list of annotations that are for a given stepwork
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly=true)
	public List<Annotation> getAnnotationByToUserType(UserInfo toUser, String annotationType) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();

        List<Annotation> results = 
        	(List<Annotation>) session.createCriteria(Annotation.class)
        		.add( Restrictions.eq("toUser", toUser))
        		.add( Restrictions.eq("type", annotationType))
        		.list();
        return results;
	}
	
	/**
	 * Get all the annotations for the given stepwork
	 * @param stepWork
	 * @param clazz
	 * @return a list of annotations that are for a given stepwork
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly=true)
	public Annotation getAnnotationByStepWorkAndAnnotationType(StepWork stepWork, String annotationType) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();

        Annotation result = 
        	(Annotation) session.createCriteria(Annotation.class)
        		.add( Restrictions.eq("stepWork", stepWork))
        		.add( Restrictions.eq("type", annotationType))
        		.uniqueResult();
        return result;
	}
	
	
	/**
	 * Get the latest annotation that is associated with any of the StepWork objects
	 * and has a fromWorkgroup that is in the workgroupIds list 
	 * @param stepWorks the list of StepWork objects whose annotations we want to search
	 * @param workgroupIds the list of workgroup ids that we will accept fromWorkgroup
	 * to be in the annotation
	 * @param type the annotation type. must not be null.
	 * @return the latest annotation associated with any of the StepWork objects and has
	 * a fromWorkgroup that is in the workgroupIds list
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly=true)
	public Annotation getLatestAnnotationByStepWork(List<StepWork> stepWorks, List<String> workgroupIds, String type) {
		//if either lists are empty we will return null
		if(stepWorks.size() == 0 || workgroupIds.size() == 0) {
			return null;
		}
		
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();

        /*
         * perform the query to obtain the annotations associated with the workgroup ids,
         * order the results from newest to oldest
         */
        List<Annotation> results = 
        	(List<Annotation>) session.createCriteria(Annotation.class)
        		.add(Restrictions.in("stepWork", stepWorks)).addOrder(Order.desc("postTime"))
        		.add(Restrictions.eq("type", type))
        		.list();

        Annotation annotation = null;

        //loop through all the annotations we found
        Iterator<Annotation> resultsIter = results.iterator();
        while(resultsIter.hasNext()) {
        	//get an annotation
        	Annotation tempAnnotation = resultsIter.next();
        	
        	//get the JSON data from the annotaiton
        	String annotationData = tempAnnotation.getData();
        	try {
        		//get the fromWorkgroup from the annotation JSON data
				JSONObject annotationJSONObj = new JSONObject(annotationData);
				String fromWorkgroup = annotationJSONObj.getString("fromWorkgroup");
				
				if(fromWorkgroup != null && workgroupIds.contains(fromWorkgroup)) {
					/*
					 * the fromWorkgroup matches one of the workgroups in the workgroupIds list
					 * so we are done searching
					 */
					annotation = tempAnnotation;
	        		break;
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
        }
        
        return annotation;
	}
	
	/**
	 * Get the latest annotation that is associated with any of the StepWork objects
	 * @param stepWorks the list of StepWork objects whose annotations we want to search
	 * to be in the annotation
	 * @param type the annotation type. must not be null.
	 * @return the latest annotation associated with any of the StepWork objects
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly=true)
	public Annotation getLatestAnnotationByStepWork(List<StepWork> stepWorks, String type) {
		if(stepWorks.size() == 0) {
			return null;
		}
		
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();

        /*
         * perform the query to obtain the annotations associated with the workgroup ids,
         * order the results from newest to oldest
         */
        List<Annotation> results = 
        	(List<Annotation>) session.createCriteria(Annotation.class)
        		.add(Restrictions.in("stepWork", stepWorks)).addOrder(Order.desc("postTime"))
        		.add(Restrictions.eq("type", type))
        		.list();

        Annotation annotation = null;
        
        if(results.size() > 0) {
        	//get the newest annotation
        	annotation = results.get(0);
        }
        
        return annotation;
	}
	
	/**
	 * Get the latest cRater score annotation that is associated with any of the StepWork objects
	 * @param stepWorks the list of StepWork objects whose annotations we want to search
	 * to be in the annotation
	 * @return the latest cRater score annotation associated with any of the StepWork objects and has
	 * a fromWorkgroup that is in the workgroupIds list
	 */
	public Annotation getLatestCRaterScoreByStepWork(List<StepWork> stepWorks) {
		return (Annotation) getLatestAnnotationByStepWork(stepWorks, "crater");
	}
	
	/**
	 * Get the latest score annotation that is associated with any of the StepWork objects
	 * and has a fromWorkgroup that is in the workgroupIds list 
	 * @param stepWorks the list of StepWork objects whose annotations we want to search
	 * @param workgroupIds the list of workgroup ids that we will accept fromWorkgroup
	 * to be in the annotation
	 * @return the latest score annotation associated with any of the StepWork objects and has
	 * a fromWorkgroup that is in the workgroupIds list
	 */
	public Annotation getLatestAnnotationScoreByStepWork(List<StepWork> stepWorks, List<String> workgroupIds) {
		return (Annotation) getLatestAnnotationByStepWork(stepWorks, workgroupIds, "score");
	}
	
	/**
	 * Get the latest comment annotation that is associated with any of the StepWork objects
	 * and has a fromWorkgroup that is in the workgroupIds list 
	 * @param stepWorks the list of StepWork objects whose annotations we want to search
	 * @param workgroupIds the list of workgroup ids that we will accept fromWorkgroup
	 * to be in the annotation
	 * @return the latest comment annotation associated with any of the StepWork objects and has
	 * a fromWorkgroup that is in the workgroupIds list
	 */
	public Annotation getLatestAnnotationCommentByStepWork(List<StepWork> stepWorks, List<String> workgroupIds) {
		return (Annotation) getLatestAnnotationByStepWork(stepWorks, workgroupIds, "comment");
	}
	
	/**
	 * Returns a list of Annotation based on the request parameters
	 * @param map
	 * @return
	 */
	@SuppressWarnings("unchecked")	
	public Annotation getCRaterAnnotationByStepWork(StepWork stepWork) {
		return getAnnotationByStepWorkAndAnnotationType(stepWork,"cRater");
	}
	
	/**
	 * Given a list of StepWork, returns all annotation flags that were made on
	 * them. If the stepWorkList is empty, return an empty AnnotationList.
	 * @param stepWorkList
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly=true)
	public List<Annotation> getAnnotationByStepWorkList(List<StepWork> stepWorkList) {
		List<Annotation> result = new ArrayList<Annotation>();
		if (!stepWorkList.isEmpty()) {
			Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();

			result = 
				session.createCriteria(Annotation.class).add( Restrictions.in("stepWork", stepWorkList)).list();
		}
		return result;
	}

	/**
	 * Get the annotations that are not associated with any student work and 
	 * are for the specific annotation types
	 * @param fromUsers the user(s) who created the annotation
	 * @param toUser the user receiving the annotation
	 * @param annotationTypes the annotation types to obtain
	 * @see org.wise.portal.dao.annotation.AnnotationDao#getAnnotationByFromWorkgroupsToWorkgroupWithoutWork(java.util.List, org.wise.vle.domain.user.UserInfo, java.util.List)
	 */
	@Transactional(readOnly=true)
	public List<Annotation> getAnnotationByFromWorkgroupsToWorkgroupWithoutWork(List<UserInfo> fromUsers, UserInfo toUser, List<String> annotationTypes) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();

        List<Annotation> results = 
        	(List<Annotation>) session.createCriteria(Annotation.class)
        		.add( Restrictions.in("fromUser", fromUsers))
        		.add( Restrictions.eq("toUser", toUser))
        		.add( Restrictions.in("type", annotationTypes))
        		.list();
        return results;
	}
	
	@Transactional(readOnly=true)
	public List<Annotation> getAnnotationList() {
        Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        List<Annotation> result = session.createCriteria(Annotation.class).list();
        return result;
	}
}
