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
package org.telscenter.sail.webapp.domain.announcement.impl;

import java.util.Date;

import org.telscenter.sail.webapp.domain.announcement.Announcement;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;
import javax.persistence.Transient;

/**
 * Announcement domain object that contains Title (String), Timestamp (Date),
 * and the Announcement (String)
 * 
 * @author patrick lawler
 * @version $Id:$
 */

@Entity
@Table(name = AnnouncementImpl.DATA_STORE_NAME)
public class AnnouncementImpl implements Announcement, Comparable<Announcement>{

	@Transient
	public final static String DATA_STORE_NAME = "announcements";
	
	@Transient
	private final static String COLUMN_NAME_TITLE = "title";
	
	@Transient
	private final static String COLUMN_NAME_TIMESTAMP = "timestamp";
	
	@Transient
	private final static String COLUMN_NAME_ANNOUNCEMENT = "announcement";
	
	@Transient
	private static final long serialVersionUID = 1L;
	
	@Column(name = AnnouncementImpl.COLUMN_NAME_TITLE, nullable=false)
	private String title;
	
	@Column(name = AnnouncementImpl.COLUMN_NAME_TIMESTAMP, nullable=false)
	private Date timestamp;
	
	@Lob
	@Column(name = AnnouncementImpl.COLUMN_NAME_ANNOUNCEMENT, nullable=false)
	private String announcement;
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private long id;

	/**
	 * @return the title
	 */
	public String getTitle() {
		return title;
	}

	/**
	 * @param title the title to set
	 */
	public void setTitle(String title) {
		this.title = title;
	}

	/**
	 * @return the timestamp
	 */
	public Date getTimestamp() {
		return timestamp;
	}

	/**
	 * @param timestamp the timestamp to set
	 */
	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	/**
	 * @return the announcement
	 */
	public String getAnnouncement() {
		return announcement;
	}

	/**
	 * @param announcement the announcement to set
	 */
	public void setAnnouncement(String announcement) {
		this.announcement = announcement;
	}

	/**
	 * @return the id
	 */
	public Long getId() {
		return id;
	}

	/**
	 * @param id the id to set
	 */
	public void setId(Long id) {
		this.id = id;
	}
	
	public int compareTo(Announcement announcement){
		return announcement.getId().compareTo(this.getId());
	}
}
