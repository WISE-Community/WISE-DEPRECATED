/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.telscenter.sail.webapp.presentation.web.controllers;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public class ManageHierarchyTypesController extends AbstractController{
	
	private final static String XMLNODEDATA = "xmlNodedata";
	
	private final static String FAKEDATA = "<nodedataset><nodedata><id>1</id><district><id>1</id><name>Berkeley</name>" +
			"</district></nodedata><nodedata><id>2</id><district><id>2</id><name>San Francisco</name></district>" +
			"</nodedata><nodedata><id>3</id><district><id>3</id><name>San Diego</name></district></nodedata><nodedata>" +
			"<id>4</id><school><id>1</id><name>UC Berkeley</name></school></nodedata><nodedata><id>5</id><school>" +
			"<id>2</id><name>Warthog</name></school></nodedata><nodedata><id>6</id><period><id>1</id><name>First" +
			"</name></period></nodedata><nodedata><id>7</id><period><id>2</id><name>Second</name></period></nodedata>" +
			"<nodedata><id>8</id><period><id>3</id><name>Third</name></period></nodedata><nodedata><id>9</id><period>" +
			"<id>4</id><name>Fourth</name></period></nodedata><nodedata><id>10</id><period><id>5</id><name>Fifth</name>" +
			"</period></nodedata><nodedata><id>11</id><period><id>6</id><name>Sixth</name></period></nodedata>" +
			"</nodedataset>";
	
	//private NodeService nodeService;

	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		ModelAndView mav = new ModelAndView();
		
		//mav.addObject(XMLNODEDATA, XMLHierarchy.getXMLNodeDataSet(nodeService.getAllNodeData()));
		mav.addObject(XMLNODEDATA, FAKEDATA);
		return mav;
	}

	/**
	 * @param nodeService the nodeService to set
	 */
//	public void setNodeService(NodeService nodeService) {
//		this.nodeService = nodeService;
//	}

}
