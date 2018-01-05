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
package org.wise.portal.presentation.web.controllers.teacher.project;

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

import org.apache.commons.io.FileUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.project.Project;
import org.wise.portal.service.project.ProjectService;

@Controller
public class AnalyzeProjectController {

  @Autowired
  private ProjectService projectService;

  @Autowired
  private Properties wiseProperties;

  private HashMap<String, String> nodeIdToNodeContent = new HashMap<String, String>();

  private HashMap<String, JSONObject> nodeIdToNode = new HashMap<String, JSONObject>();

  private HashMap<String, String> nodeIdToNodeTitlesWithPosition = new HashMap<String, String>();

  private String projectFileLocalPath = "";
  private String projectFolderLocalPath = "";
  private String projectFileWebPath = "";
  private String projectFolderWebPath = "";

  private Vector<String> allNodeIds = new Vector<String>();
  private Vector<String> activeNodeIds = new Vector<String>();
  private Vector<String> inactiveNodeIds = new Vector<String>();

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

  @RequestMapping("/teacher/projects/analyzeproject.html")
  protected ModelAndView handleRequestInternal(HttpServletRequest request,
      HttpServletResponse response) throws Exception {
    String results = "";

    //get the analyze type e.g. "findBrokenLinks" or "findUnusedAssets"
    String analyzeType = request.getParameter("analyzeType");

    if (analyzeType == null) {
      //there was no analyzeType passed in so we will do nothing
    } else if (analyzeType.equals("findBrokenLinks")) {
      //find the broken links in the project
      results = analyze(request, response);
    } else if (analyzeType.equals("findUnusedAssets")) {
      //find the unused assets in the project
      results = analyze(request, response);
    }

    try {
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
    String results = "";

    //get the analyze type e.g. "findBrokenLinks" or "findUnusedAssets"
    String analyzeType = request.getParameter("analyzeType");

    //get whether to return the results as html
    String html = request.getParameter("html");

    JSONArray projectResultsJSONArray = new JSONArray();
    String projectIds = request.getParameter("projectIds");
    String projectId = request.getParameter("projectId");

    if (projectIds != null) {
      try {
        JSONArray projectIdsArray = new JSONArray(projectIds);
        if (projectIdsArray != null) {
          for (int x = 0; x < projectIdsArray.length(); x++) {
            String projectIdStr = projectIdsArray.getString(x);
            Long projectIdLong = Long.parseLong(projectIdStr);
            JSONObject projectResults = null;

            if (analyzeType == null) {

            } else if (analyzeType.equals("findBrokenLinks")) {
              projectResults = findBrokenLinksForProject(projectIdLong);
            } else if (analyzeType.equals("findUnusedAssets")) {
              projectResults = findUnusedAssetsForProject(projectIdLong);
            }

            if (projectResults != null) {
              projectResultsJSONArray.put(projectResults);
            }
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    } else if (projectId != null) {
      JSONObject projectResults = null;

      if (analyzeType == null) {

      } else if (analyzeType.equals("findBrokenLinks")) {
        //find the broken links for the project id
        projectResults = findBrokenLinksForProject(Long.parseLong(projectId));
      } else if (analyzeType.equals("findUnusedAssets")) {
        //find the unused assets for the project id
        projectResults = findUnusedAssetsForProject(Long.parseLong(projectId));
      }

      if (projectResults != null) {
        //put the project results into the array
        projectResultsJSONArray.put(projectResults);
      }
    }

    try {
      if (html != null && html.equals("true")) {
        //we will return the html representation of the results

        if (analyzeType == null) {

        } else if (analyzeType.equals("findBrokenLinks")) {
          //get the html representation of the JSONArray
          results = getFindBrokenLinksHtmlView(projectResultsJSONArray);
        } else if (analyzeType.equals("findUnusedAssets")) {
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
    JSONObject resultsJSON = new JSONObject();

    /*
     * parse the project to gather all the active steps,
     * inactive steps, and step content strings
     */
    parseProject(projectId);

    try {
      Project project = projectService.getById(projectId);
      String projectName = project.getName();

      resultsJSON.put("projectName", projectName);
      resultsJSON.put("projectId", projectId);

      JSONArray activeStepResults = new JSONArray();

      if (activeNodeIds != null) {
        for (int x = 0; x < activeNodeIds.size(); x++) {
          String nodeId = activeNodeIds.get(x);
          String nodeContent = nodeIdToNodeContent.get(nodeId);
          String title = nodeIdToNodeTitlesWithPosition.get(nodeId);
          JSONArray brokenLinksForStep = findBrokenLinksForStep(nodeContent);

          if (brokenLinksForStep != null && brokenLinksForStep.length() != 0) {
            /*
             * there was at least one broken link so we will create an object
             * to contain the information for this step and the links that
             * were broken
             */
            JSONObject stepResult = new JSONObject();
            stepResult.put("stepTitle", title);
            stepResult.put("brokenLinks", brokenLinksForStep);
            activeStepResults.put(stepResult);
          }
        }
      }

      JSONArray inactiveStepResults = new JSONArray();
      if (inactiveNodeIds != null) {
        for (int x = 0; x < inactiveNodeIds.size(); x++) {
          String nodeId = inactiveNodeIds.get(x);
          String nodeContent = nodeIdToNodeContent.get(nodeId);
          String title = nodeIdToNodeTitlesWithPosition.get(nodeId);
          JSONArray brokenLinksForStep = findBrokenLinksForStep(nodeContent);

          if (brokenLinksForStep != null && brokenLinksForStep.length() != 0) {
            /*
             * there was at least one broken link so we will create an object
             * to contain the information for this step and the links that
             * were broken
             */
            JSONObject stepResult = new JSONObject();
            stepResult.put("stepTitle", title);
            stepResult.put("brokenLinks", brokenLinksForStep);
            inactiveStepResults.put(stepResult);
          }
        }
      }
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
    JSONObject resultsJSON = new JSONObject();
    parseProject(projectId);

    try {
      Project project = projectService.getById(projectId);
      String projectName = project.getName();
      resultsJSON.put("projectName", projectName);
      resultsJSON.put("projectId", projectId);

      JSONArray assets = new JSONArray();
      File assetFolder = new File(projectFolderLocalPath + "/assets");

      if (assetFolder.exists() && assetFolder.isDirectory()) {
        File[] assetFiles = assetFolder.listFiles();
        for (int x = 0; x < assetFiles.length; x++) {
          File assetFile = assetFiles[x];
          String assetFileName = assetFile.getName();
          JSONObject assetFileResult = new JSONObject();
          assetFileResult.put("assetFileName", assetFileName);

          JSONArray activeStepsUsedIn = new JSONArray();

          for (int y = 0; y < activeNodeIds.size(); y++) {
            String activeNodeId = activeNodeIds.get(y);
            String nodeContent = nodeIdToNodeContent.get(activeNodeId);
            if (nodeContent != null && nodeContent.contains(assetFileName)) {
              String title = nodeIdToNodeTitlesWithPosition.get(activeNodeId);
              activeStepsUsedIn.put(title);
            }
          }

          JSONArray inactiveStepsUsedIn = new JSONArray();

          for (int z = 0; z < inactiveNodeIds.size(); z++) {
            String inactiveNodeId = inactiveNodeIds.get(z);
            String nodeContent = nodeIdToNodeContent.get(inactiveNodeId);
            if (nodeContent != null && nodeContent.contains(assetFileName)) {
              String title = nodeIdToNodeTitlesWithPosition.get(inactiveNodeId);
              inactiveStepsUsedIn.put(title);
            }
          }

          assetFileResult.put("activeStepsUsedIn", activeStepsUsedIn);
          assetFileResult.put("inactiveStepsUsedIn", inactiveStepsUsedIn);
          assets.put(assetFileResult);
        }
      }
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
   */
  private void parseProject(Long projectId) {
    try {
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

      File projectFile = new File(projectFileLocalPath);
      String projectFileString = FileUtils.readFileToString(projectFile);
      JSONObject projectJSON = new JSONObject(projectFileString);
      JSONArray nodes = projectJSON.getJSONArray("nodes");
      for (int x = 0; x < nodes.length(); x++) {
        JSONObject node = nodes.getJSONObject(x);
        if (node != null) {
          String nodeId = node.getString("identifier");
          allNodeIds.add(nodeId);
          String ref = node.getString("ref");
          File file = new File(projectFolderLocalPath + "/" + ref);
          try {
            String fileContent = FileUtils.readFileToString(file);
            String nodeType = node.getString("type");
            if (nodeType != null && nodeType.equals("HtmlNode")) {
              JSONObject nodeJSON = new JSONObject(fileContent);
              String htmlSrc = nodeJSON.getString("src");
              String htmlSrcPath = projectFolderLocalPath + "/" + htmlSrc;
              File htmlSrcFile = new File(htmlSrcPath);

              try {
                fileContent = FileUtils.readFileToString(htmlSrcFile);
              } catch (IOException e) {
                e.printStackTrace();
              }
            }

            nodeIdToNodeContent.put(nodeId, fileContent);
          } catch (IOException e) {
            e.printStackTrace();
          }
          nodeIdToNode.put(nodeId, node);
        }
      }

      JSONArray sequences = projectJSON.getJSONArray("sequences");
      for (int y = 0; y < sequences.length(); y++) {
        JSONObject sequence = sequences.getJSONObject(y);
        if (sequence != null) {
          String sequenceId = sequence.getString("identifier");
          nodeIdToNode.put(sequenceId, sequence);
        }
      }

      traverseProject(projectJSON);

      for (int x = 0; x < allNodeIds.size(); x++) {
        String nodeId = allNodeIds.get(x);
        if (!activeNodeIds.contains(nodeId)) {
          inactiveNodeIds.add(nodeId);
          JSONObject node = nodeIdToNode.get(nodeId);
          String title = node.getString("title");
          String nodeType = node.getString("type");
          title = "Inactive Step: " + title + " (" + nodeType + ")";
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
      String startPoint = projectJSON.getString("startPoint");
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
    JSONObject node = nodeIdToNode.get(nodeId);
    if (node != null) {
      try {
        if (node.has("type")) {
          String type = node.getString("type");

          if (type != null && type.equals("sequence")) {
            try {
              if (node != null) {
                String title = node.getString("title");
                JSONArray refs = node.getJSONArray("refs");
                title = "Activity " + positionSoFar + ": " + title;
                nodeIdToNodeTitlesWithPosition.put(nodeId, title);
                for (int x = 0; x < refs.length(); x++) {
                  String ref = refs.getString(x);
                  JSONObject childNode = nodeIdToNode.get(ref);
                  String childNodeId = childNode.getString("identifier");
                  String newPositonSoFar = "";

                  if (positionSoFar == null || positionSoFar.equals("")) {
                    newPositonSoFar = positionSoFar + (x + 1);
                  } else {
                    newPositonSoFar = positionSoFar + "." + (x + 1);
                  }
                  traverseProjectHelper(childNodeId, newPositonSoFar);
                }
              }
            } catch (JSONException e) {
              e.printStackTrace();
            }
          } else {
            try {
              String title = node.getString("title");
              String nodeType = node.getString("type");
              title = "Step " + positionSoFar + ": " + title + " (" + nodeType + ")";
              nodeIdToNodeTitlesWithPosition.put(nodeId, title);
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
   * @return a JSONArray of broken link strings
   */
  private JSONArray findBrokenLinksForStep(String nodeContentString) {
    JSONArray brokenLinks = new JSONArray();

    if (nodeContentString != null) {
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

      Pattern pattern = Pattern.compile(regexString);
      Matcher matcher = pattern.matcher(nodeContentString);
      while (matcher.find()) {
        String originalAssetPath = null;
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
        for (int x = 0; x <= matcher.groupCount(); x++) {
          String group = matcher.group(x);
          if (group != null) {
            originalAssetPath = group;
          }
        }

        if (originalAssetPath == null) {
        } else if (originalAssetPath.startsWith("http")) {
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

        int responseCode = -1;

        try {
          responseCode = getResponseCode(assetPath);
          if (responseCode == 301) {
            /*
             * path responded with a redirect so we will retrieve
             * the redirect path and try accessing that path
             */
            String redirectLocation = getRedirectLocation(assetPath);
            responseCode = getResponseCode(redirectLocation);
          } else if (responseCode == 505) {
            /*
             * sometimes a 505 is caused by a space in the url so we will
             * try to make the request with " " replaced with "%20" because
             * the browser usually performs this replacement automatically
             * when making requests unlike the Java HttpURLConnection which
             * does not do this automatically.
             */
            assetPath = assetPath.replaceAll(" " , "%20");
            responseCode = getResponseCode(assetPath);
          }
        } catch (MalformedURLException e) {
          e.printStackTrace();
        } catch (IOException e) {
          e.printStackTrace();
        } catch (Exception e) {
          e.printStackTrace();
        }

        if (responseCode != 200) {
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
    URL url = new URL(urlString);
    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
    conn.setRequestMethod("GET");
    conn.connect();
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
    URL url = new URL(urlString);
    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
    conn.setRequestMethod("GET");
    conn.connect();
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
    String curriculumBaseDir = wiseProperties.getProperty("curriculum_base_dir");
    String projectUrl = project.getModulePath();
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
    String curriculumBaseWebDir = wiseProperties.getProperty("curriculum_base_www");
    String projectUrl = project.getModulePath();
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
    StringBuffer html = new StringBuffer();
    html.append("<html><head></head><body>");
    for (int x = 0; x < projectResults.length(); x++) {
      try {
        JSONObject projectResult = projectResults.getJSONObject(x);
        if (x != 0) {
          html.append("<hr>");
        }

        String projectName = projectResult.getString("projectName");
        long projectId = projectResult.getLong("projectId");

        html.append("Project Name: " + projectName + "<br>");
        html.append("Project Id: " + projectId + "<br><br>");

        JSONArray activeStepsResults = projectResult.getJSONArray("activeStepResults");
        if (activeStepsResults.length() != 0) {
          for (int y = 0; y < activeStepsResults.length(); y++) {
            JSONObject step = activeStepsResults.getJSONObject(y);
            String stepTitle = step.getString("stepTitle");
            html.append(stepTitle + "<br>");
            JSONArray brokenLinks = step.getJSONArray("brokenLinks");
            for (int z = 0; z < brokenLinks.length(); z++) {
              String brokenLink = brokenLinks.getString(z);
              brokenLink = makeLinkFromUrl(brokenLink, brokenLink);
              html.append(brokenLink + "<br>");
            }
            html.append("<br>");
          }
        }

        JSONArray inactiveStepResults = projectResult.getJSONArray("inactiveStepResults");
        if (inactiveStepResults.length() != 0) {
          for (int y = 0; y < inactiveStepResults.length(); y++) {
            JSONObject step = inactiveStepResults.getJSONObject(y);
            String stepTitle = step.getString("stepTitle");
            html.append(stepTitle + "<br>");
            JSONArray brokenLinks = step.getJSONArray("brokenLinks");

            for (int z = 0; z < brokenLinks.length(); z++) {
              String brokenLink = brokenLinks.getString(z);
              brokenLink = makeLinkFromUrl(brokenLink, brokenLink);
              html.append(brokenLink + "<br>");
            }
            html.append("<br>");
          }
        }

        if (activeStepsResults.length() == 0 && inactiveStepResults.length() == 0) {
          html.append("There are no broken links");
        }

      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

    html.append("</body></html>");
    return html.toString();
  }

  /**
   * Get the html view for the find unused assets results
   * @param projectResults a JSONArray of project results
   * @return a string containing the html view of the project results
   */
  private String getFindUnusedAssetsHtmlView(JSONArray projectResults) {
    StringBuffer html = new StringBuffer();
    html.append("<html><head></head><body>");
    for (int x = 0; x < projectResults.length(); x++) {
      try {
        JSONObject projectResult = projectResults.getJSONObject(x);
        if (x != 0) {
          //add a horizontal line if this is not the first project result
          html.append("<hr>");
        }

        String projectName = projectResult.getString("projectName");
        long projectId = projectResult.getLong("projectId");
        boolean allAssetsUsed = true;

        html.append("Project Name: " + projectName + "<br>");
        html.append("Project Id: " + projectId + "<br><br>");

        JSONArray assets = projectResult.getJSONArray("assets");
        for (int y = 0; y < assets.length(); y++) {
          JSONObject asset = assets.getJSONObject(y);
          String assetFileName = asset.getString("assetFileName");
          JSONArray activeStepsUsedIn = asset.getJSONArray("activeStepsUsedIn");
          JSONArray inactiveStepsUsedIn = asset.getJSONArray("inactiveStepsUsedIn");

          if (activeStepsUsedIn.length() > 0) {
            html.append("<font color='green'>" + assetFileName + "</font>");
          } else if (inactiveStepsUsedIn.length() > 0) {
            html.append("<font color='blue'>" + assetFileName + "</font>");
          } else {
            html.append("<font color='red'>" + assetFileName + "</font>");
          }

          String link = makeLinkFromUrl("assets/" + assetFileName, "view asset");
          html.append(" (" + link + ")");
          html.append("<br>");

          for (int a = 0; a < activeStepsUsedIn.length(); a++) {
            String activeStepUsedIn = activeStepsUsedIn.getString(a);
            html.append(activeStepUsedIn + "<br>");
          }

          for (int a = 0; a < inactiveStepsUsedIn.length(); a++) {
            String inactiveStepUsedIn = inactiveStepsUsedIn.getString(a);
            html.append(inactiveStepUsedIn + "<br>");
          }

          if (activeStepsUsedIn.length() == 0 && inactiveStepsUsedIn.length() == 0) {
            html.append("Not Used<br>");
            allAssetsUsed = false;
          }
          html.append("<br>");
        }

        if (allAssetsUsed) {
          html.append("All Assets Used<br>");
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }

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
    String link = "";
    String href = "";

    if (url.startsWith("assets")) {
      href = projectFolderWebPath + "/" + url;
    } else {
      href = url;
    }

    link = "<a href='" + href + "' target='_blank'>" + text + "</a>";
    return link;
  }
}
