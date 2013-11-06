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
package org.telscenter.sail.webapp.service.announcement.impl;

import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import net.sf.sail.webapp.dao.ObjectNotFoundException;

import org.springframework.transaction.annotation.Transactional;
import org.telscenter.sail.webapp.dao.announcement.AnnouncementDao;
import org.telscenter.sail.webapp.domain.announcement.Announcement;
import org.telscenter.sail.webapp.domain.announcement.impl.AnnouncementImpl;
import org.telscenter.sail.webapp.domain.impl.AnnouncementParameters;
import org.telscenter.sail.webapp.service.announcement.AnnouncementService;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public class AnnouncementServiceImpl implements AnnouncementService{

	private AnnouncementDao<Announcement> announcementDao;
	
	/**
	 * @see org.telscenter.sail.webapp.service.announcement.AnnouncementService#createAnnouncement(org.telscenter.sail.webapp.domain.impl.AnnouncementParameters)
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
	 * @see org.telscenter.sail.webapp.service.announcement.AnnouncementService#deleteAnnouncement(long)
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
	 * @see org.telscenter.sail.webapp.service.announcement.AnnouncementService#updateAnnouncement(long, org.telscenter.sail.webapp.domain.impl.AnnouncementParameters)
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
	 * @see org.telscenter.sail.webapp.service.announcement.AnnouncementService#retrieveAllAnnouncement()
	 */
	@Transactional()
	public Set<Announcement> retrieveAllAnnouncement(){
		Set<Announcement> announcements = new TreeSet<Announcement>();
		List<Announcement> announcementList = announcementDao.getList();
		announcements.addAll(announcementList);
		return announcements;
	}
	
	/**
	 * @see org.telscenter.sail.webapp.service.announcement.AnnouncementService#retrieveById(long)
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
	
	/**
	 * @see org.telscenter.sail.webapp.service.announcement.AnnouncementService#retrieveLatest()
	 */
	@Transactional()
	public Announcement retrieveLatest() throws ObjectNotFoundException{
		Set<Announcement> announcements = retrieveAllAnnouncement();
		if(announcements.isEmpty()){
			throw new ObjectNotFoundException(new Long(0), Announcement.class);
		} else {
			return announcements.iterator().next();
		}
	}

	/**
	 * @param announcementDao the announcementDao to set
	 */
	public void setAnnouncementDao(AnnouncementDao<Announcement> announcementDao) {
		this.announcementDao = announcementDao;
	}
}
