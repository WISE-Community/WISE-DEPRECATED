package org.wise.vle.utils;

import org.easymock.EasyMock;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.junit4.SpringRunner;
import org.wise.portal.domain.project.impl.ProjectImpl;

import static org.junit.Assert.assertEquals;

@RunWith(SpringRunner.class)
public class FileManagerTest {

  @Test
  public void getProjectFilePath() {
    ProjectImpl project = EasyMock.createMock(ProjectImpl.class);
    EasyMock.expect(project.getModulePath()).andReturn("/567/project.json");
    EasyMock.replay(project);
    String projectFilePath = FileManager.getProjectFilePath(project);
    EasyMock.verify(project);
    assertEquals("src/test/webapp/curriculum/567/project.json", projectFilePath);
  }
}
