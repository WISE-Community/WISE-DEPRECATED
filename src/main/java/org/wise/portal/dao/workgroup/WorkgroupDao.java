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
package org.wise.portal.dao.workgroup;

import java.util.List;

import org.wise.portal.dao.SimpleDao;
import org.wise.portal.domain.run.Offering;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public interface WorkgroupDao<T extends Workgroup> extends SimpleDao<T> {

    /**
     * Gets a list of workgroups for the specified user in for the specified offering
     * 
     * @return a <code>Workgroup</code> <code>List</code>
     */
    public List<T> getListByOfferingAndUser(Offering offering, User user);
    
    /**
     * Gets a list of workgroups for the specified user
     * 
     * @return a <code>Workgroup</code> <code>List</code>
     */
    public List<T> getListByUser(User user);

    /**
     * Get specified workgroup id. Fetch all fields is specified
     * @param workgroupId
     * @param doEagerFetch true if we should fetch all fields eagerly
     * @return
     */
	public Workgroup getById(Long workgroupId, boolean doEagerFetch);

}