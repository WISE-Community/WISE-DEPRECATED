package org.wise.portal.presentation.web.controllers.news;

import org.apache.commons.lang3.RandomStringUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.wise.portal.domain.newsitem.NewsItem;
import org.wise.portal.service.newsitem.NewsItemService;
import org.wise.portal.service.user.UserService;
import org.springframework.security.core.Authentication;
import org.wise.portal.domain.user.User;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;
import java.util.Properties;

@RestController
@RequestMapping(value = "/api/news", produces = "application/json;charset=UTF-8")
public class NewsAPIController {

  @Autowired
  private UserService userService;

  @Autowired
  private NewsItemService newsItemService;

  @Autowired
  private Properties appProperties;

  private final int newsUploadNameLength = 8;

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
  public String createNewsItem(Authentication auth,
      @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date date,
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
      JSONObject newsItem = getNewsItemJSON(
          newsItemService.createNewsItem(date, user, title, news, type));
      response.put("newsItem", newsItem);
      response.put("status", "success");
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return response.toString();
  }

  @PostMapping("/update")
  public String updateNewsItem(Authentication auth, @RequestParam("id") Integer id,
      @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date date,
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
      newsItemService.updateNewsItem(id, date, user, title, news, type);
      response.put("status", "success");
    } catch (Exception e) {
      e.printStackTrace();
    }
    return response.toString();
  }

  @DeleteMapping("/delete/{id}")
  public String deleteNewsItem(@PathVariable Integer id) {
    JSONObject response = new JSONObject();
    try {
      newsItemService.deleteNewsItem(id);
      response.put("status", "success");
    } catch (Exception e) {
      e.printStackTrace();
    }
    return response.toString();
  }

  @PostMapping("/news-upload/save")
  @ResponseBody
  protected String saveNewsUpload(Authentication auth, @RequestParam MultipartFile file) {
    User user = userService.retrieveUserByUsername(auth.getName());
    JSONObject response = new JSONObject();
    try {
      if (user.isAdmin()) {
        String newsUploadDirPath = appProperties.getProperty("news_uploads_base_dir");
        String originalFileName = file.getOriginalFilename();
        String fileExtension = originalFileName.substring(originalFileName.length() - 4);
        String fileName = RandomStringUtils.randomAlphabetic(newsUploadNameLength);
        fileName += fileExtension;
        response.put("filename", fileName);
        Path path = Paths.get(newsUploadDirPath, fileName);
        Files.write(path, file.getBytes());
        return response.toString();
      }
    } catch (JSONException jex) {
      // return null;
    } catch (IOException iex) {
      // return null;
    }
    return response.toString();
  }
}