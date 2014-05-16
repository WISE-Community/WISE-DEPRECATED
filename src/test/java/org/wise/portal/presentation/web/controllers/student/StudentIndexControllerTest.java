/**
 * Copyright (c) 2007 Regents of the University of California (Regents). Created
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
package org.wise.portal.presentation.web.controllers.student;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

import javax.servlet.http.HttpSession;

import org.easymock.EasyMock;
import org.junit.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.StudentRunInfo;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.offering.RunService;
import org.wise.portal.service.student.StudentService;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class StudentIndexControllerTest extends AbstractModelAndViewTests {
	
	private StudentIndexController studentIndexController;

    private MockHttpServletRequest request;

    private MockHttpServletResponse response;

    private RunService mockRunService;
    
    private StudentService mockStudentService;
    
    private List<Run> expectedRunList;
    
    private Run mockRun;

	private StudentRunInfo mockStudentRunInfo;
	
	private List<StudentRunInfo> 
	   expected_current_studentruninfo_list, expected_ended_studentruninfo_list;
    
    private User user;
    
    protected void setUp() throws Exception {
    	super.setUp();
        this.request = new MockHttpServletRequest();
        this.response = new MockHttpServletResponse();
        HttpSession mockSession = new MockHttpSession();
        this.user = new UserImpl();
        mockSession.setAttribute(User.CURRENT_USER_SESSION_KEY, this.user);
        this.request.setSession(mockSession);

        this.mockRunService = EasyMock.createMock(RunService.class);
        this.mockStudentService = EasyMock.createMock(StudentService.class);
    	
        mockRun = new RunImpl();
        
        this.expectedRunList = new LinkedList<Run>();
        this.expectedRunList.add(mockRun);
        
        mockStudentRunInfo = new StudentRunInfo();
        mockStudentRunInfo.setRun(mockRun);
        mockStudentRunInfo.setStudentUser(user);
        
        this.expected_current_studentruninfo_list = new ArrayList<StudentRunInfo>();
        this.expected_current_studentruninfo_list.add(mockStudentRunInfo);

        this.expected_ended_studentruninfo_list = new ArrayList<StudentRunInfo>();

        this.studentIndexController = new StudentIndexController();
        this.studentIndexController.setRunService(this.mockRunService);
        this.studentIndexController.setStudentService(this.mockStudentService);
    }
    
    protected void tearDown() throws Exception {
    	super.tearDown();
    	this.request = null;
    	this.response = null;
    	this.mockRunService = null;
    }
    
    @Test public void testHandleRequestInternal_WithRun() throws Exception {
    	User user = new UserImpl();
    	EasyMock.expect(mockRunService.getRunList(user)).andReturn(
    			expectedRunList);
    	EasyMock.replay(mockRunService);
    	
    	EasyMock.expect(mockStudentService.getStudentRunInfo(user, mockRun)).
    	    andReturn(mockStudentRunInfo);
    	EasyMock.replay(mockStudentService);
    	
    	ModelAndView modelAndView = 
    		studentIndexController.handleRequestInternal(request, response);
    	assertModelAttributeValue(modelAndView, 
    			StudentIndexController.CURRENT_STUDENTRUNINFO_LIST_KEY, 
    			expected_current_studentruninfo_list);
    	assertModelAttributeValue(modelAndView, 
    			StudentIndexController.ENDED_STUDENTRUNINFO_LIST_KEY, 
    			expected_ended_studentruninfo_list);

    	assertModelAttributeValue(modelAndView, 
    			ControllerUtil.USER_KEY, user);
    	EasyMock.verify(mockRunService);
    }
    
    @Test public void testHandleRequestInternal_WithoutRun() throws Exception {
    	List<Run> emptyRunList = Collections.emptyList();
    	EasyMock.expect(mockRunService.getRunList(user)).
    	       andReturn(emptyRunList);
    	EasyMock.replay(mockRunService);
    	
    	ModelAndView modelAndView = 
    		studentIndexController.handleRequestInternal(request, response);
    	assertModelAttributeValue(modelAndView, 
    			StudentIndexController.CURRENT_STUDENTRUNINFO_LIST_KEY, emptyRunList);
    	assertModelAttributeValue(modelAndView, 
    			ControllerUtil.USER_KEY, user);
    	EasyMock.verify(mockRunService);
    }

}
