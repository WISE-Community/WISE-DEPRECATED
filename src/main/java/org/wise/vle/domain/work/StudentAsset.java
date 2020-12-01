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
package org.wise.vle.domain.work;

import java.sql.Timestamp;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;
import org.wise.vle.domain.PersistableDomain;

import lombok.Getter;
import lombok.Setter;

/**
 * Domain object representing assets uploaded by the student like images and video (used in WISE5)
 * @author Hiroki Terashima
 */
@Entity
@Table(name = "studentAssets",  indexes = {
    @Index(columnList = "runId", name = "studentAssetsRunIdIndex"),
    @Index(columnList = "workgroupId", name = "studentAssetsWorkgroupIdIndex")})
@Getter
@Setter
public class StudentAsset extends PersistableDomain {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Integer id = null;

  @ManyToOne(targetEntity = RunImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "runId", nullable = false)
  private Run run;

  @ManyToOne(targetEntity = PersistentGroup.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "periodId", nullable = false)
  private Group period;

  @ManyToOne(targetEntity = WorkgroupImpl.class, cascade = {CascadeType.PERSIST}, fetch = FetchType.LAZY)
  @JoinColumn(name = "workgroupId", nullable = false)
  private Workgroup workgroup;

  @Column(name = "nodeId", length = 30)
  private String nodeId;

  @Column(name = "componentId", length = 30)
  private String componentId;

  @Column(name = "componentType", length = 30)
  private String componentType;

  @Column(name = "isReferenced", nullable = false)
  private Boolean isReferenced = false;

  @Column(name = "fileName", nullable = false)
  private String fileName;

  @Column(name = "filePath", nullable = false)
  private String filePath;

  @Column(name = "fileSize", nullable = false)
  private Long fileSize;

  @Column(name = "clientSaveTime", nullable = false)
  private Timestamp clientSaveTime;

  @Column(name = "serverSaveTime", nullable = false)
  private Timestamp serverSaveTime;

  @Column(name = "clientDeleteTime", nullable = true)
  private Timestamp clientDeleteTime;

  @Column(name = "serverDeleteTime", nullable = true)
  private Timestamp serverDeleteTime;

  @Override
  protected Class<?> getObjectClass() {
    return StudentAsset.class;
  }
}
