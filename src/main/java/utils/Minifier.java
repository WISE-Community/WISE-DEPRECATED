package utils;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Date;

import javax.servlet.Servlet;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.yahoo.platform.yui.compressor.YUICompressor;

/**
 * Servlet implementation class for Servlet: Minifier
 * 
 * @author patrick lawler
 */
public class Minifier extends HttpServlet implements Servlet{
	
	private static final long serialVersionUID = 1L;
	
	private static final String COMMAND = "command";
	
	private FileManager filemanager;
	 
	private boolean standAlone = true;
	
	private boolean modeRetrieved = false;
	
	public Minifier(){
		super();
		this.filemanager = new FileManager();
	}
	
	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doPost(request, response);
	}
	
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
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
	
	/**
	 * Handles the processing of POST's and GET's
	 * 
	 * @param request
	 * @param response
	 * @throws ServletException
	 * @throws IOException
	 */
	private void doRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
		String command = request.getParameter(COMMAND);
		
		if(command != null && (!command.equals(""))){
			if(command.equals("minify")){
				this.minify(request, response);
			} else if(command.equals("getTimestamp")){
				response.getWriter().write(String.valueOf(new Date().getTime()));
			} else if(command.equals("minifyProject")){
				try{
					this.minifyProject(request, response);
				} catch (ServletException ex){
					ex.printStackTrace();
					response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				} catch (IOException e){
					e.printStackTrace();
					response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				}
			} else {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST);
			}
		} else {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST);
		}
	}
	
	/**
	 * Given a <code>HttpServletRequest</code> request
	 * 
	 * @param <code>HttpServletRequest</code> request
	 */
	private void minify(HttpServletRequest request, HttpServletResponse response) throws IOException{
		//get parameters and initialize variables
		String data = request.getParameter("scripts");
		String view = request.getParameter("view");
		String path = request.getParameter("path");
		
		if(path != null && !path.equals("") && (this.standAlone || SecurityUtils.isAllowedAccess(request, path))){
			if(data != null && data !="" && view != null && view != ""){
				File allScripts = this.writeAllScripts(data, view, path);
				this.shrink(allScripts);
			} else {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST);
			}
		} else {
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
		}
	}
	
	/**
	 * Given <code>String</code> data, a ~ delimited string of paths to scripts and <code>String</code> view, 
	 * reads in all of the .js files in paths and writes them to the all scripts file. Returns <code>File</code>
	 * the allMainScripts.js file upon completion.
	 * 
	 * @param <code>String</code> data
	 * @param <code>String</code> path
	 * @return <code>File</code> the allMainScripts.js file
	 * @throws <code>IOException</code>
	 */
	private File writeAllScripts(String data, String view, String path) throws IOException{
		String[] scripts = data.split("~");
		
		ServletContext context = this.getServletContext();
		
		/* Create path if it does not exist */
		File dir = new File(path);
		if(!dir.exists()){
			dir.mkdirs();
		}
		
		//create view all file if it doesn't exist, wipe out existing and create new if it does
		File file = new File(dir, view + "_all.js");
		if(file.exists()){
			file.delete();
		}
		file.createNewFile();
		
		//read all scripts into one string
		for(String script : scripts){
			int size;
		    byte[] buffer = new byte[4096];
			BufferedInputStream bis = new BufferedInputStream(context.getResourceAsStream("/" + script));
			BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(file, true), buffer.length);
		    while ((size = bis.read(buffer, 0, buffer.length)) != -1) {
		    	bos.write(buffer, 0, size);
		    }
		    bos.write(Template.NL.getBytes(),0,Template.NL.getBytes().length);
		    bos.flush();
		    bos.close();
		    bis.close();
		}
		
		return file;
	}
	
	/**
	 * Given a <code>File</code> allScripts, extracts the filename and uses YUICompressor
	 * to minify the file.
	 * 
	 * @param <code>allScripts</code>
	 * @throws <code>IOException</code>
	 */
	@SuppressWarnings("static-access")
	private void shrink(File allScripts) throws IOException{
		String rootFile = allScripts.getCanonicalPath();
		String minFile = rootFile.substring(0, rootFile.lastIndexOf("."));
		String[] args = {"-o", minFile + "-min.js", rootFile};
		YUICompressor yComp = new YUICompressor();
		yComp.main(args);
		
		File min = new File(minFile + "-min.js");
		FileOutputStream out = new FileOutputStream(min, true);
		String eventCloser = "if(typeof eventManager != \"undefined\"){eventManager.fire(\"scriptLoaded\", \"vle/all/" + min.getName() + "\");};";
		out.write(eventCloser.getBytes());
		out.flush();
		out.close();
	}
	
	/**
	 * Minifies the project and the individual project's node's content files into one file, caches it as a file in
	 * the project directory and returns the minified string in the response.
	 * 
	 * @param request
	 * @param response
	 * @throws ServletException
	 * @throws IOException
	 */
	private void minifyProject(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
		String path = request.getParameter("path");
		
		if(path != null && !path.equals("") && (this.standAlone || SecurityUtils.isAllowedAccess(request, path))){
			File projectFile = new File(path);
			int lastIndexOfDotJson = path.lastIndexOf(".json");
			String untilDotJson = path.substring(0, lastIndexOfDotJson);
			String minifiedFilename = untilDotJson.concat("-min.json");
			File minifiedFile = new File(minifiedFilename);
			JSONObject totalProject = new JSONObject();
			
			/*
			 * get the lastEdited and lastMinified attributes that
			 * were inserted into the request in the RouterController
			 */
			Date lastEdited = (Date) request.getAttribute("lastEdited");
			Date lastMinified = (Date) request.getAttribute("lastMinified");
			
			/* check to ensure that given path is valid */
			if(projectFile.exists() && !projectFile.isDirectory()){
				
				/* check to see if we need to minify, if we do, minify project, if not return cached file */
				if(needToMinify(lastEdited, lastMinified)){
					/* if lastMinified is earlier then we need to create a new minified file */
					JSONObject project = this.getJSONObjectFromFile(projectFile);
					JSONArray projectNodes = new JSONArray();
					
					try{
						totalProject.put("project", project);
						totalProject.put("nodes", projectNodes);
						JSONArray nodes = project.getJSONArray("nodes");
						
						for(int x = 0; x < nodes.length(); x++){
							try {
								JSONObject node = nodes.getJSONObject(x);
								JSONObject nodeContent = this.getJSONObjectFromFile(new File(projectFile.getParentFile(), node.getString("ref")));
								JSONObject putNode = new JSONObject();
								putNode.put("identifier", node.get("identifier"));
								putNode.put("content", nodeContent);
								projectNodes.put(putNode);
							} catch (Exception e) {
								// could not find the node file, ignore and move onto the next one.
							}
						}
						
						/* write the minified project file to the project directory for caching purposes */
						this.filemanager.writeFile(minifiedFile, totalProject.toString().replaceAll("[\t\n\r]", ""), true);
						
						//get a new timestamp to return as the new last minified time
						Date newLastMinified = new Date();
						
						//write the new lastMinified timestamp to the response
						response.getWriter().write(newLastMinified.getTime() + "");
					} catch(JSONException e){
						e.printStackTrace();
						response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
					}
				} else {
					/* return the existing minified project file string */
					response.getWriter().write("current");
				}
			} else {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST);
			}
		} else {
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
		}
	}
	
	/**
	 * Check if we need to minify the project
	 * @param lastEdited the last edited timestamp
	 * @param lastMinified the last minified timestamp
	 * @return whether we need to minify the project or not
	 */
	private boolean needToMinify(Date lastEdited, Date lastMinified) {
		boolean needToMinify = false;
		
		if(lastEdited == null) {
			/*
			 * lastEdited is null which means the project has not been minified.
			 * this is because whenever we set the lastMinified timestamp, we also
			 * check if lastEdited is null and if it is, we set it to 1 second 
			 * before the lastMinified. this also means we want to minify the project
			 * now.
			 */
			needToMinify = true;
		} else if(lastMinified == null) {
			//we have never minified the project so we will want to now
			needToMinify = true;
		} else if(lastEdited.getTime() > lastMinified.getTime()) {
			/*
			 * the project was edited since the last time it was minified
			 * so the minified is out of date and we want to minify it now
			 */
			needToMinify = true;
		}
		
		return needToMinify;
	}
	
	/**
	 * Gets the file string and returns a JSON object of that string. Throws ServletException
	 * if the operation fails.
	 * 
	 * @param file
	 * @return
	 * @throws ServletException
	 */
	private JSONObject getJSONObjectFromFile(File file) throws ServletException{
		JSONObject o;
		try{
			o = new JSONObject(this.filemanager.getFileText(file));
			return o;
		} catch(IOException e){
			throw new ServletException(e);
		} catch(JSONException e){
			throw new ServletException(e);
		}
	}
	
	/**
	 * Returns a default JSONObject of metadata with certain fields pre-populated
	 */
	private JSONObject getDefaultMetadata(){
		try{
			JSONObject metadata = new JSONObject();
			
			metadata.put("title", "");
			metadata.put("subject", "");
			metadata.put("summary", "");
			metadata.put("author", "");
			metadata.put("graderange", "");
			metadata.put("totaltime", "");
			metadata.put("comptime", "");
			metadata.put("contact", "");
			metadata.put("techreqs", "");
			metadata.put("lessonplan", "");
			metadata.put("lastEdited", new Date().getTime());
			
			return metadata;
		} catch(JSONException e){
			e.printStackTrace();
			return null;
		}
	}
	
	/**
	 * Given the project file, the project metadata file and the minified project file, determines whether
	 * this project should be minified or use a cached copy.
	 * 
	 * @param projectFile
	 * @param projectMetaFile
	 * @param minifiedFile
	 * @return
	 * @throws IOException
	 * @throws JSONException
	 */
	@SuppressWarnings("unused")
	private boolean doMinify(File projectFile, File projectMetaFile, File minifiedFile) throws IOException{
		/* if cached file does not exist, we need to minify */
		if(!minifiedFile.exists()){
			return true;
		}
		
		/* if project meta does not exist, we must assume that this project has just been edited,
		 * create default metadata, write the metadata file and return true */
		if(!projectMetaFile.exists()){
			this.filemanager.writeFile(projectMetaFile, this.getDefaultMetadata().toString(), false);
			return true;
		} else {
			/* attempt to get the lastEdited and lastMinified fields from the JSON Object, if
			 * this fails, we should minify the project */
			try{
				JSONObject meta = new JSONObject(this.filemanager.getFileText(projectMetaFile));
				
				Long lastEdited = meta.getLong("lastEdited");
				Long lastMinified = meta.getLong("lastMinified");
				
				/* if lastEdited is greater than lastMinified, we need to minify */
				if(lastEdited>lastMinified){
					return true;
				} else {
					return false;
				}
			} catch(JSONException e){
				try{
					/* if there is not last edited field, the project still may have been minified,
					 * so try to get the last minified field. */
					JSONObject meta = new JSONObject(this.filemanager.getFileText(projectMetaFile));
					Long lastMinified = meta.getLong("lastMinified");
					if(lastMinified != null && lastMinified > 0){
						return false;
					} else {
						return true;
					}
				} catch (JSONException ex){
					ex.printStackTrace();
					return true;
				}
			}
		}
	}
}