/**
 * Copyright (c) 2008-2018 Regents of the University of California (Regents).
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.wise.portal.domain.newsitem.NewsItem;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.newsitem.NewsItemService;

/**
 * @author Hiroki Terashima
 * @author Patrick Lawler
 */
@Controller
@RequestMapping("/admin/news")
public class NewsItemController {

  @Autowired
  private NewsItemService newsItemService;

  @RequestMapping(method = RequestMethod.GET, value="/manage")
  protected String showAllNews(ModelMap modelMap) throws Exception {
    modelMap.put("allNews", newsItemService.retrieveAllNewsItem());
    return "admin/news/managenewsitems";
  }

  @RequestMapping(method = RequestMethod.GET, value="/add")
  protected String showAddNews() throws Exception {
    return "admin/news/addnewsitem";
  }

  @RequestMapping(method = RequestMethod.GET, value="/edit/{newsItemId}")
  protected String showEditNews(ModelMap modelMap,
                                @PathVariable Integer newsItemId) throws Exception {
    modelMap.put("newsItem", newsItemService.retrieveById(newsItemId));
    return "admin/news/editnewsitem";
  }

  @RequestMapping(method = RequestMethod.POST, value="/add")
  protected String addNews(@RequestParam("title") String title,
                           @RequestParam("news") String news,
                           @RequestParam("type") String type) throws Exception {
    newsItemService.createNewsItem(
        Calendar.getInstance().getTime(), ControllerUtil.getSignedInUser(), title, news, type);
    return "admin/news/success";
  }

  @RequestMapping(method = RequestMethod.POST, value="/edit/{newsItemId}")
  protected String editNews(@PathVariable Integer newsItemId,
                            @RequestParam("title") String title,
                            @RequestParam("news") String news,
                            @RequestParam("type") String type) throws Exception {
    NewsItem newsItem = newsItemService.retrieveById(newsItemId);
    newsItemService.updateNewsItem(
        newsItem.getId(), newsItem.getDate(), newsItem.getOwner(), title, news, type);
    return "admin/news/success";
  }

  @RequestMapping(method = RequestMethod.POST, value="/delete/{newsItemId}")
  protected void deleteNews(@PathVariable Integer newsItemId,
                              HttpServletResponse response) throws Exception {
    newsItemService.deleteNewsItem(newsItemId);
    response.getWriter().print("success");
  }
}
