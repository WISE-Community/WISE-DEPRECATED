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
package org.telscenter.sail.webapp.service.newsitem.impl;

import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import net.sf.sail.webapp.dao.ObjectNotFoundException;

import org.springframework.transaction.annotation.Transactional;
import org.telscenter.sail.webapp.dao.newsitem.NewsItemDao;
import org.telscenter.sail.webapp.domain.impl.NewsItemParameters;
import org.telscenter.sail.webapp.domain.newsitem.NewsItem;
import org.telscenter.sail.webapp.domain.newsitem.impl.NewsItemImpl;
import org.telscenter.sail.webapp.service.newsitem.NewsItemService;

/**
 * @author patrick lawler
 *
 */
public class NewsItemServiceImpl implements NewsItemService{

	private NewsItemDao<NewsItem> newsItemDao;
	
	@Transactional()
	public NewsItem createNewsItem(NewsItemParameters params){
		NewsItem newsItem = new NewsItemImpl();
		newsItem.setDate(params.getDate());
		newsItem.setNews(params.getNews());
		newsItem.setOwner(params.getOwner());
		newsItem.setTitle(params.getTitle());
		
		newsItemDao.save(newsItem);
		return newsItem;
	}
	
	@Transactional()
	public void deleteNewsItem(Long newsItemId){
		try{
			NewsItem newsItem = newsItemDao.getById(newsItemId);
			newsItemDao.delete(newsItem);
		}catch(ObjectNotFoundException e){
		}
	}
	
	@Transactional()
	public Set<NewsItem> retrieveAllNewsItem(){
		TreeSet<NewsItem> allNews = new TreeSet<NewsItem>();
		List<NewsItem> newsList = newsItemDao.getList();
		
		allNews.addAll(newsList);
		return allNews;
	}

	@Transactional()
	public NewsItem updateNewsItem(Long id, NewsItemParameters params)
		throws ObjectNotFoundException{
		try{
			NewsItem newsItem = newsItemDao.getById(id);
			newsItem.setDate(params.getDate());
			newsItem.setOwner(params.getOwner());
			newsItem.setNews(params.getNews());
			newsItem.setTitle(params.getTitle());
			newsItemDao.save(newsItem);
			return newsItem;
		} catch(ObjectNotFoundException e){
			throw e;
		}
	}
	
	@Transactional()
	public NewsItem retrieveById(Long id) throws ObjectNotFoundException{
		try{
			return newsItemDao.getById(id);
		} catch (ObjectNotFoundException e){
			throw e;
		}
	}
	
	@Transactional()
	public NewsItem retrieveLatest() throws ObjectNotFoundException{
		Set<NewsItem> allNews = this.retrieveAllNewsItem();
		if(allNews.isEmpty())
			throw new ObjectNotFoundException(new Long(0), NewsItem.class);
		
		return allNews.iterator().next();
	}
	
	
	/**
	 * @param newsItemDao the newsItemDao to set
	 */
	public void setNewsItemDao(NewsItemDao<NewsItem> newsItemDao) {
		this.newsItemDao = newsItemDao;
	}
	

}
