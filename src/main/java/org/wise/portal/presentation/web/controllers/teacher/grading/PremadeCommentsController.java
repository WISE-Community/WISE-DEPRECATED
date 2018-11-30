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
package org.wise.portal.presentation.web.controllers.teacher.grading;

import java.io.IOException;
import java.util.Collection;
import java.util.Iterator;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.premadecomment.PremadeComment;
import org.wise.portal.domain.premadecomment.PremadeCommentList;
import org.wise.portal.domain.premadecomment.impl.PremadeCommentListParameters;
import org.wise.portal.domain.premadecomment.impl.PremadeCommentParameters;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.service.premadecomment.PremadeCommentService;

/**
 * Controller for creating/editing/deleting premade comments
 *
 * @author Geoffrey Kwan
 * @author Patrick Lawler
 */
@Controller
@RequestMapping("/teacher/grading/premadeComments.html")
public class PremadeCommentsController {

  @Autowired
  private PremadeCommentService premadeCommentService;

  /**
   * Handles changes to premade comments
   * @param request
   * @param response
   * @return
   */
  @RequestMapping(method = RequestMethod.POST)
  private ModelAndView handlePostData(HttpServletRequest request, HttpServletResponse response) {
    try {
      String premadeCommentAction = request.getParameter("premadeCommentAction");
      String premadeCommentListId = request.getParameter("premadeCommentListId");
      if (premadeCommentListId != null && premadeCommentListId.equals("null")) {
        premadeCommentListId = null;
      }

      String premadeCommentListLabel = request.getParameter("premadeCommentListLabel");
      if (premadeCommentListLabel != null && premadeCommentListLabel.equals("null")) {
        premadeCommentListLabel = null;
      }

      String premadeCommentId = request.getParameter("premadeCommentId");
      if (premadeCommentId != null && premadeCommentId.equals("null")) {
        premadeCommentId = null;
      }

      String premadeComment = request.getParameter("premadeComment");
      if (premadeComment == null || (premadeComment != null && premadeComment.equals("null"))) {
        premadeComment = "";
      }

      String premadeCommentLabels = request.getParameter("premadeCommentLabels");
      if (premadeCommentLabels == null || (premadeCommentLabels != null && premadeCommentLabels.equals("null"))) {
        premadeCommentLabels = "";
      }

      boolean isGlobal = false;

      String isGlobalString = request.getParameter("isGlobal");
      if (isGlobalString != null) {
        isGlobal = Boolean.parseBoolean(isGlobalString);
      }

      String premadeCommentListPositions = request.getParameter("premadeCommentListPositions");
      if (premadeCommentListPositions == null || (premadeCommentListPositions != null && premadeCommentListPositions.equals("null"))) {
        premadeCommentListPositions = "";
      }

      String projectIdString = request.getParameter("projectId");
      Long projectId = null;

      if (projectIdString != null && !projectIdString.equals("null") && projectIdString != "undefined") {
        try {
          projectId = new Long(projectIdString);
        } catch(Exception e) {
          e.printStackTrace();
        }
      }

      /*
       * this is a security check to see if signed in user is admin since
       * the only user that can create or modify global premade comment
       * objects is admin
       */
      if (!signedInUserIsAdmin()) {
        /*
         * signed in user is not admin so we will not allow them to make
         * global premade comments or global premade comment lists
         */
        isGlobal = false;
      }

      User signedInUser = ControllerUtil.getSignedInUser();
      String returnValue = "";

      if (premadeCommentListLabel == null) {
        if (signedInUserIsAdmin()) {
          premadeCommentListLabel = "Global Premade Comment List";
        } else {
          if (projectId != null) {
            premadeCommentListLabel = premadeCommentService.makePremadeCommentListNameFromProjectId(projectId);
          } else {
            premadeCommentListLabel = "My New List";
          }
        }
      }

      if (premadeCommentAction == null) {
      } else if (premadeCommentAction.equals("addComment")) {
        if (premadeCommentListId != null) {
          PremadeCommentList premadeCommentList = premadeCommentService.retrievePremadeCommentListById(new Long(premadeCommentListId));
          if (signedInUser.equals(premadeCommentList.getOwner())) {
            int listSize = premadeCommentList.getPremadeCommentList().size();
            String labels = null;
            PremadeCommentParameters premadeCommentParameters = new PremadeCommentParameters(premadeComment, signedInUser, isGlobal, listSize + 1, labels);
            PremadeComment newPremadeComment = premadeCommentService.createPremadeComment(premadeCommentParameters);
            premadeCommentService.addPremadeCommentToList(premadeCommentList.getId(), newPremadeComment);

            try {
              JSONObject premadeCommentJSON = convertPremadeCommentToJSON(newPremadeComment);

              premadeCommentJSON.put("premadeCommentListId", premadeCommentList.getId());
              returnValue = premadeCommentJSON.toString();
            } catch (JSONException e) {
              e.printStackTrace();
            }
          } else {
          }
        } else {
        }

      } else if (premadeCommentAction.equals("editComment")) {
        if (premadeCommentId != null) {
          PremadeComment premadeCommentToUpdate = premadeCommentService.retrievePremadeCommentById(new Long(premadeCommentId));
          if (signedInUser.equals(premadeCommentToUpdate.getOwner())) {
            PremadeComment updatedPremadeComment = premadeCommentService.updatePremadeCommentMessage(new Long(premadeCommentId), premadeComment);
            returnValue = convertPremadeCommentToJSON(updatedPremadeComment).toString();
          }
        }
      } else if (premadeCommentAction.equals("deleteComment")) {
        if (premadeCommentId != null && premadeCommentListId != null) {
          PremadeComment premadeCommentToDelete = premadeCommentService.retrievePremadeCommentById(new Long(premadeCommentId));
          PremadeCommentList premadeCommentListToDeleteFrom = premadeCommentService.retrievePremadeCommentListById(new Long(premadeCommentListId));
          if (signedInUser.equals(premadeCommentToDelete.getOwner()) && signedInUser.equals(premadeCommentListToDeleteFrom.getOwner())) {
            premadeCommentListToDeleteFrom = premadeCommentService.removePremadeCommentFromList(new Long(premadeCommentListId), premadeCommentToDelete);
            premadeCommentService.deletePremadeComment(new Long(premadeCommentId));
            long listPosition = premadeCommentToDelete.getListPosition();
            shiftListPositionsOnDelete(premadeCommentListToDeleteFrom, listPosition);
            returnValue = convertPremadeCommentToJSON(premadeCommentToDelete).toString();
          }
        }
      } else if (premadeCommentAction.equals("reOrderCommentList")) {
        try {
          JSONArray listPositions = new JSONArray(premadeCommentListPositions);
          long premadeCommentListIdLong = new Long(premadeCommentListId);
          updateListPositionsOnReOrder(premadeCommentListIdLong, listPositions);
          JSONObject reOrderReturn = new JSONObject();
          reOrderReturn.put("premadeCommentListId", premadeCommentListIdLong);
          reOrderReturn.put("listPositions", listPositions);
          returnValue = reOrderReturn.toString();
        } catch (JSONException e) {
          e.printStackTrace();
        }
      } else if (premadeCommentAction.equals("addCommentList")) {
        PremadeCommentListParameters premadeCommentListParameters = new PremadeCommentListParameters(premadeCommentListLabel, signedInUser, isGlobal, projectId);
        PremadeCommentList premadeCommentList = premadeCommentService.createPremadeCommentList(premadeCommentListParameters);
        returnValue = convertPremadeCommentListToJSON(premadeCommentList).toString();
      } else if (premadeCommentAction.equals("editCommentListLabel")) {
        if (premadeCommentListId != null && premadeCommentListLabel != null) {
          PremadeCommentList premadeCommentListToUpdate = premadeCommentService.retrievePremadeCommentListById(new Long(premadeCommentListId));
          if (signedInUser.equals(premadeCommentListToUpdate.getOwner())) {
            premadeCommentListToUpdate.setLabel(premadeCommentListLabel);
            PremadeCommentList updatedPremadeCommentList = premadeCommentService.updatePremadeCommentListLabel(new Long(premadeCommentListId), premadeCommentListLabel);
            returnValue = convertPremadeCommentListToJSON(updatedPremadeCommentList).toString();
          }
        }

      } else if (premadeCommentAction.equals("editCommentList")) {
      } else if (premadeCommentAction.equals("deleteCommentList")) {
        PremadeCommentList premadeCommentListToDelete = premadeCommentService.retrievePremadeCommentListById(new Long(premadeCommentListId));
        if (signedInUser.equals(premadeCommentListToDelete.getOwner())) {
          premadeCommentService.deletePremadeCommentList(new Long(premadeCommentListId));
          returnValue = convertPremadeCommentListToJSON(premadeCommentListToDelete).toString();
        }
      } else if (premadeCommentAction.equals("editCommentLabels")) {
        if (premadeCommentId != null) {
          PremadeComment premadeCommentToUpdate = premadeCommentService.retrievePremadeCommentById(new Long(premadeCommentId));
          if (signedInUser.equals(premadeCommentToUpdate.getOwner())) {
            PremadeComment updatedPremadeComment = premadeCommentService.updatePremadeCommentLabels(new Long(premadeCommentId), premadeCommentLabels);
            returnValue = convertPremadeCommentToJSON(updatedPremadeComment).toString();
          }
        }
      } else {
      }
      response.getWriter().print(returnValue);
    } catch (IOException e) {
      e.printStackTrace();
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }
    return null;
  }

  /**
   * Handles retrieval of premade comment lists. Will create a premade
   * comment list if the user does not have one
   * @param request
   * @param response
   * @return
   */
  @RequestMapping(method=RequestMethod.GET)
  private ModelAndView handleGetData(HttpServletRequest request, HttpServletResponse response) {
    try {
      JSONArray premadeCommentListsJSONArray = new JSONArray();
      User signedInUser = ControllerUtil.getSignedInUser();
      Set<PremadeCommentList> premadeCommentLists = null;
      String projectIdString = request.getParameter("projectId");
      Long projectId = null;

      if (projectIdString != null) {
        projectId = Long.parseLong(projectIdString);
        premadeCommentLists = premadeCommentService.retrieveAllPremadeCommentListsByProject(projectId);
      } else {
        premadeCommentLists = premadeCommentService.retrieveAllPremadeCommentListsByUser(signedInUser);
      }

      if (premadeCommentLists.size() == 0) {
        String premadeCommentListLabel = "";
        boolean isGlobal = false;

        if (signedInUserIsAdmin()) {
          premadeCommentListLabel = "Global Premade Comment List";
        } else {
          if (projectId == null) {
            String username = getUsernameFromUser(signedInUser);

            if (username != null && !username.equals("")) {
              premadeCommentListLabel = username + "'s Premade Comment List";
            }
          } else {
            premadeCommentListLabel = premadeCommentService.makePremadeCommentListNameFromProjectId(projectId);
          }
        }

        if (signedInUserIsAdmin()) {
          isGlobal = true;
        }

        PremadeCommentList newPremadeCommentList = createPremadeCommentList(premadeCommentListLabel, signedInUser, isGlobal, projectId);
        premadeCommentLists.add(newPremadeCommentList);
      }

      Iterator<PremadeCommentList> userPremadeCommentListIterator = premadeCommentLists.iterator();
      while (userPremadeCommentListIterator.hasNext()) {
        PremadeCommentList currentPremadeCommentList = userPremadeCommentListIterator.next();
        JSONObject currentPremadeCommentListToJSON = convertPremadeCommentListToJSON(currentPremadeCommentList);
        premadeCommentListsJSONArray.put(currentPremadeCommentListToJSON);
      }

      Set<PremadeCommentList> allGlobalPremadeCommentLists = premadeCommentService.retrieveAllGlobalPremadeCommentLists();
      Iterator<PremadeCommentList> globalCommentListIterator = allGlobalPremadeCommentLists.iterator();
      while (globalCommentListIterator.hasNext()) {
        PremadeCommentList currentPremadeCommentList = globalCommentListIterator.next();

        /*
         * check if this global list is owned by this user, if it is owned by this
         * user we do not want to put it into the array again. if it is not owned
         * by this user we will put it into the array.
         */
        if (!premadeCommentLists.contains(currentPremadeCommentList)) {
          JSONObject currentPremadeCommentListToJSON = convertPremadeCommentListToJSON(currentPremadeCommentList);
          premadeCommentListsJSONArray.put(currentPremadeCommentListToJSON);
        }
      }
      response.getWriter().print(premadeCommentListsJSONArray.toString());
    } catch (IOException e) {
      e.printStackTrace();
    }
    return null;
  }

  /**
   * Create a new PremadeCommentList
   * @param premadeCommentListLabel the name of the list
   * @param signedInUser the signed in user
   * @param isGlobal whether the list will be global
   * @return the newly created PremadeCommentList
   */
  private PremadeCommentList createPremadeCommentList(String premadeCommentListLabel, User signedInUser, boolean isGlobal, Long projectId) {
    PremadeCommentListParameters premadeCommentListParameters = new PremadeCommentListParameters(premadeCommentListLabel, signedInUser, isGlobal, projectId);
    PremadeCommentList premadeCommentList = premadeCommentService.createPremadeCommentList(premadeCommentListParameters);

    String labels = null;

    /*
     * create a new blank premade comment so the list will have one
     * premade comment to start out with
     */
    PremadeCommentParameters premadeCommentParameters = new PremadeCommentParameters("", signedInUser, isGlobal, 1, labels);
    PremadeComment newPremadeComment = premadeCommentService.createPremadeComment(premadeCommentParameters);

    try {
      premadeCommentService.addPremadeCommentToList(premadeCommentList.getId(), newPremadeComment);
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }
    return premadeCommentList;
  }

  /**
   * Convert a premade comment list into JSON form
   * @param premadeCommentList a PremadeCommentList object
   * @return a string containing the JSON form of the premade comment list
   */
  private JSONObject convertPremadeCommentListToJSON(PremadeCommentList premadeCommentList) {
    JSONObject premadeCommentListJSON = new JSONObject();
    Long id = premadeCommentList.getId();
    String label = premadeCommentList.getLabel();
    User owner = premadeCommentList.getOwner();
    String ownerUsername = getUsernameFromUser(owner);
    Long projectId = premadeCommentList.getProjectId();
    Set<PremadeComment> premadeComments = premadeCommentList.getPremadeCommentList();

    try {
      premadeCommentListJSON.put("id", id);
      premadeCommentListJSON.put("label", label);
      premadeCommentListJSON.put("owner", ownerUsername);
      premadeCommentListJSON.put("projectId", projectId);

      JSONArray premadeCommentsJSON = new JSONArray();
      Iterator<PremadeComment> premadeCommentsIterator = premadeComments.iterator();
      while (premadeCommentsIterator.hasNext()) {
        PremadeComment premadeComment = premadeCommentsIterator.next();
        JSONObject premadeCommentJSON = convertPremadeCommentToJSON(premadeComment);
        premadeCommentsJSON.put(premadeCommentJSON);
      }
      premadeCommentListJSON.put("premadeComments", premadeCommentsJSON);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return premadeCommentListJSON;
  }

  /**
   * Convert a premade comment into JSON form
   * @param premadeComment a PremadeComment object
   * @return a string containing the JSON form of the premade comment
   */
  private JSONObject convertPremadeCommentToJSON(PremadeComment premadeComment) {
    JSONObject premadeCommentJSON = new JSONObject();

    try {
      Long premadeCommentId = premadeComment.getId();
      String premadeCommentComment = premadeComment.getComment();
      User premadeCommentOwner = premadeComment.getOwner();
      String premadeCommentOwnerUsername = getUsernameFromUser(premadeCommentOwner);
      Long premadeCommentListPosition = premadeComment.getListPosition();
      String labels = premadeComment.getLabels();

      premadeCommentJSON.put("id", premadeCommentId);
      premadeCommentJSON.put("comment", premadeCommentComment);
      premadeCommentJSON.put("owner", premadeCommentOwnerUsername);
      premadeCommentJSON.put("listPosition", premadeCommentListPosition);
      premadeCommentJSON.put("labels", labels);
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return premadeCommentJSON;
  }

  /**
   * Get the user name from the User object
   * @param user a User object
   * @return a string containing the user name
   */
  private String getUsernameFromUser(User user) {
    String username = null;
    if (user != null) {
      MutableUserDetails ownerUserDetails = user.getUserDetails();
      if (ownerUserDetails != null) {
        username = ownerUserDetails.getUsername();
      }
    }
    return username;
  }

  /**
   * Determine whether the signed in user is admin
   * @return whether the signed in user is admin
   */
  private boolean signedInUserIsAdmin() {
    User signedInUser = ControllerUtil.getSignedInUser();
    return signedInUser.isAdmin();
  }

  /**
   * Shift the list positions since we are deleting one of the premade comments
   * @param premadeCommentListToDeleteFrom the list we are deleting from
   * @param listPositionDeleted the list position of the premade comment
   * we are deleting
   */
  private void shiftListPositionsOnDelete(PremadeCommentList premadeCommentListToDeleteFrom, long listPositionDeleted) {
    Set<PremadeComment> premadeCommentList = premadeCommentListToDeleteFrom.getPremadeCommentList();
    Iterator<PremadeComment> premadeCommentListIterator = premadeCommentList.iterator();

    while (premadeCommentListIterator.hasNext()) {
      PremadeComment premadeComment = premadeCommentListIterator.next();
      Long currentListPosition = premadeComment.getListPosition();

      /*
       * check if the current premade comment list position is larger
       * than the list position we are deleting since we only need
       * to shift list positions that are higher than the one we
       * are deleting.
       */
      if (currentListPosition > listPositionDeleted) {
        try {
          premadeCommentService.updatePremadeCommentListPosition(premadeComment.getId(), currentListPosition - 1);
        } catch (ObjectNotFoundException e) {
          e.printStackTrace();
        }
      }
    }
  }

  /**
   * Update the list positions since we have re-ordered the list
   * @param premadeCommentListId the id of the premade comment list
   * @param listPositions a JSONArray containing the order of the premade comment ids
   * the index is the list position and the value is the premade comment id
   *
   * e.g.
   * premade comment 10 = "great job"
   * premade comment 11 = "needs more facts"
   * premade comment 12 = "incorrect"
   *
   * are in a list and in the list they are sorted in the order
   *
   * "needs more facts"
   * "great job"
   * "incorrect"
   *
   * so the array will contain the premade comment ids in this order
   *
   * 11, 10, 12
   */
  private void updateListPositionsOnReOrder(Long premadeCommentListId, JSONArray listPositions) {
    for (int x = 0; x < listPositions.length(); x++) {
      try {
        long premadeCommentId = listPositions.getLong(x);

        /*
         * update the list position for the premade comment id. the list position
         * is the index in the array incremented by 1. from the example above,
         * the list positions would be
         * index - premadeCommentId - listPosition
         * [0] - 11 - 1
         * [1] - 10 - 2
         * [2] - 12 - 3
         *
         * note: when we display the premade comments in the teacher UI,
         * the higher numbered list positions are at the top and the lower
         * numbered list positions are at the bottom
         */
        premadeCommentService.updatePremadeCommentListPosition(premadeCommentId, new Long(x + 1));
      } catch (ObjectNotFoundException e) {
        e.printStackTrace();
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
  }
}
