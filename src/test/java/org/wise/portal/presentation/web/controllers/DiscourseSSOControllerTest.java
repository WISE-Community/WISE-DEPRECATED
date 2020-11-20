package org.wise.portal.presentation.web.controllers;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;

import org.easymock.EasyMockRunner;
import org.easymock.TestSubject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.web.servlet.view.RedirectView;

@RunWith(EasyMockRunner.class)
public class DiscourseSSOControllerTest extends APIControllerTest {

  @TestSubject
  private DiscourseSSOController discourseSSOController = new DiscourseSSOController();

  String base64EncodedSSO = "bm9uY2U9MWJmMDQwNzIzYmYwNDc2NzExZjAxMWY4MjYyNzQyMTQmcmV0dXJuX3Nzb191" +
      "cmw9aHR0cCUzQSUyRiUyRmxvY2FsaG9zdCUzQTkyOTIlMkZzZXNzaW9uJTJGc3NvX2xvZ2lu";
  String sigParam = "13f83c3dc28af7c37fac8d40f7792d63bf727cc2e7b293f3669a526dd861f71d";
  String redirectURL = "http://localhost:9292/session/sso_login?sso=bm9uY2U9MWJmMDQwNzIzYmYwNDc2N" +
      "zExZjAxMWY4MjYyNzQyMTQmcmV0dXJuX3Nzb191cmw9aHR0cCUzQSUyRiUyRmxvY2FsaG9zdCUzQTkyOTIlMkZzZXN" +
      "zaW9uJTJGc3NvX2xvZ2luJm5hbWU9U3F1aWR3YXJkK1RlbnRhY2xlcyZ1c2VybmFtZT1TcXVpZHdhcmRUZW50YWNsZ" +
      "XMmZW1haWw9JmV4dGVybmFsX2lkPTk0MjEw&sig=9e6d86e5ac58afe16acf62fe7aa11aec4ef3540a8eb7c0d56a" +
      "a6c585b90bee61";

  @Test
  public void discourseSSOLogin_ValidArgs_ReturnRedirectURL() throws Exception {
    expect(userService.retrieveUserByUsername(teacherAuth.getName())).andReturn(teacher1);
    expect(appProperties.getProperty("discourse_sso_secret_key")).andReturn("do_the_right_thing");
    expect(appProperties.getProperty("discourse_url")).andReturn("http://localhost:9292");
    replay(userService, appProperties);
    RedirectView discourseSSOLoginRedirect =
        discourseSSOController.discourseSSOLogin(base64EncodedSSO, sigParam, teacherAuth);
    assertEquals(redirectURL, discourseSSOLoginRedirect.getUrl());
    verify(userService, appProperties);
  }
}
