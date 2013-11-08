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
package net.sf.sail.webapp.junit;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.net.MalformedURLException;
import java.util.List;
import java.util.Set;

import net.sf.sail.webapp.dao.sds.impl.SdsValidData;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.sds.SdsJnlp;
import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.domain.sds.SdsUser;
import net.sf.sail.webapp.domain.sds.SdsWorkgroup;
import net.sf.sail.webapp.domain.webservice.http.HttpRestTransport;

import org.apache.commons.httpclient.HttpStatus;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.jdom.xpath.XPath;
import org.xml.sax.SAXException;

import com.meterware.httpunit.GetMethodWebRequest;
import com.meterware.httpunit.PostMethodWebRequest;
import com.meterware.httpunit.WebConversation;
import com.meterware.httpunit.WebRequest;
import com.meterware.httpunit.WebResponse;

/**
 * @author Cynick Young
 * 
 * @version $Id: AbstractSpringHttpUnitTests.java 381 2007-05-10 18:38:04Z
 *          laurel $
 * 
 */
public abstract class AbstractSpringHttpUnitTests extends AbstractSpringTests {

	protected static final String DEFAULT_NAME = "d fault";

	// Note that the curnit and jnlp urls cannot be fake.
	// It must return an appropriate jar or jnlp in order to create the real one
	// in the sds database
	// Otherwise the test will fail
	protected static final String DEFAULT_CURNIT_URL = "http://www.encorewiki.org/download/attachments/2113/converted-wise.berkeley.edu-16704.jar";

	protected static final String DEFAULT_JNLP_URL = "http://tels-develop.soe.berkeley.edu:8080/tels-jnlp/plr-everything-jdic-snapshot-20070125-0811.jnlp";

	protected HttpRestTransport httpRestTransport;

	protected WebConversation webConversation;

	public void setHttpRestTransport(HttpRestTransport httpRestTransport) {
		this.httpRestTransport = httpRestTransport;
	}

	@Override
	protected void onSetUp() throws Exception {
		super.onSetUp();
		this.webConversation = new WebConversation();
	}

	@Override
	protected void onTearDown() throws Exception {
		super.onTearDown();
		this.webConversation = null;
		this.httpRestTransport = null;
	}

	/**
	 * Uses a parser to build a JDom document from the response stream.
	 * 
	 * @param webResponse
	 * @return the JDom document
	 * @throws IOException
	 * @throws JDOMException
	 */
	protected Document createDocumentFromResponse(WebResponse webResponse)
			throws IOException, JDOMException {
		InputStream responseStream = null;
		try {
			SAXBuilder builder = new SAXBuilder();
			responseStream = webResponse.getInputStream();
			return builder.build(responseStream);
		} finally {
			if (responseStream != null) {
				responseStream.close();
			}
		}
	}

	/**
	 * Uses httpunit to go over the network to make a GET REST request.
	 * 
	 * @param urlRelativeToBaseUrl
	 * @return
	 * @throws MalformedURLException
	 * @throws IOException
	 * @throws SAXException
	 */
	protected WebResponse makeHttpRestGetRequest(String urlRelativeToBaseUrl)
			throws MalformedURLException, IOException, SAXException {
		WebRequest webRequest = new GetMethodWebRequest(this.httpRestTransport
				.getBaseUrl()
				+ urlRelativeToBaseUrl);
		webRequest.setHeaderField("Accept", HttpRestTransport.APPLICATION_XML);
		return this.webConversation.getResponse(webRequest);
	}

	/**
	 * Uses httpunit to go over the network to make a POST REST request.
	 * 
	 * @param urlRelativeToBaseUrl
	 * @param body
	 * @return
	 * @throws MalformedURLException
	 * @throws IOException
	 * @throws SAXException
	 */
	protected WebResponse makeHttpRestPostRequest(String urlRelativeToBaseUrl,
			String body) throws MalformedURLException, IOException,
			SAXException {
		InputStream bodyDataStream = new ByteArrayInputStream(body.getBytes());
		WebRequest webRequest = new PostMethodWebRequest(this.httpRestTransport
				.getBaseUrl()
				+ urlRelativeToBaseUrl, bodyDataStream,
				HttpRestTransport.APPLICATION_XML);
		return this.webConversation.getResponse(webRequest);
	}

	/**
	 * Uses HttpUnit to create an sds user.
	 * 
	 * @return The id of the newly created user.
	 * @throws MalformedURLException
	 * @throws IOException
	 * @throws SAXException
	 */
	protected Long createUserInSds() throws MalformedURLException, IOException,
			SAXException {
		WebResponse webResponse = this.makeHttpRestPostRequest("/sail_user",
				"<user><first-name>" + DEFAULT_NAME
						+ "</first-name><last-name>" + DEFAULT_NAME
						+ "</last-name></user>");
		return this.extractNewlyCreatedId(webResponse);
	}

	/**
	 * Uses HttpUnit functionality to retreive a singe sds curnit from the sds.
	 * 
	 * @param sdsCurnitId
	 *            The id of the curnit you want to retrieve
	 * @return The SdsCurnit with name, url and id set
	 * @throws IOException
	 * @throws JDOMException
	 * @throws SAXException
	 */
	protected SdsCurnit getCurnitInSds(Long sdsCurnitId) throws IOException,
			JDOMException, SAXException {
		WebResponse webResponse = this.makeHttpRestGetRequest("/curnit/"
				+ sdsCurnitId);
		assertEquals(HttpStatus.SC_OK, webResponse.getResponseCode());

		Document doc = createDocumentFromResponse(webResponse);
		SdsCurnit sdsCurnit = (SdsCurnit) this.applicationContext
				.getBean("sdsCurnit");
		Element curnitElement = doc.getRootElement();
		sdsCurnit.setName(curnitElement.getChild("name").getValue());
		sdsCurnit.setUrl(curnitElement.getChild("url").getValue());
		sdsCurnit.setSdsObjectId(new Long(curnitElement.getChild("id")
				.getValue()));
		return sdsCurnit;
	}

	/**
	 * Uses HttpUnit functionality to retreive a singe sds jnlp from the sds.
	 * 
	 * @param sdsJnlpId
	 *            The id of the jnlp you want to retrieve
	 * @return The SdsJnlp with name, url and id set
	 * @throws IOException
	 * @throws JDOMException
	 * @throws SAXException
	 */
	protected SdsJnlp getJnlpInSds(Long sdsJnlpId) throws IOException,
			JDOMException, SAXException {
		WebResponse webResponse = this.makeHttpRestGetRequest("/jnlp/"
				+ sdsJnlpId);
		assertEquals(HttpStatus.SC_OK, webResponse.getResponseCode());

		Document doc = createDocumentFromResponse(webResponse);
		SdsJnlp sdsJnlp = (SdsJnlp) this.applicationContext.getBean("sdsJnlp");
		Element jnlpElement = doc.getRootElement();
		sdsJnlp.setName(jnlpElement.getChild("name").getValue());
		sdsJnlp.setUrl(jnlpElement.getChild("url").getValue());
		sdsJnlp.setSdsObjectId(new Long(jnlpElement.getChild("id").getValue()));
		return sdsJnlp;
	}

	/**
	 * Uses HttpUnit functionality to retrieve a single sds offering (including
	 * curnit and jnlp) from the sds.
	 * 
	 * @param sdsOfferingId
	 *            The id of the offering you want to retrieve
	 * @return The SdsOffering with all parameters set.
	 * 
	 * @throws IOException
	 * @throws JDOMException
	 * @throws SAXException
	 */
	protected SdsOffering getOfferingAlternativeMethod(
			Serializable sdsOfferingId) throws IOException, JDOMException,
			SAXException {
		WebResponse webResponse = this.makeHttpRestGetRequest("/offering/"
				+ sdsOfferingId);
		assertEquals(HttpStatus.SC_OK, webResponse.getResponseCode());

		Document doc = createDocumentFromResponse(webResponse);
		SdsOffering sdsOffering = (SdsOffering) this.applicationContext
				.getBean("sdsOffering");
		Element offeringElement = doc.getRootElement();
		sdsOffering.setName(offeringElement.getChild("name").getValue());
		sdsOffering.setSdsObjectId(new Long(offeringElement.getChild("id")
				.getValue()));

		Long sdsCurnitId = new Long(offeringElement.getChild("curnit-id")
				.getValue());
		SdsCurnit sdsCurnit = this.getCurnitInSds(sdsCurnitId);
		sdsOffering.setSdsCurnit(sdsCurnit);

		Long sdsJnlpId = new Long(offeringElement.getChild("jnlp-id")
				.getValue());
		SdsJnlp sdsJnlp = this.getJnlpInSds(sdsJnlpId);
		sdsOffering.setSdsJnlp(sdsJnlp);

		WebResponse curnitMapWebResponse = this
				.makeHttpRestGetRequest("/offering/" + sdsOfferingId
						+ "/curnitmap");
		assertEquals(HttpStatus.SC_OK, curnitMapWebResponse.getResponseCode());

		Document curnitMapDoc = createDocumentFromResponse(curnitMapWebResponse);
		sdsOffering.setSdsCurnitMap(curnitMapDoc.getRootElement().getText());

		return sdsOffering;
	}

	/**
	 * Uses HttpUnit functionality to retrieve a single sds workgroup from the
	 * sds, including the offering and the members
	 * 
	 * @param sdsWorkgroupId
	 *            The id of the workgroup you want to retrieve
	 * @return The SdsWorkgroup with all parameters set.
	 * 
	 * @throws IOException
	 * @throws JDOMException
	 * @throws SAXException
	 */
	@SuppressWarnings("unchecked")
	protected SdsWorkgroup getWorkgroupInSds(Serializable sdsWorkgroupId)
			throws IOException, JDOMException, SAXException {
		String WORKGROUP_PATH = "/workgroup/" + sdsWorkgroupId;
		WebResponse webResponse = this.makeHttpRestGetRequest(WORKGROUP_PATH);
		assertEquals(HttpStatus.SC_OK, webResponse.getResponseCode());

		Document doc = createDocumentFromResponse(webResponse);
		SdsWorkgroup sdsWorkgroup = (SdsWorkgroup) this.applicationContext
				.getBean("sdsWorkgroup");

		Element workgroupElement = doc.getRootElement();
		sdsWorkgroup.setName(workgroupElement.getChild("name").getValue());
		sdsWorkgroup.setSdsObjectId(new Long(workgroupElement.getChild("id")
				.getValue()));

		Integer sdsOfferingId = new Integer(workgroupElement.getChild(
				"offering-id").getValue());
		SdsOffering sdsOffering = this
				.getOfferingAlternativeMethod(sdsOfferingId);
		sdsWorkgroup.setSdsOffering(sdsOffering);

		WebResponse membersWebResponse = this
				.makeHttpRestGetRequest(WORKGROUP_PATH + "/membership");
		assertEquals(HttpStatus.SC_OK, membersWebResponse.getResponseCode());
		Document membersDoc = createDocumentFromResponse(membersWebResponse);

		List<Element> memberElements = XPath.newInstance(
				"/workgroup-memberships/workgroup-membership/sail-user-id")
				.selectNodes(membersDoc);

		for (Element memberNode : memberElements) {
			SdsUser sdsUser = this
					.getUserInSds(new Long(memberNode.getValue()));
			sdsWorkgroup.addMember(sdsUser);
		}

		return sdsWorkgroup;
	}

	/**
	 * Uses HttpUnit functionality to retrieve a single user from the sds.
	 * 
	 * @param sdsUserId
	 *            The id of the user you want to retrieve
	 * @return An SdsUser with firstname, lastname and id set.
	 * @throws IOException
	 * @throws JDOMException
	 * @throws SAXException
	 */
	protected SdsUser getUserInSds(Serializable sdsUserId) throws IOException,
			JDOMException, SAXException {
		WebResponse webResponse = this.makeHttpRestGetRequest("/sail_user/"
				+ sdsUserId);
		assertEquals(HttpStatus.SC_OK, webResponse.getResponseCode());

		Document doc = createDocumentFromResponse(webResponse);
		SdsUser sdsUser = (SdsUser) this.applicationContext.getBean("sdsUser");
		Element userElement = doc.getRootElement();
		sdsUser.setFirstName(userElement.getChild("first-name").getValue());
		sdsUser.setLastName(userElement.getChild("last-name").getValue());
		sdsUser.setSdsObjectId(new Long(userElement.getChild("id").getValue()));
		return sdsUser;
	}

	/**
	 * Uses HttpUnit to create an offering in the sds.
	 * 
	 * @param sdsCurnitId
	 *            The id of the curnit for this offering.
	 * @param sdsJnlpId
	 *            The id of the JNLP for this offering
	 * @return The id of the offering created.
	 * 
	 * @throws MalformedURLException
	 * @throws IOException
	 * @throws SAXException
	 */
	protected Long createOfferingInSds(Long sdsCurnitId, Long sdsJnlpId)
			throws MalformedURLException, IOException, SAXException {
		WebResponse webResponse = this.makeHttpRestPostRequest("/offering",
				"<offering><name>" + DEFAULT_NAME + "</name><curnit-id>"
						+ sdsCurnitId + "</curnit-id><jnlp-id>" + sdsJnlpId
						+ "</jnlp-id></offering>");
		return this.extractNewlyCreatedId(webResponse);
	}

	/**
	 * Uses HttpUnit to create a workgroup in the sds
	 * 
	 * @param sdsOfferingId
	 *            the id of the offering related to this workgroup
	 * @return the id of the workgroup created
	 * @throws MalformedURLException
	 * @throws IOException
	 * @throws SAXException
	 */
	protected Long createWorkgroupInSds(Long sdsOfferingId)
			throws MalformedURLException, IOException, SAXException {
		WebResponse webResponse = this.makeHttpRestPostRequest("/workgroup",
				"<workgroup><name>" + DEFAULT_NAME + "</name><offering-id>"
						+ sdsOfferingId + "</offering-id></workgroup>");
		return this.extractNewlyCreatedId(webResponse);
	}

	/**
	 * Creates a list of members for a workgroup in the sds
	 * 
	 * @param sdsWorkgroupId
	 * @param sdsUserIds
	 * @throws MalformedURLException
	 * @throws IOException
	 * @throws SAXException
	 */
	protected void createWorkgroupMembersInSds(Long sdsWorkgroupId,
			Set<Long> sdsUserIds) throws MalformedURLException, IOException,
			SAXException {
		String memberList = "<workgroup-memberships><workgroup-membership>";
		for (Serializable sdsUserId : sdsUserIds) {
			memberList += "<sail-user-id>" + sdsUserId + "</sail-user-id>";
		}
		memberList += "</workgroup-membership></workgroup-memberships>";
		this.makeHttpRestPostRequest("/workgroup/" + sdsWorkgroupId
				+ "/membership", memberList);
	}

	/**
	 * Creates a JNLP in the sds using HttpUnit
	 * 
	 * @return The id of the JNLP created.
	 * 
	 * @throws MalformedURLException
	 * @throws IOException
	 * @throws SAXException
	 */
	protected Long createJnlpInSds() throws MalformedURLException, IOException,
			SAXException {
		WebResponse webResponse = this.makeHttpRestPostRequest("/jnlp",
				"<jnlp><name>" + SdsValidData.VALID_JNLP_NAME + "</name><url>"
						+ SdsValidData.VALID_JNLP_URL + "</url></jnlp>");
		return this.extractNewlyCreatedId(webResponse);
	}

	/**
	 * Uses HttpUnit to create a single curnit in the sds using
	 * VALID_CURNIT_NAME and VALID_CURNIT_URL. Note that these need to be valid
	 * in order to obtain a curnitmap for the offering.
	 * 
	 * @return The id of the curnit created.
	 * @throws MalformedURLException
	 * @throws IOException
	 * @throws SAXException
	 */
	protected Long createCurnitInSds() throws MalformedURLException,
			IOException, SAXException {
		WebResponse webResponse = this.makeHttpRestPostRequest("/curnit",
				"<curnit><name>" + SdsValidData.VALID_CURNIT_NAME
						+ "</name><url>" + SdsValidData.VALID_CURNIT_URL
						+ "</url></curnit>");
		return this.extractNewlyCreatedId(webResponse);
	}

	private Long extractNewlyCreatedId(WebResponse webResponse) {
		assertEquals(HttpStatus.SC_CREATED, webResponse.getResponseCode());
		String locationHeader = webResponse.getHeaderField("Location");
		return new Long(locationHeader.substring(locationHeader
				.lastIndexOf("/") + 1));
	}

	protected SdsOffering createWholeOffering() throws MalformedURLException,
			IOException, SAXException, JDOMException {
		SdsOffering sdsOffering = (SdsOffering) this.applicationContext
				.getBean("sdsOffering");
		sdsOffering.setName(DEFAULT_NAME);
		// create curnit in SDS
		SdsCurnit sdsCurnit = (SdsCurnit) this.applicationContext
				.getBean("sdsCurnit");
		sdsCurnit.setSdsObjectId(this.createCurnitInSds());
		sdsOffering.setSdsCurnit(sdsCurnit);

		// create jnlp in SDS
		SdsJnlp sdsJnlp = (SdsJnlp) this.applicationContext.getBean("sdsJnlp");
		sdsJnlp.setSdsObjectId(this.createJnlpInSds());
		sdsOffering.setSdsJnlp(sdsJnlp);

		// create offering in SDS
		assertNull(sdsOffering.getSdsObjectId());
		sdsOffering.setSdsObjectId(this.createOfferingInSds(sdsCurnit
				.getSdsObjectId(), sdsJnlp.getSdsObjectId()));
		assertNotNull(sdsOffering.getSdsObjectId());
		return sdsOffering;
	}

	protected SdsOffering createBogusOffering() throws MalformedURLException,
			IOException, SAXException, JDOMException {
		// TODO: LAW update me to work with Stephen's recent changes to jnlp validation
		// in the sds. The validation checks that the url is well-formed. Then, it retrieves
		// the xml using the url and check that its xml is well formed.
		// in the case below, http://www.invalid.com is well formed url, but it
		// apparently doesn't return a xml that is well-formed
		SdsOffering sdsOffering = (SdsOffering) this.applicationContext
				.getBean("sdsOffering");
		sdsOffering.setName(DEFAULT_NAME);
		// create curnit in SDS
		SdsCurnit sdsCurnit = (SdsCurnit) this.applicationContext
				.getBean("sdsCurnit");
		sdsCurnit.setSdsObjectId(this.createCurnitInSds());
		sdsOffering.setSdsCurnit(sdsCurnit);

		// create invalid jnlp in SDS
		SdsJnlp sdsJnlp = (SdsJnlp) this.applicationContext.getBean("sdsJnlp");

		WebResponse webResponse = this.makeHttpRestPostRequest("/jnlp",
				"<jnlp><name>" + "invalid jnlp" + "</name><url>"
						+ "http://www.invalid.com" + "</url></jnlp>");
		sdsJnlp.setSdsObjectId(this.extractNewlyCreatedId(webResponse));
		sdsOffering.setSdsJnlp(sdsJnlp);

		// create offering in SDS
		assertNull(sdsOffering.getSdsObjectId());
		sdsOffering.setSdsObjectId(this.createOfferingInSds(sdsCurnit
				.getSdsObjectId(), sdsJnlp.getSdsObjectId()));
		assertNotNull(sdsOffering.getSdsObjectId());
		return sdsOffering;
	}

}