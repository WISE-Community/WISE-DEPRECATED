/**
 * Copyright (c) 2007 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package net.sf.sail.webapp.dao.workgroup.impl;

import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.authentication.MutableUserDetails;
import net.sf.sail.webapp.domain.group.Group;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.sds.SdsJnlp;
import net.sf.sail.webapp.domain.sds.SdsOffering;
import net.sf.sail.webapp.domain.sds.SdsUser;
import net.sf.sail.webapp.domain.sds.SdsWorkgroup;
import net.sf.sail.webapp.junit.AbstractTransactionalDbTests;

import org.hibernate.Session;

/**
 * Another test for HibernateWorkgroupDao
 * 
 * @author Cynick Young
 * @version $Id: HibernateWorkgroupDaoAnotherTest.java 328 2007-04-24 15:20:13Z
 *          cynick $
 */
public class HibernateWorkgroupDaoAnotherTest extends
        AbstractTransactionalDbTests {

    private static final String USERNAME = "username";

    private static final String USERNAME_A = "usernameA";

    private static final String USERNAME_B = "usernameB";

    private static final String PASSWORD = "password";

    private static final Long SDS_ID = new Long(42);

    private static final Long SDS_ID_A = new Long(12);

    private static final Long SDS_ID_B = new Long(32);

    private static final SdsCurnit DEFAULT_SDS_CURNIT = new SdsCurnit();

    private static final SdsJnlp DEFAULT_SDS_JNLP = new SdsJnlp();

    private static final String DEFAULT_NAME = "the heros";

    private static final String DEFAULT_URL = "http://woohoo";

    private static final String GROUP_NAME = "the heros group";

    private HibernateWorkgroupDao workgroupDao;
    
    /**
     * @param workgroupDao
     *                the workgroupDao to set
     */
    public void setWorkgroupDao(HibernateWorkgroupDao workgroupDao) {
        this.workgroupDao = workgroupDao;
    }

    /**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpBeforeTransaction()
     */
    @Override
    protected void onSetUpBeforeTransaction() throws Exception {
        super.onSetUpBeforeTransaction();
        DEFAULT_SDS_CURNIT.setName(DEFAULT_NAME);
        DEFAULT_SDS_CURNIT.setUrl(DEFAULT_URL);
        DEFAULT_SDS_CURNIT.setSdsObjectId(SDS_ID);

        DEFAULT_SDS_JNLP.setName(DEFAULT_NAME);
        DEFAULT_SDS_JNLP.setUrl(DEFAULT_URL);
        DEFAULT_SDS_JNLP.setSdsObjectId(SDS_ID);
    }

    /**
     * @see org.springframework.test.AbstractTransactionalSpringContextTests#onSetUpInTransaction()
     */
    @Override
    protected void onSetUpInTransaction() throws Exception {
        super.onSetUpInTransaction();
        // an offering needs to exist already before a workgroup can be created
        Session session = this.sessionFactory.getCurrentSession();
        session.save(DEFAULT_SDS_CURNIT); // save sds curnit
        session.save(DEFAULT_SDS_JNLP); // save sds jnlp
    }

    /**
     * @see org.springframework.test.AbstractTransactionalSpringContextTests#onTearDownAfterTransaction()
     */
    @Override
    protected void onTearDownAfterTransaction() throws Exception {
        super.onTearDownAfterTransaction();
        this.workgroupDao = null;
    }

    public void testGetListByOfferingAndUser_NoMembersInWorkgroup() {
        Session session = this.sessionFactory.getCurrentSession();
        Offering offering = createNewOffering(session, SDS_ID);
        Set<User> members = Collections.emptySet();
        @SuppressWarnings("unused")
        Workgroup workgroup = createNewWorkgroup(session, SDS_ID, offering,
                members);

        User user = createNewUser(USERNAME, SDS_ID, session);
        List<?> actual = workgroupDao.getListByOfferingAndUser(offering, user);
        assertTrue(actual.isEmpty());
    }

    public void testGetListByOfferingAndUser_SingleMemberInWorkgroup() {
        Session session = this.sessionFactory.getCurrentSession();
        Offering offering = createNewOffering(session, SDS_ID);
        User user = createNewUser(USERNAME, SDS_ID, session);
        Set<User> members = new HashSet<User>(1);
        members.add(user);
        Workgroup workgroup = createNewWorkgroup(session, SDS_ID, offering,
                members);
        this.toilet.flush();

        List<Workgroup> actualList = workgroupDao.getListByOfferingAndUser(
                offering, user);
        assertEquals(1, actualList.size());
        Workgroup actualWorkgroup = actualList.get(0);
        Set<User> actualMembers = actualWorkgroup.getMembers();
        assertEquals(1, actualMembers.size());
        assertEquals(members, actualMembers);
        assertTrue(actualMembers.contains(user));
        assertEquals(offering, actualWorkgroup.getOffering());
        assertEquals(workgroup, actualWorkgroup);
    }

    public void testGetListByOfferingAndUser() {
        Session session = this.sessionFactory.getCurrentSession();

        Offering offeringA = createNewOffering(session, SDS_ID_A);
        Offering offeringB = createNewOffering(session, SDS_ID_B);

        User userA = createNewUser(USERNAME_A, SDS_ID_A, session);
        Set<User> membersA = new HashSet<User>(1);
        membersA.add(userA);

        User userB = createNewUser(USERNAME_B, SDS_ID_B, session);
        Set<User> membersB = new HashSet<User>(1);
        membersB.add(userB);

        Workgroup workgroup1 = createNewWorkgroup(session, new Long(1), offeringA,
                membersA);
        Workgroup workgroup2 = createNewWorkgroup(session, new Long(2), offeringA,
                membersB);
        Workgroup workgroup3 = createNewWorkgroup(session, new Long(3), offeringB,
                membersA);
        Workgroup workgroup4 = createNewWorkgroup(session, new Long(4), offeringB,
                membersB);

        this.toilet.flush();

        List<Workgroup> actualWorkgroupList = workgroupDao
                .getListByOfferingAndUser(offeringA, userA);
        assertEquals(1, actualWorkgroupList.size());
        assertEquals(workgroup1, actualWorkgroupList.get(0));

        actualWorkgroupList = workgroupDao.getListByOfferingAndUser(offeringA,
                userB);
        assertEquals(1, actualWorkgroupList.size());
        assertEquals(workgroup2, actualWorkgroupList.get(0));

        actualWorkgroupList = workgroupDao.getListByOfferingAndUser(offeringB,
                userA);
        assertEquals(1, actualWorkgroupList.size());
        assertEquals(workgroup3, actualWorkgroupList.get(0));

        actualWorkgroupList = workgroupDao.getListByOfferingAndUser(offeringB,
                userB);
        assertEquals(1, actualWorkgroupList.size());
        assertEquals(workgroup4, actualWorkgroupList.get(0));
    }

    private Workgroup createNewWorkgroup(Session session, Long sdsId,
            Offering offering, Set<User> members) {
        SdsWorkgroup sdsWorkgroup = (SdsWorkgroup) this.applicationContext
                .getBean("sdsWorkgroup");
        Set<SdsUser> sdsUsers = new HashSet<SdsUser>(members.size());
        for (Iterator<User> i = members.iterator(); i.hasNext();) {
            sdsUsers.add(i.next().getSdsUser());
        }
        sdsWorkgroup.setMembers(sdsUsers);
        sdsWorkgroup.setName(DEFAULT_NAME);
        sdsWorkgroup.setSdsObjectId(sdsId);
        sdsWorkgroup.setSdsOffering(offering.getSdsOffering());

        Workgroup workgroup = (Workgroup) this.applicationContext
                .getBean("workgroup");
        Group group = (Group) this.applicationContext
        		.getBean("group");
        group.setName(GROUP_NAME);
        session.save(group);
        workgroup.setGroup(group);
        workgroup.setMembers(members);
        workgroup.setOffering(offering);
        workgroup.setSdsWorkgroup(sdsWorkgroup);

        session.save(workgroup);
        return workgroup;
    }

    private Offering createNewOffering(Session session, Long sdsId) {
        SdsOffering sdsOffering = (SdsOffering) this.applicationContext
                .getBean("sdsOffering");
        sdsOffering.setName(DEFAULT_NAME);
        sdsOffering.setSdsObjectId(sdsId);
        sdsOffering.setSdsCurnit(DEFAULT_SDS_CURNIT);
        sdsOffering.setSdsJnlp(DEFAULT_SDS_JNLP);

        Offering offering = (Offering) this.applicationContext
                .getBean("offering");
        offering.setSdsOffering(sdsOffering);
        session.save(offering);
        return offering;
    }

    private User createNewUser(String username, Long sdsId, Session session) {
        User user = (User) this.applicationContext.getBean("user");
        SdsUser sdsUser = (SdsUser) this.applicationContext.getBean("sdsUser");
        sdsUser.setFirstName(DEFAULT_NAME);
        sdsUser.setLastName(DEFAULT_NAME);
        sdsUser.setSdsObjectId(sdsId);
        MutableUserDetails userDetails = (MutableUserDetails) this.applicationContext
                .getBean("mutableUserDetails");
        userDetails.setUsername(username);
        userDetails.setPassword(PASSWORD);
        user.setSdsUser(sdsUser);
        user.setUserDetails(userDetails);
        session.save(user);
        return user;
    }
}