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

import net.sf.sail.webapp.dao.AbstractTransactionalDaoTests;
import net.sf.sail.webapp.domain.authentication.MutableAclSid;
import net.sf.sail.webapp.domain.authentication.MutableAclTargetObject;
import net.sf.sail.webapp.domain.authentication.MutableAclTargetObjectIdentity;
import net.sf.sail.webapp.domain.authentication.impl.PersistentAclSid;
import net.sf.sail.webapp.domain.authentication.impl.PersistentAclTargetObject;
import net.sf.sail.webapp.domain.authentication.impl.PersistentAclTargetObjectIdentity;
import net.sf.sail.webapp.domain.group.impl.PersistentGroup;

import org.easymock.EasyMock;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.authority.GrantedAuthorityImpl;
import org.springframework.security.acls.model.ObjectIdentity;

/**
 * @author Cynick Young
 * 
 * @version $Id: HibernateAclTargetObjectIdentityDaoTest.java 612 2007-07-09
 *          14:26:01Z cynick $
 */
public class HibernateAclTargetObjectIdentityDaoTest
        extends
        AbstractTransactionalDaoTests<HibernateAclTargetObjectIdentityDao, MutableAclTargetObjectIdentity> {

    private static final String CLASSNAME = PersistentGroup.class.getName();

    private static final String AUTHORITY = "some authority";

    private static final Long ID = new Long(42);

    private MutableAclTargetObject aclTargetObject;

    private MutableAclSid ownerSid;

    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpBeforeTransaction()
     */
    @Override
    protected void onSetUpBeforeTransaction() throws Exception {
        super.onSetUpBeforeTransaction();
        this.dao = (HibernateAclTargetObjectIdentityDao) this.applicationContext
                .getBean("aclTargetObjectIdentityDao");
        this.dataObject = (MutableAclTargetObjectIdentity) this.applicationContext
                .getBean("mutableAclTargetObjectIdentity");

        this.aclTargetObject = (MutableAclTargetObject) this.applicationContext
                .getBean("mutableAclTargetObject");
        this.aclTargetObject.setClassname(CLASSNAME);

        this.ownerSid = (MutableAclSid) this.applicationContext
                .getBean("mutableAclSid");
        this.ownerSid.setGrantedAuthority(new GrantedAuthorityImpl(AUTHORITY));

        this.dataObject.setAclTargetObject(this.aclTargetObject);
        this.dataObject.setAclTargetObjectId(ID);
        this.dataObject.setInheriting(Boolean.TRUE);
        this.dataObject.setOwnerSid(this.ownerSid);
    }

    /**
     * @see net.sf.sail.webapp.dao.AbstractTransactionalDaoTests#onTearDownAfterTransaction()
     */
    @Override
    protected void onTearDownAfterTransaction() throws Exception {
        super.onTearDownAfterTransaction();
        this.aclTargetObject = null;
        this.ownerSid = null;
    }

    /**
     * Test method for
     * {@link net.sf.sail.webapp.dao.authentication.impl.HibernateAclTargetObjectIdentityDao#findChildren(org.acegisecurity.acls.objectidentity.ObjectIdentity)}.
     */
    public void testFindChildren() {
        try {
            this.dao.findChildren(null);
            fail("UnsupportedOperationException expected");
        } catch (UnsupportedOperationException expected) {
        }
    }

    public void testRetrieveByObjectIdentity() {
        this.verifyDataStoreIsEmpty();
        // save the default granted authority object using dao
        this.dao.save(this.dataObject);

        ObjectIdentity objectIdentity = EasyMock
                .createMock(ObjectIdentity.class);
        EasyMock.expect(objectIdentity.getType()).andReturn(
                PersistentGroup.class.getName());
        EasyMock.expect(objectIdentity.getIdentifier()).andReturn(ID);
        EasyMock.replay(objectIdentity);

        MutableAclTargetObjectIdentity actual = this.dao
                .retrieveByObjectIdentity(objectIdentity);
        assertNotNull(actual);
        assertEquals(CLASSNAME, actual.getType());
        assertEquals(ID, actual.getIdentifier());
        assertEquals(this.dataObject, actual);
        EasyMock.verify(objectIdentity);
    }

    /**
     * Test method for
     * {@link net.sf.sail.webapp.dao.impl.AbstractHibernateDao#save(java.lang.Object)}.
     */
    public void testSave() {
        this.verifyDataStoreIsEmpty();

        // save the default granted authority object using dao
        this.dao.save(this.dataObject);

        // verify associations are cascaded using direct jdbc retrieval
        List<?> actualTargetObjectList = this.retrieveTargetObjectListFromDb();
        assertEquals(1, actualTargetObjectList.size());

        Map<?, ?> actualTargetObjectListMap = (Map<?, ?>) actualTargetObjectList
                .get(0);
        // * NOTE* the keys in the map are all in UPPERCASE!
        String actualValue = (String) actualTargetObjectListMap
                .get(PersistentAclTargetObject.COLUMN_NAME_CLASSNAME
                        .toUpperCase());
        assertEquals(CLASSNAME, actualValue);

        // verify associations are cascaded using direct jdbc retrieval
        List<?> actualSidList = this.retrieveSidListFromDb();
        assertEquals(1, actualSidList.size());

        Map<?, ?> actualSidListMap = (Map<?, ?>) actualSidList.get(0);
        // * NOTE* the keys in the map are all in UPPERCASE!
        actualValue = (String) actualSidListMap
                .get(PersistentAclSid.COLUMN_NAME_SID.toUpperCase());
        assertEquals(AUTHORITY, actualValue);

        // verify data store contains saved data using direct jdbc retrieval
        // (not using dao)
        List<?> actualTargetObjectIdentityList = this
                .retrieveDataObjectListFromDb();
        assertEquals(1, actualTargetObjectIdentityList.size());

        Map<?, ?> actualTargetObjectIdentityListMap = (Map<?, ?>) actualTargetObjectIdentityList
                .get(0);
        // * NOTE* the keys in the map are all in UPPERCASE!
        Long actualLongValue = (Long) actualTargetObjectIdentityListMap
                .get(PersistentAclTargetObjectIdentity.COLUMN_NAME_TARGET_OBJECT_ID
                        .toUpperCase());
        assertEquals(ID, actualLongValue);

        MutableAclTargetObjectIdentity duplicateObject = (MutableAclTargetObjectIdentity) this.applicationContext
                .getBean("mutableAclTargetObjectIdentity");

        duplicateObject.setAclTargetObject(this.aclTargetObject);
        duplicateObject.setAclTargetObjectId(ID);
        duplicateObject.setInheriting(Boolean.TRUE);
        duplicateObject.setOwnerSid(this.ownerSid);

        try {
            this.dao.save(duplicateObject);
            fail("DataIntegrityViolationException expected");
        } catch (DataIntegrityViolationException expected) {
        }
    }

    private List<?> retrieveSidListFromDb() {
        return this.jdbcTemplate.queryForList("SELECT * FROM "
                + PersistentAclSid.DATA_STORE_NAME, (Object[]) null);
    }

    private List<?> retrieveTargetObjectListFromDb() {
        return this.jdbcTemplate.queryForList("SELECT * FROM "
                + PersistentAclTargetObject.DATA_STORE_NAME, (Object[]) null);
    }

    /**
     * @see net.sf.sail.webapp.dao.AbstractTransactionalDaoTests#retrieveDataObjectListFromDb()
     */
    @Override
    protected List<?> retrieveDataObjectListFromDb() {
        return this.jdbcTemplate.queryForList("SELECT * FROM "
                + PersistentAclTargetObjectIdentity.DATA_STORE_NAME,
                (Object[]) null);
    }
}