/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
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
package org.telscenter.sail.webapp.service.announcement;

import java.util.Set;

import net.sf.sail.webapp.dao.ObjectNotFoundException;

import org.telscenter.sail.webapp.domain.announcement.Announcement;
import org.telscenter.sail.webapp.domain.impl.AnnouncementParameters;

/**
 * A service for working with Announcement objects
 * 
 * @author patrick lawler
 * @version $Id:$
 */
public interface AnnouncementService {

	/**
	 * creates a new Announcement in the data store
	 * 
	 * @param <code>AnnouncementParameters</code>
	 * @return <code>Announcement</code>
	 */
	public Announcement createAnnouncement(AnnouncementParameters params);
	
	/**
	 * deletes an Announcement from the data store
	 * 
	 * @param <code>long</code> id
	 */
	public void deleteAnnouncement(long id);
	
	/**
	 * updates an Announcement in the data store
	 * 
	 * @param <code>long</code> id
	 * @param <code>AnnouncementParameters</code> params
	 * @return <code>Announcement</code>
	 * @throws <code>ObjectNotFoundException</code>
	 */
	public Announcement updateAnnouncement(long id, AnnouncementParameters params) throws ObjectNotFoundException;
	
	/**
	 * retrieves all Announcements from the data store
	 * 
	 * @return <code>Set<Announcement></code>
	 */
	public Set<Announcement> retrieveAllAnnouncement();
	
	/**
	 * retrieves the Announcement with the given Id from the data store
	 * 
	 * @param <code>long</code> id
	 * @return <code>Announcement</code>
	 * @throws <code>ObjectNotFoundException</code>
	 */
	public Announcement retrieveById(long id) throws ObjectNotFoundException;
	
	/**
	 * retrieves the most recent Announcement from the data store
	 * 
	 * @return <code>Announcement</code>
	 * @throws <code>ObjectNotFoundException</code>
	 */
	public Announcement retrieveLatest() throws ObjectNotFoundException;
}
