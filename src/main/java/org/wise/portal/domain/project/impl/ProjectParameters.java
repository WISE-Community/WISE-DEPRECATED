/**
 * Copyright (c) 2007-2017 Regents of the University of California (Regents).
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
package org.wise.portal.domain.project.impl;

import java.io.Serializable;

import lombok.Getter;
import lombok.Setter;
import org.wise.portal.domain.project.ProjectMetadata;
import org.wise.portal.domain.user.User;

/**
 * Parameters required to create a WISE Project.
 *
 * @author Hiroki Terashima
 */
@Getter
@Setter
public class ProjectParameters implements Serializable {

  private static final long serialVersionUID = 1L;
  
  private Long projectId;

  private String projectname;

  private String modulePath; // path to the module for this project, relative to curriculum_base_dir

  private Long parentProjectId;

  private ProjectType projectType;

  private User owner;

  private ProjectMetadata metadata;

  private Long rootProjectId;

  private Integer wiseVersion;

  private Boolean isImport;
}
