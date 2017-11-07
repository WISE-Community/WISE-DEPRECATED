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
package org.wise.portal.service.announcement;

import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.announcement.Announcement;
import org.wise.portal.domain.impl.AnnouncementParameters;

/**
 * A service for working with Announcement objects
 *
 * @author Patrick Lawler
 */
public interface AnnouncementService {

  /**
   * creates a new Announcement in the data store
   *
   * @param <code>AnnouncementParameters</code>
   * @return <code>Announcement</code>
   */
  Announcement createAnnouncement(AnnouncementParameters params);

  /**
   * deletes an Announcement from the data store
   *
   * @param <code>long</code> id
   */
  void deleteAnnouncement(Integer id);

  /**
   * updates an Announcement in the data store
   *
   * @param <code>long</code> id
   * @param <code>AnnouncementParameters</code> params
   * @return <code>Announcement</code>
   * @throws <code>ObjectNotFoundException</code>
   */
  Announcement updateAnnouncement(Integer id, AnnouncementParameters params) throws ObjectNotFoundException;

  /**
   * retrieves the Announcement with the given Id from the data store
   *
   * @param <code>long</code> id
   * @return <code>Announcement</code>
   * @throws <code>ObjectNotFoundException</code>
   */
  Announcement retrieveById(Integer id) throws ObjectNotFoundException;
}
