/**
 * 
 */
package org.telscenter.sail.webapp.domain.teacher.management;

import java.util.Set;

import org.telscenter.sail.webapp.domain.Run;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.group.Group;

/**
 * This domain object will contain information needed for the
 * teacher's viewmystudents page
 * 
 * @author Hiroki Terashima
 */
public class ViewMyStudentsPeriod implements Comparable<ViewMyStudentsPeriod> {
	
	private Run run;
	
	private Group period;
	
	private Set<User> grouplessStudents;
	
	private Set<Workgroup> workgroups;

	/**
	 * @return the run
	 */
	public Run getRun() {
		return run;
	}

	/**
	 * @param run the run to set
	 */
	public void setRun(Run run) {
		this.run = run;
	}

	/**
	 * @return the period
	 */
	public Group getPeriod() {
		return period;
	}

	/**
	 * @param period the period to set
	 */
	public void setPeriod(Group period) {
		this.period = period;
	}

	/**
	 * @return the grouplessStudents
	 */
	public Set<User> getGrouplessStudents() {
		return grouplessStudents;
	}

	/**
	 * @param grouplessStudents the grouplessStudents to set
	 */
	public void setGrouplessStudents(Set<User> grouplessStudents) {
		this.grouplessStudents = grouplessStudents;
	}

	/**
	 * @return the workgroups
	 */
	public Set<Workgroup> getWorkgroups() {
		return workgroups;
	}

	/**
	 * @param workgroups the workgroups to set
	 */
	public void setWorkgroups(Set<Workgroup> workgroups) {
		this.workgroups = workgroups;
	}

	/**
	 * Natural order is based on periodname
	 */
	public int compareTo(ViewMyStudentsPeriod o) {
		return this.period.compareTo(o.period);
	}
}
