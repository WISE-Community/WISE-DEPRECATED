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
package org.telscenter.sail.webapp.dao.premadecomment.impl;

import java.util.List;

import org.telscenter.sail.webapp.dao.premadecomment.PremadeCommentDao;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.premadecomment.PremadeComment;
import org.telscenter.sail.webapp.domain.premadecomment.impl.PremadeCommentImpl;

import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;
import net.sf.sail.webapp.domain.User;

/**
 * @author patrick lawler
 *
 */
public class HibernatePremadeCommentDao extends AbstractHibernateDao<PremadeComment> implements PremadeCommentDao<PremadeComment>{
	
	private static final String FIND_ALL_QUERY = "from PremadeCommentImpl";

	/**
	 * @see net.sf.sail.webapp.dao.impl.AbstractHibernateDao#getFindAllQuery()
	 */
	@Override
	protected String getFindAllQuery() {
		return FIND_ALL_QUERY;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.dao.premadecomment.PremadeCommentDao#getPremadeCommentsByUser(net.sf.sail.webapp.domain.User)
	 */
	public List<PremadeComment> getPremadeCommentsByUser(User owner){
		String q = "select comment from PremadeCommentImpl comment where comment.owner.id='" + owner.getId() + "'";
		return this.getHibernateTemplate().find(q);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.dao.premadecomment.PremadeCommentDao#getPremadeCommentsByRun(org.telscenter.sail.webapp.domain.Run)
	 */
	public List<PremadeComment> getPremadeCommentsByRun(Run run){
		String q = "select comment from PremadeCommentImpl comment where comment.run.id='" + run.getId() + "'";
		return this.getHibernateTemplate().find(q);
	}
	
	/**
	 * @see net.sf.sail.webapp.dao.impl.AbstractHibernateDao#getDataObjectClass()
	 */
	@Override
	protected Class<PremadeCommentImpl> getDataObjectClass() {
		return PremadeCommentImpl.class;
	}

	/**
	 * Get the premade comment given the id
	 */
	public PremadeComment getPremadeCommentById(Long id) {
		String q = "select comment from PremadeCommentImpl comment where comment.id='" + id + "'";
		List results = this.getHibernateTemplate().find(q);
		
		return (PremadeComment) results.get(0);
	}
	
}
