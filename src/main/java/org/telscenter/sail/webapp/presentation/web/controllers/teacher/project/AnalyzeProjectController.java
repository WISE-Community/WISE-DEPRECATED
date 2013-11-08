package org.telscenter.sail.webapp.presentation.web.controllers.teacher.project;

import java.io.File;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Properties;
import java.util.Vector;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.sail.webapp.dao.ObjectNotFoundException;
import net.sf.sail.webapp.domain.impl.CurnitGetCurnitUrlVisitor;

import org.apache.commons.io.FileUtils;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;
import org.telscenter.sail.webapp.domain.project.Project;
import org.telscenter.sail.webapp.presentation.util.json.JSONArray;
import org.telscenter.sail.webapp.presentation.util.json.JSONException;
import org.telscenter.sail.webapp.presentation.util.json.JSONObject;
import org.telscenter.sail.webapp.service.project.ProjectService;

public class AnalyzeProjectController extends AbstractController {

	private ProjectService projectService;
	private Properties portalProperties;

	//mapping between node id and step content as a string
	private HashMap<String, String> nodeIdToNodeContent = new HashMap<String, String>();

	//mapping between node id and node object
	private HashMap<String, JSONObject> nodeIdToNode = new HashMap<String, JSONObject>();

	//mapping between node id and step title with position number e.g. Step 1.1: What is sunlight?
	private HashMap<String, String> nodeIdToNodeTitlesWithPosition = new HashMap<String, String>();
	
	//the paths to the project file and folder
	private String projectFileLocalPath = "";
	private String projectFolderLocalPath = "";
	private String projectFileWebPath = "";
	private String projectFolderWebPath = "";
	
	//vectors to store the node ids
	private Vector<String> allNodeIds = new Vector<String>();
	private Vector<String> activeNodeIds = new Vector<String>();
	private Vector<String> inactiveNodeIds = new Vector<String>();

	/**
	 * Clear the variables
	 */
	private void clearVariables() {
		nodeIdToNodeContent = new HashMap<String, String>();
		nodeIdToNode = new HashMap<String, JSONObject>();
		nodeIdToNodeTitlesWithPosition = new HashMap<String, String>();
		
		projectFileLocalPath = "";
		projectFolderLocalPath = "";
		projectFileWebPath = "";
		projectFolderWebPath = "";
		
		allNodeIds = new Vector<String>();
		activeNodeIds = new Vector<String>();
		inactiveNodeIds = new Vector<String>();
	}
	
	/**
	 * Handle requests to this controller
	 * @see org.springframework.web.servlet.mvc.AbstractController#handleRequestInternal(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String results = "";

		//get the analyze type e.g. "findBrokenLinks" or "findUnusedAssets"
		String analyzeType = request.getParameter("analyzeType");
		
		if(analyzeType == null) {
			//there was no analyzeType passed in so we will do nothing
		} else if(analyzeType.equals("findBrokenLinks")) {
			//find the broken links in the project
			results = analyze(request, response);
		} else if(analyzeType.equals("findUnusedAssets")) {
			//find the unused assets in the project
			results = analyze(request, response);
		}
		
		try {
			//write the results to the response
			response.getWriter().write(results);
		} catch (IOException e) {
			e.printStackTrace();
		}

		clearVariables();
		
		return null;
	}

	/**
	 * Analyze the project or projects. Multiple projects can 
	 * be requested at the same time.
	 * @param request
	 * @param response
	 * @return a JSONArray string containing the results
	 */
	private String analyze(HttpServletRequest request, HttpServletResponse response) {
		//the string we will return
		String results = "";
		
		//get the analyze type e.g. "findBrokenLinks" or "findUnusedAssets"
		String analyzeType = request.getParameter("analyzeType");
				
		//get whether to return the results as html
		String html = request.getParameter("html");
		
		//the JSONArray that will contain all the project results
		JSONArray projectResultsJSONArray = new JSONArray();
		
		//get the project ids we want to find broken links for
		String projectIds = request.getParameter("projectIds");
		
		//get the project id we want to find broken links for
		String projectId = request.getParameter("projectId");

		if(projectIds != null) {
			//an array of project ids was passed in
			
			try {
				//create an array from the project ids
				JSONArray projectIdsArray = new JSONArray(projectIds);

				if(projectIdsArray != null) {
					//loop through all the project ids
					for(int x=0; x<projectIdsArray.length(); x++) {
						//get a project id
						String projectIdStr = projectIdsArray.getString(x);
						Long projectIdLong = Long.parseLong(projectIdStr);

						//will hold the results for the current project
						JSONObject projectResults = null;
						
						if(analyzeType == null) {
							
						} else if(analyzeType.equals("findBrokenLinks")) {
							//find the broken links for the project id
							projectResults = findBrokenLinksForProject(projectIdLong);
						} else if(analyzeType.equals("findUnusedAssets")) {
							//find the unused assets for the project id
							projectResults = findUnusedAssetsForProject(projectIdLong);
						}
						
						if(projectResults != null) {
							//put the project results into the array
							projectResultsJSONArray.put(projectResults);							
						}
					}
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		} else if(projectId != null) {
			//a single project id was passed in
			
			//will hold the results for the project
			JSONObject projectResults = null;
			
			if(analyzeType == null) {
				
			} else if(analyzeType.equals("findBrokenLinks")) {
				//find the broken links for the project id
				projectResults = findBrokenLinksForProject(Long.parseLong(projectId));
			} else if(analyzeType.equals("findUnusedAssets")) {
				//find the unused assets for the project id
				projectResults = findUnusedAssetsForProject(Long.parseLong(projectId));
			}
			
			if(projectResults != null) {
				//put the project results into the array
				projectResultsJSONArray.put(projectResults);				
			}
		}
		
		try {
			if(html != null && html.equals("true")) {
				//we will return the html representation of the results
				
				if(analyzeType == null) {
					
				} else if(analyzeType.equals("findBrokenLinks")) {
					//get the html representation of the JSONArray
					results = getFindBrokenLinksHtmlView(projectResultsJSONArray);
				} else if(analyzeType.equals("findUnusedAssets")) {
					//get the html representation of the JSONArray
					results = getFindUnusedAssetsHtmlView(projectResultsJSONArray);
				}
			} else {
				//get the string representation of the JSONArray
				results = projectResultsJSONArray.toString(3);				
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		return results;
	}

	/**
	 * Find the broken links for the project
	 * @param projectId the project id
	 * @return a JSONObject that contains the title, project id, and an
	 * array of active steps that have broken links and an array of
	 * inactive steps that have broken links
	 * 
	 * e.g.
	 * 
	 * {
	 *    "projectId": 684,
	 *    "projectName": "My Test Project2",
	 *    "activeStepResults": [
	 *       {
	 *          "brokenLinks": ["assets/sun.jpg"],
	 *          "stepTitle": "Step 1.1: What is sunlight? (HtmlNode)"
	 *       }
	 *    ],
	 *    "inactiveStepResults": [
	 *       {
	 *          "brokenLinks": [
	 *             "http://www.fakewebsite.com/hello123.jpg",
	 *             "http://www.fakewebsite.com/v2/wp-content/uploads/2009/01/spongebob.jpg"
	 *          ],
	 *          "stepTitle": "Inactive Step: How do plants get energy? (HtmlNode)"
	 *       }
	 *    ]
	 * }
	 */
	private JSONObject findBrokenLinksForProject(Long projectId) {
		//the object that will contain all the results
		JSONObject resultsJSON = new JSONObject();
		
		/*
		 * parse the project to gather all the active steps, 
		 * inactive steps, and step content strings
		 */
		parseProject(projectId);
		
		try {
			//get the project
			Project project = projectService.getById(projectId);

			//get the project name
			String projectName = project.getName();
			
			//put the project name and id into the results
			resultsJSON.put("projectName", projectName);
			resultsJSON.put("projectId", projectId);
			
			JSONArray activeStepResults = new JSONArray();

			//analyze the active steps
			if(activeNodeIds != null) {
				for(int x=0; x<activeNodeIds.size(); x++) {
					String nodeId = activeNodeIds.get(x);
					
					//get the step content as a string
					String nodeContent = nodeIdToNodeContent.get(nodeId);
					
					//get the step title
					String title = nodeIdToNodeTitlesWithPosition.get(nodeId);
					
					//find any broken links in the step
					JSONArray brokenLinksForStep = findBrokenLinksForStep(nodeContent);
					
					if(brokenLinksForStep != null && brokenLinksForStep.length() != 0) {
						/*
						 * there was at least one broken link so we will create an object
						 * to contain the information for this step and the links that
						 * were broken
						 */
						JSONObject stepResult = new JSONObject();
						stepResult.put("stepTitle", title);
						stepResult.put("brokenLinks", brokenLinksForStep);
						
						//add the object to our results array
						activeStepResults.put(stepResult);
					}
				}
			}
			
			JSONArray inactiveStepResults = new JSONArray();

			//analyze the inactive steps
			if(inactiveNodeIds != null) {
				for(int x=0; x<inactiveNodeIds.size(); x++) {
					String nodeId = inactiveNodeIds.get(x);
					
					//get the step content as a string
					String nodeContent = nodeIdToNodeContent.get(nodeId);
					
					//get the step title
					String title = nodeIdToNodeTitlesWithPosition.get(nodeId);
					
					//find any broken links in the step
					JSONArray brokenLinksForStep = findBrokenLinksForStep(nodeContent);
					
					if(brokenLinksForStep != null && brokenLinksForStep.length() != 0) {
						/*
						 * there was at least one broken link so we will create an object
						 * to contain the information for this step and the links that
						 * were broken
						 */
						JSONObject stepResult = new JSONObject();
						stepResult.put("stepTitle", title);
						stepResult.put("brokenLinks", brokenLinksForStep);
						
						//add the object to our results array
						inactiveStepResults.put(stepResult);
					}
				}
			}
			
			//put the step results into the results
			resultsJSON.put("activeStepResults", activeStepResults);
			resultsJSON.put("inactiveStepResults", inactiveStepResults);
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		} catch (JSONException e) {
			e.printStackTrace();
		}

		return resultsJSON;
	}
	
	
	/**
	 * Find the unused assets for a project
	 * @param projectId the project id
	 * @return a JSONObject containing
	 * projectName
	 * projectId
	 * assets - an array containing an object for each asset file in the project
	 * each object in the assets array contains the asset file name and
	 * activeStepsUsedIn and inactiveStepsUsedIn arrays which contain step titles
	 * 
	 * e.g.
	 * 
	 * {
	 *    "projectId": 684,
	 *    "projectName": "My Test Project2",
	 *    "assets": [
	 *       {
	 *          "activeStepsUsedIn": [
	 *             "Step 1.26: 1: What do engineers do? (HtmlNode)",
	 *             "Step 1.27: 2: How fast is fast? (HtmlNode)"
	 *          ],
	 *          "assetFileName": "02AcuraTLHSF.3.mov",
	 *          "inactiveStepsUsedIn": []
	 *       },
	 *       {
	 *          "activeStepsUsedIn": [],
	 *          "assetFileName": "av-3.gif",
	 *          "inactiveStepsUsedIn": ["Inactive Step: html1 1 (HtmlNode)"]
 	 *      }
	 *    ]
	 * }
	 */
	private JSONObject findUnusedAssetsForProject(Long projectId) {
		
		//the object that will contain all the results
		JSONObject resultsJSON = new JSONObject();
		
		/*
		 * parse the project to gather all the active steps, 
		 * inactive steps, and step content strings
		 */
		parseProject(projectId);
		
		try {
			//get the project
			Project project = projectService.getById(projectId);

			//get the project name
			String projectName = project.getName();
			
			//put the project name and id into the results
			resultsJSON.put("projectName", projectName);
			resultsJSON.put("projectId", projectId);
			
			JSONArray assets = new JSONArray();
			
			//get the asset folder
			File assetFolder = new File(projectFolderLocalPath + "/assets");
			
			if(assetFolder.exists() && assetFolder.isDirectory()) {
				File[] assetFiles = assetFolder.listFiles();
				
				//loop through all the asset files
				for(int x=0; x<assetFiles.length; x++) {
					//get an asset file
					File assetFile = assetFiles[x];
					
					//get the asset file name
					String assetFileName = assetFile.getName();
					
					//create the object to hold the results for this asset
					JSONObject assetFileResult = new JSONObject();
					
					//add the asset file name
					assetFileResult.put("assetFileName", assetFileName);
					
					JSONArray activeStepsUsedIn = new JSONArray();
					
					/*
					 * loop through all the active node ids to see if this
					 * asset is used in any of them
					 */
					for(int y=0; y<activeNodeIds.size(); y++) {
						//get a node id
						String activeNodeId = activeNodeIds.get(y);
						
						//get the content for the step as a string
						String nodeContent = nodeIdToNodeContent.get(activeNodeId);
						
						//check if the file name exists in the content
						if(nodeContent != null && nodeContent.contains(assetFileName)) {
							//the file name exists in the content
							
							//get the step title
							String title = nodeIdToNodeTitlesWithPosition.get(activeNodeId);
							
							//add the step title to the array
							activeStepsUsedIn.put(title);
						}
					}
					
					JSONArray inactiveStepsUsedIn = new JSONArray();
					
					/*
					 * loop through all the inactive node ids to see if this
					 * asset is used in any of them
					 */
					for(int z=0; z<inactiveNodeIds.size(); z++) {
						//get a node id
						String inactiveNodeId = inactiveNodeIds.get(z);
						
						//get the content for the step as a string
						String nodeContent = nodeIdToNodeContent.get(inactiveNodeId);
						
						//check if the file name exists in the content
						if(nodeContent != null && nodeContent.contains(assetFileName)) {
							//the file name exists in the content
							
							//get the step title
							String title = nodeIdToNodeTitlesWithPosition.get(inactiveNodeId);
							
							//add teh step title to the array
							inactiveStepsUsedIn.put(title);
						}
					}
					
					//add the arrays to the asset file result
					assetFileResult.put("activeStepsUsedIn", activeStepsUsedIn);
					assetFileResult.put("inactiveStepsUsedIn", inactiveStepsUsedIn);
					
					//add the asset file result to the assets
					assets.put(assetFileResult);
				}
			}
			
			//add the assets to the results
			resultsJSON.put("assets", assets);
		} catch (JSONException e) {
			e.printStackTrace();
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
		
		return resultsJSON;
	}
	
	/**
	 * Parse the project to populate our hashmaps that contain mappings
	 * from node id to node content and node id to node titles
	 * @param projectJSON the project JSON
	 */
	private void parseProject(Long projectId) {
		try {
			//get the project
			Project project = projectService.getById(projectId);

			/*
			 * obtain the local path to the project file on the server 
			 * e.g. /Users/geoffreykwan/dev/apache-tomcat-7.0.27/webapps/curriculum/667/wise4.project.json  
			 */
			projectFileLocalPath = getProjectFileLocalPath(project);
			
			/*
			 * obtain the local path to the project folder on the server 
			 * e.g. /Users/geoffreykwan/dev/apache-tomcat-7.0.27/webapps/curriculum/667 
			 */
			projectFolderLocalPath = getProjectFolderLocalPath(project);
			
			/*
			 * obtain the web path to the project file on the server 
			 * e.g. http://wise4.berkeley.edu/curriculum/667/wise4.project.json  
			 */
			projectFileWebPath = getProjectFileWebPath(project);
			
			/*
			 * obtain the web path to the project folder on the server 
			 * e.g. http://wise4.berkeley.edu/curriculum/667  
			 */
			projectFolderWebPath = getProjectFolderWebPath(project);
			
			//get the project file
			File projectFile = new File(projectFileLocalPath);
			
			//get the contents of the project file
			String projectFileString = FileUtils.readFileToString(projectFile);

			//get the JSONObject representation of the project 
			JSONObject projectJSON = new JSONObject(projectFileString);

			//get the nodes (aka steps) in the project
			JSONArray nodes = projectJSON.getJSONArray("nodes");

			//loop through all the nodes (aka steps) in the project
			for(int x=0; x<nodes.length(); x++) {
				//get a node
				JSONObject node = nodes.getJSONObject(x);
				if(node != null) {
					//get the node id
					String nodeId = node.getString("identifier");
					
					//add the node id to the all node ids vector
					allNodeIds.add(nodeId);
					
					//get the step file name
					String ref = node.getString("ref");
					
					//get a handle to the file
					File file = new File(projectFolderLocalPath + "/" + ref);
					
					try {
						//get the contents of the file
						String fileContent = FileUtils.readFileToString(file);
						
						//get the node type
						String nodeType = node.getString("type");
						
						if(nodeType != null && nodeType.equals("HtmlNode")) {
							//this is an html step so we need to get the html file
							
							//create a JSONObject from the content
							JSONObject nodeJSON = new JSONObject(fileContent);
							
							//find the name of the html file
							String htmlSrc = nodeJSON.getString("src");
							
							//create the local path to the html file
							String htmlSrcPath = projectFolderLocalPath + "/" + htmlSrc;
							
							//create a handle to the html file
							File htmlSrcFile = new File(htmlSrcPath);
							
							try {
								//get the contents of the html file
								fileContent = FileUtils.readFileToString(htmlSrcFile);
							} catch (IOException e) {
								e.printStackTrace();
							}
						}
						
						//put the contents into our hashmap
						nodeIdToNodeContent.put(nodeId, fileContent);
					} catch (IOException e) {
						e.printStackTrace();
					}
					
					//put the node into our hashmap
					nodeIdToNode.put(nodeId, node);
				}
			}

			//get the sequences (aka activites) in the project
			JSONArray sequences = projectJSON.getJSONArray("sequences");

			//loop through all the sequences (aka activities) in the project
			for(int y=0; y<sequences.length(); y++) {
				//get a sequence
				JSONObject sequence = sequences.getJSONObject(y);

				if(sequence != null) {
					//get the seuqnce id
					String sequenceId = sequence.getString("identifier");
					
					//put the sequence into our hashmap (note that sequences are sometimes also referred to as nodes)
					nodeIdToNode.put(sequenceId, sequence);
				}
			}
			
			/*
			 * traverse through the project to find the active steps
			 * and also to obtain the step numbers and titles
			 */
			traverseProject(projectJSON);

			//find the inactive node ids
			for(int x=0; x<allNodeIds.size(); x++) {
				//get a node id
				String nodeId = allNodeIds.get(x);
				
				//check if the node id is in the active node ids vector
				if(!activeNodeIds.contains(nodeId)) {
					//node id is not in the active vector so it must be inactive
					inactiveNodeIds.add(nodeId);
					
					//get the node
					JSONObject node = nodeIdToNode.get(nodeId);
					
					//get the step title
					String title = node.getString("title");

					//get the step type
					String nodeType = node.getString("type");
					
					//get the step title e.g. Inactive Step: What is oxygen? (HtmlNode)
					title = "Inactive Step: " + title + " (" + nodeType + ")";
					
					//add the mapping of node id to node title
					nodeIdToNodeTitlesWithPosition.put(nodeId, title);
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} catch (ObjectNotFoundException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Traverse through the project to find the active steps and step numbers
	 * @param projectJSON the project JSON
	 */
	private void traverseProject(JSONObject projectJSON) {
		try {
			//get the start point of the project
			String startPoint = projectJSON.getString("startPoint");

			//recursively loop through the project
			traverseProjectHelper(startPoint, "");
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}

	/**
	 * Recursively loops through the project in sequential order of the steps
	 * in the project to find the active steps and step numbers
	 * @param nodeId the current node id we are on
	 * @param positionSoFar the current position so far
	 * e.g. if we are on activity 2, the position so far would be 2
	 */
	private void traverseProjectHelper(String nodeId, String positionSoFar) {
		//get the current node we are on
		JSONObject node = nodeIdToNode.get(nodeId);
		
		if(node != null) {
			try {
				if(node.has("type")) {
					//get the node type
					String type = node.getString("type");

					if(type != null && type.equals("sequence")) {
						//node is an activity

						try {
							if(node != null) {
								//get the activity title
								String title = node.getString("title");
								
								//get the steps in the activity
								JSONArray refs = node.getJSONArray("refs");
								
								//create the activity title with activity number e.g. Activity 1: What is light?
								title = "Activity " + positionSoFar + ": " + title;

								//add the mapping of node id to node title
								nodeIdToNodeTitlesWithPosition.put(nodeId, title);
								
								//loop through all the child nodes
								for(int x=0; x<refs.length(); x++) {
									//get the node id of a child node
									String ref = refs.getString(x);
									
									//get the child node
									JSONObject childNode = nodeIdToNode.get(ref);
									
									//get the child node id
									String childNodeId = childNode.getString("identifier");
									
									String newPositonSoFar = "";
									
									if(positionSoFar == null || positionSoFar.equals("")) {
										//position so far is empty so we will just append the number
										newPositonSoFar = positionSoFar + (x + 1);
									} else {
										//position so far is not empty so we will append . and then the number
										newPositonSoFar = positionSoFar + "." + (x + 1);
									}

									//recursively call this function to handle the child node
									traverseProjectHelper(childNodeId, newPositonSoFar);
								}
							}
						} catch (JSONException e) {
							e.printStackTrace();
						}			
					} else {
						//node is a step

						try {
							//get the step title
							String title = node.getString("title");

							//get the step type
							String nodeType = node.getString("type");
							
							//get the step title with step number e.g. Step 1.2: What is oxygen? (HtmlNode)
							title = "Step " + positionSoFar + ": " + title + " (" + nodeType + ")";
							
							//add the mapping of node id to node title
							nodeIdToNodeTitlesWithPosition.put(nodeId, title);
							
							//add this node id to the active node ids
							activeNodeIds.add(nodeId);
						} catch (JSONException e) {
							e.printStackTrace();
						}
					}
				}
			} catch (JSONException e1) {
				e1.printStackTrace();
			}
		}
	}
	
	/**
	 * Find broken links in the step content
	 * @param nodeContent the step content as a JSONObject
	 * @return a JSONArray of broken link strings
	 */
	private JSONArray findBrokenLinksForStep(String nodeContentString) {
		//the array that will hold all the broken links if any
		JSONArray brokenLinks = new JSONArray();
		
		if(nodeContentString != null) {
			/*
			 * create the regex to match strings like these below
			 * 
			 * src="assets/sunlight.jpg"
			 * src=\"assets/sunlight.jpg\"
			 * href="assets/sunlight.jpg"
			 * href=\"assets/sunlight.jpg\"
			 * src="http://www.somewebsite.com/sunlight.jpg"
			 * src=\"http://www.somewebsite.com/sunlight.jpg\"
			 * href="http://www.somewebsite.com/sunlight.jpg"
			 * href=\"http://www.somewebsite.com/sunlight.jpg\"
			 * 
			 */
			String regexString = "(src|href)=\\\\?\"(.*?)\\\\?\"";
			
			//compile the regex string
			Pattern pattern = Pattern.compile(regexString);
			
			//run the regex on the step content
			Matcher matcher = pattern.matcher(nodeContentString);
			
			//loop through the content to find matches
			while(matcher.find()) {
				//used for project assets to remember the relative path reference e.g. assets/sunlight.jpg
				String originalAssetPath = null;
				
				//will contain the path to the asset that is referenced in the step
				String assetPath = null;
				
				/*
				 * loop through all the groups that were captured
				 * "(1)=\\\\?\"(2)\\\\?\""
				 * 
				 * group 0 is the whole match
				 * e.g. src="assets/sunlight.jpg"
				 * 
				 * group 1 is the src or href
				 * e.g. src
				 * 
				 * group 2 is the contents inside the quotes
				 * e.g. assets/sunlight.jpg
				 * 
				 * we could just grab group 2 because that is what we actually care about
				 * but I've looped through all the groups for the sake of easier debugging.
				 * since group 2 is the last group, we will end up with group 2 in our assetPath.
				 */
				for(int x=0; x<=matcher.groupCount(); x++) {
					//get a group
					String group = matcher.group(x);

					if(group != null) {
						//get the asset path
						originalAssetPath = group;
					}
				}
				
				if(originalAssetPath == null) {
					//nothing was captured in the regular expression
				} else if(originalAssetPath.startsWith("http")) {
					//this is a reference to an asset on the web
					assetPath = originalAssetPath;
				} else {
					/*
					 * this is a reference to something in the project folder so
					 * we will prepend the project folder path
					 * 
					 * before
					 * assets/sunlight.jpg
					 * 
					 * after
					 * http://wise4.berkeley.edu/curriculum/123/assets/sunlight.jpg
					 */
					assetPath = projectFolderWebPath + "/" + originalAssetPath;
				}
				
				//the default initialization value for the response code
				int responseCode = -1;

				try {
					//try to access the path and get the response code
					responseCode = getResponseCode(assetPath);

					if(responseCode == 301) {
						/*
						 * path responded with a redirect so we will retrieve 
						 * the redirect path and try accessing that path
						 */
						String redirectLocation = getRedirectLocation(assetPath);
						
						//get the response code for the redirect path
						responseCode = getResponseCode(redirectLocation);
					} else if(responseCode == 505) {
						/*
						 * sometimes a 505 is caused by a space in the url so we will
						 * try to make the request with " " replaced with "%20" because
						 * the browser usually performs this replacement automatically
						 * when making requests unlike the Java HttpURLConnection which
						 * does not do this automatically.
						 */
						assetPath = assetPath.replaceAll(" " , "%20");
						
						//get the response code for the redirect path
						responseCode = getResponseCode(assetPath);
					}
				} catch (MalformedURLException e) {
					e.printStackTrace();
				} catch (IOException e) {
					e.printStackTrace();
				} catch (Exception e) {
					e.printStackTrace();
				}

				if(responseCode != 200) {
					/*
					 * the response code is not 200 so we were unable to retrieve the path.
					 * we will add it to our array of broken links
					 */
					brokenLinks.put(originalAssetPath);
				}
			}
		}
		
		return brokenLinks;
	}
	
	/**
	 * Get the response code for a URL
	 * @param urlString the URL string
	 * @return the response code as an int
	 * @throws MalformedURLException
	 * @throws IOException
	 */
	private static int getResponseCode(String urlString) throws MalformedURLException, IOException {
		//create the URL object
		URL url = new URL(urlString);
		
		//create a connection to the url
		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setRequestMethod("GET");
		conn.connect();
		
		//get the response code
		int responseCode = conn.getResponseCode();
		
		return responseCode;
	}
	
	/**
	 * Get the redirect location for the URL
	 * @param urlString the url as a string
	 * @return the redirect location
	 * @throws MalformedURLException
	 * @throws IOException
	 */
	private static String getRedirectLocation(String urlString) throws MalformedURLException, IOException {
		//create the URL object
		URL url = new URL(urlString);
		
		//create a connection to the url
		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setRequestMethod("GET");
		conn.connect();
		
		//get the redirect location
		String redirectLocation = conn.getHeaderField("Location");
		
		return redirectLocation;
	}

	/**
	 * Get the full project file path
	 * @param project the project object
	 * @return the full project file path
	 * e.g.
	 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667/wise4.project.json
	 */
	private String getProjectFileLocalPath(Project project) {
		String curriculumBaseDir = portalProperties.getProperty("curriculum_base_dir");
		String projectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
		String projectFilePath = curriculumBaseDir + projectUrl;
		return projectFilePath;
	}
	
	/**
	 * Get the full project file path
	 * @param project the project object
	 * @return the full project file path
	 * e.g.
	 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667/wise4.project.json
	 */
	private String getProjectFileWebPath(Project project) {
		String curriculumBaseWebDir = portalProperties.getProperty("curriculum_base_www");
		String projectUrl = (String) project.getCurnit().accept(new CurnitGetCurnitUrlVisitor());
		String projectFilePath = curriculumBaseWebDir + projectUrl;
		return projectFilePath;
	}

	/**
	 * Get the full project folder path given the project object
	 * @param project the project object
	 * @return the full project folder path
	 * e.g.
	 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667
	 */
	private String getProjectFolderLocalPath(Project project) {
		String projectFilePath = getProjectFileLocalPath(project);
		String projectFolderPath = projectFilePath.substring(0, projectFilePath.lastIndexOf("/"));
		return projectFolderPath;
	}
	
	/**
	 * Get the full project folder path given the project object
	 * @param project the project object
	 * @return the full project folder path
	 * e.g.
	 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667
	 */
	private String getProjectFolderWebPath(Project project) {
		String projectFilePath = getProjectFileWebPath(project);
		String projectFolderPath = projectFilePath.substring(0, projectFilePath.lastIndexOf("/"));
		return projectFolderPath;
	}
	
	/**
	 * Get the html view for the find broken links results
	 * @param projectResults a JSONArray of project results
	 * @return a string containing the html view of the project results
	 */
	private String getFindBrokenLinksHtmlView(JSONArray projectResults) {
		//the stringbuffer to gather the html
		StringBuffer html = new StringBuffer();
		
		//add the html tags
		html.append("<html><head></head><body>");
		
		//loop through each project result
		for(int x=0; x<projectResults.length(); x++) {
			try {
				//get a project result
				JSONObject projectResult = projectResults.getJSONObject(x);
				
				if(x != 0) {
					//add a horizontal line if this is not the first project result
					html.append("<hr>");
				}
				
				//get the project name and id
				String projectName = projectResult.getString("projectName");
				long projectId = projectResult.getLong("projectId");
				
				//display the project name and id
				html.append("Project Name: " + projectName + "<br>");
				html.append("Project Id: " + projectId + "<br><br>");
				
				//get the steps in the project that have broken links
				JSONArray activeStepsResults = projectResult.getJSONArray("activeStepResults");
				
				if(activeStepsResults.length() != 0) {
					//loop through all the steps that have broken links
					for(int y=0; y<activeStepsResults.length(); y++) {
						//get a step
						JSONObject step = activeStepsResults.getJSONObject(y);
						
						//add the step title
						String stepTitle = step.getString("stepTitle");
						html.append(stepTitle + "<br>");
						
						//get the broken links
						JSONArray brokenLinks = step.getJSONArray("brokenLinks");
						
						//loop through all the broken links
						for(int z=0; z<brokenLinks.length(); z++) {
							//add the broken link
							String brokenLink = brokenLinks.getString(z);
							
							//make a link out of the url
							brokenLink = makeLinkFromUrl(brokenLink, brokenLink);
							
							html.append(brokenLink + "<br>");
						}
						
						html.append("<br>");
					}
				}
				
				//get the steps in the project that have broken links
				JSONArray inactiveStepResults = projectResult.getJSONArray("inactiveStepResults");
				
				if(inactiveStepResults.length() != 0) {
					//loop through all the steps that have broken links
					for(int y=0; y<inactiveStepResults.length(); y++) {
						//get a step
						JSONObject step = inactiveStepResults.getJSONObject(y);
						
						//add the step title
						String stepTitle = step.getString("stepTitle");
						html.append(stepTitle + "<br>");
						
						//get the broken links
						JSONArray brokenLinks = step.getJSONArray("brokenLinks");
						
						//loop through all the broken links
						for(int z=0; z<brokenLinks.length(); z++) {
							//add the broken link
							String brokenLink = brokenLinks.getString(z);

							//make a link out of the url
							brokenLink = makeLinkFromUrl(brokenLink, brokenLink);
							
							html.append(brokenLink + "<br>");
						}
						
						html.append("<br>");
					}
				}
				
				if(activeStepsResults.length() == 0 && inactiveStepResults.length() == 0) {
					//there were no broken links
					html.append("There are no broken links");
				}
				
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		//close the html tags
		html.append("</body></html>");
		
		return html.toString();
	}
	
	/**
	 * Get the html view for the find unused assets results
	 * @param projectResults a JSONArray of project results
	 * @return a string containing the html view of the project results
	 */
	private String getFindUnusedAssetsHtmlView(JSONArray projectResults) {
		//the stringbuffer to gather the html
		StringBuffer html = new StringBuffer();
		
		//add the html tags
		html.append("<html><head></head><body>");
		
		//loop through each project result
		for(int x=0; x<projectResults.length(); x++) {
			try {
				//get a project result
				JSONObject projectResult = projectResults.getJSONObject(x);
				
				if(x != 0) {
					//add a horizontal line if this is not the first project result
					html.append("<hr>");
				}
				
				//get the project name and id
				String projectName = projectResult.getString("projectName");
				long projectId = projectResult.getLong("projectId");
				
				//boolean value to check if all assets are being used
				boolean allAssetsUsed = true;
				
				//display the project name and id
				html.append("Project Name: " + projectName + "<br>");
				html.append("Project Id: " + projectId + "<br><br>");
				
				//get the assets array for the project
				JSONArray assets = projectResult.getJSONArray("assets");
				
				//loop through all the assets
				for(int y=0; y<assets.length(); y++) {
					//get an assets object
					JSONObject asset = assets.getJSONObject(y);
					
					//get the asset file name
					String assetFileName = asset.getString("assetFileName");
					
					//get the array of active steps that this asset is used in
					JSONArray activeStepsUsedIn = asset.getJSONArray("activeStepsUsedIn");
					
					//get the array of inactive steps that this asset is used in
					JSONArray inactiveStepsUsedIn = asset.getJSONArray("inactiveStepsUsedIn");
					
					if(activeStepsUsedIn.length() > 0) {
						//this asset was used in an active step
						html.append("<font color='green'>" + assetFileName + "</font>");
					} else if(inactiveStepsUsedIn.length() > 0) {
						//this asset was used in an inactive step and not any active steps
						html.append("<font color='blue'>" + assetFileName + "</font>");
					} else {
						//this asset was not used in any step
						html.append("<font color='red'>" + assetFileName + "</font>");
					}
					
					//display a link to view the asset
					String link = makeLinkFromUrl("assets/" + assetFileName, "view asset");
					html.append(" (" + link + ")");
					html.append("<br>");
					
					//loop through all the active steps this asset was used in
					for(int a=0; a<activeStepsUsedIn.length(); a++) {
						//display the step name
						String activeStepUsedIn = activeStepsUsedIn.getString(a);
						html.append(activeStepUsedIn + "<br>");
					}
					
					//loop through all the inactive steps this asset was used in
					for(int a=0; a<inactiveStepsUsedIn.length(); a++) {
						//display the step name
						String inactiveStepUsedIn = inactiveStepsUsedIn.getString(a);
						html.append(inactiveStepUsedIn + "<br>");
					}
					
					if(activeStepsUsedIn.length() == 0 && inactiveStepsUsedIn.length() == 0) {
						//this asset was not used in any steps
						html.append("Not Used<br>");
						
						//this asset was not used so there is at least one asset that is not used
						allAssetsUsed = false;
					}
					
					html.append("<br>");
				}
				
				if(allAssetsUsed) {
					//all the assets are being used
					html.append("All Assets Used<br>");
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		//close the html tags
		html.append("</body></html>");
		
		return html.toString();
	}
	
	/**
	 * Make an <a href=''></a> link given a url
	 * @param url the url string
	 * @param text the text to show in the link
	 * @return a string containing the <a href=''></a> html
	 */
	private String makeLinkFromUrl(String url, String text) {
		//the result link
		String link = "";
		
		//the href value
		String href = "";
		
		if(url.startsWith("assets")) {
			//the url is a project asset so we will prepend the project folder web path
			href = projectFolderWebPath + "/" + url;
		} else {
			//the url is an absolute web link so we do not need to modify it
			href = url;
		}
		
		//create the link
		link = "<a href='" + href + "' target='_blank'>" + text + "</a>";
		
		return link;
	}

	/**
	 * 
	 * @return
	 */
	public ProjectService getProjectService() {
		return projectService;
	}

	/**
	 * 
	 * @param projectService
	 */
	public void setProjectService(ProjectService projectService) {
		this.projectService = projectService;
	}

	/**
	 * @param portalProperties the portalProperties to set
	 */
	public void setPortalProperties(Properties portalProperties) {
		this.portalProperties = portalProperties;
	}
}
