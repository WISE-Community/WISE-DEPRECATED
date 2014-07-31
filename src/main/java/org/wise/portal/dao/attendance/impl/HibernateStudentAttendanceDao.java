package org.wise.portal.dao.attendance.impl;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.attendance.StudentAttendanceDao;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.domain.attendance.StudentAttendance;

@Repository
public class HibernateStudentAttendanceDao extends AbstractHibernateDao<StudentAttendance> implements StudentAttendanceDao<StudentAttendance> {

	/**
	 * Get all the student attendance entries for a run id
	 * @see org.wise.portal.dao.attendance.StudentAttendanceDao#getStudentAttendanceByRunId(java.lang.Long)
	 */
	@Transactional(readOnly=true)
	public List<StudentAttendance> getStudentAttendanceByRunId(Long runId) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		
		/*
		 * get all the student attendance rows for the given run id and
		 * order the results by the loginTimestamp with the newer entries
		 * at the beginning and older entries at the end of the list 
		 */
		List<StudentAttendance> results = (List<StudentAttendance>) session.createCriteria(StudentAttendance.class).
			add(Restrictions.eq("runId", runId)).addOrder(Order.desc("loginTimestamp")).list();
		
		return results;
	}
	

	@SuppressWarnings("unchecked")
	@Override
	@Transactional(readOnly=true)
	public List<StudentAttendance> getStudentAttendanceByRunIdAndPeriod(
			Long runId, int lookBackNumDays) {
		
			return (List<StudentAttendance>) this.getHibernateTemplate().find("select attendance from StudentAttendanceImpl attendance where"
					+ " datediff(curdate(), attendance.loginTimestamp) <=" + lookBackNumDays
					+ " and attendance.runId = " + runId);
	}
	
	@Override
	protected Class<? extends StudentAttendance> getDataObjectClass() {
		return null;
	}

	@Override
	protected String getFindAllQuery() {
		return null;
	}


}
