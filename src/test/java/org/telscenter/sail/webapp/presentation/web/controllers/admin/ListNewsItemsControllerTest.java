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
package org.telscenter.sail.webapp.presentation.web.controllers.admin;

import java.util.Set;
import java.util.TreeSet;

import javax.servlet.http.HttpSession;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.presentation.web.controllers.ControllerUtil;

import org.junit.Before;
import org.junit.After;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.web.servlet.ModelAndView;
import org.telscenter.sail.webapp.domain.newsitem.NewsItem;
import org.telscenter.sail.webapp.service.newsitem.NewsItemService;
import org.easymock.EasyMock;

/**
 * @author patrick lawler
 *
 */
public class ListNewsItemsControllerTest extends AbstractModelAndViewTests{

	private MockHttpServletRequest request;

	private MockHttpServletResponse response;
	
	private ListNewsItemsController listNewsItemsController;
	
	private NewsItemService mockNewsItemService;
	
	private Set<NewsItem> all_news;
	
	private User user;
	
	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	@Before
	public void setUp(){
		this.request = new MockHttpServletRequest();
		this.response = new MockHttpServletResponse();
		HttpSession mockSession = new MockHttpSession();
		this.user = new UserImpl();
		
		mockSession.setAttribute(User.CURRENT_USER_SESSION_KEY, this.user);
		this.request.setSession(mockSession);
		
		this.mockNewsItemService = EasyMock.createMock(NewsItemService.class);
		listNewsItemsController = new ListNewsItemsController();
		listNewsItemsController.setNewsItemService(this.mockNewsItemService);
	}
	
	/**
	 * @see junit.framework.TestCase#tearDown()
	 */
	@After
	public void tearDown(){
		listNewsItemsController = null;
		mockNewsItemService = null;
		user = null;
		request =  null;
		response = null;
	}
	
	public void testHandleRequestInternal() throws Exception{
		all_news = new TreeSet<NewsItem>();
		
		EasyMock.expect(this.mockNewsItemService.retrieveAllNewsItem()).andReturn(all_news);
		EasyMock.replay(this.mockNewsItemService);
		
		ModelAndView mav = listNewsItemsController.handleRequestInternal(request, response);
		assertModelAttributeValue(mav, ListNewsItemsController.ALL_NEWS, all_news);
		assertModelAttributeValue(mav, ControllerUtil.USER_KEY, user);

		EasyMock.verify(this.mockNewsItemService);
	}
}
