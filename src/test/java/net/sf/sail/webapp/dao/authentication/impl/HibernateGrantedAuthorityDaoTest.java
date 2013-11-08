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

import java.util.List;
import java.util.Map;

import net.sf.sail.webapp.dao.AbstractTransactionalDaoTests;
import net.sf.sail.webapp.domain.authentication.MutableGrantedAuthority;
import net.sf.sail.webapp.domain.authentication.impl.PersistentGrantedAuthority;

import org.springframework.dao.DataIntegrityViolationException;

/**
 * @author Cynick Young
 * 
 * @version $Id: HibernateGrantedAuthorityDaoTest.java 257 2007-03-30 14:59:02Z
 *          cynick $
 * 
 */
public class HibernateGrantedAuthorityDaoTest
        extends
        AbstractTransactionalDaoTests<HibernateGrantedAuthorityDao, MutableGrantedAuthority> {

    private static final String DEFAULT_ROLE = "default_role";

    private static final String ROLE_NOT_IN_DB = "not in db";

    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpBeforeTransaction()
     */
    @Override
    protected void onSetUpBeforeTransaction() throws Exception {
        super.onSetUpBeforeTransaction();
        this.dao = ((HibernateGrantedAuthorityDao) this.applicationContext
                .getBean("grantedAuthorityDao"));
        this.dataObject = ((MutableGrantedAuthority) this.applicationContext
                .getBean("mutableGrantedAuthority"));
        this.dataObject.setAuthority(DEFAULT_ROLE);
    }

    public void testSave() {
        this.verifyDataStoreIsEmpty();

        // save the data object using dao
        this.dao.save(this.dataObject);

        // verify data store contains saved data using direct jdbc retrieval
        // (not using dao)
        List<?> actualList = this.retrieveDataObjectListFromDb();
        assertEquals(1, actualList.size());

        Map<?, ?> actualGrantedAuthorityMap = (Map<?, ?>) actualList.get(0);
        // * NOTE* the keys in the map are all in UPPERCASE!
        String actualRole = (String) actualGrantedAuthorityMap
                .get(PersistentGrantedAuthority.COLUMN_NAME_ROLE.toUpperCase());
        assertEquals(DEFAULT_ROLE, actualRole);

        MutableGrantedAuthority emptyAuthority = (MutableGrantedAuthority) this.applicationContext
                .getBean("mutableGrantedAuthority");
        try {
            this.dao.save(emptyAuthority);
            fail("DataIntegrityViolationException expected");
        } catch (DataIntegrityViolationException expected) {
        }

        MutableGrantedAuthority duplicateAuthority = (MutableGrantedAuthority) this.applicationContext
                .getBean("mutableGrantedAuthority");
        duplicateAuthority.setAuthority(DEFAULT_ROLE);
        try {
            this.dao.save(duplicateAuthority);
            fail("DataIntegrityViolationException expected");
        } catch (DataIntegrityViolationException expected) {
        }
    }

    public void testHasRole() {
        this.dao.save(this.dataObject);
        assertTrue(this.dao.hasRole(DEFAULT_ROLE));
        assertFalse(this.dao.hasRole(ROLE_NOT_IN_DB));
    }

    public void testRetrieveByName() {
        this.dao.save(this.dataObject);

        MutableGrantedAuthority actualAuthority = this.dao
                .retrieveByName(DEFAULT_ROLE);
        assertEquals(this.dataObject, actualAuthority);

        // choose random non-existent authority and try to retrieve
        assertNull(this.dao.retrieveByName("blah"));
    }

    /**
     * @see net.sf.sail.webapp.dao.AbstractTransactionalDaoTests#retrieveDataObjectListFromDb()
     */
    @Override
    protected List<?> retrieveDataObjectListFromDb() {
        return this.jdbcTemplate.queryForList("SELECT * FROM "
                + PersistentGrantedAuthority.DATA_STORE_NAME, (Object[]) null);
    }
}