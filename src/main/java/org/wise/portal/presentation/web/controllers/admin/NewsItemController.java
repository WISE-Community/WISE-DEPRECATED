/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3.
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
package org.wise.portal.presentation.web.controllers.admin;

import java.util.Calendar;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.wise.portal.domain.newsitem.NewsItem;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.newsitem.NewsItemService;

/**
 * @author Hiroki Terashima
 * @author Patrick Lawler
 * @version $Id:$
 */
public class NewsItemController extends AbstractController {

	private NewsItemService newsItemService;
	
	protected final static String ALL_NEWS = "all_news";

	protected final static String ACTION = "action";

	protected final static String NEWS_ITEM = "newsItem";

	protected final static String NEWS_ITEM_ID = "newsItemId";

	protected final static String NEWS = "news";

	protected final static String TITLE = "title";

	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		String action = request.getParameter(ACTION);
		String newsItemId = request.getParameter(NEWS_ITEM_ID);

		if (request.getMethod().equals(METHOD_GET)) {
			ModelAndView modelAndView = new ModelAndView();
			// handle GET requests
			if ("edit".equals(action)) {
		        NewsItem newsItem = newsItemService.retrieveById(Long.parseLong(newsItemId));
				modelAndView.addObject(NEWS_ITEM, newsItem);
			} else if ("add".equals(action)) {
				// do nothing, just return add news item page
			} else {
				modelAndView.addObject(ALL_NEWS, newsItemService.retrieveAllNewsItem());
			}
			return modelAndView;
		} else {
			// handle POST requests
			if ("remove".equals(action)) {
		    	newsItemService.deleteNewsItem(Long.parseLong(newsItemId));
		    	response.getWriter().print("success");
			} else if ("edit".equals(action)) {
		        NewsItem newsItem = newsItemService.retrieveById(Long.parseLong(newsItemId));
		        String title = request.getParameter(TITLE);
		        String news = request.getParameter(NEWS);

				newsItemService.updateNewsItem(newsItem.getId(), newsItem.getDate(), newsItem.getOwner(), title, news);
				ModelAndView modelAndView = new ModelAndView("admin/news/success");
				return modelAndView;
			} else if ("add".equals(action)) {
		        String title = request.getParameter(TITLE);
		        String news = request.getParameter(NEWS);
				newsItemService.createNewsItem(Calendar.getInstance().getTime(), ControllerUtil.getSignedInUser(), title, news);
				
				ModelAndView modelAndView = new ModelAndView("admin/news/success");
				return modelAndView;
			}
		}
		
		
		return null;
	}

	/**
	 * @param newsItemService the newsItemService to set
	 */
	public void setNewsItemService(NewsItemService newsItemService) {
		this.newsItemService = newsItemService;
	}

}
