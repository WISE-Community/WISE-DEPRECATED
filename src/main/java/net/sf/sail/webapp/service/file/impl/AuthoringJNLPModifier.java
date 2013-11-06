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
package net.sf.sail.webapp.service.file.impl;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.util.List;

import net.sf.sail.webapp.service.file.StringModifyService;

import org.apache.commons.lang.WordUtils;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.jdom.output.XMLOutputter;
import org.jdom.xpath.XPath;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public class AuthoringJNLPModifier implements StringModifyService {

	private static final String PROPERTY_ELEMENT_NAME = "property";
	private static final String NAME_ATTRIBUTE = "name";
	private static final String VALUE_ATTRIBUTE = "value";
	public static final String CURNIT_URL_ATTRIBUTE = "jnlp.curnit_url.get";
	public static final String CURNIT_URL_ATTRIBUTE_POST = "jnlp.curnit_url.post";
	public static final String CURNIT_PROJECT_ID = "jnlp.project.id";
	private static final String RUN_MODE = "jnlp.runmode";
	private static final String PORTAL_BASEURL_ATTRIBUTE = "jnlp.portal_baseurl";
	private static final String RUN_MODE_WEB = "web";
	
	/**
	 * Takes a string representation of the authoring launcher JNLP and adds a property element into
	 * the resources element which sets a system property "curnit_url" to the curnit url which we want
	 * to launch in the authoring tool.
	 * 
	 * @param inputJNLP The contents of a authoring launcher jnlp file as a string.
	 * @param curnitURL The url for a curnit to be editted as a string
	 * @param projectId The id of the project to author
	 * @return A string representing the altered jnlp (with application argument added)
	 * @throws JDOMException
	 * @throws IOException
	 */
	@SuppressWarnings("unchecked")
	public String modifyJnlp(String inputJNLP, String curnitURL, Long projectId)
			throws JDOMException, IOException {
		return modifyJnlp(inputJNLP, curnitURL, projectId, "", "");

	}

	/**
	 * Takes a string representation of the authoring launcher JNLP and adds a property element into
	 * the resources element which sets a system property "curnit_url" to the curnit url which we want
	 * to launch in the authoring tool.
	 * 
	 * @param inputJNLP The contents of a authoring launcher jnlp file as a string.
	 * @param curnitURL The url for a curnit to be editted as a string
	 * @param projectId The id of the project to author
	 * @param portalBaseUrl the url where the portal's base is, ie
	 *    http://localhost:8080/webapp or http://123.45.678.901:8080/webapp
	 * @param postCurnitUrl the url to post the otml to. This url will know how to persist the
	 *     otml.
	 * @return A string representing the altered jnlp (with application argument added)
	 * @throws JDOMException
	 * @throws IOException
	 */
	public String modifyJnlp(String jnlpString, String curnitUrl, Long projectId,
			String portalBaseUrl, String postCurnitUrl) throws JDOMException, IOException {
		InputStream inputStream = new ByteArrayInputStream(jnlpString.getBytes());
		SAXBuilder builder = new SAXBuilder();
		Document doc = builder.build(inputStream);
		
		// gets the <resources> node with no "os" attribute -> there should only be one
        List<Element> resourceNodeList = XPath.newInstance("/jnlp/resources[not(@os)]").selectNodes(doc);
        Element resourceElement = resourceNodeList.get(0);

        //.get url where to get the curnit
		Element propertyElement = new Element(PROPERTY_ELEMENT_NAME);
		propertyElement.setAttribute(NAME_ATTRIBUTE, CURNIT_URL_ATTRIBUTE);
		propertyElement.setAttribute(VALUE_ATTRIBUTE, curnitUrl);
		resourceElement.addContent(propertyElement);
		
		//.post url where to post the curnit
		propertyElement = new Element(PROPERTY_ELEMENT_NAME);
		propertyElement.setAttribute(NAME_ATTRIBUTE, CURNIT_URL_ATTRIBUTE_POST);
		propertyElement.setAttribute(VALUE_ATTRIBUTE, postCurnitUrl);
		resourceElement.addContent(propertyElement);
		
		//session type web
		propertyElement = new Element(PROPERTY_ELEMENT_NAME);
		propertyElement.setAttribute(NAME_ATTRIBUTE, RUN_MODE);
		propertyElement.setAttribute(VALUE_ATTRIBUTE, "web");
		resourceElement.addContent(propertyElement);
		
		// portal baseurl
		propertyElement = new Element(PROPERTY_ELEMENT_NAME);
		propertyElement.setAttribute(NAME_ATTRIBUTE, PORTAL_BASEURL_ATTRIBUTE);
		propertyElement.setAttribute(VALUE_ATTRIBUTE, portalBaseUrl);
		resourceElement.addContent(propertyElement);
		
		
		//project.id
		propertyElement = new Element(PROPERTY_ELEMENT_NAME);
		propertyElement.setAttribute(NAME_ATTRIBUTE, CURNIT_PROJECT_ID);
		propertyElement.setAttribute(VALUE_ATTRIBUTE, projectId.toString());
		resourceElement.addContent(propertyElement);
		
		resourceNodeList.add(0, resourceElement);

		XMLOutputter outputter = new XMLOutputter();
		String outputJNLP = outputter.outputString(doc);
		System.out.println(WordUtils.wrap(outputJNLP, 200));
		return outputJNLP;	
	}
}
