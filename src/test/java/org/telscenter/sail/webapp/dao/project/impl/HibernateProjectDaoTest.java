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
package org.telscenter.sail.webapp.dao.project.impl;

import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.telscenter.sail.webapp.domain.Module;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.ModuleImpl;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.impl.ProjectImpl;

import net.sf.sail.webapp.domain.Jnlp;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.CurnitImpl;
import net.sf.sail.webapp.domain.impl.JnlpImpl;
import net.sf.sail.webapp.domain.impl.UserImpl;
import net.sf.sail.webapp.domain.sds.SdsCurnit;
import net.sf.sail.webapp.domain.sds.SdsJnlp;

/**
 * @author Hiroki Terashima
 *
 * @version $Id$
 */
public class HibernateProjectDaoTest extends org.telscenter.sail.webapp.dao.AbstractTransactionalDaoTests<HibernateProjectDao, Project> {

    private static final Long SDS_CURNIT_ID = new Long(7);

    private static final Long SDS_JNLP_ID = new Long(5);

    private static final String CURNIT_NAME = "Airbags Curnit";

    private static final String CURNIT_URL = "http://curnitmrpotatoiscoolerthanwoody.com";

    private static final String JNLP_NAME = "Airbags JNLP";

    private static final String JNLP_URL = "http://jnlpmrpotatoiscoolerthanwoody.com";

    private static final String MODULE_DESCRIPTION = "this module is for smart kids";

	private static final Long MODULE_COMPUTER_TIME = new Long(40);

	private static final Set<User> MODULE_OWNERS = new HashSet<User>();

	private static final String MODULE_TECH_REQS = "This module requires a giant TV";

	private static final Long MODULE_TOTAL_TIME = new Long(45);
	
	private static final Date START_TIME = Calendar.getInstance().getTime();

	private static final Date END_TIME = Calendar.getInstance().getTime();
	
	private static final String RUNCODE = "abcde-123";
	
	private ModuleImpl moduleImpl;
	
	private Jnlp jnlp;
	
    private SdsCurnit sdsCurnit;

    private SdsJnlp sdsJnlp;
    
    private Run run;
		
	public void setJnlp(Jnlp jnlp) {
		this.jnlp = jnlp;
	}
	
	public void setModuleImpl(ModuleImpl moduleImpl) {
		this.moduleImpl = moduleImpl;
	}

	public void setSdsCurnit(SdsCurnit sdsCurnit) {
        this.sdsCurnit = sdsCurnit;
    }

    public void setSdsJnlp(SdsJnlp sdsJnlp) {
        this.sdsJnlp = sdsJnlp;
    }

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
    	
        this.sdsCurnit.setSdsObjectId(SDS_CURNIT_ID);
        this.sdsCurnit.setName(CURNIT_NAME);
        this.sdsCurnit.setUrl(CURNIT_URL);

        this.sdsJnlp.setSdsObjectId(SDS_JNLP_ID);
        this.sdsJnlp.setName(JNLP_NAME);
        this.sdsJnlp.setUrl(JNLP_URL);

    	this.moduleImpl.setSdsCurnit(this.sdsCurnit);
    	this.jnlp.setSdsJnlp(this.sdsJnlp);

    	MODULE_OWNERS.add(new UserImpl());
    	this.moduleImpl.setDescription(MODULE_DESCRIPTION);
    	this.moduleImpl.setComputerTime(MODULE_COMPUTER_TIME);
    	this.moduleImpl.setOwners(MODULE_OWNERS);
    	this.moduleImpl.setTechReqs(MODULE_TECH_REQS);
    	this.moduleImpl.setTotalTime(MODULE_TOTAL_TIME);
    	this.dataObject.setCurnit(this.moduleImpl);
    	this.dataObject.setJnlp(this.jnlp);
    	this.run.setOwners(null);
		this.run.setPeriods(null);
		this.run.setRuncode(RUNCODE);
		this.run.setSdsOffering(null);
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
    	this.moduleImpl = null;
    	this.jnlp = null;
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
        assertEquals(SDS_CURNIT_ID, actualProjectMap
        		.get(SdsCurnit.COLUMN_NAME_CURNIT_ID.toUpperCase()));
        assertEquals(SDS_JNLP_ID, actualProjectMap
        		.get(SdsJnlp.COLUMN_NAME_JNLP_ID.toUpperCase()));
        
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
	 * SELECT * FROM projects, curnits, jnlps, sds_curnits, sds_jnlps 
	 * WHERE projects.curnit_fk = curnits.id 
	 * AND projects.jnlp_fk = jnlps.id
	 * AND curnits.sds_curnit_fk = sds_curnits.id
	 * AND jnlps.sds_jnlp_fk = sds_jnlps.id
	 */
	private static final String RETRIEVE_PROJECT_LIST_SQL = 
		"SELECT * FROM "
		+ ProjectImpl.DATA_STORE_NAME + ", " + CurnitImpl.DATA_STORE_NAME + ", "
		+ JnlpImpl.DATA_STORE_NAME + ", " + SdsCurnit.DATA_STORE_NAME + ", " + SdsJnlp.DATA_STORE_NAME
		+ " WHERE " 
		+ ProjectImpl.DATA_STORE_NAME + "." + ProjectImpl.COLUMN_NAME_CURNIT_FK
		+ " = "
		+ CurnitImpl.DATA_STORE_NAME + ".id"
		+ " AND "
		+ ProjectImpl.DATA_STORE_NAME + "." + ProjectImpl.COLUMN_NAME_JNLP_FK
		+ " = "
		+ JnlpImpl.DATA_STORE_NAME + ".id"
		+ " AND "
		+ CurnitImpl.DATA_STORE_NAME + "."
        + CurnitImpl.COLUMN_NAME_SDS_CURNIT_FK + " = "
        + SdsCurnit.DATA_STORE_NAME + ".id"
        + " AND "
		+ JnlpImpl.DATA_STORE_NAME + "."
        + JnlpImpl.COLUMN_NAME_SDS_JNLP_FK + " = "
        + SdsJnlp.DATA_STORE_NAME + ".id";

		
    private List<?> retrieveProjectListFromDb() {
        return this.jdbcTemplate.queryForList(RETRIEVE_PROJECT_LIST_SQL,
                (Object[]) null);
    }

}
