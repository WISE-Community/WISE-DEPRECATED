package org.wise.portal.domain;

import org.junit.Before;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.group.impl.PersistentGroup;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.run.impl.RunImpl;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.domain.workgroup.impl.WorkgroupImpl;

public class DomainTest {

  protected Run run;
  protected Group period;
  protected Workgroup workgroup, workgroup2;

  @Before
  public void setup() {
    run = new RunImpl();
    run.setId(1L);
    period = new PersistentGroup();
    period.setId(100L);
    workgroup = new WorkgroupImpl();
    workgroup.setId(64L);
    workgroup2 = new WorkgroupImpl();
    workgroup2.setId(68L);
  }

}
