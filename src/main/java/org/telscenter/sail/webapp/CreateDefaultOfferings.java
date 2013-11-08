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
package org.telscenter.sail.webapp;

import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.Curnit;
import net.sf.sail.webapp.domain.Jnlp;
import net.sf.sail.webapp.domain.Offering;
import net.sf.sail.webapp.domain.impl.CurnitParameters;
import net.sf.sail.webapp.domain.impl.JnlpParameters;
import net.sf.sail.webapp.domain.impl.OfferingParameters;
import net.sf.sail.webapp.service.curnit.CurnitService;
import net.sf.sail.webapp.service.jnlp.JnlpService;
import net.sf.sail.webapp.service.offering.OfferingService;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.telscenter.sail.webapp.domain.impl.ProjectParameters;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.service.project.ProjectService;

/**
 * A disposable class that is used to create default curnits, jnlp(s), and
 * offerings in the data store.
 * 
 * @author Cynick Young
 * 
 * @version $Id$
 * 
 */
public class CreateDefaultOfferings {

    private CurnitService curnitService;

    private JnlpService jnlpService;

    private OfferingService offeringService;
    
    private ProjectService projectService;

    private static final Map<String, String> CURNITS;

    private static final Map<String, String> JNLPS;

    static {
        Map<String, String> hashmap = new HashMap<String, String>();

        hashmap
                .put(
                		"Airbags", 
                		"http://www.telscenter.org/confluence/download/attachments/13003/converted-wise-dev.berkeley.edu-24587.jar?version=11");
        hashmap
                .put(
		                "Meiosis", 
		                "http://www.telscenter.org/confluence/download/attachments/19315/converted-wise-dev.berkeley.edu-29913.jar");

        CURNITS = Collections.unmodifiableMap(hashmap);

        hashmap = new HashMap<String, String>();
        hashmap
                .put(
                        "PLR Everything JDIC snapshot current",
                        "http://tels-develop.soe.berkeley.edu:8080/jnlp/org/telscenter/jnlp/plr-everything-jdic-snapshot/plr-everything-jdic-snapshot.jnlp");
        hashmap
                .put(
                        "PLR Everything + OTrunk",
                        "http://tels-develop.soe.berkeley.edu:8080/jnlp/org/telscenter/jnlp/plr-everything-jdic-otrunk-snapshot/plr-everything-jdic-otrunk-snapshot.jnlp");
        
        hashmap
                .put(
                		"All OTrunk Snapshot Always Update", 
                        "http://jnlp.concord.org/dev/org/concord/maven-jnlp/all-otrunk-snapshot/all-otrunk-snapshot.jnlp");
        
        JNLPS = Collections.unmodifiableMap(hashmap);
    }

    public Offering[] createDefaultOfferings(
            ApplicationContext applicationContext, Curnit[] curnits,
            Jnlp[] jnlps) throws ObjectNotFoundException {
        Offering[] offerings = new Offering[curnits.length * jnlps.length];
        int offeringsIndex = 0;
        for (int c = 0, cLength = curnits.length; c < cLength; c++) {
            for (int j = 0, jLength = jnlps.length; j < jLength; j++) {
                OfferingParameters offeringParameters = (OfferingParameters) applicationContext
                        .getBean("offeringParameters");
                offeringParameters.setCurnitId(curnits[c].getId());
                offeringParameters.setName(curnits[c].getSdsCurnit().getName());
                offerings[offeringsIndex] = this.offeringService
                        .createOffering(offeringParameters);
                offeringsIndex++;
            }
        }
        return offerings;
    }

    public Curnit[] createDefaultCurnits(ApplicationContext applicationContext) {
        Set<String> keys = CURNITS.keySet();
        Curnit[] curnits = new Curnit[keys.size()];
        int i = 0;
        for (Iterator<String> curnitIterator = keys.iterator(); curnitIterator
                .hasNext(); i++) {
            CurnitParameters curnitParameters = (CurnitParameters) applicationContext
                    .getBean("curnitParameters");
            String name = curnitIterator.next();
            curnitParameters.setName(name);
            curnitParameters.setUrl(CURNITS.get(name));
            curnits[i] = this.curnitService.createCurnit(curnitParameters);
        }

        return curnits;
    }

    public Jnlp[] createDefaultJnlps(ApplicationContext applicationContext) {
        Set<String> keys = JNLPS.keySet();
        Jnlp[] jnlps = new Jnlp[keys.size()];
        int i = 0;
        for (Iterator<String> jnlpIterator = keys.iterator(); jnlpIterator
                .hasNext(); i++) {
            String name = jnlpIterator.next();
            JnlpParameters jnlpParameters = (JnlpParameters) applicationContext
                    .getBean("jnlpParameters");
            jnlpParameters.setName(name);
            jnlpParameters.setUrl(JNLPS.get(name));
            jnlps[i] = this.jnlpService.createJnlp(jnlpParameters);
        }
        return jnlps;
    }
    
    public Project[] createDefaultProjects(ApplicationContext applicationContext, Curnit[] curnits, Jnlp[] jnlps) {
    	Project[] projects = new Project[2];
    	Curnit meiosisCurnit = null;
    	Curnit airbagsCurnit = null;
    	Jnlp plrJnlp = null;
    	Jnlp plrotrunkJnlp = null;
    	
    	for (Curnit curnit : curnits) {
    		if (curnit.getSdsCurnit().getName() == "Meiosis") {
    			meiosisCurnit = curnit;
    		}
    		if (curnit.getSdsCurnit().getName() == "Airbags") {
    			airbagsCurnit = curnit;
    		}
    	}
    	
    	for (Jnlp jnlp : jnlps) {
    		if (jnlp.getSdsJnlp().getName() == "PLR Everything JDIC snapshot current") {
    			plrJnlp = jnlp;
    		}
    		if (jnlp.getSdsJnlp().getName() == "PLR Everything + OTrunk") {
    			plrotrunkJnlp = jnlp;
    		}
    	}
    	
    	ProjectParameters projectParameters = (ProjectParameters) applicationContext
        .getBean("projectParameters");
    	
    	// create Meiosis project
    	projectParameters.setCurnitId(meiosisCurnit.getId());
    	projectParameters.setJnlpId(plrotrunkJnlp.getId());
    	try {
			projects[0] = this.projectService.createProject(projectParameters);
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}

    	// create Airbags project
    	projectParameters.setCurnitId(airbagsCurnit.getId());
    	projectParameters.setJnlpId(plrJnlp.getId());
    	try {
			projects[1] = this.projectService.createProject(projectParameters);
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
    	
    	return projects;
    }

    /**
     * @param applicationContext
     */
    public CreateDefaultOfferings(
            ConfigurableApplicationContext applicationContext) {
        init(applicationContext);
    }

    private void init(ApplicationContext applicationContext) {
        this.setCurnitService((CurnitService) applicationContext
                .getBean("curnitService"));
        this.setJnlpService((JnlpService) applicationContext
                .getBean("jnlpService"));
        this.setOfferingService((OfferingService) applicationContext
                .getBean("offeringService"));
        this.setProjectService((ProjectService) applicationContext
        		.getBean("projectService"));
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
     * @param jnlpService
     *            the jnlpService to set
     */
    @Required
    public void setJnlpService(JnlpService jnlpService) {
        this.jnlpService = jnlpService;
    }

    /**
     * @param offeringService
     *            the offeringService to set
     */
    @Required
    public void setOfferingService(OfferingService offeringService) {
        this.offeringService = offeringService;
    }

	/**
	 * @param projectService the projectService to set
	 */
    @Required
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}
}