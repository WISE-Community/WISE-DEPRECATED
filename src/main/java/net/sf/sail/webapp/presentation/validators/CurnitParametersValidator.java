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
package net.sf.sail.webapp.presentation.validators;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.regex.Pattern;

import net.sf.sail.webapp.domain.impl.CurnitParameters;

import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.telscenter.sail.webapp.domain.impl.CreateUrlModuleParameters;

/**
 * Validator for add Curnit page
 *
 * @author Hiroki Terashima
 * @version $Id$
 */
public class CurnitParametersValidator implements Validator {

	private static final Pattern LEGAL_URL_PATTERN = Pattern
	.compile("");

	/**
	 * @see org.springframework.validation.Validator#supports(java.lang.Class)
	 */
	@SuppressWarnings("unchecked")
	public boolean supports(Class clazz) {
		return CurnitParameters.class.isAssignableFrom(clazz);
	}

	/**
	 * @see org.springframework.validation.Validator#validate(java.lang.Object, org.springframework.validation.Errors)
	 */
	public void validate(Object curnitParametersIn, Errors errors) {

        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "name", "error.curnitname-not-specified");                
        ValidationUtils.rejectIfEmptyOrWhitespace(errors, "url", "error.curniturl-not-specified");
        if (errors.getErrorCount() > 0){
        	return;
        }
       
        URL url = null;
        try{     
        	// check if url or name are either null
        	CurnitParameters curnParams = (CurnitParameters) curnitParametersIn; 
        	if (curnParams.getName() == null){
        		errors.rejectValue("name", "error.curnitname-null");
        	} 
        	if (curnParams.getUrl() == null){
        		errors.rejectValue("url", "error.curniturl-null");
        	}
        	if (errors.getErrorCount() > 0){
        		return;
        	}
        	
        	// if we're adding url module parameters, do not check for
        	// valid url since the url is relative.
        	if (curnParams instanceof CreateUrlModuleParameters) {
        		return;
        	}
        	
        	String urlString = new String(((CurnitParameters) curnitParametersIn).getUrl());
        	// add http to the provided url, if it is missing a protocol
        	if (!urlString.toString().startsWith("http") &&
        			!urlString.toString().startsWith("https") &&
        			!urlString.toString().startsWith("ftp")){
        		errors.rejectValue("url", "error.curniturl-no-protocol");
        		return;
        	} else{
        		url = new URL(((CurnitParameters) curnitParametersIn).getUrl());
        	}
            // either the url is of the wrong format or it is pointing to a dead destination
        	if (url == null || url.getContent() == null){
        		errors.rejectValue("url", "error.curniturl-not-valid");
        	}   
        } catch (UnknownHostException e){
        	errors.rejectValue("url", "error.curniturl-not-valid");
        }catch (MalformedURLException e) {
        	errors.rejectValue("url", "error.curniturl-not-valid");        	
        }catch (IOException e){
        	throw new RuntimeException(e);
        }
	}

}
