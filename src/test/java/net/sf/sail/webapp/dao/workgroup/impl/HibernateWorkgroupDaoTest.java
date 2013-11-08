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
package net.sf.sail.webapp.dao.workgroup.impl;

import java.util.List;
import java.util.Map;

import net.sf.sail.webapp.dao.AbstractTransactionalDaoTests;
import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.domain.authentication.impl.PersistentUserDetails;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.group.impl.PersistentGroup;
import net.sf.sail.webapp.domain.impl.OfferingImpl;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.domain.impl.WorkgroupImpl;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.sds.SdsJnlp;
import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.domain.sds.SdsUser;
import net.sf.sail.webapp.domain.sds.SdsWorkgroup;

import org.hibernate.Session;
import org.springframework.dao.DataIntegrityViolationException;

/**
 * Test for HibernateWorkgroupDao
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
public class HibernateWorkgroupDaoTest extends AbstractTransactionalDaoTests<HibernateWorkgroupDao, Workgroup> {

    private static final String USERNAME = "username";

    private static final String PASSWORD = "password";

    private static final Long SDS_ID = new Long(42);

    private static final SdsCurnit DEFAULT_SDS_CURNIT = new SdsCurnit();

    private static final SdsJnlp DEFAULT_SDS_JNLP = new SdsJnlp();

    private static final String DEFAULT_NAME = "the heros workgroup";

    private static final String GROUP_NAME = "the heros group";

    private static final String DEFAULT_URL = "http://woohoo";

    private SdsWorkgroup sdsWorkgroup;
    
    private Group group;

    private SdsOffering defaultSdsOffering;

    private Offering defaultOffering;

    /**
     * @param defaultSdsOffering
     *                the defaultSdsOffering to set
     */
    public void setDefaultSdsOffering(SdsOffering defaultSdsOffering) {
        this.defaultSdsOffering = defaultSdsOffering;
    }

    /**
     * @param defaultOffering
     *                the defaultOffering to set
     */
    public void setDefaultOffering(Offering defaultOffering) {
        this.defaultOffering = defaultOffering;
    }

    /**
     * @param sdsWorkgroup
     *                the sdsWorkgroup to set
     */
    public void setSdsWorkgroup(SdsWorkgroup sdsWorkgroup) {
        this.sdsWorkgroup = sdsWorkgroup;
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
        
        DEFAULT_SDS_CURNIT.setName(DEFAULT_NAME);
        DEFAULT_SDS_CURNIT.setUrl(DEFAULT_URL);
        DEFAULT_SDS_CURNIT.setSdsObjectId(SDS_ID);

        DEFAULT_SDS_JNLP.setName(DEFAULT_NAME);
        DEFAULT_SDS_JNLP.setUrl(DEFAULT_URL);
        DEFAULT_SDS_JNLP.setSdsObjectId(SDS_ID);

        this.defaultSdsOffering.setName(DEFAULT_NAME);
        this.defaultSdsOffering.setSdsObjectId(SDS_ID);

        this.sdsWorkgroup.setSdsObjectId(SDS_ID);
        this.sdsWorkgroup.setName(DEFAULT_NAME);
        this.dataObject.setSdsWorkgroup(this.sdsWorkgroup);
        
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
        session.save(DEFAULT_SDS_CURNIT); // save sds curnit
        session.save(DEFAULT_SDS_JNLP); // save sds jnlp
        this.defaultSdsOffering.setSdsCurnit(DEFAULT_SDS_CURNIT);
        this.defaultSdsOffering.setSdsJnlp(DEFAULT_SDS_JNLP);
        this.defaultOffering.setSdsOffering(this.defaultSdsOffering);
        session.save(this.defaultOffering); // save offering
        this.sdsWorkgroup.setSdsOffering(this.defaultSdsOffering);
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
        this.defaultSdsOffering = null;
        this.dataObject = null;
        this.sdsWorkgroup = null;
        this.dao = null;
    }

    public void testSave_NonExistentOffering() {
        SdsOffering nonExistentSdsOffering = (SdsOffering) this.applicationContext
                .getBean("sdsOffering");
        nonExistentSdsOffering.setSdsCurnit(DEFAULT_SDS_CURNIT);
        nonExistentSdsOffering.setSdsJnlp(DEFAULT_SDS_JNLP);
        nonExistentSdsOffering.setName(DEFAULT_NAME);
        nonExistentSdsOffering.setSdsObjectId(SDS_ID);

        Offering nonExistentOffering = (Offering) this.applicationContext
                .getBean("offering");
        nonExistentOffering.setSdsOffering(nonExistentSdsOffering);
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
        // saving the workgroup should cascade to the sds workgroup object
        this.dao.save(this.dataObject);
        List<?> actualList = retrieveWorkgroupListFromDb();
        assertEquals(1, actualList.size());
        for (int i = 0; i < actualList.size(); i++) {
            Map<?, ?> actualWorkgroupMap = (Map<?, ?>) actualList.get(i);
            // * NOTE* the keys in the map are all in UPPERCASE!
            String actualValue = (String) actualWorkgroupMap
                    .get(SdsWorkgroup.COLUMN_NAME_WORKGROUP_NAME.toUpperCase());
            assertEquals(DEFAULT_NAME, actualValue);
        }
        verifyDataStoreWorkgroupMembersListIsEmpty();
    }

    public void testSave_OneMember() {
        verifyDataStoreWorkgroupListIsEmpty();
        verifyDataStoreWorkgroupMembersListIsEmpty();

        Session currentSession = this.sessionFactory.getCurrentSession();
        User user = createNewUser(USERNAME, SDS_ID, currentSession);
        this.dataObject.addMember(user);
        // saving the workgroup should cascade to the sds workgroup object
        this.dao.save(this.dataObject);
        this.toilet.flush();

        List<?> actualList = retrieveWorkgroupListFromDb();
        assertEquals(1, actualList.size());
        for (int i = 0; i < actualList.size(); i++) {
            Map<?, ?> actualMap = (Map<?, ?>) actualList.get(i);
            // * NOTE* the keys in the map are all in UPPERCASE!
            String actualValue = (String) actualMap
                    .get(SdsWorkgroup.COLUMN_NAME_WORKGROUP_NAME.toUpperCase());
            assertEquals(DEFAULT_NAME, actualValue);
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
        User user = createNewUser(USERNAME, SDS_ID, currentSession);
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

    private User createNewUser(String username, Long sdsId, Session session) {
        User user = (User) this.applicationContext.getBean("user");
        SdsUser sdsUser = (SdsUser) this.applicationContext.getBean("sdsUser");
        sdsUser.setFirstName(DEFAULT_NAME);
        sdsUser.setLastName(DEFAULT_NAME);
        sdsUser.setSdsObjectId(sdsId);
        MutableUserDetails userDetails = (MutableUserDetails) this.applicationContext
                .getBean("mutableUserDetails");
        userDetails.setUsername(username);
        userDetails.setPassword(PASSWORD);
        user.setSdsUser(sdsUser);
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
     * SELECT * FROM workgroups, sds_workgroups, offerings WHERE
     * workgroups.sds_workgroup_fk = sds_workgroups.id AND
     * workgroups.offering_fk = offerings.id
     */
    private static final String RETRIEVE_WORKGROUP_LIST_SQL = "SELECT * FROM "
            + WorkgroupImpl.DATA_STORE_NAME + ", "
            + SdsWorkgroup.DATA_STORE_NAME + ", "
            + OfferingImpl.DATA_STORE_NAME + " WHERE "
            + WorkgroupImpl.DATA_STORE_NAME + "."
            + WorkgroupImpl.COLUMN_NAME_SDS_WORKGROUP_FK + " = "
            + SdsWorkgroup.DATA_STORE_NAME + ".id" + " AND "
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