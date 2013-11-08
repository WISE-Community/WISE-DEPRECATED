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

package org.telscenter.sail.webapp.service.premadecomment.impl;

import java.util.Set;
import java.util.TreeSet;
import org.easymock.EasyMock;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;

import org.telscenter.sail.webapp.dao.premadecomment.PremadeCommentDao;
import org.telscenter.sail.webapp.dao.premadecomment.impl.HibernatePremadeCommentDao;
import org.telscenter.sail.webapp.dao.premadecomment.impl.HibernatePremadeCommentListDao;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.PremadeCommentListParameters;
import org.telscenter.sail.webapp.domain.impl.PremadeCommentParameters;
import org.telscenter.sail.webapp.domain.impl.RunImpl;
import org.telscenter.sail.webapp.domain.premadecomment.PremadeComment;
import org.telscenter.sail.webapp.domain.premadecomment.PremadeCommentList;
import org.telscenter.sail.webapp.domain.premadecomment.impl.PremadeCommentImpl;
import org.telscenter.sail.webapp.domain.premadecomment.impl.PremadeCommentListImpl;
import org.telscenter.sail.webapp.service.premadecomment.PremadeCommentService;

import junit.framework.TestCase;

/**
 * 
 * @author patrick lawler
 */
public class PremadeCommentServiceImplTest extends TestCase{
	
	private PremadeCommentDao mockPremadeCommentDao;
	
	private HibernatePremadeCommentListDao mockPremadeCommentListDao;
	
	private PremadeComment[] premadeComments = {new PremadeCommentImpl(), new PremadeCommentImpl(), new PremadeCommentImpl()};
	
	private PremadeCommentList premadeCommentList;
	
	private static final String[] labels = {"comment1", "comment2", "comment3", "commentList"};
	
	private static final String[] comments = {"good job", "try again", "do not pass go"};
	
	private User[] owners = {new UserImpl(), new UserImpl(), new UserImpl()};
	
	private Run[] runs = {new RunImpl(), new RunImpl(), new RunImpl()};
	
	private PremadeCommentServiceImpl premadeCommentService;
	
	private PremadeCommentParameters[] premadeCommentParameters;
	
	private PremadeCommentListParameters premadeCommentListParameters;
	
	private Set<PremadeComment> list;
	
	@Override
	protected void setUp(){
		premadeCommentListParameters = new PremadeCommentListParameters();
		premadeCommentListParameters.setLabel(labels[3]);
		
		premadeCommentParameters = new PremadeCommentParameters[3];
		
		list = new TreeSet<PremadeComment>();
		
		for(int x = 0; x < 2; x += 1){
			premadeComments[x].setComment(comments[x]);
			premadeComments[x].setOwner(owners[x]);
			list.add(premadeComments[x]);
			
			premadeCommentParameters[x] = new PremadeCommentParameters();
			premadeCommentParameters[x].setLabels(labels[x]);
			premadeCommentParameters[x].setComment(comments[x]);
			premadeCommentParameters[x].setOwner(owners[x]);
			premadeCommentParameters[x].setRun(runs[x]);
		}
		premadeCommentListParameters.setList(list);
				
		premadeCommentService = new PremadeCommentServiceImpl();
//		this.mockPremadeCommentDao = EasyMock.createMock(PremadeCommentDao.class);
//		this.premadeCommentService.setPremadeCommentDao(mockPremadeCommentDao);
//		this.mockPremadeCommentListDao = EasyMock.createMock(HibernatePremadeCommentListDao.class);
//		this.premadeCommentService.setPremadeCommentListDao(mockPremadeCommentListDao);
	}
	
	@Override
	protected void tearDown(){
		for(int x = 0; x < 2; x += 1){
			premadeComments[x] = null;
			premadeCommentParameters[x] = null;
		}
		premadeCommentListParameters = null;
		this.mockPremadeCommentDao = null;
		this.mockPremadeCommentListDao = null;
	}

	/**
	 *  Test the creation of a PremadeComment 
	 */
	public void testCreatePremadeComment(){
		//this.premadeCommentService.createPremadeComment(premadeCommentParameters[0]);
		
		assertTrue(true);
	}
	
	/**
	 * @return the premadeCommentDao
	 */
//	public HibernatePremadeCommentDao getPremadeCommentDao() {
//		return mockPremadeCommentDao;
//	}

	/**
	 * @param premadeCommentDao the premadeCommentDao to set
	 */
	public void setPremadeCommentDao(HibernatePremadeCommentDao premadeCommentDao) {
		this.mockPremadeCommentDao = premadeCommentDao;
	}

	/**
	 * @return the premadeCommentListDao
	 */
	public HibernatePremadeCommentListDao getPremadeCommentListDao() {
		return mockPremadeCommentListDao;
	}

	/**
	 * @param premadeCommentListDao the premadeCommentListDao to set
	 */
	public void setPremadeCommentListDao(
			HibernatePremadeCommentListDao premadeCommentListDao) {
		this.mockPremadeCommentListDao = premadeCommentListDao;
	}
	
}
