package org.wise.portal.service.portal;

import static org.junit.Assert.assertEquals;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;

import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.portal.PortalDao;
import org.wise.portal.domain.portal.Portal;
import org.wise.portal.domain.portal.impl.PortalImpl;
import org.wise.portal.service.portal.impl.PortalServiceImpl;

/**
 * @author Hiroki Terashima
 */
@RunWith(EasyMockRunner.class)
public class PortalServiceImplTest {

  @TestSubject
  private PortalService portalService = new PortalServiceImpl();

  @Mock
  private PortalDao<Portal> portalDao;

  @Test
  public void isLoginAllowed_PortalNotFoundInDB_ShouldReturnFalse()
      throws ObjectNotFoundException {
    expect(portalDao.getById(1))
        .andThrow(new ObjectNotFoundException(1, PortalImpl.class));
    replay(portalDao);
    assertEquals(false, portalService.isLoginAllowed());
    verify(portalDao);
  }

  @Test
  public void isLoginAllowed_LogInIsAllowed_ShouldReturnTrue()
      throws ObjectNotFoundException {
    Portal portal = new PortalImpl();
    portal.setSettings("{isLoginAllowed:true}");
    expect(portalDao.getById(1)).andReturn(portal);
    replay(portalDao);
    assertEquals(true, portalService.isLoginAllowed());
    verify(portalDao);
  }

  @Test
  public void isLoginAllowed_LogInIsNotAllowed_ShouldReturnFalse()
      throws ObjectNotFoundException {
    Portal portal = new PortalImpl();
    portal.setSettings("{isLoginAllowed:false}");
    expect(portalDao.getById(1)).andReturn(portal);
    replay(portalDao);
    assertEquals(false, portalService.isLoginAllowed());
    verify(portalDao);
  }
}
