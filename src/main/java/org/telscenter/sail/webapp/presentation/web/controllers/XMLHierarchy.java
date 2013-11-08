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

import java.util.Set;

import org.telscenter.sail.webapp.domain.authentication.impl.StudentUserDetails;
import org.telscenter.sail.webapp.domain.authentication.impl.TeacherUserDetails;

import net.sf.sail.webapp.domain.User;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public final class XMLHierarchy {
//
//	public static String getXMLDistrict(District district){
//		return "<district><id>" + district.getId() + "</id><name>" + district.getName() + "</name></district>";
//	}
//	
//	public static String getXMLSchool(School school){
//		return "<school><id>" + school.getId() + "</id><name>" + school.getName() + "</name></school>";
//	}
//	
//	public static String getXMLPeriod(Period period){
//		return "<period><id>" + period.getId() + "</id><name>" + period.getName() + "</name></period>";
//	}
//	
	public static String getXMLUser(User user){
		String xmlUser = "<user><id>" + user.getId() + "</id><name>" + user.getUserDetails().getUsername() + "</name>";
		if(user.getUserDetails() instanceof TeacherUserDetails){
			xmlUser = xmlUser + "<role>teacher</role>";
		} else if(user.getUserDetails() instanceof StudentUserDetails){
			xmlUser = xmlUser + "<role>student</role>";
		}
		return xmlUser + "</user>";
	}
	
//	public static String getXMLNodeData(NodeData nodeData){
//		String nodeData = "<nodedata><id>" + nodeData.getId() + "</id>";
//		String tablename = nodeData.getTablename();
//		if(tablename=='districts'){
//			nodeData = nodeData + getXMLDistrict((District) nodeData.getObject());
//		} else if(tablename=='schools'){
//			nodeData = nodeData + getXMLSchool((School) nodeData.getObject());
//		} else if(tablename=='periods'){
//			nodeData = nodeData + getXMLPeriod((Period) nodeData.getObject());
//		} else if(tablename=='users'){
//			nodeData = nodeData + getXMLUser((User) nodeData.getObject());
//		}
//		return nodeData + "</nodedata>";
//	}
//	
//	public static String getXMLNodeDataSet(Set<NodeData> nodeDataSet){
//		String nodeDataList = "<nodedataset>";
//		for(NodeData nodeData : nodeDataSet){
//			nodeDataList = nodeDataList + getXMLNodeData(nodeData);
//		}
//		return nodeDataList + "</nodedataset>";
//	}
//	
//	public static String getXMLNode(Node node){
//		String nodeStr = "<node><id>" + node.getId() + "</id>" + getXMLNodeData(node.getNodeData()) + "<children>";
//		for(Node childNode : node.getNodeChildren()){
//			nodeStr = nodeStr + getXMLNode(childNode);
//		}
//		nodeStr = nodeStr + "</children></node>";
//		return nodeStr;
//	}
//	
//	public static String getXMLTopLevelNodes(Set<Node> nodes){
//		String nodesStr = "<nodeset>";
//		for(Node node : nodes){
//			nodesStr = nodesStr + getXMLNode(node);
//		}
//		nodesStr = nodesStr + "</nodeset>";
//		return nodesStr;
//	}
}
