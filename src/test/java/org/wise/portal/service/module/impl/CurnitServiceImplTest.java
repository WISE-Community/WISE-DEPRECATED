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
package org.wise.portal.service.module.impl;

import static org.easymock.EasyMock.createMock;
import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.reset;
import static org.easymock.EasyMock.verify;

import java.util.LinkedList;
import java.util.List;

import junit.framework.TestCase;

import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.module.CurnitDao;
import org.wise.portal.domain.module.Curnit;
import org.wise.portal.domain.module.impl.CurnitImpl;
import org.wise.portal.domain.module.impl.CurnitParameters;
import org.wise.portal.service.module.impl.CurnitServiceImpl;

/**
 * @author Laurel Williams
 * 
 * @version $Id$
 */
public class CurnitServiceImplTest extends TestCase {

	private static final String CURNIT_NAME = "name";
	private static final String CURNIT_URL = "url";
	private static final Long EXISTING_CURNIT_ID = new Long(10);
	private static final Long NONEXISTING_CURNIT_ID = new Long(103);
	
    private CurnitDao<Curnit> mockCurnitDao;
 
    private CurnitServiceImpl curnitServiceImpl;
    
    private Curnit curnit;
     
    /**
     * @see junit.framework.TestCase#setUp()
     */
    @SuppressWarnings("unchecked")
    protected void setUp() throws Exception {
        super.setUp();
        this.curnitServiceImpl = new CurnitServiceImpl();

        this.mockCurnitDao = createMock(CurnitDao.class);
        this.curnitServiceImpl.setCurnitDao(this.mockCurnitDao);
        
        this.curnit = new CurnitImpl();
    }

    /**
     * @see junit.framework.TestCase#tearDown()
     */
    protected void tearDown() throws Exception {
        super.tearDown();
        this.curnitServiceImpl = null;
        this.mockCurnitDao = null;
    }

    public void testGetCurnitList() throws Exception {
        List<Curnit> expectedList = new LinkedList<Curnit>();
        expectedList.add(new CurnitImpl());

        expect(mockCurnitDao.getList()).andReturn(expectedList);
        replay(mockCurnitDao);
        assertEquals(expectedList, curnitServiceImpl.getCurnitList());
        verify(mockCurnitDao);
    }

    public void testCreateCurnit() throws Exception {   
        CurnitParameters curnitParameters = new CurnitParameters();
        curnitParameters.setName(CURNIT_NAME);
        curnitParameters.setUrl(CURNIT_URL);

        expectLastCall();
        mockCurnitDao.save(this.curnit);
        expectLastCall();
        replay(mockCurnitDao);
        Curnit curnit = this.curnitServiceImpl.createCurnit(curnitParameters);

        verify(mockCurnitDao);
    }

    public void testGetById() throws Exception {
    	Curnit expectedCurnit = new CurnitImpl();
    	expect(mockCurnitDao.getById(EXISTING_CURNIT_ID)).andReturn(expectedCurnit);
    	replay(mockCurnitDao);
    	assertEquals(expectedCurnit, curnitServiceImpl.getById(EXISTING_CURNIT_ID));
    	verify(mockCurnitDao);
    	reset(mockCurnitDao);

    	// now check when curnit is not found
    	expect(mockCurnitDao.getById(NONEXISTING_CURNIT_ID)).andThrow(new ObjectNotFoundException(NONEXISTING_CURNIT_ID, Curnit.class));
    	replay(mockCurnitDao);
    	try {
    		curnitServiceImpl.getById(NONEXISTING_CURNIT_ID);
    		fail("ObjectNotFoundException expected but was not thrown");
    	} catch (ObjectNotFoundException e) {
    	}
    	verify(mockCurnitDao);
    }
    
    public void testChangeCurnitName() {
    	// TODO HT implement me
    }

}