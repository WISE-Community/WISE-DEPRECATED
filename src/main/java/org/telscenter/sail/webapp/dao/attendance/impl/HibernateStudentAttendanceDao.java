package org.telscenter.sail.webapp.dao.attendance.impl;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.telscenter.sail.webapp.dao.attendance.StudentAttendanceDao;
import org.telscenter.sail.webapp.domain.attendance.StudentAttendance;

import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;

public class HibernateStudentAttendanceDao extends AbstractHibernateDao<StudentAttendance> implements StudentAttendanceDao<StudentAttendance> {

	/**
	 * Get all the student attendance entries for a run id
	 * @see org.telscenter.sail.webapp.dao.attendance.StudentAttendanceDao#getStudentAttendanceByRunId(java.lang.Long)
	 */
	public List<StudentAttendance> getStudentAttendanceByRunId(Long runId) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		session.beginTransaction();
		
		/*
		 * get all the student attendance rows for the given run id and
		 * order the results by the loginTimestamp with the newer entries
		 * at the beginning and older entries at the end of the list 
		 */
		List<StudentAttendance> results = (List<StudentAttendance>) session.createCriteria(StudentAttendance.class).
			add(Restrictions.eq("runId", runId)).addOrder(Order.desc("loginTimestamp")).list();
		
		session.getTransaction().commit();
		
		return results;
	}
	

	@SuppressWarnings("unchecked")
	@Override
	public List<StudentAttendance> getStudentAttendanceByRunIdAndPeriod(
			Long runId, int lookBackNumDays) {
		
			return this.getHibernateTemplate().find("select attendance from StudentAttendanceImpl attendance where"
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
