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

import static org.easymock.EasyMock.*;

import org.telscenter.pas.emf.pas.ECurnitmap;
import org.telscenter.pas.emf.pas.util.CurnitmapLoader;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.dao.annotation.AnnotationBundleDao;
import net.sf.sail.webapp.domain.Workgroup;
import net.sf.sail.webapp.domain.annotation.AnnotationBundle;
import net.sf.sail.webapp.domain.annotation.impl.AnnotationBundleImpl;
import net.sf.sail.webapp.domain.impl.WorkgroupImpl;
import junit.framework.TestCase;

/**
 * @author Hiroki Terashima
 * @version $ Id: $
 */
public class AnnotationBundleServiceImplTest extends TestCase {
	
	private AnnotationBundleServiceImpl annotationBundleService;

	private AnnotationBundleDao<AnnotationBundle> mockAnnotationBundleDao;
	
	private AnnotationBundle annotationBundle;
	
	private Workgroup workgroup;

	private String annotationBundleXMLString = "<?xml version=\"1.0\" encoding=\"ASCII\"?>" +
	"<sailuserdata:EAnnotationBundle xmi:version=\"2.0\" xmlns:xmi=\"http://www.omg.org/XMI\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:sailuserdata=\"sailuserdata\">" +
	"<annotationGroups annotationSource=\"http://telscenter.org/annotation/score\">" +                               
    "<annotations entityUUID=\"dddddddd-6004-0002-0000-000000000000\" contentType=\"text/plain\" contents=\"\"/>" +
    "<annotations entityUUID=\"dddddddd-6004-0003-0000-000000000000\" contentType=\"text/plain\" contents=\"\"/>" +
    "</annotationGroups>" +
	"<annotationGroups annotationSource=\"http://telscenter.org/annotation/comments\">" +                               
    "<annotations entityUUID=\"dddddddd-6004-0002-0000-000000000000\" contentType=\"text/plain\" contents=\"\"/>" +
    "<annotations entityUUID=\"dddddddd-6004-0002-0000-000000000000\" entityName=\"undefined6\" contentType=\"text/plain\" contents=\"\"/>" +
    "<annotations entityUUID=\"dddddddd-6004-0003-0000-000000000000\" contentType=\"text/plain\" contents=\"\"/>" +
    "<annotations entityUUID=\"dddddddd-6004-0003-0000-000000000000\" entityName=\"undefined7\" contentType=\"text/plain\" contents=\"\"/>" +
    "</annotationGroups></sailuserdata:EAnnotationBundle>";
	
	String curnitmapXMLString = "<?xml version=\"1.0\" encoding=\"ASCII\"?>" +
	"<pas:ECurnitmap xmi:version=\"2.0\" xmlns:xmi=\"http://www.omg.org/XMI\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:pas=\"pas\" xsi:schemaLocation=\"pas pas.ecore\">" +
	"<project podUUID=\"cccccccc-0002-3878-0000-000000000000\"	title=\"Global Warming: Virtual Earth\">" +
	"<activity podUUID=\"dddddddd-6004-0000-0000-000000000000\"	title=\"Identifying the Problem\" number=\"0\">" +
	"<step podUUID=\"dddddddd-6004-0002-0000-000000000000\"	title=\"2. Take notes on the Science behind Global Warming part 1\" number=\"1\"			type=\"Note\" classname=\"org.telscenter.pas.steps.Note\" ><rim rimname=\"undefined6\" prompt=\"html-stylized prompt for step 2 goes here\"/></step>" +
	"<step podUUID=\"dddddddd-6004-0003-0000-000000000000\"	title=\"3. Take notes on the Science behind Global Warming part 2\" number=\"2\"			type=\"Note\" classname=\"org.telscenter.pas.steps.Note\" ><rim rimname=\"undefined7\" prompt=\"html-stylized prompt for step 3 goes here\"/></step>" +
	"</activity></project></pas:ECurnitmap>";	
	
	@SuppressWarnings("unchecked")
	@Override
	protected void setUp() {
		annotationBundleService = new AnnotationBundleServiceImpl();
		mockAnnotationBundleDao = createMock(AnnotationBundleDao.class);
		annotationBundleService.setAnnotationBundleDao(mockAnnotationBundleDao);
		
		// TODO HT replace with bean context if possible
		annotationBundle = new AnnotationBundleImpl();
		annotationBundle.setBundle(annotationBundleXMLString);
		workgroup = new WorkgroupImpl();
		annotationBundle.setWorkgroup(workgroup);
	}

	@Override
	protected void tearDown() {
		annotationBundleService = null;
		mockAnnotationBundleDao = null;
		annotationBundle = null;
	}
	
	public void testSaveAnnotationBundle() {
		mockAnnotationBundleDao.save(annotationBundle);
		expectLastCall();
		annotationBundleService.saveAnnotationBundle(annotationBundle);
		assertTrue(true);
	}
	
	/**
	 * Tests creating the annotation bundle xml
	 * 
	 * @throws ObjectNotFoundException
	 */
	public void testCreateAnnotationBundle() throws ObjectNotFoundException {
		mockAnnotationBundleDao.save(annotationBundle);
		expectLastCall();
		replay(mockAnnotationBundleDao);
		annotationBundleService.createAnnotationBundle(workgroup, this.getCurnitmapMock());
		verify(mockAnnotationBundleDao);
	}
	
	/**
	 * Creates a mock curnit map to test
	 */
	public ECurnitmap getCurnitmapMock() throws ObjectNotFoundException {
		ECurnitmap curnitmap = CurnitmapLoader.loadCurnitmap(curnitmapXMLString);
		return curnitmap;
	}

}
