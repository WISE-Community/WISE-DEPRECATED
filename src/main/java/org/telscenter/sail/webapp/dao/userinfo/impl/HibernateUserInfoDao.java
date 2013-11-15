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
package org.telscenter.sail.webapp.dao.userinfo.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;
import net.sf.sail.webapp.domain.Workgroup;

import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.telscenter.sail.webapp.dao.userinfo.UserInfoDao;
import org.telscenter.sail.webapp.domain.attendance.StudentAttendance;
import org.telscenter.sail.webapp.domain.project.Project;

import vle.domain.user.UserInfo;
import vle.hibernate.HibernateUtil;

/**
 * @author h
 * @version $Id:$
 */
public class HibernateUserInfoDao extends AbstractHibernateDao<UserInfo> implements UserInfoDao<UserInfo>{

	@Override
	protected String getFindAllQuery() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	protected Class<? extends UserInfo> getDataObjectClass() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public UserInfo getByWorkgroupId(Long workgroupId) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		session.beginTransaction();
		UserInfo userInfo = (UserInfo) session.createCriteria(UserInfo.class).add(Restrictions.eq("workgroupId", workgroupId)).uniqueResult();
		session.getTransaction().commit();
		return userInfo;
	}

}
