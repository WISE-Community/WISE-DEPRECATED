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

import java.io.Serializable;
import org.telscenter.sail.webapp.domain.Run;
import net.sf.sail.webapp.domain.User;

/**
 * @author patrick lawler
 *
 */

public class ChangePeriodParameters implements Serializable{

	private static final long serialVersionUID = 1L;

	private User student;
	
	private Run run;
	
	private String projectcode;
	
	private String projectcodeTo;

	/**
	 * @return the student
	 */
	public User getStudent() {
		return student;
	}

	/**
	 * @param student the student to set
	 */
	public void setStudent(User student) {
		this.student = student;
	}

	/**
	 * @return the run
	 */
	public Run getRun() {
		return run;
	}

	/**
	 * @param run the run to set
	 */
	public void setRun(Run run) {
		this.run = run;
	}

	/**
	 * @return the projectcode
	 */
	public String getProjectcode() {
		return projectcode;
	}

	/**
	 * @param projectcode the projectcode to set
	 */
	public void setProjectcode(String projectcode) {
		this.projectcode = projectcode;
	}

	/**
	 * @return the projectcodeTo
	 */
	public String getProjectcodeTo() {
		return projectcodeTo;
	}

	/**
	 * @param projectcodeTo the projectcodeTo to set
	 */
	public void setProjectcodeTo(String projectcodeTo) {
		this.projectcodeTo = projectcodeTo;
	}
	
	
}
