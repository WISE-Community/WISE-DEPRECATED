/**
 * Copyright (c) 2007 Regents of the University of California (Regents). Created
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
package org.telscenter.sail.webapp.dao.workgroup.impl;

import java.util.List;

import org.hibernate.Hibernate;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.telscenter.sail.webapp.domain.workgroup.WISEWorkgroup;
import org.telscenter.sail.webapp.domain.workgroup.impl.WISEWorkgroupImpl;

import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;
import net.sf.sail.webapp.dao.workgroup.WorkgroupDao;
import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.impl.WorkgroupImpl;

/**
 * DAO for <code>WISEWorkgroup</code>
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public class HibernateWISEWorkgroupDao extends AbstractHibernateDao<WISEWorkgroup> 
        implements WorkgroupDao<WISEWorkgroup>{

    private static final String FIND_ALL_QUERY = "from WISEWorkgroupImpl";

    /**
     * @see net.sf.sail.webapp.dao.impl.AbstractHibernateDao#getFindAllQuery()
     */
    @Override
    protected String getFindAllQuery() {
        return FIND_ALL_QUERY;
    }
    
    /**
     * @see net.sf.sail.webapp.dao.workgroup.WorkgroupDao#getListByOfferingAndUser(net.sf.sail.webapp.domain.Offering,
     *      net.sf.sail.webapp.domain.User)
     */
    @SuppressWarnings("unchecked")
    public List<WISEWorkgroup> getListByOfferingAndUser(Offering offering, User user) {
        Session session = this.getSession();
        SQLQuery sqlQuery = session
        .createSQLQuery("SELECT w.*, g.*, ww.* FROM workgroups as w, groups as g, "
        		+ "groups_related_to_users as g_r_u, wiseworkgroups as ww "
                + "WHERE w.group_fk = g.id "
                + "AND g_r_u.group_fk = w.group_fk "
                + "AND g_r_u.user_fk = :user_param "
                + "AND w.offering_fk = :offering_param "
                + "AND w.id = ww.id");

        sqlQuery.addEntity("wiseworkgroup", WISEWorkgroupImpl.class);
        sqlQuery.setParameter("offering_param", offering.getId(),
                Hibernate.LONG);
        sqlQuery.setParameter("user_param", user.getId(), Hibernate.LONG);
        return sqlQuery.list();
    }

    /**
     * @see net.sf.sail.webapp.dao.workgroup.WorkgroupDao#getListByUser(net.sf.sail.webapp.domain.User)
     */
    @SuppressWarnings("unchecked")
    public List<WISEWorkgroup> getListByUser(User user) {
        Session session = this.getSession();
        SQLQuery sqlQuery = session
                .createSQLQuery("SELECT w.*, g.*, ww.* FROM workgroups as w, groups as g, "
                		+ "groups_related_to_users as g_r_u, wiseworkgroups as ww  "
                        + "WHERE w.group_fk = g.id "
                        + "AND g_r_u.group_fk = w.group_fk "
                        + "AND g_r_u.user_fk = :user_param "
                        + "AND w.id = ww.id");
        sqlQuery.addEntity("wiseworkgroup", WISEWorkgroupImpl.class);
        sqlQuery.setParameter("user_param", user.getId(), Hibernate.LONG);
        return sqlQuery.list();
    }
    
    /**
     * @see net.sf.sail.webapp.dao.impl.AbstractHibernateDao#getDataObjectClass()
     */
    @Override
    protected Class<WISEWorkgroupImpl> getDataObjectClass() {
        return WISEWorkgroupImpl.class;
    }

}
