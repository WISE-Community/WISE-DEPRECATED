/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
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
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
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

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.wise.portal.domain.newsitem.NewsItem;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.newsitem.NewsItemService;

/**
 * @author Hiroki Terashima
 * @author Patrick Lawler
 */
@Controller
@RequestMapping(value = {
  "/admin/news/managenewsitems.html",
  "/admin/news/addnewsitems.html",
  "/admin/news/editnewsitem.html"})
public class NewsItemController {

  @Autowired
  private NewsItemService newsItemService;

  protected final static String ALL_NEWS = "all_news";

  protected final static String ACTION = "action";

  protected final static String NEWS_ITEM = "newsItem";

  protected final static String NEWS_ITEM_ID = "newsItemId";

  protected final static String NEWS = "news";

  protected final static String TITLE = "title";

  protected final static String TYPE = "type";

  @RequestMapping(method = RequestMethod.GET)
  protected String handleGET(HttpServletRequest request, ModelMap modelMap) throws Exception {
    String action = request.getParameter(ACTION);
    String newsItemId = request.getParameter(NEWS_ITEM_ID);

    if ("edit".equals(action)) {
      modelMap.put(NEWS_ITEM, newsItemService.retrieveById(Integer.parseInt(newsItemId)));
      return "admin/news/editnewsitem";
    } else if ("add".equals(action)) {
      // do nothing, just return add news item page
      return "admin/news/addnewsitems";
    } else {
      // return list all all news to managenewsitems page
      modelMap.put(ALL_NEWS, newsItemService.retrieveAllNewsItem());
      return "admin/news/managenewsitems";
    }
  }

  @RequestMapping(method = RequestMethod.POST)
  protected String handlePOST(HttpServletRequest request,
      HttpServletResponse response) throws Exception {
    String action = request.getParameter(ACTION);
    String newsItemId = request.getParameter(NEWS_ITEM_ID);

    if ("remove".equals(action)) {
      newsItemService.deleteNewsItem(Integer.parseInt(newsItemId));
      response.getWriter().print("success");
      return null;
    } else if ("edit".equals(action)) {
      NewsItem newsItem = newsItemService.retrieveById(Integer.parseInt(newsItemId));
      String title = request.getParameter(TITLE);
      String news = request.getParameter(NEWS);
      String type = request.getParameter(TYPE);
      newsItemService.updateNewsItem(newsItem.getId(), newsItem.getDate(), newsItem.getOwner(), title, news, type);
      return "admin/news/success";
    } else if ("add".equals(action)) {
      String title = request.getParameter(TITLE);
      String news = request.getParameter(NEWS);
      String type = request.getParameter(TYPE);
      newsItemService.createNewsItem(Calendar.getInstance().getTime(), ControllerUtil.getSignedInUser(), title, news, type);
      return "admin/news/success";
    }
    return null;
  }
}
