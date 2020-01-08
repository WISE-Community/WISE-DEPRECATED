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
package org.wise.vle.utils;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;

import org.apache.commons.io.FileUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.wise.portal.domain.project.Project;

/**
 * Servlet implementation class for Servlet: FileManager
 *
 * @author Patrick Lawler
 */
public class FileManager {
  static final long serialVersionUID = 1L;

  private final static String COMMAND = "command";

  private final static String PARAM1 = "param1";

  @SuppressWarnings("unused")
  private final static String PARAM2 = "param2";

  @SuppressWarnings("unused")
  private final static String PARAM3 = "param3";

  @SuppressWarnings("unused")
  private final static String PARAM4 = "param4";

  private final static String PROJECT_PATHS = "projectPaths";

  private static boolean standAlone = true;

  private boolean modeRetrieved = false;

  private static Properties appProperties = null;

  static {
    try {
      appProperties = new Properties();
      appProperties.load(
          FileManager.class.getClassLoader().getResourceAsStream("application.properties"));
    } catch (Exception e) {
      System.err.println("FileManager could not read in appProperties file");
      e.printStackTrace();
    }
  }

  /**
   * Returns a '|' delimited String of all projects, returns an empty String if no projects exist
   * @return String
   */
  public static String getProjectList(String projectPaths, String projectExt) throws IOException {
    String[] paths = projectPaths.split("~");
    List<String> visited = new ArrayList<String>();
    List<String> projects = new ArrayList<String>();
    String projectList = "";

    if (paths != null && paths.length > 0) {
      for (int p = 0; p < paths.length; p++) {
        getProjectFiles(new File(paths[p]), projects, visited, projectExt);
      }
      CompareByLastModified compareByLastModified = new CompareByLastModified();
      Collections.sort(projects, compareByLastModified);
      for (int q= 0;q<projects.size();q++) {
        projectList += projects.get(q);
        if (q!=projects.size()-1) {
          projectList += "|";
        }
      }
      return projectList;
    } else {
      return "";
    }
  }

  /**
   * Given a file, a List of projects, and a list of visited directories, recursively adds
   * any project files to the list of projects that are in any subdirectories (n-deep).
   * @param f
   * @param projects
   * @param visited
   * @throws IOException
   */
  public static void getProjectFiles(File f, List<String> projects, List<String> visited,
      String projectExt) throws IOException{
    if (f.exists() && !visited.contains(f.getCanonicalPath())) {
      if (f.isFile()) {
        if (f.getName().endsWith(projectExt)) {
          projects.add(f.getAbsolutePath());
        } else {
          return;
        }
      } else if (f.isDirectory()) {
        visited.add(f.getCanonicalPath());
        if (!f.getCanonicalPath().contains(".svn")) {
          String children[] = f.list();
          for (int y = 0; y < children.length; y++) {
            getProjectFiles(new File(f, children[y]), projects, visited, projectExt);
          }
        }
      } else {
        throw new IOException("Not a file and not a directory. I don't know what it is.");
      }
    } else {
      return;
    }
  }

  /**
   * A Comparator that compares two <code>String</code> paths by the date it was last modified.
   */
  public static class CompareByLastModified implements Comparator<String> {
    public int compare(String arg0, String arg1) {
      File file1 = new File(arg0);
      File file2 = new File(arg1);

      if (file1.lastModified() == file2.lastModified()) {
        return 0;
      } else if (file1.lastModified() > file2.lastModified()) {
        return -1;
      } else {
        return 1;
      }
    }
  }

  /**
   * Returns true if given directory exists, if not returns whether the
   * creation of the given directory was successful
   *
   * @return boolean
   */
  public static boolean ensureDir(File file) {
    if (file.isDirectory()) {
      return true;
    } else {
      return file.mkdir();
    }
  }

  /**
   * Given a <code>File</code> the file to write to and the <code>String</code> data to write
   * to that file and a <code>boolean</code> overwrite, indicating whether the file should be
   * overwritten if it exists, writes the data to the file specified.
   *
   * @param file
   * @param data
   * @param overwrite
   * @throws <code>IOException</code>
   */
  public static void writeFile(File file, String data, boolean overwrite) throws IOException {
    if (!file.exists() || overwrite) {
      if (!file.exists()) {
        file.createNewFile();
      }
      Writer writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(file),
          "UTF-8"));
      writer.write(data);
      writer.close();
    } else {
      throw new IOException("File already exists and forced overwrite not set. Could not write file. " + file.getAbsolutePath());
    }
  }

  /**
   * Given a <code>String</code> path to the file to write to and the <code>String</code> data
   * to write to that file and a <code>boolean</code> overwrite, indicating whether the file
   * should be overwritten if it exists, writes the data to the file specified.
   *
   * @param path
   * @param data
   * @param overwrite
   * @throws <code>IOException</code>
   */
  public static void writeFile(String path, String data, boolean overwrite) throws IOException {
    File file = new File(path);
    writeFile(file, data, overwrite);
  }

  /**
   * Given a <code>File</code>, reads the text from the file as a <code>String</code>
   * and returns the string.
   *
   * @param file
   * @return <code>String</code> text
   * @throws <code>IOException</code>
   */
  public static String getFileText(File file) throws IOException {
    String result = "error";
    if (file.exists()) {
      BufferedReader br = new BufferedReader(
          new InputStreamReader(new FileInputStream(file), "UTF8"));
      String current = br.readLine();
      String fullText = "";
      while (current != null) {
        fullText += current + System.getProperty("line.separator");
        current = br.readLine();
      }
      br.close();
      result = fullText;
    } else {
      throw new IOException("Could not find specified file " + file.getAbsolutePath());
    }
    return result;
  }

  /**
   * Get the text in the file
   * @param filePath the file path
   * @return the text in the file
   * @throws IOException
   */
  public static String retrieveFile(String filePath) throws IOException {
    return getFileText(new File(filePath));
  }

  /**
   * Update the contents of a file
   * @param projectFolderPath the project folder path
   * @param fileName the file name
   * @param data the text content to put into the file
   * @return the text that specifies whether we were successful or not
   * @throws IOException
   */
  public static String updateFile(String projectFolderPath, String fileName, String data)
      throws IOException {
    String result = "not authorized";
    File dir = new File(projectFolderPath);
    if (dir.exists()) {
      File file = new File(dir, fileName);
      writeFile(file, data, true);
      result = "success";
    }
    return result;
  }

  /**
   * Creates a project in the curriculum directory
   *
   * @param curriculumBaseDir the curriculum base
   * e.g.
   * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum
   *
   * @param projectName the project name
   *
   * @return int
   * @throws IOException
   * @throws JSONException
   * @throws ServletException
   */
  public static String createProject(String curriculumBaseDir, String folderName,
      String projectName) throws IOException {
    String result = "";
    File parent = new File(curriculumBaseDir);
    ensureDir(parent);
    File newProjectPath = new File(curriculumBaseDir, folderName);
    newProjectPath.mkdir();
    File newProjectAssetsDir = new File(newProjectPath, "assets");
    newProjectAssetsDir.mkdir();
    File newFile = new File(newProjectPath, "wise4.project.json");
    try {
      writeFile(newFile, Template.getProjectTemplate(projectName).toString(3), false);
      String folder = newFile.getParentFile().getName();
      String fileName = newFile.getName();
      result = "/" + folder + "/" + fileName;
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return result;
  }

  /**
   * Creates a WISE5 project in the curriculum directory
   *
   * @param curriculumBaseDir the curriculum base
   * e.g.
   * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum
   *
   * @return int
   * @throws IOException
   * @throws JSONException
   * @throws ServletException
   */
  public static String createWISE5Project(String curriculumBaseDir, String folderName) {
    String result = "";
    File parent = new File(curriculumBaseDir);
    ensureDir(parent);
    File newProjectPath = new File(curriculumBaseDir, folderName);
    newProjectPath.mkdir();
    File newProjectAssetsDir = new File(newProjectPath, "assets");
    newProjectAssetsDir.mkdir();
    File newFile = new File(newProjectPath, "project.json");
    try {
      writeFile(newFile, "", false);
      String folder = newFile.getParentFile().getName();
      String fileName = newFile.getName();
      result = "/" + folder + "/" + fileName;
    } catch (IOException e) {
      e.printStackTrace();
    }
    return result;
  }

  /**
   * Given a parent directory, attempts to generate and return
   * a unique project directory
   * @param parent
   * @return
   */
  public static File createNewprojectPath(File parent) {
    Integer counter = 1;
    while (true) {
      File tryMe = new File(parent, String.valueOf(counter));
      if (!tryMe.exists()) {
        tryMe.mkdir();
        return tryMe;
      }
      counter++;
    }
  }

  /**
   * Creates a node and adds it to the project
   * @param projectPath the project path
   * @param nodeClass the class for the node
   * @param title the title of the step
   * @param type the type of step
   * @param nodeTemplateParams a JSONArray string that specifies what files to create
   * @return the node name
   * @throws IOException
   * @throws ServletException
   */
  public static String createNode(String projectPath, String nodeClass, String title, String type,
      String nodeTemplateParams) throws IOException {
    /*
     * the node name, "nodeNotProject" is the default value to return
     * which means there was an error creating the file. this variable
     * will be changed below once the file is created.
     */
    String nodeName = "nodeNotProject";

    File dir = new File(projectPath).getParentFile();
    if (dir.exists()) {
      try {
        JSONArray filesToCreate = new JSONArray(nodeTemplateParams);
        if (filesToCreate != null) {
          String fileNamePrefix = getUniqueFileNamePrefix(dir);
          for (int x = 0; x < filesToCreate.length(); x++) {
            JSONObject fileToCreate = filesToCreate.getJSONObject(x);
            String nodeExtension = fileToCreate.getString("nodeExtension");
            String nodeTemplateContent = fileToCreate.getString("nodeTemplateContent");
            if (nodeExtension != null && !nodeExtension.equals("") &&
              nodeTemplateContent != null && !nodeTemplateContent.equals("")) {
              boolean mainNodeFile = false;
              if (filesToCreate.length() == 1) {
                //in most cases there is only one file to create so it will be the main file
                mainNodeFile = true;
              } else {
                /*
                 * in rare cases there may be multiple files to create such
                 * as with HtmlNode in which case one of the files is the
                 * mainNodeFile (.ht) and the other is a supporting file (.html).
                 * for these cases the param for each file must specify
                 * whether it is the mainNodeFile or not
                 */
                mainNodeFile = fileToCreate.getBoolean("mainNodeFile");
              }

              File file = new File(dir, fileNamePrefix + "." + nodeExtension);
              writeFile(file, nodeTemplateContent, false);
              if (mainNodeFile && addNodeToProject(new File(projectPath),
                  Template.getProjectNodeTemplate(type, file.getName(), title, nodeClass))) {
                nodeName = file.getName();
              }
            }
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    } else {
      throw new IOException("Unable to find project");
    }
    return nodeName;
  }

  /**
   * Given a node type, returns the associated file extension
   * @param type
   * @return String
   * @throws ServletException
   */
  public static String getExtension(String type) {
    if (type.equals("BrainstormNode")) {
      return ".bs";
    } else if (type.equals("FillinNode")) {
      return ".fi";
    } else if (type.equals("HtmlNode") || type.equals("DrawNode")) {
      return ".ht";
    } else if (type.equals("MySystemNode")) {
      return ".my";
    } else if (type.equals("MatchSequenceNode")) {
      return ".ms";
    } else if (type.equals("MultipleChoiceNode")) {
      return ".mc";
    } else if (type.equals("NoteNode") || type.equals("OpenResponseNode")) {
      return ".or";
    } else if (type.equals("OutsideUrlNode")) {
      return ".ou";
    } else if (type.equals("DataGraphNode")) {
      return ".dg";
    } else if (type.equals("SVGDrawNode")) {
      return ".sd";
    } else if (type.equals("AnnotatorNode")) {
      return ".an";
    } else if (type.equals("MWNode")) {
      return ".mw";
    } else if (type.equals("AssessmentListNode")) {
      return ".al";
    } else if (type.equals("ChallengeNode")) {
      return ".ch";
    } else if (type.equals("BranchNode")) {
      return ".br";
    } else if (type.equals("SensorNode")) {
      return ".se";
    } else if (type.equals("ExplanationBuilderNode")) {
      return ".eb";
    } else {
      return ".txt";
    }
  }

  /**
   * Given a <code>String</code> filename, returns the <code>String</code> extension.
   * If the filename has no extension, returns the filename.
   *
   * @param filename
   * @return String - extension
   */
  public String getFileExtension(String filename) {
    if (filename.lastIndexOf(".") == -1) {
      return filename;
    } else {
      return filename.substring(filename.lastIndexOf("."), filename.length());
    }
  }

  /**
   * Given a parent directory <code>File</code> and a file extension <code>String</code>
   * generates and returns a <code>File</code> with a unique filename.
   *
   * @param parent
   * @param ext
   * @return File
   */
  public static File generateUniqueFile(File parent, String ext) {
    String name = "node_";
    int count = 0;

    while (true) {
      File file = new File(parent, name + count + ext);
      if (!file.exists() && !duplicateName(parent, name + count)) {
        return file;
      }
      count ++;
    }
  }

  /**
   * Get a file name prefix that has not been used yet
   * @param parent the directory where we want to search files
   * @return a String containing a file name prefix that is not
   * being used by any other files. e.g. 'node_2'
   */
  public static String getUniqueFileNamePrefix(File parent) {
    String name = "node_";
    int count = 0;

    while (true) {
      if (!duplicateName(parent, name + count)) {
        return name + count;
      }
      count++;
    }
  }

  /**
   * Returns true if any of the children files in the directory of the given parent
   * <code>File</code> have the same root name as the given name <code>String</code>,
   * otherwise, returns false.
   *
   * @param parent
   * @param name
   * @return boolean
   */
  public static boolean duplicateName(File parent, String name) {
    String[] children = parent.list();
    for (int i = 0; i < children.length; i++) {
      File childFile = new File(parent, children[i]);
      if (!childFile.isDirectory()) {
        int lastIndexOfDot = children[i].lastIndexOf(".");
        if (lastIndexOfDot != -1) {
          String childName = children[i].substring(0, children[i].lastIndexOf("."));
          if (childName.equals(name)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Given a <code>File</code> project file and a <code>JSONObject</code> node,
   * inserts the node into the project file and writes the project file to the
   * file system. Returns true if operation is successful, otherwise throws
   * <code>IOException</code>
   *
   * @param parent the project file
   * @param node the node to add to the project
   * @return boolean
   * @throws IOException
   */
  public static boolean addNodeToProject(File parent, JSONObject node) throws IOException {
    try {
      JSONObject project = new JSONObject(getFileText(parent));
      project.getJSONArray("nodes").put(node);
      writeFile(parent, project.toString(3), true);
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
      throw new IOException("Unable to add node to project.");
    }
  }

  /**
   * Create a sequence in the project
   * @param projectFileName the project file name
   * @param name the name of the sequence to create
   * @param id the id of the sequence to create
   * @param projectFolderPath the path to the project folder
   * @return the id of the sequence
   * @throws IOException
   */
  public static String createSequence(String projectFileName, String name, String id,
      String projectFolderPath) throws IOException {
    String result = "";
    /*
     * get the full project file path
     * e.g.
     * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667/wise4.project.json
     */
    String fullProjectFilePath = projectFolderPath + projectFileName;
    File file = new File(fullProjectFilePath);
    try {
      addSequenceToProject(file, Template.getSequenceTemplate(id, name));
      result = id;
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return result;
  }

  /**
   * Given a <code>File</code> project file and a <code>JSONObject</code> sequence,
   * inserts the sequence into the project and saves the project file.
   *
   * @param projectFile
   * @param sequence
   * @throws <code>IOException</code>
   */
  public static void addSequenceToProject(File projectFile, JSONObject sequence)
      throws IOException {
    try {
      JSONObject project = new JSONObject(getFileText(projectFile));
      project.getJSONArray("sequences").put(sequence);
      writeFile(projectFile, project.toString(3), true);
    } catch (JSONException e) {
      e.printStackTrace();
      throw new IOException("Could not insert new sequence in project file.");
    }
  }

  /**
   * Create a file in the specified folder and put data in the file
   * @param projectFolderPath the project folder path
   * @param fileName the file name
   * @param data the data to put in the file
   */
  public static String createFile(String projectFolderPath, String fileName, String data)
      throws IOException{
    String result = "";
    String fullFilePath = projectFolderPath + fileName;
    writeFile(fullFilePath, data, false);
    return result;
  }

  /**
   * Remove a file from a project folder
   * @param projectFolderPath the project folder path
   * @param fileName the file name to remove
   * @return whether it was a success or failure
   * @throws IOException
   */
  public static String removeFile(String projectFolderPath, String fileName) {
    File child = new File(new File(projectFolderPath), fileName);
    if (child.exists() && child.delete()) {
      return "success";
    } else {
      return "failure";
    }
  }

  /**
   * Given a <code>HttpServletRequest</code> request with parameters containing
   * path - path to project directory that we wish to copy and projectPath - the
   * default project directory location (to create projects), copies the directory
   * and returns <code>String</code> the path to the freshly copied directory.
   *
   * @param curriculumBaseDir the path to the curriculum directory
   * @param projectFolderPath the project folder path of the project we are copying
   * @return the path to the new project
   * @throws IOException
   */
  public static String copyProject(String curriculumBaseDir, String projectFolderPath,
      String newProjectDir) throws IOException {
    String result = "";
    File srcDir = new File(projectFolderPath);
    if (srcDir.exists() && srcDir.isDirectory()) {
      File destDir;
      if (curriculumBaseDir != null && curriculumBaseDir != "") {
        destDir = new File(curriculumBaseDir, newProjectDir);
      } else {
        destDir = new File(srcDir.getParentFile(), newProjectDir);
      }
      copy(srcDir, destDir);
      result = destDir.getName();
    } else {
      throw new IOException("Provided path is not found or is not a directory. Path: " + projectFolderPath);
    }
    return result;
  }

  /**
   * Copies the given <code>File</code> src to the given <code>File</code> dest. If they
   * are directories, recursively copies the contents of the directories.
   *
   * @param src
   * @param dest
   * @throws FileNotFoundException
   * @throws IOException
   */
  public static void copy(File src, File dest) throws IOException {
    if (src.isDirectory()) {
      if (!dest.exists()) {
        dest.mkdir();
      }
      String[] files = src.list();
      for (int a= 0;a<files.length;a++) {
        copy(new File(src, files[a]), new File(dest, files[a]));
      }
    } else {
      InputStream in = new FileInputStream(src);
      FileOutputStream out = new FileOutputStream(dest);
      byte[] buffer = new byte[2048];
      int len;
      while ((len = in.read(buffer)) > 0) {
        out.write(buffer, 0, len);
      }
      in.close();
      out.close();
    }
  }

  /**
   * Copy a node in a project
   * @param projectFolderPath the project folder path
   * @param projectFileName the project file name
   * @param data the data to put in the new node
   * @param type the node type
   * @param title the node title
   * @param nodeClass the node class
   * @param contentFile the file name of the node we are copying
   * @return the new file name
   * @throws IOException
   * @throws ServletException
   */
  public static String copyNode(String projectFolderPath, String projectFileName, String data,
      String type, String title, String nodeClass, String contentFile)
      throws IOException, ServletException {
    String result = "";
    String fullProjectFilePath = projectFolderPath + projectFileName;
    File dir = new File(fullProjectFilePath).getParentFile();
    if (dir.exists()) {
      File file = generateUniqueFile(dir, getExtension(type));
      if (type.equals("HtmlNode") || type.equals("DrawNode") || type.equals("MySystemNode")) {
        try {
          File content = new File(dir, contentFile);
          if (content.exists()) {
            writeFile(new File(dir, file.getName() + "ml"), getFileText(content), false);
          }
          JSONObject node = new JSONObject(data);
          node.put("src", file.getName() + "ml");
          writeFile(file, node.toString(3), false);
        } catch (JSONException e) {
          throw new ServletException(e);
        }
      } else {
        writeFile(file, data, false);
      }

      File parent = new File(fullProjectFilePath);
      try {
        if (addNodeToProject(parent, Template.getProjectNodeTemplate(type, file.getName(), title, nodeClass))) {
          result = file.getName();
        } else {
          throw new IOException("New node file created: " + file.getName() + "  but could not update project file.");
        }
      } catch (JSONException e) {
        e.printStackTrace();
        throw new IOException("New node file created: " + file.getName() + "  but could not update project file.");
      }
    } else {
      throw new IOException("Cannot find provided path, aborting operation.");
    }
    return result;
  }

  /**
   * Create a sequence in a project
   * @param projectFolderPath the project folder path
   * @param projectFileName the project file name
   * @param data the data for the sequence
   * @return whether it was a success or not
   * @throws IOException
   * @throws ServletException
   */
  public static String createSequenceFromJSON(String projectFolderPath, String projectFileName,
      String data) throws IOException, ServletException {
    String result = "";
    String fullProjectFilePath = projectFolderPath + projectFileName;
    File projectFile = new File(fullProjectFilePath);
    try {
      JSONObject sequence = new JSONObject(data);
      JSONObject project = new JSONObject(getFileText(projectFile));
      project.getJSONArray("sequences").put(sequence);
      writeFile(projectFile, project.toString(3), true);
      result = "success";
    } catch (JSONException e) {
      throw new ServletException(e);
    }
    return result;
  }

  /**
   * Retrieves all of the scripts in the scripts array and writes them out in the <code>HttpServletResponse</code>
   * @param context the context to retrieve the files from
   * @param data the script file names
   * @return the contents of the scripts
   * @throws IOException
   */
  public static String getScripts(ServletContext context, String data) throws IOException {
    String[] scripts = data.split("~");
    StringBuffer scriptsText = new StringBuffer();
    String out = "";
    for (String script : scripts) {
      InputStream is = context.getResourceAsStream("/" + script);
      if (is != null) {
        BufferedReader reader = new BufferedReader(new InputStreamReader(is));
        while ((out = reader.readLine()) != null) {
          scriptsText.append(out);
          scriptsText.append("\n");
        }
      }
    }
    scriptsText.append("scriptloader.scriptAvailable(scriptloader.baseUrl + \"vle/filemanager.html?command=getScripts&param1=" + data + "\");");
    scriptsText.append("\n");
    return scriptsText.toString();
  }

  /**
   * Compare the parent and child projects to find differences.
   * These differences include whether a node was added, deleted,
   * moved, or not moved and whether the content for the node
   * was modified.
   * @param curriculumBaseDir the curriculum directory
   * @param parentProjectUrl the parent project url e.g. 236/wise4.project.json
   * @param projectUrl the child project url e.g. 235/wise4.project.json
   * @return the results of the analysis of the difference between the
   * parent and child project
   * @throws IOException
   */
  public static String reviewUpdateProject(String curriculumBaseDir, String parentProjectUrl,
      String projectUrl) throws IOException {
    HashMap<String, JSONObject> childNodeIdToNodeOrSequence = new HashMap<String, JSONObject>();
    HashMap<String, String> childFileNameToId = new HashMap<String, String>();
    HashMap<String, String> childNodeIdToStepNumber = new HashMap<String, String>();
    HashMap<String, JSONObject> parentNodeIdToNodeOrSequence = new HashMap<String, JSONObject>();
    HashMap<String, String> parentFileNameToNodeId = new HashMap<String, String>();
    HashMap<String, String> parentNodeIdToStepNumber = new HashMap<String, String>();
    HashMap<String, String> htmlToHt = new HashMap<String, String>();

    /*
     * stores the node id to status of the node. status can be
     * "added"
     * "deleted"
     * "moved"
     * "not moved"
     */
    HashMap<String, String> nodeIdToStatus = new HashMap<String, String>();

    /*
     * stores the node id to whether that node was modified or not. modified can be
     * "true"
     * "false"
     * (note these are String values)
     */
    HashMap<String, String> nodeIdToModified = new HashMap<String, String>();

    String fileSeparator = System.getProperty("file.separator");
    String fullProjectFolderUrl = curriculumBaseDir + projectUrl.substring(0, projectUrl.lastIndexOf(fileSeparator));
    String fullProjectFileUrl = curriculumBaseDir + projectUrl;
    String fullParentProjectFolderUrl = curriculumBaseDir + parentProjectUrl.substring(0, parentProjectUrl.lastIndexOf(fileSeparator));
    String fullParentProjectFileUrl = curriculumBaseDir + parentProjectUrl;
    JSONObject childProject = getProjectJSONObject(fullProjectFileUrl);
    JSONObject parentProject = getProjectJSONObject(fullParentProjectFileUrl);
    parseProjectJSONObject(childProject, childNodeIdToNodeOrSequence, childFileNameToId, childNodeIdToStepNumber);
    parseProjectJSONObject(parentProject, parentNodeIdToNodeOrSequence, parentFileNameToNodeId, parentNodeIdToStepNumber);
    compareFolder(new File(fullParentProjectFolderUrl), new File(fullProjectFolderUrl), parentFileNameToNodeId, htmlToHt, nodeIdToModified);

    /*
     * compare the sequences in the parent and child projects
     * to determine if sequences have been added, deleted, moved,
     * or modified and if nodes have been added, deleted, or
     * moved (node modification detection is handled in the
     * compareFolder() call above)
     */
    compareSequences(parentProject, childProject,
      parentNodeIdToNodeOrSequence, childNodeIdToNodeOrSequence,
      parentNodeIdToStepNumber, childNodeIdToStepNumber,
      nodeIdToStatus, nodeIdToModified);

    /*
     * a collection of NodeInfo objects for nodes in the child and
     * parent project
     */
    TreeSet<NodeInfo> childAndParentNodes = new TreeSet<NodeInfo>(new NodeInfoComparator());

    /*
     * a collection to keep track of all the node ids we have
     * added to the childAndParentNodes collection for quicker
     * lookup
     */
    TreeSet<String> nodeIdsAdded = new TreeSet<String>();

    /*
     * we must add nodes from the parent project first because we want
     * to show the author the structure of the parent project and
     * then add any additional nodes from the child project. we will
     * show them the parent project structure and how the nodes in the
     * parent project are different from the child project. any nodes
     * that are in the child project and not the parent project will
     * be also added to show that those nodes will be deleted.
     */
    Set<String> parentKeySet = parentNodeIdToStepNumber.keySet();

    Iterator<String> parentIdIterator = parentKeySet.iterator();
    while (parentIdIterator.hasNext()) {
      String parentId = parentIdIterator.next();
      String stepNumber = parentNodeIdToStepNumber.get(parentId);

      String title = "";
      String nodeType = "";

      try {
        JSONObject parentNode = parentNodeIdToNodeOrSequence.get(parentId);
        title = parentNode.getString("title");
        nodeType = parentNode.getString("type");
      } catch (JSONException e) {
        e.printStackTrace();
      }

      NodeInfo parentNodeInfo = new NodeInfo(stepNumber, parentId, title, nodeType, "parent");
      childAndParentNodes.add(parentNodeInfo);
      nodeIdsAdded.add(parentId);
    }

    Set<String> childKeySet = childNodeIdToStepNumber.keySet();
    Iterator<String> childIdIterator = childKeySet.iterator();
    while (childIdIterator.hasNext()) {
      String childId = childIdIterator.next();
      String stepNumber = childNodeIdToStepNumber.get(childId);

      String title = "";
      String nodeType = "";

      try {
        JSONObject childNode = childNodeIdToNodeOrSequence.get(childId);
        title = childNode.getString("title");
        nodeType = childNode.getString("type");
      } catch (JSONException e) {
        e.printStackTrace();
      }

      if (!nodeIdsAdded.contains(childId)) {
        NodeInfo childNodeInfo = new NodeInfo(stepNumber, childId, title, nodeType, "child");
        childAndParentNodes.add(childNodeInfo);
        nodeIdsAdded.add(childId);
      }
    }

    /*
     * the JSONArray that will contain the status info for all the nodes
     * such as whether a node was added, deleted, moved, or modified
     */
    JSONArray nodeStatuses = new JSONArray();

    Iterator<NodeInfo> childAndParentNodesIterator = childAndParentNodes.iterator();
    while (childAndParentNodesIterator.hasNext()) {
      NodeInfo node = childAndParentNodesIterator.next();
      String nodeId = node.getNodeId();
      String stepNumber = node.getStepNumber();
      String title = node.getTitle();
      String nodeType = node.getNodeType();
      String status = nodeIdToStatus.get(nodeId);
      String modified = nodeIdToModified.get(nodeId);
      if (status == null) {
        status = "not moved";
      }

      if (modified == null) {
        modified = "false";
      }

      try {
        JSONObject nodeStatus = new JSONObject();
        nodeStatus.put("stepNumber", stepNumber);
        nodeStatus.put("title", title);
        nodeStatus.put("nodeId", nodeId);
        nodeStatus.put("status", status);
        nodeStatus.put("modified", modified);
        nodeStatus.put("nodeType", nodeType);
        nodeStatuses.put(nodeStatus);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return nodeStatuses.toString();
  }

  /**
   * Updates the child project by copying the parent project folder to the child project folder
   * @param curriculumBaseDir the curriculum directory
   * @param parentProjectUrl the parent project url e.g. 236/wise4.project.json
   * @param childProjectUrl the child project url e.g. 235/wise4.project.json
   * @return the result of the update
   * @throws IOException
   */
  public static String updateProject(String curriculumBaseDir, String parentProjectUrl,
      String childProjectUrl) throws IOException {
    String result = "";
    String fileSeparator = System.getProperty("file.separator");
    String fullChildProjectFolderUrl = curriculumBaseDir + childProjectUrl.substring(0, childProjectUrl.lastIndexOf(fileSeparator));
    String fullParentProjectFolderUrl = curriculumBaseDir + parentProjectUrl.substring(0, parentProjectUrl.lastIndexOf(fileSeparator));
    renameFolder(fullChildProjectFolderUrl);
    copyFile(new File(fullParentProjectFolderUrl), new File(fullChildProjectFolderUrl));
    return result;
  }

  /**
   * Import the steps from one project to another project
   * @param curriculumBaseDir the curriculum directory
   * @param fromProjectUrl the project to import from
   * @param toProjectUrl the from to import to
   * @param nodeIds the node ids to import
   * @return the result of the import
   * @throws IOException
   */
  public static String importSteps(String curriculumBaseDir, String fromProjectUrl,
      String toProjectUrl, String nodeIds) throws IOException {
    String result = "";
    String fileSeparator = System.getProperty("file.separator");
    String fullToProjectFileUrl = curriculumBaseDir + toProjectUrl;
    String fullToProjectFolderUrl = curriculumBaseDir + toProjectUrl.substring(0, toProjectUrl.lastIndexOf(fileSeparator));
    File toProjectFolder = new File(fullToProjectFolderUrl);
    String toProjectAssetsUrl = fullToProjectFolderUrl + "/assets";
    File toProjectAssetsFolder = new File(toProjectAssetsUrl);
    String fullFromProjectFileUrl = curriculumBaseDir + fromProjectUrl;
    String fullFromProjectFolderUrl = curriculumBaseDir + fromProjectUrl.substring(0, fromProjectUrl.lastIndexOf(fileSeparator));
    File fromProjectFolder = new File(fullFromProjectFolderUrl);
    String fromProjectAssetsUrl = fullFromProjectFolderUrl + "/assets";
    File fromProjectAssetsFolder = new File(fromProjectAssetsUrl);
    String fromProjectFileContent = FileUtils.readFileToString(new File(fullFromProjectFileUrl));
    JSONObject fromProjectJSON = null;

    try {
      fromProjectJSON = new JSONObject(fromProjectFileContent);
    } catch (JSONException e1) {
      e1.printStackTrace();
    }

    JSONArray nodeIdsArray = null;
    try {
      nodeIdsArray = new JSONArray(nodeIds);
      for (int x = 0; x < nodeIdsArray.length(); x++) {
        String nodeId = nodeIdsArray.getString(x);
        JSONObject fromNode = getNodeById(fromProjectJSON, nodeId);
        if (fromNode != null) {
          String type = fromNode.optString("type");
          String id = nodeId;
          String title = fromNode.optString("title");
          String nodeClass = fromNode.optString("class");
          String fileName = fromNode.optString("ref");
          File fileToImport = new File(fromProjectFolder, fileName);
          if (fileToImport.exists()) {
            String fileContent = FileUtils.readFileToString(fileToImport);
            String fileNamePrefix = getUniqueFileNamePrefix(toProjectFolder);
            String fileNameExtension = fileName.substring(fileName.indexOf("."));
            String newFileName = fileNamePrefix + fileNameExtension;
            if (fileNameExtension.equals(".ht")) {
              String htmlFileName = fileName + "ml";
              File htmlFileToImport = new File(fromProjectFolder, htmlFileName);
              if (htmlFileToImport.exists()) {
                String htmlString = FileUtils.readFileToString(htmlFileToImport);
                htmlString = importAssetsInContent(htmlString, fromProjectAssetsFolder, toProjectAssetsFolder);
                String newHtmlFileName = newFileName + "ml";
                File newHtmlFile = new File(toProjectFolder, newHtmlFileName);
                FileUtils.writeStringToFile(newHtmlFile, htmlString, "UTF-8");

                /*
                 * replace all references to the .html file in the new .ht file
                 * e.g.
                 *
                 * before
                 * {
                 *    "src": "node_0.html",
                 *    "type": "Html"
                 * }
                 *
                 * after
                 * {
                 *    "src": "node_141.html",
                 *    "type": "Html"
                 * }
                 */
                fileContent = fileContent.replaceAll(htmlFileName, newHtmlFileName);
              }
            } else if (fileNameExtension.equals(".wa")) {
              if (fileContent != null) {
                try {
                  JSONObject fileContentJSON = new JSONObject(fileContent);
                  if (fileContentJSON != null) {
                    String fromAssetFileName = fileContentJSON.getString("url");
                    File fromAssetFile = new File(fromProjectAssetsFolder, fromAssetFileName);
                    String fromAssetFileContent = FileUtils.readFileToString(fromAssetFile);
                    String toAssetFileContent = importReferencedFilesInContent(fromAssetFileContent, fromProjectAssetsFolder, toProjectAssetsFolder);
                    String toAssetFileName = importAssetInContent(fromAssetFileName, toAssetFileContent, fromProjectAssetsFolder, toProjectAssetsFolder);
                    if (fromAssetFileName != null && toAssetFileName != null &&
                        !fromAssetFileName.equals(toAssetFileName)) {
                      fileContent = fileContent.replaceAll(fromAssetFileName, toAssetFileName);
                    }
                  }
                } catch (JSONException e) {
                }
              }
            }
            fileContent = importAssetsInContent(fileContent, fromProjectAssetsFolder, toProjectAssetsFolder);
            File newFile = new File(toProjectFolder, newFileName);
            FileUtils.writeStringToFile(newFile, fileContent, "UTF-8");
            JSONObject newNode = Template.getProjectNodeTemplate(type, newFileName, title, nodeClass);
            addNodeToProject(new File(fullToProjectFileUrl), newNode);
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return result;
  }

  /**
   * Search for any references to assets in the step content and copy the assets to our assets folder
   * @param content the step content
   * @param fromProjectAssetsFolder the asset folder in the project we are copying the asset from
   * @param toProjectAssetsFolder the asset folder in the project we are copying the asset to
   * @return the updated content string
   */
  public static String importAssetsInContent(String content, File fromProjectAssetsFolder,
      File toProjectAssetsFolder) {
    /*
     * create a pattern that will match any of these below
     * "assets/myPicture.jpg"
     * 'assets/myPicture.jpg"
     * "./assets/myPicture.jpg"
     * './assets/myPicture.jpg'
     * \"assets/myPicture.jpg\"
     * \'assets/myPicture.jpg\'
     *
     * if the pattern matcher is run on the last example './assets/myPicture.jpg'
     * this is what the groups will look like
     * group(0)='./assets/myPicture.jpg'
     * group(1)=./
     * group(2)=myPicture.jpg
     */
    Pattern p = Pattern.compile("\\\\?[\\\"'](\\./)?assets/([^\\\"'\\\\]+)\\\\?[\\\"']");
    Matcher m = p.matcher(content);

    while (m.find()) {
      if (m.groupCount() == 2) {
        String fromAssetFileName = m.group(2);
        if (fromAssetFileName != null && !fromAssetFileName.isEmpty()) {
          if (fromAssetFileName.contains("?")) {
            /*
             * the file name contains GET params e.g. sunlight.jpg?w=12&h=12
             * so we will remove everything after the ?
             */
            fromAssetFileName = fromAssetFileName.substring(0, fromAssetFileName.indexOf("?"));
          }
          String toAssetFileName = importAssetInContent(fromAssetFileName, null, fromProjectAssetsFolder, toProjectAssetsFolder);
          if (fromAssetFileName != null && toAssetFileName != null &&
              !fromAssetFileName.equals(toAssetFileName)) {
            content = content.replaceAll(fromAssetFileName, toAssetFileName);
          }
        }
      }
    }
    return content;
  }

  /**
   * Search for any references to a file in the content and copy the file to our assets folder
   * @param content the content
   * @param fromProjectAssetsFolder the asset folder in the project we are copying the asset from
   * @param toProjectAssetsFolder the asset folder in the project we are copying the asset to
   * @return the updated content string
   */
  public static String importReferencedFilesInContent(String content, File fromProjectAssetsFolder,
      File toProjectAssetsFolder) {
    /*
     * create a pattern that will search for file references that use the src attribute
     *
     * the pattern will match any of these below and extract just the file name
     * src="Heat.png"
     * src='Heat.png'
     * src="Heat.png?w=15&amp;h=18"
     * src='Heat.png?w=15&amp;h=18'
     *
     * the pattern will not match any of these below
     * src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"
     * src='https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js'
     *
     * if the pattern matcher is run on src="Heat.png?w=15&amp;h=18"
     * this is what the groups will look like
     * group(0)=src="Heat.png?w=15&amp;h=18"
     * group(1)=src
     * group(2)=Heat.png
     */
    Pattern p = Pattern.compile("(src|href)=[\"'](?!http)([^\"'\\?]*)[^\"']*[\"']");
    Matcher m = p.matcher(content);

    while (m.find()) {
      if (m.groupCount() == 2) {
        String fromAssetFileName = m.group(2);
        if (fromAssetFileName != null && !fromAssetFileName.isEmpty()) {
          String toAssetFileName = importAssetInContent(fromAssetFileName, null, fromProjectAssetsFolder, toProjectAssetsFolder);
          if (fromAssetFileName != null && toAssetFileName != null &&
              !fromAssetFileName.equals(toAssetFileName)) {
            content = content.replaceAll(fromAssetFileName, toAssetFileName);
          }
        }
      }
    }
    return content;
  }

  /**
   * Import the asset from one project asset folder to another project asset folder
   * @param fromAssetFileName the name of the file in the asset folder
   * @param fromAssetFileContent (optional) the content that we want to save to the to asset.
   * if this is not provided we will obtain the content from the fromAssetFileName handle.
   * this parameter is used when the content in the fromAssetFileName needs to be modified
   * such as when file name references in the content need to be changed due to file name
   * conflicts.
   * @param fromProjectAssetsFolder the asset folder in the from project
   * @param toProjectAssetsFolder the asset folder in the to project
   * @return the name of the asset file that was created in the to project asset folder
   * or null if we were unable to create the asset in the to project asset folder
   */
  public static String importAssetInContent(String fromAssetFileName, String fromAssetFileContent,
      File fromProjectAssetsFolder, File toProjectAssetsFolder) {
    String toAssetFileName = null;
    String toAssetFileContent = null;
    File fromAsset = new File(fromProjectAssetsFolder, fromAssetFileName);
    if (fromAsset.exists()) {
      toAssetFileName = fromAssetFileName;
      File toAsset = new File(toProjectAssetsFolder, toAssetFileName);

      boolean assetCompleted = false;
      int counter = 1;

      /*
       * this while loop will check if the file already exists.
       *
       * if the file already exists, we will check if the content in the "from" file is the same as in the "to" file.
       *    if the content is the same, we do not need to do anything.
       *    if the content is different, we will look for another file name to use.
       * if the file does not exist, we will make it.
       */
      while (!assetCompleted) {
        if (toAsset.exists()) {
          try {
            toAssetFileContent = FileUtils.readFileToString(toAsset);
          } catch (IOException e1) {
            e1.printStackTrace();
          }

          try {
            boolean contentMatches = false;
            if (fromAssetFileContent != null) {
              /*
               * the from asset file content was passed in so we will compare it with
               * the to asset file content
               */
              if (fromAssetFileContent.equals(toAssetFileContent)) {
                contentMatches = true;
              }
            } else if (FileUtils.contentEquals(fromAsset, toAsset)) {
              contentMatches = true;
            }

            if (contentMatches) {
              assetCompleted = true;
            } else {
              toAssetFileName = createNewFileName(fromAssetFileName, counter);
              toAsset = new File(toProjectAssetsFolder, toAssetFileName);
              counter++;
            }
          } catch (IOException e) {
            e.printStackTrace();
            break;
          }
        } else {
          try {
            if (fromAssetFileContent != null) {
              FileUtils.write(toAsset, fromAssetFileContent);
            } else {
              FileUtils.copyFile(fromAsset, toAsset);
            }
            assetCompleted = true;
          } catch (IOException e) {
            e.printStackTrace();
            break;
          }
        }
      }
    }
    return toAssetFileName;
  }

  /**
   * Create a new file name by adding '-' and a number to the end of
   * the file name.
   *
   * before
   * myPicture.jpg
   * after
   * myPicture-1.jpg
   *
   * @param fileName the current file name
   * @param counter the number to add to the file name
   * @return a new file name with '-' and a number added to the end
   */
  public static String createNewFileName(String fileName, int counter) {
    String newFileName = "";
    int lastDot = fileName.lastIndexOf(".");
    String fileNameBeginning = fileName.substring(0, lastDot);
    String fileNameEnding = fileName.substring(lastDot);
    newFileName = fileNameBeginning + "-" + counter + fileNameEnding;
    return newFileName;
  }

  /**
   * Get the node JSONObject from the project JSON
   * @param projectJSON the project JSON object
   * @param nodeId the node id
   * @return the JSONObject for the node in the project
   */
  public static JSONObject getNodeById(JSONObject projectJSON, String nodeId) {
    JSONObject node = null;
    if (nodeId != null && !nodeId.equals("")) {
      try {
        JSONArray fromProjectNodes = projectJSON.getJSONArray("nodes");
        for (int x = 0; x < fromProjectNodes.length(); x++) {
          JSONObject tempNode = fromProjectNodes.getJSONObject(x);
          if (tempNode != null) {
            String id = tempNode.getString("identifier");
            if (nodeId.equals(id)) {
              node = tempNode;
              break;
            }
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
    return node;
  }

  /**
   * Renames the folder by changing the folder name to
   * <original folder name>-<time in milliseconds>
   * e.g.
   * 236
   * to
   * 236-1290473717307
   * @param projectUrl
   */
  public static void renameFolder(String projectUrl) {
    File originalFolder = new File(projectUrl);
    Date date = new Date();
    File backupFolder = new File(projectUrl + "-" + date.getTime());
    originalFolder.renameTo(backupFolder);
  }

  /**
   * Copy the contents of a folder to another folder. This is a recursive function
   * that deep copies folders.
   * @param sourceLocation the folder that contains the files we want to copy
   * @param targetLocation the folder we want to copy the files to
   * @throws IOException
   */
  public static void copyFile(File sourceLocation, File targetLocation) throws IOException {
    if (sourceLocation.isDirectory()) {
      if (!targetLocation.exists()) {
        targetLocation.mkdir();
      }
      String[] children = sourceLocation.list();
      for (int i = 0; i < children.length; i++) {
        copyFile(new File(sourceLocation, children[i]), new File(targetLocation, children[i]));
      }
    } else {
      InputStream in = new FileInputStream(sourceLocation);
      OutputStream out = new FileOutputStream(targetLocation);
      byte[] buf = new byte[1024];
      int len;
      while ((len = in.read(buf)) > 0) {
        out.write(buf, 0, len);
      }
      in.close();
      out.close();
    }
  }

  /**
   * An object to hold information for a node. A node can be a sequence
   * or a node.
   */
  public static class NodeInfo {
    private String stepNumber;
    private String nodeId;
    private String title;
    private String nodeType;

    /*
     * whether this node is from the parent project or the child project. this
     * field will be set to "parent" or "child"
     */
    private String parentOrChild;

    public NodeInfo(String stepNumber, String nodeId, String title, String nodeType, String parentOrChild) {
      this.stepNumber = stepNumber;
      this.nodeId = nodeId;
      this.title = title;
      this.setNodeType(nodeType);
      this.setParentOrChild(parentOrChild);
    }

    public void setStepNumber(String stepNumber) {
      this.stepNumber = stepNumber;
    }

    public String getStepNumber() {
      return stepNumber;
    }

    public void setNodeId(String nodeId) {
      this.nodeId = nodeId;
    }

    public String getNodeId() {
      return nodeId;
    }

    public void setTitle(String title) {
      this.title = title;
    }

    public String getTitle() {
      return title;
    }

    public void setNodeType(String nodeType) {
      this.nodeType = nodeType;
    }

    public String getNodeType() {
      return nodeType;
    }

    public void setParentOrChild(String parentOrChild) {
      this.parentOrChild = parentOrChild;
    }

    public String getParentOrChild() {
      return parentOrChild;
    }
  }

  /**
   * Comparator that compares NodeInfo objects. It orders the NodeInfo objects
   * by their step numbers from smaller to bigger.
   * e.g.
   * 1.1, 1.2, 1.3, 2.1, 3.1, 3.2, etc.
   */
  public static class NodeInfoComparator implements Comparator<NodeInfo> {

    /**
     * Compares the NodeInfo objects such that they will be
     * ordered by step number from smallest to biggest. We only want
     * one of each node id in our TreeSet so if the node ids are the
     * same for node1 and node2 we will say the NodeInfo objects are
     * the same. Otherwise we will compare their step numbers.
     * @param node1 a NodeInfo object
     * @param node2 a NodeInfo object
     * @return
     * -1 if node1 step number is smaller than node2 step number
     * 0 if the node ids are the same
     * 1 if the node1 step number is bigger than the node2 step number
     */
    public int compare(NodeInfo node1, NodeInfo node2) {
      int result = 0;
      String node1StepNumber = node1.getStepNumber();
      String node2StepNumber = node2.getStepNumber();
      String nodeId1 = node1.getNodeId();
      String nodeId2 = node2.getNodeId();

      if (nodeId1 != null && nodeId2 != null) {
        if (nodeId1.equals(nodeId2)) {
          return 0;
        }
      }

      if (node1StepNumber != null && node2StepNumber != null) {
        /*
         * split the step numbers by '.'
         * step numbers will look like 1.1, 2.3, 3.1, etc.
         * so we will obtain an array with the parts separated
         * 1.1 will become [1, 1]
         * 2.3 will become [2, 3]
         * 3.1 will become [3, 1]
         * 4.1.2 will become [4, 1, 2]
         * etc.
         */
        String[] node1Split = node1StepNumber.split("\\.");
        String[] node2Split = node2StepNumber.split("\\.");

        /*
         * get the longer of the lengths between the two arrays.
         * this is in case one of the arrays is longer than the
         * other.
         */
        int maxLength = Math.max(node1Split.length, node2Split.length);
        for (int x = 0; x < maxLength; x++) {
          if (node1Split.length - 1 < x) {
            /*
             * node1 has run out of parts while node 2 still has parts.
             * this will only happen if the node1 array is shorter than
             * the node2 array.
             */
            result = -1;
            break;
          } else if (node2Split.length - 1 < x) {
            /*
             * node2 has run out of parts while node 1 still has parts.
             * this will only happen if the node2 array is shorter than
             * the node1 array.
             */
            result = 1;
            break;
          } else {
            String node1Part = node1Split[x];
            String node2Part = node2Split[x];
            int node1PartNum = Integer.parseInt(node1Part);
            int node2PartNum = Integer.parseInt(node2Part);

            if (node1PartNum > node2PartNum) {
              result = 1;
              break;
            } else if (node1PartNum < node2PartNum) {
              result = -1;
              break;
            } else {
            }
          }
        }
      }

      if (result == 0) {
        if (nodeId1 != null && nodeId2 != null) {
          if (!nodeId1.equals(nodeId2)) {
            if (node1.getParentOrChild() == null) {
              result = 1;
            } else if (node1.getParentOrChild().equals("parent")) {
              /*
               * the nodes are different so we will return a non 0 value.
               * in this case we will try to be consistent by putting parent
               * nodes after child nodes
               */
              result = 1;
            } else if (node1.getParentOrChild().equals("child")) {
              /*
               * the nodes are different so we will return a non 0 value.
               * in this case we will try to be consistent by putting child
               * nodes before parent nodes
               */
              result = -1;
            }
          }
        }
      }
      return result;
    }
  }

  /**
   * Get the project JSONObject from the project url
   * @param projectUrl the url to the project
   * e.g.
   * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/236/wise4.project.json
   * @return the JSONObject for the project
   */
  public static JSONObject getProjectJSONObject(String projectUrl) {
    JSONObject projectJSONObject = null;
    File projectFile = new File(projectUrl);
    try {
      String projectJSONString = FileUtils.readFileToString(projectFile);
      projectJSONObject = new JSONObject(projectJSONString);
    } catch (IOException e) {
      e.printStackTrace();
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return projectJSONObject;
  }

  /**
   * Parse the project JSONObject to get all the nodes and sequences and
   * put them into HashMaps so that we can quickly reference them by id
   * later.
   * @param projectJSON the project JSONObject
   * @param nodeIdToNodeOrSequence a HashMap that stores node id to
   * node or sequence JSONObject
   * @param fileNameToNodeId a HashMap that stores filename to node id
   * @param nodeIdToStepNumber a HashMap that stores node id to step number
   */
  public static void parseProjectJSONObject(JSONObject projectJSON,
      HashMap<String, JSONObject> nodeIdToNodeOrSequence,
      HashMap<String, String> fileNameToNodeId,
      HashMap<String, String> nodeIdToStepNumber) {
    try {
      JSONArray projectNodes = projectJSON.getJSONArray("nodes");

      for (int x = 0; x < projectNodes.length(); x++) {
        JSONObject node = projectNodes.getJSONObject(x);
        String identifier = node.getString("identifier");
        String ref = node.getString("ref");
        fileNameToNodeId.put(ref, identifier);
        nodeIdToNodeOrSequence.put(identifier, node);
      }

      JSONArray projectSequences = projectJSON.getJSONArray("sequences");

      for (int y = 0; y < projectSequences.length(); y++) {
        JSONObject sequence = projectSequences.getJSONObject(y);
        String identifier = sequence.getString("identifier");
        nodeIdToNodeOrSequence.put(identifier, sequence);
      }

      String startPoint = projectJSON.getString("startPoint");
      JSONObject startPointSequence = nodeIdToNodeOrSequence.get(startPoint);
      parseNodeStepNumbers("", startPointSequence, nodeIdToNodeOrSequence, nodeIdToStepNumber);
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * Parse the project to calculate step numbers by traversing the project from start
   * to finish.
   * @param stepNumber the current step number, this will hold the activity numbers
   * so that when we get to a step we can put the activity number together with the
   * step number such as 1.1
   * @param node the current node
   * @param nodeIdToNodeOrSequence the HashMap that store node id to node JSONObject
   * @param nodeIdToStepNumber the HashMap that we will fill with node id to
   * step number
   */
  public static void parseNodeStepNumbers(String stepNumber, JSONObject node,
      HashMap<String, JSONObject> nodeIdToNodeOrSequence,
      HashMap<String, String> nodeIdToStepNumber) {
    try {
      String nodeType = node.getString("type");
      if (node.getString("type") != null && nodeType.equals("sequence")) {
        JSONArray refs = node.getJSONArray("refs");
        /*
         * check if stepNumber is "", if it is "" it means we are on the
         * start sequence and we do not need to add an entry for that
         * but we need to add an entry for all activities and steps
         */
        if (!stepNumber.equals("")) {
          //this is an activity or step
          String identifier = node.getString("identifier");
          nodeIdToStepNumber.put(identifier, stepNumber);
        }

        if (refs != null) {
          for (int x = 0; x < refs.length(); x++) {
            String childRef = refs.getString(x);
            JSONObject childNode = nodeIdToNodeOrSequence.get(childRef);

            /*
             * make the step number, if we are on activity 1,
             * stepNumber would be 1 and childStepNumber would
             * be set to 1 at the moment
             */
            String childStepNumber = stepNumber;

            if (!childStepNumber.equals("")) {
              childStepNumber += ".";
            }

            /*
             * add the step number, if we are on activity 1,
             * step 2, childStepNumber would be set to
             * 1.2
             */
            childStepNumber += (x + 1);
            parseNodeStepNumbers(childStepNumber, childNode, nodeIdToNodeOrSequence, nodeIdToStepNumber);
          }
        }
      } else {
        String identifier = node.getString("identifier");
        nodeIdToStepNumber.put(identifier, stepNumber);
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * Compare all the sequences in the parent project and the child project.
   * We will determine whether an activity or a step was added, deleted,
   * or moved.
   * @param parentProjectNode the JSONObject for the parent project
   * @param childProjectNode the JSONObject for the child project
   */
  public static void compareSequences(JSONObject parentProjectNode, JSONObject childProjectNode,
      HashMap<String, JSONObject> parentNodeIdToNodeOrSequence,
      HashMap<String, JSONObject> childNodeIdToNodeOrSequence,
      HashMap<String, String> parentNodeIdToStepNumber,
      HashMap<String, String> childNodeIdToStepNumber, HashMap<String, String> nodeIdToStatus,
      HashMap<String, String> nodeIdToModified) {
    TreeSet<String> sequenceIds = new TreeSet<String>();
    try {
      JSONArray parentProjectSequences = parentProjectNode.getJSONArray("sequences");
      JSONArray childProjectSequences = childProjectNode.getJSONArray("sequences");
      extractNodeIdsFromSequenceNodeJSONArray(sequenceIds, parentProjectSequences);
      extractNodeIdsFromSequenceNodeJSONArray(sequenceIds, childProjectSequences);

      Iterator<String> sequenceIdsIterator = sequenceIds.iterator();
      while (sequenceIdsIterator.hasNext()) {
        String sequenceId = sequenceIdsIterator.next();

        /*
         * try to retrieve the sequence JSONObject from the child and parent project.
         * the sequence id may be in only one of the projects if one of the projects
         * has been changed.
         */
        JSONObject childSequence = childNodeIdToNodeOrSequence.get(sequenceId);
        JSONObject parentSequence = parentNodeIdToNodeOrSequence.get(sequenceId);

        if (childSequence != null && parentSequence != null) {
          /*
           * both parent and child projects have this sequence so we will compare
           * the nodes within them
           */

          JSONArray parentRefs = parentSequence.getJSONArray("refs");
          JSONArray childRefs = childSequence.getJSONArray("refs");
          TreeSet<String> nodeIds = new TreeSet<String>();
          extractNodeIdsFromJSONArray(nodeIds, parentRefs);
          extractNodeIdsFromJSONArray(nodeIds, childRefs);

          /*
           * flag to be set if there is a difference between the parent and
           * child sequence in terms of node existence and node comparison.
           * this will not take into consideration the modification of a
           * node's content. node modification is handled somewhere else.
           */
          boolean sequenceModified = false;

          Iterator<String> nodeIdsIterator = nodeIds.iterator();
          while (nodeIdsIterator.hasNext()) {
            String nodeId = nodeIdsIterator.next();
            JSONObject parentNode = parentNodeIdToNodeOrSequence.get(nodeId);
            JSONObject childNode = childNodeIdToNodeOrSequence.get(nodeId);

            if (childNode != null && parentNode != null) {
              /*
               * node exists in both parent and child project so we will
               * check if the node is in the same position or if it was moved
               */

              String parentStepNumber = parentNodeIdToStepNumber.get(nodeId);
              String childStepNumber = childNodeIdToStepNumber.get(nodeId);

              if (childStepNumber != null && parentStepNumber != null) {
                if (!childStepNumber.equals(parentStepNumber)) {
                  nodeIdToStatus.put(nodeId, "moved");
                  sequenceModified = true;
                }
              }
            } else if (childNode != null && parentNode == null) {
              /*
               * node was only found in the child project which means
               * the node will be deleted from child project
               */
              nodeIdToStatus.put(nodeId, "deleted");
              //the sequence is different between parent and child project
              sequenceModified = true;
            } else if (childNode == null && parentNode != null) {
              /*
               * node was only found in the parent project which means
               * the node will be added to child project
               */
              nodeIdToStatus.put(nodeId, "added");
              //the sequence is different between parent and child project
              sequenceModified = true;
            }
          }

          if (sequenceModified) {
            nodeIdToModified.put(sequenceId, "true");
          } else {
            nodeIdToModified.put(sequenceId, "false");
          }

        } else if (childSequence != null && parentSequence == null) {
          /*
           * child project has this sequence but parent project does not so
           * we will check if the nodes in the child project sequence are
           * new to the parent project because it is possible the child
           * project had the nodes moved to a new sequence.
           */

          nodeIdToStatus.put(sequenceId, "deleted");

          JSONArray childRefs = childSequence.getJSONArray("refs");
          for (int x = 0; x < childRefs.length(); x++) {
            String nodeId = childRefs.getString(x);
            JSONObject parentNode = parentNodeIdToNodeOrSequence.get(nodeId);

            if (parentNode == null) {
              nodeIdToStatus.put(nodeId, "deleted");
            } else {
              nodeIdToStatus.put(nodeId, "moved");
            }
          }
        } else if (childSequence == null && parentSequence != null) {
          /*
           * parent project has this sequence but child project does not so
           * we will check if the nodes in the parent project sequence are
           * new to the child project
           */

          nodeIdToStatus.put(sequenceId, "added");
          JSONArray parentRefs = parentSequence.getJSONArray("refs");
          for (int x = 0; x < parentRefs.length(); x++) {
            String nodeId = parentRefs.getString(x);
            JSONObject childNode = childNodeIdToNodeOrSequence.get(nodeId);

            if (childNode == null) {
              nodeIdToStatus.put(nodeId, "added");
            } else {
              nodeIdToStatus.put(nodeId, "moved");
            }
          }
        }
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * Extract the node ids from the JSONArray of node ids and add them to
   * the given TreeSet. The TreeSet only contains unique values so we
   * will not have any duplicates.
   * @param nodeIds a TreeSet to store the node ids in
   * @param nodeIdsArray a JSONArray of node id strings
   */
  public static void extractNodeIdsFromJSONArray(TreeSet<String> nodeIds, JSONArray nodeIdsArray) {
    for (int x = 0; x < nodeIdsArray.length(); x++) {
      try {
        String ref = nodeIdsArray.getString(x);
        nodeIds.add(ref);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
  }

  /**
   * Extract sequence ids from an array of sequences and add them to
   * the given TreeSet. The TreeSet only contains unique values so we
   * will not have any duplicates.
   * @param nodeIds a TreeSet to store the node ids in
   * @param sequenceNodes a JSONArray of sequence JSONObjects
   */
  public static void extractNodeIdsFromSequenceNodeJSONArray(
      TreeSet<String> nodeIds, JSONArray sequenceNodes) {
    for (int x = 0; x < sequenceNodes.length(); x++) {
      try {
        JSONObject sequence = sequenceNodes.getJSONObject(x);
        String identifier = sequence.getString("identifier");
        nodeIds.add(identifier);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
  }

  /**
   * Compares the files in the folders and checks whether they have been modified
   * or not. This is a recursive function that implements deep traversal so that
   * contents in child folders are also compared. This comparison is determining
   * what changes, if any, have been made to the files in the child project.
   * @param sourceLocation the folder of the parent project
   * @param targetLocation the folder of the child project
   * @throws IOException
   */
  public static void compareFolder(File sourceLocation, File targetLocation,
      HashMap<String, String> parentFileNameToNodeId, HashMap<String, String> htmlToHt,
      HashMap<String, String> nodeIdToModified) throws IOException {
    if (sourceLocation.exists() && targetLocation.exists()) {
      if (sourceLocation.isDirectory() && targetLocation.isDirectory()) {
        compareFolderHelper(sourceLocation, targetLocation, parentFileNameToNodeId, htmlToHt, nodeIdToModified);
      } else if (sourceLocation.isFile() && targetLocation.isFile()) {
        /*
         * file exists in parent and child project so we will now compare the
         * file from the parent project and the child project
         */

        String fileName = sourceLocation.getName();

        /*
         * get the node id of the node that this file is for. if the
         * filename is a .html file, it will not have an associated
         * node id but we will handle that below
         */
        String nodeId = parentFileNameToNodeId.get(fileName);
        String sourceFile = FileUtils.readFileToString(sourceLocation);
        String targetFile = FileUtils.readFileToString(targetLocation);

        if (sourceFile != null && targetFile != null) {
          if (fileName.toLowerCase().endsWith(".ht")) {
            try {
              JSONObject sourceFileContent = new JSONObject(sourceFile);
              String referencedHtmlFileName = sourceFileContent.getString("src");
              htmlToHt.put(referencedHtmlFileName, nodeId);
            } catch (JSONException e) {
              e.printStackTrace();
            }
          } else if (fileName.toLowerCase().endsWith(".html")) {

            /*
             * obtain the node id associated with this .html file. we are
             * assuming the .ht file is analyzed before the .html file is.
             * this will be true as long as the traversal of the files in
             * the folder are alphabetical such that .ht always comes before
             * .html.
             *
             * note: this will not be true if the file names to not
             * share the same prefix but in our case they always do.
             */
            String htNodeId = htmlToHt.get(fileName);

            /*
             * we will use the node id associated with the associated .ht file
             * for this .html file. this will cause the entry in nodeIdToModified
             * to be overridden with the modified value for the .html file
             * because we care about whether the .html file was modified and
             * not the .ht because the .ht never really changes.
             */
            nodeId = htNodeId;
          }

          if (!sourceFile.equals(targetFile)) {
            nodeIdToModified.put(nodeId, "true");
          } else {
            nodeIdToModified.put(nodeId, "false");
          }
        }
      } else if (sourceLocation.isDirectory() && targetLocation.isFile()) {
      } else if (sourceLocation.isFile() && targetLocation.isDirectory()) {
      }
    } else if (sourceLocation.exists() && !targetLocation.exists()) {
      if (sourceLocation.isDirectory()) {
        compareFolderHelper(sourceLocation, targetLocation, parentFileNameToNodeId, htmlToHt, nodeIdToModified);
      } else if (sourceLocation.isFile()) {
        /*
         * file does not exist in the child project so it is new in the
         * parent project or was deleted in the child project. from the
         * author's point of view, the file will be added to the child
         * project. this will be handled in compareSequences().
         */
      }
    } else if (!sourceLocation.exists() && targetLocation.exists()) {
      if (targetLocation.isDirectory()) {
        compareFolderHelper(sourceLocation, targetLocation, parentFileNameToNodeId, htmlToHt, nodeIdToModified);
      } else if (targetLocation.isFile()) {
        /*
         * file does not exist in the parent project so it was either
         * deleted in the parent project or is new in the child project.
         * from the author's point of view, the file will be deleted
         * from the child project. this will be handled in compareSequences().
         */
      }
    }
  }

  /**
   * Retrieves the files in the folders and calls compareFolder on all
   * of those files.
   * @param sourceLocation the file or folder from the parent project
   * @param targetLocation the file or folder from the child project
   * @throws IOException
   */
  public static void compareFolderHelper(File sourceLocation, File targetLocation,
      HashMap<String, String> parentFileNameToNodeId, HashMap<String, String> htmlToHt,
      HashMap<String, String> nodeIdToModified) throws IOException {
    TreeSet<String> files = new TreeSet<String>();
    if (sourceLocation.isDirectory()) {
      String[] sourceChildren = sourceLocation.list();
      addFileNamesToCollection(files, sourceChildren);
    }

    if (targetLocation.isDirectory()) {
      String[] targetChildren = targetLocation.list();
      addFileNamesToCollection(files, targetChildren);
    }

    Iterator<String> iterator = files.iterator();
    while (iterator.hasNext()) {
      String file = iterator.next();
      compareFolder(new File(sourceLocation, file), new File(targetLocation, file),
          parentFileNameToNodeId, htmlToHt, nodeIdToModified);
    }
  }

  /**
   * Adds the file names from the array to the collection
   * @param fileNameCollection collection that holds all the file names
   * @param fileNames an array of file names
   */
  public static void addFileNamesToCollection(TreeSet<String> fileNameCollection, String[] fileNames) {
    for (int i = 0; i < fileNames.length; i++) {
      fileNameCollection.add(fileNames[i]);
    }
  }

  /**
   * Get the amount of disk space this project uses and the max project size
   * @param path the path to the project
   * @param projectMaxTotalAssetsSizeLong the max allowable project folder size
   * @return a string specifying how much space the project is using and what
   * the max allowable project folder size is as a fraction e.g.
   * 100kb/10mb
   */
  public static String getProjectUsageAndMax(String path, Long projectMaxTotalAssetsSizeLong) {
    String result = "";
    String sizeUsed = getProjectSize(path);
    String projectMaxTotalAssetsSizeString = null;
    if (projectMaxTotalAssetsSizeLong != null) {
      projectMaxTotalAssetsSizeString = projectMaxTotalAssetsSizeLong.toString();
    } else {
      projectMaxTotalAssetsSizeString =
          appProperties.getProperty("project_max_total_assets_size", "15728640");
    }
    String usageString = sizeUsed + "/" + projectMaxTotalAssetsSizeString;
    result = usageString;
    return result;
  }

  /**
   * Returns the size in bytes of all of the files in the specified path/dirname
   *
   * @param path the path to the project folder
   * @return the size of the folder in bytes as a string
   */
  public static String getProjectSize(String path) {
    if (path == null) {
      return "No project path specified";
    } else {
      File projectDir = new File(path);
      if (projectDir.exists()) {
        if (projectDir.isDirectory()) {
          long sizeOfDirectory = FileUtils.sizeOfDirectory(projectDir);
          return String.valueOf(sizeOfDirectory);
        } else {
          return "0";
        }
      } else {
        return "Given project path does not exist.";
      }
    }
  }

  /**
   * Get the full path to the project json file
   * @param project the project object
   * @return the full project file path
   * e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667/wise4.project.json
   */
  public static String getProjectFilePath(Project project) {
    String curriculumBaseDir = appProperties.getProperty("curriculum_base_dir");
    String projectModulePath = project.getModulePath();
    return curriculumBaseDir + projectModulePath;
  }

  /**
   * Get the full file path given the project object and a file name
   * @param project the project object
   * @param fileName the file name
   * @return the full file path
   * e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667/node_2.or
   */
  public static String getFilePath(Project project, String fileName) {
    String filePath = null;
    if (project != null) {
      String projectFolderPath = getProjectFolderPath(project);
      filePath = projectFolderPath + "/" + fileName;
    }
    return filePath;
  }

  /**
   * Get the full project folder path given the project object
   * @param project the project object
   * @return the full project folder path
   * e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667
   */
  public static String getProjectFolderPath(Project project) {
    String projectFilePath = getProjectFilePath(project);
    return projectFilePath.substring(0, projectFilePath.lastIndexOf("/"));
  }

  public static String getProjectAssetsFolderPath(Project project) {
    return getProjectFolderPath(project) + "/assets";
  }
}
