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

import javax.servlet.http.HttpServletResponse;

import org.junit.After;
import org.junit.Before;
import org.springframework.context.ApplicationContext;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.AbstractModelAndViewTests;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.telscenter.sail.webapp.domain.impl.NewsItemParameters;
import org.telscenter.sail.webapp.domain.newsitem.NewsItem;
import org.telscenter.sail.webapp.domain.newsitem.impl.NewsItemImpl;
import org.telscenter.sail.webapp.service.newsitem.NewsItemService;
import static org.easymock.EasyMock.createMock;
import org.easymock.EasyMock;

/**
 * @author patrick lawler
 *
 */
public class EditNewsItemControllerTest extends AbstractModelAndViewTests {

	private final static String TITLE = "The news for today.";
	
	private final static String NEWS = "blah, blah and more blah.";
	
	private final static Long ID = new Long(5);
	
	private final static String SUCCESS = "success";
	
	private ApplicationContext mockApplicationContext;

	private MockHttpServletRequest request;

	private HttpServletResponse response;

	private BindException errors;
	
	private MockHttpSession mockSession;
	
	private NewsItemService mockNewsItemService;
	
	private EditNewsItemController editNewsItemController;
	
	private NewsItemParameters newsItemParameters;
	
	private NewsItem newsItem;
	
	/**
	 * @see junit.framework.TestCase#setUp()
	 */
	@Before
	public void setUp(){
		request = new MockHttpServletRequest();
		response = new MockHttpServletResponse();
		mockApplicationContext = createMock(ApplicationContext.class);
		mockNewsItemService = createMock(NewsItemService.class);
		mockSession = new MockHttpSession();
		newsItemParameters = new NewsItemParameters();
		errors = new BindException(newsItemParameters, "");
		
		editNewsItemController = new EditNewsItemController();
		editNewsItemController.setApplicationContext(this.mockApplicationContext);
		editNewsItemController.setNewsItemService(this.mockNewsItemService);
		editNewsItemController.setSuccessView(SUCCESS);
		
		newsItemParameters.setTitle(TITLE);
		newsItemParameters.setNews(NEWS);
		
		newsItem = new NewsItemImpl();
		newsItem.setTitle(TITLE);
		newsItem.setNews(NEWS);
		
		request.setSession(mockSession);
	}
	
	/**
	 * Test the formbackingobject for editing a News Item
	 */
	public void testFormBackingObject()throws Exception{
		request.setParameter("newsId", ID.toString());
		newsItem.setId(ID);
		
		EasyMock.expect(this.mockNewsItemService.retrieveById(ID)).andReturn(newsItem);
		EasyMock.replay(this.mockNewsItemService);
		Object returned = this.editNewsItemController.formBackingObject(request);
		assertTrue(returned instanceof NewsItemParameters);
		
		NewsItemParameters returnedParams = (NewsItemParameters) returned;
		assertEquals(returnedParams.getId(), ID);
		assertEquals(returnedParams.getNews(), newsItem.getNews());
		assertEquals(returnedParams.getTitle(), newsItem.getTitle());
	}
	
	/**
	 * Test the onSubmit for editing a News Item
	 */
	public void testOnSubmit()throws Exception{
		Long id = new Long(3);
		newsItemParameters.setId(id);
				
		EasyMock.expect(this.mockNewsItemService.updateNewsItem(id, 
				newsItemParameters)).andReturn(newsItem);
		EasyMock.replay(this.mockNewsItemService);
		
		ModelAndView mav = editNewsItemController.onSubmit(request, response, newsItemParameters, errors);
		assertEquals(SUCCESS, mav.getViewName());
	
		EasyMock.verify(this.mockNewsItemService);
	}
	
	/**
	 * @see junit.framework.TestCase#tearDown()
	 */
	@After
	public void tearDown(){
		this.newsItem = null;
		this.newsItemParameters = null;
		this.mockNewsItemService = null;
		this.mockApplicationContext = null;
		this.editNewsItemController = null;
		request = null;
		response = null;
	}
}
