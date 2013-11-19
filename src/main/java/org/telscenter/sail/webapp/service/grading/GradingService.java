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
package org.telscenter.sail.webapp.service.grading;

import java.util.List;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.annotation.AnnotationBundle;

import org.telscenter.sail.webapp.domain.grading.GradeWorkByWorkgroupAggregate;

/**
 * Services for WISE teachers for grading student work. Grading involves
 * working with <code>Curnitmap</code>, <code>AnnotationBundle</code>,
 * <code>SessionBundle</code> objects and services that are available for
 * those objects.
 * 
 * @author Hiroki Terashima
 * @version $Id$
 */
public interface GradingService {
	
	/**
	 * Returns an aggregate object to allow WISE teachers to grade student work
	 * of a particular <code>Workgroup</code> of a particular 
	 * <code>Project</code> that is being used in a <code>Run</code> indicated
	 * by the runId.
	 * 
	 * All of the specified workgroup's work is retrieved along with its
	 * <code>AnnotationBundle</code> for the entire project.
	 * 
	 * @param runId id of the run that the teacher wants to grade
	 * @param workgroupId particular workgroup that the teacher wants to grade
	 * @return <code>gradeWorkAggregate</code> containing all of the workgroup's
	 *     work for the entire project.
	 * @throws ObjectNotFoundException when the provided runId
	 *     does not key to an existing <code>Run</code>
	 */
	public GradeWorkByWorkgroupAggregate getGradeWorkByWorkgroupAggregate(Long runId, Workgroup workgroup) throws ObjectNotFoundException;
	
	/**
	 * Returns the sum of all the grade-able items of the <code>Run</code> identified
	 * by the runId
	 * 
	 * @param runId unique <code>Run</code> identifier to retrieve
	 * @return sum of all grade-able items of the <code>Run</code> as a Float
 	 * @throws ObjectNotFoundException when the provided runId
	 *     does not key to an existing <code>Run</code>
	 */
	public Float getTotalPossibleScore(Long runId) throws ObjectNotFoundException;
	
	/**
	 * @param sessionBundleService <code>SessionBundleService</code> to set
	 */
	public void setSessionBundleService(SessionBundleService sessionBundleService);
}