/**
 * Copyright (c) 2006 Encore Research Group, University of Toronto
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package net.sf.sail.webapp.dao.authentication.impl;

import java.util.Collection;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import net.sf.sail.webapp.dao.AbstractTransactionalDaoTests;
import net.sf.sail.webapp.domain.authentication.MutableGrantedAuthority;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.domain.authentication.impl.PersistentGrantedAuthority;
import net.sf.sail.webapp.domain.authentication.impl.PersistentUserDetails;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.GrantedAuthority;

/**
 * @author Cynick Young
 * @author Laurel Williams
 * 
 * @version $Id: HibernateUserDetailsDaoTest.java 257 2007-03-30 14:59:02Z
 *          cynick $
 * 
 */
public class HibernateUserDetailsDaoTest extends AbstractTransactionalDaoTests<HibernateUserDetailsDao, MutableUserDetails> {

    private static final String DEFAULT_ROLE_1 = "default_role_1";

    private static final String DEFAULT_ROLE_2 = "default_role_2";

    private static final String DEFAULT_ROLE_3 = "default_role_3";

    private static final String DEFAULT_USERNAME = "me";

    private static final String DEFAULT_PASSWORD = "my secret";

    private static final String DEFAULT_EMAIL = "billy@bob.com";

    private static final String USERNAME_NOT_IN_DB = "blah";

    private MutableGrantedAuthority role1;

    private MutableGrantedAuthority role2;

    private MutableGrantedAuthority role3;

    private HibernateGrantedAuthorityDao authorityDao;

    /**
     * @param authorityDao
     *                the authorityDao to set
     */
    public void setAuthorityDao(HibernateGrantedAuthorityDao authorityDao) {
        this.authorityDao = authorityDao;
    }

    /**
     * @param role3
     *                the role3 to set
     */
    public void setRole3(MutableGrantedAuthority role3) {
        this.role3 = role3;
    }

    /**
     * @param role1
     *                the role1 to set
     */
    public void setRole1(MutableGrantedAuthority role1) {
        this.role1 = role1;
    }

    /**
     * @param role2
     *                the role2 to set
     */
    public void setRole2(MutableGrantedAuthority role2) {
        this.role2 = role2;
    }

    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpBeforeTransaction()
     */
    @Override
    protected void onSetUpBeforeTransaction() throws Exception {
        super.onSetUpBeforeTransaction();
        this.dao = ((HibernateUserDetailsDao) this.applicationContext
                .getBean("userDetailsDao"));
        this.dataObject = ((MutableUserDetails) this.applicationContext
                .getBean("mutableUserDetails"));
        this.role1.setAuthority(DEFAULT_ROLE_1);
        this.role2.setAuthority(DEFAULT_ROLE_2);
        this.role3.setAuthority(DEFAULT_ROLE_3);

        this.dataObject.setUsername(DEFAULT_USERNAME);
        this.dataObject.setPassword(DEFAULT_PASSWORD);
        this.dataObject.setEmailAddress(DEFAULT_EMAIL);
        this.dataObject.setAuthorities(new GrantedAuthority[] {
                this.role1, this.role2, this.role3 });
    }

    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpInTransaction()
     */
    @Override
    protected void onSetUpInTransaction() throws Exception {
        super.onSetUpInTransaction();
        this.authorityDao.save(this.role1);
        this.authorityDao.save(this.role2);
        this.authorityDao.save(this.role3);
    }

    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onTearDownAfterTransaction()
     */
    @Override
    protected void onTearDownAfterTransaction() throws Exception {
        super.onTearDownAfterTransaction();
        this.role1 = null;
        this.role2 = null;
        this.role3 = null;
        this.authorityDao = null;
    }

    public void testSave() {
        verifyUserandJoinTablesAreEmpty();

        this.dao.save(this.dataObject);
        // flush is required to cascade the join table for some reason
        this.toilet.flush();

        // verify data store contains saved data using direct jdbc retrieval
        // (not dao)
        assertEquals(1, retrieveDataObjectListFromDb().size());
        assertEquals(3, retrieveUsersRolesTableFromDb().size());
        List<?> actualList = retrieveUserDetailsListFromDb();
        assertEquals(3, actualList.size());

        List<String> defaultRolesList = new LinkedList<String>();
        defaultRolesList.add(DEFAULT_ROLE_1);
        defaultRolesList.add(DEFAULT_ROLE_2);
        defaultRolesList.add(DEFAULT_ROLE_3);

        for (int i = 0; i < actualList.size(); i++) {
            Map<?, ?> actualUserDetailsMap = (Map<?, ?>) actualList.get(i);
            // * NOTE* the keys in the map are all in UPPERCASE!
            String actualValue = (String) actualUserDetailsMap
                    .get(PersistentUserDetails.COLUMN_NAME_USERNAME
                            .toUpperCase());
            assertEquals(DEFAULT_USERNAME, actualValue);
            actualValue = (String) actualUserDetailsMap
                    .get(PersistentUserDetails.COLUMN_NAME_PASSWORD
                            .toUpperCase());
            assertEquals(DEFAULT_PASSWORD, actualValue);
            actualValue = (String) actualUserDetailsMap
                    .get(PersistentUserDetails.COLUMN_NAME_EMAIL_ADDRESS
                            .toUpperCase());
            assertEquals(DEFAULT_EMAIL, actualValue);
            actualValue = (String) actualUserDetailsMap
                    .get(PersistentGrantedAuthority.COLUMN_NAME_ROLE
                            .toUpperCase());
            assertTrue(defaultRolesList.contains(actualValue));
            defaultRolesList.remove(actualValue);
        }

        MutableUserDetails duplicateUserDetails = (MutableUserDetails) this.applicationContext
                .getBean("mutableUserDetails");
        duplicateUserDetails.setUsername(DEFAULT_USERNAME);
        duplicateUserDetails.setPassword(DEFAULT_PASSWORD);
        try {
            this.dao.save(duplicateUserDetails);
            fail("DataIntegrityViolationException expected");
        } catch (DataIntegrityViolationException expected) {
        }

        MutableUserDetails emptyUserDetails = (MutableUserDetails) this.applicationContext
                .getBean("mutableUserDetails");
        try {
            this.dao.save(emptyUserDetails);
            fail("expected DataIntegrityViolationException");
        } catch (DataIntegrityViolationException expected) {
        }

        MutableUserDetails partiallyEmptyUserDetails = (MutableUserDetails) this.applicationContext
                .getBean("mutableUserDetails");
        partiallyEmptyUserDetails.setUsername(DEFAULT_USERNAME);
        try {
            this.dao.save(partiallyEmptyUserDetails);
            fail("expected DataIntegrityViolationException");
        } catch (DataIntegrityViolationException expected) {
        }

        partiallyEmptyUserDetails = (MutableUserDetails) this.applicationContext
                .getBean("mutableUserDetails");
        partiallyEmptyUserDetails.setPassword(DEFAULT_PASSWORD);
        try {
            this.dao.save(partiallyEmptyUserDetails);
            fail("expected DataIntegrityViolationException");
        } catch (DataIntegrityViolationException expected) {
        }
    }

    public void testRetrieveByUsername() {
        this.verifyUserandJoinTablesAreEmpty();

        this.dao.save(this.dataObject);
        // flush is required to cascade the join table for some reason
        this.toilet.flush();

        // get user details record from persistent store and confirm it is
        // complete
        MutableUserDetails userDetails = this.dao
                .retrieveByName(DEFAULT_USERNAME);
        assertTrue(userDetails instanceof PersistentUserDetails);
        assertTrue(PersistentUserDetails.class == userDetails.getClass());

        assertEquals(DEFAULT_USERNAME, userDetails.getUsername());
        assertEquals(DEFAULT_PASSWORD, userDetails.getPassword());
        assertEquals(DEFAULT_EMAIL, userDetails.getEmailAddress());

        List<String> defaultRolesList = new LinkedList<String>();
        defaultRolesList.add(DEFAULT_ROLE_1);
        defaultRolesList.add(DEFAULT_ROLE_2);
        defaultRolesList.add(DEFAULT_ROLE_3);

        Collection<? extends GrantedAuthority> grantedAuthorities = userDetails.getAuthorities();
        for (GrantedAuthority grantedAuthority : grantedAuthorities) {
            String role = grantedAuthority.getAuthority();
            assertTrue(defaultRolesList.contains(role));
            defaultRolesList.remove(role);
        }

        // Try getting user details with different cased username
        MutableUserDetails userDetails2 = this.dao
                .retrieveByName(DEFAULT_USERNAME.toUpperCase());
        assertTrue(userDetails instanceof PersistentUserDetails);
        assertTrue(PersistentUserDetails.class == userDetails.getClass());
        assertEquals(userDetails, userDetails2);
        
        // choose random non-existent user name and try to retrieve
        assertNull(this.dao.retrieveByName(USERNAME_NOT_IN_DB));
    }

    public void testHasUsername() {
        this.dao.save(this.dataObject);
        assertTrue(this.dao.hasUsername(DEFAULT_USERNAME));

        assertFalse(this.dao.hasUsername(USERNAME_NOT_IN_DB));
    }

    private void verifyUserandJoinTablesAreEmpty() {
        assertTrue(this.retrieveUserDetailsListFromDb().isEmpty());
        assertTrue(this.retrieveUsersRolesTableFromDb().isEmpty());
    }

    private List<?> retrieveUserDetailsListFromDb() {
        return this.jdbcTemplate.queryForList("SELECT * FROM "
                + PersistentUserDetails.DATA_STORE_NAME + ", "
                + PersistentUserDetails.GRANTED_AUTHORITY_JOIN_TABLE_NAME
                + ", " + PersistentGrantedAuthority.DATA_STORE_NAME + " WHERE "
                + PersistentUserDetails.DATA_STORE_NAME + ".id = "
                + PersistentUserDetails.GRANTED_AUTHORITY_JOIN_TABLE_NAME + "."
                + PersistentUserDetails.USER_DETAILS_JOIN_COLUMN_NAME + " AND "
                + PersistentGrantedAuthority.DATA_STORE_NAME + ".id = "
                + PersistentUserDetails.GRANTED_AUTHORITY_JOIN_TABLE_NAME + "."
                + PersistentUserDetails.GRANTED_AUTHORITY_JOIN_COLUMN_NAME,
                (Object[]) null);
    }


    private List<?> retrieveUsersRolesTableFromDb() {
        return this.jdbcTemplate.queryForList("SELECT * FROM "
                + PersistentUserDetails.GRANTED_AUTHORITY_JOIN_TABLE_NAME,
                (Object[]) null);
    }

	@Override
	protected List<?> retrieveDataObjectListFromDb() {
		return this.jdbcTemplate.queryForList("SELECT * FROM "
                + PersistentUserDetails.DATA_STORE_NAME, (Object[]) null);
	}

}