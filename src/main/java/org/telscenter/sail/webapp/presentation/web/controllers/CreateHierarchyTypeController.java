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

import net.sf.sail.webapp.service.UserService;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public class CreateHierarchyTypeController extends AbstractController{
	
	private final static String TYPE = "type";
	
	private final static String DATA = "data";
	
	private final static String ID = "id";
	
	private final static String XMLNODEDATA = "xmlNodedata";
	
	//private NodeService nodeService;
	
	private UserService userService;
	
	 /** 
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		
		String type = request.getParameter(TYPE);
		String data = request.getParameter(DATA);
		
		Long fakeID;
		Long fakeTypeID;
		if(request.getParameter(ID)!=null){
			fakeTypeID = 98l;
			fakeID = Long.parseLong(request.getParameter(ID));
			//NodeData nodeData = nodeService.getById(Long.parseLong(request.getParameter(ID)));
		} else {
			fakeTypeID = 99l;
			fakeID = 97l;
			//NodeData nodeData = new NodeData();
		}
		
		String fake;
		if(type.equals("district")){
			//District district = new District();
			//district.setName(data);
			//nodeData.setObject(district);
			fake = "<nodedata><id>" + fakeID + "</id><district><id>" + fakeTypeID + "</id><name>" + data + "</name></district></nodedata>";
		} else if(type.equals("school")){
			//School school = new School();
			//school.setName(data);
			//nodeData.setObject(school);
			fake = "<nodedata><id>" + fakeID + "</id><school><id>" + fakeTypeID + "</id><name>" + data + "</name></school></nodedata>";
		} else if(type.equals("period")){
			//Period period = new Period();
			//period.setName(data);
			//nodeData.setObject(period);
			fake = "<nodedata><id>" + fakeID + "</id><period><id>" + fakeTypeID + "</id><name>" + data + "</name></period></nodedata>";
		} else if(type.equals("user")){
			//User user = userService.retrieveById(Long.parseLong(data));
			//nodeData.setObject(user);
			fake = "<nodedata><id>" + fakeID + "</id><user><id>" + fakeTypeID + "</id><name>" + data + "</user></district></nodedata>";
		} else {
			//error stuff here
			fake = "";
		}
		
		//nodeService.createNodeData(nodeData);
		
		ModelAndView mav = new ModelAndView();
		mav.addObject(XMLNODEDATA, fake);
		//mav.addObject(XMLNODEDATA, XMLHierarchy.getXMLNodeData(nodeData));
		return mav;
	}

	/**
	 * @param userService the userService to set
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

	/**
	 * @param nodeService the nodeService to set
	 */
//	public void setNodeService(NodeService nodeService) {
//		this.nodeService = nodeService;
//	}

}
