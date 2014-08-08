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
package org.wise.portal.service.portal.impl;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Serializable;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.portal.PortalDao;
import org.wise.portal.domain.portal.Portal;
import org.wise.portal.service.portal.PortalService;

/**
 * @author hirokiterashima
 * @version $Id$
 */
@Service
public class PortalServiceImpl implements PortalService {

	@Autowired
	private PortalDao<Portal> portalDao;
	
	/**
	 * @throws ObjectNotFoundException 
	 * @see org.wise.portal.service.portal.PortalService#getById(java.lang.Long)
	 */
	@Cacheable(value="portal")
	public Portal getById(Serializable id) throws ObjectNotFoundException {
		return portalDao.getById(id);
	}

	/**
	 * @see org.wise.portal.service.portal.PortalService#updatePortal(org.wise.portal.domain.portal.Portal)
	 */
	@Transactional()
	@CacheEvict(value="portal", allEntries=true)
	public void updatePortal(Portal portal) {
		this.portalDao.save(portal);
	}

	/**
	 * @throws Exception 
	 * @see org.wise.portal.service.portal.PortalService#getWISEVersion()
	 */
	public String getWISEVersion() throws Exception {
		InputStream in = getClass().getResourceAsStream("/version.json");
		BufferedReader streamReader = new BufferedReader(new InputStreamReader(in, "UTF-8")); 
		StringBuilder responseStrBuilder = new StringBuilder();

		String inputStr;
		while ((inputStr = streamReader.readLine()) != null) {
			responseStrBuilder.append(inputStr);
		}
		String thisWISEVersionJSONString = responseStrBuilder.toString();
		
		JSONObject thisWISEVersionJSON = new JSONObject(thisWISEVersionJSONString);
		String thisWISEMajorVersion = thisWISEVersionJSON.getString("major");
		String thisWISEMinorVersion = thisWISEVersionJSON.getString("minor");
	    return thisWISEMajorVersion + "." + thisWISEMinorVersion;
	}
}
