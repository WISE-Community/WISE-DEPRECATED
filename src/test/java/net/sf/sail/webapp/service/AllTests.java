/**
 * Copyright (c) 2006 Encore Research Group, University of Toronto
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
 */package net.sf.sail.webapp.service;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

/*
 * @author Laurel Williams
 * 
 * @version $Id$
 * 
 */

@RunWith(Suite.class)
@Suite.SuiteClasses( {
	net.sf.sail.webapp.service.annotation.impl.AnnotationBundleServiceImplTest.class,
	net.sf.sail.webapp.service.authentication.impl.UserDetailsServiceImplTest.class,
	net.sf.sail.webapp.service.curnit.impl.CurnitServiceImplTest.class,
	net.sf.sail.webapp.service.file.impl.AuthoringJNLPModifierTest.class,
	net.sf.sail.webapp.service.group.impl.GroupServiceImplTest.class,
	net.sf.sail.webapp.service.impl.AclServiceImplTest.class,
	net.sf.sail.webapp.service.impl.UserServiceImplTest.class,
	net.sf.sail.webapp.service.jnlp.impl.JnlpServiceImplTest.class,
	net.sf.sail.webapp.service.offering.impl.OfferingServiceImplTest.class,
	net.sf.sail.webapp.service.workgroup.impl.WorkgroupServiceImplTest.class
})

public class AllTests {
}