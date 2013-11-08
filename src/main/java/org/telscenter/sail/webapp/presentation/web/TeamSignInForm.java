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
package org.telscenter.sail.webapp.presentation.web;

import java.io.Serializable;

/**
 * The class encapsulates all of the data necessary for students
 * in a workgroup to sign in before starting a project
 * 
 * @author Hiroki Terashima
 * @version $Id: $
 */
public class TeamSignInForm implements Serializable {

	private static final long serialVersionUID = 1L;
	
	private Long runId;
	
	private int maxWorkgroupSize;
	
	private String username1="", username2="", username3="", username4="", username5="", username6="", username7="", username8="", username9="", username10="",
						      password2, password3, password4, password5, password6, password7, password8, password9, password10;

	/**
	 * @return the runId
	 */
	public Long getRunId() {
		return runId;
	}

	/**
	 * @param runId the runId to set
	 */
	public void setRunId(Long runId) {
		this.runId = runId;
	}

	/**
	 * @return the maxWorkgroupSize
	 */
	public int getMaxWorkgroupSize() {
		return maxWorkgroupSize;
	}

	/**
	 * @param maxWorkgroupSize the maxWorkgroupSize to set
	 */
	public void setMaxWorkgroupSize(int maxWorkgroupSize) {
		this.maxWorkgroupSize = maxWorkgroupSize;
	}

	/**
	 * @return the password2
	 */
	public String getPassword2() {
		return password2;
	}

	/**
	 * @param password2 the password2 to set
	 */
	public void setPassword2(String password2) {
		this.password2 = password2;
	}

	/**
	 * @return the password3
	 */
	public String getPassword3() {
		return password3;
	}

	/**
	 * @param password3 the password3 to set
	 */
	public void setPassword3(String password3) {
		this.password3 = password3;
	}

	/**
	 * @return the password4
	 */
	public String getPassword4() {
		return password4;
	}

	/**
	 * @param password4 the password4 to set
	 */
	public void setPassword4(String password4) {
		this.password4 = password4;
	}

	/**
	 * @return the password5
	 */
	public String getPassword5() {
		return password5;
	}

	/**
	 * @param password5 the password5 to set
	 */
	public void setPassword5(String password5) {
		this.password5 = password5;
	}

	/**
	 * @return the password6
	 */
	public String getPassword6() {
		return password6;
	}

	/**
	 * @param password6 the password6 to set
	 */
	public void setPassword6(String password6) {
		this.password6 = password6;
	}

	/**
	 * @return the password7
	 */
	public String getPassword7() {
		return password7;
	}

	/**
	 * @param password7 the password7 to set
	 */
	public void setPassword7(String password7) {
		this.password7 = password7;
	}

	/**
	 * @return the password8
	 */
	public String getPassword8() {
		return password8;
	}

	/**
	 * @param password8 the password8 to set
	 */
	public void setPassword8(String password8) {
		this.password8 = password8;
	}

	/**
	 * @return the password9
	 */
	public String getPassword9() {
		return password9;
	}

	/**
	 * @param password9 the password9 to set
	 */
	public void setPassword9(String password9) {
		this.password9 = password9;
	}

	/**
	 * @return the password10
	 */
	public String getPassword10() {
		return password10;
	}

	/**
	 * @param password10 the password10 to set
	 */
	public void setPassword10(String password10) {
		this.password10 = password10;
	}

	/**
	 * @return the username1
	 */
	public String getUsername1() {
		return username1;
	}

	/**
	 * @param username1 the username1 to set
	 */
	public void setUsername1(String username1) {
		this.username1 = username1;
	}

	/**
	 * @return the username2
	 */
	public String getUsername2() {
		return username2;
	}

	/**
	 * @param username2 the username2 to set
	 */
	public void setUsername2(String username2) {
		this.username2 = username2;
	}

	/**
	 * @return the username3
	 */
	public String getUsername3() {
		return username3;
	}

	/**
	 * @param username3 the username3 to set
	 */
	public void setUsername3(String username3) {
		this.username3 = username3;
	}

	/**
	 * @return the username4
	 */
	public String getUsername4() {
		return username4;
	}

	/**
	 * @param username4 the username4 to set
	 */
	public void setUsername4(String username4) {
		this.username4 = username4;
	}

	/**
	 * @return the username5
	 */
	public String getUsername5() {
		return username5;
	}

	/**
	 * @param username5 the username5 to set
	 */
	public void setUsername5(String username5) {
		this.username5 = username5;
	}

	/**
	 * @return the username6
	 */
	public String getUsername6() {
		return username6;
	}

	/**
	 * @param username6 the username6 to set
	 */
	public void setUsername6(String username6) {
		this.username6 = username6;
	}

	/**
	 * @return the username7
	 */
	public String getUsername7() {
		return username7;
	}

	/**
	 * @param username7 the username7 to set
	 */
	public void setUsername7(String username7) {
		this.username7 = username7;
	}

	/**
	 * @return the username8
	 */
	public String getUsername8() {
		return username8;
	}

	/**
	 * @param username8 the username8 to set
	 */
	public void setUsername8(String username8) {
		this.username8 = username8;
	}

	/**
	 * @return the username9
	 */
	public String getUsername9() {
		return username9;
	}

	/**
	 * @param username9 the username9 to set
	 */
	public void setUsername9(String username9) {
		this.username9 = username9;
	}

	/**
	 * @return the username10
	 */
	public String getUsername10() {
		return username10;
	}

	/**
	 * @param username10 the username10 to set
	 */
	public void setUsername10(String username10) {
		this.username10 = username10;
	}

}
