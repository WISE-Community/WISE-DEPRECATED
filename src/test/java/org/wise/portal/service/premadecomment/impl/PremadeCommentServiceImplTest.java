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

package org.wise.portal.service.premadecomment.impl;

import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.isA;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;

import java.util.Set;
import java.util.TreeSet;

import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.wise.portal.dao.premadecomment.PremadeCommentDao;
import org.wise.portal.dao.premadecomment.PremadeCommentListDao;
import org.wise.portal.domain.premadecomment.PremadeComment;
import org.wise.portal.domain.premadecomment.PremadeCommentList;
import org.wise.portal.domain.premadecomment.impl.PremadeCommentImpl;
import org.wise.portal.domain.premadecomment.impl.PremadeCommentListParameters;
import org.wise.portal.domain.premadecomment.impl.PremadeCommentParameters;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;
import org.wise.portal.service.premadecomment.PremadeCommentService;

/**
 * @author patrick lawler
 */
@RunWith(EasyMockRunner.class)
public class PremadeCommentServiceImplTest {

  @TestSubject
  private PremadeCommentService premadeCommentService = new PremadeCommentServiceImpl();

  @Mock
  private PremadeCommentDao<PremadeComment> premadeCommentDao;

  @Mock
  private PremadeCommentListDao<PremadeCommentList> premadeCommentListDao;

  private PremadeComment[] premadeComments = { new PremadeCommentImpl(),
      new PremadeCommentImpl(), new PremadeCommentImpl() };

  private static final String[] labels = { "comment1", "comment2", "comment3",
      "commentList" };

  private static final String[] comments = { "good job", "try again",
      "do not pass go" };

  private User[] owners = { new UserImpl(), new UserImpl(), new UserImpl() };

  private Run[] runs = { new RunImpl(), new RunImpl(), new RunImpl() };

  private PremadeCommentParameters[] premadeCommentParameters;

  private PremadeCommentListParameters premadeCommentListParameters;

  private Set<PremadeComment> list;

  @Before
  public void setUp() {
    premadeCommentListParameters = new PremadeCommentListParameters();
    premadeCommentListParameters.setLabel(labels[3]);
    premadeCommentParameters = new PremadeCommentParameters[3];
    list = new TreeSet<PremadeComment>();
    for (int i = 0; i < 2; i++) {
      premadeComments[i].setComment(comments[i]);
      premadeComments[i].setOwner(owners[i]);
      premadeComments[i].setListPosition(new Long(i));
      list.add(premadeComments[i]);
      premadeCommentParameters[i] = new PremadeCommentParameters();
      premadeCommentParameters[i].setLabels(labels[i]);
      premadeCommentParameters[i].setComment(comments[i]);
      premadeCommentParameters[i].setOwner(owners[i]);
      premadeCommentParameters[i].setRun(runs[i]);
    }
    premadeCommentListParameters.setList(list);
  }

  @After
  public void tearDown() {
    for (int i = 0; i < 2; i++) {
      premadeComments[i] = null;
      premadeCommentParameters[i] = null;
    }
    premadeCommentListParameters = null;
    premadeCommentDao = null;
    premadeCommentListDao = null;
  }

  @Test
  public void createPremadeComment_ValidPremadeComment_ShouldSucceed() {
    premadeCommentDao.save(isA(PremadeCommentImpl.class));
    expectLastCall();
    replay(premadeCommentDao);
    premadeCommentService.createPremadeComment(premadeCommentParameters[0]);
    verify(premadeCommentDao);
  }
}
