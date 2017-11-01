/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.TreeMap;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.support.DefaultMultipartHttpServletRequest;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.util.KeyGenerator;
import org.wise.portal.presentation.util.http.Base64;
import org.wise.portal.service.project.ProjectService;

/**
 * The Credential Manager is responsible for creating unique credentials for
 * HttpRequests, and authenticating credentials from Servlets those credentials
 * were forwarded to.
 *
 * @author Patrick Lawler
 */
@Component
public final class CredentialManager {

  private static ProjectService projectService;

  private static Properties wiseProperties;

  @Autowired
  public void setProjectService(ProjectService projectService){
    CredentialManager.projectService = projectService;
  }

  @Autowired
  public void setWiseProperties(Properties wiseProperties){
    CredentialManager.wiseProperties = wiseProperties;
  }

  private static final String AUTHENTICATE = "authenticate";

  private static final String PROJECTID = "projectId";

  @SuppressWarnings("unchecked")
  public static void setRequestCredentials(HttpServletRequest request, User user){
    String key = KeyGenerator.generateKey();
    ServletContext sc = request.getSession().getServletContext();

    /* retrieve keytosessionids from servlet context if it exists, create otherwise */
    Map<String,String> keyToSessionIds = (Map<String,String>) sc.getAttribute("keyToSessionIds");
    if(keyToSessionIds==null){
      keyToSessionIds = new TreeMap<String,String>();
      sc.setAttribute("keyToSessionIds", keyToSessionIds);
    }

    /* add new key and associated session id to map */
    keyToSessionIds.put(key, request.getSession().getId());

    /* set required request attributes */
    try{
      /* set the username ~ key credentials in the request */
      request.setAttribute("credentials", Base64.encodeObject(user.getUserDetails().getUsername(), Base64.URL_SAFE) + "~" + key);

      /* set allowed path access */
      setAllowedPathAccess(request);

      /* if this is a file upload, get the file from the request and set it as an attribute */
      if(request.getClass().getName().endsWith("DefaultMultipartHttpServletRequest")){
        DefaultMultipartHttpServletRequest multiRequest = (DefaultMultipartHttpServletRequest) request;
        List<String> filenames = new ArrayList<String>();
        Map<String,byte[]> fileMap = new TreeMap<String,byte[]>();

        Iterator<String> iter = multiRequest.getFileNames();
        while(iter.hasNext()){
          String filename = (String)iter.next();
          filenames.add(filename);
          fileMap.put(filename, multiRequest.getFile(filename).getBytes());
        }

        request.setAttribute("filenames", filenames);
        request.setAttribute("fileMap", fileMap);
      }
    } catch (IOException e){
      e.printStackTrace();
    }
  }

  public static String getAllowedPathAccess(HttpServletRequest request) {
    String idStr = request.getParameter(PROJECTID);
    String accessPath = wiseProperties.getProperty("curriculum_base_dir");

    if ("studentAssetUpload".equals(request.getParameter("cmd")) || "studentAssetCopyForReference".equals(request.getParameter("command"))) {
      accessPath = wiseProperties.getProperty("studentuploads_base_dir");
    }

    /* if there is a project id parameter, set access level to the project dir */
    if (idStr != null && !idStr.equals("") && !idStr.equals("none")){
      try{
        Project project = projectService.getById(Long.parseLong(idStr));
        String projectPath = project.getModulePath();
        if(projectPath != null){
          File accessFile = new File(accessPath + projectPath);
          accessPath = accessFile.getParentFile().getCanonicalPath();
        }
      } catch(IOException e){
        e.printStackTrace();
      } catch (NumberFormatException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
      } catch (ObjectNotFoundException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
      }
    }

    return accessPath;
  }

  /**
   * Given a <code>HttpServletRequest</code> request, sets the maximum allowed drive
   * access to the curriculum dir known to the portal if no projectId is passed as a
   * parameter but sets the maximum allowed drive access to that of the project directory
   * if a projectId is passed.
   *
   * @param request
   */
  public static void setAllowedPathAccess(HttpServletRequest request) {
    //get the access path
    String accessPath = getAllowedPathAccess(request);

    //set the access path into the request
    request.setAttribute("accessPath", accessPath);
  }
}
