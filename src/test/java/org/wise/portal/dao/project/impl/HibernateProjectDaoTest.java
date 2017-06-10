/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
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
package org.wise.portal.dao.project.impl;

import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.wise.portal.domain.module.impl.CurnitImpl;
import org.wise.portal.domain.module.impl.ModuleImpl;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.project.impl.ProjectImpl;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.user.impl.UserImpl;

/**
 * @author Hiroki Terashima
 *
 * @version $Id$
 */
public class HibernateProjectDaoTest extends org.wise.portal.dao.AbstractTransactionalDaoTests<HibernateProjectDao, Project> {

    private static final String MODULE_DESCRIPTION = "this module is for smart kids";

	private static final Long MODULE_COMPUTER_TIME = new Long(40);

	private static final Set<User> MODULE_OWNERS = new HashSet<User>();

	private static final String MODULE_TECH_REQS = "This module requires a giant TV";

	private static final Long MODULE_TOTAL_TIME = new Long(45);
	
	private static final Date START_TIME = Calendar.getInstance().getTime();

	private static final Date END_TIME = Calendar.getInstance().getTime();
	
	private static final String RUNCODE = "abcde-123";

    private Run run;
		
	public void setRun(Run run) {
		this.run = run;
	}

	/**
     * @see net.sf.sail.webapp.junit.AbstractTransactionalDbTests#onSetUpBeforeTransaction()
     */
    @Override
    protected void onSetUpBeforeTransaction() throws Exception {
    	super.onSetUpBeforeTransaction();
    	this.dao = (HibernateProjectDao) this.applicationContext
    	        .getBean("projectDao");
    	this.dataObject = (ProjectImpl) this.applicationContext
    			.getBean("project");
    	
    	this.run.setOwner(null);
		this.run.setPeriods(null);
		this.run.setRuncode(RUNCODE);
    	this.run.setStarttime(START_TIME);
    	this.run.setEndtime(END_TIME);
    	this.run.setProject(this.dataObject);
    	this.dataObject.setPreviewRun(run);
    }
    
    /**
     * @see org.springframework.test.AbstractTransactionalSpringContextTests#onTearDownAfterTransaction()
     */
    @Override
    protected void onTearDownAfterTransaction() throws Exception {
    	super.onTearDownAfterTransaction();
    }
    
	/**
	 * @see net.sf.sail.webapp.dao.AbstractTransactionalDaoTests#testSave()
	 */
    @Override
	public void testSave() {
		verifyDataStoreIsEmpty();
		
		this.dao.save(this.dataObject);
		
        // verify data store contains saved data using direct jdbc retrieval
        // (not using dao)
		List<?> actualList = retrieveProjectListFromDb();
        assertEquals(1, actualList.size());
        
        Map<?, ?> actualProjectMap = (Map<?, ?>) actualList.get(0);
	}
    
    /**
     * @see net.sf.sail.webapp.dao.AbstractTransactionalDaoTests#testDelete()
     */
    @Override
    public void testDelete() {
    	// TODO HIROKI implement me
    	assertTrue(true);
    }
    
    /**
     * @see net.sf.sail.webapp.dao.AbstractTransactionalDaoTests#testGetList()
     */
    @Override
    public void testGetList() {
    	// TODO HIROKI implement me
    	assertTrue(true);
    }
    
    /**
     * @see net.sf.sail.webapp.dao.AbstractTransactionalDaoTests#testGetById()
     */
    @Override
    public void testGetById() {
    	// TODO HIROKI implement me
    	assertTrue(true);
    }

	/**
	 * @see net.sf.sail.webapp.dao.AbstractTransactionalDaoTests#retrieveDataObjectListFromDb()
	 */
	@Override
	protected List<?> retrieveDataObjectListFromDb() {
		return this.jdbcTemplate.queryForList("SELECT * FROM "
				+ ProjectImpl.DATA_STORE_NAME, (Object[]) null);
	}
	
	/*
	 * SELECT * FROM projects, curnits
	 * WHERE projects.curnit_fk = curnits.id 
	 */
	private static final String RETRIEVE_PROJECT_LIST_SQL = 
		"SELECT * FROM "
		+ ProjectImpl.DATA_STORE_NAME + ", " + CurnitImpl.DATA_STORE_NAME
		+ " WHERE " 
		+ ProjectImpl.DATA_STORE_NAME + "." + ProjectImpl.COLUMN_NAME_CURNIT_FK
		+ " = "
		+ CurnitImpl.DATA_STORE_NAME + ".id";

		
    private List<?> retrieveProjectListFromDb() {
        return this.jdbcTemplate.queryForList(RETRIEVE_PROJECT_LIST_SQL,
                (Object[]) null);
    }

}
