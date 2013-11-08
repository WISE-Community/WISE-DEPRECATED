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
import org.springframework.security.acls.model.Permission;
import org.springframework.security.acls.domain.BasePermission;

import net.sf.sail.webapp.dao.AbstractTransactionalDaoTests;
import net.sf.sail.webapp.domain.authentication.ImmutableAclEntry;
import net.sf.sail.webapp.domain.authentication.MutableAclSid;
import net.sf.sail.webapp.domain.authentication.MutableAclTargetObject;
import net.sf.sail.webapp.domain.authentication.MutableAclTargetObjectIdentity;
import net.sf.sail.webapp.domain.authentication.impl.PersistentAclEntry;


/**
 * @author Cynick Young
 *
 * @version $Id$
 */
public class HibernateAclEntryDaoTest extends AbstractTransactionalDaoTests<HibernateAclEntryDao, ImmutableAclEntry> {

    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpBeforeTransaction()
     */
    @Override
    protected void onSetUpBeforeTransaction() throws Exception {
        super.onSetUpBeforeTransaction();
        this.dao = (HibernateAclEntryDao) this.applicationContext
                .getBean("aclEntryDao");
        MutableAclTargetObject targetObject = (MutableAclTargetObject) this.applicationContext.getBean("mutableAclTargetObject");
        targetObject.setClassname("blah");
        
        MutableAclTargetObjectIdentity objectIdentity = (MutableAclTargetObjectIdentity) this.applicationContext.getBean("mutableAclTargetObjectIdentity");
        objectIdentity.setAclTargetObject(targetObject);
        objectIdentity.setAclTargetObjectId(new Long(3));
        objectIdentity.setInheriting(false);
        Integer aceOrder = 0;
        MutableAclSid sid = (MutableAclSid) this.applicationContext.getBean("mutableAclSid");
        sid.setGrantedAuthority(new GrantedAuthorityImpl("string"));
        Permission permission = BasePermission.ADMINISTRATION;
        Boolean granting = false;
        Boolean auditSuccess = false;
        Boolean auditFailure = false;
        dataObject = new PersistentAclEntry(objectIdentity, aceOrder, sid, permission,
                granting, auditSuccess, auditFailure);

    }

    /**
     * Test method for {@link net.sf.sail.webapp.dao.impl.AbstractHibernateDao#save(java.lang.Object)}.
     */
    public void testSave() {
        this.dao.save(dataObject);
        
        // verify data store contains saved data using direct jdbc retrieval
        // (not using dao)
        List<?> actualList = this.retrieveDataObjectListFromDb();
        assertEquals(1, actualList.size());

        Map<?, ?> actualValueMap = (Map<?, ?>) actualList.get(0);
        // * NOTE* the keys in the map are all in UPPERCASE!
        Boolean actualAuditFailure = (Boolean) actualValueMap.get(PersistentAclEntry.COLUMN_NAME_AUDIT_FAILURE.toUpperCase());
        assertFalse(actualAuditFailure);

        Boolean actualAuditSuccess = (Boolean) actualValueMap.get(PersistentAclEntry.COLUMN_NAME_AUDIT_SUCCESS.toUpperCase());
        assertFalse(actualAuditSuccess);
        
        Boolean actualGranting = (Boolean) actualValueMap.get(PersistentAclEntry.COLUMN_NAME_GRANTING.toUpperCase());
        assertFalse(actualGranting);
        
        Integer actualAceOrder = (Integer) actualValueMap.get(PersistentAclEntry.COLUMN_NAME_ACE_ORDER.toUpperCase());
        assertEquals(0, actualAceOrder.intValue());
        
        Integer actualMask = (Integer) actualValueMap.get(PersistentAclEntry.COLUMN_NAME_MASK.toUpperCase());
        assertEquals(BasePermission.ADMINISTRATION.getMask(), actualMask.intValue());
    }

    @Override
    protected List<?> retrieveDataObjectListFromDb() {
        return this.jdbcTemplate.queryForList("SELECT * FROM "
                + PersistentAclEntry.DATA_STORE_NAME, (Object[]) null);
 
    }

}
