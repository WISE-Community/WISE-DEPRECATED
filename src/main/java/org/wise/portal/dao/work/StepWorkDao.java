/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). 
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * 
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
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
package org.wise.portal.dao.work;

import java.util.List;

import org.wise.portal.dao.SimpleDao;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;

public interface StepWorkDao<T extends StepWork> extends SimpleDao<T> {

	public StepWork getStepWorkById(Long id);
	
	public void saveStepWork(StepWork stepWork);
	
	public List<StepWork> getStepWorksByUserInfo(UserInfo userInfo);
	
	public StepWork getLatestStepWorkByUserInfo(UserInfo userInfo);
	
	public StepWork getLatestStepWorkByUserInfoAndNode(UserInfo userInfo,Node node);
	
	public List<StepWork> getStepWorksByUserInfoAndNode(UserInfo userInfo,Node node);
	
	public List<StepWork> getStepWorksByUserInfoAndNodeList(UserInfo userInfo, List<Node> nodeList);
	
	public List<StepWork> getStepWorksByUserInfosAndNode(List<UserInfo> userInfos, Node node);
	
	public List<StepWork> getStepWorksByUserInfos(List<UserInfo> userInfos);
	
	public List<StepWork> getStepWorksByNode(Node node);
	
	public StepWork getStepWorkByStepWorkId(Long id);
	
	public StepWork getStepWorkByUserIdAndData(UserInfo userInfo,String data);
	
	public List<StepWork> getStepWorksByRunId(Long runId);
}
