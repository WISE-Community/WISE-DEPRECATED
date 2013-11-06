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

/**
 * A form-backing obejct for WISE students when adding a 
 * new project
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public class AddProjectParameters implements Serializable {

	private static final long serialVersionUID = 1L;
	
	private String projectcode;
	private String runCode_part1;    // first part of projectcode, e.g. "Swan155"
	private String runCode_part2;    // period, e.g. "1"

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
	 * @return the runCode_part1
	 */
	public String getRunCode_part1() {
		return runCode_part1;
	}

	/**
	 * @param runCodePart1 the runCode_part1 to set
	 */
	public void setRunCode_part1(String runCodePart1) {
		runCode_part1 = runCodePart1;
	}

	/**
	 * @return the runCode_part2
	 */
	public String getRunCode_part2() {
		return runCode_part2;
	}

	/**
	 * @param runCodePart2 the runCode_part2 to set
	 */
	public void setRunCode_part2(String runCodePart2) {
		runCode_part2 = runCodePart2;
	}
}
