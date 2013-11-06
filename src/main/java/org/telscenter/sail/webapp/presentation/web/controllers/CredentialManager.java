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
package org.telscenter.sail.webapp.presentation.web.controllers;

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
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.multipart.support.DefaultMultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.presentation.util.KeyGenerator;
import org.telscenter.sail.webapp.presentation.util.http.Base64;
import org.telscenter.sail.webapp.service.authentication.UserDetailsService;
import org.telscenter.sail.webapp.service.project.ProjectService;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.User;
import net.sf.sail.webapp.domain.impl.CurnitGetCurnitUrlVisitor;
import net.sf.sail.webapp.presentation.web.listeners.PasSessionListener;


/**
 * The Credential Manager is responsible for creating unique credentials for
 * HttpRequests, and authenticating credentials from Servlets those credentials
 * were forwarded to.
 * 
 * @author patrick lawler
 * @version $Id:$
 */
public final class CredentialManager extends AbstractController{
	
	private static final String AUTHENTICATE = "authenticate";
	
	private static final String PROJECTID = "projectId";
	
	private static ProjectService projectService;
	
	private static Properties portalProperties;
	
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
				
				Iterator iter = multiRequest.getFileNames();
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
	
	@SuppressWarnings("unchecked")
	public static void authenticate(HttpServletRequest request, HttpServletResponse response){
		boolean authenticated = false;
		
		/* get credentials from the request - decode and parse */
		String baseCredentials = (String) request.getParameter("credentials");
		if(baseCredentials != null){
			try{
				String key = baseCredentials.split("~")[1];
				String username = (String) Base64.decodeToObject(baseCredentials.split("~")[0]);
				
				/* if key and username are not null retrieve the session id from the context and check username against session */
				if(key != null && username != null){
					Map<String,String> keyToSessionIds = (Map<String,String>) request.getSession().getServletContext().getAttribute("keyToSessionIds");
					if(keyToSessionIds.containsKey(key)){
						String sId = keyToSessionIds.get(key);
						keyToSessionIds.remove(key);
						
						/* check all logged in users to see if that user is associated with that session id */
						Map<String,User> sessionIdsToUsers = (Map<String,User>) request.getSession().getServletContext().getAttribute(PasSessionListener.ALL_LOGGED_IN_USERS);
						if(sessionIdsToUsers != null && sessionIdsToUsers.containsKey(sId)){
							User user = sessionIdsToUsers.get(sId);
							/* check the user against the sessionId, also get the user from the session and check because
							 * of the ability of administrators to log in as other users */
							if(user != null && user.getUserDetails().getUsername().equals(username)){
								authenticated = true;
							} else if(user.getUserDetails().hasGrantedAuthority(UserDetailsService.ADMIN_ROLE)){
								/* then the user is an admin and has logged in as another user */
								authenticated = true;
							}
						}
					}
				}
			} catch(ClassNotFoundException e){
				e.printStackTrace();
			} catch(IOException e){
				e.printStackTrace();
			}
		}
		
		/* write authentication success to the response */
		try{
			if(authenticated){
				response.getWriter().write("true");
			} else {
				response.getWriter().write("false");
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String authenticate = request.getParameter(AUTHENTICATE);
		
		/* catch authentication requests */
		if(authenticate != null){
			CredentialManager.authenticate(request, response);
		}
		

		return null;
	}
	
	/**
	 * Given a <code>HttpServletRequest</code> request, sets the maximum allowed drive
	 * access to the curriculum dir known to the portal if no projectId is passed as a
	 * parameter but sets the maximum allowed drive access to that of the project directory
	 * if a projectId is passed.
	 * 
	 * @param request
	 */
	private static void setAllowedPathAccess(HttpServletRequest request){
		String idStr = request.getParameter(PROJECTID);
		String accessPath = portalProperties.getProperty("curriculum_base_dir");
		
		/* catch minify command and set access path to the vle/all */
		if("minify".equals(request.getParameter("command"))){
			accessPath = accessPath.replace("curriculum", "vle/all");
		}
		
		if("studentAssetUpload".equals(request.getParameter("cmd")) || "studentAssetCopyForReference".equals(request.getParameter("command"))) {
			accessPath = portalProperties.getProperty("studentuploads_base_dir");
		}
		
		/* if there is a project id parameter, set access level to the project dir */
		if(idStr != null && !idStr.equals("") && !idStr.equals("none")){
			try{
				Project project = projectService.getById(Long.parseLong(idStr));
				String projectPath = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
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
		
		request.setAttribute("accessPath", accessPath);
	}

	/**
	 * @param projectService the projectService to set
	 */
	public void setProjectService(ProjectService projectService) {
		CredentialManager.projectService = projectService;
	}

	/**
	 * @param portalProperties the portalProperties to set
	 */
	public void setPortalProperties(Properties portalProperties) {
		CredentialManager.portalProperties = portalProperties;
	}
}
