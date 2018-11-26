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

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.wise.vle.web.SecurityUtils;
import org.xml.sax.SAXException;

/**
 * The Converter servlet handles converting xml to JSON objects for projects and node content.
 * @author Patrick Lawler
 */
public class Converter extends HttpServlet implements Servlet{
  static final long serialVersionUID = 1L;

  private boolean standAlone = true;

  private boolean modeRetrieved = false;

  public Converter() {
    super();
  }

  // Node types
  private enum Type {
      HtmlNode, OpenResponseNode, NoteNode, BrainstormNode, BlueJNode, DataGraphNode, DrawNode,
      FillinNode, FlashNode, MatchSequenceNode, MultipleChoiceNode, MySystemNode, OutsideUrlNode};

  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    doPost(request, response);
  }

  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    if (!modeRetrieved) {
      standAlone = !SecurityUtils.isPortalMode(request);
      modeRetrieved = true;
    }

    if (standAlone || SecurityUtils.isAuthenticated(request)) {
      doRequest(request, response);
    } else {
      try {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
      } catch(IOException e) {
        e.printStackTrace();
        return;
      }
    }
  }

  private void doRequest(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    String command = request.getParameter("command");
    if (command.equals("convertXMLProject")) {
      convertXMLProject(request, response);
    } else if (command.equals("convertXMLProjectString")) {
      convertXMLProjectString(request, response);
    } else {
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
    }
  }

  /**
   * Given a <code>HttpServletRequest</code> request and a <code>HttpServletResponse</code> response,
   * converts the value of the parameter "xml" in the request to a JSON object string and writes that
   * string to the response.
   *
   * @param <code>HttpServletRequest</code> request
   * @param <code>HttpServletResponse</code> response
   * @throws IOException
   * @throws <code>ServletException</code>
   */
  public void convertXMLProjectString(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    String xml = request.getParameter("xml");
    try {
      JSONObject project = convertProjectDocToJSONObject(getDOMDocumentFromString(xml));
      response.getWriter().write(project.toString(3));
    } catch(JSONException e) {
      e.printStackTrace();
      response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    } catch(ServletException e) {
      e.printStackTrace();
      response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    } catch(IOException e) {
      e.printStackTrace();
      response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Given a <code>HttpServletRequest</code> and a <code>HttpServletResponse</code>, retrieves the
   * 'path' parameter from the request, parses the xml document specified by that path, converts it
   * to json and writes a new .project.json file with the data.
   *
   * @param <code>HttpServletRequest</code> request
   * @param <code>HttpServletResponse</code> response
   * @throws IOException
   * @throws <code>ServletException</code>
   */
  public void convertXMLProject(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    String path = request.getParameter("path");
    if (path != null && path != "") {
      if (standAlone || SecurityUtils.isAllowedAccess(request, path)) {
        try {
          JSONObject project = convertProjectDocToJSONObject(
              getDOMDocumentFromString(FileManager.getFileText(new File(path))));
          File copyFolder = createCopyFolder(path);
          String newProjectName = new File(path.replace(".xml", ".json")).getName();
          File newProjectFile = new File(copyFolder, newProjectName);
          FileManager.writeFile(newProjectFile, project.toString(3), true);
          File old_dir = new File(path).getParentFile();
          File new_dir = newProjectFile.getParentFile();
          if (old_dir.exists() && old_dir.isDirectory()) {
            String files[] = old_dir.list();
            for (String file : files) {
              File currentFile = new File(old_dir, file);
              if (currentFile.isDirectory()) {
                File createdDir = new File(new_dir, currentFile.getName());
                if (!createdDir.exists()) {
                  createdDir.mkdir();
                }
                FileManager.copy(currentFile, createdDir);
              }
            }
          }

          String rootTodoName = newProjectName.replace(".project.json", ".todo.txt");
          String rootMetaName = newProjectName.replace(".project.json", ".project-meta.json");
          File todoFile = new File(old_dir, rootTodoName);
          File metaFile = new File(old_dir, rootMetaName);
          if (todoFile.exists()) {
            FileManager.copy(todoFile, new File(new_dir, rootTodoName));
          }
          if (metaFile.exists()) {
            FileManager.copy(metaFile, new File(new_dir, rootMetaName));
          }

          JSONArray nodes = project.getJSONArray("nodes");
          String failMsg = "Project successfully converted but converting the following node(s) failed:";
          boolean failed = false;
          for (int r = 0; r < nodes.length(); r++) {
            JSONObject currentNode = nodes.getJSONObject(r);
            if (!convertNode(currentNode, new File(path).getParentFile(), copyFolder)) {
              failMsg += " " + currentNode.getString("identifier");
              failed = true;
            } else {
              if (currentNode.getString("type").equals("MySystemNode")) {
                currentNode.put("ref", currentNode.getString("ref").replace(".html", ".my"));
              }

              currentNode.put("ref", currentNode.getString("ref").replace(".html", ".ht"));

              if (currentNode.getString("type").equals("BlueJNode")) {
                currentNode.put("ref", currentNode.getString("ref").replace(".bluej", ".ht"));
                currentNode.put("type", "HtmlNode");
              }
            }
          }

          FileManager.writeFile(newProjectFile, project.toString(3), true);
          if (failed) {
            response.getWriter().write(failMsg);
          } else {
            response.getWriter().write("Successfully converted the xml project to JSON. The new project path is: " + newProjectFile.getCanonicalPath());
          }
        } catch (JSONException e) {
          e.printStackTrace();
          response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        } catch (ServletException e) {
          e.printStackTrace();
          response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        } catch (IOException e) {
          e.printStackTrace();
          response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
      } else {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
      }
    } else {
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
    }
  }

  /**
   * Given a <code>String</code> path -- including filename -- creates a folder for copying
   * the project, if it does not exist and returns the copy filder <code>File</code> file.
   *
   * @param <code>String</code> path
   * @return <code>File</code>
   * @throws <code>IOException</code>
   */
  private File createCopyFolder(String path) throws IOException {
    File og = new File(path);
    if (og.exists() && og.isFile()) {
      File newFolder = new File(og.getParentFile().getParentFile(), og.getParentFile().getName() + "_JSON_Converted");
      if (!newFolder.exists()) {
        newFolder.mkdir();
      }
      return newFolder;
    } else {
      throw new IOException("Given xml file path either does not exist or is not a file. Cannot convert project.");
    }
  }

  /**
   * Converts the given <code>Document</code> project document into a <code>JSONObject</code>
   * project JSON object and returns it.
   *
   * @param <code>Document</code> doc
   * @return <code>JSONObject</code>
   * @throws <code>ServletException</code>
   * @throws <code>JSONException</code>
   */
  public JSONObject convertProjectDocToJSONObject(Document doc) throws ServletException,
      JSONException {
    NodeList list = doc.getElementsByTagName("project");
    Node project = null;
    JSONObject projectObj = new JSONObject();

    if (list.getLength()<1) {
      throw new ServletException("Could not find project tag in xml string.");
    } else {
      project = list.item(0);
    }

    convertProjectAttributes(project, projectObj);
    projectObj.put("nodes", convertProjectNodes(doc.getElementsByTagName("nodes")));
    projectObj.put("sequences", convertProjectSequences(doc.getElementsByTagName("sequences")));
    convertProjectStartPoint(doc.getElementsByTagName("startpoint").item(0), projectObj);
    return projectObj;
  }

  /**
   * Given a <code>Node</code> project and a <code>JSONObject</code> projectObj, sets the
   * fields in the projectObj with the values specified for the attributes of the same name
   * within the node. Sets default values if the specific field is not specified in the node.
   *
   * @param <code>Node</code> project
   * @param <code>JSONObject</code> projectObj
   * @throws <code>JSONException</code>
   */
  public void convertProjectAttributes(Node project, JSONObject projectObj) throws JSONException {
    NamedNodeMap map = project.getAttributes();
    String titleVal = "";
    if (map != null && map.getNamedItem("title") != null) {
      titleVal = map.getNamedItem("title").getNodeValue();
    }
    projectObj.put("title", titleVal);

    String autoStep = "true";
    if (map != null && map.getNamedItem("autoStep") != null) {
      autoStep = map.getNamedItem("autoStep").getNodeValue();
    }
    projectObj.put("autoStep", Boolean.parseBoolean(autoStep));

    String stepLevel = "false";
    if (map != null && map.getNamedItem("stepLevelNum") != null) {
      stepLevel = map.getNamedItem("stepLevelNum").getNodeValue();
    }
    projectObj.put("stepLevelNum", Boolean.parseBoolean(stepLevel));

    String stepTerm = "";
    if (map != null && map.getNamedItem("stepTerm") != null) {
      stepTerm = map.getNamedItem("stepTerm").getNodeValue();
    }
    projectObj.put("stepTerm", stepTerm);
  }

  /**
   * Given a <code>NodeList</code> list of xml project node elements, generates
   * a JSON node object for each element in the list, appends it to the
   * <code>ArrayList<JSONObject></code> and returns the list.
   *
   * @param <code>NodeList</code> nodeList
   * @return <code>ArrayList<JSONObject></code>
   * @throws <code>ServletException</code>
   * @throws <code>JSONException</code>
   */
  public ArrayList<JSONObject> convertProjectNodes(NodeList nodeList) throws ServletException,
      JSONException {
    ArrayList<JSONObject> nodes = new ArrayList<JSONObject>();
    Node xmlNodes = nodeList.item(0);

    if (xmlNodes != null && xmlNodes.hasChildNodes()) {
      NodeList children = xmlNodes.getChildNodes();
      for (int i = 0; i < children.getLength(); i++) {
        if (!children.item(i).getNodeName().equals("#text") &&
            !children.item(i).getNodeName().equals("#comment")) {
          nodes.add(convertProjectNode(children.item(i)));
        }
      }
    }
    return nodes;
  }

  /**
   * Given a <code>NodeList</code> sequence list, creates equivalent JSONObjects as
   * specified in the sequence nodes, appends them to an <code>ArrayList<JSONObject></code>
   * sequences list and returns that list.
   *
   * @param <code>NodeList</code> sequenceList
   * @return <code>ArrayList<JSONObject></code> sequence list
   * @throws <code>JSONException</code>
   */
  public ArrayList<JSONObject> convertProjectSequences(NodeList sequenceList) throws JSONException {
    ArrayList<JSONObject> sequences = new ArrayList<JSONObject>();
    Node xmlSequences = sequenceList.item(0);
    if (xmlSequences != null && xmlSequences.hasChildNodes()) {
      NodeList children = xmlSequences.getChildNodes();
      for (int d = 0; d < children.getLength(); d++) {
        if (!children.item(d).getNodeName().equals("#text") &&
            !children.item(d).getNodeName().equals("#comment")) {
          sequences.add(convertProjectSequence(children.item(d)));
        }
      }
    }
    return sequences;
  }

  /**
   * Given the <code>Node</code> startPointNode and the <code>JSONObject</code> projectObj, gets the startpoint
   * value from the node and sets the field value in the object. Sets an empty string if no value is found or
   * the startPointNode is null.
   *
   * @param <code>Node</code> startPointNode
   * @param <code>JSONObject</code> projectObj
   * @throws <code>JSONException</code>
   */
  public void convertProjectStartPoint(Node startPointNode, JSONObject projectObj)
      throws JSONException{
    String startId = "";
    if (startPointNode != null) {
      NodeList children = startPointNode.getChildNodes();
      for (int q = 0; q < children.getLength(); q++) {
        Node child = children.item(q);
        if (!child.getNodeName().equals("#text") && !child.getNodeName().equals("#comment")) {
          startId = getAttributeValueFromNode(child, "ref");
        }
      }
    }
    projectObj.put("startPoint", startId);
  }

  /**
   * Given a <code>Node</code> project node, converts the xml into a <code>JSONObject</code>
   * and returns that object.
   *
   * @param <code>Node</code> node
   * @return <code>JSONObject</code>
   * @throws <code>ServletException</code>
   * @throws <code>JSONException</code>
   */
  public JSONObject convertProjectNode(Node node) throws ServletException, JSONException {
    JSONObject nodeObj = new JSONObject();
    NamedNodeMap attr = node.getAttributes();

    String type = node.getNodeName();
    if (type != null && type != "") {
      nodeObj.put("type", type);
    } else {
      throw new ServletException("No node type specified, could not parse the xml for the node!");
    }

    String title = "";
    if (attr != null && attr.getNamedItem("title") != null) {
      title = attr.getNamedItem("title").getNodeValue();
    }
    nodeObj.put("title", title);

    String id = "";
    if (attr != null && attr.getNamedItem("identifier") != null) {
      id = attr.getNamedItem("identifier").getNodeValue();
    }
    nodeObj.put("identifier", id);

    String classname = "";
    if (attr != null && attr.getNamedItem("class") != null) {
      classname = attr.getNamedItem("class").getNodeValue();
    }
    nodeObj.put("class", classname);
    nodeObj.put("ref", convertReference(node));
    nodeObj.put("previousWorkNodeIds", convertPreviousWork(node));
    return nodeObj;
  }

  /**
   * Given a <code>Node</code> node, finds the reference element and returns
   * the <code>String</code> value.
   *
   * @param <code>Node</code> node
   * @return <code>String</code> value
   */
  public String convertReference(Node node) {
    NodeList children = node.getChildNodes();
    for (int a = 0; a < children.getLength(); a++) {
      Node currentChild = children.item(a);
      if (currentChild.getNodeName().equals("ref")) {
        NamedNodeMap attr = currentChild.getAttributes();
        if (attr != null && attr.getNamedItem("filename") != null) {
          return attr.getNamedItem("filename").getNodeValue();
        } else {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Given a <code>Node</code>, finds and parses the previousworknode element,
   * returning a <code>ArrayList<String></code> of ids.
   *
   * @param <code>Node</code> node
   * @return <code>ArrayList<String></code> ids
   */
  public ArrayList<String> convertPreviousWork(Node node) {
    ArrayList<String> ids = new ArrayList<String>();
    NodeList children = node.getChildNodes();
    for (int b = 0; b < children.getLength(); b++) {
      Node currentChild = children.item(b);
      if (currentChild.getNodeName().equals("previousworkreferencenodes")) {
        NodeList childNodes = currentChild.getChildNodes();
        for (int c = 0; c < childNodes.getLength(); c++) {
          NamedNodeMap map = childNodes.item(c).getAttributes();
          if (map != null && map.getNamedItem("ref") != null) {
            ids.add(map.getNamedItem("ref").getNodeValue());
          }
        }
      }
    }
    return ids;
  }

  /**
   * Given a <code>Node</code> sequence element, retrieves that attributes and child
   * elements and creates and returns a <code>JSONObject<code> sequence object based
   * on those values.
   *
   * @param <code>Node</code> sequence
   * @return <code>JSONObject</code> sequence object
   * @throws <code>JSONException</code>
   */
  public JSONObject convertProjectSequence(Node sequence) throws JSONException {
    JSONObject seqObj = new JSONObject();
    NamedNodeMap attr = sequence.getAttributes();
    seqObj.put("type", "sequence");

    String title = "";
    if (attr != null && attr.getNamedItem("title") != null) {
      title = attr.getNamedItem("title").getNodeValue();
    }
    seqObj.put("title", title);

    String id = "";
    if (attr != null && attr.getNamedItem("identifier") != null) {
      id = attr.getNamedItem("identifier").getNodeValue();
    }
    seqObj.put("identifier", id);

    String view = "";
    if (attr != null && attr.getNamedItem("view") != null) {
      view = attr.getNamedItem("view").getNodeValue();
    }
    seqObj.put("view", view);

    seqObj.put("refs", convertReferences(sequence.getChildNodes()));
    return seqObj;
  }

  /**
   * Given a <code>NodeList</code> nodes, retrieves that 'ref' attribute
   * value for each node, appends it a <code>ArrayList<String></code> list of
   * id and returns that list.
   *
   * @param <code>NodeList</code> nodes
   * @return <code>ArrayList<String></code> ids
   */
  public ArrayList<String> convertReferences(NodeList nodes) {
    ArrayList<String> ids = new ArrayList<String>();
    for (int e = 0; e < nodes.getLength(); e++) {
      NamedNodeMap map = nodes.item(e).getAttributes();
      if (map != null && map.getNamedItem("ref") != null) {
        ids.add(map.getNamedItem("ref").getNodeValue());
      }
    }
    return ids;
  }

  /**
   * Given a <code>JSONObject</code> node, a <code>File</code> from project folder, and
   * a <code>File</code> the new project folder, retrieves the data from the file specified
   * in the node and converts that node type's content into JSON form. Returns <code>boolean</code>
   * true if the operation is successful, false otherwise.
   *
   * @param node
   * @param fromFolder
   * @param parent
   * @return boolean
   * @throws JSONException
   * @throws IOException
   * @throws ServletException
   */
  private boolean convertNode(JSONObject node, File fromFolder, File parent) throws JSONException,
      IOException, ServletException{
    String ref = node.getString("ref");
    if (ref != null && ref != "" && !ref.equals("null")) {
      File oldFile = new File(fromFolder, ref);
      File newFile = new File(parent, oldFile.getName());

      if (oldFile.exists()) {
        String data = cleanString(FileManager.getFileText(oldFile));
        Type t = null;

        try {
          t = Type.valueOf(node.getString("type"));
        } catch(IllegalArgumentException e) {
          e.printStackTrace();
        }

        if (t != null) {
          switch(t) {
            case HtmlNode: return convertHtmlNode(node, data, newFile);
            case MySystemNode: return convertMySystemNode(node, data, newFile, fromFolder);
            case DrawNode: return convertDrawNode(node, data, newFile);
            case OutsideUrlNode: return convertOutsideUrlNode(node, data, newFile);
            case OpenResponseNode: return convertOpenResponseNode(node, data, newFile);
            case NoteNode: return convertNoteNode(node, data, newFile);
            case BrainstormNode: return convertBrainstormNode(node, data, newFile);
            case DataGraphNode: return convertDataGraphNode(node, data, newFile);
            case FillinNode: return convertFillinNode(node, data, newFile);
            case MatchSequenceNode: return convertMatchSequenceNode(node, data, newFile);
            case MultipleChoiceNode: return convertMultipleChoiceNode(node, data, newFile);
            case BlueJNode: return convertBlueJNode(node, data, newFile);
            default: System.out.println("unknown type " + node.getString("type"));
              return false;
          }
        }
      }
    }
    return false;
  }

  /**
   * Given a <code>JSONObject</code> node, the <code>String</code> xml data and a
   * <code>File</code> the file to write to. Converts the data into the JSON html
   * node format and writes the json to a separate json file and the html to the given file.
   *
   * @param node
   * @param data
   * @param file
   * @return boolean
   * @throws JSONException
   * @throws IOException
   */
  private boolean convertHtmlNode(JSONObject node, String data, File file) throws JSONException,
      IOException {
    JSONObject htmlContent = new JSONObject();
    htmlContent.put("type", "Html");
    String contentFilename = file.getName();
    String jsonFilename = file.getCanonicalPath().replace(".html", ".ht");
    htmlContent.put("src", contentFilename);
    FileManager.writeFile(new File(jsonFilename), htmlContent.toString(3), true);
    FileManager.writeFile(file, data, true);
    return true;
  }

  /**
   * Given a <code>JSONObject</code> node, the <code>String</code> xml data and a
   * <code>File</code> the file to write to. Converts the data into the JSON my system
   * node format and writes the data to the given file.
   *
   * @param node
   * @param data
   * @param file
   * @return boolean
   * @throws JSONException
   * @throws IOException
   */
  private boolean convertMySystemNode(JSONObject node, String data, File file, File fromFolder)
      throws JSONException, IOException{
    JSONObject msContent = Template.getMySystemTemplate();
    String id = node.getString("identifier");
    File modFile = new File(fromFolder, id + "_module.json");
    if (!modFile.exists()) {
      modFile = new File(fromFolder, "modules.json");
    }

    if (modFile.exists()) {
      try {
        String modData = FileManager.getFileText(modFile);
        if (!(modData == null || modData == "" || modData.equals("[]"))) {
          msContent.put("modules", new JSONArray(modData));
        }
      } catch(IOException e) {
        e.printStackTrace();
      }
    }

    Pattern p = Pattern.compile("<div style=\"font-size: 150%; padding: 5px 5px 5px 10px;\">[\\S\\s]*</div>");
    Matcher m = p.matcher(data);

    if (m.find()) {
      msContent.put("prompt", m.group());
    }
    FileManager.writeFile(new File(file.getAbsolutePath().replace(".html", ".my")), msContent.toString(3), true);
    return true;
  }

  /**
   * Given a <code>JSONObject</code> node, the <code>String</code> xml data and a
   * <code>File</code> the file to write to. Converts the data into the JSON drawing
   * node format and writes the data to the given file.
   *
   * @param node
   * @param data
   * @param file
   * @return boolean
   * @throws JSONException
   * @throws IOException
   */
  private boolean convertDrawNode(JSONObject node, String data, File file) throws JSONException,
      IOException {
    JSONObject htmlContent = new JSONObject();
    htmlContent.put("type", "Draw");
    String contentFilename = file.getName();
    String jsonFilename = file.getCanonicalPath().replace(".html", ".ht");
    htmlContent.put("src", contentFilename);
    FileManager.writeFile(new File(jsonFilename), htmlContent.toString(3), true);
    FileManager.writeFile(file, data, true);
    return true;
  }

  /**
   * Given a <code>JSONObject</code> node, the <code>String</code> xml data and a
   * <code>File</code> the file to write to. Converts the data into the JSON outside url
   * node format and writes the data to the given file.
   *
   * @param node
   * @param data
   * @param file
   * @return boolean
   * @throws JSONException
   * @throws IOException
   * @throws ServletException
   */
  private boolean convertOutsideUrlNode(JSONObject node, String data, File file)
      throws JSONException, IOException {
    JSONObject urlContent = new JSONObject();
    try {
      Document doc = getDOMDocumentFromString(data);
      NodeList nodes = doc.getElementsByTagName("url");
      if (nodes.getLength()>0) {
        Node urlElement = nodes.item(0);
        urlContent.put("url", urlElement.getFirstChild().getNodeValue());
      } else {
        urlContent.put("url", "");
      }
      urlContent.put("type", "OutsideUrl");
      FileManager.writeFile(file, urlContent.toString(3), true);
      return true;
    } catch(ServletException e) {
      return false;
    }
  }

  /**
   * Given a <code>JSONObject</code> node, the <code>String</code> xml data and a
   * <code>File</code> the file to write to. Converts the data into the JSON open reponse
   * node format and writes the data to the given file.
   *
   * @param node
   * @param data
   * @param file
   * @return boolean
   * @throws JSONException
   * @throws ServletException
   * @throws IOException
   */
  private boolean convertOpenResponseNode(JSONObject node, String data, File file)
      throws JSONException, IOException {
    JSONObject orContent = Template.getOpenResponseTemplate();
    try {
      Document doc = getDOMDocumentFromString(data);
      String val = getAttributeValueFromNode(getSingleElementByTagName(doc, "OpenResponse"),
          "isRichTextEditorAllowed");
      if (val != null) {
        orContent.put("isRichTextEditorAllowed", Boolean.parseBoolean(val));
      } else {
        orContent.put("isRichTextEditorAllowed", false);
      }

      Node interactionNode = getSingleElementByTagName(doc, "extendedTextInteraction");
      Node promptNode = getSingleElementByTagName(doc, "prompt");
      JSONObject interaction = orContent.getJSONObject("assessmentItem").getJSONObject("interaction");
      String hasInlineFeedback = getAttributeValueFromNode(interactionNode, "hasInlineFeedback");
      if (hasInlineFeedback != null) {
        interaction.put("hasInlineFeedback", Boolean.valueOf(hasInlineFeedback));
      }
      String expectedLines = getAttributeValueFromNode(interactionNode, "expectedLines");
      if (expectedLines != null) {
        interaction.put("expectedLines", expectedLines);
      }
      if (promptNode.getFirstChild() != null) {
        String prompt = promptNode.getFirstChild().getNodeValue();
        if (prompt != null) {
          interaction.put("prompt", deentitizeHtml(cleanString(prompt)));
        }
      }
      Node starterNode = getSingleElementByTagName(doc, "starterSentence");
      JSONObject starterSentence = orContent.getJSONObject("starterSentence");
      if (starterNode != null) {
        String display = getAttributeValueFromNode(starterNode, "displayOption");
        if (display != null) {
          starterSentence.put("display", display);
        }

        if (starterNode.getFirstChild() != null) {
          String sentence = starterNode.getFirstChild().getNodeValue();
          if (sentence != null) {
            starterSentence.put("sentence", cleanString(sentence));
          }
        }
      }

      FileManager.writeFile(file, orContent.toString(3), true);
      return true;
    } catch(ServletException e) {
      return false;
    }
  }

  /**
   * Given a <code>JSONObject</code> node, the <code>String</code> xml data and a
   * <code>File</code> the file to write to. Converts the data into the JSON note
   * node format and writes the data to the given file.
   *
   * @param node
   * @param data
   * @param file
   * @return boolean
   * @throws JSONException
   * @throws ServletException
   * @throws IOException
   */
  private boolean convertNoteNode(JSONObject node, String data, File file)
      throws JSONException, IOException {
    JSONObject orContent = Template.getNoteTemplate();
    try {
      Document doc = getDOMDocumentFromString(data);
      String val = getAttributeValueFromNode(getSingleElementByTagName(doc, "Note"),
          "isRichTextEditorAllowed");
      if (val != null) {
        orContent.put("isRichTextEditorAllowed", Boolean.parseBoolean(val));
      } else {
        orContent.put("isRichTextEditorAllowed", false);
      }

      Node interactionNode = getSingleElementByTagName(doc, "extendedTextInteraction");
      Node promptNode = getSingleElementByTagName(doc, "prompt");
      JSONObject interaction = orContent.getJSONObject("assessmentItem").getJSONObject("interaction");
      String hasInlineFeedback = getAttributeValueFromNode(interactionNode, "hasInlineFeedback");
      if (hasInlineFeedback != null) {
        interaction.put("hasInlineFeedback", Boolean.valueOf(hasInlineFeedback));
      }

      String expectedLines = getAttributeValueFromNode(interactionNode, "expectedLines");
      if (expectedLines != null) {
        interaction.put("expectedLines", expectedLines);
      }

      if (promptNode != null && promptNode.getFirstChild() != null) {
        String prompt = promptNode.getFirstChild().getNodeValue();
        if (prompt != null) {
          interaction.put("prompt", deentitizeHtml(cleanString(prompt)));
        }
      }

      Node starterNode = getSingleElementByTagName(doc, "starterSentence");
      JSONObject starterSentence = orContent.getJSONObject("starterSentence");

      if (starterNode != null) {
        String display = getAttributeValueFromNode(starterNode, "displayOption");
        if (display != null) {
          starterSentence.put("display", display);
        }

        if (starterNode.getFirstChild() != null) {
          String sentence = starterNode.getFirstChild().getNodeValue();
          if (sentence != null) {
            starterSentence.put("sentence", cleanString(sentence));
          }
        }
      }

      FileManager.writeFile(file, orContent.toString(3), true);
      return true;
    } catch(ServletException e) {
      return false;
    }
  }

  /**
   * Given a <code>JSONObject</code> node, the <code>String</code> xml data and a
   * <code>File</code> the file to write to. Converts the data into the JSON note
   * node format and writes the data to the given file.
   *
   * @param node
   * @param data
   * @param file
   * @return boolean
   * @throws JSONException
   * @throws ServletException
   * @throws IOException
   */
  private boolean convertBrainstormNode(JSONObject node, String data, File file)
      throws JSONException, IOException {
    JSONObject bContent = Template.getBrainstormTemplate();
    try {
      Document doc = getDOMDocumentFromString(data);
      Node bElement = getSingleElementByTagName(doc, "Brainstorm");
      String val = getAttributeValueFromNode(bElement, "isRichTextEditorAllowed");
      if (val != null) {
        bContent.put("isRichTextEditorAllowed", Boolean.parseBoolean(val));
      } else {
        bContent.put("isRichTextEditorAllowed", false);
      }

      val = getAttributeValueFromNode(bElement, "title");
      if (val != null) {
        bContent.put("title", val);
      }

      val = getAttributeValueFromNode(bElement, "isGated");
      if (val != null) {
        bContent.put("isGated", Boolean.parseBoolean(val));
      }

      val = getAttributeValueFromNode(bElement, "displayName");
      if (val != null) {
        bContent.put("displayName", val);
      }

      val = getAttributeValueFromNode(bElement, "isPollEnded");
      if (val != null) {
        bContent.put("isPollEnded", Boolean.parseBoolean(val));
      }

      val = getAttributeValueFromNode(bElement, "isInstantPollActive");
      if (val != null) {
        bContent.put("isInstantPollActive", Boolean.parseBoolean(val));
      }

      val = getAttributeValueFromNode(bElement, "useServer");
      if (val != null) {
        bContent.put("useServer", Boolean.parseBoolean(val));
      }

      Node interactionNode = getSingleElementByTagName(doc, "extendedTextInteraction");
      Node promptNode = getSingleElementByTagName(doc, "prompt");
      JSONObject interaction = bContent.getJSONObject("assessmentItem").getJSONObject("interaction");

      String expectedLines = getAttributeValueFromNode(interactionNode, "expectedLines");
      if (expectedLines != null) {
        interaction.put("expectedLines", expectedLines);
      }

      if (promptNode != null && promptNode.getFirstChild() != null) {
        String prompt = promptNode.getFirstChild().getNodeValue();
        if (prompt != null) {
          interaction.put("prompt", cleanString(prompt));
        }
      }

      NodeList responseNodes = doc.getElementsByTagName("response");
      JSONArray responses = bContent.getJSONArray("cannedResponses");
      for (int p = 0; p < responseNodes.getLength(); p++) {
        Node currentNode = responseNodes.item(p);
        if (!currentNode.getNodeName().equals("#text") && !currentNode.getNodeName().equals("#comment")) {
          JSONObject response = new JSONObject();
          response.put("name", getAttributeValueFromNode(currentNode, "name"));
          if (currentNode.hasChildNodes()) {
            response.put("response", cleanString(currentNode.getFirstChild().getNodeValue()));
          }
          responses.put(response);
        }
      }

      Node starterNode = getSingleElementByTagName(doc, "starterSentence");
      JSONObject starterSentence = bContent.getJSONObject("starterSentence");
      if (starterNode != null) {
        String display = getAttributeValueFromNode(starterNode, "displayOption");
        if (display != null) {
          starterSentence.put("display", display);
        }

        if (starterNode.getFirstChild() != null) {
          String sentence = starterNode.getFirstChild().getNodeValue();
          if (sentence != null) {
            starterSentence.put("sentence", cleanString(sentence));
          }
        }
      }

      FileManager.writeFile(file, bContent.toString(3), true);
      return true;
    } catch(ServletException e) {
      return false;
    }
  }

  /**
   * Given a <code>JSONObject</code> node, the <code>String</code> xml data and a
   * <code>File</code> the file to write to. Converts the data into the JSON note
   * node format and writes the data to the given file.
   *
   * @param node
   * @param data
   * @param file
   * @return boolean
   * @throws JSONException
   * @throws ServletException
   * @throws IOException
   */
  private boolean convertDataGraphNode(JSONObject node, String data, File file)
      throws JSONException, IOException {
    JSONObject dContent = Template.getDataGraphTemplate();
    try {
      Document doc = getDOMDocumentFromString(data);
      dContent.put("prompt", cleanString(getSingleElementByTagName(doc, "prompt").getFirstChild().getNodeValue()));

      Node displayOptions = getSingleElementByTagName(doc, "display");
      Node graphOptions = getSingleElementByTagName(doc, "graphOptions");
      JSONObject dcDisplayOptions = dContent.getJSONObject("options").getJSONObject("display");
      JSONObject dcGraphOptions = dContent.getJSONObject("options").getJSONObject("graph");

      String val = getAttributeValueFromNode(displayOptions, "which");
      if (val != null) {
        dcDisplayOptions.put("which", val);
      }

      val = getAttributeValueFromNode(displayOptions, "start");
      if (val != null) {
        dcDisplayOptions.put("start", val);
      }

      val = getAttributeValueFromNode(graphOptions, "range");
      if (val != null) {
        dcGraphOptions.put("range", Boolean.parseBoolean(val));
      }

      val = getAttributeValueFromNode(graphOptions, "bar");
      if (val != null) {
        dcGraphOptions.put("bar", Boolean.parseBoolean(val));
      }

      val = getAttributeValueFromNode(graphOptions, "line");
      if (val != null) {
        dcGraphOptions.put("line", Boolean.valueOf(val));
      }

      val = getAttributeValueFromNode(graphOptions, "point");
      if (val != null) {
        dcGraphOptions.put("point", Boolean.valueOf(val));
      }

      val = getAttributeValueFromNode(graphOptions, "linePoint");
      if (val != null) {
        dcGraphOptions.put("linePoint", Boolean.valueOf(val));
      }

      val = getSingleElementByTagName(doc, "title").getFirstChild().getNodeValue();
      if (val != null) {
        dContent.getJSONObject("table").put("title", cleanString(val));
      }

      val = getAttributeValueFromNode(getSingleElementByTagName(doc, "title"), "editable");
      if (val != null) {
        dContent.getJSONObject("table").put("titleEditable", Boolean.parseBoolean(val));
      }

      Node ind = getSingleElementByTagName(doc, "independent");
      if (ind != null) {
        JSONObject dInd = new JSONObject();
        String label = getAttributeValueFromNode(ind, "label");
        if (label != null) {
          dInd.put("label", label);
        }

        String editable = getAttributeValueFromNode(ind, "editable");
        if (editable != null) {
          dInd.put("editable", Boolean.parseBoolean(editable));
        }
        dContent.getJSONObject("table").put("independent", dInd);
      }

      NodeList cols = doc.getElementsByTagName("col");
      JSONArray colsArray =  dContent.getJSONObject("table").getJSONArray("cols");
      for (int y = 0; y < cols.getLength(); y++) {
        JSONObject currentCol = new JSONObject();
        String label = getAttributeValueFromNode(cols.item(y), "label");
        if (label != null) {
          currentCol.put("label", label);
        }

        String editable = getAttributeValueFromNode(cols.item(y), "editable");
        if (editable != null) {
          currentCol.put("editable", Boolean.parseBoolean(editable));
        }
        colsArray.put(currentCol);
      }

      NodeList rows = doc.getElementsByTagName("row");
      JSONArray rowsArray = dContent.getJSONObject("table").getJSONArray("rows");
      for (int x = 0; x < rows.getLength(); x++) {
        JSONObject currentRow = new JSONObject();
        String label = getAttributeValueFromNode(rows.item(x), "label");
        if (label != null) {
          currentRow.put("label", label);
        }

        String editable = getAttributeValueFromNode(rows.item(x), "editable");
        if (editable != null) {
          currentRow.put("editable", Boolean.parseBoolean(editable));
        }

        JSONArray cells = new JSONArray();
        NodeList nCells = rows.item(x).getChildNodes();
        for (int z = 0; z < nCells.getLength(); z++) {
          JSONObject cell = new JSONObject();

          String cellEditable = getAttributeValueFromNode(nCells.item(z), "editable");
          if (editable != null) {
            cell.put("editable", Boolean.parseBoolean(cellEditable));
          }

          if (nCells.item(z).hasChildNodes()) {
            cell.put("value", nCells.item(z).getFirstChild().getNodeValue());
          }

          cells.put(cell);
        }

        currentRow.put("cells", cells);
        rowsArray.put(currentRow);
      }

      FileManager.writeFile(file, dContent.toString(3), true);
      return true;
    } catch(ServletException e) {
      return false;
    }
  }

  /**
   * Given a <code>JSONObject</code> node, the <code>String</code> xml data and a
   * <code>File</code> the file to write to. Converts the data into the JSON fillin
   * node format and writes the data to the given file.
   *
   * @param node
   * @param data
   * @param file
   * @return boolean
   * @throws JSONException
   * @throws ServletException
   * @throws IOException
   */
  private boolean convertFillinNode(JSONObject node, String data, File file)
      throws JSONException, IOException {
    JSONObject fContent = Template.getFillinTemplate();
    try {
      Document doc = getDOMDocumentFromString(data);

      JSONArray interaction = fContent.getJSONObject("assessmentItem").getJSONArray("interaction");
      NodeList interactions = getSingleElementByTagName(doc, "itemBody").getChildNodes();
      for (int t = 0; t < interactions.getLength(); t++) {
        Node currentNode = interactions.item(t);
        if (currentNode.getNodeName().equals("htmltext")) {
          JSONObject currentObj = new JSONObject();
          currentObj.put("type", "htmltext");
          if (currentNode.getFirstChild() != null) {
            currentObj.put("text", cleanString(currentNode.getFirstChild().getNodeValue()));
            interaction.put(currentObj);
          }
        } else if (currentNode.getNodeName().equals("textEntryInteraction")) {
          JSONObject currentObj = new JSONObject();
          currentObj.put("type", "textEntryInteraction");
          currentObj.put("responseIdentifier", getAttributeValueFromNode(currentNode, "responseIdentifier"));
          currentObj.put("expectedLength", getAttributeValueFromNode(currentNode, "expectedLength"));
          interaction.put(currentObj);
        }
      }

      JSONArray responseDeclarations = fContent.getJSONObject("assessmentItem").getJSONArray("responseDeclarations");
      NodeList declarations = doc.getElementsByTagName("responseDeclaration");
      for (int u = 0; u < declarations.getLength(); u++) {
        Node currentNode = declarations.item(u);
        JSONObject currentObj = new JSONObject();
        JSONArray allowed = new JSONArray();
        NodeList mapEntries = currentNode.getChildNodes().item(1).getChildNodes();
        for (int k = 0; k < mapEntries.getLength(); k++) {
          JSONObject allowable = new JSONObject();
          allowable.put("response", getAttributeValueFromNode(mapEntries.item(k), "mapKey"));
          allowable.put("value", getAttributeValueFromNode(mapEntries.item(k), "mappedValue"));
          allowed.put(allowable);
        }
        currentObj.put("identifier", getAttributeValueFromNode(currentNode, "identifier"));
        currentObj.put("correctResponses", allowed);
        responseDeclarations.put(currentObj);
      }

      Node custom = getSingleElementByTagName(doc, "customCheck");
      if (custom != null) {
        fContent.put("customCheck", custom.getFirstChild().getNodeValue());
      };

      FileManager.writeFile(file, fContent.toString(3), true);
      return true;
    } catch(ServletException e) {
      return false;
    }
  }

  /**
   * Given a <code>JSONObject</code> node, the <code>String</code> xml data and a
   * <code>File</code> the file to write to. Converts the data into the JSON match sequence
   * node format and writes the data to the given file.
   *
   * @param node
   * @param data
   * @param file
   * @return boolean
   * @throws JSONException
   * @throws ServletException
   * @throws IOException
   */
  private boolean convertMatchSequenceNode(JSONObject node, String data, File file)
      throws JSONException, IOException {
    JSONObject mContent = Template.getMatchSequenceTemplate();
    try {
      Document doc = getDOMDocumentFromString(data);

      JSONArray responses = mContent.getJSONObject("assessmentItem").getJSONObject("responseDeclaration").getJSONArray("correctResponses");
      Node correct = getSingleElementByTagName(doc, "correctResponse");
      NodeList valNodes = null;
      if (correct != null && correct.hasChildNodes()) {
        valNodes = correct.getChildNodes();
        for (int v = 0; v < valNodes.getLength(); v++) {
          Node currentVal = valNodes.item(v);
          if (!currentVal.getNodeName().equals("#text") && !currentVal.getNodeName().equals("#comment")) {
            JSONObject currentCorrect = new JSONObject();
            currentCorrect.put("isDefault", Boolean.valueOf(getAttributeValueFromNode(currentVal, "isDefault")));
            currentCorrect.put("isCorrect", Boolean.valueOf(getAttributeValueFromNode(currentVal, "isCorrect")));
            currentCorrect.put("choiceIdentifier", getAttributeValueFromNode(currentVal, "choiceIdentifier"));
            currentCorrect.put("fieldIdentifier", getAttributeValueFromNode(currentVal, "fieldIdentifier"));
            currentCorrect.put("order", getAttributeValueFromNode(currentVal, "order"));

            if (currentVal.getFirstChild() != null) {
              currentCorrect.put("feedback", cleanString(currentVal.getFirstChild().getNodeValue()));
            } else {
              currentCorrect.put("feedback", "");
            }
            responses.put(currentCorrect);
          }
        }
      }

      JSONObject interaction = mContent.getJSONObject("assessmentItem").getJSONObject("interaction");
      Node gapInteraction = getSingleElementByTagName(doc, "gapMatchInteraction");
      if (gapInteraction != null) {
        String feedback = getAttributeValueFromNode(gapInteraction, "hasInlineFeedback");
        if (feedback != null) {
          interaction.put("hasInlineFeedback", Boolean.valueOf(feedback));
        }

        String shuffle = getAttributeValueFromNode(gapInteraction, "shuffle");
        if (shuffle != null) {
          interaction.put("shuffle", Boolean.valueOf(shuffle));
        }

        String ordered = getAttributeValueFromNode(gapInteraction, "ordered");
        if (ordered != null) {
          interaction.put("ordered", Boolean.valueOf(ordered));
        }
      }

      Node prompt = getSingleElementByTagName(doc, "prompt");
      if (prompt != null && prompt.hasChildNodes()) {
        interaction.put("prompt", cleanString(prompt.getFirstChild().getNodeValue()));
      }

      JSONArray fields = interaction.getJSONArray("fields");
      NodeList gapMultiples = doc.getElementsByTagName("gapMultiple");
      for (int b = 0; b < gapMultiples.getLength(); b++) {
        Node currentGap = gapMultiples.item(b);
        JSONObject currentField = new JSONObject();
        String identifier = getAttributeValueFromNode(currentGap, "identifier");
        currentField.put("identifier", identifier);

        String ordinal = getAttributeValueFromNode(currentGap, "ordinal");
        currentField.put("ordinal", ordinal);

        String numberOfEntries = getAttributeValueFromNode(currentGap, "numberOfEntries");
        currentField.put("numberOfEntries", numberOfEntries);

        if (currentGap.hasChildNodes()) {
          currentField.put("name", currentGap.getFirstChild().getNodeValue());
        } else {
          currentField.put("name", "");
        }
        fields.put(currentField);
      }

      JSONArray choices = interaction.getJSONArray("choices");
      NodeList gaps = doc.getElementsByTagName("gapText");
      for (int n = 0; n < gaps.getLength(); n++) {
        Node currentGap = gaps.item(n);
        JSONObject currentChoice = new JSONObject();
        String identifier = getAttributeValueFromNode(currentGap, "identifier");
        currentChoice.put("identifier", identifier);

        String max = getAttributeValueFromNode(currentGap, "matchMax");
        if (max != null) {
          currentChoice.put("matchMax", max);
        }

        if (currentGap.hasChildNodes()) {
          currentChoice.put("value", cleanString(currentGap.getFirstChild().getNodeValue()));
        }
        choices.put(currentChoice);
      }
      FileManager.writeFile(file, mContent.toString(3), true);
      return true;
    } catch(ServletException e) {
      return false;
    }
  }

  /**
   * Given a <code>JSONObject</code> node, the <code>String</code> xml data and a
   * <code>File</code> the file to write to. Converts the data into the JSON multiple choice
   * node format and writes the data to the given file.
   *
   * @param node
   * @param data
   * @param file
   * @return boolean
   * @throws JSONException
   * @throws ServletException
   * @throws IOException
   */
  private boolean convertMultipleChoiceNode(JSONObject node, String data, File file)
      throws JSONException, IOException {
    JSONObject mContent = Template.getMultipleChoiceTemplate("MultipleChoice");
    try {
      Document doc = getDOMDocumentFromString(data);

      JSONArray correctResponse = mContent.getJSONObject("assessmentItem")
          .getJSONObject("responseDeclaration").getJSONArray("correctResponse");
      if (getSingleElementByTagName(doc, "correctResponse") != null) {
        NodeList vals = getSingleElementByTagName(doc, "correctResponse").getChildNodes();
        for (int g = 0; g < vals.getLength(); g++) {
          if (!vals.item(g).getNodeName().equals("#text") &&
              !vals.item(g).getNodeName().equals("#comment")) {
            correctResponse.put(cleanString(vals.item(g).getFirstChild().getNodeValue()));
          }
        }
      }

      JSONObject interaction = mContent.getJSONObject("assessmentItem").getJSONObject("interaction");
      Node choiceInteraction = getSingleElementByTagName(doc, "choiceInteraction");
      String hasInlineFeedback = getAttributeValueFromNode(choiceInteraction, "hasInlineFeedback");
      if (hasInlineFeedback != null) {
        interaction.put("hasInlineFeedback", Boolean.valueOf(hasInlineFeedback));
      }

      String max = getAttributeValueFromNode(choiceInteraction, "maxChoices");
      if (max != null) {
        interaction.put("maxChoices", max);
      }

      String shuffle = getAttributeValueFromNode(choiceInteraction, "shuffle");
      if (shuffle != null) {
        interaction.put("shuffle", Boolean.valueOf(shuffle));
      }

      Node prompt = getSingleElementByTagName(doc, "prompt");
      if (prompt != null && prompt.hasChildNodes()) {
        interaction.put("prompt", cleanString(prompt.getFirstChild().getNodeValue()));
      }

      JSONArray choices = interaction.getJSONArray("choices");
      NodeList simpleChoices = doc.getElementsByTagName("simpleChoice");
      for (int m = 0; m < simpleChoices.getLength(); m++) {
        JSONObject currentChoice = new JSONObject();
        Node currentSC = simpleChoices.item(m);
        String id = getAttributeValueFromNode(currentSC, "identifier");
        if (id != null) {
          currentChoice.put("identifier", id);
        } else {
          currentChoice.put("identifier", "");
        }

        if (interaction.getBoolean("hasInlineFeedback")) {
          NodeList nodes = doc.getElementsByTagName("feedbackInline");
          currentChoice.put("feedback", "");
          for (int c = 0; c < nodes.getLength(); c++) {
            String feedbackId = getAttributeValueFromNode(nodes.item(c), "identifier");
            if (feedbackId != null && currentChoice.getString("identifier").equals(feedbackId)
                && nodes.item(c).getFirstChild() != null) {
              currentChoice.put("feedback",
                  cleanString(nodes.item(c).getFirstChild().getNodeValue()));
            }
          }
        }

        NodeList children = currentSC.getChildNodes();
        currentChoice.put("text","");
        for (int x = 0; x < children.getLength(); x++) {
          Node childNode = children.item(x);
          if (childNode.getNodeName().equals("#text")) {
            currentChoice.put("text", cleanString(childNode.getNodeValue()));
          }
        }
        currentChoice.put("fixed", true);
        choices.put(currentChoice);
      }

      FileManager.writeFile(file, mContent.toString(3), true);
      return true;
    } catch(ServletException e) {
      return false;
    }
  }

  /**
   * Given a <code>JSONObject</code> node, the <code>String</code> xml data and a
   * <code>File</code> the file to write to. Converts the data into the JSON glue
   * node format and writes the data to the given file.
   *
   * @param node
   * @param data
   * @param file
   * @return boolean
   * @throws JSONException
   * @throws ServletException
   * @throws IOException
   */
  private boolean convertBlueJNode(JSONObject node, String data, File file)
      throws JSONException, ServletException, IOException {
    JSONObject bContent = new JSONObject();
    Document doc = getDOMDocumentFromString(data);
    bContent.put("type", "Html");

    file = new File(file.getCanonicalPath().replace(".bluej", ".html"));
    String contentFilename = file.getName();
    String jsonFilename = file.getCanonicalPath().replace(".html", ".ht");

    bContent.put("src", contentFilename);

    Node path = getSingleElementByTagName(doc, "projectPath");
    if (path != null && path.hasChildNodes()) {
      bContent.put("blueJProjectPath", cleanString(path.getFirstChild().getNodeValue()));
    }

    String htmlContent = "";
    Node content = getSingleElementByTagName(doc, "content");
    if (content != null && content.hasChildNodes()) {
      htmlContent = content.getFirstChild().getNodeValue();
    }

    FileManager.writeFile(new File(jsonFilename), bContent.toString(3), true);
    FileManager.writeFile(file, htmlContent, true);
    return true;
  }

  /**
   * Given an xml <code>Node</code> node element and the <code>String</code> attribute
   * name, returns the value of the attribute in the node if it exists, returns <code>null</code>
   * otherwise.
   *
   * @param node
   * @param attr
   * @return String
   */
  private String getAttributeValueFromNode(Node node, String attr) {
    if (node != null) {
      NamedNodeMap map = node.getAttributes();
      if (map != null && map.getLength()>0) {
        if (map.getNamedItem(attr) != null) {
          return map.getNamedItem(attr).getNodeValue();
        }
      }
    }
    return null;
  }

  /**
   * Given a <code>Document</code> xml document and a <code>String</code> name,
   * Returns the first <code>Node</code> found in the document with that name if
   * one exists, returns null otherwise.
   *
   * @param doc
   * @param name
   * @return Node
   */
  private Node getSingleElementByTagName(Document doc, String name) {
    NodeList nodes = doc.getElementsByTagName(name);
    if (nodes != null && nodes.getLength() > 0 && nodes.item(0) != null) {
      return nodes.item(0);
    } else {
      return null;
    }
  }

  /**
   * Creates and returns a new DOM Document with the given xml String parsed.
   * Throws Servlet Exception if creation fails.
   *
   * @param xml string
   * @return dom document
   * @throws ServletException
   */
  public Document getDOMDocumentFromString(String xml) throws ServletException {
    try {
      xml = convertAmp(xml);
      InputStream is = new ByteArrayInputStream(xml.getBytes());
      DocumentBuilder builder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
      Document doc = builder.parse(is);
      return doc;
    } catch (ParserConfigurationException e) {
      throw new ServletException(e);
    } catch (SAXException e) {
      throw new ServletException(e);
    } catch (IOException e) {
      throw new ServletException(e);
    }
  }

  /**
   * Creates and returns a new DOM Document parsing the document at the given uri.
   * Throws Servlet Exception if creation fails.
   *
   * @param <code>String</code> uri
   * @return <code>Document</code> dom document
   * @throws <code>ServletException</code>
   */
  public Document getDOMDocumentFromURI(String uri) throws ServletException {
    try {
      DocumentBuilder builder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
      Document doc = builder.parse(uri);
      return doc;
    } catch(ParserConfigurationException e) {
      throw new ServletException(e);
    } catch (SAXException e) {
      throw new ServletException(e);
    } catch (IOException e) {
      throw new ServletException(e);
    }
  }

  /**
   * Given a <code>String</code> str, returns the string with any & replaced with &amp;
   */
  private String convertAmp(String str) {
    return str.replaceAll("&", "&amp;");
  }

  /**
   * Given a <code>String</code> string, trims the string and replaces certain encoded elements
   * with their correct value.
   *
   * @param String
   * @return String
   */
  private String cleanString(String str) {
    str = str.trim();
    str = str.replaceAll("&nbsp;", " ");
    str = str.replaceAll("\t", " ");
    str = str.replaceAll("\r", " ");
    str = str.replaceAll("\n", " ");
    str = str.replaceAll("\f", " ");
    str = str.replaceAll(" +", " ");
    return str;
  }

  private String deentitizeHtml(String str) {
    str = str.replaceAll("&lt;", "<");
    str = str.replaceAll("&gt;", ">");
    str = str.replaceAll("&amp;", "&");
    str = str.replaceAll("&quot;","\"");
    str = str.replaceAll("&nbsp;", " ");
    return str;
  }
}
