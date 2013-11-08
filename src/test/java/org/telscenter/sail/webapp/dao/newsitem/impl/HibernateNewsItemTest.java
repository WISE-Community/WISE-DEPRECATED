/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
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
package org.telscenter.sail.webapp.dao.newsitem.impl;

import java.util.Date;
import java.util.Calendar;
import java.util.List;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.domain.authentication.impl.PersistentUserDetails;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.domain.sds.SdsUser;

import org.hibernate.Session;
import org.telscenter.sail.webapp.domain.newsitem.NewsItem;
import org.telscenter.sail.webapp.domain.newsitem.impl.NewsItemImpl;
import org.telscenter.sail.webapp.junit.AbstractTransactionalDbTests;

/**
 * @author patrick lawler
 *
 */
public class HibernateNewsItemTest extends AbstractTransactionalDbTests {

	private final static Date DATE = Calendar.getInstance().getTime();
	
	private final static String STRING_BLOB = "oh my, the sky is falling";
	
	private final static String HTML_STRING = "<html><body>Web News</body></html>";
	
	private final static User OWNER = new UserImpl();
	
    private static final String DEFAULT_NAME = "Airbags";

    private static final Long SDS_ID = new Long(7);
    
	private static final SdsUser DEFAULT_SDS_USER = new SdsUser();

	private static final MutableUserDetails DEFAULT_USER_DETAILS = new PersistentUserDetails();
	
	private final static String TITLE = "today's headlines";
	
	private HibernateNewsItemDao hibernateDao;
	
	private NewsItem defaultNewsItem;
	
    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpBeforeTransaction()
     */
    @Override
    protected void onSetUpBeforeTransaction() throws Exception {
        super.onSetUpBeforeTransaction();

		defaultNewsItem = new NewsItemImpl();
		defaultNewsItem.setDate(DATE);
		defaultNewsItem.setNews(STRING_BLOB);
		DEFAULT_SDS_USER.setSdsObjectId(SDS_ID);
        DEFAULT_SDS_USER.setFirstName(DEFAULT_NAME);
        DEFAULT_SDS_USER.setLastName(DEFAULT_NAME);
        
        DEFAULT_USER_DETAILS.setPassword(DEFAULT_NAME);
        DEFAULT_USER_DETAILS.setUsername(DEFAULT_NAME);
        OWNER.setUserDetails(DEFAULT_USER_DETAILS);
        OWNER.setSdsUser(DEFAULT_SDS_USER);
    }
    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpInTransaction()
     */
    @Override
    protected void onSetUpInTransaction() throws Exception {
        super.onSetUpInTransaction();
        Session session = this.sessionFactory.getCurrentSession();
        session.save(DEFAULT_SDS_USER);
        session.save(DEFAULT_USER_DETAILS);
        session.save(OWNER);  // save owner
		defaultNewsItem.setOwner(OWNER);
		defaultNewsItem.setTitle(TITLE);
    }
    
    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onTearDownAfterTransaction()
     */
    @Override
    protected void onTearDownAfterTransaction() throws Exception {
        super.onTearDownAfterTransaction();
        this.defaultNewsItem = null;
    }

    public void testSave(){
    	assertNotNull(defaultNewsItem);
		hibernateDao.save(defaultNewsItem);
	
		List<?> thisList = hibernateDao.getList();
		assertEquals(1, thisList.size());
		assertEquals(thisList.get(0), defaultNewsItem);
    }
    
	public void testGetById() throws Exception{
		this.hibernateDao.save(this.defaultNewsItem);

        assertNotNull(this.hibernateDao.getById(this.defaultNewsItem.getId()));
	}
	
	public void testSaveWithoutNews(){
		defaultNewsItem.setNews(null);
        try {
        	this.hibernateDao.save(this.defaultNewsItem);
        	fail("Exception expected to be thrown but was not");
        } catch (Exception e) {
        }
	}
	
	public void testSaveWithoutDate(){
		defaultNewsItem.setDate(null);
        try {
        	this.hibernateDao.save(this.defaultNewsItem);
        	fail("Exception expected to be thrown but was not");
        } catch (Exception e) {
        }
	}
	
	public void testSaveWithoutOwner(){
		defaultNewsItem.setOwner(null);
        try {
        	this.hibernateDao.save(this.defaultNewsItem);
        	fail("Exception expected to be thrown but was not");
        } catch (Exception e) {
        }
	}
	
	public void testSaveWithoutTitle(){
		defaultNewsItem.setTitle(null);
        try {
        	this.hibernateDao.save(this.defaultNewsItem);
        	fail("Exception expected to be thrown but was not");
        } catch (Exception e) {
        }
	}
	
	public void testSaveWithHTMLString(){
		defaultNewsItem.setNews(HTML_STRING);
		this.hibernateDao.save(defaultNewsItem);
		
		List<?> thisList = this.hibernateDao.getList();
		assertEquals(1, thisList.size());
		assertEquals(thisList.get(0), defaultNewsItem);
	}
    
	/**
	 * @return the hibernateDao
	 */
	public HibernateNewsItemDao getHibernateDao() {
		return hibernateDao;
	}

	/**
	 * @param hibernateDao the hibernateDao to set
	 */
	public void setHibernateDao(HibernateNewsItemDao hibernateDao) {
		this.hibernateDao = hibernateDao;
	}
	
}
