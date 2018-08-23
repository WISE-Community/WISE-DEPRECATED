package org.wise.portal.domain.run.impl;

import org.springframework.security.acls.domain.BasePermission;
import org.springframework.security.acls.model.Permission;

public class RunPermission extends BasePermission {

  public static final Permission VIEW_STUDENT_WORK = new RunPermission(1);

  public static final Permission GRADE_AND_MANAGE = new RunPermission(2);

  public static final Permission VIEW_STUDENT_NAMES = new RunPermission(3);

  public RunPermission(int mask) {
    super(mask);
  }
}
