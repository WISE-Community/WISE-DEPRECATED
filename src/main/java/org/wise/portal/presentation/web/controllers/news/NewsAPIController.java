package org.wise.portal.presentation.web.controllers.news;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.wise.portal.domain.newsitem.NewsItem;
import org.wise.portal.service.newsitem.NewsItemService;
import org.wise.portal.service.user.UserService;
import org.springframework.security.core.Authentication;
import org.wise.portal.domain.user.User;

import javassist.tools.rmi.ObjectNotFoundException;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping(value = "/api/news", produces = "application/json;charset=UTF-8")
public class NewsAPIController {

  @Autowired
  private UserService userService;

  @Autowired
  private NewsItemService newsItemService;

  @RequestMapping(value = "", method = RequestMethod.GET)
  protected String getNews() {
    List<NewsItem> newsItems = newsItemService.retrieveAllNewsItem();
    JSONArray newsItemsJSON = getNewsItemsJSON(newsItems);
    return newsItemsJSON.toString();
  }

  private JSONArray getNewsItemsJSON(List<NewsItem> newsItems) {
    JSONArray newsItemsJSON = new JSONArray();
    for (NewsItem newsItem : newsItems) {
      newsItemsJSON.put(getNewsItemJSON(newsItem));
    }
    return newsItemsJSON;
  }

  private JSONObject getNewsItemJSON(NewsItem newsItem) {
    JSONObject newsItemJSON = new JSONObject();
    try {
      newsItemJSON.put("id", newsItem.getId());
      newsItemJSON.put("date", newsItem.getDate());
      newsItemJSON.put("news", newsItem.getNews());
      newsItemJSON.put("title", newsItem.getTitle());
      newsItemJSON.put("type", newsItem.getType());
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return newsItemJSON;
  }

  @PostMapping("/create")
  @Secured({ "ROLE_ADMIN" })
  public String createNewsItem(Authentication auth, @RequestParam("date") Date date,
      @RequestParam("title") String title, @RequestParam("news") String news,
      @RequestParam("type") String type) {
    JSONObject response = new JSONObject();
    User user = userService.retrieveUserByUsername(auth.getName());
    try {
      if (user == null) {
        response.put("status", "error");
        response.put("message", "User not found");
        return response.toString();
      }
      response = getNewsItemJSON(newsItemService.createNewsItem(date, user, title, news, type));
      response.put("status", "success");
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return response.toString();
  }

  @PostMapping("/update")
  @Secured({ "ROLE_ADMIN" })
  public String updateNewsItem(Authentication auth, @RequestParam("id") Integer id,
      @RequestParam("date") Date date, @RequestParam("title") String title,
      @RequestParam("news") String news, @RequestParam("type") String type) {
    JSONObject response = new JSONObject();
    User user = userService.retrieveUserByUsername(auth.getName());
    try {
      if (user == null) {
        response.put("status", "error");
        response.put("message", "User not found");
        return response.toString();
      }
      newsItemService.updateNewsItem(id, date, user, title, news, type);
      response.put("status", "success");
    } catch (JSONException je) {
      je.printStackTrace();
    } catch (ObjectNotFoundException ne) {
      ne.printStackTrace();
    }
    return response.toString();
  }

  @DeleteMapping("/delete")
  @Secured({ "ROLE_ADMIN" })
  public String deleteNewsItem(@RequestParam("id") Integer id) {
    JSONObject response = new JSONObject();
    try {
      newsItemService.deleteNewsItem(id);
      response.put("status", "success");
    } catch (JSONException je) {
      je.printStackTrace();
    } catch (ObjectNotFoundException ne) {
      ne.printStackTrace();
    }
    return response.toString();
  }
}