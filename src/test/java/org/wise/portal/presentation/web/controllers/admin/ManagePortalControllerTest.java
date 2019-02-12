package org.wise.portal.presentation.web.controllers.admin;

import junit.framework.TestCase;
import org.apache.commons.io.IOUtils;
import org.easymock.EasyMock;
import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.json.JSONException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.ui.ModelMap;
import org.wise.portal.service.portal.PortalService;
import org.wise.portal.service.project.ProjectService;

import java.io.IOException;

@RunWith(EasyMockRunner.class)
public class ManagePortalControllerTest extends TestCase {

  @TestSubject
  private ManagePortalController controller = new ManagePortalController();

  @Mock
  private PortalService portalService;

  @Mock
  private ProjectService projectService;

  private ModelMap modelMap = new ModelMap();

  @Test
  public void addOfficialTagToProjectLibraryGroup_OK() throws JSONException, IOException {
    String projectLibraryGroupJSONString = IOUtils.toString(
        this.getClass().getResourceAsStream("/projectLibraryGroupSample.json"), "UTF-8");
    EasyMock.expect(projectService.addTagToProject("official", new Long(24447))).andReturn(1);
    EasyMock.expect(projectService.addTagToProject("official", new Long(24449))).andReturn(1);
    EasyMock.expect(projectService.addTagToProject("official", new Long(24358))).andReturn(1);
    EasyMock.replay(projectService);
    controller.addOfficialTagToProjectLibraryGroup(projectLibraryGroupJSONString);
    EasyMock.verify(projectService);
  }

}
