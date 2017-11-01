/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.dao.peerreview;

import java.util.List;

import org.wise.portal.dao.SimpleDao;
import org.wise.vle.domain.annotation.Annotation;
import org.wise.vle.domain.node.Node;
import org.wise.vle.domain.peerreview.PeerReviewWork;
import org.wise.vle.domain.user.UserInfo;
import org.wise.vle.domain.work.StepWork;

public interface PeerReviewWorkDao<T extends PeerReviewWork> extends SimpleDao<T> {

  PeerReviewWork getPeerReviewWorkById(Long id);

  void savePeerReviewWork(PeerReviewWork peerReviewWork);

  List<PeerReviewWork> getPeerReviewWorkByRun(Long runId);

  List<PeerReviewWork> getPeerReviewWorkByRunPeriodNode(Long runId, Long periodId, Node node);

  List<PeerReviewWork> getUnassignedPeerReviewWorkList(Long runId, Long periodId, Node node);

  PeerReviewWork getPeerReviewWorkByRunPeriodNodeStepWorkReviewer(Long runId, Long periodId, Node node, StepWork stepWork, UserInfo reviewer);

  PeerReviewWork setPeerReviewAnnotation(Long runId, Long periodId, Node node, StepWork stepWork, UserInfo reviewer, Annotation annotation);

  PeerReviewWork getPeerReviewWorkByRunPeriodNodeReviewerUserInfo(Long runId, Long periodId, Node node, UserInfo reviewerUserInfo);

  PeerReviewWork getPeerReviewWorkByRunPeriodNodeWorkerUserInfo(Long runId, Long periodId, Node node, UserInfo worker);

  PeerReviewWork getPeerReviewWorkByRunPeriodNodeWorkerUserInfoReviewerUserInfo(Long runId, Long periodId, Node node, UserInfo workerUserInfo, UserInfo reviewerUserInfo);

  void setAuthorAsReviewer(PeerReviewWork peerReviewWork);

  boolean isAuthorSetAsReviewer(PeerReviewWork peerReviewWork);

  UserInfo getAuthorUserInfo();

  PeerReviewWork getOrCreateAuthorReviewWork(Long runId, Long periodId, Node node, UserInfo reviewerUserInfo);

  PeerReviewWork setUserAsAuthorReviewer(Long runId, Long periodId, Node node, UserInfo userInfo);

  void matchUserToAuthor(Long runId, Long periodId, Node node, UserInfo userInfo, PeerReviewWork userWork);

  boolean isUserReviewingAuthor(Long runId, Long periodId, Node node, UserInfo userInfo);
}
