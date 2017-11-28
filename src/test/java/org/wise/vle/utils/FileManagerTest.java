package org.wise.vle.utils;

import org.easymock.EasyMock;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.wise.portal.domain.project.impl.ProjectImpl;

import static org.junit.Assert.*;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(locations = {
  "classpath:configurations/dispatcherServletContexts.xml",
  "classpath:configurations/applicationContexts.xml"
})
public class FileManagerTest {

  @Test
  public void getProjectFilePath() {
    ProjectImpl project = EasyMock.createMock(ProjectImpl.class);
    EasyMock.expect(project.getModulePath()).andReturn("/567/project.json");
    EasyMock.replay(project);
    String projectFilePath = FileManager.getProjectFilePath(project);
    EasyMock.verify(project);
    assertEquals("src/main/webapp/curriculum/567/project.json",
        projectFilePath);
  }
}
