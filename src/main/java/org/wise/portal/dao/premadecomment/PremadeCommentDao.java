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
package org.wise.portal.dao.premadecomment;

import java.util.List;


import org.wise.portal.dao.SimpleDao;
import org.wise.portal.domain.premadecomment.PremadeComment;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;

/**
 * @author Patrick Lawler
 *
 */
public interface PremadeCommentDao<T extends PremadeComment> extends SimpleDao<T>{

	/**
	 * Retrieves a <code>List<PremadeComment> that is owned by the given <code>User</code>
	 * 
	 * @param <code>User</code> owner
	 * @return <code>List<PremadeComment></code>
	 */
	List<PremadeComment> getPremadeCommentsByUser(User owner);
	
	/**
	 * Retrieves a <code>List<PremadeComment> that is owned by the given <code>Run</code>
	 * 
	 * @param <code>Run</code> run
	 * @return <code>List<PremadeComment></code>
	 */
	List<PremadeComment> getPremadeCommentsByRun(Run run);
	
	/**
	 * Retrieves a PremadeComment with the given id
	 * @param id the id of the PremadeComment
	 * @return a PremadeComment or null if there is no PremadeComment with the
	 * given id
	 */
	PremadeComment getPremadeCommentById(Long id);
}
