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
package org.telscenter.sail.webapp.domain.newsitem;

import java.util.Date;

import net.sf.sail.webapp.domain.User;

/**
 * A News Item that contains an unspecified format for the news
 * but includes the date of creation.
 * 
 * @author patrick lawler
 *
 */
public interface NewsItem {
	
	/**
	 * @return the News Item
	 */
	public String getNews();
	
	/** 
	 * @param news - the News Item to set
	 */
	public void setNews(String news);
	
	/**
	 * @return the object id
	 */
	public Long getId();
	
	/**
	 * @param id - the id to set
	 */
	public void setId(Long id);
	
	/**
	 * @return the Date of the News Item
	 */
	public Date getDate();
	
	/**
	 * @param date - the Date of the News Item to set
	 */
	public void setDate(Date date);
	
	/**
	 * @return User - the Owner of the News Item
	 */
	public User getOwner();
	
	/**
	 * @param User - the Owner of the News Item
	 */
	public void setOwner(User owner);
	
	/**
	 * @return String - the Title of the News Item
	 */
	public String getTitle();
	
	/**
	 * @param String - the Title of the News Item
	 */
	public void setTitle(String title);

}
