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
package org.wise.portal.domain.announcement;

import java.util.Date;

/**
 * An announcement consists of a timestamp, title and the announcement
 * body which is in an unspecified format.
 * 
 * @author Patrick Lawler
 */
public interface Announcement {

	/**
	 * @return <code>String</code> the announcement to get
	 */
	String getAnnouncement();
	
	/**
	 * @param <code>String</code> the announcement to set
	 */
	void setAnnouncement(String announcement);
	
	/**
	 * @return <code>Date</code> the timestamp of this announcement
	 */
	Date getTimestamp();
	
	/**
	 * @param <code>Date</code> timestamp to set
	 */
	void setTimestamp(Date timestamp);
	
	/**
	 * @return <code>String</code> the title of this announcement
	 */
	String getTitle();
	
	/**
	 * @param <code>String</code> the title to set
	 */
	void setTitle(String title);
	
	/**
	 * @return <code>Long</code> this id
	 */
	Long getId();
	
	/**
	 * @param <code>Long</code> the id to set
	 */
	void setId(Long id);
}
