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
package net.sf.sail.webapp.dao.sds.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.domain.sds.SdsUser;
import net.sf.sail.webapp.domain.sds.SdsWorkgroup;
import net.sf.sail.webapp.junit.AbstractSpringHttpUnitTests;

import org.apache.commons.httpclient.HttpStatus;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.xpath.XPath;

import com.meterware.httpunit.WebResponse;

/**
 * @author Cynick Young
 * 
 * @version $Id: HttpRestSdsWorkgroupDaoTest.java 257 2007-03-30 14:59:02Z
 *          cynick $
 * 
 */
public class HttpRestSdsWorkgroupDaoTest extends AbstractSpringHttpUnitTests {

	private static final String DEFAULT_NAME = "d fault";

	private HttpRestSdsWorkgroupDao sdsWorkgroupDao;

	private SdsWorkgroup sdsWorkgroup;

	private SdsOffering sdsOffering;

	private SdsUser sdsUser;

	/**
	 * @see net.sf.sail.webapp.junit.AbstractSpringHttpUnitTests#onTearDown()
	 */
	@Override
	protected void onTearDown() throws Exception {
		super.onTearDown();
		this.sdsWorkgroup = null;
		this.sdsOffering = null;
		this.sdsUser = null;
		this.sdsWorkgroupDao = null;
	}

	/**
	 * @param sdsWorkgroupDao
	 *            the sdsWorkgroupDao to set
	 */
	public void setSdsWorkgroupDao(HttpRestSdsWorkgroupDao sdsWorkgroupDao) {
		this.sdsWorkgroupDao = sdsWorkgroupDao;
	}

	/**
	 * @param sdsOffering
	 *            the SdsOffering to set
	 */
	public void setSdsOffering(SdsOffering sdsOffering) {
		this.sdsOffering = sdsOffering;
	}

	/**
	 * @param sdsUser
	 *            the SdsUser to set
	 */
	public void setSdsUser(SdsUser sdsUser) {
		this.sdsUser = sdsUser;
	}

	/**
	 * @param sdsWorkgroup
	 *            the SdsWorkgroup to set
	 */
	public void setSdsWorkgroup(SdsWorkgroup sdsWorkgroup) {
		this.sdsWorkgroup = sdsWorkgroup;
	}

	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.sds.impl.HttpRestSdsWorkgroupDao#save(net.sf.sail.webapp.domain.sds.SdsWorkgroup)}.
	 */
	@SuppressWarnings("unchecked")
	public void testSave_NewSdsWorkgroup() throws Exception {
		// create offering in SDS
		Long sdsOfferingId = this.createWholeOffering().getSdsObjectId();
		this.sdsOffering.setSdsObjectId(sdsOfferingId);

		this.sdsWorkgroup.setName(DEFAULT_NAME);
		this.sdsWorkgroup.setSdsOffering(this.sdsOffering);
		this.sdsWorkgroup.addMember(this.sdsUser);

		// create user in SDS
		Long sdsUserId = createUserInSds();
		this.sdsUser.setSdsObjectId(sdsUserId);

		assertNull(this.sdsWorkgroup.getSdsObjectId());
		this.sdsWorkgroupDao.save(this.sdsWorkgroup);
		assertNotNull(this.sdsWorkgroup.getSdsObjectId());

		// retrieve newly created workgroup using httpunit and compare with
		// sdsWorkgroup saved via DAO
		WebResponse webResponse = makeHttpRestGetRequest("/workgroup/"
				+ this.sdsWorkgroup.getSdsObjectId());
		assertEquals(HttpStatus.SC_OK, webResponse.getResponseCode());

		Document doc = createDocumentFromResponse(webResponse);

		Element rootElement = doc.getRootElement();
		assertEquals(this.sdsWorkgroup.getSdsObjectId(), new Long(rootElement
				.getChild("id").getValue()));
		assertEquals(this.sdsWorkgroup.getName(), rootElement.getChild("name")
				.getValue());
		assertEquals(this.sdsWorkgroup.getSdsOffering().getSdsObjectId(),
				new Long(rootElement.getChild("offering-id").getValue()));

		// compare the members in the workgroup
		webResponse = makeHttpRestGetRequest("/workgroup/"
				+ this.sdsWorkgroup.getSdsObjectId() + "/membership");
		assertEquals(HttpStatus.SC_OK, webResponse.getResponseCode());

		doc = createDocumentFromResponse(webResponse);

		List<Element> nodeList;
		nodeList = XPath.newInstance(
				"/workgroup-memberships/workgroup-membership").selectNodes(doc);

		assertEquals(1, nodeList.size());
		assertEquals(this.sdsUser.getSdsObjectId(), new Long(nodeList.get(0)
				.getChild("sail-user-id").getValue()));
	}

	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.sds.impl.HttpRestSdsWorkgroupDao#save(net.sf.sail.webapp.domain.sds.SdsWorkgroup)}.
	 */
	@SuppressWarnings("unchecked")
	public void testSave_NewSdsWorkgroup_NoMembers() throws Exception {
		// create offering in SDS
		Long sdsOfferingId = this.createWholeOffering().getSdsObjectId();
		this.sdsOffering.setSdsObjectId(sdsOfferingId);

		this.sdsWorkgroup.setName(DEFAULT_NAME);
		this.sdsWorkgroup.setSdsOffering(this.sdsOffering);

		assertNull(this.sdsWorkgroup.getSdsObjectId());
		this.sdsWorkgroupDao.save(this.sdsWorkgroup);
		assertNotNull(this.sdsWorkgroup.getSdsObjectId());

		// retrieve newly created workgroup using httpunit and compare with
		// sdsWorkgroup saved via DAO
		WebResponse webResponse = makeHttpRestGetRequest("/workgroup/"
				+ this.sdsWorkgroup.getSdsObjectId());
		assertEquals(HttpStatus.SC_OK, webResponse.getResponseCode());

		Document doc = createDocumentFromResponse(webResponse);

		Element rootElement = doc.getRootElement();
		assertEquals(this.sdsWorkgroup.getSdsObjectId(), new Long(rootElement
				.getChild("id").getValue()));
		assertEquals(this.sdsWorkgroup.getName(), rootElement.getChild("name")
				.getValue());
		assertEquals(this.sdsWorkgroup.getSdsOffering().getSdsObjectId(),
				new Long(rootElement.getChild("offering-id").getValue()));

		// compare the members in the workgroup
		webResponse = makeHttpRestGetRequest("/workgroup/"
				+ this.sdsWorkgroup.getSdsObjectId() + "/membership");
		assertEquals(HttpStatus.SC_OK, webResponse.getResponseCode());

		doc = createDocumentFromResponse(webResponse);

		Element rootMembershipElement = doc.getRootElement();
		assertEquals("workgroup-memberships", rootMembershipElement.getName());
		assertTrue(rootMembershipElement.getChildren().isEmpty());
	}

	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.sds.impl.HttpRestSdsWorkgroupDao#delete(net.sf.sail.webapp.domain.sds.SdsWorkgroup)}.
	 */
	public void testDelete() {
		try {
			this.sdsWorkgroupDao.delete(this.sdsWorkgroup);
			fail("UnsupportedOperationException expected");
		} catch (UnsupportedOperationException expected) {
		}
	}

	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.sds.impl.HttpRestSdsWorkgroupDao#getList()}.
	 */
	public void testGetList() {
		try {
			this.sdsWorkgroupDao.getList();
			fail("UnsupportedOperationException expected");
		} catch (UnsupportedOperationException expected) {
		}
	}

	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.sds.impl.HttpRestSdsWorkgroupDao#getById(java.lang.Long)}.
	 */
	public void testGetById() throws Exception {
		// TODO LAW - this test cannot work until I can figure out how to create
		// a sessionbundle as part of a test.
		assertTrue(true);
		// this.sdsWorkgroup.setSdsOffering(this.createWholeOffering());
		// this.sdsWorkgroup.setName(DEFAULT_NAME);
		// Long sdsWorkgroupId = this.createWorkgroupInSds(this.sdsWorkgroup
		// .getSdsOffering().getSdsObjectId());
		//
		// SdsWorkgroup actualWorkgroup = this.sdsWorkgroupDao
		// .getById(sdsWorkgroupId);
		// assertEquals(this.sdsWorkgroup.getSdsObjectId(), actualWorkgroup
		// .getSdsObjectId());
		// assertEquals(this.sdsWorkgroup.getName(), actualWorkgroup.getName());
		// assertEquals(this.sdsWorkgroup.getSdsOffering().getSdsObjectId(),
		// actualWorkgroup.getSdsOffering().getSdsObjectId());
		// assertNotNull(actualWorkgroup.getSdsSessionBundle());
	}

	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.sds.impl.HttpRestSdsWorkgroupDao#save(net.sf.sail.webapp.domain.sds.SdsWorkgroup)}.
	 */
	public void testUpdateWorkgroupNoMembers() throws Exception {

		Long sdsOfferingId = this.createWholeOffering().getSdsObjectId();

		// create workgroup in SDS
		Long sdsWorkgroupId = this.createWorkgroupInSds(sdsOfferingId);
		SdsWorkgroup actualSdsWorkgroup = this
				.getWorkgroupInSds(sdsWorkgroupId);

		assertEquals(sdsOfferingId, actualSdsWorkgroup.getSdsOffering()
				.getSdsObjectId());
		assertEquals(DEFAULT_NAME, actualSdsWorkgroup.getName());
		assertEquals(sdsWorkgroupId, actualSdsWorkgroup.getSdsObjectId());

		SdsWorkgroup sdsWorkgroupToUpdate = (SdsWorkgroup) this.applicationContext
				.getBean("sdsWorkgroup");
		sdsWorkgroupToUpdate.setName("updated");

		Long newSdsOfferingId = this.createWholeOffering().getSdsObjectId();
		SdsOffering newSdsOffering = this
				.getOfferingAlternativeMethod(newSdsOfferingId);

		sdsWorkgroupToUpdate.setSdsOffering(newSdsOffering);
		sdsWorkgroupToUpdate.setSdsObjectId(sdsWorkgroupId);

		this.sdsWorkgroupDao.save(sdsWorkgroupToUpdate);

		SdsWorkgroup updatedSdsWorkgroup = this
				.getWorkgroupInSds(sdsWorkgroupId);

		assertEquals(sdsWorkgroupId, updatedSdsWorkgroup.getSdsObjectId());
		assertEquals("updated", updatedSdsWorkgroup.getName());
		assertEquals(newSdsOffering, updatedSdsWorkgroup.getSdsOffering());
	}

	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.sds.impl.HttpRestSdsWorkgroupDao#save(net.sf.sail.webapp.domain.sds.SdsWorkgroup)}.
	 */
	public void testUpdateWorkgroup() throws Exception {

		Long sdsOfferingId = this.createWholeOffering().getSdsObjectId();

		// create workgroup in SDS
		Long sdsWorkgroupId = this.createWorkgroupInSds(sdsOfferingId);

		// create user in SDS
		Long sdsUserId = createUserInSds();
		this.sdsUser = this.getUserInSds(sdsUserId);
		Set<Long> sdsUserIds = new HashSet<Long>();
		sdsUserIds.add(sdsUserId);

		// add user to workgroup as member in SDS
		this.createWorkgroupMembersInSds(sdsWorkgroupId, sdsUserIds);

		SdsWorkgroup actualSdsWorkgroup = this
				.getWorkgroupInSds(sdsWorkgroupId);

		assertEquals(sdsOfferingId, actualSdsWorkgroup.getSdsOffering()
				.getSdsObjectId());
		assertEquals(DEFAULT_NAME, actualSdsWorkgroup.getName());
		assertEquals(sdsWorkgroupId, actualSdsWorkgroup.getSdsObjectId());
		assertTrue(actualSdsWorkgroup.getMembers().size() == 1);
		assertTrue(actualSdsWorkgroup.getMembers().contains(this.sdsUser));

		SdsWorkgroup sdsWorkgroupToUpdate = (SdsWorkgroup) this.applicationContext
				.getBean("sdsWorkgroup");
		sdsWorkgroupToUpdate.setName("updated");

		Long newSdsOfferingId = this.createWholeOffering().getSdsObjectId();
		SdsOffering newSdsOffering = this
				.getOfferingAlternativeMethod(newSdsOfferingId);
		sdsWorkgroupToUpdate.setSdsOffering(newSdsOffering);

		// create another user in SDS
		Long newSdsUserId = createUserInSds();
		SdsUser newSdsUser = this.getUserInSds(newSdsUserId);

		sdsWorkgroupToUpdate.addMember(newSdsUser);
		sdsWorkgroupToUpdate.setSdsObjectId(sdsWorkgroupId);

		this.sdsWorkgroupDao.save(sdsWorkgroupToUpdate);

		SdsWorkgroup updatedSdsWorkgroup = this
				.getWorkgroupInSds(sdsWorkgroupId);

		assertEquals(sdsWorkgroupId, updatedSdsWorkgroup.getSdsObjectId());
		assertEquals("updated", updatedSdsWorkgroup.getName());
		assertEquals(newSdsOffering, updatedSdsWorkgroup.getSdsOffering());
		assertTrue(updatedSdsWorkgroup.getMembers().size() == 1);
		assertTrue(updatedSdsWorkgroup.getMembers().contains(newSdsUser));

	}
}