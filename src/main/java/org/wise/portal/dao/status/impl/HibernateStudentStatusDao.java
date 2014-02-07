package org.wise.portal.dao.status.impl;

import java.util.List;

import org.hibernate.NonUniqueResultException;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.status.StudentStatusDao;
import org.wise.vle.domain.status.StudentStatus;


public class HibernateStudentStatusDao extends AbstractHibernateDao<StudentStatus> implements StudentStatusDao<StudentStatus> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends StudentStatus> getDataObjectClass() {
		return null;
	}

	public StudentStatus getStudentStatusById(Long id) {
		StudentStatus studentStatus = null;
		
		try {
			studentStatus = getById(id);
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
		
		return studentStatus;
	}
	
	@Transactional
	public void saveStudentStatus(StudentStatus studentStatus) {
		save(studentStatus);
	}
	
	/**
	 * Get a StudentStatus object given the workgroup id
	 * @param workgroupId the workgroup id
	 * @return the StudentStatus with the given workgroup id or null if none is found
	 */
	@Transactional
	public StudentStatus getStudentStatusByWorkgroupId(Long workgroupId) {
		StudentStatus result = null;
		
		try {
			Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
			session.beginTransaction();
			
			/*
			 * get all the student status rows with the given workgroup id.
			 * there should only be one but somehow there are a couple of
			 * workgroups that have multiple rows, perhaps because the 
			 * transactions were not synchronized.
			 */
			List<StudentStatus> list = session.createCriteria(StudentStatus.class).add(Restrictions.eq("workgroupId", workgroupId)).list();
			
			if(list != null && list.size() > 0) {
				//get the first element in the list if the list contains more than one element
				result = list.get(0);
			}
			
			session.getTransaction().commit();
		} catch (NonUniqueResultException e) {
			throw e;
		}
		
		return result;
	}
	
	/**
	 * Get all the StudentStatus objects for a given period id
	 * @param periodId the period id
	 * @return a list of StudentStatus objects
	 */
	public List<StudentStatus> getStudentStatusesByPeriodId(Long periodId) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        session.beginTransaction();
        
        List<StudentStatus> studentStatuses = session.createCriteria(StudentStatus.class).add(Restrictions.eq("periodId", periodId)).list();
        
        session.getTransaction().commit();
        
        return studentStatuses;
	}
	
	/**
	 * Get all the StudentStatus objects for a given run id
	 * @param runId the run id
	 * @return a list of StudentStatus objects
	 */
	public List<StudentStatus> getStudentStatusesByRunId(Long runId) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        session.beginTransaction();
        
        List<StudentStatus> studentStatuses = session.createCriteria(StudentStatus.class).add(Restrictions.eq("runId", runId)).list();
        
        session.getTransaction().commit();
        
        return studentStatuses;
	}
}
