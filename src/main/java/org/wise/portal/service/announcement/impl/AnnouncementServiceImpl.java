/**
 * Copyright (c) 2008-2014 Regents of the University of California (Regents). 
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
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.service.announcement.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.announcement.AnnouncementDao;
import org.wise.portal.domain.announcement.Announcement;
import org.wise.portal.domain.announcement.impl.AnnouncementImpl;
import org.wise.portal.domain.impl.AnnouncementParameters;
import org.wise.portal.service.announcement.AnnouncementService;

/**
 * @author patrick lawler
 * @version $Id:$
 */
@Service
public class AnnouncementServiceImpl implements AnnouncementService{

	@Autowired
	private AnnouncementDao<Announcement> announcementDao;
	
	/**
	 * @see org.wise.portal.service.announcement.AnnouncementService#createAnnouncement(org.wise.portal.domain.impl.AnnouncementParameters)
	 */
	@Transactional()
	public Announcement createAnnouncement(AnnouncementParameters params){
		Announcement announcement = new AnnouncementImpl();
		announcement.setTitle(params.getTitle());
		announcement.setTimestamp(params.getTimestamp());
		announcement.setAnnouncement(params.getAnnouncement());
		
		announcementDao.save(announcement);
		return announcement;
	}
	
	/**
	 * @see org.wise.portal.service.announcement.AnnouncementService#deleteAnnouncement(long)
	 */
	@Transactional()
	public void deleteAnnouncement(long id){
		try{
			Announcement announcement = announcementDao.getById(id);
			announcementDao.delete(announcement);
		} catch(ObjectNotFoundException e) {
		}
	}
	
	/**
	 * @see org.wise.portal.service.announcement.AnnouncementService#updateAnnouncement(long, org.wise.portal.domain.impl.AnnouncementParameters)
	 */
	@Transactional()
	public Announcement updateAnnouncement(long id, AnnouncementParameters params) throws ObjectNotFoundException{
		try{
			Announcement announcement = announcementDao.getById(id);
			announcement.setTitle(params.getTitle());
			announcement.setTimestamp(params.getTimestamp());
			announcement.setAnnouncement(params.getAnnouncement());
			announcementDao.save(announcement);
			return announcement;
		} catch(ObjectNotFoundException e){
			throw e;
		}
	}
	
	/**
	 * @see org.wise.portal.service.announcement.AnnouncementService#retrieveById(long)
	 */
	@Transactional()
	public Announcement retrieveById(long id) throws ObjectNotFoundException{
		try{
			Announcement announcement = announcementDao.getById(id);
			return announcement;
		} catch(ObjectNotFoundException e){
			throw e;
		}
	}
}
