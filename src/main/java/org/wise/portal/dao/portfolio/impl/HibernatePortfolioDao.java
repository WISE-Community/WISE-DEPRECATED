/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3.
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
package org.wise.portal.dao.portfolio.impl;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.portfolio.PortfolioDao;
import org.wise.vle.domain.ideabasket.IdeaBasket;
import org.wise.vle.domain.portfolio.Portfolio;

/**
 * @author Hiroki Terashima
 * @version $Id:$
 */
@Repository
public class HibernatePortfolioDao extends AbstractHibernateDao<Portfolio> implements PortfolioDao<Portfolio> {

	/**
	 * Get the latest Portfolio with the given run id and workgroup id
	 * @param runId the id of the run
	 * @param workgroupId the id of the workgroup
	 * @return the Portfolio with the matching runId and workgroupId
	 */
	@Transactional(readOnly=true)
	public Portfolio getPortfolioByRunIdWorkgroupId(long runId, long workgroupId) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        
        //find the latest Portfolio object that matches
        List<Portfolio> result = session.createCriteria(Portfolio.class).add(
        		Restrictions.eq("runId", runId)).add(
        				Restrictions.eq("workgroupId", workgroupId)).addOrder(Order.desc("postTime")).setMaxResults(1).list();
        
        Portfolio portfolio = null;
        if(result.size() > 0) {
        	/*
        	 * get the first Portfolio from the result list since 
        	 * there will only be one element in the list
        	 */
        	portfolio = result.get(0);
        }
        return portfolio;
	}
	
	@Transactional
	public void savePortfolio(Portfolio portfolio) {
		save(portfolio);
	}

	
	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends Portfolio> getDataObjectClass() {
		return null;
	}

}
