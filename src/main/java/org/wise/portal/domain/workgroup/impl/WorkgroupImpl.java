/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.domain.workgroup.impl;

import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;

/**
 * @author Hiroki Terashima
 */
@Entity
@Table(name = WorkgroupImpl.DATA_STORE_NAME)
public class WorkgroupImpl implements Workgroup, Comparable<WorkgroupImpl> {

    @Transient
    public static final String DATA_STORE_NAME = "workgroups";

    @Transient
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
	public Long id = null;

    @Version
    @Column(name = "OPTLOCK")
    private Integer version = null;

    @OneToOne(targetEntity = RunImpl.class, fetch = FetchType.LAZY)
    @JoinColumn(name = "run_fk", nullable = false)
    private Run run;

    @OneToOne(targetEntity = PersistentGroup.class, fetch = FetchType.LAZY)
    @JoinColumn(name = "group_fk", nullable = false)
    private Group group = new PersistentGroup();

    @OneToOne(targetEntity = PersistentGroup.class, fetch = FetchType.LAZY)
    @JoinColumn(name = "period")
    private Group period;

    @Column(name = "isTeacherWorkgroup")
    private boolean teacherWorkgroup;

    /**
     * @see Workgroup#getMembers()
     */
    public Set<User> getMembers() {
        return this.group.getMembers();
    }

    /**
     * @see Workgroup#addMember(User)
     */
    public void addMember(User member) {
        this.group.addMember(member);
        this.group.setName(this.generateWorkgroupName());
    }
    
    /**
     * @see Workgroup#removeMember(User)
     */
    public void removeMember(User member) {
    	this.group.getMembers().remove(member);
    }

    /**
     * @see Workgroup#setMembers(java.util.Set)
     */
    public void setMembers(Set<User> members) {
        this.group.setMembers(members);
    }
    
	/**
	 * @return the group
	 */
	public Group getGroup() {
		return group;
	}

	/**
	 * @param group the group to set
	 */
	public void setGroup(Group group) {
		this.group = group;
	}

    /**
     * @see Workgroup#getRun()
     */
    public Run getRun() {
        return run;
    }

    /**
     * @see Workgroup#setRun(Run)
     */
    public void setRun(Run run) {
        this.run = run;
    }

    /**
     * @return the id
     */
    public Long getId() {
        return id;
    }

    /**
     * @param id the id to set
     */
    @SuppressWarnings("unused")
    private void setId(Long id) {
        this.id = id;
    }

    /**
     * @see Workgroup#getPeriod()
     */
    public Group getPeriod() {
        return period;
    }

    /**
     * @see Workgroup#setPeriod(Group)
     */
    public void setPeriod(Group period) {
        this.period = period;
    }

    public int compareTo(WorkgroupImpl o) {
        return this.id.compareTo(o.id);
    }

    /**
     * @return the teacherWorkgroup
     */
    public boolean isTeacherWorkgroup() {
        return teacherWorkgroup;
    }

    /**
     * @param teacherWorkgroup the teacherWorkgroup to set
     */
    public void setTeacherWorkgroup(boolean teacherWorkgroup) {
        this.teacherWorkgroup = teacherWorkgroup;
    }

    /**
     * @see Workgroup#generateWorkgroupName()
     */
	public String generateWorkgroupName() {
		String workgroupName = "";
		for (User member : group.getMembers()) {
			workgroupName += " " + member.getUserDetails().getUsername();
		}
		return workgroupName;
	}

	/**
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((group == null) ? 0 : group.hashCode());
		result = prime * result
				+ ((run == null) ? 0 : run.hashCode());
		return result;
	}

	/**
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		final WorkgroupImpl other = (WorkgroupImpl) obj;
		if (group == null) {
			if (other.group != null)
				return false;
		} else if (!group.equals(other.group))
			return false;
		if (run == null) {
			if (other.run != null)
				return false;
		} else if (!run.equals(other.run))
			return false;
		return true;
	}

}