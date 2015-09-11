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
package org.wise.portal.service.vle.wise5;

import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.vle.domain.annotation.wise5.Annotation;
import org.wise.vle.domain.work.Event;
import org.wise.vle.domain.work.NotebookItem;
import org.wise.vle.domain.work.StudentAsset;
import org.wise.vle.domain.work.StudentWork;

import java.util.List;

/**
 * Services for the WISE Virtual Learning Environment (WISE VLE v5)
 * @author Hiroki Terashima
 */
public interface VLEService {

	/**
	 * @return List of StudentWork objects with the specified fields. If none matches,
	 * return an empty list.
	 */
	List<StudentWork> getStudentWorkList(Integer id, Integer runId, Integer periodId, Integer workgroupId,
                                            Boolean isAutoSave, String nodeId, String componentId, String componentType);

	/**
	 * Saves StudentWork in the data store
	 */
	StudentWork saveStudentWork(
            Integer id, Integer runId, Integer periodId, Integer workgroupId,
            Boolean isAutoSave, String nodeId, String componentId, String componentType,
            String studentData, String clientSaveTime) throws ObjectNotFoundException;

    /**
     * @return List of Event objects with the specified fields. If none matches,
     * return an empty list.
     */
    List<Event> getEvents(
            Integer id, Integer runId, Integer periodId, Integer workgroupId,
            String nodeId, String componentId, String componentType,
            String context, String category, String event);

    /**
     * Saves Event in the data store
     */
    Event saveEvent(
            Integer id, Integer runId, Integer periodId, Integer workgroupId,
            String nodeId, String componentId, String componentType,
            String context, String category, String event, String data,
            String clientSaveTime) throws ObjectNotFoundException;

    /**
     * @return List of Annotation objects with the specified fields. If none matches,
     * return an empty list.
     */
    List<Annotation> getAnnotations(
            Integer id, Integer runId, Integer periodId, Integer fromWorkgroupId, Integer toWorkgroupId,
            String nodeId, String componentId, Integer studentWorkId, String type);

    /**
     * Saves Annotation in the data store
     */
    Annotation saveAnnotation(
            Integer id, Integer runId, Integer periodId, Integer fromWorkgroupId, Integer toWorkgroupId,
            String nodeId, String componentId, Integer studentWorkId,
            String type, String data,
            String clientSaveTime) throws ObjectNotFoundException;

    /**
     * @return StudentsAssets from data store
     */
    List<StudentAsset> getStudentAssets(
            Integer id, Integer runId, Integer periodId, Integer workgroupId,
            String nodeId, String componentId, String componentType,
            Boolean isReferenced
    ) throws ObjectNotFoundException;

    /**
     * Saves StudentAssets in the data store
     */
    StudentAsset saveStudentAsset(
            Integer id, Integer runId, Integer periodId, Integer workgroupId,
            String nodeId, String componentId, String componentType,
            Boolean isReferenced, String fileName, String filePath, Long fileSize,
            String clientSaveTime, String clientDeleteTime) throws ObjectNotFoundException;


    StudentAsset getStudentAssetById(Integer studentAssetId) throws ObjectNotFoundException;

    StudentAsset deleteStudentAsset(Integer studentAssetId, Long clientDeleteTime);

    /**
     * @return NotebookItems from data store that match specified params
     */
    List<NotebookItem> getNotebookItems(
            Integer id, Integer runId, Integer periodId, Integer workgroupId,
            String nodeId, String componentId);

    /**
     * Saves NotebookItem in the data store
     */
    NotebookItem saveNotebookItem(
            Integer id, Integer runId, Integer periodId, Integer workgroupId,
            String nodeId, String componentId,
            Integer studentWorkId, Integer studentAssetId,
            String title, String description,
            String clientSaveTime, String clientDeleteTime);
}
