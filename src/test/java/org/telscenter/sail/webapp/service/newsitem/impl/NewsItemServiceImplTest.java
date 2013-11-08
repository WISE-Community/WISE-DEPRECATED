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

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Set;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;

import org.easymock.EasyMock;
import org.telscenter.sail.webapp.dao.newsitem.NewsItemDao;
import org.telscenter.sail.webapp.domain.impl.NewsItemParameters;
import org.telscenter.sail.webapp.domain.newsitem.NewsItem;
import org.telscenter.sail.webapp.domain.newsitem.impl.NewsItemImpl;

import junit.framework.TestCase;

/**
 * Test class for NewsItemServiceImpl class
 * 
 * @author patrick lawler
 */
public class NewsItemServiceImplTest extends TestCase {

	private NewsItemDao<NewsItem> mockNewsItemDao;
	
	private NewsItemServiceImpl newsItemServiceImpl;
	
	private NewsItemParameters newsItemParameters1;
	
	private NewsItemParameters newsItemParameters2;
	
	private NewsItem newsItem1;
	
	private NewsItem newsItem2;
	
	private Date date1 = Calendar.getInstance().getTime();
	
	private Date date2 = Calendar.getInstance().getTime();
	
	private static final String NEWS_1 = "Hot off the presses!";
	
	private static final String NEWS_2 = "<html><body>Web News Here</body></html>";
	
	private static final User OWNER_1 = new UserImpl();
	
	private static final User OWNER_2 = new UserImpl();
	
	private static final String TITLE_1 = "yesterday";
	
	private static final String TITLE_2 = "today";
	
    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpInTransaction()
     */
    @SuppressWarnings("unchecked")
    @Override
    protected void setUp() throws Exception {
        super.setUp();

        this.newsItemServiceImpl = new NewsItemServiceImpl();
        this.mockNewsItemDao = EasyMock.createMock(NewsItemDao.class);
        this.newsItemServiceImpl.setNewsItemDao(mockNewsItemDao);
        
        newsItemParameters1 = new NewsItemParameters();
        date1.setDate(1);
        //date1 = Calendar.getInstance().getTime();
        newsItemParameters1.setDate(date1);
        newsItemParameters1.setNews(NEWS_1);
        newsItemParameters1.setOwner(OWNER_1);
        newsItemParameters1.setTitle(TITLE_1);
        
        newsItem1 = new NewsItemImpl();
        newsItem1.setDate(date1);
        newsItem1.setNews(NEWS_1);
        newsItem1.setOwner(OWNER_1);
        newsItem1.setTitle(TITLE_1);
        
        newsItemParameters2 = new NewsItemParameters();
        date2.setDate(9);
        //date2 = Calendar.getInstance().getTime();
        newsItemParameters2.setDate(date2);
        newsItemParameters2.setNews(NEWS_2);
        newsItemParameters2.setOwner(OWNER_2);
        newsItemParameters2.setTitle(TITLE_2);
        
        
        newsItem2 = new NewsItemImpl();
        newsItem2.setDate(date2);
        newsItem2.setNews(NEWS_2);
        newsItem2.setOwner(OWNER_2);
        newsItem2.setTitle(TITLE_2);
    }
    
    @Override
    protected void tearDown() throws Exception{
    	newsItem1 = null;
    	newsItem2 = null;
    	newsItemParameters1 = null;
    	newsItemParameters2 = null;
    	newsItemServiceImpl.setNewsItemDao(null);
    	mockNewsItemDao = null;
    	newsItemServiceImpl = null;
    }
    
    
    /**
     * Tests the creation of a NewsItem given the
     * NewsItemParameters
     */
    public void testCreateNewsItem(){
    	
    	// test creation of NewsItem with simple string
    	this.mockNewsItemDao.save(EasyMock.isA(NewsItem.class));
    	EasyMock.expectLastCall();
    	EasyMock.replay(mockNewsItemDao);
    	
    	NewsItem newsItem = newsItemServiceImpl.createNewsItem(newsItemParameters1);
    	assertNotNull(newsItem.getNews());
    	assertNotNull(newsItem.getDate());
    	assertNotNull(newsItem.getOwner());
    	assertNotNull(newsItem.getTitle());
    	assertEquals(newsItem.getDate(), date1);
    	assertEquals(newsItem.getNews(), NEWS_1);
    	assertEquals(newsItem.getOwner(), OWNER_1);
    	assertEquals(newsItem.getTitle(), TITLE_1);
    	
    	EasyMock.verify(mockNewsItemDao);
    }
    
    public void testCreateNewsItemFormatted(){
    	
    	//test creation of NewsItem with html formatted string
    	this.mockNewsItemDao.save(EasyMock.isA(NewsItem.class));
    	EasyMock.expectLastCall();
    	EasyMock.replay(mockNewsItemDao);
    	
    	NewsItem newsItem = newsItemServiceImpl.createNewsItem(newsItemParameters2);
    	assertEquals(newsItem.getDate(), date2);
    	assertEquals(newsItem.getNews(), NEWS_2);
    	assertEquals(newsItem.getOwner(), OWNER_2);
    	assertEquals(newsItem.getTitle(), TITLE_2);
    	EasyMock.verify(mockNewsItemDao);
    }
    
    /**
     * test the deletion of a NewsItem
     */
    public void testDeleteNewsItem() throws Exception{
    	Long id = new Long(3);
    	this.newsItem1.setId(id);
    	
    	EasyMock.expect(this.mockNewsItemDao.getById(id)).andReturn(this.newsItem1);
    	this.mockNewsItemDao.delete(this.newsItem1);
    	EasyMock.expectLastCall();
    	EasyMock.replay(this.mockNewsItemDao);
    	
    	this.newsItemServiceImpl.deleteNewsItem(id);

    	assertTrue(true);
    	EasyMock.verify(this.mockNewsItemDao);
    }
    
    /**
     * Test the retrieval of all News Items from the data store
     */
    public void testRetrieveAllNewsItem(){
    	List<NewsItem> returnedList = new ArrayList<NewsItem>();
    	returnedList.add(newsItem1);
    	returnedList.add(newsItem2);
    	EasyMock.expect(this.mockNewsItemDao.getList()).andReturn(returnedList);
    	EasyMock.replay(this.mockNewsItemDao);

    	Set<NewsItem> newsItemSet = this.newsItemServiceImpl.retrieveAllNewsItem();
    	assertNotNull(newsItemSet);
    	assertEquals(newsItemSet.size(), 2);
    	assertTrue(newsItemSet.contains(newsItem2));
    	assertTrue(newsItemSet.contains(newsItem1));
    	EasyMock.verify();
    }
    
    /**
     * Tests the retrieval of a single News Item given an id
     * @throws Exception
     */
    public void testRetrieveById()throws Exception{
    	NewsItem newsItem = new NewsItemImpl();
    	NewsItem retrievedNewsItem = null;
    	Long id = new Long(3);
    	
    	// test retrieve by id
    	EasyMock.expect(this.mockNewsItemDao.getById(id)).andReturn(newsItem);
    	EasyMock.replay(this.mockNewsItemDao);
    	retrievedNewsItem = this.newsItemServiceImpl.retrieveById(id);
    	assertNotNull(retrievedNewsItem);
    	assertEquals(newsItem, retrievedNewsItem);
    	EasyMock.verify(this.mockNewsItemDao);
    	
    	EasyMock.reset(this.mockNewsItemDao);
    	retrievedNewsItem = null;
    	
    	
    	// test objectnotfound, should throw exception
    	EasyMock.expect(this.mockNewsItemDao.getById(id)).andThrow(new ObjectNotFoundException(id, NewsItem.class));
    	EasyMock.replay(this.mockNewsItemDao);
    	
    	try{
    		retrievedNewsItem = this.newsItemServiceImpl.retrieveById(id);
    		fail("ObjectNotFoundException not thrown but should have been thrown");
    	} catch (ObjectNotFoundException e){}
    	
    	assertNull(retrievedNewsItem);
    	EasyMock.verify(this.mockNewsItemDao);
    }
    
    /**
     * Tests the updating of a news item given the id and the
     * new News Item Parameters
     * @throws Exception
     */
    public void testUpdateNewsItem() throws Exception {
    	Long id = new Long(3);
    	NewsItem updatedNewsItem = null;
    	
    	EasyMock.expect(this.mockNewsItemDao.getById(id)).andReturn(this.newsItem1);
    	this.mockNewsItemDao.save(EasyMock.isA(NewsItem.class));
    	EasyMock.expectLastCall();
    	EasyMock.replay(this.mockNewsItemDao);
    	updatedNewsItem = this.newsItemServiceImpl.updateNewsItem(id, this.newsItemParameters2);    	

    	assertNotNull(updatedNewsItem);
    	assertEquals(this.newsItem2.getDate(), updatedNewsItem.getDate());
    	assertEquals(this.newsItem2.getNews(), updatedNewsItem.getNews());
    	assertEquals(this.newsItem2.getOwner(), updatedNewsItem.getOwner());
    	assertEquals(this.newsItem2.getTitle(), updatedNewsItem.getTitle());
    	
    	EasyMock.verify(this.mockNewsItemDao);
    }
    
}
