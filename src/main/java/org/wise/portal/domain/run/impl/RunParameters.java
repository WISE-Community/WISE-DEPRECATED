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

import java.io.Serializable;
import java.util.Locale;
import java.util.Set;
import java.util.TreeSet;

import lombok.Getter;
import lombok.Setter;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.user.User;

import java.io.Serializable;
import java.util.*;

/**
 * @author Laurel Williams
 */
@Getter
@Setter
public class RunParameters implements Serializable {

  private static final long serialVersionUID = 1L;

  private String name;

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

  private Date endTime = null;

  private Boolean isLockedAfterEndDate = false;

  public String printAllPeriods() {
    String allPeriods = null;

    if (periodNames.isEmpty()) {
      allPeriods = getManuallyEnteredPeriods();
    } else {
      allPeriods = getPeriodNames().toString();
    }

    return allPeriods;
  }

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result
        + ((manuallyEnteredPeriods == null) ? 0 : manuallyEnteredPeriods.hashCode());
    result = prime * result + ((owner == null) ? 0 : owner.hashCode());
    result = prime * result + ((periodNames == null) ? 0 : periodNames.hashCode());
    result = prime * result + ((project == null) ? 0 : project.hashCode());
    result = prime * result + ((runIdsToArchive == null) ? 0 : runIdsToArchive.hashCode());
    return result;
  }

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
}
