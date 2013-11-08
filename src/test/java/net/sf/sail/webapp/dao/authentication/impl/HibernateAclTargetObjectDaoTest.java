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
import net.sf.sail.webapp.domain.authentication.MutableAclTargetObject;
import net.sf.sail.webapp.domain.authentication.impl.PersistentAclTargetObject;

/**
 * @author Cynick Young
 * 
 * @version $Id: HibernateAclTargetObjectDaoTest.java 612 2007-07-09 14:26:01Z
 *          cynick $
 */
public class HibernateAclTargetObjectDaoTest
        extends
        AbstractTransactionalDaoTests<HibernateAclTargetObjectDao, MutableAclTargetObject> {

    private static final String CLASSNAME = "some class";

    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpBeforeTransaction()
     */
    @Override
    protected void onSetUpBeforeTransaction() throws Exception {
        super.onSetUpBeforeTransaction();
        this.dao = (HibernateAclTargetObjectDao) this.applicationContext
                .getBean("aclTargetObjectDao");
        this.dataObject = (MutableAclTargetObject) this.applicationContext
                .getBean("mutableAclTargetObject");

        this.dataObject.setClassname(CLASSNAME);
    }

    public void testRetrieveByClassname() {
        this.verifyDataStoreIsEmpty();
        this.dao.save(this.dataObject);

        MutableAclTargetObject actual = this.dao.retrieveByClassname(CLASSNAME);
        assertEquals(CLASSNAME, actual.getClassname());
        assertEquals(this.dataObject, actual);

        assertNull(this.dao.retrieveByClassname("blah"));
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
                .get(PersistentAclTargetObject.COLUMN_NAME_CLASSNAME
                        .toUpperCase());
        assertEquals(CLASSNAME, actualValue);
    }

    /**
     * @see net.sf.sail.webapp.dao.AbstractTransactionalDaoTests#retrieveDataObjectListFromDb()
     */
    @Override
    protected List<?> retrieveDataObjectListFromDb() {
        return this.jdbcTemplate.queryForList("SELECT * FROM "
                + PersistentAclTargetObject.DATA_STORE_NAME, (Object[]) null);
    }
}