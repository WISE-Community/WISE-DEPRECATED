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
package org.telscenter.sail.webapp.dao.premadecomment;

import java.util.List;

import net.sf.sail.webapp.dao.SimpleDao;
import net.sf.sail.webapp.domain.User;

import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.premadecomment.PremadeComment;

/**
 * @author patrick lawler
 *
 */
public interface PremadeCommentDao<T extends PremadeComment> extends SimpleDao<T>{

	/**
	 * Retrieves a <code>List<PremadeComment> that is owned by the given <code>User</code>
	 * 
	 * @param <code>User</code> owner
	 * @return <code>List<PremadeComment></code>
	 */
	public List<PremadeComment> getPremadeCommentsByUser(User owner);
	
	/**
	 * Retrieves a <code>List<PremadeComment> that is owned by the given <code>Run</code>
	 * 
	 * @param <code>Run</code> run
	 * @return <code>List<PremadeComment></code>
	 */
	public List<PremadeComment> getPremadeCommentsByRun(Run run);
	
	/**
	 * Retrieves a PremadeComment with the given id
	 * @param id the id of the PremadeComment
	 * @return a PremadeComment or null if there is no PremadeComment with the
	 * given id
	 */
	public PremadeComment getPremadeCommentById(Long id);
}
