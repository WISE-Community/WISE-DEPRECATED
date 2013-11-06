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
package org.telscenter.sail.webapp.domain.portal.impl;

import java.util.Properties;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.Version;

import org.telscenter.sail.webapp.domain.portal.Portal;
import org.telscenter.sail.webapp.presentation.util.json.JSONException;
import org.telscenter.sail.webapp.presentation.util.json.JSONObject;

/**
 * TELS Portal implementation.
 * 
 * @author hirokiterashima
 * @version $Id$
 */
@Entity
@Table(name = PortalImpl.DATA_STORE_NAME)
public class PortalImpl implements Portal {

	@Transient
	private static final long serialVersionUID = 1L;

	@Transient
	public static final String DATA_STORE_NAME = "portal";

	@Transient
	private static final String COLUMN_NAME_SENDMAIL_PROPERTIES = "sendmail_properties";

	@SuppressWarnings("unused")
	@Transient
	private static final String COLUMN_NAME_GOOGLEMAPS_API_KEY = "googlemaps_api_key";

	@Transient
	private static final String COLUMN_NAME_PORTAL_NAME = "portalname";

	@Transient
	private static final String COLUMN_NAME_SENDMAIL_ON_EXCEPTION = "sendmail_on_exception";
	
	@Transient
	private static final String COLUMN_NAME_ADDRESS = "address";

	@Transient
	private static final String COLUMN_NAME_COMMENTS = "comments";

	@Transient
	private static final String COLUMN_NAME_SETTINGS = "settings";
	
	@Transient
	private static final String COLUMN_NAME_GOOGLE_MAP_KEY = "google_map_key";

	@Column(name = COLUMN_NAME_PORTAL_NAME)
	private String portalName;
	
	@Column(name = COLUMN_NAME_ADDRESS)
	protected String address;
	
	@Column(name = COLUMN_NAME_SENDMAIL_ON_EXCEPTION)
	private boolean isSendMailOnException;
	
	@Column(name = COLUMN_NAME_GOOGLE_MAP_KEY)
	private String googleMapKey;
	
	@Column(name = COLUMN_NAME_SENDMAIL_PROPERTIES)
	private Properties sendmailProperties;
	
	@Column(name = COLUMN_NAME_COMMENTS)
	private String comments;
	
	@Column(name = COLUMN_NAME_SETTINGS, length = 32768)
	private String settings;  // text (blob) 2^15
	
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
	public Long id = null;

    @Version
    @Column(name = "OPTLOCK")
    protected Integer version = null;

	/**
	 * @return the sendEmailOnException
	 */
	public boolean isSendMailOnException() {
		return isSendMailOnException;
	}

	/**
	 * @param sendEmailOnException the sendEmailOnException to set
	 */
	public void setSendMailOnException(boolean isSendMailOnException) {
		this.isSendMailOnException = isSendMailOnException;
	}

	/**
	 * @return the sendmailProperties
	 */
	public Properties getSendmailProperties() {
		return sendmailProperties;
	}

	/**
	 * @param sendmailProperties the sendmailProperties to set
	 */
	public void setSendmailProperties(Properties sendmailProperties) {
		this.sendmailProperties = sendmailProperties;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.portal.Portal#getPortalName()
	 */
	public String getPortalName() {
		return this.portalName;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.portal.Portal#setPortalName(java.lang.String)
	 */
	public void setPortalName(String portalName) {
		this.portalName = portalName;
	}

	 /**
     * @see net.sf.sail.webapp.domain.Curnit#getId()
     */
    public Long getId() {
        return this.id;
    }

    @SuppressWarnings("unused")
    private void setId(Long id) {
        this.id = id;
    }
    
    @SuppressWarnings("unused")
    private Integer getVersion() {
        return this.version;
    }

    @SuppressWarnings("unused")
    private void setVersion(Integer version) {
        this.version = version;
    }

	/**
	 * @return the comments
	 */
	public String getComments() {
		return comments;
	}

	/**
	 * @param comments the comments to set
	 */
	public void setComments(String comments) {
		this.comments = comments;
	}

	/**
	 * @return the settings
	 */
	public String getSettings() {
		return settings;
	}

	/**
	 * @param settings the settings to set
	 */
	public void setSettings(String settings) {
		this.settings = settings;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.portal.Portal#isLoginAllowed()
	 */
	public boolean isLoginAllowed() {
		try {
			JSONObject settings = new JSONObject(getSettings());
			return settings.getBoolean("isLoginAllowed");
		} catch (JSONException e) {
		}		
		return true;  // allow login by default if there was an exception
	}
	
	/**
	 * @see org.telscenter.sail.webapp.domain.portal.Portal#setLoginAllowed(boolean)
	 */
	public void setLoginAllowed(boolean loginAllowed) {
		try {
			JSONObject settings = new JSONObject(getSettings());
			settings.put("isLoginAllowed", loginAllowed);
			this.setSettings(settings.toString());
		} catch (JSONException e) {
		}		
	}
	
	/**
	 * @return the address
	 */
	public String getAddress() {
		return address;
	}

	/**
	 * @param address the address to set
	 */
	public void setAddress(String address) {
		this.address = address;
	}

	/**
	 * @return the googleMapKey
	 */
	public String getGoogleMapKey() {
		return googleMapKey;
	}

	/**
	 * @param googleMapKey the googleMapKey to set
	 */
	public void setGoogleMapKey(String googleMapKey) {
		this.googleMapKey = googleMapKey;
	}
}
