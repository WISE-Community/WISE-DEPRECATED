/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * 
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 * 
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 * 
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.service.module.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.dao.module.ModuleDao;
import org.wise.portal.domain.module.Curnit;
import org.wise.portal.domain.module.Module;
import org.wise.portal.domain.module.impl.CreateUrlModuleParameters;
import org.wise.portal.domain.module.impl.CurnitParameters;
import org.wise.portal.domain.module.impl.UrlModuleImpl;
import org.wise.portal.service.module.ModuleService;

/**
 *  Service for the TELS's Module Domain Object
 *  
 * @author Hiroki Terashima
 */
@Service
public class ModuleServiceImpl extends CurnitServiceImpl implements
		ModuleService {
	
	@Autowired
	private ModuleDao<Module> moduleDao;
	
	/**
	 * @throws Exception 
	 * @see net.sf.sail.webapp.service.curnit.impl.CurnitServiceImpl#createCurnit(net.sf.sail.webapp.domain.impl.CurnitParameters)
	 */
	 @Override
	 @Transactional()	
	 public Module createCurnit(CurnitParameters curnitParameters) {
		Module module = null;
		
		if (curnitParameters instanceof CreateUrlModuleParameters) {
			UrlModuleImpl urlModule = new UrlModuleImpl();
			urlModule.setName(((CreateUrlModuleParameters) curnitParameters).getName());
			urlModule.setModuleUrl(((CreateUrlModuleParameters) curnitParameters).getUrl());
			this.moduleDao.save(urlModule);
			return urlModule;
		} else {
			System.err.println("Creating this type of Curnit is not currently supported. Please talk to WISE staff.");
		}
    	return module;
	}

	 /**
	  * @see net.sf.sail.webapp.service.curnit.CurnitService#getCurnitList()
	  */
	 @Override	 
	 @Transactional(readOnly = true)
	 public List<? extends Curnit> getCurnitList() {
		 List<Module> podModuleList = this.moduleDao.getList();
		 List<Module> moduleList = new ArrayList<Module>();
		 moduleList.addAll(podModuleList);
		return moduleList;
		 
	 }
	 
	/**
	 * @throws ObjectNotFoundException 
	 * @see net.sf.sail.webapp.service.curnit.impl.CurnitServiceImpl#getById(java.lang.Long)
	 */
	@Override
	public Module getById(Long moduleId) throws ObjectNotFoundException {
		return moduleDao.getById(moduleId);
	}
	
	/**
	 * @see net.sf.sail.webapp.service.curnit.CurnitService#updateCurnit(net.sf.sail.webapp.domain.Curnit)
	 */
	@Override
	@Transactional()
	public void updateCurnit(Curnit curnit) {
		this.moduleDao.save((Module) curnit);
	}
}
