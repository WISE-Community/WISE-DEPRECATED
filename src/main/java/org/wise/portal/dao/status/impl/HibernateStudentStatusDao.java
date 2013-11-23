package org.wise.portal.dao.status.impl;

import java.util.List;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;

import org.hibernate.NonUniqueResultException;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.springframework.transaction.annotation.Transactional;
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
	public StudentStatus getStudentStatusByWorkgroupId(Long workgroupId) {
		StudentStatus result = null;
		
		try {
			Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
			session.beginTransaction();
			
			result = (StudentStatus) session.createCriteria(StudentStatus.class).add( Restrictions.eq("workgroupId", workgroupId)).uniqueResult();
			
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
