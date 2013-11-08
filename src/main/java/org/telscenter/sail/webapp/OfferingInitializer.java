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
package org.telscenter.sail.webapp;

import java.io.FileInputStream;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.CurnitParameters;
import net.sf.sail.webapp.domain.impl.OfferingParameters;
import net.sf.sail.webapp.service.curnit.CurnitService;
import net.sf.sail.webapp.service.offering.OfferingService;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.telscenter.sail.webapp.dao.module.ModuleDao;
import org.telscenter.sail.webapp.dao.offering.RunDao;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.dao.project.ProjectDao;
import org.telscenter.sail.webapp.domain.Module;
import org.telscenter.sail.webapp.domain.Run;
import org.telscenter.sail.webapp.domain.impl.CreateUrlModuleParameters;
import org.telscenter.sail.webapp.domain.impl.ProjectParameters;
import org.telscenter.sail.webapp.domain.impl.RunImpl;
import org.telscenter.sail.webapp.domain.impl.RunParameters;
import org.telscenter.sail.webapp.domain.impl.UrlModuleImpl;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.domain.project.impl.ProjectImpl;
import org.telscenter.sail.webapp.domain.project.impl.ProjectType;
import org.telscenter.sail.webapp.service.offering.RunService;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * A disposable class that is used to create default curnits, jnlp(s), and
 * offerings in the data store.
 * 
 * @author Hiroki Terashima
 * 
 * @version $Id$
 * 
 */

public class OfferingInitializer {

    private CurnitService curnitService;

    private RunService runService;
    
    private ProjectService projectService;

    private ApplicationContext applicationContext;
    
    private List<String> moduleurls = new ArrayList<String>();
    
    {
    	moduleurls.add("/curriculum/unit9999/lesson9999/lesson9999.project.xml");
    	//moduleurls.add("/curriculum/asu/demo1/asu_demo1.project.xml");
    }
    /**
     * @param applicationContext
     */
    public OfferingInitializer(
            ConfigurableApplicationContext applicationContext) {
        init(applicationContext);
    }

    public Offering[] createDefaultOfferings(User adminUser) 
    	throws ObjectNotFoundException {
    	System.out.println("Creating Default Offerings...");
    	
    	// Read properties file to get baseurl of vlewrapper
    	Properties properties = new Properties();
    	try {
    		FileInputStream in = new FileInputStream("src/main/resources/portal.properties");
    		properties.load(in);
    		in.close();
    	} catch(Exception e) {
    		System.err.println("Exception opening portal.properties file");
    		e.printStackTrace();
    	}
		Set<User> owners = new HashSet<User>();
		owners.add(adminUser);
    	
    	String vlewrapper_base_url = properties.getProperty("vlewrapper_baseurl", "http://localhost:8080/vlewrapper");

    	for (String moduleurl : moduleurls) {
    		CreateUrlModuleParameters curnitParameters = new CreateUrlModuleParameters();
    		curnitParameters.setUrl(moduleurl);
    		curnitParameters.setName("sample module");
    		Curnit createCurnit = this.curnitService.createCurnit(curnitParameters);
        	ProjectParameters projectParameters = 
        		(ProjectParameters) this.applicationContext.getBean("projectParameters");
        	projectParameters.setCurnitId(createCurnit.getId());
        	projectParameters.setProjectType(ProjectType.LD);
        	projectParameters.setProjectname("sample project");
    		this.projectService.createProject(projectParameters);
    	}

//    	RunParameters runParameters = 
//    		(RunParameters) applicationContext.getBean("runParamters");
//    	runParameters.set
//		this.runService.createRun(runParameters );
    	/*
    	int offeringsIndex = 0;
    	for (String moduleurl : moduleurls) {
    		// create a module for each module
    		UrlModuleImpl urlModule = new UrlModuleImpl();
    		urlModule.setModuleUrl(vlewrapper_base_url + moduleurl);
			urlModule.setOwners(owners);
			CurnitParameters curnitParameters =  (CurnitParameters) applicationContext
            .getBean("curnitParameters");
			this.curnitService.createCurnit(curnitParameters );
            ModuleDao<Module> moduleDao = (ModuleDao<Module>) applicationContext.getBean("moduleDao");
            moduleDao.save(urlModule);
            Long moduleId = urlModule.getId();
            ProjectImpl project = new ProjectImpl();
            project.setCurnit(urlModule);
            project.setOwners(owners);
            ProjectDao<Project> projectDao = (ProjectDao<Project>) applicationContext.getBean("projectDao");
            project.setName("Sample project " + offeringsIndex+1);
            project.setProjectType(ProjectType.LD);
            projectDao.save(project);

            Run run = new RunImpl();
            RunDao<Run> runDao = (RunDao<Run>) applicationContext.getBean("runDao");
            run.setProject(project);
            run.setName("sample run");
            run.setRuncode("Sample" + offeringsIndex+1);
    		run.setEndtime(null);
    		run.setStarttime(Calendar.getInstance().getTime());
            runDao.save(run);
            run.setOwners(owners);
            runDao.save(run);
            
            project.setPreviewRun(run);
            projectDao.save(project);
            offeringsIndex++;
    	}
    	*/

    	System.out.println("Creating Default Offerings...Successful!");
        return null;
    }

    private void init(ApplicationContext applicationContext) {
    	this.applicationContext = applicationContext;
        this.setCurnitService((CurnitService) applicationContext
                .getBean("curnitService"));
        this.setRunService((RunService) applicationContext
                .getBean("runService"));
        this.setProjectService((ProjectService) applicationContext
        		.getBean("rooloProjectService"));
    }
    
    /**
     * @param curnitService
     *            the curnitService to set
     */
    @Required
    public void setCurnitService(CurnitService curnitService) {
        this.curnitService = curnitService;
    }

    /**
     * @param offeringService
     *            the offeringService to set
     */
    @Required
    public void setRunService(RunService runService) {
        this.runService = runService;
    }

	/**
	 * @param projectService the projectService to set
	 */
    @Required
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}
}
