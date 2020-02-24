/**
 * Copyright (c) 2007-2017 Regents of the University of California (Regents).
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
package org.wise.portal.service.premadecomment.impl;

import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.premadecomment.PremadeCommentDao;
import org.wise.portal.dao.premadecomment.PremadeCommentListDao;
import org.wise.portal.domain.premadecomment.PremadeComment;
import org.wise.portal.domain.premadecomment.PremadeCommentList;
import org.wise.portal.domain.premadecomment.impl.PremadeCommentImpl;
import org.wise.portal.domain.premadecomment.impl.PremadeCommentListImpl;
import org.wise.portal.domain.premadecomment.impl.PremadeCommentListParameters;
import org.wise.portal.domain.premadecomment.impl.PremadeCommentParameters;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.premadecomment.PremadeCommentService;
import org.wise.portal.service.project.ProjectService;

/**
 * @author Patrick Lawler
 */
@Service
public class PremadeCommentServiceImpl implements PremadeCommentService {

  @Autowired
  private PremadeCommentDao<PremadeComment> premadeCommentDao;

  @Autowired
  private PremadeCommentListDao<PremadeCommentList> premadeCommentListDao;

  @Autowired
  private ProjectService projectService;

  @Autowired
  private RunService runService;

  @Transactional()
  public PremadeComment createPremadeComment(PremadeCommentParameters param) {
    PremadeComment premadeComment = new PremadeCommentImpl();
    premadeComment.setComment(param.getComment());
    premadeComment.setOwner(param.getOwner());
    premadeComment.setListPosition(param.getListPosition());
    premadeComment.setLabels(param.getLabels());
    premadeCommentDao.save(premadeComment);
    return premadeComment;
  }

  @Transactional()
  public void deletePremadeComment(Long commentId) {
    try {
      PremadeComment premadeComment = premadeCommentDao.getById(commentId);
      premadeCommentDao.delete(premadeComment);
    } catch (ObjectNotFoundException e) {
    }
  }

  @Transactional()
  public PremadeComment updatePremadeCommentMessage(Long premadeCommentId, String newComment)
      throws ObjectNotFoundException {
    try {
      PremadeComment premadeComment = premadeCommentDao.getById(premadeCommentId);
      premadeComment.setComment(newComment);
      premadeCommentDao.save(premadeComment);
      return premadeComment;
    } catch (ObjectNotFoundException e) {
      throw e;
    }
  }

  @Transactional()
  public PremadeComment updatePremadeCommentListPosition(Long premadeCommentId, Long listPosition)
      throws ObjectNotFoundException {
    try {
      PremadeComment premadeComment = premadeCommentDao.getById(premadeCommentId);
      premadeComment.setListPosition(listPosition);
      premadeCommentDao.save(premadeComment);
      return premadeComment;
    } catch (ObjectNotFoundException e) {
      throw e;
    }
  }

  @Transactional()
  public PremadeComment updatePremadeCommentLabels (Long premadeCommentId, String labels)
      throws ObjectNotFoundException {
    try {
      PremadeComment premadeComment = premadeCommentDao.getById(premadeCommentId);
      premadeComment.setLabels(labels);
      premadeCommentDao.save(premadeComment);
      return premadeComment;
    } catch (ObjectNotFoundException e) {
      throw e;
    }
  }

  @Transactional()
  public Set<PremadeComment> retrieveAllPremadeComments() {
    TreeSet<PremadeComment> returnSet = new TreeSet<PremadeComment>();
    List<PremadeComment> returnedList = premadeCommentDao.getList();
    returnSet.addAll(returnedList);
    return returnSet;
  }

  @Transactional()
  public Set<PremadeComment> retrieveAllPremadeCommentsByUser(User user) {
    TreeSet<PremadeComment> returnSet = new TreeSet<PremadeComment>();
    returnSet.addAll(premadeCommentDao.getPremadeCommentsByUser(user));
    return returnSet;
  }

  @Transactional()
  public PremadeCommentList createPremadeCommentList(PremadeCommentListParameters param) {
    PremadeCommentList premadeCommentList = new PremadeCommentListImpl();
    premadeCommentList.setOwner(param.getOwner());
    premadeCommentList.setLabel(param.getLabel());
    premadeCommentList.setGlobal(param.isGlobal());
    premadeCommentList.setProjectId(param.getProjectId());
    premadeCommentList.setPremadeCommentList(param.getList());
    premadeCommentListDao.save(premadeCommentList);
    return premadeCommentList;
  }

  @Transactional()
  public void deletePremadeCommentList(Long commentListId) throws ObjectNotFoundException {
    try {
      PremadeCommentList premadeCommentList = premadeCommentListDao.getById(commentListId);
      premadeCommentListDao.delete(premadeCommentList);
    } catch (ObjectNotFoundException e) {
    }
  }

  @Transactional()
  public PremadeCommentList updatePremadeCommentListLabel(Long commentListId, String newLabel)
      throws ObjectNotFoundException {
    try {
      PremadeCommentList premadeCommentList = premadeCommentListDao.getById(commentListId);
      premadeCommentList.setLabel(newLabel);
      premadeCommentListDao.save(premadeCommentList);
      return premadeCommentList;
    } catch (ObjectNotFoundException e) {
      throw e;
    }
  }

  @Transactional()
  public PremadeCommentList addPremadeCommentToList(Long commentListId, PremadeComment comment)
      throws ObjectNotFoundException {
    try {
      PremadeCommentList premadeCommentList = premadeCommentListDao.getById(commentListId);
      premadeCommentList.getPremadeCommentList().add(comment);
      premadeCommentDao.save(comment);
      premadeCommentListDao.save(premadeCommentList);
      return premadeCommentList;
    } catch (ObjectNotFoundException e) {
      throw e;
    }
  }

  @Transactional()
  public PremadeCommentList removePremadeCommentFromList(Long commentListId, PremadeComment comment)
      throws ObjectNotFoundException {
    try {
      PremadeCommentList premadeCommentList = premadeCommentListDao.getById(commentListId);
      premadeCommentList.getPremadeCommentList().remove(comment);
      premadeCommentListDao.save(premadeCommentList);
      return premadeCommentList;
    } catch (ObjectNotFoundException e) {
      throw e;
    }
  }

  @Transactional()
  public Set<PremadeCommentList> retrieveAllPremadeCommentLists() {
    TreeSet<PremadeCommentList> returnSet = new TreeSet<PremadeCommentList>();
    List<PremadeCommentList> returnedList = premadeCommentListDao.getList();
    returnSet.addAll(returnedList);
    return returnSet;
  }

  @Transactional()
  public Set<PremadeCommentList> retrieveAllPremadeCommentListsByUser(User user) {
    TreeSet<PremadeCommentList> returnSet = new TreeSet<PremadeCommentList>();
    returnSet.addAll(premadeCommentListDao.getListByOwner(user));
    return returnSet;
  }

  @Transactional()
  public Set<PremadeCommentList> retrieveAllPremadeCommentListsByProject(Long projectId) {
    TreeSet<PremadeCommentList> returnSet = new TreeSet<PremadeCommentList>();
    returnSet.addAll(premadeCommentListDao.getListByProject(projectId));
    return returnSet;
  }

  @Transactional()
  public Set<PremadeCommentList> retrieveAllPremadeCommentListsByRun(Run run) {
    TreeSet<PremadeCommentList> returnSet = new TreeSet<PremadeCommentList>();
    returnSet.addAll(premadeCommentListDao.getListByRun(run));
    return returnSet;
  }

  public void setPremadeCommentDao(PremadeCommentDao<PremadeComment> premadeCommentDao) {
    this.premadeCommentDao = premadeCommentDao;
  }

  public void setPremadeCommentListDao(
    PremadeCommentListDao<PremadeCommentList> premadeCommentListDao) {
    this.premadeCommentListDao = premadeCommentListDao;
  }

  public Set<PremadeCommentList> retrieveAllGlobalPremadeCommentLists() {
    TreeSet<PremadeCommentList> returnSet = new TreeSet<PremadeCommentList>();
    returnSet.addAll(premadeCommentListDao.getListByGlobal());
    return returnSet;
  }

  @Transactional()
  public PremadeCommentList retrievePremadeCommentListById(Long id) {
    return premadeCommentListDao.getListById(id);
  }

  @Transactional()
  public PremadeComment retrievePremadeCommentById(Long id) {
    PremadeComment premadeComment = null;
    try {
      premadeComment = premadeCommentDao.getById(id);
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }
    return premadeComment;
  }

  /**
   * Copy all the premade comment lists for a project into another project
   * @param fromProjectId the project id to copy from
   * @param toProjectId the project id to set in the new lists
   * @param toOwner the owner to set in the new lists
   */
  @Transactional()
  public void copyPremadeCommentsFromProject(Long fromProjectId, Long toProjectId, User toOwner) {
    if (fromProjectId != null && toProjectId != null) {
      Set<PremadeCommentList> premadeCommentListsFromProject =
          retrieveAllPremadeCommentListsByProject(fromProjectId);
      Iterator<PremadeCommentList> premadeCommentListsFromProjectIterator =
          premadeCommentListsFromProject.iterator();
      while (premadeCommentListsFromProjectIterator.hasNext()) {
        PremadeCommentList fromPremadeCommentList = premadeCommentListsFromProjectIterator.next();
        String fromLabel = fromPremadeCommentList.getLabel();
        boolean fromIsGlobal = fromPremadeCommentList.isGlobal();
        String toLabel = makePremadeCommentListNameFromProjectId(toProjectId);
        PremadeCommentListParameters toPremadeCommentListParams =
            new PremadeCommentListParameters(toLabel, toOwner, fromIsGlobal, toProjectId);
        PremadeCommentList toPremadeCommentList =
            createPremadeCommentList(toPremadeCommentListParams);
        Set<PremadeComment> fromPremadeComments = fromPremadeCommentList.getPremadeCommentList();
        Iterator<PremadeComment> fromPremadeCommentsIterator = fromPremadeComments.iterator();
        while (fromPremadeCommentsIterator.hasNext()) {
          PremadeComment fromPremadeComment = fromPremadeCommentsIterator.next();
          String fromComment = fromPremadeComment.getComment();
          String fromLabels = fromPremadeComment.getLabels();
          Long fromListPosition = fromPremadeComment.getListPosition();
          PremadeCommentParameters toPremadeCommentParams =
              new PremadeCommentParameters(fromComment, toOwner, false, fromListPosition, fromLabels);
          PremadeComment toPremadeComment = createPremadeComment(toPremadeCommentParams);
          try {
            addPremadeCommentToList(toPremadeCommentList.getId(), toPremadeComment);
          } catch (ObjectNotFoundException e) {
            e.printStackTrace();
          }
        }
      }
    }
  }

  /**
   * Make the name for a premade comment list given the project id
   * @param projectId the project id this list is for
   * @return the premade comment list name
   * e.g.
   * project with a run
   * Project Id: 123, Run Id: 456, Chemical Reactions
   * project without a run
   * Project Id: 123, Chemical Reactions
   */
  public String makePremadeCommentListNameFromProjectId(Long projectId) {
    String listName = "";
    try {
      if (projectId != null) {
        Project project = projectService.getById(projectId);
        String projectName = project.getName();
        List<Run> projectRuns = runService.getProjectRuns(projectId);
        Long runId = null;
        String runName = null;
        for (int x = 0; x < projectRuns.size(); x++) {
          Run run = projectRuns.get(x);
          runId = run.getId();
          runName = run.getName();
        }

        if (runId == null) {
          listName = "Project Id: " + projectId + ", " + projectName;
        } else {
          listName = "Project Id: " + projectId + ", " + "Run Id: " + runId + ", " + runName;
        }
      }
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }
    return listName;
  }
}
