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

import org.telscenter.sail.webapp.dao.premadecomment.PremadeCommentListDao;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.premadecomment.PremadeCommentList;
import org.telscenter.sail.webapp.domain.premadecomment.impl.PremadeCommentListImpl;
import net.sf.sail.webapp.dao.impl.AbstractHibernateDao;
import net.sf.sail.webapp.domain.User;

/**
 * @author patrick lawler
 *
 */
public class HibernatePremadeCommentListDao extends AbstractHibernateDao<PremadeCommentList> implements PremadeCommentListDao<PremadeCommentList>{

	private static final String FIND_ALL_QUERY = "from PremadeCommentListImpl";

	/**
	 * @see net.sf.sail.webapp.dao.impl.AbstractHibernateDao#getFindAllQuery()
	 */
	@Override
	protected String getFindAllQuery() {
		return FIND_ALL_QUERY;
	}
	
	/**
	 * @see net.sf.sail.webapp.dao.impl.AbstractHibernateDao#getDataObjectClass()
	 */
	@Override
	protected Class<PremadeCommentListImpl> getDataObjectClass() {
		return PremadeCommentListImpl.class;
	}
	
	public List<PremadeCommentList> getListByOwner(User user){
		String q = "select commentList from PremadeCommentListImpl commentList where commentList.owner.id='" + user.getId() + "'";
		return this.getHibernateTemplate().find(q);
	}
	
	public List<PremadeCommentList> getListByRun(Run run){
		String q = "select commentList from PremadeCommentListImpl commentList where commentList.run.id='" + run.getId() + "'";
		return this.getHibernateTemplate().find(q);
	}
	
	public List<PremadeCommentList> getListByProject(Long projectId){
		String q = "select commentList from PremadeCommentListImpl commentList where commentList.projectId='" + projectId + "'";
		return this.getHibernateTemplate().find(q);
	}
	
	public List<PremadeCommentList> getListByGlobal(){
		String q = "select commentList from PremadeCommentListImpl commentList where commentList.global=true";
		return this.getHibernateTemplate().find(q);
	}

	public PremadeCommentList getListById(Long id) {
		String q = "select commentList from PremadeCommentListImpl commentList where commentList.id='" + id + "'";
		List results = this.getHibernateTemplate().find(q);
		
		return (PremadeCommentList) results.get(0);	
	}
}
