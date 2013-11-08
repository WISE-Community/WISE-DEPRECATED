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
package net.sf.sail.webapp.dao.annotation.impl;

import java.util.List;
import java.util.Map;

import org.hibernate.Session;

import net.sf.sail.webapp.dao.AbstractTransactionalDaoTests;
import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.annotation.AnnotationBundle;
import net.sf.sail.webapp.domain.annotation.impl.AnnotationBundleImpl;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.sds.SdsJnlp;
import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.domain.sds.SdsWorkgroup;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 */
public class HibernateAnnotationBundleDaoTest
		extends
		AbstractTransactionalDaoTests<HibernateAnnotationBundleDao, AnnotationBundle> {

	private static final Long SDS_ID = new Long(42);

	private static final SdsCurnit DEFAULT_SDS_CURNIT = new SdsCurnit();

	private static final SdsJnlp DEFAULT_SDS_JNLP = new SdsJnlp();

	private static final String DEFAULT_NAME = "the heros";

	private static final String DEFAULT_URL = "http://woohoo";

    private static final String GROUP_NAME = "the heros group";

	private SdsOffering defaultSdsOffering;

	private Offering defaultOffering;

	private SdsWorkgroup sdsWorkgroup;

	private Workgroup workgroup;
	
	private Group group;

	/**
	 * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpBeforeTransaction()
	 */
	@Override
	protected void onSetUpBeforeTransaction() throws Exception {
		super.onSetUpBeforeTransaction();
		this.dao = (HibernateAnnotationBundleDao) this.applicationContext
				.getBean("annotationBundleDao");
		this.dataObject = ((AnnotationBundleImpl) this.applicationContext
				.getBean("annotationBundle"));
		this.dataObject.setBundle("XML data");

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
		this.sdsWorkgroup.setSdsOffering(this.defaultSdsOffering);
	}

	/**
	 * @see org.springframework.test.AbstractTransactionalSpringContextTests#onSetUpInTransaction()
	 */
	@Override
	protected void onSetUpInTransaction() throws Exception {
		super.onSetUpInTransaction();
		Session session = this.sessionFactory.getCurrentSession();
		session.save(DEFAULT_SDS_CURNIT); // save sds curnit
		session.save(DEFAULT_SDS_JNLP); // save sds jnlp
		this.defaultSdsOffering.setSdsCurnit(DEFAULT_SDS_CURNIT);
		this.defaultSdsOffering.setSdsJnlp(DEFAULT_SDS_JNLP);
		this.defaultOffering.setSdsOffering(this.defaultSdsOffering);
		session.save(this.defaultOffering); // save offering

		this.workgroup.setOffering(this.defaultOffering);
		this.workgroup.setSdsWorkgroup(this.sdsWorkgroup);
		this.group.setName(GROUP_NAME);
		session.save(group);
		this.workgroup.setGroup(group);
		session.save(this.workgroup);

		this.dataObject.setWorkgroup(this.workgroup);
	}

	/**
	 * @see org.springframework.test.AbstractTransactionalSpringContextTests#onTearDownAfterTransaction()
	 */
	@Override
	protected void onTearDownAfterTransaction() throws Exception {
		super.onTearDownAfterTransaction();
		this.workgroup = null;
		this.defaultOffering = null;
		this.defaultSdsOffering = null;
		this.dataObject = null;
		this.sdsWorkgroup = null;
		this.dao = null;

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
		List<?> actualList = retrieveDataObjectListFromDb();
		assertEquals(1, actualList.size());

		Map<?, ?> actualAnnotationBundleMap = (Map<?, ?>) actualList.get(0);
		assertEquals("XML data", actualAnnotationBundleMap
				.get(AnnotationBundleImpl.COLUMN_NAME_BUNDLE.toUpperCase()));
		assertEquals(this.workgroup.getId(), actualAnnotationBundleMap
				.get(AnnotationBundleImpl.COLUMN_NAME_WORKGROUP_FK
						.toUpperCase()));
	}

	@Override
	protected List<?> retrieveDataObjectListFromDb() {
		return this.jdbcTemplate.queryForList("SELECT * FROM "
				+ AnnotationBundleImpl.DATA_STORE_NAME, (Object[]) null);
	}

	/**
	 * @param defaultSdsOffering
	 *            the defaultSdsOffering to set
	 */
	public void setDefaultSdsOffering(SdsOffering defaultSdsOffering) {
		this.defaultSdsOffering = defaultSdsOffering;
	}

	/**
	 * @param defaultOffering
	 *            the defaultOffering to set
	 */
	public void setDefaultOffering(Offering defaultOffering) {
		this.defaultOffering = defaultOffering;
	}

	/**
	 * @param sdsWorkgroup
	 *            the sdsWorkgroup to set
	 */
	public void setSdsWorkgroup(SdsWorkgroup sdsWorkgroup) {
		this.sdsWorkgroup = sdsWorkgroup;
	}

	/**
	 * @param workgroup
	 *            the workgroup to set
	 */
	public void setWorkgroup(Workgroup workgroup) {
		this.workgroup = workgroup;
	}

	/**
	 * @param group the group to set
	 */
	public void setGroup(Group group) {
		this.group = group;
	}

}