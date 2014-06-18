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
package org.wise.portal.dao.workgroup.impl;

import java.util.List;
import java.util.Map;

import org.hibernate.Session;
import org.springframework.dao.DataIntegrityViolationException;
import org.wise.portal.dao.AbstractTransactionalDaoTests;
import org.wise.portal.dao.workgroup.impl.HibernateWorkgroupDao;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.PersistentUserDetails;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.run.Offering;
import org.wise.portal.domain.run.impl.OfferingImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;

/**
 * Test for HibernateWorkgroupDao
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
public class HibernateWorkgroupDaoTest extends AbstractTransactionalDaoTests<HibernateWorkgroupDao, Workgroup> {

    private static final String USERNAME = "username";

    private static final String PASSWORD = "password";

    private static final String DEFAULT_NAME = "the heros workgroup";

    private static final String GROUP_NAME = "the heros group";

    private static final String DEFAULT_URL = "http://woohoo";

    private Group group;

    private Offering defaultOffering;

    /**
     * @param defaultOffering
     *                the defaultOffering to set
     */
    public void setDefaultOffering(Offering defaultOffering) {
        this.defaultOffering = defaultOffering;
    }

    /**
	 * @param group the group to set
	 */
	public void setGroup(Group group) {
		this.group = group;
	}

	/**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpBeforeTransaction()
     */
    @Override
    protected void onSetUpBeforeTransaction() throws Exception {
        super.onSetUpBeforeTransaction();
        this.dao = ((HibernateWorkgroupDao) this.applicationContext
                .getBean("workgroupDao"));
        this.dataObject = ((WorkgroupImpl) this.applicationContext
                .getBean("workgroup"));
        
        this.group.setName(GROUP_NAME);
        this.dataObject.setGroup(this.group);

    }

    /**
     * @see org.springframework.test.AbstractTransactionalSpringContextTests#onSetUpInTransaction()
     */
    @Override
    protected void onSetUpInTransaction() throws Exception {
        super.onSetUpInTransaction();
        // an offering needs to exist already before a workgroup can be created
        Session session = this.sessionFactory.getCurrentSession();
        session.save(this.defaultOffering); // save offering
        this.dataObject.setOffering(this.defaultOffering);
        session.save(this.group);
        this.dataObject.setGroup(group);
    }

    /**
     * @see org.springframework.test.AbstractTransactionalSpringContextTests#onTearDownAfterTransaction()
     */
    @Override
    protected void onTearDownAfterTransaction() throws Exception {
        super.onTearDownAfterTransaction();
        this.defaultOffering = null;
        this.dataObject = null;
        this.dao = null;
    }

    public void testSave_NonExistentOffering() {
        Offering nonExistentOffering = (Offering) this.applicationContext
                .getBean("offering");
        this.dataObject.setOffering(nonExistentOffering);
        try {
            this.dao.save(this.dataObject);
            fail("DataIntegrityViolationException expected");
        } catch (DataIntegrityViolationException expected) {
        }
    }

	@Override
    public void testSave() {
        verifyDataStoreWorkgroupListIsEmpty();
        this.dao.save(this.dataObject);
        List<?> actualList = retrieveWorkgroupListFromDb();
        assertEquals(1, actualList.size());
        for (int i = 0; i < actualList.size(); i++) {
            Map<?, ?> actualWorkgroupMap = (Map<?, ?>) actualList.get(i);
            // * NOTE* the keys in the map are all in UPPERCASE!
        }
        verifyDataStoreWorkgroupMembersListIsEmpty();
    }

    public void testSave_OneMember() {
        verifyDataStoreWorkgroupListIsEmpty();
        verifyDataStoreWorkgroupMembersListIsEmpty();

        Session currentSession = this.sessionFactory.getCurrentSession();
        User user = createNewUser(USERNAME, currentSession);
        this.dataObject.addMember(user);
        this.dao.save(this.dataObject);
        this.toilet.flush();

        List<?> actualList = retrieveWorkgroupListFromDb();
        assertEquals(1, actualList.size());
        for (int i = 0; i < actualList.size(); i++) {
            Map<?, ?> actualMap = (Map<?, ?>) actualList.get(i);
            // * NOTE* the keys in the map are all in UPPERCASE!
        }

        actualList = retrieveWorkgroupMembersListFromDb();
        assertEquals(1, actualList.size());
        for (int i = 0; i < actualList.size(); i++) {
            Map<?, ?> actualMap = (Map<?, ?>) actualList.get(i);
            // * NOTE* the keys in the map are all in UPPERCASE!
            String actualValue = (String) actualMap
                    .get(PersistentUserDetails.COLUMN_NAME_USERNAME
                            .toUpperCase());
            assertEquals(USERNAME, actualValue);
        }
    }

    public void testDelete_OneMember() {
        verifyDataStoreWorkgroupListIsEmpty();
        verifyDataStoreWorkgroupMembersListIsEmpty();

        Session currentSession = this.sessionFactory.getCurrentSession();
        User user = createNewUser(USERNAME, currentSession);
        this.dataObject.addMember(user);
        this.dao.save(this.dataObject);
        this.toilet.flush();
        List<?> actualList = retrieveWorkgroupListFromDb();
        assertEquals(1, actualList.size());
        actualList = retrieveWorkgroupMembersListFromDb();
        assertEquals(1, actualList.size());

        this.dao.delete(this.dataObject);
        this.toilet.flush();
        verifyDataStoreWorkgroupListIsEmpty();
        verifyDataStoreWorkgroupMembersListIsEmpty();
    }

    private User createNewUser(String username, Session session) {
        User user = (User) this.applicationContext.getBean("user");
        MutableUserDetails userDetails = (MutableUserDetails) this.applicationContext
                .getBean("mutableUserDetails");
        userDetails.setUsername(username);
        userDetails.setPassword(PASSWORD);
        user.setUserDetails(userDetails);
        session.save(user);
        return user;
    }
    
    private void verifyDataStoreWorkgroupMembersListIsEmpty() {
        assertTrue(retrieveWorkgroupMembersListFromDb().isEmpty());
    }

    /*
     * SELECT * FROM workgroups, groups, groups_related_to_users, users, user_details
     * WHERE workgroups.group_fk = groups.id AND
     * groups_related_to_users.group_fk = groups.id AND
     * groups_related_to_users.user_fk = users.id AND users.user_details_fk =
     * user_details.id
     */
    private static final String RETRIEVE_WORKGROUP_MEMBERS_SQL = "SELECT * FROM "
            + WorkgroupImpl.DATA_STORE_NAME
            + ", "
            + PersistentGroup.DATA_STORE_NAME
            + ", "
            + PersistentGroup.USERS_JOIN_TABLE_NAME
            + ", "
            + UserImpl.DATA_STORE_NAME
            + ","
            + PersistentUserDetails.DATA_STORE_NAME
            + " WHERE "
            + WorkgroupImpl.DATA_STORE_NAME
            + ".group_fk = "
            + PersistentGroup.DATA_STORE_NAME
            + ".id AND "
            + PersistentGroup.USERS_JOIN_TABLE_NAME
            + ".group_fk = "
            + PersistentGroup.DATA_STORE_NAME
            + ".id AND "
            + PersistentGroup.USERS_JOIN_TABLE_NAME
            + ".user_fk = "
            + UserImpl.DATA_STORE_NAME
            + ".id AND "
            + UserImpl.DATA_STORE_NAME
            + "."
            + UserImpl.COLUMN_NAME_USER_DETAILS_FK
            + " = "
            + PersistentUserDetails.DATA_STORE_NAME + ".id";

    private List<?> retrieveWorkgroupMembersListFromDb() {
        return this.jdbcTemplate.queryForList(RETRIEVE_WORKGROUP_MEMBERS_SQL,
                (Object[]) null);
    }

    private void verifyDataStoreWorkgroupListIsEmpty() {
        assertTrue(retrieveWorkgroupListFromDb().isEmpty());
    }

    /*
     * SELECT * FROM workgroups, offerings WHERE
     * workgroups.offering_fk = offerings.id
     */
    private static final String RETRIEVE_WORKGROUP_LIST_SQL = "SELECT * FROM "
            + WorkgroupImpl.DATA_STORE_NAME + ", "
            + OfferingImpl.DATA_STORE_NAME + " WHERE "
            + WorkgroupImpl.DATA_STORE_NAME + "."
            + WorkgroupImpl.COLUMN_NAME_OFFERING_FK + " = "
            + OfferingImpl.DATA_STORE_NAME + ".id";

    private List<?> retrieveWorkgroupListFromDb() {
        return this.jdbcTemplate.queryForList(RETRIEVE_WORKGROUP_LIST_SQL,
                (Object[]) null);
    }

	@Override
	protected List<?> retrieveDataObjectListFromDb() {
        return this.jdbcTemplate.queryForList("SELECT * FROM "
                + WorkgroupImpl.DATA_STORE_NAME, (Object[]) null);
	}
}