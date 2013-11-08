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

import javax.servlet.http.HttpSession;
import org.easymock.EasyMock;

import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.web.servlet.ModelAndView;
import org.telscenter.sail.webapp.domain.newsitem.NewsItem;
import org.telscenter.sail.webapp.domain.newsitem.impl.NewsItemImpl;
import org.telscenter.sail.webapp.service.newsitem.NewsItemService;

/**
 * @author patrick lawler
 *
 */
public class RemoveNewsItemControllerTest extends AbstractModelAndViewTests{

	private MockHttpServletRequest request;

	private MockHttpServletResponse response;
	
	private RemoveNewsItemController controller;
	
	private NewsItemService newsService;
	
	private NewsItem newsItem;
	
	@Override
	public void setUp(){
		this.request = new MockHttpServletRequest();
		this.response = new MockHttpServletResponse();
		HttpSession mockSession = new MockHttpSession();
		this.request.setSession(mockSession);
		
		this.newsService = EasyMock.createMock(NewsItemService.class);
		this.controller = new RemoveNewsItemController();
		this.controller.setNewsItemService(newsService);
		
		this.newsItem = new NewsItemImpl();
		this.newsItem.setId(new Long(1));
		this.request.setParameter("newsId", this.newsItem.getId().toString());
	}
	
	@Override
	public void tearDown(){
		this.newsItem = null;
		this.newsService = null;
		this.controller = null;
		this.request = null;
		this.response = null;
	}
	
	public void testHandleRequestInternal(){
		
		this.newsService.deleteNewsItem(this.newsItem.getId());
		EasyMock.expectLastCall();
		EasyMock.replay(this.newsService);	

		ModelAndView mav = this.controller.handleRequestInternal(request, response);
				
		EasyMock.verify(this.newsService);
		
	}
	
	
}
