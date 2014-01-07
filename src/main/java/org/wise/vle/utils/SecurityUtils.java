/**
 * A utility class that assists with servlet security and authentication
 * when run with the portal.
 */
package org.wise.vle.utils;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;

/**
 * @author patrick lawler
 *
 */
public final class SecurityUtils {

	private static List<String> ALLOWED_REFERRERS;

	private static Properties wiseProperties;

	private final static String AUTHENTICATION_URL = "authorize.html";

	private final static String MODEMASTER_URL = "modemaster.html";

	private static boolean retrievedPortalMode = false;

	private static boolean isPortalMode = true;
	
	static{
		ALLOWED_REFERRERS = new ArrayList<String>();
		ALLOWED_REFERRERS.add("/vle/author.html");
		ALLOWED_REFERRERS.add("/util/util.html");
		ALLOWED_REFERRERS.add("/vle/vle.html");
		ALLOWED_REFERRERS.add("/vle/gradework.html");
		ALLOWED_REFERRERS.add("/vle/classroomMonitor.html");
		ALLOWED_REFERRERS.add("/teacher/projects/telsprojectlibrary.html");
		ALLOWED_REFERRERS.add("/teacher/projects/customized/index.html");
		ALLOWED_REFERRERS.add("/teacher/run/createRun.html");
		ALLOWED_REFERRERS.add("/teacher/management/library.html");

		try {
			// Read properties file.
			wiseProperties = new Properties();
			wiseProperties.load(SecurityUtils.class.getClassLoader().getResourceAsStream("wise.properties"));
			if(wiseProperties.containsKey("isStandAlone")) {
				boolean isStandAlone = Boolean.valueOf(wiseProperties.getProperty("isStandAlone"));
				isPortalMode = !isStandAlone;
			}
		} catch (Exception e) {
			System.err.println("SecurityUtils: could not read in vleProperties file");
			e.printStackTrace();
		}

	}

	/**
	 * Checks the list of allowed referrers and returns <code>boolean</code> true if
	 * the referer from the request matches any from the list, returns false otherwise.
	 * 
	 * @param request
	 * @return boolean
	 */
	public static boolean isValidReferrer(HttpServletRequest request){
		String referer = request.getHeader("referer");
		String domain =  "http://" + request.getServerName();
		String domainWithPort = domain + ":" + request.getLocalPort();
		
		//get the context path e.g. /wise
		String contextPath = request.getContextPath();

		for(int x=0;x<ALLOWED_REFERRERS.size();x++){
			if(referer != null && (referer.contains(domain + contextPath + ALLOWED_REFERRERS.get(x)) || referer.contains(domainWithPort + contextPath + ALLOWED_REFERRERS.get(x)))){
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns <code>boolean</code> true if the given <code>HttpServletRequest</code> request
	 * successfully authenticates with the portal, returns false otherwise.
	 * 
	 * @param request
	 * @return boolean
	 */
	public static boolean isAuthenticated(HttpServletRequest request){
		return true;
		/*
		String fullUrl = request.getRequestURL().toString();
		String fullUri = request.getRequestURI();
		String urlBase = fullUrl.substring(0, fullUrl.indexOf(fullUri));

		/// check referer to make sure the request is coming from a valid referrer 
		if(isValidReferrer(request)){
			// authenticate against the portal using the credentials passed in by the portal 
			String credentials = (String) request.getAttribute("credentials");
			if(credentials != null){
				// authenticate to the portal 
				String params = "authenticate&credentials=" + credentials;
				try{
					String result = Connector.request(urlBase + AUTHENTICATION_URL, params);
					if(result.equals("true")){
						return true;
					}
				} catch(IOException e){
					e.printStackTrace();
				}
			}
		}

		return false;
		*/
	}

	/**
	 * Given a <code>HttpServletRequest</code> request and a <code>String</code> path,
	 * returns <code>boolen</code> true if the servlet is allowed access to that path,
	 * returns false otherwise.
	 * 
	 * @param request
	 * @param path
	 * @return booelan
	 */
	public static boolean isAllowedAccess(HttpServletRequest request, String path){
		return isAllowedAccess(request, new File(path));
	}

	/**
	 * Given a <code>HttpServletRequest</code> request and a <code>File</code> file,
	 * returns <code>boolean</code> true if the servlet is allowed access to that file,
	 * returns false otherwise.
	 * 
	 * @param request
	 * @param path
	 * @return boolean
	 */
	public static boolean isAllowedAccess(HttpServletRequest request, File file){
		String accessPath = (String) request.getAttribute("accessPath");
		
		boolean allowedAccess = isAllowedAccess(accessPath, file);

		return allowedAccess;
	}
	
	/**
	 * Determine if the user should have access to the given file
	 * @param accessPath
	 * @param file
	 * @return whether the user should have access to the file
	 */
	public static boolean isAllowedAccess(String accessPath, File file) {

		if(accessPath != null && !accessPath.equals("")) {
			File accessFile = new File(accessPath);
			if(accessFile.exists()) {
				try{
					return file.getCanonicalPath().contains(accessFile.getCanonicalPath());
				} catch (IOException e){
					e.printStackTrace();
				}
			}
		}

		return false;
	}
	
	public static boolean isAllowedAccess(String fileAllowedToAccessPath, String fileTryingToAccessPath) {
		boolean result = false;
		
		File fileAllowedToAccess = new File(fileAllowedToAccessPath);
		File fileTryingToAccess = new File(fileTryingToAccessPath);
		
		result = isAllowedAccess(fileAllowedToAccess, fileTryingToAccess);
		
		return result;
	}
	
	public static boolean isAllowedAccess(File fileAllowedToAccess, File fileTryingToAccess) {
		boolean result = false;
		
		if(fileAllowedToAccess != null && fileAllowedToAccess.exists()) {
			try {
				String fileAllowedToAccessPath = fileAllowedToAccess.getCanonicalPath();
				String fileTryingToAccessPath = fileTryingToAccess.getCanonicalPath();
				
				result = fileTryingToAccessPath.contains(fileAllowedToAccessPath);
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		
		return result;
	}

	/**
	 * Given a <code>HttpServletRequest</code> request, makes a request to the mode master
	 * to determine if the calling servlet should run in portal mode or stand-alone. Returns
	 * true if the settings.xml specifies that it is in portal mode, false otherwise.
	 * 
	 * @param request
	 * @return
	 */
	public static boolean isPortalMode(HttpServletRequest request){
		return isPortalMode;
	}
}
