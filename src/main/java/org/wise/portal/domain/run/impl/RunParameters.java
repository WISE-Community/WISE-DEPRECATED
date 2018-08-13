/**
 * Copyright (c) 2007-2017 Encore Research Group, University of Toronto
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Public License for more details.
 *
 * You should have received a copy of the GNU Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.portal.domain.run.impl;

import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.user.User;

import java.io.Serializable;
import java.util.*;

/**
 * @author Laurel Williams
 */
public class RunParameters implements Serializable {

  private static final long serialVersionUID = 1L;

  private String name;  // name of the run

  private Set<String> periodNames = new TreeSet<String>();

  private Set<String> runIdsToArchive = new TreeSet<String>();

  private User owner;

  private Project project;

  private String manuallyEnteredPeriods = new String();

  private Integer maxWorkgroupSize = 3;

  private Integer loggingLevel = 5;

  private Integer postLevel = 5;

  private Locale locale;

  private Boolean enableRealTime = false;

  private Date startTime = Calendar.getInstance().getTime();

  /**
   * @return the name of this run
   */
  public String getName() {
    return name;
  }

  /**
   * @param name the name of this run
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * @return the maximum size of workgroup
   */
  public Integer getMaxWorkgroupSize() {
    return maxWorkgroupSize;
  }

  /**
   * @param maxWorkgroupSize the maximum size of workgroup
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
   * @return the owner
   */
  public User getOwner() {
    return owner;
  }

  /**
   * @param owner the owner to set
   */
  public void setOwner(User owner) {
    this.owner = owner;
  }

  /**
   * @param text the manuallyEnteredPerios to set
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

  public Date getStartTime() {
    return startTime;
  }

  public void setStartTime(Date startTime) {
    this.startTime = startTime;
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
    result = prime * result + ((owner == null) ? 0 : owner.hashCode());
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
    if (owner == null) {
      if (other.owner != null)
        return false;
    } else if (!owner.equals(other.owner))
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

  public Boolean getEnableRealTime() {
    return enableRealTime;
  }

  public void setEnableRealTime(Boolean enableRealTime) {
    this.enableRealTime = enableRealTime;
  }
}
