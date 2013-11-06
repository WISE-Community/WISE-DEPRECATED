package utils;

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
import java.io.PrintWriter;
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

import javax.servlet.Servlet;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Servlet implementation class for Servlet: FileManager
 * 
 * @author patrick lawler
 */
public class FileManager extends HttpServlet implements Servlet{
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

	private boolean standAlone = true;

	private boolean modeRetrieved = false;

	private static Properties vleProperties = null;

	{
		try {
			// Read properties file.
			vleProperties = new Properties();
			vleProperties.load(getClass().getClassLoader().getResourceAsStream("vle.properties"));
		} catch (Exception e) {
			System.err.println("FileManager could not read in vleProperties file");
			e.printStackTrace();
		}
	}
   
	/* (non-Java-doc)
	 * @see javax.servlet.http.HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doPost(request, response);
	}  	
	
	/* (non-Java-doc)
	 * @see javax.servlet.http.HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		if(!this.modeRetrieved){
			this.standAlone = !SecurityUtils.isPortalMode(request);
			this.modeRetrieved = true;
		}
		
		if(this.standAlone || SecurityUtils.isAuthenticated(request)){
			this.doRequest(request, response);
		} else {
			/* if not authenticated send not authorized status */
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
		}
	}
	
	private void doRequest(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException{
		String command = request.getParameter(COMMAND);
		if(command!=null){
			if(command.equals("createProject")){
				response.getWriter().write(this.createProject(request, response));
			} else if(command.equals("projectList")){
				response.getWriter().write(this.getProjectList(request, ".project.json"));
			} else if(command.equals("oldProjectList")){
				response.getWriter().write(this.getProjectList(request, ".project.xml"));
			} else if(command.equals("retrieveFile")){
				try{
					response.getWriter().write(this.retrieveFile(request, response));
				} catch(IOException e){
					response.sendError(HttpServletResponse.SC_NOT_FOUND);
				}
			} else if(command.equals("updateFile")){
				response.getWriter().write(this.updateFile(request, response));
			} else if(command.equals("createNode")){
				response.getWriter().write(this.createNode(request, response));
			} else if(command.equals("createSequence")){
				response.getWriter().write(this.createSequence(request, response));
			} else if(command.equals("removeFile")){
				response.getWriter().write(this.removeFile(request));
			} else if(command.equals("updateAudioFiles")) {
				response.getWriter().write(this.updateAudioFiles(request, response));
			} else if(command.equals("copyNode")){
				this.copyNode(request, response);
			} else if(command.equals("createSequenceFromJSON")){
				this.createSequenceFromJSON(request, response);
			} else if(command.equals("getScripts")){
				this.getScripts(request, response);
			} else if(command.equals("copyProject")){
				response.getWriter().write(this.copyProject(request, response));
			} else if(command.equals("createFile")){
				this.createFile(request, response);
			} else if(command.equals("reviewUpdateProject")) {
				this.reviewUpdateProject(request, response);
			} else if(command.equals("updateProject")) {
				this.updateProject(request, response);
			} else if(command.equals("importSteps")) {
				this.importSteps(request, response);
			} else if(command.equals("getProjectUsageAndMax")) {
				this.getProjectUsageAndMax(request, response);
			} else {
				/* we don't understand this command */
				response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
			}
		} else {
			/* no command was provided */
			response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
		}
	}
	
	/**
	 * Returns a '|' delimited String of all projects, returns an empty String if no projects exist
	 * 
	 * @return String
	 */
	private String getProjectList(HttpServletRequest request, String projectExt)throws IOException{
		String rawPaths = request.getParameter(PROJECT_PATHS);
		String[] paths = rawPaths.split("~");
		List<String> visited = new ArrayList<String>();
		List<String> projects = new ArrayList<String>();
		String projectList = "";
		
		if(paths!=null && paths.length>0){
			for(int p=0;p<paths.length;p++){
				getProjectFiles(new File(paths[p]), projects, visited, projectExt);
			}
			Collections.sort(projects, new CompareByLastModified());
			for(int q=0;q<projects.size();q++){
				projectList += projects.get(q);
				if(q!=projects.size()-1){
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
	 * 
	 * @param file
	 * @param projects
	 * @param visited
	 * @throws IOException
	 */
	private void getProjectFiles(File f, List<String> projects, List<String> visited, String projectExt) throws IOException{
		if(f.exists() && !visited.contains(f.getCanonicalPath())){
			if(f.isFile()){
				if(f.getName().endsWith(projectExt)){
					projects.add(f.getAbsolutePath());
				} else {
					return;
				}
			} else if(f.isDirectory()){
				visited.add(f.getCanonicalPath());
				if(!f.getCanonicalPath().contains(".svn")){
					String children[] = f.list();
					for(int y=0;y<children.length;y++){
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
	private class CompareByLastModified implements Comparator<String>{

		public int compare(String arg0, String arg1) {
			File file1 = new File(arg0);
			File file2 = new File(arg1);
			
			if(file1.lastModified() == file2.lastModified()){
				return 0;
			} else if(file1.lastModified() > file2.lastModified()){
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
	private boolean ensureDir(File file){
		if(file.isDirectory()){
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
	 * @param <code>File</code> file
	 * @param <code>String</code> data
	 * @param <code>boolean</code> overwrite
	 * @throws <code>IOException</code>
	 */
	public void writeFile(File file, String data, boolean overwrite) throws IOException{
		if(!file.exists() || overwrite){
			/* create a new file if it doesn't exist */
			if(!file.exists()){
				file.createNewFile();
			}
			
			/* write the data to the file */
			Writer writer = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(file), "UTF-8"));
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
	 * @param <code>File</code> file
	 * @param <code>String</code> data
	 * @param <code>boolean</code> overwrite
	 * @throws <code>IOException</code>
	 */
	public void writeFile(String path, String data, boolean overwrite) throws IOException{
		File file = new File(path);
		this.writeFile(file, data, overwrite);
	}
	
	/**
	 * Given a <code>File</code>, reads the text from the file as a <code>String</code>
	 * and returns the string.
	 * 
	 * @param <code>File</code> file
	 * @return <code>String</code> text
	 * @throws <code>IOException</code>
	 */
	public String getFileText(File file) throws IOException{
		if(file.exists()){
			BufferedReader br = new BufferedReader( new InputStreamReader(new FileInputStream(file), "UTF8")); 			
			
			String current = br.readLine();
			String fullText = "";
			while(current != null){
				fullText += current + System.getProperty("line.separator");
				current = br.readLine();
			}
			br.close();
			
			return fullText;
		} else {
			throw new IOException("Could not find specified file " + file.getAbsolutePath());
		}
	}
	
	/**
	 * Given the request for this post, extracts the project path and the 
	 * filename, reads the data from the file and returns a string of the data
	 * 
	 * @param request
	 * @return String
	 * @throws IOException
	 */
	private String retrieveFile(HttpServletRequest request, HttpServletResponse response) throws IOException{
		String filePath = (String) request.getAttribute("filePath");
		
		if(this.standAlone || SecurityUtils.isAllowedAccess(request, filePath)){
			return this.getFileText(new File(filePath));
		} else {
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
			return "unauthorized";
		}
	}
	
	/**
	 * Given a request, extracts the project name, file name and the data
	 * to be written to the file and writes it to the specified file
	 * 
	 * @param request
	 * @return String
	 * @throws IOException
	 */
	private String updateFile(HttpServletRequest request, HttpServletResponse response) throws IOException{
		/*
		 * get the project folder path
		 * e.g.
		 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667
		 */
		String projectFolderPath = (String) request.getAttribute("projectFolderPath");
		
		//get the file name
		String fileName = request.getParameter("fileName");
		
		//get the content to save to the file
		String data = request.getParameter("data");
		
		File dir = new File(projectFolderPath);
		if(dir.exists()){
			File file = new File(dir, fileName);
			if(this.standAlone || SecurityUtils.isAllowedAccess(request, file)){
				this.writeFile(file, data, true);
				return "success";
			} else {
				response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
				return "not authorized";
			}
		} else {
			throw new IOException("Unable to find the project at given location: " + dir.getCanonicalPath());
		}
	}
	
	/**
	 * Given the request for this post, extracts the new Project name, creates
	 * the project folder and creates a template project file in that folder
	 * 
	 * @param request
	 * @return int
	 * @throws IOException
	 * @throws JSONException 
	 * @throws ServletException 
	 */
	private String createProject(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException{
		//get the name of the project
		String projectName = request.getParameter("projectName");
		
		/*
		 * get the curriculum base
		 * e.g.
		 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum
		 */
		String curriculumBaseDir = (String) request.getAttribute("curriculumBaseDir");
		
		File parent = new File(curriculumBaseDir);
		
		if(this.standAlone || SecurityUtils.isAllowedAccess(request, parent)){
			this.ensureDir(parent);
			
			//all project json files will be given the filename of wise4.project.json
			File newFile = new File(this.createNewprojectPath(parent), "wise4.project.json");
			try{
				//write the empty project json to the file
				this.writeFile(newFile, Template.getProjectTemplate(projectName).toString(3), false);
				
				//get the folder name e.g. 513
				String folder = newFile.getParentFile().getName();
				
				//get the file name e.g. wise4.project.json
				String fileName = newFile.getName();
				
				//return the path to the file
				return "/" + folder + "/" + fileName;
			} catch(JSONException e){
				throw new ServletException(e);
			}
		} else {
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
			return "unauthorized";
		}
	}

	/**
	 * Given a parent directory, attempts to generate and return
	 * a unique project directory
	 * 
	 * @param parent
	 * @return
	 */
	private File createNewprojectPath(File parent){
		Integer counter = 1;
		
		while(true){
			File tryMe = new File(parent, String.valueOf(counter));
			if(!tryMe.exists()){
				tryMe.mkdir();
				return tryMe;
			}
			counter++;
		}
	}
	
	/**
	 * Given a request, extracts the project name, the file name and the node type to 
	 * be created and creates the node and adds it to the associated project.
	 * 
	 * @param request
	 * @return String
	 */
	private String createNode(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException{
		/*
		 * get the project file path
		 * e.g.
		 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667/wise4.project.json
		 */
		String projectPath = (String) request.getAttribute("projectFilePath");
		String nodeClass = request.getParameter("nodeClass");
		String title = request.getParameter("title");
		String type = request.getParameter("type");
		
		//get the string that contains an array of node template params
		String nodeTemplateParams = request.getParameter("nodeTemplateParams");
		
		/*
		 * the node name, "nodeNotProject" is the default value to return
		 * which means there was an error creating the file. this variable
		 * will be changed below once the file is created.
		 */
		String nodeName = "nodeNotProject";
		
		File dir = new File(projectPath).getParentFile();
		if(dir.exists()){
			if(this.standAlone || SecurityUtils.isAllowedAccess(request, dir)){
				
				try {
					//create the JSONArray of files to create
					JSONArray filesToCreate = new JSONArray(nodeTemplateParams);
					
					if(filesToCreate != null) {
						
						/*
						 * get the root of the file name for the files we are about to make
						 * e.g. 'node_1'
						 */
						String fileNamePrefix = getUniqueFileNamePrefix(dir);
						
						//loop through each file to create
						for(int x=0; x<filesToCreate.length(); x++) {
							//get the a file to create
							JSONObject fileToCreate = filesToCreate.getJSONObject(x);
							
							//get the extension for the file type
							String nodeExtension = fileToCreate.getString("nodeExtension");
							
							//get the content to put in the file
							String nodeTemplateContent = fileToCreate.getString("nodeTemplateContent");
							
							if(nodeExtension != null && !nodeExtension.equals("") &&
									nodeTemplateContent != null && !nodeTemplateContent.equals("")) {
								/*
								 * whether this is the main file for this step.
								 */
								boolean mainNodeFile = false;
								
								if(filesToCreate.length() == 1) {
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
								
								//create the file handle e.g. 'node_1.or'
								File file = new File(dir, fileNamePrefix + "." + nodeExtension);
								
								//write the contents to the file
								this.writeFile(file, nodeTemplateContent, false);
								
								//add the node to the project
								if(mainNodeFile && this.addNodeToProject(new File(projectPath), Template.getProjectNodeTemplate(type, file.getName(), title, nodeClass))){
									nodeName = file.getName();
								}								
							}
						}
					}
				} catch (JSONException e) {
					e.printStackTrace();
				}
			} else {
				response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
				return "not authorized";
			}
		} else {
			throw new IOException("Unable to find project");
		}
		
		return nodeName;
	}

	/**
	 * Given a node type, returns the associated file extension, if the
	 * node type is unknown, throws Servlet Exception
	 * 
	 * @param type
	 * @return String
	 * @throws ServletException
	 */
	private String getExtension(String type) throws ServletException {
		if(type.equals("BrainstormNode")){
			return ".bs";
		} else if(type.equals("FillinNode")){
			return ".fi";
		} else if(type.equals("HtmlNode") || type.equals("DrawNode")){
			return ".ht";
		} else if(type.equals("MySystemNode")){
			return ".my";
		} else if(type.equals("MatchSequenceNode")){
			return ".ms";
		} else if(type.equals("MultipleChoiceNode")){
			return ".mc";
		} else if(type.equals("NoteNode") || type.equals("JournalEntryNode") || type.equals("OpenResponseNode")){
			return ".or";
		} else if(type.equals("OutsideUrlNode")){
			return ".ou";
		} else if(type.equals("DataGraphNode")){
			return ".dg";
		} else if(type.equals("SVGDrawNode")){
			return ".sd";
		} else if(type.equals("MWNode")){
			return ".mw";
		} else if(type.equals("AssessmentListNode")){
			return ".al";
		} else if(type.equals("ChallengeNode")){
			return ".ch";
		} else if(type.equals("BranchNode")){
			return ".br";
		} else if(type.equals("SensorNode")) {
			return ".se";
		} else if(type.equals("ExplanationBuilderNode")) {
			return ".eb";
		} else {
			//throw new ServletException("I don't know how to handle nodes of type: " + type);
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
	public String getFileExtension(String filename){
		if(filename.lastIndexOf(".")==-1){
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
	public File generateUniqueFile(File parent, String ext){
		String name = "node_";
		int count = 0;
		
		while(true){
			File file = new File(parent, name + count + ext);
			if(!file.exists() && !duplicateName(parent, name + count)){
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
	public String getUniqueFileNamePrefix(File parent) {
		String name = "node_";
		int count = 0;
		
		while(true){
			//check if the file name prefix has been used yet
			if(!duplicateName(parent, name + count)){
				//it has not been used yet so we can return it
				return name + count;
			}
			count ++;
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
	private boolean duplicateName(File parent, String name){
		String[] children = parent.list();
		for(int i=0;i<children.length;i++){
			File childFile = new File(parent, children[i]);
			if(!childFile.isDirectory()){
				//find the last index of dot
				int lastIndexOfDot = children[i].lastIndexOf(".");
				
				if(lastIndexOfDot != -1) {
					//the filename contains a dot
					
					String childName = children[i].substring(0, children[i].lastIndexOf("."));
					if(childName.equals(name)){
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
	 * @param project
	 * @param template
	 * @return boolean
	 * @throws IOException
	 */
	private boolean addNodeToProject(File parent, JSONObject node) throws IOException{
		try{
			JSONObject project = new JSONObject(this.getFileText(parent));
			project.getJSONArray("nodes").put(node);
			this.writeFile(parent, project.toString(3), true);
			return true;
		} catch(JSONException e){
			e.printStackTrace();
			throw new IOException("Unable to add node to project.");
		}
	}
	
	
	/**
	 * Given a request, extracts the project name and sequence name and creates
	 * a new sequence with the given name in the project. Throws IOException if
	 * the file could not be found and if the servlet is unable to insert it into
	 * the project file.
	 * 
	 * @param request
	 * @return String
	 * @throws IOException
	 */
	private String createSequence(HttpServletRequest request, HttpServletResponse response) throws IOException{
		/*
		 * get the project file name
		 * e.g.
		 * /wise4.project.json
		 */
		String projectFileName = request.getParameter("projectFileName");
		String name = request.getParameter("name");
		String id = request.getParameter("id");
		
		/*
		 * get the project folder path
		 * e.g.
		 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667
		 */
		String projectFolderPath = (String) request.getAttribute("projectFolderPath");
		
		/*
		 * get the full project file path
		 * e.g.
		 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667/wise4.project.json
		 */
		String fullProjectFilePath = projectFolderPath + projectFileName;
		
		File file = new File(fullProjectFilePath);
		if(this.standAlone || SecurityUtils.isAllowedAccess(request, file)){
			try{
				this.addSequenceToProject(file, Template.getSequenceTemplate(id, name));
				return id;
			} catch (JSONException e){
				e.printStackTrace();
				throw new IOException("Could not insert new sequence in project file.");
			}
		} else {
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
			return "not authorized";
		}
	}
	
	/**
	 * Given a <code>File</code> project file and a <code>JSONObject</code> sequence,
	 * inserts the sequence into the project and saves the project file.
	 * 
	 * @param <code>projectFile</code> project file
	 * @param <code>JSONObject</code> sequence
	 * @throws <code>IOException</code>
	 */
	private void addSequenceToProject(File projectFile, JSONObject sequence) throws IOException{
		try{
			JSONObject project = new JSONObject(this.getFileText(projectFile));
			project.getJSONArray("sequences").put(sequence);
			this.writeFile(projectFile, project.toString(3), true);
		} catch(JSONException e){
			e.printStackTrace();
			throw new IOException("Could not insert new sequence in project file.");
		}
	}
	
	/**
	 * Given a <code>HttpServletRequest</code> request with the parameters: 
	 * param1=fullpath including filename and param2=data to write to file, 
	 * creates the file if it does not already exists and writes the data to that file.
	 * NOTE: I don't think this is used anymore since it was used to create
	 * metadata files in the project but we now store metadata in the db.
	 * step files are created in createNode and do not use this function.
	 * @param <code>HttpServletRequest</code> request
	 */
	private void createFile(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
		/*
		 * get the file name
		 * e.g.
		 * /node_1.or
		 */
		String fileName = request.getParameter("path");
		String data = request.getParameter("data");
		
		/*
		 * get the project folder path
		 * e.g.
		 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667
		 */
		String projectFolderPath = (String) request.getAttribute("projectFolderPath");
		
		/*
		 * get the full file path
		 * e.g.
		 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667/node_1.or
		 */
		String fullFilePath = projectFolderPath + fileName;
		
		if(this.standAlone || SecurityUtils.isAllowedAccess(request, fullFilePath)){
			this.writeFile(fullFilePath, data, false);
		} else {
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
		}
	}
	
	/**
	 * Given a <code>HttpServletRequest</code> request with params param1 (project path)
	 * and param2 (filename), attempts to remove the specified file.
	 * 
	 * @param request
	 * @return string
	 * @throws IOException
	 */
	private String removeFile(HttpServletRequest request) throws IOException{
		/*
		 * get the project folder path
		 * e.g.
		 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667
		 */
		String projectFolderPath = (String) request.getAttribute("projectFolderPath");
		
		/*
		 * get the file name
		 * node_1.or
		 */
		String fileName = request.getParameter("fileName");
		
		File child = new File(new File(projectFolderPath), fileName);
		if(child.exists() && child.delete()){
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
	 * @param <code>HttpServletRequest</code> request
	 * @return <code>String</code> new project path
	 * @throws IOException
	 */
	private String copyProject(HttpServletRequest request, HttpServletResponse response) throws IOException{
		/*
		 * get the project folder path
		 * e.g.
		 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667
		 */
		String projectFolderPath = (String) request.getAttribute("projectFolderPath");
		
		/*
		 * get the curriculum base
		 * e.g.
		 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum
		 */
		String curriculumBaseDir = (String) request.getAttribute("curriculumBaseDir");
		
		File srcDir = new File(projectFolderPath);
		if(srcDir.exists() && srcDir.isDirectory()){
			if(this.standAlone || SecurityUtils.isAllowedAccess(request, srcDir)){
				File destDir;
				if(curriculumBaseDir != null && curriculumBaseDir != ""){
					destDir = this.createNewprojectPath(new File(curriculumBaseDir));
				} else {
					destDir = this.createNewprojectPath(srcDir.getParentFile());
				}
				
				this.copy(srcDir, destDir);
				return destDir.getName();
			} else {
				response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
				return "unauthorized";
			}
		} else {
			throw new IOException("Provided path is not found or is not a directory. Path: " + projectFolderPath);
		}
	}

	/**
	 * Copies the given <code>File</code> src to the given <code>File</code> dest. If they
	 * are directories, recursively copies the contents of the directories.
	 * 
	 * @param File src
	 * @param File dest
	 * @throws FileNotFoundException
	 * @throws IOException
	 */
	public void copy(File src, File dest) throws FileNotFoundException, IOException{
		if(src.isDirectory()){
			if(!dest.exists()){
				dest.mkdir();
			}
			
			String[] files = src.list();
			for(int a=0;a<files.length;a++){
				copy(new File(src, files[a]), new File(dest, files[a]));
			}
		} else {
			InputStream in = new FileInputStream(src);
			FileOutputStream out = new FileOutputStream(dest);
			
			byte[] buffer = new byte[2048];
			int len;
			while((len = in.read(buffer)) > 0){
				out.write(buffer, 0, len);
			}
			
			in.close();
			out.close();
		}
	}
	
	/**
	 * Given a <code>HttpServletRequest</code> request with the parameters: param1 - full project path including
	 * project filename, param2 - data to write, param3 - node type, param4 - node title, and param5 - node class,
	 * creates a new file with the given data and uses the other parameters to add this node copy to the project file.
	 * Returns the filename if completes successfully.
	 *  
	 * @param <code>HttpServletRequest</code> request
	 * @return <code>String</code> unique filename
	 * @throws <code>IOException</code>
	 * @throws <code>ServletException</code>
	 */
	private void copyNode(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException{
		//get the attributes for the node
		String data = request.getParameter("data");
		String type = request.getParameter("type");
		String title = request.getParameter("title");
		String nodeClass = request.getParameter("nodeClass");
		String contentFile = request.getParameter("contentFile");
		
		/*
		 * get the file name
		 * e.g.
		 * /node_1.or
		 */
		String projectFileName = request.getParameter("projectFileName");
		
		/*
		 * get the project folder path
		 * e.g.
		 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667
		 */
		String projectFolderPath = (String) request.getAttribute("projectFolderPath");
		
		/*
		 * get the full path to the file
		 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667/node_1.or
		 */
		String fullProjectFilePath = projectFolderPath + projectFileName;
		
		File dir = new File(fullProjectFilePath).getParentFile();
		if(dir.exists()){
			File file = this.generateUniqueFile(dir, this.getExtension(type));
			
			if(this.standAlone || SecurityUtils.isAllowedAccess(request, file)){
				/* if this is an html type, change the src filename */
				if(type.equals("HtmlNode") || type.equals("DrawNode") || type.equals("MySystemNode")){
					try{
						File content = new File(dir, contentFile);
						if(content.exists()){
							this.writeFile(new File(dir, file.getName() + "ml"), this.getFileText(content), false);
						}
						JSONObject node = new JSONObject(data);
						node.put("src", file.getName() + "ml");
						this.writeFile(file, node.toString(3), false);
					} catch(JSONException e){
						throw new ServletException(e);
					}
				} else {
					this.writeFile(file, data, false);
				}
				
				File parent = new File(fullProjectFilePath);
				try{
					if(this.addNodeToProject(parent, Template.getProjectNodeTemplate(type, file.getName(), title, nodeClass))){
						response.getWriter().write(file.getName());
						return;
					} else {
						throw new IOException("New node file created: " + file.getName() + "  but could not update project file.");
					}
				} catch (JSONException e){
					e.printStackTrace();
					throw new IOException("New node file created: " + file.getName() + "  but could not update project file.");
				}
			} else {
				response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
			}
		} else {
			throw new IOException("Cannot find provided path, aborting operation.");
		}
	}
	
	/**
	 * Creates the sequence from the specified JSON and adds it to the specified project file.
	 * This is used when duplicating a sequence (aka activity) in the authoring tool.
	 * @param request
	 * @param response
	 * @throws IOException
	 * @throws ServletException
	 */
	private void createSequenceFromJSON(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException{
		/*
		 * get the project file name
		 * e.g.
		 * /wise4.project.json
		 */
		String projectFileName = request.getParameter("projectFileName");
		
		//get the json for the new sequence we are going to add to the project
		String data = request.getParameter("data");
		
		/*
		 * get the project folder path
		 * e.g.
		 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667
		 */
		String projectFolderPath = (String) request.getAttribute("projectFolderPath");
		
		String fullProjectFilePath = projectFolderPath + projectFileName;
		
		File projectFile = new File(fullProjectFilePath);
		if(this.standAlone || SecurityUtils.isAllowedAccess(request, projectFile)){
			try{
				JSONObject sequence = new JSONObject(data);
				JSONObject project = new JSONObject(this.getFileText(projectFile));
				project.getJSONArray("sequences").put(sequence);
				
				this.writeFile(projectFile, project.toString(3), true);
				response.getWriter().write("success");
			} catch(JSONException e){
				throw new ServletException(e);
			}
		} else {
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
		}
	}
	
	/**
	 * Retrieves all of the scripts in the scripts array and writes them out in the <code>HttpServletResponse</code>
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	private void getScripts(HttpServletRequest request, HttpServletResponse response) throws IOException{
		String data = request.getParameter(PARAM1);
		String[] scripts = data.split("~");
		
		ServletContext context = this.getServletContext();
		
		PrintWriter writer = response.getWriter();
		String out = "";
		
		for(String script : scripts){
			InputStream is = context.getResourceAsStream("/" + script);
			if(is != null){
				BufferedReader reader = new BufferedReader(new InputStreamReader(is));
				while((out = reader.readLine())!=null){
					writer.println(out);
				}
			}
		}
			
		writer.println("scriptloader.scriptAvailable(scriptloader.baseUrl + \"vle/filemanager.html?command=getScripts&param1=" + data + "\");");
	}
	
	/**
	 * Updates audio file.  If the specified AudioFile already exists,
	 * do not create it. If it doesn't exist, convert the specified
	 * content to audio and save it at the specified audiofilename.
	 * 
	 * @param request
	 * @param response
	 * @throws IOException 
	 */
	private synchronized String updateAudioFiles(HttpServletRequest request,
			HttpServletResponse response) throws IOException {
		/*
		 * get the project folder path
		 * e.g.
		 * /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/667
		 */
		String projectFolderPath = (String) request.getAttribute("projectFolderPath");
		String audioFilePath = request.getParameter("audioFilePath");
		String content = request.getParameter("content");
		
		File dir = new File(projectFolderPath);
		if(dir.exists()){
			if(this.standAlone || SecurityUtils.isAllowedAccess(request, dir)){
				File file = new File(audioFilePath);
				//File wavfile = new File(audioFilePath.replaceAll(".mp3", ".wav"));
	
				if(file.exists()){   // see if mp3 file or wav file exists
					return "audioAlreadyExists";
				} else {
					/* ensure that parent (probably 'audio') directory exists */
					if(!file.getParentFile().exists()){
						file.getParentFile().mkdirs();
					}
	
					String audioFile = file.getCanonicalPath();
					//audioFile = audioFile.replaceAll(".mp3", ".wav");
					TTS tts = new TTS(audioFile);
					boolean success = tts.saveToFile(content);
					if (success) {
						return "success";
					} else {
						return "failure";
					}
				}
			} else {
				response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
				return "not authorized";
			}
		} else {
			throw new IOException("Unable to find the project");
		}
	}
	
	/**
	 * Compare the child parent and child projects to find differences.
	 * These differences include whether a node was added, deleted,
	 * moved, or not moved and whether the content for the node
	 * was modified.
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	private void reviewUpdateProject(HttpServletRequest request, HttpServletResponse response) throws IOException {
		//stores node id to the node or sequence JSONObject for child project nodes
		HashMap<String, JSONObject> childNodeIdToNodeOrSequence = new HashMap<String, JSONObject>();
		
		//stores the filename to the node id for child project nodes
		HashMap<String, String> childFileNameToId = new HashMap<String, String>();
		
		//stores the node id to the node step number for child project nodes
		HashMap<String, String> childNodeIdToStepNumber = new HashMap<String, String>();
		
		//stores node id to the node or sequence JSONObject for parent project nodes
		HashMap<String, JSONObject> parentNodeIdToNodeOrSequence = new HashMap<String, JSONObject>();
		
		//stores the filename to the node id for parent project nodes
		HashMap<String, String> parentFileNameToNodeId = new HashMap<String, String>();
		
		//stores the node id to the node step number for parent project nodes
		HashMap<String, String> parentNodeIdToStepNumber = new HashMap<String, String>();
		
		//stores the .html file name to the .ht node id
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
		
		//get the curriculum base directory e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum
		String curriculumBaseDir = (String) request.getAttribute("curriculumBaseDir");
		
		//get the relative child project url e.g. /236/wise4.project.json
		String projectUrl = (String) request.getAttribute("projectUrl");
		
		//get the relative parent project url e.g. /235/wise4.project.json
		String parentProjectUrl = (String) request.getAttribute("parentProjectUrl");
		
		//get the child project folder e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/236
		String fullProjectFolderUrl = curriculumBaseDir + projectUrl.substring(0, projectUrl.lastIndexOf(fileSeparator));
		
		//get the child project file e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/236/wise4.project.json
		String fullProjectFileUrl = curriculumBaseDir + projectUrl;
		
		//get the parent project folder e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/235
		String fullParentProjectFolderUrl = curriculumBaseDir + parentProjectUrl.substring(0, parentProjectUrl.lastIndexOf(fileSeparator));
		
		//get the parent project file e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/235/wise4.project.json
		String fullParentProjectFileUrl = curriculumBaseDir + parentProjectUrl;
		
		//get the project JSONObject for parent and child projects
		JSONObject childProject = getProjectJSONObject(fullProjectFileUrl);
		JSONObject parentProject = getProjectJSONObject(fullParentProjectFileUrl);
		
		//parse the parent and child projects to obtain mappings that we will use later
		parseProjectJSONObject(childProject, childNodeIdToNodeOrSequence, childFileNameToId, childNodeIdToStepNumber);
		parseProjectJSONObject(parentProject, parentNodeIdToNodeOrSequence, parentFileNameToNodeId, parentNodeIdToStepNumber);
		
		/*
		 * compare the parent and child folders to determine if node
		 * content files have been modified
		 */
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
		
		//get all the node ids from the parent project
		Set<String> parentKeySet = parentNodeIdToStepNumber.keySet();
		
		//loop through all the sequences and nodes in the parent project 
		Iterator<String> parentIdIterator = parentKeySet.iterator();
		while(parentIdIterator.hasNext()) {
			//get a node id
			String parentId = parentIdIterator.next();
			
			//get the step number for this node id
			String stepNumber = parentNodeIdToStepNumber.get(parentId);
			
			String title = "";
			String nodeType = "";
			
			try {
				//get the JSONObject for the node
				JSONObject parentNode = parentNodeIdToNodeOrSequence.get(parentId);
				
				//get the title and node type
				title = parentNode.getString("title");
				nodeType = parentNode.getString("type");
			} catch (JSONException e) {
				e.printStackTrace();
			}
			
			//create a NodeInfo object with the info from the node
			NodeInfo parentNodeInfo = new NodeInfo(stepNumber, parentId, title, nodeType, "parent");
			
			//add the NodeInfo to the collection
			childAndParentNodes.add(parentNodeInfo);
			
			//add the node id to the collection
			nodeIdsAdded.add(parentId);
		}
		
		//get all the nod ids from the child project
		Set<String> childKeySet = childNodeIdToStepNumber.keySet();
		
		//loop through all the sequences and nodes in the child project
		Iterator<String> childIdIterator = childKeySet.iterator();
		
		while(childIdIterator.hasNext()) {
			//get a node id
			String childId = childIdIterator.next();
			
			//get the step number for this node id
			String stepNumber = childNodeIdToStepNumber.get(childId);
			
			String title = "";
			String nodeType = "";
			
			try {
				//get the JSONObject for the node
				JSONObject childNode = childNodeIdToNodeOrSequence.get(childId);
				
				//get the title and node type
				title = childNode.getString("title");
				nodeType = childNode.getString("type");
			} catch (JSONException e) {
				e.printStackTrace();
			}
			
			//check if we have already added a node with this node id
			if(!nodeIdsAdded.contains(childId)) {
				//we have not added it before
				
				//create a NodeInfo object with the info from the node
				NodeInfo childNodeInfo = new NodeInfo(stepNumber, childId, title, nodeType, "child");
				
				//add the NodeInfo to the collection
				childAndParentNodes.add(childNodeInfo);
				
				//add the node id to the collection
				nodeIdsAdded.add(childId);
			}
		}

		/*
		 * the JSONArray that will contain the status info for all the nodes
		 * such as whether a node was added, deleted, moved, or modified
		 */
		JSONArray nodeStatuses = new JSONArray();
		
		//loop through all the NodeInfo objects 
		Iterator<NodeInfo> childAndParentNodesIterator = childAndParentNodes.iterator();
		while(childAndParentNodesIterator.hasNext()) {
			//get a node
			NodeInfo node = childAndParentNodesIterator.next();
			
			//get the info from the node
			String nodeId = node.getNodeId();
			String stepNumber = node.getStepNumber();
			String title = node.getTitle();
			String nodeType = node.getNodeType();
			
			//get the status of the node ("added", "deleted", "moved", "not moved")
			String status = nodeIdToStatus.get(nodeId);
			
			//get whether the node was modified ("true" or "false")
			String modified = nodeIdToModified.get(nodeId);
			
			if(status == null) {
				//if there is no status value it means it was not moved
				status = "not moved";
			}
			
			if(modified == null) {
				//if there was no modified value it means it was not modified
				modified = "false";
			}
			
			try {
				//put all the values for this node into a JSONObject
				JSONObject nodeStatus = new JSONObject();
				nodeStatus.put("stepNumber", stepNumber);
				nodeStatus.put("title", title);
				nodeStatus.put("nodeId", nodeId);
				nodeStatus.put("status", status);
				nodeStatus.put("modified", modified);
				nodeStatus.put("nodeType", nodeType);
				
				//add the node to the array
				nodeStatuses.put(nodeStatus);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		//return the status array to the client
		response.getWriter().write(nodeStatuses.toString());
	}
	
	/**
	 * Updates the child project by copying the parent project folder to the child project folder
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	private void updateProject(HttpServletRequest request, HttpServletResponse response) throws IOException {
		String fileSeparator = System.getProperty("file.separator");
		
		//get the curriculum base directory e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum
		String curriculumBaseDir = (String) request.getAttribute("curriculumBaseDir");
		
		//get the relative child project url e.g. /236/wise4.project.json
		String childProjectUrl = (String) request.getAttribute("projectUrl");
		
		//get the relative parent project url e.g. /235/wise4.project.json
		String parentProjectUrl = (String) request.getAttribute("parentProjectUrl");
		
		//get the child project folder e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/236
		String fullChildProjectFolderUrl = curriculumBaseDir + childProjectUrl.substring(0, childProjectUrl.lastIndexOf(fileSeparator));
		
		//get the parent project folder e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/235
		String fullParentProjectFolderUrl = curriculumBaseDir + parentProjectUrl.substring(0, parentProjectUrl.lastIndexOf(fileSeparator));
		
		//create a backup of the project by renaming the folder
		renameFolder(fullChildProjectFolderUrl);
		
		//copy the parent project folder contents to this project's folder
		copyFile(new File(fullParentProjectFolderUrl), new File(fullChildProjectFolderUrl));
	}
	
	/**
	 * Import the steps from one project to another project
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	private void importSteps(HttpServletRequest request, HttpServletResponse response) throws IOException {
		//the file separator for the OS e.g. /
		String fileSeparator = System.getProperty("file.separator");
		
		//get the curriculum base directory e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum
		String curriculumBaseDir = (String) request.getAttribute("curriculumBaseDir");
		
		
		//get the relative child project url e.g. /236/wise4.project.json
		String toProjectUrl = (String) request.getAttribute("projectUrl");
		
		//get the full project file url e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/236/wise4.project.json
		String fullToProjectFileUrl = curriculumBaseDir + toProjectUrl;
		
		//get the project folder e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/236
		String fullToProjectFolderUrl = curriculumBaseDir + toProjectUrl.substring(0, toProjectUrl.lastIndexOf(fileSeparator));
		File toProjectFolder = new File(fullToProjectFolderUrl);
		
		//get the project assets folder e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/236/assets
		String toProjectAssetsUrl = fullToProjectFolderUrl + "/assets";
		File toProjectAssetsFolder = new File(toProjectAssetsUrl);
		
		
		//get the relative child project url e.g. /172/wise4.project.json
		String fromProjectUrl = (String) request.getAttribute("fromProjectUrl");
		
		//get the full project file url e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/172/wise4.project.json
		String fullFromProjectFileUrl = curriculumBaseDir + fromProjectUrl;
		
		//get the project folder e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/172
		String fullFromProjectFolderUrl = curriculumBaseDir + fromProjectUrl.substring(0, fromProjectUrl.lastIndexOf(fileSeparator));
		File fromProjectFolder = new File(fullFromProjectFolderUrl);
		
		//get the project assets folder e.g. /Users/geoffreykwan/dev/apache-tomcat-5.5.27/webapps/curriculum/172/assets
		String fromProjectAssetsUrl = fullFromProjectFolderUrl + "/assets";
		File fromProjectAssetsFolder = new File(fromProjectAssetsUrl);
		
		//get the project file in the "from" project
		String fromProjectFileContent = FileUtils.readFileToString(new File(fullFromProjectFileUrl));
		JSONObject fromProjectJSON = null;
		
		try {
			fromProjectJSON = new JSONObject(fromProjectFileContent);
		} catch (JSONException e1) {
			e1.printStackTrace();
		}
		
		//get all the files we need to import
		String nodeIds = (String) request.getParameter("nodeIds");
		JSONArray nodeIdsArray = null;
		
		try {
			//get all the file names in an array
			nodeIdsArray = new JSONArray(nodeIds);
			
			//loop through all the file names
			for(int x=0; x<nodeIdsArray.length(); x++) {
				//get node id
				String nodeId = nodeIdsArray.getString(x);
				
				//get the node object in the "from" project
				JSONObject fromNode = getNodeById(fromProjectJSON, nodeId);
				
				if(fromNode != null) {
					//get the attributes of the node in the "from" project
					String type = fromNode.optString("type");
					String id = nodeId;
					String title = fromNode.optString("title");
					String nodeClass = fromNode.optString("class");
					String fileName = fromNode.optString("ref");
					
					//make sure the file exists in the fromProjectFolder
					File fileToImport = new File(fromProjectFolder, fileName);
					
					if(fileToImport.exists()) {
						//get the content from the step
						String fileContent = FileUtils.readFileToString(fileToImport);
						
						//the part of the file name before the . e.g. "node_5"
						String fileNamePrefix = getUniqueFileNamePrefix(toProjectFolder);
						
						//the part of the file name after the . (including the .) e.g. ".or"
						String fileNameExtension = fileName.substring(fileName.indexOf("."));
						
						//make the name of the new file we want to make
						String newFileName = fileNamePrefix + fileNameExtension;
						
						/*
						 * check if we are importing a .ht file since we also need to
						 * import the associated .html file
						 */
						if(fileNameExtension.equals(".ht")) {
							//get the html file name
							String htmlFileName = fileName + "ml";
							
							//get a handle on the html file in the "from" project
							File htmlFileToImport = new File(fromProjectFolder, htmlFileName);
							
							if(htmlFileToImport.exists()) {
								//get the contents of the html file
								String htmlString = FileUtils.readFileToString(htmlFileToImport);
								
								//import assets that are referenced in the html content
								htmlString = importAssetsInContent(htmlString, fromProjectAssetsFolder, toProjectAssetsFolder);
								
								//make the html file name for our "to" project
								String newHtmlFileName = newFileName + "ml";
								
								//make the new html file in our "to" project
								File newHtmlFile = new File(toProjectFolder, newHtmlFileName);
								
								//write the content to the file in the "to" project
								FileUtils.writeStringToFile(newHtmlFile, htmlString);
								
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
						}
						
						//import assets that are reference in the step content
						fileContent = importAssetsInContent(fileContent, fromProjectAssetsFolder, toProjectAssetsFolder);
						
						//create a new file in our project
						File newFile = new File(toProjectFolder, newFileName);
						
						//write the contents to the new file
						FileUtils.writeStringToFile(newFile, fileContent);
						
						//create the node object that we will put in our "to" project
						JSONObject newNode = Template.getProjectNodeTemplate(type, newFileName, title, nodeClass);
						
						//add the node to our "to" project
						this.addNodeToProject(new File(fullToProjectFileUrl), newNode);
					}
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Search for any references to assets in the step content and copy the assets to our assets folder
	 * @param content the step content
	 * @param fromProjectAssetsFolder the project we are copying the asset from
	 * @param toProjectAssetsFolder the project we are copying the asset to
	 */
	private String importAssetsInContent(String content, File fromProjectAssetsFolder, File toProjectAssetsFolder) {
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
		
		//run the matcher
		Matcher m = p.matcher(content);
		
		//loop through all the matches
		while(m.find()) {
			if(m.groupCount() == 2) {
				//the file name e.g. myPicture.jpg
				String fromAssetFileName = m.group(2);

				if(fromAssetFileName != null && !fromAssetFileName.isEmpty()) {
					if(fromAssetFileName.contains("?")) {
						/*
						 * the file name contains GET params e.g. sunlight.jpg?w=12&h=12
						 * so we will remove everything after the ?
						 */
						fromAssetFileName = fromAssetFileName.substring(0, fromAssetFileName.indexOf("?"));
					}
					
					//create the file handle for the "from" file
					File fromAsset = new File(fromProjectAssetsFolder, fromAssetFileName);
					
					//make sure the file exists in the "from" project
					if(fromAsset.exists()) {
						//create the file handle for the "to" file
						String toAssetFileName = fromAssetFileName;
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
						while(!assetCompleted) {
							if(toAsset.exists()) {
								//file already exists
								
								try {
									if(FileUtils.contentEquals(fromAsset, toAsset)) {
										//files are the same so we do not need to do anything
										assetCompleted = true;
									} else {
										//files are not the same so we need to try a different file name
										
										//get new file name e.g. myPicture-1.jpg
										toAssetFileName = createNewFileName(fromAssetFileName, counter);

										//create the handle for the next file we will try to use
										toAsset = new File(toProjectAssetsFolder, toAssetFileName);
										
										counter++;
									}
								} catch (IOException e) {
									e.printStackTrace();
									break;
								}
							} else {
								//file does not exist so we will copy the file to the "to" assets folder
								
								try {
									//copy the file into our new asset file
									FileUtils.copyFile(fromAsset, toAsset);
									assetCompleted = true;
								} catch (IOException e) {
									e.printStackTrace();
									break;
								}
							}
						}

						//replace references to the file name in the content if we changed the file name
						if(fromAssetFileName != null && toAssetFileName != null &&
								!fromAssetFileName.equals(toAssetFileName)) {
							content = content.replaceAll(fromAssetFileName, toAssetFileName);					
						}					
					}
				}
			}
		}
		
		return content;
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
	private String createNewFileName(String fileName, int counter) {
		String newFileName = "";
		
		int lastDot = fileName.lastIndexOf(".");

		//get the beginning of the file e.g. myPicture
		String fileNameBeginning = fileName.substring(0, lastDot);
		
		//get the end of the file e.g. .jpg
		String fileNameEnding = fileName.substring(lastDot);
		
		//create the new file name e.g. myPicture-1.jpg
		newFileName = fileNameBeginning + "-" + counter + fileNameEnding;
		
		return newFileName;
	}
	
	/**
	 * Get the node JSONObject from the project JSON
	 * @param projectJSON the project JSON object
	 * @param nodeId the node id
	 * @return the JSONObject for the node in the project
	 */
	private JSONObject getNodeById(JSONObject projectJSON, String nodeId) {
		JSONObject node = null;
		
		if(nodeId != null && !nodeId.equals("")) {
			try {
				//get the array of nodes in the project
				JSONArray fromProjectNodes = projectJSON.getJSONArray("nodes");
				
				//loop through all the nodes in the project
				for(int x=0; x<fromProjectNodes.length(); x++) {
					//get a node
					JSONObject tempNode = fromProjectNodes.getJSONObject(x);
					
					if(tempNode != null) {
						//get the node id
						String id = tempNode.getString("identifier");
						
						if(nodeId.equals(id)) {
							//the node id matches the one we want so we are done searching
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
	private void renameFolder(String projectUrl) {
		//get a handle on the folder
		File originalFolder = new File(projectUrl);
		
		//get the current time
		Date date = new Date();
		
		//create a handle to the new folder name
		File backupFolder = new File(projectUrl + "-" + date.getTime());
		
		//rename the original folder to the new folder name
		originalFolder.renameTo(backupFolder);
	}
	
	/**
	 * Copy the contents of a folder to another folder. This is a recursive function
	 * that deep copies folders.
	 * @param sourceLocation the folder that contains the files we want to copy
	 * @param targetLocation the folder we want to copy the files to
	 * @throws IOException
	 */
	private void copyFile(File sourceLocation, File targetLocation) throws IOException {
        if (sourceLocation.isDirectory()) {
        	//current file is a folder
        	
            if (!targetLocation.exists()) {
            	//make the folder in the target folder if it does not already exist
                targetLocation.mkdir();
            }
            
            //get the files in the folder
            String[] children = sourceLocation.list();
            
            //loop through all the files
            for (int i=0; i<children.length; i++) {
            	//copy the file
            	copyFile(new File(sourceLocation, children[i]),
                        new File(targetLocation, children[i]));
            }
        } else {
            //current file is a file
        	
        	//create stream to read from the source and write to the target
            InputStream in = new FileInputStream(sourceLocation);
            OutputStream out = new FileOutputStream(targetLocation);
            
            //buffer to hold the bytes to copy
            byte[] buf = new byte[1024];
            int len;
            
            //loop through all the bytes in the source file
            while ((len = in.read(buf)) > 0) {
            	//write the byte to the target file
                out.write(buf, 0, len);
            }
            
            //close the streams
            in.close();
            out.close();
        }
	}

	/**
	 * An object to hold information for a node. A node can be a sequence
	 * or a node. 
	 */
	public class NodeInfo {
		//the step number as seen in the vle
		private String stepNumber;
		
		//the id of the node
		private String nodeId;
		
		//the title of the node
		private String title;
		
		//the type of the node e.g. 'HtmlNode', 'OpenResponseNode', 'sequence', etc.
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
	public class NodeInfoComparator implements Comparator<NodeInfo> {
		
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
			//the default return value
			int result = 0;
			
			//get the step numbers
			String node1StepNumber = node1.getStepNumber();
			String node2StepNumber = node2.getStepNumber();
			
			//get the node ids
			String nodeId1 = node1.getNodeId();
			String nodeId2 = node2.getNodeId();
			
			if(nodeId1 != null && nodeId2 != null) {
				//compare the node ids
				if(nodeId1.equals(nodeId2)) {
					/*
					 * the node ids are the same so we will return 0 to
					 * specify that these two NodeInfo objects are the same
					 */
					return 0;
				}
			}
			
			if(node1StepNumber != null && node2StepNumber != null) {
				//compare the step numbers

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
				
				//loop through all the parts in the arrays
				for(int x=0; x<maxLength; x++) {
					if(node1Split.length - 1 < x) {
						/*
						 * node1 has run out of parts while node 2 still has parts.
						 * this will only happen if the node1 array is shorter than
						 * the node2 array.
						 */
						result = -1;
						break;
					} else if(node2Split.length - 1 < x) {
						/*
						 * node2 has run out of parts while node 1 still has parts.
						 * this will only happen if the node2 array is shorter than
						 * the node1 array.
						 */
						result = 1;
						break;
					} else {
						//both nodes still have parts
						
						//get the xth element in each array
						String node1Part = node1Split[x];
						String node2Part = node2Split[x];
						
						//get the int value
						int node1PartNum = Integer.parseInt(node1Part);
						int node2PartNum = Integer.parseInt(node2Part);
						
						if(node1PartNum > node2PartNum) {
							//node1 part is larger than node2 part
							result = 1;
							break;
						} else if(node1PartNum < node2PartNum) {
							//node2 part is larger than node1 part
							result = -1;
							break;
						} else {
							/*
							 * the parts are the same value so we will continue
							 * on with the for loop to look at the next xth 
							 * element
							 */
						}
					}
				}
			}
			
			if(result == 0) {
				//step numbers are the same so we will now compare the node ids
				
				if(nodeId1 != null && nodeId2 != null) {
					
					if(!nodeId1.equals(nodeId2)) {
						//node ids are not the same which means these are different nodes.
						
						if(node1.getParentOrChild() == null) {
							//just return a non 0 value to specify that the nodes are different
							result = 1;
						} else if(node1.getParentOrChild().equals("parent")) {
							/*
							 * the nodes are different so we will return a non 0 value.
							 * in this case we will try to be consistent by putting parent
							 * nodes after child nodes
							 */
							result = 1;
						} else if(node1.getParentOrChild().equals("child")) {
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
	private JSONObject getProjectJSONObject(String projectUrl) {
		JSONObject projectJSONObject = null;
		
		//get the project file
		File projectFile = new File(projectUrl);
		
		try {
			//get the contents of the file as a string
			String projectJSONString = FileUtils.readFileToString(projectFile);
			
			//create a JSONObject from the string
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
	private void parseProjectJSONObject(JSONObject projectJSON, 
			HashMap<String, JSONObject> nodeIdToNodeOrSequence,
			HashMap<String, String> fileNameToNodeId,
			HashMap<String, String> nodeIdToStepNumber) {
		
		try {
			//get the nodes in the project
			JSONArray projectNodes = projectJSON.getJSONArray("nodes");
			
			//loop through all the nodes
			for(int x=0; x<projectNodes.length(); x++) {
				//get a node
				JSONObject node = projectNodes.getJSONObject(x);
				
				//get the node id
				String identifier = node.getString("identifier");
				
				//get the filename
				String ref = node.getString("ref");
				
				//add the entries into the HashMaps
				fileNameToNodeId.put(ref, identifier);
				nodeIdToNodeOrSequence.put(identifier, node);
			}
			
			//get the sequences in the project
			JSONArray projectSequences = projectJSON.getJSONArray("sequences");
			
			//loop through all the sequences
			for(int y=0; y<projectSequences.length(); y++) {
				//get a sequence
				JSONObject sequence = projectSequences.getJSONObject(y);
				
				//get the node id
				String identifier = sequence.getString("identifier");
				
				//add an entry into the HashMap
				nodeIdToNodeOrSequence.put(identifier, sequence);
			}
			
			//get the start point for the project
			String startPoint = projectJSON.getString("startPoint");
			JSONObject startPointSequence = nodeIdToNodeOrSequence.get(startPoint);

			//parse the project by traversing through the project from start to finish 
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
	private void parseNodeStepNumbers(String stepNumber, JSONObject node, HashMap<String, JSONObject> nodeIdToNodeOrSequence, HashMap<String, String> nodeIdToStepNumber) {
		
		try {
			//get the node type
			String nodeType = node.getString("type");
			
			if(node.getString("type") != null && nodeType.equals("sequence")) {
				//node is a sequence
				
				//get the nodes in the sequence
				JSONArray refs = node.getJSONArray("refs");
				
				/*
				 * check if stepNumber is "", if it is "" it means we are on the
				 * start sequence and we do not need to add an entry for that
				 * but we need to add an entry for all activities and steps
				 */
				if(!stepNumber.equals("")) {
					//this is an activity or step
					
					//get the node id
					String identifier = node.getString("identifier");
					
					//add an entry into the HashMap
					nodeIdToStepNumber.put(identifier, stepNumber);
				}
				
				if(refs != null) {
					//loop through all the nodes in the sequence
					for(int x=0; x<refs.length(); x++) {
						//get a child id
						String childRef = refs.getString(x);
						
						//get the JSONObject for the child
						JSONObject childNode = nodeIdToNodeOrSequence.get(childRef);
						
						/*
						 * make the step number, if we are on activity 1,
						 * stepNumber would be 1 and childStepNumber would
						 * be set to 1 at the moment
						 */
						String childStepNumber = stepNumber;
						
						if(!childStepNumber.equals("")) {
							//add a "." between each level
							childStepNumber += ".";
						}
						
						/*
						 * add the step number, if we are on activity 1,
						 * step 2, childStepNumber would be set to
						 * 1.2
						 */
						childStepNumber += (x + 1);
						
						//recursively parse the children's children
						parseNodeStepNumbers(childStepNumber, childNode, nodeIdToNodeOrSequence, nodeIdToStepNumber);
					}
				}
			} else {
				//node is a leaf node
				
				//get the node id
				String identifier = node.getString("identifier");

				//add an entry into the HashMap
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
	private void compareSequences(JSONObject parentProjectNode, JSONObject childProjectNode, 
			HashMap<String, JSONObject> parentNodeIdToNodeOrSequence, HashMap<String, JSONObject> childNodeIdToNodeOrSequence, 
			HashMap<String, String> parentNodeIdToStepNumber, HashMap<String, String> childNodeIdToStepNumber,
			HashMap<String, String> nodeIdToStatus, HashMap<String, String> nodeIdToModified) {
		//a TreeSet to gather all the unique sequence ids from the parent and child projects
		TreeSet<String> sequenceIds = new TreeSet<String>();
		
		try {
			//get the sequences in the parent project
			JSONArray parentProjectSequences = parentProjectNode.getJSONArray("sequences");
			
			//get the sequences in the child project
			JSONArray childProjectSequences = childProjectNode.getJSONArray("sequences");
			
			//retrieve all the sequence ids from the parent and child projects
			extractNodeIdsFromSequenceNodeJSONArray(sequenceIds, parentProjectSequences);
			extractNodeIdsFromSequenceNodeJSONArray(sequenceIds, childProjectSequences);
			
			//loop through all the sequence ids we have just collected
			Iterator<String> sequenceIdsIterator = sequenceIds.iterator();
			while(sequenceIdsIterator.hasNext()) {
				//get a sequence id
				String sequenceId = sequenceIdsIterator.next();
				
				/*
				 * try to retrieve the sequence JSONObject from the child and parent project.
				 * the sequence id may be in only one of the projects if one of the projects
				 * has been changed.
				 */
				JSONObject childSequence = childNodeIdToNodeOrSequence.get(sequenceId);
				JSONObject parentSequence = parentNodeIdToNodeOrSequence.get(sequenceId);
				
				if(childSequence != null && parentSequence != null) {
					/*
					 * both parent and child projects have this sequence so we will compare
					 * the nodes within them
					 */
					
					//get the array of child ids from both sequences
					JSONArray parentRefs = parentSequence.getJSONArray("refs");
					JSONArray childRefs = childSequence.getJSONArray("refs");
					
					//a TreeSet to collect all the node ids for the current sequence
					TreeSet<String> nodeIds = new TreeSet<String>();
					
					//retrieve all the sequence ids from the current parent and child sequence
					extractNodeIdsFromJSONArray(nodeIds, parentRefs);
					extractNodeIdsFromJSONArray(nodeIds, childRefs);
					
					/*
					 * flag to be set if there is a difference between the parent and 
					 * child sequence in terms of node existence and node comparison.
					 * this will not take into consideration the modification of a
					 * node's content. node modification is handled somewhere else.
					 */
					boolean sequenceModified = false;
					
					//loop through all the node ids we found
					Iterator<String> nodeIdsIterator = nodeIds.iterator();
					while(nodeIdsIterator.hasNext()) {
						//get a node id
						String nodeId = nodeIdsIterator.next();
						
						//get the node from the parent and child project
						JSONObject parentNode = parentNodeIdToNodeOrSequence.get(nodeId);
						JSONObject childNode = childNodeIdToNodeOrSequence.get(nodeId);
						
						if(childNode != null && parentNode != null) {
							/*
							 * node exists in both parent and child project so we will
							 * check if the node is in the same position or if it was moved
							 */
							
							//get the step number for the node in the parent and child project
							String parentStepNumber = parentNodeIdToStepNumber.get(nodeId);
							String childStepNumber = childNodeIdToStepNumber.get(nodeId);
							
							if(childStepNumber != null && parentStepNumber != null) {
								if(!childStepNumber.equals(parentStepNumber)) {
									//step numbers are different so the step was moved
									nodeIdToStatus.put(nodeId, "moved");
									
									//the sequence is different between parent and child project
									sequenceModified = true;
								}
							}
						} else if(childNode != null && parentNode == null) {
							/*
							 * node was only found in the child project which means
							 * the node will be deleted from child project
							 */
							nodeIdToStatus.put(nodeId, "deleted");
							
							//the sequence is different between parent and child project
							sequenceModified = true;
						} else if(childNode == null && parentNode != null) {
							/*
							 * node was only found in the parent project which means
							 * the node will be added to child project
							 */
							nodeIdToStatus.put(nodeId, "added");
							
							//the sequence is different between parent and child project
							sequenceModified = true;
						}
					}
					
					if(sequenceModified) {
						//sequence was modified
						nodeIdToModified.put(sequenceId, "true");
					} else {
						//sequence was not modified
						nodeIdToModified.put(sequenceId, "false");
					}
					
				} else if(childSequence != null && parentSequence == null) {
					/*
					 * child project has this sequence but parent project does not so
					 * we will check if the nodes in the child project sequence are
					 * new to the parent project because it is possible the child
					 * project had the nodes moved to a new sequence.
					 */
					
					/*
					 * set the status of this sequence to be deleted since the parent
					 * project does not have this sequence
					 */
					nodeIdToStatus.put(sequenceId, "deleted");

					//get the array of node ids in the sequence from the child project
					JSONArray childRefs = childSequence.getJSONArray("refs");
					
					//loop through all the node ids
					for(int x=0; x<childRefs.length(); x++) {
						//get a node id
						String nodeId = childRefs.getString(x);
						
						//try to retrieve the node with the given node id from the parent project
						JSONObject parentNode = parentNodeIdToNodeOrSequence.get(nodeId);
						
						if(parentNode == null) {
							//parent does not have this node so it will be deleted
							nodeIdToStatus.put(nodeId, "deleted");
						} else {
							//parent does have this node so it was just moved to another sequence
							nodeIdToStatus.put(nodeId, "moved");
						}
					}
				} else if(childSequence == null && parentSequence != null) {
					/*
					 * parent project has this sequence but child project does not so
					 * we will check if the nodes in the parent project sequence are
					 * new to the child project
					 */
					
					/*
					 * set the status of this sequence to be added since the child
					 * project does not have this sequence
					 */
					nodeIdToStatus.put(sequenceId, "added");
					
					//get the array of node ids in the sequence from the child project
					JSONArray parentRefs = parentSequence.getJSONArray("refs");
					
					//loop through all the node is
					for(int x=0; x<parentRefs.length(); x++) {
						//get a node id
						String nodeId = parentRefs.getString(x);
						
						//try to retrieve the node with the given node id from the child project
						JSONObject childNode = childNodeIdToNodeOrSequence.get(nodeId);
						
						if(childNode == null) {
							//child does not have this node so it will be added
							nodeIdToStatus.put(nodeId, "added");
						} else {
							//child does have this node so it was just moved to another sequence
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
	private void extractNodeIdsFromJSONArray(TreeSet<String> nodeIds, JSONArray nodeIdsArray) {
		//loop through all the node ids in the array
		for(int x=0; x<nodeIdsArray.length(); x++) {
			try {
				//get a node id
				String ref = nodeIdsArray.getString(x);
				
				//add the node id to the TreeSet
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
	private void extractNodeIdsFromSequenceNodeJSONArray(TreeSet<String> nodeIds, JSONArray sequenceNodes) {
		//loop through all the sequences
		for(int x=0; x<sequenceNodes.length(); x++) {
			try {
				//get a sequence
				JSONObject sequence = sequenceNodes.getJSONObject(x);
				
				//get the sequence id
				String identifier = sequence.getString("identifier");
				
				//add the sequence id to the TreeSet
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
	private void compareFolder(File sourceLocation, File targetLocation, 
			HashMap<String, String> parentFileNameToNodeId, HashMap<String, String> htmlToHt,
			HashMap<String, String> nodeIdToModified) throws IOException {
        if(sourceLocation.exists() && targetLocation.exists()) {
        	//file or folder exists in parent and child project
        	
        	if(sourceLocation.isDirectory() && targetLocation.isDirectory()) {
        		//compare the contents of the folders
        		compareFolderHelper(sourceLocation, targetLocation, parentFileNameToNodeId, htmlToHt, nodeIdToModified);
        	} else if(sourceLocation.isFile() && targetLocation.isFile()) {
        		/*
            	 * file exists in parent and child project so we will now compare the
            	 * file from the parent project and the child project
            	 */
            	
        		//get the file name
            	String fileName = sourceLocation.getName();
            	
            	/*
            	 * get the node id of the node that this file is for. if the
            	 * filename is a .html file, it will not have an associated
            	 * node id but we will handle that below
            	 */
                String nodeId = parentFileNameToNodeId.get(fileName);
                
            	//get the contents from both files
                String sourceFile = FileUtils.readFileToString(sourceLocation);
                String targetFile = FileUtils.readFileToString(targetLocation);
                
                if(sourceFile != null && targetFile != null) {
                	
                    if(fileName.toLowerCase().endsWith(".ht")) {
                    	//this is a .ht file
    					try {
    						//retrieve the content of the .ht file
    						JSONObject sourceFileContent = new JSONObject(sourceFile);
    						
    						//retrieve the .html file name associated with this .ht file
    						String referencedHtmlFileName = sourceFileContent.getString("src");

    						//add an entry into the HashMap that stores .html file name to node id
    	                	htmlToHt.put(referencedHtmlFileName, nodeId);
    					} catch (JSONException e) {
    						e.printStackTrace();
    					}
                    } else if(fileName.toLowerCase().endsWith(".html")) {
                    	//this is a .html file
                    	
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
                    
                	//check if there is any difference between the the content of the files
                	if(!sourceFile.equals(targetFile)) {
                		//content in the files are not the same so the file was modified
                		nodeIdToModified.put(nodeId, "true");
                	} else {
                		//content in the files are the same so the file was not modified
                		nodeIdToModified.put(nodeId, "false");
                	}
                }
        	} else if(sourceLocation.isDirectory() && targetLocation.isFile()) {
        		
        	} else if(sourceLocation.isFile() && targetLocation.isDirectory()) {
        		
        	}
        	
        	
        } else if(sourceLocation.exists() && !targetLocation.exists()) {
        	if(sourceLocation.isDirectory()) {
        		//compare the contents of the folders
        		compareFolderHelper(sourceLocation, targetLocation, parentFileNameToNodeId, htmlToHt, nodeIdToModified);
        	} else if(sourceLocation.isFile()) {
        		/*
            	 * file does not exist in the child project so it is new in the
            	 * parent project or was deleted in the child project. from the
            	 * author's point of view, the file will be added to the child 
            	 * project. this will be handled in compareSequences().
            	 */
        	}
        } else if(!sourceLocation.exists() && targetLocation.exists()) {
        	if(targetLocation.isDirectory()) {
        		//compare the contents of the folders
        		compareFolderHelper(sourceLocation, targetLocation, parentFileNameToNodeId, htmlToHt, nodeIdToModified);
        	} else if(targetLocation.isFile()) {
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
	private void compareFolderHelper(File sourceLocation, File targetLocation, 
			HashMap<String, String> parentFileNameToNodeId, HashMap<String, String> htmlToHt,
			HashMap<String, String> nodeIdToModified) throws IOException {
		//used to retrieve all the file names
        TreeSet<String> files = new TreeSet<String>();
        
        if(sourceLocation.isDirectory()) {
        	//get all the files in the child project folder
        	String[] sourceChildren = sourceLocation.list();
        	
        	//add the file names to the files collection
        	addFileNamesToCollection(files, sourceChildren);
        }
        
        if(targetLocation.isDirectory()) {
        	//get all the files in the parent project folder
        	String[] targetChildren = targetLocation.list();

        	//add the file names to the files collection
        	addFileNamesToCollection(files, targetChildren);
        }
        
        //loop through all the file names
        Iterator<String> iterator = files.iterator();
        while(iterator.hasNext()) {
        	//get a file name
        	String file = iterator.next();
        	
        	/*
        	 * call compareFolder on the file which compares the file in the
        	 * parent and child project folders even if the file exists or not
        	 */
        	compareFolder(new File(sourceLocation, file), new File(targetLocation, file), parentFileNameToNodeId, htmlToHt, nodeIdToModified);
        }
	}
	
	/**
	 * Adds the file names from the array to the collection
	 * @param fileNameCollection collection that holds all the file names
	 * @param fileNames an array of file names
	 */
	private void addFileNamesToCollection(TreeSet<String> fileNameCollection, String[] fileNames) {
		//loop through all the file names
		for (int i=0; i<fileNames.length; i++) {
			//add the file name to the collection
			fileNameCollection.add(fileNames[i]);
        }
	}
	
	/**
	 * Get the amount of disk space this project uses and the max project size
	 * @param request
	 * @param response
	 */
	private void getProjectUsageAndMax(HttpServletRequest request, HttpServletResponse response) {
		//get the path to the folder
		String path = (String) request.getAttribute("projectFolderPath");
		
		//get the amount of disk space the project folder uses
		String sizeUsed = this.getProjectSize(path);
		
		//get the max project size for this project if it was separately specified for this project
		Long projectMaxTotalAssetsSizeLong = (Long) request.getAttribute("projectMaxTotalAssetsSize");
		String projectMaxTotalAssetsSizeString = null;
		if (projectMaxTotalAssetsSizeLong != null) {
			//get the max project size as a string
			projectMaxTotalAssetsSizeString = projectMaxTotalAssetsSizeLong.toString();
		} else {
			//get the global max project size value, we will default to 15MB if none is provided in the vle.properties file
			projectMaxTotalAssetsSizeString = vleProperties.getProperty("project_max_total_assets_size", "15728640");
		}
		
		//get the project folder size usage as a fraction
		String usageString = sizeUsed + "/" + projectMaxTotalAssetsSizeString;
		
		try {
			//write the usage string to the response
			response.getWriter().write(usageString);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Returns the size in bytes of all of the files in the specified path/dirname
	 * 
	 * @param path the path to the project folder
	 * @return the size of the folder in bytes as a string
	 */
	private String getProjectSize(String path){
		if(path==null){
			return "No project path specified";
		} else {
			File projectDir = new File(path);
			if(projectDir.exists()){
				if(projectDir.isDirectory()){
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
}