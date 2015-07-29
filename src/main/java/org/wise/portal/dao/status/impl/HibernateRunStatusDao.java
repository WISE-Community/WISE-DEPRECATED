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
package org.wise.portal.dao.status.impl;

import org.hibernate.NonUniqueResultException;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.status.RunStatusDao;
import org.wise.vle.domain.status.RunStatus;

@Repository
public class HibernateRunStatusDao extends AbstractHibernateDao<RunStatus> implements RunStatusDao<RunStatus> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends RunStatus> getDataObjectClass() {
		return null;
	}

	public RunStatus getRunStatusById(Long id) {
		RunStatus runStatus = null;
		
		try {
			runStatus = getById(id);
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
		
		return runStatus;
	}
	
	@Transactional
	public void saveRunStatus(RunStatus runStatus) {
		save(runStatus);
	}
	
	/**
	 * Get a RunStatus object given the run id
	 * @param runId the run id
	 * @return the RunStatus with the given run id or null if none is found
	 */
	@Transactional
	public RunStatus getRunStatusByRunId(Long runId) {
		RunStatus result = null;
		
		try {
			Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
			
			result = (RunStatus) session.createCriteria(RunStatus.class).add(Restrictions.eq("runId", runId)).uniqueResult();
			
		} catch (NonUniqueResultException e) {
			throw e;
		}
		
		return result;
	}
}
