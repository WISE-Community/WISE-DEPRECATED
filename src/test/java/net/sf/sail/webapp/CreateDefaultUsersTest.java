package net.sf.sail.webapp;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;

import net.sf.sail.webapp.dao.authentication.UserDetailsDao;
import net.sf.sail.webapp.dao.authentication.impl.HibernateUserDetailsDao;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.junit.AbstractTransactionalDbTests;
import net.sf.sail.webapp.service.UserService;
import net.sf.sail.webapp.service.authentication.UserDetailsService;

public class CreateDefaultUsersTest extends AbstractTransactionalDbTests {

    private CreateDefaultUsers creator;

    private MutableUserDetails expectedUserDetails;

    private UserDetailsService userDetailsService;

    @SuppressWarnings("unused")
    private UserService userService;

    private UserDetailsDao<MutableUserDetails> userDao;

    private static final String USERNAME = "Fred";

    private static final String PASSWORD = "Dead";

    public void setUserDetailsService(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    public void setUserDao(HibernateUserDetailsDao userDao) {
        this.userDao = userDao;
    }

    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    public void testCreateRoles() throws Exception {
        assertNotNull(userDetailsService
                .loadAuthorityByName(UserDetailsService.ADMIN_ROLE));
        assertNotNull(userDetailsService
                .loadAuthorityByName(UserDetailsService.USER_ROLE));
    }

    public void testCreateAdministrator() throws Exception {

        MutableUserDetails actualUserDetails = userDao.retrieveByName(USERNAME);
        Collection<? extends GrantedAuthority> authorities = actualUserDetails.getAuthorities();
        assertTrue(testIfHasRole(authorities, UserDetailsService.ADMIN_ROLE));
        assertTrue(testIfHasRole(authorities, UserDetailsService.USER_ROLE));
    }

    private boolean testIfHasRole(Collection<? extends GrantedAuthority> authorities, String role) {
        boolean isRole = false;
        for (GrantedAuthority authority : authorities) {
            String thisRole = authority.getAuthority();
            if (thisRole == role)
                isRole = true;
        }
        return isRole;
    }

    @Override
    protected void onSetUpBeforeTransaction() throws Exception {
        super.onSetUpBeforeTransaction();
        creator = new CreateDefaultUsers(this.applicationContext);
        creator.setUserDetailsService(userDetailsService);
        creator.setUserService(userService);

        expectedUserDetails = (MutableUserDetails) this.applicationContext
                .getBean("mutableUserDetails");
        expectedUserDetails.setUsername(USERNAME);
        expectedUserDetails.setPassword(PASSWORD);
    }

    @Override
    protected void onSetUpInTransaction() throws Exception {
        super.onSetUpInTransaction();
        creator.createRoles(this.applicationContext);
        creator
                .createAdministrator(this.applicationContext, USERNAME,
                        PASSWORD);
    }

    /**
     * @see org.springframework.test.AbstractTransactionalSpringContextTests#onTearDownAfterTransaction()
     */
    @Override
    protected void onTearDownAfterTransaction() throws Exception {
        super.onTearDownAfterTransaction();
        creator = null;
        expectedUserDetails = null;
    }
}