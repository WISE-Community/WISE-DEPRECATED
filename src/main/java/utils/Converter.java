package utils;

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
import org.w3c.dom.NodeList;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

/**
 * The Converter servlet handles converting xml to JSON objects for projects
 * and node content.
 * 
 * @author patrick lawler
 */
public class Converter extends HttpServlet implements Servlet{
	static final long serialVersionUID = 1L;
	
	private FileManager fileManager;
	 
	private boolean standAlone = true;
	
	private boolean modeRetrieved = false;
	
	public Converter(){
		super();
		fileManager = new FileManager();
	}
	
	/**
	 * Node types
	 */
	private enum Type {HtmlNode, OpenResponseNode, NoteNode, BrainstormNode, BlueJNode, DataGraphNode, DrawNode,
		FillinNode, FlashNode, MatchSequenceNode, MultipleChoiceNode, MySystemNode, OutsideUrlNode};
	
	/**
	 * @see javax.servlet.http.HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException{
		this.doPost(request, response);
	}
	
	/**
	 * @see javax.servlet.http.HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException{
		if(!this.modeRetrieved){
			this.standAlone = !SecurityUtils.isPortalMode(request);
			this.modeRetrieved = true;
		}
		
		if(this.standAlone || SecurityUtils.isAuthenticated(request)){
			this.doRequest(request, response);
		} else {
			/* send not authorized status */
			try{
				response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
			} catch(IOException e){
				e.printStackTrace();
				return;
			}
		}
	}
	
	private void doRequest(HttpServletRequest request, HttpServletResponse response) throws IOException{
		String command = request.getParameter("command");
		
		if(command.equals("convertXMLProject")){
			this.convertXMLProject(request, response);
		} else if(command.equals("convertXMLProjectString")){
			this.convertXMLProjectString(request, response);
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
	public void convertXMLProjectString(HttpServletRequest request, HttpServletResponse response) throws IOException{
		String xml = request.getParameter("xml");
		try{
			JSONObject project = this.convertProjectDocToJSONObject(this.getDOMDocumentFromString(xml));
			response.getWriter().write(project.toString(3));
		} catch(JSONException e){
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
		} catch(ServletException e){
			e.printStackTrace();
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
		} catch(IOException e){
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
	public void convertXMLProject(HttpServletRequest request, HttpServletResponse response) throws IOException{
		String path = request.getParameter("path");
		if(path != null && path != ""){
			if(this.standAlone || SecurityUtils.isAllowedAccess(request, path)){
				try {
					/* convert the xml to json object */
					JSONObject project = this.convertProjectDocToJSONObject(this.getDOMDocumentFromString(this.fileManager.getFileText(new File(path))));
					
					/* create copy folder and new project file */
					File copyFolder = this.createCopyFolder(path);
					String newProjectName = new File(path.replace(".xml", ".json")).getName();
					
					/* write new project file */
					File newProjectFile = new File(copyFolder, newProjectName);
					this.fileManager.writeFile(newProjectFile, project.toString(3), true);
					
					/* copy any existing directories from the existing project folder (assets, audio, etc) */
					File old_dir = new File(path).getParentFile();
					File new_dir = newProjectFile.getParentFile();
					if(old_dir.exists() && old_dir.isDirectory()){
						String files[] = old_dir.list();
						for(String file : files){
							File currentFile = new File(old_dir, file);
							if(currentFile.isDirectory()){
								File createdDir = new File(new_dir, currentFile.getName());
								if(!createdDir.exists()){
									createdDir.mkdir();
								}
								this.fileManager.copy(currentFile, createdDir);
							}
						}
					}
					
					/* copy the two project meta files if they exist */
					String rootTodoName = newProjectName.replace(".project.json", ".todo.txt");
					String rootMetaName = newProjectName.replace(".project.json", ".project-meta.json");
					File todoFile = new File(old_dir, rootTodoName);
					File metaFile = new File(old_dir, rootMetaName);
					if(todoFile.exists()){
						this.fileManager.copy(todoFile, new File(new_dir, rootTodoName));
					}
					if(metaFile.exists()){
						this.fileManager.copy(metaFile, new File(new_dir, rootMetaName));
					}
					
					/* convert each node's content file to JSON */
					JSONArray nodes = project.getJSONArray("nodes");
					String failMsg = "Project successfully converted but converting the following node(s) failed:";
					boolean failed = false;
					for(int r=0;r<nodes.length();r++){
						JSONObject currentNode = nodes.getJSONObject(r);
						if(!this.convertNode(currentNode, new File(path).getParentFile(), copyFolder)){
							failMsg += " " + currentNode.getString("identifier");
							failed = true;
						} else {
							/* if type is a my system node, we need to change the reference to the file */
							if(currentNode.getString("type").equals("MySystemNode")){
								currentNode.put("ref", currentNode.getString("ref").replace(".html", ".my"));
							}
							
							/* change ref for html node types (Html, Draw) */
							currentNode.put("ref", currentNode.getString("ref").replace(".html", ".ht"));
							
							/* if type is BlueJ, change it to html and change ref */
							if(currentNode.getString("type").equals("BlueJNode")){
								currentNode.put("ref", currentNode.getString("ref").replace(".bluej", ".ht"));
								currentNode.put("type", "HtmlNode");
							}
						}
					}
					
					/* rewrite project file with html conversion updates */
					this.fileManager.writeFile(newProjectFile, project.toString(3), true);
					
					if(failed){
						response.getWriter().write(failMsg);
					} else {
						response.getWriter().write("Successfully converted the xml project to JSON. The new project path is: " + newProjectFile.getCanonicalPath());
					}
				} catch (JSONException e) {
					e.printStackTrace();
					response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				} catch (ServletException e){
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
	private File createCopyFolder(String path) throws IOException{
		File og = new File(path);
		if(og.exists() && og.isFile()){
			File newFolder = new File(og.getParentFile().getParentFile(), og.getParentFile().getName() + "_JSON_Converted");
			if(!newFolder.exists()){
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
	public JSONObject convertProjectDocToJSONObject(Document doc) throws ServletException, JSONException{
		NodeList list = doc.getElementsByTagName("project");
		Node project = null;
		JSONObject projectObj = new JSONObject();
		
		/* Check to make sure project tag specified in xml */
		if(list.getLength()<1){
			throw new ServletException("Could not find project tag in xml string.");
		} else {
			project = list.item(0);
		}
		
		/* convert project attributes */
		this.convertProjectAttributes(project, projectObj);
		
		/* convert project Nodes */
		projectObj.put("nodes", this.convertProjectNodes(doc.getElementsByTagName("nodes")));
		
		/* convert project Sequences */
		projectObj.put("sequences", this.convertProjectSequences(doc.getElementsByTagName("sequences")));
		
		/* convert start point */
		this.convertProjectStartPoint(doc.getElementsByTagName("startpoint").item(0), projectObj);
		
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
	public void convertProjectAttributes(Node project, JSONObject projectObj) throws JSONException{
		NamedNodeMap map = project.getAttributes();
		
		/* get title from attributes and set JSON object title field */
		String titleVal = "";
		if(map != null && map.getNamedItem("title") != null){
			titleVal = map.getNamedItem("title").getNodeValue();
		}
		projectObj.put("title", titleVal);
		
		/* get autoStep value from attributes and set JSON object autoStep field */
		String autoStep = "true";
		if(map != null && map.getNamedItem("autoStep") != null){
			autoStep = map.getNamedItem("autoStep").getNodeValue();
		}
		projectObj.put("autoStep", Boolean.parseBoolean(autoStep));
		
		/* get stepLevelNum value from attributes and set JSON object stepLevelNum field */
		String stepLevel = "false";
		if(map != null && map.getNamedItem("stepLevelNum") != null){
			stepLevel = map.getNamedItem("stepLevelNum").getNodeValue();
		}
		projectObj.put("stepLevelNum", Boolean.parseBoolean(stepLevel));

		/* get stepTerm value from attributes and set JSON object stepTerm field */
		String stepTerm = "";
		if(map != null && map.getNamedItem("stepTerm") != null){
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
	public ArrayList<JSONObject> convertProjectNodes(NodeList nodeList) throws ServletException, JSONException{
		ArrayList<JSONObject> nodes = new ArrayList<JSONObject>();
		Node xmlNodes = nodeList.item(0);
		
		/* only proceed if there are nodes that need to be converted */
		if(xmlNodes != null && xmlNodes.hasChildNodes()){
			NodeList children = xmlNodes.getChildNodes();
			for(int i=0;i<children.getLength();i++){
				/* filter out text */
				if(!children.item(i).getNodeName().equals("#text") && !children.item(i).getNodeName().equals("#comment")){
					nodes.add(this.convertProjectNode(children.item(i)));
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
	public ArrayList<JSONObject> convertProjectSequences(NodeList sequenceList) throws JSONException{
		ArrayList<JSONObject> sequences = new ArrayList<JSONObject>();
		Node xmlSequences = sequenceList.item(0);
		
		/* only proceed if there are sequences that need to be converted */
		if(xmlSequences != null && xmlSequences.hasChildNodes()){
			NodeList children = xmlSequences.getChildNodes();
			for(int d=0;d<children.getLength();d++){
				/* filter out text and comments */
				if(!children.item(d).getNodeName().equals("#text") && !children.item(d).getNodeName().equals("#comment")){
					sequences.add(this.convertProjectSequence(children.item(d)));
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
	public void convertProjectStartPoint(Node startPointNode, JSONObject projectObj) throws JSONException{
		String startId = "";
		if(startPointNode != null){
			NodeList children = startPointNode.getChildNodes();
			for(int q=0;q<children.getLength();q++){
				Node child = children.item(q);
				if(!child.getNodeName().equals("#text") && !child.getNodeName().equals("#comment")){
					startId = this.getAttributeValueFromNode(child, "ref");
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
	public JSONObject convertProjectNode(Node node) throws ServletException, JSONException{
		JSONObject nodeObj = new JSONObject();
		NamedNodeMap attr = node.getAttributes();
		
		/* get type from tagname and set as type in node obj field */
		String type = node.getNodeName();
		if(type!=null && type!=""){
			nodeObj.put("type", type);
		} else {
			throw new ServletException("No node type specified, could not parse the xml for the node!");
		}
		
		/* get title value from attributes and set field in node object */
		String title = "";
		if(attr != null && attr.getNamedItem("title") != null){
			title = attr.getNamedItem("title").getNodeValue();
		}
		nodeObj.put("title", title);
		
		/* get identifier value from attributes and set field in node object */
		String id = "";
		if(attr !=null && attr.getNamedItem("identifier") != null){
			id = attr.getNamedItem("identifier").getNodeValue();
		}
		nodeObj.put("identifier", id);
		
		/* get class value from attributes and set field in nod obj */
		String classname = "";
		if(attr != null && attr.getNamedItem("class") != null){
			classname = attr.getNamedItem("class").getNodeValue();
		}
		nodeObj.put("class", classname);
		
		/* get reference value from node */
		nodeObj.put("ref", this.convertReference(node));
		
		/* get previousWorkNodeIds value from node */
		nodeObj.put("previousWorkNodeIds", this.convertPreviousWork(node));
		
		return nodeObj;
	}
	
	/**
	 * Given a <code>Node</code> node, finds the reference element and returns
	 * the <code>String</code> value.
	 * 
	 * @param <code>Node</code> node
	 * @return <code>String</code> value
	 */
	public String convertReference(Node node){
		/* get child elements of the node */
		NodeList children = node.getChildNodes();
		/* find the child ref element */
		for(int a=0;a<children.getLength();a++){
			Node currentChild = children.item(a);
			if(currentChild.getNodeName().equals("ref")){
				/* get and return the value of the filename attribute */
				NamedNodeMap attr = currentChild.getAttributes();
				if(attr != null && attr.getNamedItem("filename") != null){
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
	public ArrayList<String> convertPreviousWork(Node node){
		ArrayList<String> ids = new ArrayList<String>();
		NodeList children = node.getChildNodes();
		
		/* get child elements of the node */
		for(int b=0;b<children.getLength();b++){
			Node currentChild = children.item(b);
			/* find the previousworkreferencenodes child element */
			if(currentChild.getNodeName().equals("previousworkreferencenodes")){
				/* get the children of the previousworkreferencenodes element */
				NodeList childNodes = currentChild.getChildNodes();
				/* add the ref value of each child to the ids list */
				for(int c=0;c<childNodes.getLength();c++){
					NamedNodeMap map = childNodes.item(c).getAttributes();
					if(map != null && map.getNamedItem("ref") != null){
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
	public JSONObject convertProjectSequence(Node sequence) throws JSONException{
		JSONObject seqObj = new JSONObject();
		NamedNodeMap attr = sequence.getAttributes();
		seqObj.put("type", "sequence");
		
		/* get title value from attributes and set field in node object */
		String title = "";
		if(attr != null && attr.getNamedItem("title") != null){
			title = attr.getNamedItem("title").getNodeValue();
		}
		seqObj.put("title", title);
		
		/* get id value from attributes and set field in node object */
		String id = "";
		if(attr != null && attr.getNamedItem("identifier") != null){
			id = attr.getNamedItem("identifier").getNodeValue();
		}
		seqObj.put("identifier", id);
		
		/* get view value from attributes and set field in node object */
		String view = "";
		if(attr != null && attr.getNamedItem("view") != null){
			view = attr.getNamedItem("view").getNodeValue();
		}
		seqObj.put("view", view);
		
		/* get list of ref ids from element */
		seqObj.put("refs", this.convertReferences(sequence.getChildNodes()));
		
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
	public ArrayList<String> convertReferences(NodeList nodes){
		ArrayList<String> ids = new ArrayList<String>();
		
		/* get attribute ref value for each node in list */
		for(int e=0;e<nodes.getLength();e++){
			NamedNodeMap map = nodes.item(e).getAttributes();
			if(map != null && map.getNamedItem("ref") != null){
				/* add value to ids */
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
	private boolean convertNode(JSONObject node, File fromFolder, File parent) throws JSONException, IOException, ServletException{
		String ref = node.getString("ref");
		/* filter out bad or null references */
		if(ref != null && ref != "" && !ref.equals("null")){
			File oldFile = new File(fromFolder, ref);
			File newFile = new File(parent, oldFile.getName());
			
			/* filter out missing files */
			if(oldFile.exists()){
				String data = this.cleanString(this.fileManager.getFileText(oldFile));
				Type t = null;
				
				/* filter out any custom types that we don't know about */
				try {
					t = Type.valueOf(node.getString("type"));	
				} catch(IllegalArgumentException e) {
					e.printStackTrace();
				}
				
				if(t != null){
					/* call function appropriate to node type and return its value */
					switch(t){
						case HtmlNode: return this.convertHtmlNode(node, data, newFile);
						case MySystemNode: return this.convertMySystemNode(node, data, newFile, fromFolder);
						case DrawNode: return this.convertDrawNode(node, data, newFile);
						case OutsideUrlNode: return this.convertOutsideUrlNode(node, data, newFile);
						case OpenResponseNode: return this.convertOpenResponseNode(node, data, newFile);
						case NoteNode: return this.convertNoteNode(node, data, newFile);
						case BrainstormNode: return this.convertBrainstormNode(node, data, newFile);
						case DataGraphNode: return this.convertDataGraphNode(node, data, newFile);
						case FillinNode: return this.convertFillinNode(node, data, newFile);
						case MatchSequenceNode: return this.convertMatchSequenceNode(node, data, newFile);
						case MultipleChoiceNode: return this.convertMultipleChoiceNode(node, data, newFile);
						case BlueJNode: return this.convertBlueJNode(node, data, newFile);
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
	private boolean convertHtmlNode(JSONObject node, String data, File file) throws JSONException, IOException{
		JSONObject htmlContent = new JSONObject();
		htmlContent.put("type", "Html");
		
		String contentFilename = file.getName();
		String jsonFilename = file.getCanonicalPath().replace(".html", ".ht");
		
		htmlContent.put("src", contentFilename);
		
		this.fileManager.writeFile(new File(jsonFilename), htmlContent.toString(3), true);
		this.fileManager.writeFile(file, data, true);
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
	private boolean convertMySystemNode(JSONObject node, String data, File file, File fromFolder) throws JSONException, IOException{
		JSONObject msContent = Template.getMySystemTemplate();
		String id = node.getString("identifier");
		
		/* attempt to retrieve modules file and add it to the content */
		/* Try finding file by node identifier */
		File modFile = new File(fromFolder, id + "_module.json");
		if(!modFile.exists()){
			/* Try finding modules.json file */
			modFile = new File(fromFolder, "modules.json");
		}
		
		/* if mod file exists add modules to content */
		if(modFile.exists()){
			/* if there is no data or file is corrupt, do not set modules in content but keep processing */
			try{
				String modData = fileManager.getFileText(modFile);
				/* if we get null or essentially no data, don't do anything, otherwise add mods to content */
				if(!(modData == null || modData == "" || modData.equals("[]"))){
					msContent.put("modules", new JSONArray(modData));
				}
			} catch(IOException e){
				e.printStackTrace();
			}
		}
		
		/* attempt to retrieve some sort of prompt from the html */
		Pattern p = Pattern.compile("<div style=\"font-size: 150%; padding: 5px 5px 5px 10px;\">[\\S\\s]*</div>");
		Matcher m = p.matcher(data);
		
		/* if found in the data, set the prompt in the json */
		if(m.find()){
			msContent.put("prompt", m.group());
		}
		
		this.fileManager.writeFile(new File(file.getAbsolutePath().replace(".html", ".my")), msContent.toString(3), true);
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
	private boolean convertDrawNode(JSONObject node, String data, File file) throws JSONException, IOException{
		JSONObject htmlContent = new JSONObject();
		htmlContent.put("type", "Draw");
		
		String contentFilename = file.getName();
		String jsonFilename = file.getCanonicalPath().replace(".html", ".ht");
		
		htmlContent.put("src", contentFilename);
		
		this.fileManager.writeFile(new File(jsonFilename), htmlContent.toString(3), true);
		this.fileManager.writeFile(file, data, true);
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
	private boolean convertOutsideUrlNode(JSONObject node, String data, File file) throws JSONException, IOException, ServletException{
		JSONObject urlContent = new JSONObject();
		
		try{
			Document doc = this.getDOMDocumentFromString(data);
			NodeList nodes = doc.getElementsByTagName("url");
			
			if(nodes.getLength()>0){
				Node urlElement = nodes.item(0);
				urlContent.put("url", urlElement.getFirstChild().getNodeValue());
			} else {
				urlContent.put("url", "");
			}
			urlContent.put("type", "OutsideUrl");
			
			this.fileManager.writeFile(file, urlContent.toString(3), true);
			return true;
		} catch(ServletException e){
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
	private boolean convertOpenResponseNode(JSONObject node, String data, File file) throws JSONException, ServletException, IOException{
		JSONObject orContent = Template.getOpenResponseTemplate();
		
		/* catch conversion error for node and return false if fails */
		try{
			Document doc = this.getDOMDocumentFromString(data);
			/* get and set rich text attribute value */
			String val = this.getAttributeValueFromNode(this.getSingleElementByTagName(doc, "OpenResponse"), "isRichTextEditorAllowed");
			if(val != null){
				orContent.put("isRichTextEditorAllowed", Boolean.parseBoolean(val));
			} else {
				orContent.put("isRichTextEditorAllowed", false);
			}
			
			/* get and set assessmentItem attribute values */
			Node interactionNode = this.getSingleElementByTagName(doc, "extendedTextInteraction");
			Node promptNode = this.getSingleElementByTagName(doc, "prompt");
			JSONObject interaction = orContent.getJSONObject("assessmentItem").getJSONObject("interaction");
			
			String hasInlineFeedback = this.getAttributeValueFromNode(interactionNode, "hasInlineFeedback");
			if(hasInlineFeedback != null){
				interaction.put("hasInlineFeedback", Boolean.valueOf(hasInlineFeedback));
			}
			
			String expectedLines = this.getAttributeValueFromNode(interactionNode, "expectedLines");
			if(expectedLines != null){
				interaction.put("expectedLines", expectedLines);
			}
			
			if(promptNode.getFirstChild() != null) {
				String prompt = promptNode.getFirstChild().getNodeValue();
				if(prompt != null){
					interaction.put("prompt", this.deentitizeHtml(this.cleanString(prompt)));
				}			
			}
			
			/* get and set starter sentence and options */
			Node starterNode = this.getSingleElementByTagName(doc, "starterSentence");
			JSONObject starterSentence = orContent.getJSONObject("starterSentence");
			if(starterNode != null){
				String display = this.getAttributeValueFromNode(starterNode, "displayOption");
				if(display != null){
					starterSentence.put("display", display);
				}
				
				if(starterNode.getFirstChild() != null) {
					String sentence = starterNode.getFirstChild().getNodeValue();
					if(sentence != null){
						starterSentence.put("sentence", this.cleanString(sentence));
					}				
				}
			}
			
			this.fileManager.writeFile(file, orContent.toString(3), true);
			return true;
		} catch(ServletException e){
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
	private boolean convertNoteNode(JSONObject node, String data, File file) throws JSONException, ServletException, IOException{
		JSONObject orContent = Template.getNoteTemplate();
		
		try{
			Document doc = this.getDOMDocumentFromString(data);
			
			/* get and set rich text attribute value */
			String val = this.getAttributeValueFromNode(this.getSingleElementByTagName(doc, "Note"), "isRichTextEditorAllowed");
			if(val != null){
				orContent.put("isRichTextEditorAllowed", Boolean.parseBoolean(val));
			} else {
				orContent.put("isRichTextEditorAllowed", false);
			}
			
			/* get and set assessmentItem attribute values */
			Node interactionNode = this.getSingleElementByTagName(doc, "extendedTextInteraction");
			Node promptNode = this.getSingleElementByTagName(doc, "prompt");
			JSONObject interaction = orContent.getJSONObject("assessmentItem").getJSONObject("interaction");
			
			String hasInlineFeedback = this.getAttributeValueFromNode(interactionNode, "hasInlineFeedback");
			if(hasInlineFeedback != null){
				interaction.put("hasInlineFeedback", Boolean.valueOf(hasInlineFeedback));
			}
			
			String expectedLines = this.getAttributeValueFromNode(interactionNode, "expectedLines");
			if(expectedLines != null){
				interaction.put("expectedLines", expectedLines);
			}
			
			if(promptNode != null && promptNode.getFirstChild() != null){
				String prompt = promptNode.getFirstChild().getNodeValue();
				if(prompt != null){
					interaction.put("prompt", this.deentitizeHtml(this.cleanString(prompt)));
				}
			}
			
			/* get and set starter sentence and options */
			Node starterNode = this.getSingleElementByTagName(doc, "starterSentence");
			JSONObject starterSentence = orContent.getJSONObject("starterSentence");
			
			if(starterNode != null){
				String display = this.getAttributeValueFromNode(starterNode, "displayOption");
				if(display != null){
					starterSentence.put("display", display);
				} 
				
				if(starterNode.getFirstChild() != null) {
					String sentence = starterNode.getFirstChild().getNodeValue();
					if(sentence != null){
						starterSentence.put("sentence", this.cleanString(sentence));
					}				
				}
			}
			
			this.fileManager.writeFile(file, orContent.toString(3), true);
			return true;
		} catch(ServletException e){
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
	private boolean convertBrainstormNode(JSONObject node, String data, File file) throws JSONException, ServletException, IOException{
		JSONObject bContent = Template.getBrainstormTemplate();
		
		try{
			Document doc = this.getDOMDocumentFromString(data);
			
			Node bElement = this.getSingleElementByTagName(doc, "Brainstorm");
			/* get and set rich text attribute value */
			String val = this.getAttributeValueFromNode(bElement, "isRichTextEditorAllowed");
			if(val != null){
				bContent.put("isRichTextEditorAllowed", Boolean.parseBoolean(val));
			} else {
				bContent.put("isRichTextEditorAllowed", false);
			}
			
			/* get and set title attribute value */
			val = this.getAttributeValueFromNode(bElement, "title");
			if(val != null){
				bContent.put("title", val);
			}
			
			/* get and set gated attribute value */
			val = this.getAttributeValueFromNode(bElement, "isGated");
			if(val != null){
				bContent.put("isGated", Boolean.parseBoolean(val));
			}
			
			/* get and set display name attribute value */
			val = this.getAttributeValueFromNode(bElement, "displayName");
			if(val != null){
				bContent.put("displayName", val);
			}
			
			/* get and set poll ended attribute value */
			val = this.getAttributeValueFromNode(bElement, "isPollEnded");
			if(val != null){
				bContent.put("isPollEnded", Boolean.parseBoolean(val));
			}
			
			/* get and set poll active attribute value */
			val = this.getAttributeValueFromNode(bElement, "isInstantPollActive");
			if(val != null){
				bContent.put("isInstantPollActive", Boolean.parseBoolean(val));
			}
			
			/* get and set use server attribute value */
			val = this.getAttributeValueFromNode(bElement, "useServer");
			if(val != null){
				bContent.put("useServer", Boolean.parseBoolean(val));
			}
			
			/* get and set assessmentItem attribute values */
			Node interactionNode = this.getSingleElementByTagName(doc, "extendedTextInteraction");
			Node promptNode = this.getSingleElementByTagName(doc, "prompt");
			JSONObject interaction = bContent.getJSONObject("assessmentItem").getJSONObject("interaction");
			
			String expectedLines = this.getAttributeValueFromNode(interactionNode, "expectedLines");
			if(expectedLines != null){
				interaction.put("expectedLines", expectedLines);
			}
			
			if(promptNode != null && promptNode.getFirstChild() != null){
				String prompt = promptNode.getFirstChild().getNodeValue();
				if(prompt != null){
					interaction.put("prompt", this.cleanString(prompt));
				}
			}
			
			/* get and set canned responses */
			NodeList responseNodes = doc.getElementsByTagName("response");
			JSONArray responses = bContent.getJSONArray("cannedResponses");
			for(int p=0;p<responseNodes.getLength();p++){
				Node currentNode = responseNodes.item(p);
				if(!currentNode.getNodeName().equals("#text") && !currentNode.getNodeName().equals("#comment")){
					JSONObject response = new JSONObject();
					response.put("name", this.getAttributeValueFromNode(currentNode, "name"));
					if(currentNode.hasChildNodes()){
						response.put("response", this.cleanString(currentNode.getFirstChild().getNodeValue()));
					}
					responses.put(response);
				}
			}
			
			/* get and set starter sentence and options */
			Node starterNode = this.getSingleElementByTagName(doc, "starterSentence");
			JSONObject starterSentence = bContent.getJSONObject("starterSentence");
			
			if(starterNode != null){
				String display = this.getAttributeValueFromNode(starterNode, "displayOption");
				if(display != null){
					starterSentence.put("display", display);
				} 
				
				if(starterNode.getFirstChild() != null) {
					String sentence = starterNode.getFirstChild().getNodeValue();
					if(sentence != null){
						starterSentence.put("sentence", this.cleanString(sentence));
					}				
				}
			}
			
			this.fileManager.writeFile(file, bContent.toString(3), true);
			return true;
		} catch(ServletException e){
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
	private boolean convertDataGraphNode(JSONObject node, String data, File file) throws JSONException, ServletException, IOException{
		JSONObject dContent = Template.getDataGraphTemplate();
		
		try{
			Document doc = this.getDOMDocumentFromString(data);
			
			/* get and set prompt value */
			dContent.put("prompt", this.cleanString(this.getSingleElementByTagName(doc, "prompt").getFirstChild().getNodeValue()));
			
			/* get and set option values */
			Node displayOptions = this.getSingleElementByTagName(doc, "display");
			Node graphOptions = this.getSingleElementByTagName(doc, "graphOptions");
			JSONObject dcDisplayOptions = dContent.getJSONObject("options").getJSONObject("display");
			JSONObject dcGraphOptions = dContent.getJSONObject("options").getJSONObject("graph");
			
			/* get and set 'which' option */
			String val = this.getAttributeValueFromNode(displayOptions, "which");
			if(val != null){
				dcDisplayOptions.put("which", val);
			}
			
			/* get and set 'start' option */
			val = this.getAttributeValueFromNode(displayOptions, "start");
			if(val != null){
				dcDisplayOptions.put("start", val);
			}
			
			/* get and set 'range' option */
			val = this.getAttributeValueFromNode(graphOptions, "range");
			if(val != null){
				dcGraphOptions.put("range", Boolean.parseBoolean(val));
			}
			
			/* get and set 'bar' option */
			val = this.getAttributeValueFromNode(graphOptions, "bar");
			if(val != null){
				dcGraphOptions.put("bar", Boolean.parseBoolean(val));
			}
			
			/* get and set 'line' option */
			val = this.getAttributeValueFromNode(graphOptions, "line");
			if(val != null){
				dcGraphOptions.put("line", Boolean.valueOf(val));
			}
			
			/* get and set 'point' option */
			val = this.getAttributeValueFromNode(graphOptions, "point");
			if(val != null){
				dcGraphOptions.put("point", Boolean.valueOf(val));
			}
			
			/* get and set 'linePoint' option */
			val = this.getAttributeValueFromNode(graphOptions, "linePoint");
			if(val != null){
				dcGraphOptions.put("linePoint", Boolean.valueOf(val));
			}
			
			/* get and set graph 'title' value */
			val = this.getSingleElementByTagName(doc, "title").getFirstChild().getNodeValue();
			if(val != null){
				dContent.getJSONObject("table").put("title", this.cleanString(val));
			}
			
			/* get and set graph title editable */
			val = this.getAttributeValueFromNode(this.getSingleElementByTagName(doc, "title"), "editable");
			if(val != null){
				dContent.getJSONObject("table").put("titleEditable", Boolean.parseBoolean(val));
			}
			
			/* get and set 'independent' values */
			Node ind = this.getSingleElementByTagName(doc, "independent");
			if(ind != null){
				JSONObject dInd = new JSONObject();
				/* check for label and set if necessary */
				String label = this.getAttributeValueFromNode(ind, "label");
				if(label != null){
					dInd.put("label", label);
				}
				
				/* check for editable and set if necessary */
				String editable = this.getAttributeValueFromNode(ind, "editable");
				if(editable != null){
					dInd.put("editable", Boolean.parseBoolean(editable));
				}
				
				dContent.getJSONObject("table").put("independent", dInd);
			}
			
			/* get and set cols if any exist */
			NodeList cols = doc.getElementsByTagName("col");
			JSONArray colsArray =  dContent.getJSONObject("table").getJSONArray("cols");
			for(int y=0;y<cols.getLength();y++){
				JSONObject currentCol = new JSONObject();
				/* get and set label if any */
				String label = this.getAttributeValueFromNode(cols.item(y), "label");
				if(label != null){
					currentCol.put("label", label);
				}
				
				/* get and set editable if any */
				String editable = this.getAttributeValueFromNode(cols.item(y), "editable");
				if(editable != null){
					currentCol.put("editable", Boolean.parseBoolean(editable));
				}
				
				/* add JSONified col to array */
				colsArray.put(currentCol);
			}
			
			/* get and set rows/cells if any exist */
			NodeList rows = doc.getElementsByTagName("row");
			JSONArray rowsArray = dContent.getJSONObject("table").getJSONArray("rows");
			for(int x=0;x<rows.getLength();x++){
				JSONObject currentRow = new JSONObject();
				/* get and set label if any */
				String label = this.getAttributeValueFromNode(rows.item(x), "label");
				if(label != null){
					currentRow.put("label", label);
				}
				
				/* get and set editable if any */
				String editable = this.getAttributeValueFromNode(rows.item(x), "editable");
				if(editable != null){
					currentRow.put("editable", Boolean.parseBoolean(editable));
				}
				
				/* set any cells for this row */
				JSONArray cells = new JSONArray();
				NodeList nCells = rows.item(x).getChildNodes();
				for(int z=0;z<nCells.getLength();z++){
					JSONObject cell = new JSONObject();
					
					/* get and set editable if any */
					String cellEditable = this.getAttributeValueFromNode(nCells.item(z), "editable");
					if(editable != null){
						cell.put("editable", Boolean.parseBoolean(cellEditable));
					}
					
					/* get and set value if any */
					if(nCells.item(z).hasChildNodes()){
						cell.put("value", nCells.item(z).getFirstChild().getNodeValue());
					}
					
					/* add new cell to array */
					cells.put(cell);
				}
				
				/* add new cells array to row */
				currentRow.put("cells", cells);
				
				/* add JSONified row to array */
				rowsArray.put(currentRow);
			}
			
			this.fileManager.writeFile(file, dContent.toString(3), true);
			return true;
		} catch(ServletException e){
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
	private boolean convertFillinNode(JSONObject node, String data, File file) throws JSONException, ServletException, IOException{
		JSONObject fContent = Template.getFillinTemplate();
		
		try{
			Document doc = this.getDOMDocumentFromString(data);
			
			/* get and set html text and interactions */
			JSONArray interaction = fContent.getJSONObject("assessmentItem").getJSONArray("interaction");
			NodeList interactions = this.getSingleElementByTagName(doc, "itemBody").getChildNodes();
			for(int t=0;t<interactions.getLength();t++){
				Node currentNode = interactions.item(t);
				if(currentNode.getNodeName().equals("htmltext")){
					JSONObject currentObj = new JSONObject();
					currentObj.put("type", "htmltext");
					if(currentNode.getFirstChild() != null) {
						currentObj.put("text", this.cleanString(currentNode.getFirstChild().getNodeValue()));
						interaction.put(currentObj);					
					}
				} else if(currentNode.getNodeName().equals("textEntryInteraction")){
					JSONObject currentObj = new JSONObject();
					currentObj.put("type", "textEntryInteraction");
					currentObj.put("responseIdentifier", this.getAttributeValueFromNode(currentNode, "responseIdentifier"));
					currentObj.put("expectedLength", this.getAttributeValueFromNode(currentNode, "expectedLength"));
					interaction.put(currentObj);
				}
			}
			
			/* get and set response declarations */
			JSONArray responseDeclarations = fContent.getJSONObject("assessmentItem").getJSONArray("responseDeclarations");
			NodeList declarations = doc.getElementsByTagName("responseDeclaration");
			for(int u=0;u<declarations.getLength();u++){
				Node currentNode = declarations.item(u);
				JSONObject currentObj = new JSONObject();
				JSONArray allowed = new JSONArray();
				NodeList mapEntries = currentNode.getChildNodes().item(1).getChildNodes();
				for(int k=0;k<mapEntries.getLength();k++){
					JSONObject allowable = new JSONObject();
					allowable.put("response", this.getAttributeValueFromNode(mapEntries.item(k), "mapKey"));
					allowable.put("value", this.getAttributeValueFromNode(mapEntries.item(k), "mappedValue"));
					allowed.put(allowable);
				}
				
				currentObj.put("identifier", this.getAttributeValueFromNode(currentNode, "identifier"));
				currentObj.put("correctResponses", allowed);
				responseDeclarations.put(currentObj);
			}
			
			/* get and set custom check */
			Node custom = this.getSingleElementByTagName(doc, "customCheck");
			if(custom != null){
				fContent.put("customCheck", custom.getFirstChild().getNodeValue());
			};
			
			this.fileManager.writeFile(file, fContent.toString(3), true);
			return true;
		} catch(ServletException e){
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
	private boolean convertMatchSequenceNode(JSONObject node, String data, File file) throws JSONException, ServletException, IOException{
		JSONObject mContent = Template.getMatchSequenceTemplate();
		
		try{
			Document doc = this.getDOMDocumentFromString(data);
			
			/* get and set correct responses */
			JSONArray responses = mContent.getJSONObject("assessmentItem").getJSONObject("responseDeclaration").getJSONArray("correctResponses");
			Node correct = this.getSingleElementByTagName(doc, "correctResponse");
			NodeList valNodes = null;
			if(correct != null && correct.hasChildNodes()){
				valNodes = correct.getChildNodes();
				for(int v=0;v<valNodes.getLength();v++){
					Node currentVal = valNodes.item(v);
					if(!currentVal.getNodeName().equals("#text") && !currentVal.getNodeName().equals("#comment")){
						JSONObject currentCorrect = new JSONObject();
						currentCorrect.put("isDefault", Boolean.valueOf(this.getAttributeValueFromNode(currentVal, "isDefault")));
						currentCorrect.put("isCorrect", Boolean.valueOf(this.getAttributeValueFromNode(currentVal, "isCorrect")));
						currentCorrect.put("choiceIdentifier", this.getAttributeValueFromNode(currentVal, "choiceIdentifier"));
						currentCorrect.put("fieldIdentifier", this.getAttributeValueFromNode(currentVal, "fieldIdentifier"));
						currentCorrect.put("order", this.getAttributeValueFromNode(currentVal, "order"));
						
						if(currentVal.getFirstChild() != null) {
							currentCorrect.put("feedback", this.cleanString(currentVal.getFirstChild().getNodeValue()));
						} else {
							currentCorrect.put("feedback", "");
						}
						
						responses.put(currentCorrect);
					}
				}
			}
			
			/* get and set interaction attributes */
			JSONObject interaction = mContent.getJSONObject("assessmentItem").getJSONObject("interaction");
			Node gapInteraction = this.getSingleElementByTagName(doc, "gapMatchInteraction");
			if(gapInteraction != null){
				String feedback = this.getAttributeValueFromNode(gapInteraction, "hasInlineFeedback");
				if(feedback != null){
					interaction.put("hasInlineFeedback", Boolean.valueOf(feedback));
				}
				
				String shuffle = this.getAttributeValueFromNode(gapInteraction, "shuffle");
				if(shuffle != null){
					interaction.put("shuffle", Boolean.valueOf(shuffle));
				}
				
				String ordered = this.getAttributeValueFromNode(gapInteraction, "ordered");
				if(ordered != null){
					interaction.put("ordered", Boolean.valueOf(ordered));
				}
			}
			
			/* get and set prompt */
			Node prompt = this.getSingleElementByTagName(doc, "prompt");
			if(prompt != null && prompt.hasChildNodes()){
				interaction.put("prompt", this.cleanString(prompt.getFirstChild().getNodeValue()));
			}
			
			/* get and set fields/gapMultiple/boxes */
			JSONArray fields = interaction.getJSONArray("fields");
			NodeList gapMultiples = doc.getElementsByTagName("gapMultiple");
			for(int b=0;b<gapMultiples.getLength();b++){
				Node currentGap = gapMultiples.item(b);
				JSONObject currentField = new JSONObject();
				String identifier = this.getAttributeValueFromNode(currentGap, "identifier");
				currentField.put("identifier", identifier);
				
				String ordinal = this.getAttributeValueFromNode(currentGap, "ordinal");
				currentField.put("ordinal", ordinal);
				
				String numberOfEntries = this.getAttributeValueFromNode(currentGap, "numberOfEntries");
				currentField.put("numberOfEntries", numberOfEntries);
				
				if(currentGap.hasChildNodes()){
					currentField.put("name", currentGap.getFirstChild().getNodeValue());
				} else {
					currentField.put("name", "");
				}
				
				fields.put(currentField);
			}
			
			/* get and set choices/gapText */
			JSONArray choices = interaction.getJSONArray("choices");
			NodeList gaps = doc.getElementsByTagName("gapText");
			for(int n=0;n<gaps.getLength();n++){
				Node currentGap = gaps.item(n);
				JSONObject currentChoice = new JSONObject();
				String identifier = this.getAttributeValueFromNode(currentGap, "identifier");
				currentChoice.put("identifier", identifier);
				
				String max = this.getAttributeValueFromNode(currentGap, "matchMax");
				if(max != null){
					currentChoice.put("matchMax", max);
				}
				
				if(currentGap.hasChildNodes()){
					currentChoice.put("value", this.cleanString(currentGap.getFirstChild().getNodeValue()));
				}
				
				choices.put(currentChoice);
			}
			
			this.fileManager.writeFile(file, mContent.toString(3), true);
			return true;
		} catch(ServletException e){
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
	private boolean convertMultipleChoiceNode(JSONObject node, String data, File file) throws JSONException, ServletException, IOException{
		JSONObject mContent = Template.getMultipleChoiceTemplate("MultipleChoice");
		
		try{
			Document doc = this.getDOMDocumentFromString(data);
			
			/* get and set correct response values if they exists */
			JSONArray correctResponse = mContent.getJSONObject("assessmentItem").getJSONObject("responseDeclaration").getJSONArray("correctResponse");
			
			if(this.getSingleElementByTagName(doc, "correctResponse") != null) {
				NodeList vals = this.getSingleElementByTagName(doc, "correctResponse").getChildNodes();
				for(int g=0;g<vals.getLength();g++){
					if(!vals.item(g).getNodeName().equals("#text") && !vals.item(g).getNodeName().equals("#comment")){
						correctResponse.put(this.cleanString(vals.item(g).getFirstChild().getNodeValue()));
					}
				}
			}
			
			/* get and set interaction attribute values */
			JSONObject interaction = mContent.getJSONObject("assessmentItem").getJSONObject("interaction");
			Node choiceInteraction = this.getSingleElementByTagName(doc, "choiceInteraction");
			String hasInlineFeedback = this.getAttributeValueFromNode(choiceInteraction, "hasInlineFeedback");
			if(hasInlineFeedback != null){
				interaction.put("hasInlineFeedback", Boolean.valueOf(hasInlineFeedback));
			}
			
			String max = this.getAttributeValueFromNode(choiceInteraction, "maxChoices");
			if(max != null){
				interaction.put("maxChoices", max);
			}
			
			String shuffle = this.getAttributeValueFromNode(choiceInteraction, "shuffle");
			if(shuffle != null){
				interaction.put("shuffle", Boolean.valueOf(shuffle));
			}
			
			/* get and set prompt */
			Node prompt = this.getSingleElementByTagName(doc, "prompt");
			if(prompt != null && prompt.hasChildNodes()){
				interaction.put("prompt", this.cleanString(prompt.getFirstChild().getNodeValue()));
			}
			
			/* get and set the choices */
			JSONArray choices = interaction.getJSONArray("choices");
			NodeList simpleChoices = doc.getElementsByTagName("simpleChoice");
			for(int m=0;m<simpleChoices.getLength();m++){
				JSONObject currentChoice = new JSONObject();
				Node currentSC = simpleChoices.item(m);
				String id = this.getAttributeValueFromNode(currentSC, "identifier");
				if(id != null){
					currentChoice.put("identifier", id);
				} else {
					currentChoice.put("identifier", "");
				}
				
				if(interaction.getBoolean("hasInlineFeedback")){
					NodeList nodes = doc.getElementsByTagName("feedbackInline");
					currentChoice.put("feedback", "");
					for(int c=0;c<nodes.getLength();c++){
						String feedbackId = this.getAttributeValueFromNode(nodes.item(c), "identifier");
						if(feedbackId != null && currentChoice.getString("identifier").equals(feedbackId) && nodes.item(c).getFirstChild() != null){
							currentChoice.put("feedback", this.cleanString(nodes.item(c).getFirstChild().getNodeValue()));
						}
					}
				}
				
				NodeList children = currentSC.getChildNodes();
				currentChoice.put("text","");
				for(int x=0;x<children.getLength();x++){
					Node childNode = children.item(x);
					if(childNode.getNodeName().equals("#text")){
						currentChoice.put("text", this.cleanString(childNode.getNodeValue()));
					}
				}
				
				currentChoice.put("fixed", true);
				choices.put(currentChoice);
			}
			
			this.fileManager.writeFile(file, mContent.toString(3), true);
			return true;
		} catch(ServletException e){
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
	private boolean convertBlueJNode(JSONObject node, String data, File file) throws JSONException, ServletException, IOException{
		JSONObject bContent = new JSONObject();
		Document doc = this.getDOMDocumentFromString(data);
		bContent.put("type", "Html");
		
		file = new File(file.getCanonicalPath().replace(".bluej", ".html"));
		String contentFilename = file.getName();
		String jsonFilename = file.getCanonicalPath().replace(".html", ".ht");
		
		bContent.put("src", contentFilename);
		
		/* get and set project path */
		Node path = this.getSingleElementByTagName(doc, "projectPath");
		if(path != null && path.hasChildNodes()){
			bContent.put("blueJProjectPath", this.cleanString(path.getFirstChild().getNodeValue()));
		}
		
		/* get and set content/html */
		String htmlContent = "";
		Node content = this.getSingleElementByTagName(doc, "content");
		if(content != null && content.hasChildNodes()){
			htmlContent = content.getFirstChild().getNodeValue();
		}
		
		this.fileManager.writeFile(new File(jsonFilename), bContent.toString(3), true);
		this.fileManager.writeFile(file, htmlContent, true);
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
	private String getAttributeValueFromNode(Node node, String attr){
		if(node != null){
			NamedNodeMap map = node.getAttributes();
			if(map != null && map.getLength()>0){
				if(map.getNamedItem(attr) != null){
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
	private Node getSingleElementByTagName(Document doc, String name){
		NodeList nodes = doc.getElementsByTagName(name);
		if(nodes != null && nodes.getLength()>0 && nodes.item(0) != null){
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
	public Document getDOMDocumentFromString(String xml) throws ServletException{
		try {
			xml = this.convertAmp(xml);
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
	public Document getDOMDocumentFromURI(String uri) throws ServletException{
		try{
			DocumentBuilder builder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
			Document doc = builder.parse(uri);
			return doc;
		} catch(ParserConfigurationException e){
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
	private String convertAmp(String str){
		return str.replaceAll("&", "&amp;");
	}
	
	/**
	 * Given a <code>String</code> string, trims the string and replaces certain encoded elements
	 * with their correct value.
	 * 
	 * @param String
	 * @return String
	 */
	private String cleanString(String str){
		str = str.trim();
		str = str.replaceAll("&nbsp;", " ");
		str = str.replaceAll("\t", " ");
		str = str.replaceAll("\r", " ");
		str = str.replaceAll("\n", " ");
		str = str.replaceAll("\f", " ");
		str = str.replaceAll(" +", " ");
		
		return str;
	}
	
	private String deentitizeHtml(String str){
		str = str.replaceAll("&lt;", "<");
		str = str.replaceAll("&gt;", ">");
		str = str.replaceAll("&amp;", "&");
		str = str.replaceAll("&quot;","\"");
		str = str.replaceAll("&nbsp;", " ");
		
		return str;
	}
}
