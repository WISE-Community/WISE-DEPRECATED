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
package org.wise.portal.service.newsitem.impl;

import java.util.Date;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.newsitem.NewsItemDao;
import org.wise.portal.domain.newsitem.NewsItem;
import org.wise.portal.domain.newsitem.impl.NewsItemImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.newsitem.NewsItemService;

/**
 * @author patrick lawler
 *
 */
@Transactional(readOnly = true)
public class NewsItemServiceImpl implements NewsItemService{

	private NewsItemDao<NewsItem> newsItemDao;
	
	@Transactional()
	public NewsItem createNewsItem(Date date, User owner, String title, String news){
		NewsItem newsItem = new NewsItemImpl();
		newsItem.setDate(date);
		newsItem.setOwner(owner);
		newsItem.setTitle(title);
		newsItem.setNews(news);
		
		newsItemDao.save(newsItem);
		return newsItem;
	}
	
	public List<NewsItem> retrieveAllNewsItem(){
		return newsItemDao.getList();
	}

	public NewsItem retrieveById(Long id) throws ObjectNotFoundException{
		try{
			return newsItemDao.getById(id);
		} catch (ObjectNotFoundException e){
			throw e;
		}
	}
	
	@Transactional()
	public void updateNewsItem(Long id, Date date, User owner, String title, String news) 
			throws ObjectNotFoundException {
		try{
			NewsItem newsItem = newsItemDao.getById(id);
			newsItem.setDate(date);
			newsItem.setOwner(owner);
			newsItem.setTitle(title);
			newsItem.setNews(news);
			newsItemDao.save(newsItem);
		} catch(ObjectNotFoundException e){
			throw e;
		}	
	}
	
	@Transactional()
	public void deleteNewsItem(Long newsItemId){
		try{
			NewsItem newsItem = newsItemDao.getById(newsItemId);
			newsItemDao.delete(newsItem);
		}catch(ObjectNotFoundException e){
		}
	}
	
	/**
	 * @param newsItemDao the newsItemDao to set
	 */
	public void setNewsItemDao(NewsItemDao<NewsItem> newsItemDao) {
		this.newsItemDao = newsItemDao;
	}

}
