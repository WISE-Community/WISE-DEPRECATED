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
package net.sf.sail.webapp.dao.jnlp.impl;

import java.util.List;
import java.util.Map;

import net.sf.sail.webapp.dao.AbstractTransactionalDaoTests;
import net.sf.sail.webapp.domain.Jnlp;
import net.sf.sail.webapp.domain.impl.JnlpImpl;
import net.sf.sail.webapp.domain.sds.SdsJnlp;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public class HibernateJnlpDaoTest extends AbstractTransactionalDaoTests<HibernateJnlpDao, Jnlp> {

    private static final Long SDS_ID = new Long(7);

    private static final String DEFAULT_NAME = "Airbags";

    private static final String DEFAULT_URL = "http://mrpotatoiscoolerthanwoody.com";

    private SdsJnlp sdsJnlp;

    public void setSdsJnlp(SdsJnlp sdsJnlp) {
        this.sdsJnlp = sdsJnlp;
    }

    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpBeforeTransaction()
     */
    @Override
    protected void onSetUpBeforeTransaction() throws Exception {
        super.onSetUpBeforeTransaction();
        this.dao = ((HibernateJnlpDao) this.applicationContext
                .getBean("jnlpDao"));
        this.dataObject = ((JnlpImpl) this.applicationContext
                .getBean("jnlp"));
         this.sdsJnlp.setSdsObjectId(SDS_ID);
        this.sdsJnlp.setName(DEFAULT_NAME);
        this.sdsJnlp.setUrl(DEFAULT_URL);

        this.dataObject.setSdsJnlp(this.sdsJnlp);
    }

    /**
     * @see org.springframework.test.AbstractTransactionalSpringContextTests#onTearDownAfterTransaction()
     */
    @Override
    protected void onTearDownAfterTransaction() throws Exception {
        super.onTearDownAfterTransaction();
        this.sdsJnlp = null;
    }

    /**
     * Test method for
     * {@link net.sf.sail.webapp.dao.impl.AbstractHibernateDao#save(java.lang.Object)}.
     */
    public void testSave() {
        verifyDataStoreIsEmpty();

        this.dao.save(this.dataObject);

        // verify data store contains saved data using direct jdbc retrieval
        // (not using dao)
        List<?> actualList = retrieveJnlpListFromDb();
        assertEquals(1, actualList.size());

        Map<?, ?> actualCurnitMap = (Map<?, ?>) actualList.get(0);
        assertEquals(SDS_ID, actualCurnitMap.get(SdsJnlp.COLUMN_NAME_JNLP_ID
                .toUpperCase()));
        assertEquals(DEFAULT_NAME, actualCurnitMap
                .get(SdsJnlp.COLUMN_NAME_JNLP_NAME.toUpperCase()));
        assertEquals(DEFAULT_URL, actualCurnitMap
                .get(SdsJnlp.COLUMN_NAME_JNLP_URL.toUpperCase()));
    }

    /*
     * SELECT * FROM jnlps, sds_jnlps WHERE jnlps.sds_jnlp_fk = sds_jnlps.id
     */
    private static final String RETRIEVE_JNLP_LIST_SQL = "SELECT * FROM "
            + JnlpImpl.DATA_STORE_NAME + ", " + SdsJnlp.DATA_STORE_NAME
            + " WHERE " + JnlpImpl.DATA_STORE_NAME + "."
            + JnlpImpl.COLUMN_NAME_SDS_JNLP_FK + " = "
            + SdsJnlp.DATA_STORE_NAME + ".id";

    private List<?> retrieveJnlpListFromDb() {
        return this.jdbcTemplate.queryForList(RETRIEVE_JNLP_LIST_SQL,
                (Object[]) null);
    }

	@Override
	protected List<?> retrieveDataObjectListFromDb() {
        return this.jdbcTemplate.queryForList("SELECT * FROM "
                + JnlpImpl.DATA_STORE_NAME, (Object[]) null);
	}
}