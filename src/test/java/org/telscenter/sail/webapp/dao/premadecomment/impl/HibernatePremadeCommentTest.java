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


import java.util.List;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;

import org.junit.Ignore;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.RunImpl;
import org.telscenter.sail.webapp.domain.premadecomment.impl.PremadeCommentImpl;
import org.telscenter.sail.webapp.junit.AbstractTransactionalDbTests;

/**
 * @author patrick lawler
 *
 */
public class HibernatePremadeCommentTest extends AbstractTransactionalDbTests{
	
	private final static String GOOD_COMMENT = "Good job!";
	
	private User goodOwner = new UserImpl();
	
	private PremadeCommentImpl defaultPremadeComment = new PremadeCommentImpl();
	
	private HibernatePremadeCommentDao premadeCommentDao;
	
    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpBeforeTransaction()
     */
    @Override
    protected void onSetUpBeforeTransaction() throws Exception {
        super.onSetUpBeforeTransaction();

		defaultPremadeComment.setComment(GOOD_COMMENT);
		defaultPremadeComment.setOwner(goodOwner);
    }
    
    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onTearDownAfterTransaction()
     */
    @Override
    protected void onTearDownAfterTransaction() throws Exception {
        super.onTearDownAfterTransaction();
        this.defaultPremadeComment = null;
    }

    /*
     * TODO: patrick fix
	public void testSave(){
		
		assertTrue(true);
		assertNotNull(defaultPremadeComment);
		
		premadeCommentDao.save(defaultPremadeComment);
	
		List<?> thisList = premadeCommentDao.getList();
		assertEquals(1, thisList.size());
		assertEquals(thisList.get(0), defaultPremadeComment);
	}
	*/


	public void testSaveWithoutLabel(){
		
        try {
        	this.premadeCommentDao.save(this.defaultPremadeComment);
        	fail("Exception expected to be thrown but was not");
        } catch (Exception e) {
        }
	}
	
	public void testGetById() throws Exception{
		this.premadeCommentDao.save(this.defaultPremadeComment);

        assertNotNull(this.premadeCommentDao.getById(this.defaultPremadeComment.getId()));
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
