/**
 * Copyright (c) 2007 Encore Research Group, University of Toronto
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.telscenter.sail.webapp.domain.impl;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.TreeSet;

import org.telscenter.sail.webapp.domain.project.Project;

import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.OfferingParameters;


/**
 * @author Laurel Williams
 *
 * @version $Id$
 */
public class RunParameters extends OfferingParameters implements Serializable {

	private static final long serialVersionUID = 1L;

	private Set<String> periodNames = new TreeSet<String>();
	
	private Set<String> runIdsToArchive = new TreeSet<String>();
	
	private Set<User> owners = new HashSet<User>();
	
	private Project project;
	
	private String manuallyEnteredPeriods = new String();

	private Integer maxWorkgroupSize = 3;
	
	private Integer loggingLevel = 5;
	
	private Integer postLevel = 5;
	
	private Locale locale;
	
	/**
	 * @return <code>Integer</code> the maximum size of workgroup
	 */
	public Integer getMaxWorkgroupSize() {
		return maxWorkgroupSize;
	}

	/**
	 * @param <code>Integer</code> maxWorkgroupSize
	 */
	public void setMaxWorkgroupSize(Integer maxWorkgroupSize) {
		this.maxWorkgroupSize = maxWorkgroupSize;
	}

	/**
	 * @return the periodNames
	 */
	public Set<String> getPeriodNames() {
		return periodNames;
	}

	/**
	 * @param periodNames the periodNames to set
	 */
	public void setPeriodNames(Set<String> periodNames) {
		this.periodNames = periodNames;
	}

	/**
	 * @return the owners
	 */
	public Set<User> getOwners() {
		return owners;
	}

	/**
	 * @param owners the owners to set
	 */
	public void setOwners(Set<User> owners) {
		this.owners = owners;
	}
	
	/**
	 * @param manuallyEnteredPeriods the manuallyEnteredPerios to set
	 */
	public void setManuallyEnteredPeriods(String text){
		this.manuallyEnteredPeriods = text;
	}
	
	/**
	 * @return manuallyEnteredPeriods
	 */
	public String getManuallyEnteredPeriods(){
		return this.manuallyEnteredPeriods;
	}

	/**
	 * @return the project
	 */
	public Project getProject() {
		return project;
	}

	/**
	 * @param project the project to set
	 */
	public void setProject(Project project) {
		this.project = project;
	}
	
	public String printAllPeriods() {
		String allPeriods = null;
		
		if(periodNames.isEmpty()) {
			allPeriods = getManuallyEnteredPeriods();
		} else {
			allPeriods = getPeriodNames().toString();
		}
		
		return allPeriods;
	}

	/**
	 * @return the runIdsToArchive
	 */
	public Set<String> getRunIdsToArchive() {
		return runIdsToArchive;
	}

	/**
	 * @param runIdsToArchive the runIdsToArchive to set
	 */
	public void setRunIdsToArchive(Set<String> runIdsToArchive) {
		this.runIdsToArchive = runIdsToArchive;
	}

	/**
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime
				* result
				+ ((manuallyEnteredPeriods == null) ? 0
						: manuallyEnteredPeriods.hashCode());
		result = prime * result + ((owners == null) ? 0 : owners.hashCode());
		result = prime * result
				+ ((periodNames == null) ? 0 : periodNames.hashCode());
		result = prime * result + ((project == null) ? 0 : project.hashCode());
		result = prime * result
				+ ((runIdsToArchive == null) ? 0 : runIdsToArchive.hashCode());
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
		final RunParameters other = (RunParameters) obj;
		if (manuallyEnteredPeriods == null) {
			if (other.manuallyEnteredPeriods != null)
				return false;
		} else if (!manuallyEnteredPeriods.equals(other.manuallyEnteredPeriods))
			return false;
		if (owners == null) {
			if (other.owners != null)
				return false;
		} else if (!owners.equals(other.owners))
			return false;
		if (periodNames == null) {
			if (other.periodNames != null)
				return false;
		} else if (!periodNames.equals(other.periodNames))
			return false;
		if (project == null) {
			if (other.project != null)
				return false;
		} else if (!project.equals(other.project))
			return false;
		if (runIdsToArchive == null) {
			if (other.runIdsToArchive != null)
				return false;
		} else if (!runIdsToArchive.equals(other.runIdsToArchive))
			return false;
		return true;
	}

	/**
	 * @return the loggingLevel
	 */
	public Integer getLoggingLevel() {
		return loggingLevel;
	}

	/**
	 * @param loggingLevel the loggingLevel to set
	 */
	public void setLoggingLevel(Integer loggingLevel) {
		this.loggingLevel = loggingLevel;
	}

	/**
	 * @return the postLevel
	 */
	public Integer getPostLevel() {
		return postLevel;
	}

	/**
	 * @param postLevel the postLevel to set
	 */
	public void setPostLevel(Integer postLevel) {
		this.postLevel = postLevel;
	}

	public Locale getLocale() {
		return locale;
	}

	public void setLocale(Locale locale) {
		this.locale = locale;
	}

}
