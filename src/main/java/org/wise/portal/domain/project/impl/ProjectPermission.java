package org.wise.portal.domain.project.impl;

import org.springframework.security.acls.domain.BasePermission;
import org.springframework.security.acls.model.Permission;
import org.wise.portal.domain.run.impl.RunPermission;

public class ProjectPermission extends BasePermission {

  public static final Permission VIEW_PROJECT = new RunPermission(1);

  public static final Permission EDIT_PROJECT = new RunPermission(2);

  public ProjectPermission(int mask) {
    super(mask);
  }
}
