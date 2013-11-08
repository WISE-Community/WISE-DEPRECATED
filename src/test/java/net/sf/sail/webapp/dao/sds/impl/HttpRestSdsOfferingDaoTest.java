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

import java.util.ArrayList;
import java.util.List;

import net.sf.sail.webapp.dao.sds.CurnitMapNotFoundException;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.sds.SdsJnlp;
import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.junit.AbstractSpringHttpUnitTests;

import org.apache.commons.httpclient.HttpStatus;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.xpath.XPath;
import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.internal.runners.TestClassRunner;
import org.junit.runner.RunWith;

import com.meterware.httpunit.WebResponse;

/**
 * @author Cynick Young
 * 
 * @version $Id: HttpRestSdsOfferingDaoTest.java 1143 2007-09-17 15:25:53Z
 *          laurel $
 * 
 */
@RunWith(TestClassRunner.class)
public class HttpRestSdsOfferingDaoTest extends AbstractSpringHttpUnitTests {

	private HttpRestSdsOfferingDao sdsOfferingDao;

	private SdsOffering sdsOffering;

	public void setSdsOfferingDao(HttpRestSdsOfferingDao sdsOfferingDao) {
		this.sdsOfferingDao = sdsOfferingDao;
	}

	/**
	 * @param sdsOffering
	 *            the sdsOffering to set
	 */
	public void setSdsOffering(SdsOffering sdsOffering) {
		this.sdsOffering = sdsOffering;
	}

	/**
	 * @throws Exception
	 */
	@Before
	public void callSetUp() throws Exception {
		this.setUp();
		this.onSetUp();
	}

	/**
	 * @see net.sf.sail.webapp.junit.AbstractSpringHttpUnitTests#onSetUp()
	 */
	@Override
	protected void onSetUp() throws Exception {
		super.onSetUp();
	}

	@After
	public void callTearDown() throws Exception {
		this.tearDown();
		this.onTearDown();
	}

	/**
	 * @see net.sf.sail.webapp.junit.AbstractSpringHttpUnitTests#onTearDown()
	 */
	@Override
	protected void onTearDown() throws Exception {
		super.onTearDown();
		this.sdsOfferingDao = null;
		this.sdsOffering = null;
	}

	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.sds.impl.HttpRestSdsOfferingDao#getList()}.
	 */
	@SuppressWarnings("unchecked")
	@Test
	//Comment out this test by adding @Ignore if it takes too long for you (only works in junit4)
	@Ignore
	public void testGetList() throws Exception {
		// To test, we will retrieve the offering list through 2 methods, via
		// DAO and httpunit. Compare the lists and make sure that they're
		// equivalent.
		// *Note* there is a small chance that between the 2 retrievals, a new
		// offering may be inserted into the SDS and cause this test to break.
		// *Note that I (LAW) haven't bothered to check the curnitmaps for this
		// test,
		// although they are retrieved by getList. GetById is probably
		// sufficient.
		List<SdsOffering> actualSet = new ArrayList<SdsOffering>();
		try {
			actualSet = this.sdsOfferingDao.getList();
		} catch (CurnitMapNotFoundException e) {
			System.out.println("CurnitMapNotFoundException caught and ignored");
			fail("decided to fail now rather than later");
		}
		WebResponse webResponse = makeHttpRestGetRequest("/offering");
		assertEquals(HttpStatus.SC_OK, webResponse.getResponseCode());

		Document doc = createDocumentFromResponse(webResponse);

		List<Element> nodeList = XPath.newInstance("/offerings/offering/id")
				.selectNodes(doc);
		assertEquals(nodeList.size(), actualSet.size());
		List<Integer> offeringIdList = new ArrayList<Integer>(nodeList.size());
		for (Element element : nodeList) {
			offeringIdList.add(new Integer(element.getText()));
		}

		assertEquals(offeringIdList.size(), actualSet.size());
		for (SdsOffering offering : actualSet) {
			offeringIdList.contains(offering.getSdsObjectId());
		}
	}

	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.sds.impl.HttpRestSdsOfferingDao#save(net.sf.sail.webapp.domain.sds.SdsOffering)}.
	 */
	@Test
	public void testUpdateOffering() throws Exception {
		this.sdsOffering = this.createWholeOffering();
		Long constantSdsOfferingId = this.sdsOffering.getSdsObjectId();

		SdsOffering actualSdsOffering = this
				.getOfferingAlternativeMethod(constantSdsOfferingId);
		assertEqualOfferings(actualSdsOffering);

		SdsOffering sdsOfferingToUpdate = this.sdsOffering;
		String updateName = "Updated";
		sdsOfferingToUpdate.setName(updateName);

		this.sdsOfferingDao.save(sdsOfferingToUpdate);
		SdsOffering updatedSdsOffering = this
				.getOfferingAlternativeMethod(constantSdsOfferingId);

		assertEquals(constantSdsOfferingId, updatedSdsOffering.getSdsObjectId());
		assertFalse(actualSdsOffering.equals(updatedSdsOffering));
		assertEquals(updateName, updatedSdsOffering.getName());
	}

	/**
	 * Test method for {@link
	 * net.sf.sail.webapp.dao.sds.impl.HttpRestSdsOfferingDao#save(net.sf.sail.webapp.domain.sds.SdsOffering)}.
	 */
	@Test
	public void testSave_NewOffering() throws Exception {
		this.sdsOffering.setName(DEFAULT_NAME);
		// create curnit in SDS
		SdsCurnit sdsCurnit = (SdsCurnit) this.applicationContext
				.getBean("sdsCurnit");
		sdsCurnit.setSdsObjectId(this.createCurnitInSds());
		this.sdsOffering.setSdsCurnit(sdsCurnit);

		// create jnlp in SDS
		SdsJnlp sdsJnlp = (SdsJnlp) this.applicationContext.getBean("sdsJnlp");
		sdsJnlp.setSdsObjectId(this.createJnlpInSds());
		this.sdsOffering.setSdsJnlp(sdsJnlp);

		// create offering in SDS
		assertNull(this.sdsOffering.getSdsObjectId());
		this.sdsOfferingDao.save(this.sdsOffering);
		assertNotNull(this.sdsOffering.getSdsObjectId());

		SdsOffering actualSdsOffering = this
				.getOfferingAlternativeMethod(this.sdsOffering.getSdsObjectId());
		assertEqualOfferings(actualSdsOffering);
	}

	/**
	 * Test method for {@link
	 * net.sf.sail.webapp.dao.sds.impl.HttpRestSdsOfferingDao#delete(net.sf.sail.webapp.domain.sds.SdsOffering)}.
	 */
	@Test
	public void testDelete() {
		try {
			this.sdsOfferingDao.delete(null);
			fail("UnsupportedOperationException expected");
		} catch (UnsupportedOperationException expected) {
		}
	}

	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.sds.impl.HttpRestSdsOfferingDao#getById(java.lang.Long)}.
	 */
	@Test
	public void testGetById() throws Exception {
		this.sdsOffering = this.createWholeOffering();
		SdsOffering actualSdsOffering = this.sdsOfferingDao
				.getById(this.sdsOffering.getSdsObjectId());
		assertEqualOfferings(actualSdsOffering);
	}

	@Test
	@Ignore
	public void testGetByIdCurnitMapNotRetrieved() throws Exception {
		// TODO LAW this test needs to be updated. createBogusOffering() no longer creates a BogusOffering
		// because of the new validation that Stephen added on 11/3/2007. createBogusOffering fails with a
		// 400 error because the bogusOffering could not be created. See comments on createBogusOffering()
		this.sdsOffering = this.createBogusOffering();
		try {
			this.sdsOfferingDao.getById(this.sdsOffering.getSdsObjectId());
			fail("CurnitMapNotFoundException expected");
		} catch (CurnitMapNotFoundException cmnfe) {
			SdsOffering actualSdsOffering = cmnfe.getSdsOffering();
			assertEqualOfferings(actualSdsOffering);
			assertEquals("", actualSdsOffering.getSdsCurnitMap());
		}
	}

	private void assertEqualOfferings(SdsOffering actualSdsOffering) {
		assertEquals(this.sdsOffering.getName(), actualSdsOffering.getName());
		assertEquals(this.sdsOffering.getSdsObjectId(), actualSdsOffering
				.getSdsObjectId());
		assertEquals(this.sdsOffering.getSdsCurnit().getSdsObjectId(),
				actualSdsOffering.getSdsCurnit().getSdsObjectId());
		assertEquals(this.sdsOffering.getSdsJnlp().getSdsObjectId(),
				actualSdsOffering.getSdsJnlp().getSdsObjectId());
		// not that the original sdsOffering does not have a curnitmap which is
		// generated via the SDS, so we can't compare these
		assertNotNull(actualSdsOffering.getSdsCurnitMap());
	}

}