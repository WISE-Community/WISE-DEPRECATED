/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.vle.domain.statistics;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.Getter;
import lombok.Setter;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.vle.domain.PersistableDomain;

/**
 * Stores the vle statistics snapshot at a particular point in time
 *
 * @author Geoffrey Kwan
 */
@Entity
@Table(name = "vle_statistics")
@Getter
@Setter
public class VLEStatistics extends PersistableDomain {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Long id = null;

  @Column(name = "timestamp")
  private Timestamp timestamp;

  @Column(name = "data", length = 5000, columnDefinition = "text")
  private String data;

  /**
   * Get the JSONObject representation of the data
   * @return the data converted to a JSONObject
   */
  public JSONObject getJSONObject() {
    JSONObject jsonObject = new JSONObject();
    String data = getData();
    if (data != null && !data.equals("")) {
      try {
        jsonObject = new JSONObject(data);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return jsonObject;
  }

  @Override
  protected Class<?> getObjectClass() {
    return null;
  }
}
