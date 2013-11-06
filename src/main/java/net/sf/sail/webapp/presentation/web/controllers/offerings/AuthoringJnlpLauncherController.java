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
package net.sf.sail.webapp.presentation.web.controllers.offerings;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.service.file.impl.AuthoringJNLPModifier;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;

/**
 * @author Laurel Williams
 * 
 * @version $Id: AuthoringJnlpLauncherController.java 394 2007-05-14 16:14:10Z
 *          laurel $
 */
public class AuthoringJnlpLauncherController extends AbstractController {

	private String jnlpFileName;
	
	private AuthoringJNLPModifier modifier;

	private static final String JNLP_RELATIVE_PATH = "/library/jnlp/";
	
	public static final String JNLP_CONTENT_TYPE = "application/x-java-jnlp-file";
			

	/**
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest,
	 *      javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		
		String jnlpString = getJNLPAsString();
		String curnitUrl = (String) request.getParameter(AuthoringJNLPModifier.CURNIT_URL_ATTRIBUTE);
		String outputJNLPString = modifier.modifyJnlp(jnlpString, curnitUrl, null);
		
		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Pragma", "no-cache");
		response.setDateHeader ("Expires", 0);
		
		String fileName = request.getServletPath();
		fileName = fileName.substring(fileName.lastIndexOf("/") + 1);
		fileName = fileName.substring(0, fileName.indexOf(".")) + ".jnlp";
		response.addHeader("Content-Disposition", "Inline; fileName=" + fileName);
		
		response.setContentType(JNLP_CONTENT_TYPE);
		//response.setCharacterEncoding("UTF-8");
		response.getWriter().print(outputJNLPString);
		return null;
	}

	private String getJNLPAsString() throws FileNotFoundException, IOException {
		String jnlpFilePath = this.getServletContext().getRealPath(JNLP_RELATIVE_PATH + jnlpFileName);
		BufferedReader jnlpReader = new BufferedReader(new FileReader(new File(jnlpFilePath)));
		String line = jnlpReader.readLine();
		String jnlpString = "";
		while (line != null) {
			jnlpString = jnlpString + line;
			line = jnlpReader.readLine();
		}
		jnlpReader.close();
		return jnlpString;
	}

	/**
	 * @param jnlpFileName
	 *            the jnlpFileName to set
	 */
	@Required
	public void setJnlpFileName(String jnlpFileName) {
		this.jnlpFileName = jnlpFileName;
	}

	/**
	 * @param modifier the modifier to set
	 */
	@Required
	public void setModifier(AuthoringJNLPModifier modifier) {
		this.modifier = modifier;
	}

}
