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
package net.sf.sail.webapp.dao;

import java.util.List;

import net.sf.sail.webapp.domain.Persistable;
import net.sf.sail.webapp.junit.AbstractTransactionalDbTests;

/**
 * Performs basic implementation tests on the methods defined in SimpleDao using
 * a real data store.
 * 
 * @author Cynick Young
 * 
 * @version $Id: AbstractTransactionalDaoTests.java 941 2007-08-16 14:03:11Z
 *          laurel $
 */
public abstract class AbstractTransactionalDaoTests<DAO extends SimpleDao<OBJECT>, OBJECT extends Persistable>
		extends AbstractTransactionalDbTests {

	protected DAO dao;

	protected OBJECT dataObject;

	private static final Long NON_EXISTENT_PK = new Long(666);

	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.impl.AbstractHibernateDao#delete(java.lang.Object)}.
	 */
	public void testDelete() {
		this.verifyDataStoreIsEmpty();

		// save and delete the data object using dao
		this.dao.save(this.dataObject);
		this.dao.delete(this.dataObject);

		// * NOTE * must flush to test delete
		// see http://forum.springframework.org/showthread.php?t=18263 for
		// explanation
		this.toilet.flush();

		this.verifyDataStoreIsEmpty();
	}

	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.impl.AbstractHibernateDao#save(java.lang.Object)}.
	 */
	public abstract void testSave();

	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.impl.AbstractHibernateDao#getList()}.
	 */
	public void testGetList() {
		this.verifyDataStoreIsEmpty();
		List<OBJECT> actualList = this.dao.getList();
		assertTrue(actualList.isEmpty());

		this.dao.save(this.dataObject);
		List<?> expectedList = this.retrieveDataObjectListFromDb();
		assertEquals(1, expectedList.size());

		actualList = this.dao.getList();
		assertEquals(1, actualList.size());
		assertEquals(this.dataObject, actualList.get(0));
	}

	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.impl.AbstractHibernateDao#getById(java.lang.Long)}.
	 */
	public void testGetById() throws Exception {
		this.verifyDataStoreIsEmpty();
		try {
			this.dao.getById(NON_EXISTENT_PK);
			fail("Expected ObjectNotFoundException");
		} catch (ObjectNotFoundException e) {

		}
		this.dao.save(this.dataObject);
		List<OBJECT> actualList = this.dao.getList();
		OBJECT actualObject = actualList.get(0);

		assertTrue(this.dataObject.getId() instanceof Long);
		assertEquals(actualObject, this.dao.getById((Long) this.dataObject
				.getId()));
	}

	protected final void verifyDataStoreIsEmpty() {
		assertTrue(retrieveDataObjectListFromDb().isEmpty());
	}

	protected abstract List<?> retrieveDataObjectListFromDb();

	/**
	 * @see org.springframework.test.AbstractTransactionalSpringContextTests#onTearDownAfterTransaction()
	 */
	@Override
	protected void onTearDownAfterTransaction() throws Exception {
		super.onTearDownAfterTransaction();
		this.dao = null;
		this.dataObject = null;
	}
}