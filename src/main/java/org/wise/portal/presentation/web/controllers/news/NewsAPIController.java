package org.wise.portal.presentation.web.controllers.news;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.newsitem.NewsItem;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.newsitem.NewsItemService;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/site/api/news")
public class NewsAPIController {

  @Autowired
  private NewsItemService newsItemService;

  @RequestMapping(value = "", method = RequestMethod.GET)
  protected String getNews(ModelMap modelMap, HttpServletRequest request) throws JSONException {
    List<NewsItem> newsItems = newsItemService.retrieveAllNewsItem();
    JSONArray newsItemsJSON = getNewsItemsJSON(newsItems);
    return newsItemsJSON.toString();
  }

  private JSONArray getNewsItemsJSON(List<NewsItem> newsItems) {
    JSONArray newsItemsJSON = new JSONArray();
    for (NewsItem newsItem: newsItems) {
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
      newsItemJSON.put("owner", getOwnerJSON(newsItem.getOwner()));
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return newsItemJSON;
  }

  private JSONObject getOwnerJSON(User user) {
    JSONObject ownerJSON = new JSONObject();
    try {
      ownerJSON.put("id", user.getId());
      MutableUserDetails userDetails = user.getUserDetails();
      ownerJSON.put("firstName", userDetails.getFirstname());
      ownerJSON.put("lastName", userDetails.getLastname());
      ownerJSON.put("displayName", ((TeacherUserDetails) userDetails).getDisplayname());
    } catch(JSONException e) {
      e.printStackTrace();
    }
    return ownerJSON;
  }
}
