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
package org.telscenter.sail.webapp.domain.impl;

/**
 * @author patrick lawler
 *
 */
public class LookupParameters {

	private String lookupField;
	
	private String lookupCriteria;
	
	private String lookupData;

	/**
	 * @return the lookupField
	 */
	public String getLookupField() {
		return lookupField;
	}

	/**
	 * @param lookupField the lookupField to set
	 */
	public void setLookupField(String lookupField) {
		this.lookupField = lookupField;
	}

	/**
	 * @return the lookupCriteria
	 */
	public String getLookupCriteria() {
		return lookupCriteria;
	}

	/**
	 * @param lookupCriteria the lookupCriteria to set
	 */
	public void setLookupCriteria(String lookupCriteria) {
		this.lookupCriteria = lookupCriteria;
	}

	/**
	 * @return the lookupData
	 */
	public String getLookupData() {
		return lookupData;
	}

	/**
	 * @param lookupData the lookupData to set
	 */
	public void setLookupData(String lookupData) {
		this.lookupData = lookupData;
	}
}
