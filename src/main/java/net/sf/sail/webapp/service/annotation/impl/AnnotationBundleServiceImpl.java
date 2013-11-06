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
package net.sf.sail.webapp.service.annotation.impl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import net.sf.sail.emf.sailuserdata.EAnnotationBundle;
import net.sf.sail.webapp.dao.annotation.AnnotationBundleDao;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.annotation.AnnotationBundle;
import net.sf.sail.webapp.domain.annotation.impl.AnnotationBundleImpl;
import net.sf.sail.webapp.service.annotation.AnnotationBundleService;

import org.eclipse.emf.common.util.EList;
import org.springframework.transaction.annotation.Transactional;
import org.telscenter.pas.emf.pas.EActivity;
import org.telscenter.pas.emf.pas.ECurnitmap;
import org.telscenter.pas.emf.pas.EProject;
import org.telscenter.pas.emf.pas.ERim;
import org.telscenter.pas.emf.pas.EStep;

/**
 * @author Hiroki Terashima
 * @version $Id$
 */
public class AnnotationBundleServiceImpl implements AnnotationBundleService {

	private AnnotationBundleDao<AnnotationBundle> annotationBundleDao;
	

	/**
	 * @see net.sf.sail.webapp.service.annotation.AnnotationBundleService#saveAnnotationBundle(net.sf.sail.webapp.domain.annotation.AnnotationBundle)
	 */
	@Transactional
	public void saveAnnotationBundle(AnnotationBundle annotationBundle) {
		// save annotation as into stream, then convert the stream into String
		EAnnotationBundle eAnnotationBundle = annotationBundle.getEAnnotationBundle();

		ByteArrayOutputStream annotationOutStream = 
			new ByteArrayOutputStream();
		byte [] annotationBytes = null;				

		try {
			eAnnotationBundle.eResource().save(annotationOutStream, null);
			annotationBytes = annotationOutStream.toByteArray();
		} catch (IOException e) {
			e.printStackTrace();
		}
		String annotationBundleXMLString = new String(annotationBytes);
		annotationBundle.setBundle(annotationBundleXMLString);
		annotationBundleDao.save(annotationBundle);
	}

	/**
	 * @see net.sf.sail.webapp.service.annotation.AnnotationBundleService#getAnnotationBundle(Workgroup)
	 */
	public AnnotationBundle getAnnotationBundle(Workgroup workgroup) {
		AnnotationBundle retrieveAnnotationBundle = annotationBundleDao.retrieveAnnotationBundle(workgroup);
		retrieveAnnotationBundle.getEAnnotationBundle();
		return retrieveAnnotationBundle;
	}

	/**
	 * @see net.sf.sail.webapp.service.annotation.AnnotationBundleService#createAnnotationBundle(Workgroup, ECurnitmap)
	 */
	public void createAnnotationBundle(Workgroup workgroup, ECurnitmap curnitmap) {

		StringBuilder xmlString = new StringBuilder();
		//append the header
		xmlString.append("<?xml version=\"1.0\" encoding=\"ASCII\"?><sailuserdata:EAnnotationBundle xmi:version=\"2.0\" xmlns:xmi=\"http://www.omg.org/XMI\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:sailuserdata=\"sailuserdata\">");

		List<EStep> allSteps = new ArrayList<EStep>();
		EProject project = curnitmap.getProject();
		for (Iterator actIt = project.getActivity().iterator(); actIt.hasNext();) {
			EActivity act = (EActivity) actIt.next();

			for (Iterator stepIt = act.getStep().iterator(); stepIt.hasNext();) {
				EStep step = (EStep) stepIt.next();
				allSteps.add(step);
			}
		}

		xmlString.append("<annotationGroups annotationSource=\"http://telscenter.org/annotation/score\">");  
		for (EStep step : allSteps) {
			buildAnnotationString(xmlString, step, null);
		}
		xmlString.append("</annotationGroups>");
		
		xmlString.append("<annotationGroups annotationSource=\"http://telscenter.org/annotation/comments\">");  
		for (EStep step : allSteps) {
			buildAnnotationString(xmlString, step, null);
			EList rims = step.getRim();
			for (Iterator rimIt = rims.iterator(); rimIt
				.hasNext();) {
				ERim rim = (ERim) rimIt.next();
				buildAnnotationString(xmlString, step, rim);
			}
		}
		xmlString.append("</annotationGroups>");
		
		xmlString.append("</sailuserdata:EAnnotationBundle>");

		AnnotationBundle annotationBundle = new AnnotationBundleImpl();
		annotationBundle.setBundle(xmlString.toString());
		annotationBundle.setWorkgroup(workgroup);
		this.annotationBundleDao.save(annotationBundle);
	}

	/**
	 * Builds the annotation string
	 * 
	 * @param xmlString - the current xml string that is being built
	 * @param step - the current step
	 * @param rim - the current rim
	 */
	protected void buildAnnotationString(StringBuilder xmlString, EStep step,
			ERim rim) {
		//for each rim entry
		xmlString.append("<annotations entityUUID=\"");
		//podUUID of step
		xmlString.append(step.getPodUUID().toString());
		xmlString.append("\"");
		xmlString.append(" ");

		
		if( rim != null) {
			//entityName
			xmlString.append("entityName=\"");
			xmlString.append(rim.getRimname());
			xmlString.append("\"");
			xmlString.append(" ");
		}
		
		xmlString.append("contentType=\"text/plain\"");
		xmlString.append(" ");
		xmlString.append("contents=\"");
		xmlString.append("\"");
		xmlString.append("/>");
	}

	/**
	 * @param annotationBundleDao the annotationBundleDao to set
	 */
	public void setAnnotationBundleDao(
			AnnotationBundleDao<AnnotationBundle> annotationBundleDao) {
		this.annotationBundleDao = annotationBundleDao;
	}
}


