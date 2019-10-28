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

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import junit.framework.TestCase;

import org.easymock.EasyMock;
import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.newsitem.NewsItemDao;
import org.wise.portal.domain.newsitem.NewsItem;
import org.wise.portal.domain.newsitem.impl.NewsItemImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.service.newsitem.NewsItemService;

/**
 * @author Patrick Lawler
 */
@RunWith(EasyMockRunner.class)
public class NewsItemServiceImplTest extends TestCase {

  @TestSubject
	private NewsItemService newsItemServiceImpl = new NewsItemServiceImpl();

  @Mock
	private NewsItemDao<NewsItem> newsItemDao;

	private NewsItem newsItem1;

	private NewsItem newsItem2;

	private Date date1 = Calendar.getInstance().getTime();

  private Date date2 = Calendar.getInstance().getTime();

  private Integer itemIdNotInDB = new Integer(-1);

  private String news1 = "Hot off the presses!";

  private String news2 = "<html><body>Web News Here</body></html>";

  private String type1 = "public";

  private String type2 = "teacherOnly";

	private User owner1 = new UserImpl();

	private User owner2 = new UserImpl();

	private String title1 = "yesterday";

	private String title2 = "today";

  @Before
  public void setUp() throws Exception {
    super.setUp();

    newsItem1 = new NewsItemImpl();
    newsItem1.setDate(date1);
    newsItem1.setNews(news1);
    newsItem1.setOwner(owner1);
    newsItem1.setTitle(title1);

    newsItem2 = new NewsItemImpl();
    newsItem2.setDate(date2);
    newsItem2.setNews(news2);
    newsItem2.setOwner(owner2);
    newsItem2.setTitle(title2);
  }

  @After
  public void tearDown() throws Exception{
    newsItem1 = null;
    newsItem2 = null;
    newsItemDao = null;
    newsItemServiceImpl = null;
  }

  @Test
  public void createNewsItem_ValidArgs_Success() {
    newsItemDao.save(EasyMock.isA(NewsItem.class));
    EasyMock.expectLastCall();
    EasyMock.replay(newsItemDao);

    NewsItem newsItem = newsItemServiceImpl.createNewsItem(date1, owner1, title1, news1, type1);
    assertEquals(newsItem.getDate(), date1);
    assertEquals(newsItem.getNews(), news1);
    assertEquals(newsItem.getOwner(), owner1);
    assertEquals(newsItem.getTitle(), title1);
    assertEquals(newsItem.getType(), type1);
    EasyMock.verify(newsItemDao);
  }

  @Test
  public void deleteNewsItem_NewsItemIDExists_Success() throws Exception {
    Integer id = new Integer(3);
    newsItem1.setId(id);
    EasyMock.expect(newsItemDao.getById(id)).andReturn(newsItem1);
    newsItemDao.delete(newsItem1);
    EasyMock.expectLastCall();
    EasyMock.replay(newsItemDao);

    newsItemServiceImpl.deleteNewsItem(id);
    EasyMock.verify(newsItemDao);
  }

  @Test
  public void deleteNewsItem_NewsItemIDInvalid_ThrowsException()
      throws ObjectNotFoundException {
    newsItem1.setId(itemIdNotInDB);
    EasyMock.expect(newsItemDao.getById(itemIdNotInDB)).andThrow(
        new ObjectNotFoundException(itemIdNotInDB, NewsItemImpl.class));
    EasyMock.replay(newsItemDao);

    try {
      newsItemServiceImpl.deleteNewsItem(itemIdNotInDB);
      fail("ObjectNotFoundException not thrown but should have been thrown");
    } catch (ObjectNotFoundException e) {
    }
    EasyMock.verify(newsItemDao);
  }

  @Test
  public void retrieveAllNewsItem_TwoNewsItemsInDB_Success() {
    List<NewsItem> newsItemsInDB = new ArrayList<NewsItem>();
    newsItemsInDB.add(newsItem1);
    newsItemsInDB.add(newsItem2);
    EasyMock.expect(newsItemDao.getList()).andReturn(newsItemsInDB);
    EasyMock.replay(newsItemDao);

    List<NewsItem> newsItemsFromDB = newsItemServiceImpl.retrieveAllNewsItem();
    assertEquals(newsItemsFromDB.size(), 2);
    assertTrue(newsItemsFromDB.get(0).equals(newsItem1));
    assertTrue(newsItemsFromDB.get(1).equals(newsItem2));
    EasyMock.verify(newsItemDao);
  }

  @Test
  public void retrieveById_ValidItemId_Success() throws ObjectNotFoundException {
    Integer id = new Integer(3);
    EasyMock.expect(newsItemDao.getById(id)).andReturn(newsItem1);
    EasyMock.replay(newsItemDao);

    NewsItem retrievedNewsItem = newsItemServiceImpl.retrieveById(id);
    assertNotNull(retrievedNewsItem);
    assertEquals(newsItem1, retrievedNewsItem);
    EasyMock.verify(newsItemDao);
  }

  @Test
  public void retrieveById_InvalidItemID_ThrowException() throws ObjectNotFoundException {
    EasyMock.expect(newsItemDao.getById(itemIdNotInDB)).andThrow(
        new ObjectNotFoundException(itemIdNotInDB, NewsItem.class));
    EasyMock.replay(newsItemDao);

    try {
      this.newsItemServiceImpl.retrieveById(itemIdNotInDB);
      fail("ObjectNotFoundException not thrown but should have been thrown");
    } catch (ObjectNotFoundException e) {
    }
    EasyMock.verify(newsItemDao);
  }

  @Test
  public void updateNewsItem_ValidArgs_Success() throws Exception {
    Integer id = new Integer(3);
    EasyMock.expect(newsItemDao.getById(id)).andReturn(newsItem1);
    newsItemDao.save(EasyMock.isA(NewsItem.class));
    EasyMock.expectLastCall();
    EasyMock.replay(newsItemDao);

    newsItemServiceImpl.updateNewsItem(id, date2, owner2, title2, news2, type2);
    EasyMock.verify(newsItemDao);
  }

  @Test
  public void updateNewsItem_InvalidItemID_ThrowException() throws Exception {
    EasyMock.expect(newsItemDao.getById(itemIdNotInDB)).andThrow(
        new ObjectNotFoundException(itemIdNotInDB, NewsItem.class));
    EasyMock.replay(newsItemDao);

    try {
      newsItemServiceImpl.updateNewsItem(itemIdNotInDB, date2, owner2, title2, news2, type2);
      fail("ObjectNotFoundException not thrown but should have been thrown");
    } catch (ObjectNotFoundException e) {
    }
    EasyMock.verify(newsItemDao);
  }
}
