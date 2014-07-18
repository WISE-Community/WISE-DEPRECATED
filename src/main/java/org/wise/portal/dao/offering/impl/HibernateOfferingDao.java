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
package org.wise.portal.dao.offering.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Repository;
import org.wise.portal.dao.impl.AbstractHibernateDao;
import org.wise.portal.dao.offering.OfferingDao;
import org.wise.portal.domain.run.Offering;
import org.wise.portal.domain.run.impl.OfferingImpl;
import org.wise.portal.domain.workgroup.Workgroup;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
@Repository
public class HibernateOfferingDao extends AbstractHibernateDao<Offering>
        implements OfferingDao<Offering> {

    private static final String FIND_ALL_QUERY = "from OfferingImpl";

    /**
     * @see org.wise.portal.dao.impl.AbstractHibernateDao#getFindAllQuery()
     */
    @Override
    protected String getFindAllQuery() {
        return FIND_ALL_QUERY;
    }

	/**
	 * @see org.wise.portal.dao.impl.AbstractHibernateDao#getDataObjectClass()
	 */
	@Override
	protected Class<OfferingImpl> getDataObjectClass() {
		return OfferingImpl.class;
	}

	/**
	 * @see org.wise.portal.dao.offering.OfferingDao#getWorkgroupsForOffering(Long)
	 */
	@SuppressWarnings("unchecked")
	public Set<Workgroup> getWorkgroupsForOffering(Long offeringId) {
		List<Workgroup> workgroupList =  (List<Workgroup>) this.getHibernateTemplate()
		    .findByNamedParam(
		    		"from WorkgroupImpl as workgroup where workgroup.offering.id = :offeringId", 
		    		"offeringId", offeringId);

		Set<Workgroup> workgroupSet = new HashSet<Workgroup>();
		workgroupSet.addAll(workgroupList);
		return workgroupSet;
	}
    
    
}