/**
 * Copyright (c) 2007 Encore Research Group, University of Toronto
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

import org.springframework.security.core.authority.GrantedAuthorityImpl;

import net.sf.sail.webapp.dao.AbstractTransactionalDaoTests;
import net.sf.sail.webapp.domain.authentication.MutableAclSid;
import net.sf.sail.webapp.domain.authentication.impl.PersistentAclSid;


/**
 * @author Cynick Young
 * 
 * @version $Id$
 */
public class HibernateAclSidDaoTest extends
        AbstractTransactionalDaoTests<HibernateAclSidDao, MutableAclSid> {

    private static final String SID_NAME = "Sid Vicious";

    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpBeforeTransaction()
     */
    @Override
    protected void onSetUpBeforeTransaction() throws Exception {
        super.onSetUpBeforeTransaction();
        this.dao = (HibernateAclSidDao) this.applicationContext
                .getBean("aclSidDao");
        this.dataObject = (MutableAclSid) this.applicationContext
                .getBean("mutableAclSid");

        this.dataObject.setGrantedAuthority(new GrantedAuthorityImpl(SID_NAME));
    }

    public void testRetrieveBySidName() {
        this.verifyDataStoreIsEmpty();
        this.dao.save(this.dataObject);

        MutableAclSid actual = this.dao.retrieveBySidName(SID_NAME);
        assertTrue(!actual.isPrincipal());
        assertEquals(SID_NAME, actual.getGrantedAuthority());
        try {
            actual.getPrincipal();
            fail("UnsupportedOperationException expected");
        } catch (UnsupportedOperationException expected) {
        }
        assertEquals(this.dataObject, actual);

        assertNull(this.dao.retrieveBySidName("blah"));
    }

    /**
     * @see net.sf.sail.webapp.dao.AbstractTransactionalDaoTests#testSave()
     */
    @Override
    public void testSave() {
        this.verifyDataStoreIsEmpty();

        // save the default granted authority object using dao
        this.dao.save(this.dataObject);

        // verify data store contains saved data using direct jdbc retrieval
        // (not using dao)
        List<?> actualList = this.retrieveDataObjectListFromDb();
        assertEquals(1, actualList.size());

        Map<?, ?> actualValueMap = (Map<?, ?>) actualList.get(0);
        // * NOTE* the keys in the map are all in UPPERCASE!
        String actualValue = (String) actualValueMap
                .get(PersistentAclSid.COLUMN_NAME_SID.toUpperCase());
        assertEquals(SID_NAME, actualValue);
    }

    /**
     * @see net.sf.sail.webapp.dao.AbstractTransactionalDaoTests#retrieveDataObjectListFromDb()
     */
    @Override
    protected List<?> retrieveDataObjectListFromDb() {
        return this.jdbcTemplate.queryForList("SELECT * FROM "
                + PersistentAclSid.DATA_STORE_NAME, (Object[]) null);
    }
}