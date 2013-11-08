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
package org.telscenter.sail.webapp.domain.newsitem.impl;

import java.util.Calendar;
import java.util.Date;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;

import org.telscenter.sail.webapp.domain.newsitem.NewsItem;

import junit.framework.TestCase;

/**
 * @author patrick lawler
 *
 */
public class NewsItemImplTest extends TestCase{

	private Date date;
	
	private String news;
	
	private NewsItem newsItem;
	
	private String title;
	
	private User owner;
	
	@Override
	protected void setUp() {
		date = Calendar.getInstance().getTime();
		news = "Hey there, how's it going!";
		owner = new UserImpl();
		title = "today's headlines";
		newsItem = new NewsItemImpl();
		
		newsItem.setDate(date);
		newsItem.setNews(news);
		newsItem.setOwner(owner);
		newsItem.setTitle(title);
	}
	
	@Override
	protected void tearDown() {
		date = null;
		news = null;
		newsItem = null;
	}
	
	public void testNewsItem(){
		assertEquals(newsItem.getDate(), date);
		assertEquals(newsItem.getNews(), news);
		assertEquals(newsItem.getOwner(), owner);
		assertEquals(newsItem.getTitle(), title);
	}
}
