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
package org.telscenter.sail.webapp.domain.workgroup;

import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.group.Group;

/**
 * A WISE <code>Workgroup</code> is a more specific manifestation of
 * PAS <code>Workgroup</code>.  Every WISE workgroup belongs in a
 * Period (which is a <code>Group</code>).
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public interface WISEWorkgroup extends Workgroup  {

	/**
	 * Gets the period that this workgroup belongs in
	 * 
	 * @return <code>Group</code> (Period) that this workgroup belongs in
	 */
	public Group getPeriod();
	
	/**
	 * Sets the periods that this workgroup belongs in
	 * 
	 * @param period the <code>Group</code> to set
	 */
	public void setPeriod(Group period);
	
	/**
	 * Returns the url that generates this workgroup's work as PDF
	 * 
	 * @return the url that generates this workgroup's work as PDF
	 */
	public String getWorkPDFUrl();

	/**
	 * Sets the url that generates this workgroup's work as PDF
	 * 
	 * @param url that generates this workgroup's work as PDF
	 */
	public void setWorkPDFUrl(String url);

	/**
	 * @return the externalId
	 */
	public Long getExternalId();

	/**
	 * @param externalId the externalId to set
	 */
	public void setExternalId(Long externalId);
	
	/**
	 * @return the teacherWorkgroup if this workgroup is teacher's
	 * workgroup
	 */
	public boolean isTeacherWorkgroup();

	/**
	 * @param teacherWorkgroup the teacherWorkgroup to set
	 */
	public void setTeacherWorkgroup(boolean teacherWorkgroup);
}
