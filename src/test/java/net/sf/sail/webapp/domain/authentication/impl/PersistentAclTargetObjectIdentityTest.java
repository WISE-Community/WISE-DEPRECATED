/**
 * Copyright (c) 2007 Encore Research Group, University of Toronto
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package net.sf.sail.webapp.domain.authentication.impl;

import junit.framework.TestCase;
import net.sf.sail.webapp.domain.authentication.MutableAclTargetObject;
import net.sf.sail.webapp.domain.group.impl.PersistentGroup;

import org.easymock.EasyMock;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 */
public class PersistentAclTargetObjectIdentityTest extends TestCase {

    private static final String CLASSNAME = "net.sf.sail.webapp.domain.group.impl.PersistentGroup";

    private PersistentAclTargetObjectIdentity targetObjectIdentity;

    private MutableAclTargetObject targetObject;

    /**
     * @see junit.framework.TestCase#setUp()
     */
    protected void setUp() throws Exception {
        super.setUp();
        this.targetObjectIdentity = new PersistentAclTargetObjectIdentity();
        this.targetObject = EasyMock.createMock(MutableAclTargetObject.class);
        this.targetObjectIdentity.setAclTargetObject(targetObject);
    }

    /**
     * @see junit.framework.TestCase#tearDown()
     */
    protected void tearDown() throws Exception {
        super.tearDown();
        this.targetObject = null;
        this.targetObjectIdentity = null;
    }

    /**
     * Test method for
     * {@link net.sf.sail.webapp.domain.authentication.impl.PersistentAclTargetObjectIdentity#getJavaType()}.
     */
    public void testGetJavaType() {
        EasyMock.expect(this.targetObject.getClassname()).andReturn(CLASSNAME);
        EasyMock.replay(this.targetObject);

        assertEquals(PersistentGroup.class, this.targetObjectIdentity
                .getJavaType());

        EasyMock.reset(this.targetObject);
        EasyMock.expect(this.targetObject.getClassname()).andReturn("blah");
        EasyMock.replay(this.targetObject);

        assertNull(this.targetObjectIdentity.getJavaType());
    }

}