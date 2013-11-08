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
package org.telscenter.sail.webapp.dao.offering;

import java.util.List;
import java.util.Set;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.offering.OfferingDao;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;

import org.telscenter.sail.webapp.domain.Run;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public interface RunDao<T extends Run> extends OfferingDao<Run> {

    /**
	 * Given an input string retrieve a corresponding record from data store.
	 * 
	 * @param runcode
	 *            <code>String</code> representing the runcode of the data in
	 *            the data store.
	 * @return A new instance of a data object.
	 * @throws ObjectNotFoundException if Run is not found.
	 */
	public Run retrieveByRunCode(String runcode) throws ObjectNotFoundException;
	
    /**
     * Given a field, search type, search term
     *  retrieves a list of Runs from data store.
     *  
     *  @param field
     *  @param type comparator, ie like, =, <, >, etc
     *  @param search term what to compare against ie '%john%' (if type is 'like'), 'john'
     */
    public List<T> retrieveByField(String field, String type, Object term);
    
    /**
     * Retrieves a list of runs from the data store given a <code>User</code>
     * who is the owner of the runs.
     * 
     * @param owner <code>User</code>
     * @return a list of runs that the specified user owns
     */
    public List<T> getRunListByOwner(User owner);
    
    /**
     * Retrieves a list of runs from the data store given a <code>User</code>
     * who is the shared-owner of the runs.
     * 
     * @param owner <code>User</code>
     * @return a list of runs that the specified user owns
     */
	public List<Run> getRunListBySharedOwner(User owner);

    /**
     * Retrieves a <code>List<Run></code> list of runs from the data store given a
     * <code>User</code> who is attached to a period that is attached to the run.
     * 
     * @param <code>User</code> user
     * @return <code>List<Run></code>
     */
    public List<Run> getRunListByUserInPeriod(User user);
    
    /**
     * Retrieves a <code>List<WISEWorkgroup></code> given a <code>Long</code> runId and
     * <code>Long</code> periodId
     * 
     * @param <code>Long</code> offeringId
     * @param <code>Long</code> periodId
     * @return <code>List<WISEWorkgroup></code>
     */
    public Set<Workgroup> getWorkgroupsForOfferingAndPeriod(Long offeringId, Long periodId);
    
    /**
     * Retrieves a <code>List</code> of <code>Run</code> that are associated with the
     * given <code>Long</code> project id.
     * 
     * @param <code>Long</code> id
     * @return <code>List<Run></code>
     */
    public List<Run> getRunsOfProject(Long id);
    
    /**
     * Returns a <code>List<Run></code> list of runs that were run within the
     * given <code>String</code> period. Valid periods are "today","week" and "month".
     * 
     * @param String - period
     * @return List<Run> - run list
     */
    public List<Run> getRunsRunWithinPeriod(String period);
    
    /**
     * Returns a <code>List<Run></code> list of runs ordered descending by how
     * active they are.
     * 
     * @return List<Run> - list of runs descending by activity
     */
    public List<Run> getRunsByActivity();
}
