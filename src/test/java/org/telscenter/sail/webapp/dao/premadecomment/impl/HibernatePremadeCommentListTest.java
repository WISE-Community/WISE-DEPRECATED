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
package org.telscenter.sail.webapp.dao.premadecomment.impl;

import java.util.Set;
import java.util.TreeSet;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;

import org.telscenter.sail.webapp.domain.premadecomment.PremadeComment;
import org.telscenter.sail.webapp.domain.premadecomment.impl.PremadeCommentImpl;
import org.telscenter.sail.webapp.domain.premadecomment.impl.PremadeCommentListImpl;
import org.telscenter.sail.webapp.junit.AbstractTransactionalDbTests;

/**
 * @author patrick lawler
 *
 */
public class HibernatePremadeCommentListTest extends AbstractTransactionalDbTests {

	private final static String GOOD_LABEL = "goodList";
	
	private final static String COMMENT_MSG_1 = "comment1";
	
	private final static String COMMENT_MSG_2 = "comment2";
	
	private User goodCommentOwner = new UserImpl();
	
	private User goodListOwner = new UserImpl();
	
	private PremadeCommentListImpl defaultPremadeCommentList = new PremadeCommentListImpl();
	
	private HibernatePremadeCommentDao premadeCommentDao;
	
	private HibernatePremadeCommentListDao thisListDao;
	
	private PremadeComment premadeComment1;
	
	private PremadeComment premadeComment2;
	
	private Set<PremadeComment> thisList;
	
    @Override
    protected void onSetUpBeforeTransaction() throws Exception {
        super.onSetUpBeforeTransaction();

		defaultPremadeCommentList.setLabel(GOOD_LABEL);
		defaultPremadeCommentList.setOwner(goodListOwner);
		
		thisList = new TreeSet<PremadeComment>();
		
		premadeComment1 = new PremadeCommentImpl();
		premadeComment1.setComment(COMMENT_MSG_1);
		premadeComment1.setOwner(goodCommentOwner);
		
		premadeComment2 = new PremadeCommentImpl();
		premadeComment2.setComment(COMMENT_MSG_2);
		premadeComment2.setOwner(goodCommentOwner);
		
		thisList.add(premadeComment1);
		thisList.add(premadeComment2);
		
		defaultPremadeCommentList.setPremadeCommentList(thisList);
    }
    
    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onTearDownAfterTransaction()
     */
    @Override
    protected void onTearDownAfterTransaction() throws Exception {
        super.onTearDownAfterTransaction();
        this.defaultPremadeCommentList = null;
        this.premadeComment1 = null;
        this.premadeComment2 = null;
    }

    /*
     * TODO: patrick fix
	public void testSave(){
		
		thisListDao.save(defaultPremadeCommentList);
		
		List<?> thisList = thisListDao.getList();
		assertEquals(1, thisList.size());
		assertEquals(thisList.get(0), defaultPremadeCommentList);
		
		Set<PremadeComment> returnedComments = ((PremadeCommentList) thisList.get(0)).getPremadeCommentList();
		assertNotNull(returnedComments);
		assertTrue(returnedComments.contains(premadeComment1));
		assertTrue(returnedComments.contains(premadeComment2));
	}
	*/
	
	public void testSaveWithoutLabel(){
		defaultPremadeCommentList.setLabel(null);
		
        try {
        	this.thisListDao.save(this.defaultPremadeCommentList);
        	fail("Exception expected to be thrown but was not");
        } catch (Exception e) {
        }
	}
	
	public void testGetById() throws Exception{
        this.thisListDao.save(this.defaultPremadeCommentList);

        assertNotNull(this.thisListDao.getById(this.defaultPremadeCommentList.getId()));
	}
    
    /**
	 * @return the thisDao
	 */
	public HibernatePremadeCommentListDao getThisDao() {
		return thisListDao;
	}

	/**
	 * @param thisDao the thisDao to set
	 */
	public void setThisDao(HibernatePremadeCommentListDao thisDao) {
		this.thisListDao = thisDao;
	}

	/**
	 * @return the premadeCommentDao
	 */
	public HibernatePremadeCommentDao getPremadeCommentDao() {
		return premadeCommentDao;
	}

	/**
	 * @param premadeCommentDao the premadeCommentDao to set
	 */
	public void setPremadeCommentDao(HibernatePremadeCommentDao premadeCommentDao) {
		this.premadeCommentDao = premadeCommentDao;
	}
	

	
}
