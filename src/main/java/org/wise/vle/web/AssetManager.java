/**
 * Copyright (c) 2008-2019 Regents of the University of California (Regents).
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
package org.wise.vle.web;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Calendar;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.domain.BasePermission;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.StandardMultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.workgroup.WorkgroupService;

/**
 * Servlet implementation class AssetManager
 *
 * @author Patrick Lawler
 * @author Geoffrey Kwan
 * @author Hiroki Terashima
 */
@Controller
@RequestMapping("/assetManager")
public class AssetManager {

  private static Properties appProperties;

  @Autowired
  private RunService runService;

  @Autowired
  private WorkgroupService workgroupService;

  @Autowired
  public void setAppProperties(Properties appProperties) {
    AssetManager.appProperties = appProperties;
  }

  public AssetManager() {
    super();
  }

  @RequestMapping(method = RequestMethod.GET)
  protected ModelAndView doGet(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    String command = request.getParameter("command");
    String type = request.getParameter("type");
    if ("studentAssetManager".equals(type)) {
      if ("assetList".equals(command)) {
        User user = ControllerUtil.getSignedInUser();
        String runId = request.getParameter("runId");
        Run run = null;
        try {
          run = runService.retrieveById(new Long(runId));
        } catch (NumberFormatException e) {
          e.printStackTrace();
        } catch (ObjectNotFoundException e) {
          e.printStackTrace();
        }

        String workgroupsParam = request.getParameter("workgroups");
        if (workgroupsParam != null) {
          // this is a request from the teacher of the run or admin who wants to see the run's students' assets
          // verify that user is the owner of the run
          if (user.isAdmin() || runService.hasRunPermission(run, user, BasePermission.READ)) {
            String[] workgroupIds = workgroupsParam.split(":");
            JSONArray workgroupAssetLists = new JSONArray();
            for (String workgroupId : workgroupIds) {
              JSONObject workgroupAsset = new JSONObject();
              try {
                String dirName = run.getId() + "/" + workgroupId + "/unreferenced";
                String path = appProperties.getProperty("studentuploads_base_dir");
                JSONArray assetList = getAssetList(path, dirName);
                workgroupAsset.put("workgroupId", workgroupId);
                workgroupAsset.put("assets", assetList);
                workgroupAssetLists.put(workgroupAsset);
              } catch (NumberFormatException e) {
                e.printStackTrace();
              } catch (JSONException e) {
                e.printStackTrace();
              }
            }
            response.getWriter().write(workgroupAssetLists.toString());
          }
        } else {
          // this is a request from the student of the run who wants to see their assets
          List<Workgroup> workgroupListByRunAndUser = workgroupService.getWorkgroupListByRunAndUser(run, user);
          Workgroup workgroup = workgroupListByRunAndUser.get(0);
          Long workgroupId = workgroup.getId();
          String dirName = run.getId() + "/" + workgroupId + "/unreferenced";
          String path = appProperties.getProperty("studentuploads_base_dir");
          JSONArray assetList = getAssetList(path, dirName);
          response.getWriter().write(assetList.toString());
        }
      } else if (command.equals("getSize")) {
        User user = ControllerUtil.getSignedInUser();
        String runId = request.getParameter("runId");
        Run run = null;
        try {
          run = runService.retrieveById(new Long(runId));
        } catch (NumberFormatException e) {
          e.printStackTrace();
        } catch (ObjectNotFoundException e) {
          e.printStackTrace();
        }

        List<Workgroup> workgroupListByRunAndUser = workgroupService.getWorkgroupListByRunAndUser(run, user);
        Workgroup workgroup = workgroupListByRunAndUser.get(0);
        Long workgroupId = workgroup.getId();
        String dirName = run.getId() + "/" + workgroupId + "/unreferenced";
        String path = appProperties.getProperty("studentuploads_base_dir");
        String result = getSize(path, dirName);
        response.getWriter().write(result);
      }
    }
    return null;
  }

  @RequestMapping(method = RequestMethod.POST)
  protected ModelAndView doPost(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    String command = request.getParameter("command");
    String type = request.getParameter("type");
    if ("studentAssetManager".equals(type)) {
      if ("remove".equals(command)) {
        User user = ControllerUtil.getSignedInUser();
        String runId = request.getParameter("runId");
        Run run = null;
        try {
          run = runService.retrieveById(new Long(runId));
        } catch (NumberFormatException e) {
          e.printStackTrace();
        } catch (ObjectNotFoundException e) {
          e.printStackTrace();
        }

        List<Workgroup> workgroupListByRunAndUser = workgroupService.getWorkgroupListByRunAndUser(run, user);
        Workgroup workgroup = workgroupListByRunAndUser.get(0);
        Long workgroupId = workgroup.getId();
        String dirName = run.getId() + "/" + workgroupId + "/unreferenced";
        String path = appProperties.getProperty("studentuploads_base_dir");
        String assetFileName = request.getParameter("asset");
        String result = removeAsset(path, dirName, assetFileName);
        response.getWriter().write(result);
      } else if ("studentAssetCopyForReference".equals(command)) {
        User user = ControllerUtil.getSignedInUser();
        String runId = request.getParameter("runId");
        Run run = null;
        try {
          run = runService.retrieveById(new Long(runId));
        } catch (NumberFormatException e) {
          e.printStackTrace();
        } catch (ObjectNotFoundException e) {
          e.printStackTrace();
        }
        List<Workgroup> workgroupListByRunAndUser = workgroupService.getWorkgroupListByRunAndUser(run, user);
        Workgroup workgroup = workgroupListByRunAndUser.get(0);
        Long workgroupId = workgroup.getId();
        String dirName = run.getId() + "/" + workgroupId + "/unreferenced";
        String referencedDirName = "";
        String commandParameter = request.getParameter("command");
        if (commandParameter != null && "studentAssetCopyForReference".equals(commandParameter)) {
          referencedDirName = run.getId() + "/" + workgroupId + "/referenced";
        }
        String fileName = request.getParameter("assetFilename");
        String result = copyAssetForReference(dirName, referencedDirName, fileName);
        response.getWriter().write(result);
      } else if ("uploadAsset".equals(command)) {
        User user = ControllerUtil.getSignedInUser();
        String runId = request.getParameter("runId");
        Run run = null;
        try {
          run = runService.retrieveById(new Long(runId));
        } catch (NumberFormatException e) {
          e.printStackTrace();
        } catch (ObjectNotFoundException e) {
          e.printStackTrace();
        }

        List<Workgroup> workgroupListByRunAndUser = workgroupService.getWorkgroupListByRunAndUser(run, user);
        Workgroup workgroup = workgroupListByRunAndUser.get(0);
        Long workgroupId = workgroup.getId();
        String dirName = run.getId() + "/" + workgroupId + "/unreferenced";
        String path = appProperties.getProperty("studentuploads_base_dir");
        Long studentMaxTotalAssetsSize = new Long(appProperties.getProperty("student_max_total_assets_size", "5242880"));
        String pathToCheckSize = path + "/" + dirName;
        StandardMultipartHttpServletRequest multiRequest = (StandardMultipartHttpServletRequest) request;
        Map<String, MultipartFile> fileMap = multiRequest.getFileMap();
        String result = uploadAsset(fileMap, path, dirName, pathToCheckSize, studentMaxTotalAssetsSize);
        response.getWriter().write(result);
      }
    }
    return null;
  }

  /**
   * Uploads the specified file to the given path.
   * @param file the file that is to be uploaded
   * @param path the path to the project folder or the student uploads base directory
   * @param dirName the folder name to upload to which will be assets or the directory
   * for a workgroup for a run
   * @param pathToCheckSize the path to check the disk space usage for. if we are uploading
   * to a project we will check the whole project folder size. if we are uploading to a
   * student folder we will check that student folder
   * @param maxTotalAssetsSize the the max disk space usage allowable
   * @return true iff saving the asset was successful
   */
  @SuppressWarnings("unchecked")
  public static Boolean uploadAssetWISE5(MultipartFile file, String path, String dirName,
      String pathToCheckSize, Long maxTotalAssetsSize) {
    try {
      File projectDir = new File(path);
      File assetsDir = new File(projectDir, dirName);
      if (!assetsDir.exists()) {
        assetsDir.mkdirs();
      }

      if (SecurityUtils.isAllowedAccess(path, assetsDir)) {
        String filename = file.getOriginalFilename();
        File asset = new File(assetsDir, filename);
        byte[] content = file.getBytes();

        if (Long.parseLong(getFolderSize(pathToCheckSize)) + content.length > maxTotalAssetsSize) {
          return false;
        } else {
          if (!asset.exists()) {
            asset.createNewFile();
          }
          FileOutputStream fos = new FileOutputStream(asset);
          fos.write(content);
          fos.flush();
          fos.close();
        }

        if ("application/zip".equals(file.getContentType()) ||
            "application/x-zip".equals(file.getContentType()) ||
            "application/x-zip-compressed".equals(file.getContentType())) {
          ZipFile zipFile = new ZipFile(asset);
          Enumeration<? extends ZipEntry> entries = zipFile.entries();
          while (entries.hasMoreElements()) {
            ZipEntry entry = entries.nextElement();
            File entryDestination = new File(assetsDir, entry.getName());
            if (entry.isDirectory()) {
              entryDestination.mkdirs();
            } else {
              File parent = entryDestination.getParentFile();
              if (!parent.exists() && !parent.mkdirs()) {
                throw new IllegalStateException("Couldn't create dir: " + parent);
              }
              InputStream in = zipFile.getInputStream(entry);
              OutputStream out = new FileOutputStream(entryDestination);
              IOUtils.copy(in, out);
              IOUtils.closeQuietly(in);
              IOUtils.closeQuietly(out);
            }
          }
        } else {
        }
        return true;
      } else {
        return false;
      }
    } catch (Exception e) {
      e.printStackTrace();
      return false;
    }
  }

  /**
   * Copies a student uploaded asset to the referenced directory with a
   * timestamp and returns a JSON string that includes the filename of that copied file.
   * @param dirName the student workgroup folder for the run
   * @param referencedDirName the path to the referenced files
   * @param fileName the file name
   * @return String filename of the new copy
   */
  public static String copyAssetForReferenceWISE5(String dirName, String referencedDirName,
      String fileName) {
    String unreferencedAssetsDirName = dirName;
    String referencedAssetsDirName = referencedDirName;
    String studentUploadsBaseDirStr = appProperties.getProperty("studentuploads_base_dir");

    // file upload is coming from the portal so we need to read the bytes
    // that the portal set in the attribute
    File studentUploadsBaseDir = new File(studentUploadsBaseDirStr);
    File unreferencedAssetsFullDir = new File(studentUploadsBaseDir, unreferencedAssetsDirName);
    if (!unreferencedAssetsFullDir.exists()) {
      System.err.println("Unreferenced Directory Does Not Exist.");
      return null;
    }

    File referencedAssetsFullDir = new File(studentUploadsBaseDir, referencedAssetsDirName);
    if (!referencedAssetsFullDir.exists()) {
      referencedAssetsFullDir.mkdirs();
    }

    Calendar cal = Calendar.getInstance();
    int lastIndexOfDot = fileName.lastIndexOf(".");
    String newFilename = fileName.substring(0, lastIndexOfDot) + "-" + cal.getTimeInMillis() + fileName.substring(lastIndexOfDot);  // e.g. sun-20121025102912.png
    File unreferencedAsset = new File(unreferencedAssetsFullDir, fileName);
    File referencedAsset = new File(referencedAssetsFullDir, newFilename);

    try {
      AssetManager.copy(unreferencedAsset, referencedAsset);
    } catch (FileNotFoundException e) {
      e.printStackTrace();
      return null;
    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
    return newFilename;
  }

  /**
   * Removes an asset from the folder
   * @param path the path to the parent folder
   * @param dirName the folder name
   * @param assetFileName the file name
   * @return true iff removal was successful
   * @throws IOException
   */
  public static Boolean removeAssetWISE5(String path, String dirName, String assetFileName)
      throws IOException {
    File projectDir = new File(path);
    if (path == null || !(projectDir.exists()) || !(projectDir.isDirectory())) {
      return false;
    } else {
      File assetDir = new File(projectDir, dirName);
      if (!assetDir.exists() || !assetDir.isDirectory()) {
        return false;
      } else {
        if (assetFileName == null) {
          return false;
        } else {
          File assetFile = new File(assetDir, assetFileName);
          if (assetFile.exists() && assetFile.isFile()) {
            if (SecurityUtils.isAllowedAccess(path, assetFile.getCanonicalPath())) {
              return assetFile.delete();
            } else {
              return false;
            }
          } else {
            return false;
          }
        }
      }
    }
  }

  /**
   * Uploads the specified file to the given path.
   * @param fileMap the files that are to be uploaded
   * @param path the path to the project folder or the student uploads base directory
   * @param dirName the folder name to upload to which will be assets or the directory
   * for a workgroup for a run
   * @param pathToCheckSize the path to check the disk space usage for. if we are uploading
   * to a project we will check the whole project folder size. if we are uploading to a
   * student folder we will check that student folder
   * @param maxTotalAssetsSize the the max disk space usage allowable
   * @return the message of the status of the upload
   */
  @SuppressWarnings("unchecked")
  public static String uploadAsset(Map<String,MultipartFile> fileMap, String path, String dirName,
      String pathToCheckSize, Long maxTotalAssetsSize) {
    try {
      // file upload is coming from the portal so we need to read the bytes
      // that the portal set in the attribute
      File projectDir = new File(path);
      File assetsDir = new File(projectDir, dirName);
      if (!assetsDir.exists()) {
        assetsDir.mkdirs();
      }

      if (SecurityUtils.isAllowedAccess(path, assetsDir)) {
        String successMessage = "";
        if (fileMap != null && fileMap.size() > 0) {
          Set<String> keySet = fileMap.keySet();
          Iterator<String> iter = keySet.iterator();
          while (iter.hasNext()) {
            String key = iter.next();
            MultipartFile file = fileMap.get(key);
            String filename = file.getOriginalFilename();
            File asset = new File(assetsDir, filename);
            byte[] content = file.getBytes();

            if (Long.parseLong(getFolderSize(pathToCheckSize)) + content.length > maxTotalAssetsSize) {
              successMessage += "Uploading " + filename + " of size " + appropriateSize(content.length) + " would exceed your maximum storage capacity of "  + appropriateSize(maxTotalAssetsSize) + ". Operation aborted.";
            } else {
              if (!asset.exists()) {
                asset.createNewFile();
              }
              FileOutputStream fos = new FileOutputStream(asset);
              fos.write(content);
              fos.flush();
              fos.close();
              successMessage += asset.getName() + " was successfully uploaded! ";
            }

            if ("application/zip".equals(file.getContentType()) ||
                "application/x-zip".equals(file.getContentType()) ||
                "application/x-zip-compressed".equals(file.getContentType())) {
              String unzippedFolderName = filename.substring(0, filename.lastIndexOf(".zip"));
              File unzippedFolder = new File(assetsDir, unzippedFolderName);
              if (unzippedFolder.exists()) {
                FileUtils.deleteDirectory(unzippedFolder);
              }
              ZipFile zipFile = new ZipFile(asset);
              Enumeration<? extends ZipEntry> entries = zipFile.entries();
              while (entries.hasMoreElements()) {
                ZipEntry entry = entries.nextElement();
                File entryDestination = new File(assetsDir, entry.getName());
                if (entry.isDirectory()) {
                  entryDestination.mkdirs();
                } else {
                  File parent = entryDestination.getParentFile();
                  if (!parent.exists() && !parent.mkdirs()) {
                    throw new IllegalStateException("Couldn't create dir: " + parent);
                  }
                  InputStream in = zipFile.getInputStream(entry);
                  OutputStream out = new FileOutputStream(entryDestination);
                  IOUtils.copy(in, out);
                  IOUtils.closeQuietly(in);
                  IOUtils.closeQuietly(out);
                }
              }
              successMessage += "WISE also extracted files from the zip file! ";
              asset.delete();
            } else {
            }
          }
        }
        return successMessage;
      } else {
        return "Access to path is denied.";
      }
    } catch (Exception e) {
      e.printStackTrace();
      return e.getMessage();
    }
  }

  /**
   * Copies a student uploaded asset to the referenced directory with a
   * timestamp and returns a JSON string that includes the filename of that copied file.
   * @param dirName the student workgroup folder for the run
   * @param referencedDirName the path to the referenced files
   * @param fileName the file name
   * @return String filename of the new copy
   */
  public static String copyAssetForReference(String dirName, String referencedDirName,
      String fileName) {
    JSONObject response = new JSONObject();
    String unreferencedAssetsDirName = dirName;
    String referencedAssetsDirName = referencedDirName;
    String studentUploadsBaseDirStr = appProperties.getProperty("studentuploads_base_dir");

    // file upload is coming from the portal so we need to read the bytes
    // that the portal set in the attribute
    File studentUploadsBaseDir = new File(studentUploadsBaseDirStr);
    File unreferencedAssetsFullDir = new File(studentUploadsBaseDir, unreferencedAssetsDirName);
    if (!unreferencedAssetsFullDir.exists()) {
      System.err.println("Unreferenced Directory Does Not Exist.");  // the unreferenced directory must exist.
      return "ERROR";
    }

    File referencedAssetsFullDir = new File(studentUploadsBaseDir, referencedAssetsDirName);
    if (!referencedAssetsFullDir.exists()) {
      referencedAssetsFullDir.mkdirs();
    }

    Calendar cal = Calendar.getInstance();
    int lastIndexOfDot = fileName.lastIndexOf(".");
    String newFilename = fileName.substring(0, lastIndexOfDot) + "-" + cal.getTimeInMillis() + fileName.substring(lastIndexOfDot);  // e.g. sun-20121025102912.png
    File unreferencedAsset = new File(unreferencedAssetsFullDir, fileName);
    File referencedAsset = new File(referencedAssetsFullDir, newFilename);

    try {
      AssetManager.copy(unreferencedAsset, referencedAsset);
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
    return response.toString();
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
      for (String file : files) {
        copy(new File(src, file), new File(dest, file));
      }
    } else {
      InputStream in = new FileInputStream(src);
      FileOutputStream out = new FileOutputStream(dest);

      byte[] buffer = new byte[2048];
      int len;
      while((len = in.read(buffer)) > 0) {
        out.write(buffer, 0, len);
      }
      in.close();
      out.close();
    }
  }

  /**
   * Returns the size in bytes of all of the files in the specified path/dirname
   * @param path the path to the parent directory
   * @param dirName the directory name
   * @return the disk space usage of the folder
   */
  public static String getSize(String path, String dirName) {
    if (path == null) {
      return "No project path specified";
    } else {
      File projectDir = new File(path);
      if (projectDir.exists()) {
        File assetsDir = new File(projectDir, dirName);
        if (assetsDir.exists() && assetsDir.isDirectory()) {
          long total = 0;
          File[] files = assetsDir.listFiles();
          for (File file : files) {
            total += file.length();
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
   * @param folderPath the path to the folder as a string
   * @return <code>String</code> size of all files in assets folder in bytes
   */
  public static String getFolderSize(String folderPath) {
    String folderSize = "";
    if (folderPath != null) {
      File folder = new File(folderPath);
      if (folder.exists() && folder.isDirectory()) {
        long sizeOfDirectory = FileUtils.sizeOfDirectory(folder);
        folderSize = String.valueOf(sizeOfDirectory);
      } else {
        folderSize = "Given folder path does not exist or is not a folder.";
      }
    } else {
      folderSize = "Folder path not provided.";
    }
    return folderSize;
  }

  /**
   * Removes an asset from the folder
   * @param path the path to the parent folder
   * @param dirName the folder name
   * @param assetFileName the file name
   * @return a string that specifies whether the removal was successful or not
   * @throws IOException
   */
  public static String removeAsset(String path, String dirName, String assetFileName)
      throws IOException {
    String result = "";
    File projectDir = new File(path);
    if (path == null || !(projectDir.exists()) || !(projectDir.isDirectory())) {
      result = "Bad Request";
    } else {
      File assetDir = new File(projectDir, dirName);
      if (!assetDir.exists() || !assetDir.isDirectory()) {
        result = "Bad Request";
      } else {
        if (assetFileName == null) {
          result = "Bad Request";
        } else {
          File assetFile = new File(assetDir, assetFileName);
          if (assetFile.exists() && assetFile.isFile()) {
            if (SecurityUtils.isAllowedAccess(path, assetFile.getCanonicalPath())) {
              if (assetFile.delete()) {
                result = "Asset " + assetFileName + " successfully deleted from server.";
              } else {
                result = "Server Error";
              }
            } else {
              result = "Unauthorized";
            }
          } else {
            result = "Bad Request";
          }
        }
      }
    }
    return result;
  }

  /**
   * Get a list of the file names in the folder
   * @param path the path to the parent folder
   * @param dirName the name of the folder
   * @return a JSONArray string containing the file names
   */
  public static JSONArray getAssetList(String path, String dirName) {
    JSONArray result = null;
    String[] dirNames = dirName.split(":");
    if (dirNames.length > 1) {
      result = new JSONArray();
      try {
        for (String currDirName : dirNames) {
          JSONArray currAssetList = getAssetListFromFolder(path,currDirName);
          if (!"".equals(currAssetList)) {
            JSONObject jsonObj = new JSONObject();
            jsonObj.put("workgroupId", currDirName);
            jsonObj.put("assets", currAssetList);
            result.put(jsonObj);
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    } else {
      result = getAssetListFromFolder(path, dirName);
    }
    return result;
  }

  /**
   * Get the file names in the folder
   * @param path the path to the parent folder
   * @param dirName the folder name
   * @return the disk usage of the folder
   */
  public static JSONArray getAssetListFromFolder(String path, String dirName) {
    JSONArray result = new JSONArray();
    File projectDir = new File(path);
    if (projectDir.exists()) {
      File assetsDir = new File(projectDir, dirName);
      if (assetsDir.exists() && assetsDir.isDirectory()) {
        File[] files = assetsDir.listFiles();
        if (files != null) {
          for (File file : files) {
            try {
              String fileName = file.getName();
              JSONObject fileObject = new JSONObject();
              fileObject.put("fileName", fileName);
              long fileSize = file.length();
              fileObject.put("fileSize", fileSize);
              result.put(fileObject);
            } catch (Exception e) {
              e.printStackTrace();
            }
          }
        }
      }
    }
    return result;
  }

  /**
   * Given a <code>long</code> size of bytes, returns a <code>String</code>
   * with the size either in: bytes, kilobytes or megabytes rounded
   * to the nearest 10th.
   *
   * @param size
   * @return <code>String</code>
   */
  public static String appropriateSize(long size) {
    if (size > 1048576) {
      return String.valueOf(Math.round(((size / 1024) / 1024) * 10) / 10) + " mb";
    } else if (size > 1024) {
      return String.valueOf(Math.round((size / 1024) * 10) / 10) + " kb";
    } else {
      return String.valueOf(size) + " b";
    }
  }
}
