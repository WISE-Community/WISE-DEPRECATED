/**
 * Copyright (c) 2007-2015 Regents of the University of California (Regents).
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
package org.wise.portal.service.newsitem.impl;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.newsitem.NewsItemDao;
import org.wise.portal.domain.newsitem.NewsItem;
import org.wise.portal.domain.newsitem.impl.NewsItemImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.newsitem.NewsItemService;

/**
 * @author Patrick Lawler
 */
@Service
public class NewsItemServiceImpl implements NewsItemService{

	@Autowired
	private NewsItemDao<NewsItem> newsItemDao;

	@Cacheable(value = "news")
	public List<NewsItem> retrieveAllNewsItem(){
		return newsItemDao.getList();
	}

	@Cacheable(value = "news")
	public List<NewsItem> retrieveByType(String type){
		return newsItemDao.getListByType(type);
	}

	public NewsItem retrieveById(Long id) throws ObjectNotFoundException{
		try {
			return newsItemDao.getById(id);
		} catch (ObjectNotFoundException e){
			throw e;
		}
	}
	
	@CacheEvict(value = "news", allEntries = true)
	@Transactional
	public NewsItem createNewsItem(Date date, User owner, String title, String news, String type){
		NewsItem newsItem = new NewsItemImpl();
		newsItem.setDate(date);
		newsItem.setOwner(owner);
		newsItem.setTitle(title);
		newsItem.setNews(news);
		newsItem.setType(type);
		
		newsItemDao.save(newsItem);
		return newsItem;
	}
	
	@CacheEvict(value = "news", allEntries = true)
	@Transactional
	public void updateNewsItem(Long id, Date date, User owner, String title, String news, String type) 
			throws ObjectNotFoundException {
		try {
			NewsItem newsItem = newsItemDao.getById(id);
			newsItem.setDate(date);
			newsItem.setOwner(owner);
			newsItem.setTitle(title);
			newsItem.setNews(news);
			newsItem.setType(type);
			newsItemDao.save(newsItem);
		} catch(ObjectNotFoundException e) {
			throw e;
		}	
	}
	
	@CacheEvict(value = "news", allEntries = true)
	@Transactional
	public void deleteNewsItem(Long newsItemId) {
		try {
			NewsItem newsItem = newsItemDao.getById(newsItemId);
			newsItemDao.delete(newsItem);
		} catch(ObjectNotFoundException e) {
		}
	}
}
