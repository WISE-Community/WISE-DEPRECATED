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
package org.telscenter.sail.webapp.service.premadecomment;

import java.util.Set;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;

import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.PremadeCommentListParameters;
import org.telscenter.sail.webapp.domain.impl.PremadeCommentParameters;
import org.telscenter.sail.webapp.domain.premadecomment.PremadeComment;
import org.telscenter.sail.webapp.domain.premadecomment.PremadeCommentList;

/**
 * A service for working with <code>PremadeComment</code>
 * and <code>PremadeCommentList</code> objects.
 * 
 * @author patrick lawler
 *
 */
public interface PremadeCommentService {

	/**
	 * Creates a new PremadeComment in the data store.
	 * 
	 * @param params <code>PremadeCommentParameters</code>
	 * @return PremadeComment
	 */
	public PremadeComment createPremadeComment(PremadeCommentParameters params);
	
	/**
	 * Removes a PremadeComment from the data store using its id.
	 * 
	 * @param commentID <code>Long</code>
	 */
	public void deletePremadeComment(Long commentID);
	
	/**
	 * Updates the comment in a PremadeComment using its id.
	 * 
	 * @param premadeCommentID <code>Long</code>
	 * @param newComment <code>String</code>
	 * @return updated PremadeComment
	 */
	public PremadeComment updatePremadeCommentMessage(Long premadeCommentID, String newComment)
		throws ObjectNotFoundException;
	
	/**
	 * Updates the listPosition in a PremadeComment using its id.
	 * @param premadeCommentId the id of the premade comment
	 * @param listPosition the new list position
	 * @return
	 * @throws ObjectNotFoundException
	 */
	public PremadeComment updatePremadeCommentListPosition (Long premadeCommentId, Long listPosition)
		throws ObjectNotFoundException;
	
	/**
	 * Updates the labels in a PremadeComment
	 * @param premadeCommentId the id of the premade comment
	 * @param labels the labels
	 * @return
	 * @throws ObjectNotFoundException
	 */
	public PremadeComment updatePremadeCommentLabels (Long premadeCommentId, String labels)
		throws ObjectNotFoundException;
	
	/**
	 * Retrieves all PremadeComments from the data store.
	 * 
	 * @return a Set<PremadeComment>
	 */	
	public Set<PremadeComment> retrieveAllPremadeComments();
	
	/**
	 * Retrieves all PremadeComments associated with a given user.
	 * 
	 * @param user <code>User</code>
	 * @return a Set<PremadeComment>
	 */
	public Set<PremadeComment> retrieveAllPremadeCommentsByUser(User user);
	
	/**
	 * Creates a new PremadeCommentList in the data store.
	 * 
	 * @param params <code>PremadeCommentListParameters</code>
	 * @return PremadeCommentList
	 */
	public PremadeCommentList createPremadeCommentList(PremadeCommentListParameters params);
	
	/**
	 * Removes a PremadeCommentList from the data store given its ID
	 * 
	 * @param commentListID <code>Long</code>
	 */
	public void deletePremadeCommentList(Long commentListID) throws ObjectNotFoundException;
	
	/**
	 * Updates the label of a PremadeCommentList given its ID
	 * and new label.
	 * 
	 * @param commentListID <code>Long</code>
	 * @param newLabel <code>String</code>
	 * @return PremadeCommentList
	 */
	public PremadeCommentList updatePremadeCommentListLabel(Long commentListID, String newLabel)
		throws ObjectNotFoundException;
	
	/**
	 * Adds a PremadeComment to the PremadeCommentList given
	 * the PremadeComment and the PremadeCommentList ID
	 * 
	 * @param commentListID <code>Long</code>
	 * @param premadeComment <code>PremadeComment</code>
	 * @return PremadeCommentList
	 */
	public PremadeCommentList addPremadeCommentToList(Long commentListID, PremadeComment premadeComment)
		throws ObjectNotFoundException;
	
	/**
	 * Removes a PremadeComment from the list of PremadeCommentList
	 * given the PremadeCommentList ID and the PremadeComment
	 * 
	 * @param commentListID <code>Long</code>
	 * @param PremadeComment <code>PremadeComment</code>
	 * @return PremadeCommentList
	 */
	public PremadeCommentList removePremadeCommentFromList(Long commentID, PremadeComment premadeComment)
		throws ObjectNotFoundException;
	
	/**
	 * Retrieves all PremadeCommentLists from the data store.
	 * 
	 * @return a Set<PremadeCommentList>
	 */	
	public Set<PremadeCommentList> retrieveAllPremadeCommentLists();
	
	/**
	 * Retrieves all PremadeCommentLists associated with a given user.
	 * 
	 * @param user <code>User</code>
	 * @return a Set<PremadeCommentList>
	 */
	public Set<PremadeCommentList> retrieveAllPremadeCommentListsByUser(User user);
	
	/**
	 * Retrieves all PremadeCommentLists associated with a given project id
	 * @param projectId
	 * @return
	 */
	public Set<PremadeCommentList> retrieveAllPremadeCommentListsByProject(Long projectId);
	
	/**
	 * Retrieves all PremadeCommentLists associated with a given run.
	 * 
	 * @param run <code>Run</code>
	 * @return a Set<PremadeCommentList>
	 */
	public Set<PremadeCommentList> retrieveAllPremadeCommentListsByRun(Run run);
	
	/**
	 * Retrieves all PremadeCommentLists that have the global field set to true
	 * @return a Set of PremadeCommentLists
	 */
	public Set<PremadeCommentList> retrieveAllGlobalPremadeCommentLists();
	
	/**
	 * Retrieves a PremadeCommentList with the given id
	 * @param id
	 * @return a PremadeCommentList or null if there is no PremadeCommentList with
	 * the given id
	 */
	public PremadeCommentList retrievePremadeCommentListById(Long id);
	
	/**
	 * Retrieves a PremadeComment with the given id
	 * @param id
	 * @return a PremadeCommet or null if there is no PremadeComment with the
	 * given id
	 */
	public PremadeComment retrievePremadeCommentById(Long id);
	
	/**
	 * Copies all the PremadeCommentLists that are associated with a project id
	 * @param fromProjectId the project id to copy from
	 * @param toProjectId the project id to set in all the new PremadeCommentLists
	 * @param toOwner the owner to set in all the new PremadeCommentLists
	 */
	public void copyPremadeCommentsFromProject(Long fromProjectId, Long toProjectId, User toOwner);
	
	/**
	 * Make the name for a premade comment list given the project id
	 * @param projectId the project id this list is for
	 * @return the premade comment list name
	 * e.g.
	 * 
	 * project with a run
	 * Project Id: 123, Run Id: 456, Chemical Reactions
	 * 
	 * project without a run
	 * Project Id: 123, Chemical Reactions
	 */
	public String makePremadeCommentListNameFromProjectId(Long projectId);
}
