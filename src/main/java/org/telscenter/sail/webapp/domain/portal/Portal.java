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
package org.telscenter.sail.webapp.domain.portal;

import java.util.Properties;

import net.sf.sail.webapp.domain.Persistable;

/**
 * Portal domain object. Settings that should be saved in datastore and 
 * configurable at runtime.
 * 
 * @author hirokiterashima
 * @version $Id$
 */
public interface Portal extends Persistable {
	
	/**
	 * Should email be sent when an exception is thrown in the portal?
	 * 
	 * @return the sendEmailOnException
	 */
	public boolean isSendMailOnException();
	
	/**
	 * Set whether email should be sent when an exception is thrown 
	 * in the portal.
	 * 
	 * @param sendEmailOnException the sendEmailOnException to set
	 */
	public void setSendMailOnException(boolean sendEmailOnException);
	
	/**
	 * @return the sendmailProperties
	 */
	public Properties getSendmailProperties();
	
	/**
	 * @param sendmailProperties the sendmailProperties to set
	 */
	public void setSendmailProperties(Properties sendmailProperties);
	
	/**
	 * Returns this portal's name.
	 * 
	 * @return
	 */
	public String getPortalName();
	
	/**
	 * Returns this portal's name.
	 * 
	 * @return
	 */
	public void setPortalName(String portalName);
	
	/**
	 * @return the comments
	 */
	public String getComments();
	
	/**
	 * @param comments the comments to set
	 */
	public void setComments(String comments);

	/**
	 * @return the settings
	 */
	public String getSettings();
	
	/**
	 * @param settings the settings to set
	 */
	public void setSettings(String settings);
	
	/**
	 * can users log into this portal at this time?
	 * @return
	 */
	public boolean isLoginAllowed();
	
	/**
	 * can users log into this portal at this time?
	 * @param loginAllowed
	 */
	public void setLoginAllowed(boolean loginAllowed);
	
	/**
	 * @return the address
	 */
	public String getAddress();

	/**
	 * @param address the address to set
	 */
	public void setAddress(String address);
	
	/**
	 * Gets the Googlemap key used by this portal.
	 * @return
	 */
	public String getGoogleMapKey();

	/**
	 * Gets the Googlemap key used by this portal.
	 * @return
	 */
	public void setGoogleMapKey(String googleMapKey);
}
