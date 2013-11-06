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
package org.telscenter.sail.webapp.domain.impl;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

import net.sf.sail.webapp.domain.CurnitVisitor;

import org.telscenter.sail.webapp.domain.Module;

/**
 * UrlModule: this module is a module that can be found on the web.
 * It stores one URL: url to where the .project.xml file can be retrieved.
 * @author hirokiterashima
 * @version $Id$
 */
@Entity
@Table(name = UrlModuleImpl.DATA_STORE_NAME)
public class UrlModuleImpl extends ModuleImpl implements Module {

	@Transient
	private static final long serialVersionUID = 1L;

	@Transient
	public static final String DATA_STORE_NAME = "urlmodules";

	private static final String COLUMN_NAME_RETREIVEMODULE_URL = "module_url";
	
	@Column(name = UrlModuleImpl.COLUMN_NAME_RETREIVEMODULE_URL)
	private String moduleUrl;  // url where the module file can be retrieved

	/**
	 * @return the moduleUrl
	 */
	public String getModuleUrl() {
		return moduleUrl;
	}

	/**
	 * @param moduleUrl the moduleUrl to set
	 */
	public void setModuleUrl(String moduleUrl) {
		this.moduleUrl = moduleUrl;
	}

    /**
     * @see net.sf.sail.webapp.domain.Curnit#accept(net.sf.sail.webapp.domain.CurnitVisitor)
     */
	public Object accept(CurnitVisitor visitor) {
		return visitor.visit(this);
	}
}
