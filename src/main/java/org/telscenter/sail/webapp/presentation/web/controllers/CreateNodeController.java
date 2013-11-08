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
public class CreateNodeController extends AbstractController {

	private final static String NODEDATAID = "nodeDataId";
	
	private final static String PARENTID = "parentId";
	
	private final static String ID = "id";
	
	//private NodeService nodeService;
	
	 /** 
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		
		//Node parent = null;
		//NodeData nodeData = nodeService.getNodeDataById(Long.parseLong(request.getParameter(NODEDATAID)));
		//if(request.getParameter(PARENTID)!=null){
		//	parent = nodeService.getNodeById(Long.parseLong(request.getParameter(PARENTID)));
		//}
		
		//Node node = new Node();
		//node.setParent(parent);
		//node.setNodeData(nodeData);
		//nodeService.createNode(node);
		
		//if(parent!=null){
		//	nodeService.addChild(parent, node);
		//}
		
		ModelAndView mav = new ModelAndView();
		//mav.addObject(ID, node.getId());
		return mav;
	}

	/**
	 * @param nodeService the nodeService to set
	 */
//	public void setNodeService(NodeService nodeService) {
//		this.nodeService = nodeService;
//	}
}
