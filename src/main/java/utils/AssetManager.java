package utils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.FileUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Servlet implementation class AssetManager
 * 
 * @author Patrick Lawler
 * @author Geoffrey Kwan
 */
public class AssetManager extends HttpServlet implements Servlet{
	private static final long serialVersionUID = 1L;

	private final static String COMMAND = "command";

	private final static String PATH = "path";

	private final static String ASSET = "asset";

	private final static String FAILED = "failed";

	private static Properties vleProperties = null;

	private static final String DEFAULT_DIRNAME = "assets";

	private boolean standAlone = true;

	private boolean modeRetrieved = false;

	{
		try {
			// Read properties file.
			vleProperties = new Properties();
			vleProperties.load(getClass().getClassLoader().getResourceAsStream("vle.properties"));
		} catch (Exception e) {
			System.err.println("AssetsManager could not read in vleProperties file");
			e.printStackTrace();
		}
	}

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public AssetManager() {
		super();
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
			/* not authenticated send not authorized status */
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
		}
	}

	protected void doRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException{
		String command = request.getParameter(COMMAND);

		String path = request.getParameter(PATH);
		String dirName = (String) request.getAttribute("dirName");
		if (dirName == null) {
			dirName = DEFAULT_DIRNAME;
		}

		String studentUploadsBaseDir = (String) request.getAttribute("studentuploads_base_dir");
		String projectFolderPath = (String) request.getAttribute("projectFolderPath");

		if (path == null || "".equals(path)) {
			if(studentUploadsBaseDir != null) {
				//the user is a student
				path = studentUploadsBaseDir;
			} else if(projectFolderPath != null) {
				//the user is a teacher
				path = projectFolderPath;
			}
		}

		if(command!=null){
			if(command.equals("remove")){
				this.removeAsset(request, response);
			} else if (command.equals("getSize")){
				response.getWriter().write(this.getSize(path, dirName));
			} else if(command.equals("assetList")){
				response.getWriter().write(this.assetList(request));
			} else if (command.equals("studentAssetCopyForReference")) {
				response.getWriter().write(this.copyAssetForReference(request));
			} else {
				response.sendError(HttpServletResponse.SC_BAD_REQUEST);
			} 
		} else if(ServletFileUpload.isMultipartContent(request)){
			response.getWriter().write(this.uploadAsset(request));
		} else {
			response.sendError(HttpServletResponse.SC_BAD_REQUEST);
		}
	}

	/**
	 * If the given <code>HttpServletRequest</code> contains a valid project path,
	 * asset name and file, uploads the specified file to the given path.
	 * 
	 * @param <code>HttpServletRequest</code> request
	 * @return <code>String</code> the message of the status of the upload
	 */
	@SuppressWarnings("unchecked")
	private String uploadAsset(HttpServletRequest request) {
		ServletFileUpload uploader = new ServletFileUpload(new DiskFileItemFactory());
		
		//get the global max project size, we will default to 15MB if none is provided in the vle.properties file
		Long projectMaxAssetsSize = new Long(vleProperties.getProperty("project_max_total_assets_size", "15728640"));
		
		//get the global max student assets folder size, we will default to 20MB if none is provided in the vle.properties file
		Long studentMaxAssetsSize = new Long(vleProperties.getProperty("student_max_total_assets_size", "2097152"));
		Long maxSize = projectMaxAssetsSize;
		String folderPath = "";
		String path = "";
		String dirName = (String) request.getAttribute("dirName");
		if (dirName == null) {
			dirName = DEFAULT_DIRNAME;
		}

		String studentUploadsBaseDir = (String) request.getAttribute("studentuploads_base_dir");
		String projectFolderPath = (String) request.getAttribute("projectFolderPath");

		if (studentUploadsBaseDir != null) {
			// this is a student asset upload
			folderPath = studentUploadsBaseDir + "/" + dirName;
			path = studentUploadsBaseDir;
			maxSize = studentMaxAssetsSize;
		} else if(projectFolderPath != null) {
			//the user is a teacher, trying to upload an asset to the project using the authoring tool
			folderPath = projectFolderPath;
			path = projectFolderPath;
			Long projectMaxTotalAssetsSizeLong = (Long) request.getAttribute("projectMaxTotalAssetsSize");
			if (projectMaxTotalAssetsSizeLong != null) {
				maxSize = projectMaxTotalAssetsSizeLong;
			}
		}

		try{
			List<?> fileList = uploader.parseRequest(request);
			/* if request was forwarded from the portal, the fileList will be empty because
			 * Spring already retrieved the list (it can only be done once). But Spring wrapped
			 * the request so we can get the file another way now */
			if(fileList.size()>0){
				Iterator<?> fileIterator = fileList.iterator();
				while(fileIterator.hasNext()){
					FileItem item = (FileItem)fileIterator.next();
					if(item.isFormField()){ //get path and set var
						if(item.getFieldName().equals(PATH)){
							path = item.getString();
						} else if(item.getFieldName().equals("forward") || item.getFieldName().equals("projectId")){
							// do nothing
						} else {
							throw new ServletException("I do not know what to do with multipart form field of name: " + item.getFieldName() + ". Cannot upload asset.");
						}
					} else { //do upload
						if(path!=null){
							if(!this.ensureAssetPath(path, dirName)){
								throw new ServletException("Unable to find or setup path to upload file. Operation aborted.");
							} else {
								File projectDir = new File(path);
								File assetsDir = new File(projectDir, dirName);
								if(Long.parseLong(this.getFolderSize(folderPath)) + item.getSize() > maxSize){
									return "Uploading " + item.getName() + " of size " + this.appropriateSize(item.getSize()) + " would exceed maximum storage capacity of " + this.appropriateSize(maxSize) + ". Operation aborted.";
								}
								File asset = new File(assetsDir, item.getName());
								item.write(asset);
								return asset.getName() + " was successfully uploaded!";
							}
						} else {
							throw new ServletException("Path or file name for upload not specified.  Unable to upload file.");
						}
					}
				}
			} else {
				/* file upload is coming from the portal so we need to read the bytes
				 * that the portal set in the attribute
				 */
				File projectDir = new File(path);
				File assetsDir = new File(projectDir, dirName);
				if(!assetsDir.exists()){
					assetsDir.mkdirs();
				}

				if(SecurityUtils.isAllowedAccess(request, assetsDir)){
					ArrayList<String> filenames = (ArrayList<String>) request.getAttribute("filenames");
					Map<String,byte[]> fileMap = (Map<String,byte[]>) request.getAttribute("fileMap");
					String successMessage = "";

					if(filenames != null && filenames.size()>0 && fileMap != null && fileMap.size()>0 && filenames.size()==fileMap.size()){
						Iterator<String> iter = filenames.listIterator();
						while(iter.hasNext()){
							String filename = iter.next();
							File asset = new File(assetsDir, filename);
							byte[] content = fileMap.get(filename);

							if(Long.parseLong(this.getFolderSize(folderPath)) + content.length > maxSize){
								successMessage += "Uploading " + filename + " of size " + this.appropriateSize(content.length) + " would exceed your maximum storage capacity of "  + this.appropriateSize(maxSize) + ". Operation aborted.";
							} else {
								if(!asset.exists()){
									asset.createNewFile();
								}

								FileOutputStream fos = new FileOutputStream(asset);
								fos.write(content);

								successMessage += asset.getName() + " was successfully uploaded! ";
							}
						}
					}

					return successMessage;
				} else {
					return "Access to path is denied.";
				}
			}
		} catch (Exception e){
			e.printStackTrace();
			return e.getMessage();
		}

		return FAILED;
	}

	/**
	 * Copies a student uploaded asset to the referenced directory with a 
	 * timestamp and returns a JSON string that includes the filename of that copied file.
	 * 
	 * @param request
	 * @return String filename of the new copy
	 */
	private String copyAssetForReference(HttpServletRequest request) {
		JSONObject response = new JSONObject();

		String unreferencedAssetsDirName = (String) request.getAttribute("dirName"); 
		String referencedAssetsDirName = (String) request.getAttribute("referencedDirName");

		String studentUploadsBaseDirStr = (String) request.getAttribute("studentuploads_base_dir");

		/* file upload is coming from the portal so we need to read the bytes
		 * that the portal set in the attribute
		 */
		File studentUploadsBaseDir = new File(studentUploadsBaseDirStr);
		File unreferencedAssetsFullDir = new File(studentUploadsBaseDir, unreferencedAssetsDirName);
		if(!unreferencedAssetsFullDir.exists()){
			System.err.println("Unreferenced Directory Does Not Exist.");  // the unreferenced directory must exist.
			return "ERROR";
		}

		// if the referenced directory does not exist, make it.
		File referencedAssetsFullDir = new File(studentUploadsBaseDir, referencedAssetsDirName);
		if(!referencedAssetsFullDir.exists()){
			referencedAssetsFullDir.mkdirs();
		}

		if(SecurityUtils.isAllowedAccess(request, unreferencedAssetsFullDir)){
			String filename = request.getParameter("assetFilename");
			// append timestamp to the file to make it unique.
			Calendar cal = Calendar.getInstance();
			int lastIndexOfDot = filename.lastIndexOf(".");
			String newFilename = filename.substring(0, lastIndexOfDot) + "-" + cal.getTimeInMillis() +filename.substring(lastIndexOfDot);  // e.g. sun-20121025102912.png
			File unreferencedAsset = new File(unreferencedAssetsFullDir, filename);
			File referencedAsset = new File(referencedAssetsFullDir, newFilename);

			try {
				this.copy(unreferencedAsset, referencedAsset);
			} catch (FileNotFoundException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
			
			try {
				response.put("result", "SUCCESS");
				response.put("newFilename", newFilename);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		} else {
		}
		return response.toString();
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
		 * Checks to make sure the provided project path exists. If not returns false,
		 * if it does, then checks to see if the dirName directory exists. If it does, returns
		 * true, if not, attempts to create it. If the creation is successful, returns true,
		 * if not returns false.
		 * 
		 * @param <code>String</code> path
		 * @param <code>String</code> dirName
		 * @return boolean
		 */
		private boolean ensureAssetPath(String path, String dirName) {
			File projectDir = new File(path);
			if(projectDir.exists()){
				File assetsDir = new File(projectDir, dirName);
				if(assetsDir.exists() && assetsDir.isDirectory()){
					return true;
				} else {
					return assetsDir.mkdir();
				}
			} else {
				return false;
			}
		}

		/**
		 * Returns the size in bytes of all of the files in the specified path/dirname
		 * 
		 * @param <code>HttpServletRequest</code> request
		 * @return <code>String</code> size of all files in assets folder in bytes
		 */
		private String getSize(String path, String dirName){
			if(path==null){
				return "No project path specified";
			} else {
				File projectDir = new File(path);
				if(projectDir.exists()){
					File assetsDir = new File(projectDir, dirName);
					if(assetsDir.exists() && assetsDir.isDirectory()){
						long total = 0;
						//get all file sizes and add to total
						File[] files = assetsDir.listFiles();
						for(int q=0;q<files.length;q++){
							total += files[q].length();
						}
						return String.valueOf(total);
					} else {
						return "0";
					}
				} else {
					return "Given project path does not exist.";
				}
			}
		}
		
		/**
		 * Returns the size in bytes of all of the files in the specified path/dirname
		 * 
		 * @param <code>String</code> folderPath the path to the folder as a string
		 * @return <code>String</code> size of all files in assets folder in bytes
		 */
		private String getFolderSize(String folderPath) {
			String folderSize = "";
			
			if(folderPath != null) {
				//get a handle on the folder
				File folder = new File(folderPath);
				
				//make sure the folder exists and is a folder
				if(folder.exists() && folder.isDirectory()) {
					//get the size of the folder
					long sizeOfDirectory = FileUtils.sizeOfDirectory(folder);
					
					//get the folder size as a string
					folderSize = String.valueOf(sizeOfDirectory);
				} else {
					//folder does not exist or is not a folder
					folderSize = "Given folder path does not exist or is not a folder.";
				}
			} else {
				//folder path is null
				folderSize = "Folder path not provided.";
			}
			
			return folderSize;
		}

		/**
		 * Given a <code>HttpServletRequest</code> with path and asset parameters
		 * finds the given asset associated with the project in the given path and
		 * removes it from the assets directory. Returns a <code>String</code> success
		 * message upon successful removal, throws <code>ServletExceptions</code> otherwise.
		 * 
		 * @param <code>HttpServletRequest</code> request
		 * @return <code>String</code> message
		 * @throws <code>ServletException</code>
		 */
		private void removeAsset(HttpServletRequest request, HttpServletResponse response) throws IOException{
			String path = request.getParameter(PATH);
			String dirName = (String) request.getAttribute("dirName");
			if (dirName == null) {
				dirName = DEFAULT_DIRNAME;
			}
			if (path == null) {
				path = (String) request.getAttribute(PATH);
			}

			String studentUploadsBaseDir = (String) request.getAttribute("studentuploads_base_dir");
			String projectFolderPath = (String) request.getAttribute("projectFolderPath");

			if (studentUploadsBaseDir != null) {
				// this is a student asset upload
				path = studentUploadsBaseDir;
			} else if(projectFolderPath != null) {
				//the user is a teacher
				path = projectFolderPath;
			}

			String asset = request.getParameter(ASSET);


			File projectDir = new File(path);
			if(path==null || !(projectDir.exists()) || !(projectDir.isDirectory())){
				response.sendError(HttpServletResponse.SC_BAD_REQUEST);
			} else {
				File assetDir = new File(projectDir, dirName);
				if(!assetDir.exists() || !assetDir.isDirectory()){
					response.sendError(HttpServletResponse.SC_BAD_REQUEST);
				} else {
					if(asset==null){
						response.sendError(HttpServletResponse.SC_BAD_REQUEST);
					} else {
						File assetFile = new File(assetDir, asset);
						if(assetFile.exists() && assetFile.isFile()){
							if(this.standAlone || SecurityUtils.isAllowedAccess(request, assetFile)){
								if(assetFile.delete()){
									response.getWriter().write("Asset " + asset + " successfully deleted from server.");
								} else {
									response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
								}
							} else {
								response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
							}
						} else {
							response.sendError(HttpServletResponse.SC_BAD_REQUEST);
						}
					}
				}
			}
		}

		/**
		 * Given a <code>HttpServletRequest</code> request, returns
		 * a <code>String</code> ':' denoted list of all filenames
		 * within the project path directory.
		 * In the request:
		 * - path
		 * - dirName
		 * path + dirName = full content folder path
		 * 
		 * @param <code>HttpServletRequest</code> request
		 * @return <code>String</code>
		 */
		private String assetList(HttpServletRequest request){
			String path = "";
			String dirName = (String) request.getAttribute("dirName");
			if (dirName == null) {
				dirName = DEFAULT_DIRNAME;
			}

			/* dead code
		if (path == null) {
			path = (String) request.getAttribute(PATH);
		}
			 */

			String studentUploadsBaseDir = (String) request.getAttribute("studentuploads_base_dir");
			String projectFolderPath = (String) request.getAttribute("projectFolderPath");

			if (studentUploadsBaseDir != null) {
				// this is a student asset upload
				path = studentUploadsBaseDir;
			} else if(projectFolderPath != null) {
				//the user is a teacher
				path = projectFolderPath;
			}

			// if dirname is : separated, get asset list for each dir and return concatenated result
			String[] dirNames = dirName.split(":");
			if (dirNames.length > 1) {
				JSONArray jsonArr = new JSONArray();
				try {
					for (int i=0; i<dirNames.length; i++) {
						String currDirName = dirNames[i];
						String currAssetList = getAssetList(path,currDirName);
						if (!"".equals(currAssetList)) {
							JSONObject jsonObj = new JSONObject();
							jsonObj.put("workgroupId", currDirName);
							jsonObj.put("assets", currAssetList);
							jsonArr.put(jsonObj);
						}
					}
					return jsonArr.toString();
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					return "";
				}				
			} else {
				return getAssetList(path,dirName);
			}
		}

		private String getAssetList(String path, String dirName) {
			File projectDir = new File(path);
			if(projectDir.exists()){
				File assetsDir = new File(projectDir, dirName);
				if(assetsDir.exists() && assetsDir.isDirectory()){
					File[] files = assetsDir.listFiles();

					JSONArray fileNames = new JSONArray();

					if(files==null){//no files in this dir
						return "";
					} else {
						for(int v=0;v<files.length;v++){
							fileNames.put(files[v].getName());
						}
						return fileNames.toString();
					}
				} else {
					return "";
				}
			} else {
				return "Given project path does not exist";
			}
		}

		/**
		 * Given a <code>long</code> size of bytes, returns a <code>String</code>
		 * with the size either in: bytes, kilobytes or megabytes rounded
		 * to the nearest 10th.
		 * 
		 * @param <code>long</code> size
		 * @return <code>String</code>
		 */
		private String appropriateSize(long size){
			if(size>1048576){
				return String.valueOf(Math.round(((size/1024)/1024)*10)/10) + " mb";
			} else if (size>1024){
				return String.valueOf(Math.round((size/1024)*10)/10) + " kb";
			} else {
				return String.valueOf(size) + " b";
			}
		}
	}
