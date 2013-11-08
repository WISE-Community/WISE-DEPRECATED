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

import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.junit.AbstractSpringHttpUnitTests;

import org.apache.commons.httpclient.HttpStatus;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.xpath.XPath;
import org.junit.Ignore;

import com.meterware.httpunit.WebResponse;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 */
public class HttpRestSdsCurnitDaoTest extends AbstractSpringHttpUnitTests {

	private HttpRestSdsCurnitDao sdsCurnitDao;

	private SdsCurnit sdsCurnit;

	/**
	 * @param sdsCurnitDao
	 *            the sdsCurnitDao to set
	 */
	public void setSdsCurnitDao(HttpRestSdsCurnitDao sdsCurnitDao) {
		this.sdsCurnitDao = sdsCurnitDao;
	}

	/**
	 * @param sdsCurnit
	 *            the sdsCurnit to set
	 */
	public void setSdsCurnit(SdsCurnit sdsCurnit) {
		this.sdsCurnit = sdsCurnit;
	}

	/**
	 * @see net.sf.sail.webapp.junit.AbstractSpringHttpUnitTests#onSetUp()
	 */
	@Override
	protected void onSetUp() throws Exception {
		super.onSetUp();
		this.sdsCurnit.setName(SdsValidData.VALID_CURNIT_NAME);
		this.sdsCurnit.setUrl(SdsValidData.VALID_CURNIT_URL);
	}

	/**
	 * @see net.sf.sail.webapp.junit.AbstractSpringHttpUnitTests#onTearDown()
	 */
	@Override
	protected void onTearDown() throws Exception {
		super.onTearDown();
		this.sdsCurnitDao = null;
		this.sdsCurnit = null;
	}

	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.sds.impl.HttpRestSdsUserDao#save(net.sf.sail.webapp.domain.sds.SdsCurnit)}.
	 */
	@SuppressWarnings("unchecked")
	public void testSave_NewCurnit() throws Exception {
		assertNull(this.sdsCurnit.getSdsObjectId());
		this.sdsCurnitDao.save(this.sdsCurnit);
		assertNotNull(this.sdsCurnit.getSdsObjectId());

		// retrieve newly created user using httpunit and compare with sdsUser
		// saved via DAO
		SdsCurnit actualSdsCurnit = getCurnitInSds(this.sdsCurnit
				.getSdsObjectId());
		assertEquals(this.sdsCurnit, actualSdsCurnit);
	}

	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.sds.impl.HttpRestSdsCurnitDao#save(net.sf.sail.webapp.domain.sds.SdsCurnit)}.
	 */
	public void testUpdateCurnit() throws Exception {
		Long sdsCurnitId = this.createCurnitInSds();
		SdsCurnit actualSdsCurnit = this.getCurnitInSds(sdsCurnitId);
		assertEquals(actualSdsCurnit.getSdsObjectId(), sdsCurnitId);
		assertEquals(actualSdsCurnit.getName(), SdsValidData.VALID_CURNIT_NAME);
		assertEquals(actualSdsCurnit.getUrl(), SdsValidData.VALID_CURNIT_URL);

		SdsCurnit sdsCurnitToUpdate = (SdsCurnit) this.applicationContext
				.getBean("sdsCurnit");
		sdsCurnitToUpdate.setSdsObjectId(sdsCurnitId);

		String updateName = "Updated";
		String updateURL = "http://www.encorewiki.org/download/attachments/2113/converted-wise.berkeley.edu-24500.jar";

		sdsCurnitToUpdate.setName(updateName);
		sdsCurnitToUpdate.setUrl(updateURL);
		this.sdsCurnitDao.save(sdsCurnitToUpdate);
		SdsCurnit updatedSdsCurnit = this.getCurnitInSds(sdsCurnitId);

		assertEquals(sdsCurnitId, updatedSdsCurnit.getSdsObjectId());
		assertFalse(actualSdsCurnit.equals(updatedSdsCurnit));
		assertEquals(updateName, updatedSdsCurnit.getName());
		assertEquals(updateURL, updatedSdsCurnit.getUrl());
	}

	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.sds.impl.HttpRestSdsUserDao#delete(net.sf.sail.webapp.domain.sds.SdsCurnit)}.
	 */
	public void testDelete() {
		try {
			this.sdsCurnitDao.delete(this.sdsCurnit);
			fail("UnsupportedOperationException expected");
		} catch (UnsupportedOperationException expected) {
		}
	}

	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.sds.impl.HttpRestSdsOfferingDao#getList()}.
	 */
	// this test always fails when the list gets too large because the request times out.
	// either we clear the testing sds every so often, or edit this test to only retrieve a
	// select handful or change the tests to not create so many curnits.
//	@SuppressWarnings("unchecked")
//	public void testGetList() throws Exception {
//		// To test, we will retrieve the curnit list through 2 methods, via
//		// DAO and httpunit. Compare the lists and make sure that they're
//		// equivalent.
//		// *Note* there is a small chance that between the 2 retrievals, a new
//		// offering may be inserted into the SDS and cause this test to break.
//		List<SdsCurnit> actualList = this.sdsCurnitDao.getList();
//
//		WebResponse webResponse = makeHttpRestGetRequest("/curnit");
//		assertEquals(HttpStatus.SC_OK, webResponse.getResponseCode());
//
//		Document doc = createDocumentFromResponse(webResponse);
//
//		List<Element> nodeList = XPath.newInstance("/curnits/curnit/id")
//				.selectNodes(doc);
//		assertEquals(nodeList.size(), actualList.size());
//		List<Integer> curnitIdList = new ArrayList<Integer>(nodeList.size());
//		for (Element element : nodeList) {
//			curnitIdList.add(new Integer(element.getText()));
//		}
//
//		assertEquals(curnitIdList.size(), actualList.size());
//		for (SdsCurnit offering : actualList) {
//			curnitIdList.contains(offering.getSdsObjectId());
//		}
//	}
	
	/**
	 * Test method for
	 * {@link net.sf.sail.webapp.dao.sds.impl.HttpRestSdsUserDao#getById(java.lang.Long)}.
	 */
	public void testGetById() throws Exception {
		try {
			this.sdsCurnitDao.getById(new Long(3));
			fail("UnsupportedOperationException expected");
		} catch (UnsupportedOperationException expected) {
		}
	}
	
}