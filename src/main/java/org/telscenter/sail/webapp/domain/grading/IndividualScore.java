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

package org.telscenter.sail.webapp.domain.grading;

import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.group.Group;

import org.telscenter.pas.emf.pas.EStep;


/**
 * Represents a particular individuals score for a particular <code>Run</code>
 * 
 * @author Anthony Perritano
 * @version $Id$
 */
public interface IndividualScore extends Comparable<IndividualScore> {

	/**
	 * Gets the total accmulated possible score for an individual step
	 * 
	 * @return the score
	 */
	public String getTotalAccumulatedPossibleScore();
	
	/**
	 * Gets the accmulated score for an individual step
	 * 
	 * @param stepUUID - id of the step
	 * @return the score
	 */
	public String getAccumulatedScore(String stepUUID);
	
	/**
	 * Gets the possible score for that step
	 * 
	 * @param stepUUID - id of the step
	 * @return the score
	 */
	public String getPossibleScore(String stepUUID);
	
	/**
	 * Gets the total accumulated score of all steps
	 * 
	 * @return the score
	 */
	public String getTotalAccumulatedScore();
	
	/**
	 * Gets the total possible score of all the steps
	 * 
	 * @return the score
	 */
	public String getTotalPossibleScore();
	
	/**
	 * Gets the total number of steps that are gradable
	 * 
	 * @return number of gradable steps
	 */
	public Integer getTotalGradableSteps();
	
	/**
	 * Gets the total number of steps that have been graded
	 * 
	 * @return number of graded steps
	 */
	public Integer getTotalGradedSteps();
	
	/**
	 * Gets the individuals workgroup
	 * 
	 * @return a workgroup
	 */
	public Workgroup getWorkgroup();
	
	/**
	 * Gets the associated group for this individual
	 * 
	 * @return a group
	 */
	public Group getGroup();   
	
	/**
	 * Gets the associated offering id 
	 * 
	 * @return id of offering
	 */
	public Long getOfferingId();  
	
	/**
	 * Gets the individuals username
	 * 
	 * @return username
	 */
	public String getUsername();
	
	
	//setters
	
	/**
	 * Sets an accumlated score
	 * 
	 * @param stepUUID - id of the step
	 * @param score - the steps score
	 */
	public void setAccmulatedScore(String stepUUID, String score);
	
	/**
	 * Sets a possible score
	 * 
	 * @param stepUUID - id of the step
	 * @param score - the steps score
	 */
	public void setPossibleScore(String stepUUID, String score);
	
	/**
	 * Sets the individuals workgroup
	 * 
	 * @param workgroup
	 */
	public void setWorkgroup(Workgroup workgroup);
	
	/**
	 * Sets the individuals group
	 * 
	 * @param group
	 */
	public void setGroup(Group group);
	
	/**
	 * Sets the offering id
	 * 
	 * @param offeringId
	 */
	public void setOfferingId(Long offeringId);
	
	/**
	 * Sets the username
	 * 
	 * @param username
	 */
	public void setUsername(String username);
	
	/**
	 * Sets the total number of steps that can be graded
	 * 
	 * @param totalGradableSteps
	 */
	public void setTotalGradableSteps(Integer totalGradableSteps);
	
	
	
}
