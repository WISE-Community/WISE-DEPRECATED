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
package org.wise.portal.dao.statistics.impl;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.statistics.VLEStatisticsDao;
import org.wise.vle.domain.statistics.VLEStatistics;

@Repository
public class HibernateVLEStatisticsDao extends AbstractHibernateDao<VLEStatistics> implements VLEStatisticsDao<VLEStatistics> {

	@Override
	protected String getFindAllQuery() {
		return null;
	}

	@Override
	protected Class<? extends VLEStatistics> getDataObjectClass() {
		return null;
	}

	public VLEStatistics getVLEStatisticsById(Long id) {
		VLEStatistics vleStatistics = null;
		
		try {
			vleStatistics = getById(id);
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
		
		return vleStatistics;
	}
	
	@Transactional
	public void saveVLEStatistics(VLEStatistics vleStatistics) {
		save(vleStatistics);
	}
	
	/**
	 * Get all the vle statistics rows ordered from oldest to newest
	 * @return a list of all the vle statistics
	 */
	@Transactional(readOnly=true)
	public List<VLEStatistics> getVLEStatistics() {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        
        //get the vle statistics from oldest to newest
       return session.createCriteria(VLEStatistics.class).addOrder(Order.asc("timestamp")).list();
	}
	
	/**
	 * Gets latest vle statistics
	 * @return a list of all the vle statistics
	 */
	@Transactional(readOnly=true)
	public VLEStatistics getLatestVLEStatistics() {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
        
        //get the vle statistics from oldest to newest
       return (VLEStatistics) session.createCriteria(VLEStatistics.class).addOrder(Order.asc("timestamp")).setMaxResults(1).uniqueResult();
	}

}
