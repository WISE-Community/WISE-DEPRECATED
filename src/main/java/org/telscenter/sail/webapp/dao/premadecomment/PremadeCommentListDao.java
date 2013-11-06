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
package org.telscenter.sail.webapp.dao.premadecomment;

import java.util.List;

import net.sf.sail.webapp.dao.SimpleDao;
import net.sf.sail.webapp.domain.User;

import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.premadecomment.PremadeCommentList;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public interface PremadeCommentListDao<T extends PremadeCommentList> extends SimpleDao<T>{

	/**
	 * Returns a <code>List<PremadeCommentList></code> that the given <code>User</code> owns.
	 * 
	 * @param <code>User</code> user
	 * @return <code>List<PremadeCommentList></code>
	 */
	public List<PremadeCommentList> getListByOwner(User user);
	
	/**
	 * Returns a <code>List<PremadeCommentList></code> that is associated with the given <code>Run</code>.
	 * 
	 * @param <code>Run</code> run
	 * @return <code>List<PremadeCommentList></code>
	 */
	public List<PremadeCommentList> getListByRun(Run run);
	
	/**
	 * Returns a List of PremadeCommentList that are associated with the given project id
	 * @param projectId
	 * @return
	 */
	public List<PremadeCommentList> getListByProject(Long projectId);
	
	/**
	 * Returns a List of PremadeCommentList that have the global field set to true.
	 * @return
	 */
	public List<PremadeCommentList> getListByGlobal();
	
	/**
	 * Returns a PremadeCommentList that has the given id
	 * @param the id of the PremadeCommentList
	 * @return a PremadeCommentList or null if there is no PremadeCommentList
	 * with the given id
	 */
	public PremadeCommentList getListById(Long id);
}
