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

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.service.UserService;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.authentication.impl.StudentUserDetails;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public class ManageHierarchyController extends AbstractController{

	private final static String XMLNODES = "xmlNodes";
	
	private final static String XMLNODEDATA = "xmlNodedata";
	
	private final static String USERS = "users";
	
	//private NodeService nodeService;
	
	private UserService userService;
	
	private final static String FAKEDATA = "<nodeset><node><id>1</id><nodedata><id>1</id><district><id>1</id><name>" +
			"Berkeley</name></district></nodedata><children><node><id>2</id><nodedata><id>4</id><school><id>1</id>" +
			"<name>UC Berkeley</name></school></nodedata><children><node><id>3</id><nodedata><id>12</id><user><id>1</id>" +
			"<name>Mr Dougle</name><role>teacher</role></user></nodedata><children><node><id>4</id><nodedata><id>8</id>" +
			"<period><id>3</id><name>Third</name></period></nodedata><children><node><id>5</id><nodedata><id>13</id>" +
			"<user><id>2</id><name>Sammy</name><role>student</role></user></nodedata><children></children></node><node>" +
			"<id>6</id><nodedata><id>14</id><user><id>2</id><name>Gabe</name><role>student</role></user></nodedata>" +
			"<children></children></node></children></node><node><id>7</id><nodedata><id>6</id><period><id>1</id>" +
			"<name>First</name></period></nodedata><children><node><id>8</id><nodedata><id>15</id><user><id>3</id>" +
			"<name>Sarah</name><role>student</role></user></nodedata><children></children></node><node><id>9</id>" +
			"<nodedata><id>16</id><user><id>4</id><name>Christy</name><role>student</role></user></nodedata><children>" +
			"</children></node></children></node></children></node><node><id>12</id><nodedata><id>18</id><user><id>6" +
			"</id><name>Ms Tough</name><role>teacher</role></user></nodedata><children><node><id>13</id><nodedata><id>19" +
			"</id><period><id>8</id><name>Seventh</name></period></nodedata><children><node><id>20</id><nodedata><id>21" +
			"</id><user><id>7</id><name>Bip</name><role>student</role></user></nodedata><children></children></node>" +
			"<node><id>22</id><nodedata><id>23</id><user><id>10</id><name>Bop</name><role>student</role></user>" +
			"</nodedata><children></children></node></children></node><node><id>25</id><nodedata><id>26</id><period>" +
			"<id>15</id><name>Eigth</name></period></nodedata><children><node><id>26</id><nodedata><id>27</id><user>" +
			"<id>17</id><name>Bap</name><role>student</role></user></nodedata><children></children></node><node><id>28" +
			"</id><nodedata><id>29</id><user><id>19</id><name>bom</name><role>student</role></user></nodedata><children>" +
			"</children></node></children></node></children></node></children></node></children></node></nodeset>";
	
	private final static String FAKENODEDATA = "<nodedataset><nodedata><id>1</id><district><id>1</id><name>Berkeley</name>" +
			"</district></nodedata><nodedata><id>2</id><district><id>2</id><name>San Francisco</name></district>" +
			"</nodedata><nodedata><id>3</id><district><id>3</id><name>San Diego</name></district></nodedata><nodedata>" +
			"<id>4</id><school><id>1</id><name>UC Berkeley</name></school></nodedata><nodedata><id>5</id><school>" +
			"<id>2</id><name>Warthog</name></school></nodedata><nodedata><id>6</id><period><id>1</id><name>First" +
			"</name></period></nodedata><nodedata><id>7</id><period><id>2</id><name>Second</name></period></nodedata>" +
			"<nodedata><id>8</id><period><id>3</id><name>Third</name></period></nodedata><nodedata><id>9</id><period>" +
			"<id>4</id><name>Fourth</name></period></nodedata><nodedata><id>10</id><period><id>5</id><name>Fifth</name>" +
			"</period></nodedata><nodedata><id>11</id><period><id>6</id><name>Sixth</name></period></nodedata>" +
			"</nodedataset>";
	
	 /** 
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		ModelAndView mav = new ModelAndView();
		String users = "<users>";
		for(User user : this.userService.retrieveAllUsers()){
			//users = users + XMLHierarchy.getXMLUser(user);
			users = users + getXMLUser(user);
		}
		users = users + "</users>";
		//mav.addObject(XMLNODES, XMLHiearchy.getXMLNodeSet(nodeService.getTopLevelNodes()));
		//mav.addObject(XMLNODEDATA, XMLHierarchy.getXMLNodeDataSet(nodeService.getAllNodeData()));
		mav.addObject(XMLNODES, FAKEDATA);
		mav.addObject(XMLNODEDATA, FAKENODEDATA);
		mav.addObject(USERS, users);
		return mav;
	}

	/**
	 * @param nodeService the nodeService to set
	 */
//	public void setNodeService(NodeService nodeService) {
//		this.nodeService = nodeService;
//	}

	/**
	 * @param userService the userService to set
	 */
	public void setUserService(UserService userService) {
		this.userService = userService;
	}
	
	public static String getXMLUser(User user){
		String xmlUser = "<user><id>" + user.getId() + "</id><name>" + user.getUserDetails().getUsername() + "</name>";
		if(user.getUserDetails() instanceof TeacherUserDetails){
			xmlUser = xmlUser + "<role>teacher</role>";
		} else if(user.getUserDetails() instanceof StudentUserDetails){
			xmlUser = xmlUser + "<role>student</role>";
		}
		return xmlUser + "</user>";
	}
}
