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

package org.telscenter.sail.webapp.domain.grading.impl;

import java.util.HashMap;
import java.util.Map;

import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.group.Group;

import org.apache.commons.lang.StringUtils;
import org.telscenter.pas.emf.pas.EStep;
import org.telscenter.sail.webapp.domain.grading.IndividualScore;

public class IndividualScoreNumericImpl implements IndividualScore {

	private Group period;
	private Workgroup workgroup;
	private HashMap<String, String> possibleScores = new HashMap<String, String>();
	private HashMap<String, String> accumulatedScores = new HashMap<String, String>();
	private Long runId;
	private String username;
	private Integer totalGradableSteps;
	
	
	/**
	 * @see org.telscenter.sail.webapp.domain.grading.IndividualScore#getAccumulatedScore(java.lang.String)
	 */
	public String getAccumulatedScore(String stepUUID) {
		return accumulatedScores.get(stepUUID);
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.IndividualScore#getGroup()
	 */
	public Group getGroup() {
		return period;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.IndividualScore#getPossibleScore(java.lang.String)
	 */
	public String getPossibleScore(String stepUUID) {
		return possibleScores.get(stepUUID);
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.IndividualScore#getOfferingId()
	 */
	public Long getOfferingId() {
		return this.runId;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.IndividualScore#getTotalAccumulatedScore()
	 */
	public String getTotalAccumulatedScore() {

		int totalScore = 0;

		for (Map.Entry<String, String> entry : accumulatedScores.entrySet()) {
			String accScore = entry.getValue();
			
			if( StringUtils.isNumeric(accScore) && StringUtils.trimToNull(accScore) != null ) {
				totalScore = totalScore + new Integer(accScore).intValue();
			}// if
		}// for

		return "" + totalScore;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.IndividualScore#getTotalPossibleScore()
	 */
	public String getTotalPossibleScore() {
		int totalScore = 0;

		for (Map.Entry<String, String> entry : possibleScores.entrySet()) {
			String possScore = entry.getValue();
			
			if( StringUtils.isNumeric(possScore) && StringUtils.trimToNull(possScore) != null ) {
				totalScore = totalScore + new Integer(possScore).intValue();
			}
		}

		return ""+ totalScore;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.IndividualScore#getWorkgroup()
	 */
	public Workgroup getWorkgroup() {
		return workgroup;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.IndividualScore#setAccmulatedScore(java.lang.String, java.lang.String)
	 */
	public void setAccmulatedScore(String stepUUID, String score) {
		accumulatedScores.put(stepUUID, score);
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.IndividualScore#setGroup(net.sf.sail.webapp.domain.group.Group)
	 */
	public void setGroup(Group group) {
		this.period = group;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.IndividualScore#setPossibleScore(java.lang.String, java.lang.String)
	 */
	public void setPossibleScore(String stepUUID, String score) {
		possibleScores.put(stepUUID, score);
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.IndividualScore#setOfferingId(java.lang.Long)
	 */
	public void setOfferingId(Long runId) {
		this.runId = runId;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.IndividualScore#setWorkgroup(net.sf.sail.webapp.domain.Workgroup)
	 */
	public void setWorkgroup(Workgroup workgroup) {
		this.workgroup = workgroup;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.IndividualScore#getUsername()
	 */
	public String getUsername() {
		return username;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.IndividualScore#setUsername(java.lang.String)
	 */
	public void setUsername(String username) {
		this.username = username;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.IndividualScore#getTotalGradableSteps()
	 */
	public Integer getTotalGradableSteps() {
		return totalGradableSteps;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.IndividualScore#getTotalGradedSteps()
	 */
	public Integer getTotalGradedSteps() {
		
		int gradableStepsScored = 0;

		for (Map.Entry<String, String> entry : accumulatedScores.entrySet()) {
			String accScore = entry.getValue();
			
			if( StringUtils.isNumeric(accScore) && StringUtils.trimToNull(accScore) != null ) {
				gradableStepsScored++;
			}// if
		}// for

		return new Integer(gradableStepsScored);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.domain.grading.IndividualScore#setTotalGradableSteps(java.lang.Integer)
	 */
	public void setTotalGradableSteps(Integer totalGradableSteps) {
		this.totalGradableSteps = totalGradableSteps;
	}

	/**
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		return this.username + " score "
				+ this.getTotalAccumulatedScore() + " / "
				+ this.getTotalPossibleScore();
	}

	/**
	 * @see java.lang.Comparable#compareTo(java.lang.Object)
	 */
	public int compareTo(IndividualScore o) {
		return username.compareTo(o.getUsername());
    }

	/**
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result
				+ ((username == null) ? 0 : username.hashCode());
		return result;
	}


	/**
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		final IndividualScoreNumericImpl other = (IndividualScoreNumericImpl) obj;
		if (username == null) {
			if (other.username != null)
				return false;
		} else if (!username.equals(other.username))
			return false;
		return true;
	}

	/**
	 * @see org.telscenter.sail.webapp.domain.grading.IndividualScore#getTotalAccumulatedPossibleScore()
	 */
	public String getTotalAccumulatedPossibleScore() {
		int totalScore = 0;

		for (Map.Entry<String, String> entry : accumulatedScores.entrySet()) {
			String accScore = entry.getValue();
			
			if( StringUtils.isNumeric(accScore) && StringUtils.trimToNull(accScore) != null ) {
				String possibleScore = this.getPossibleScore(entry.getKey());
				totalScore = totalScore + new Integer(possibleScore).intValue();
			}// if
		}// for

		return "" + totalScore;
	}


}
