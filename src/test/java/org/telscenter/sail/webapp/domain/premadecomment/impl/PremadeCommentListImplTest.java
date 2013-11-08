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
package org.telscenter.sail.webapp.domain.premadecomment.impl;

import java.util.Set;
import java.util.TreeSet;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.UserImpl;
import org.telscenter.sail.webapp.domain.premadecomment.PremadeComment;
import org.telscenter.sail.webapp.domain.premadecomment.PremadeCommentList;

import junit.framework.TestCase;


/**
 * @author patrick lawler
 *
 */
public class PremadeCommentListImplTest extends TestCase {
	
	private User user;
	
	private String label;
	
	private Set<PremadeComment> commentList;
	
	private PremadeComment currentComment;
	
	private PremadeCommentList premadeCommentList;
	
	private static final String[] comments = {"great job", "good job", "awesome"};
	
	@Override
	protected void setUp() {
		premadeCommentList = new PremadeCommentListImpl();
		commentList = new TreeSet<PremadeComment>();
		
		for(String comment : comments){
			user = new UserImpl();
			currentComment = new PremadeCommentImpl();
			
			currentComment.setOwner(user);
			currentComment.setComment(comment);
			commentList.add(currentComment);
		}

		user = new UserImpl();
		label = "good comments";
		premadeCommentList.setLabel(label);
		premadeCommentList.setOwner(user);
		premadeCommentList.setPremadeCommentList(commentList);
	}
	
	@Override
	protected void tearDown() {
		user = null;
		label = null;
		currentComment = null;
		commentList = null;
		premadeCommentList = null;
	}
	
	public void testPremadeCommentList(){		
		assertEquals(premadeCommentList.getPremadeCommentList(), commentList);
	}

}
