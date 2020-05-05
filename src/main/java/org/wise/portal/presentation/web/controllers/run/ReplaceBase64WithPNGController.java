package org.wise.portal.presentation.web.controllers.run;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.dao.work.StudentWorkDao;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.service.run.RunService;
import org.wise.portal.service.vle.wise5.VLEService;
import org.wise.vle.domain.work.StudentWork;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletResponse;
import java.awt.image.BufferedImage;
import java.io.*;
import java.sql.Timestamp;
import java.util.*;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Handles replacing Base64 strings with image references to reduce student data size. This will
 * find Base64 image strings and create png image files in the studentuploads folder. Then in the
 * student data, it will replace the Base64 string with a reference to that png image in the
 * studentuploads folder.
 */
@Controller
@RequestMapping("/admin/run/replacebase64withpng.html")
public class ReplaceBase64WithPNGController {

  @Autowired
  private Properties appProperties;

  @Autowired
  private VLEService vleService;

  @Autowired
  private RunService runService;

  @Autowired
  private StudentWorkDao studentWorkDao;

  @RequestMapping(method = RequestMethod.POST)
  protected ModelAndView onSubmit(
    @RequestParam("runId") Integer runId,
    @RequestParam("nodeId") String nodeId,
    @RequestParam("componentId") String componentId,
    HttpServletResponse response
  ) throws Exception {

    Integer id = null;
    Integer periodId = null;
    //Integer workgroupId = null;
    Boolean isAutoSave = null;
    Boolean isSubmit = null;
    String componentType = null;
    List<JSONObject> components = null;
    Boolean onlyGetLatest = false;

    // counter for the number of student data we have replaced
    int replaceCounter = 0;

    // counter for the number of images we have created
    int imagesCreatedCounter = 0;

    // counter for the number of images we reused
    int imagesFoundInHashCounter = 0;

    /*
     * get the student uploads base directory
     * example
     * /wise/studentuploads
     */
    String studentUploadsBaseWWW = appProperties.getProperty("studentuploads_base_www");

    /*
     * get the student uploads base directory
     * example
     * /src/main/webapp/studentuploads
     */
    String studentUploadsBaseDir = appProperties.getProperty("studentuploads_base_dir");

    // get the current time in milliseconds from the epoch
    long currentTimeMillis = System.currentTimeMillis();

    // create the log file that we will write output information to
    FileWriter writer = new FileWriter(studentUploadsBaseDir + "/" + runId + "_" + nodeId + "_" + componentId + "_" + currentTimeMillis + ".txt");

    debugOutput(writer, response, "Running Base64 to PNG Replacement");
    debugOutput(writer, response, "Run ID: " + runId);
    debugOutput(writer, response, "Node ID: " + nodeId);
    debugOutput(writer, response, "Component ID: " + componentId);
    debugOutput(writer, response, "");

    // get all the workgroups for the run
    List<Workgroup> workgroups = runService.getWorkgroups(new Long(runId));

    debugOutput(writer, response, "Found " + workgroups.size() + " Workgroups");
    debugOutput(writer, response, "");

    Iterator<Workgroup> workgroupsIterator = workgroups.iterator();

    // loop through all the workgroups
    while(workgroupsIterator.hasNext()) {

      // get a workgroup
      Workgroup workgroup = workgroupsIterator.next();

      // get a workgroup id
      Integer workgroupId = workgroup.getId().intValue();

      debugOutput(writer, response, "Handling Workgroup ID: " + workgroupId);

      // get the student work for the given run id, node id, component id, and workgroup id
      List<StudentWork> studentWorkList = vleService.getStudentWorkList(id, runId, periodId, workgroupId,
        isAutoSave, isSubmit, nodeId, componentId, componentType, components, onlyGetLatest);

      // the number of student work rows we have found
      debugOutput(writer, response, "Found " + studentWorkList.size() + " Student Work Rows");
      debugOutput(writer, response, "");

      // sort the student work by workgroupId, serverSaveTime
      StudentWorkComparator studentWorkComparator = new StudentWorkComparator();
      studentWorkList.sort(studentWorkComparator);

      /*
       * Regex to match the base64 string in the student data
       * The student data we are looking for will contain something like
       * \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABEwAAALMCAYAAAD+YSdYAAAgAElEQVR4X\"
       */
      Pattern p = Pattern.compile(".*\\\\\"(data:image/png;base64,(.*?))\\\\\".*");

      // create the base64 decoder
      Base64.Decoder decoder = Base64.getDecoder();

      // a hashmap for storing mappings of base64 string to image file path
      HashMap base64ToFilePath = new HashMap();

      Iterator<StudentWork> studentWorkIterator = studentWorkList.iterator();

      // loop through all the student work
      while(studentWorkIterator.hasNext()) {

        // get a student work
        StudentWork tempStudentWork = studentWorkIterator.next();

        // get the workgroup id
        Long tempWorkgroupId = tempStudentWork.getWorkgroup().getId();

        // get the student work id
        Integer tempStudentWorkId = tempStudentWork.getId();

        // get the server save time
        Long tempServerSaveTime = tempStudentWork.getServerSaveTime().getTime();

        debugOutput(writer, response, "Workgroup ID: " + tempWorkgroupId + ", Student Work ID: " + tempStudentWorkId + ", Server Save Time: " + new Date(tempServerSaveTime));

        // get the student data
        String studentData = tempStudentWork.getStudentData();

        // run the matcher on the student data
        Matcher m = p.matcher(studentData);

        if (m.matches()) {
          // we have found a match
          debugOutput(writer, response, "Found Base64 string");

          String base64StringWithPrefix = m.group(1);
          debugOutput(writer, response, "base64StringWithPrefix: " + truncateString(base64StringWithPrefix));

          // get the base64 string from the group match
          String base64String = m.group(2);
          debugOutput(writer, response, "base64String: " + truncateString(base64String));

                    /*
                     * look for the base64 in our hashmap to see if we have already converted this base64
                     * string to an image before
                     */
          String filePath = (String) base64ToFilePath.get(base64StringWithPrefix);

          if (filePath == null) {
            // we have not previously seen this base64 string from this student

            debugOutput(writer, response, "Base64 string found in hash: false");

            // check if the base64 is valid base64
            if (org.apache.commons.codec.binary.Base64.isBase64(base64String)) {
              // the string is a valid base64 string

              // create an image from the base64 string
              byte[] imageByte = decoder.decode(base64String);
              ByteArrayInputStream bis = new ByteArrayInputStream(imageByte);
              BufferedImage image = ImageIO.read(bis);
              bis.close();

              // get the current time in milliseconds from the epoch
              currentTimeMillis = System.currentTimeMillis();

              // create the file name for the new png file we are going to create
              String newFileName = "picture_" + currentTimeMillis + ".png";

              /*
               * create the path to the file we are going to create
               * example
               * /src/main/webapp/studentuploads/11258/297450/referenced/
               */
              String newSystemFilePathFolder = studentUploadsBaseDir + "/" + runId + "/" + tempWorkgroupId + "/referenced";

              /*
               * create the path to the file we are going to create
               * example
               * /src/main/webapp/studentuploads/11258/297450/referenced/picture_1494355244394.png
               */
              String newSystemFilePath = studentUploadsBaseDir + "/" + runId + "/" + tempWorkgroupId + "/referenced/" + newFileName;

              /*
               * create the path to the file we are going to create
               * example
               * /wise/studentuploads/11258/297450/referenced/picture_1494355244394.png
               */
              String newWebFilePath = studentUploadsBaseWWW + "/" + runId + "/" + tempWorkgroupId + "/referenced/" + newFileName;

              // create a handle to the file we want to create
              File outputFile = new File(newSystemFilePath);

              // create a handle to the folder we want to create an image in
              File outputFolder = new File(newSystemFilePathFolder);

              // check if the folder exists
              if (!outputFolder.exists()) {
                // the folder doesn't exist so we will make it
                outputFolder.mkdirs();
              }

              debugOutput(writer, response, "Creating new image: " + newSystemFilePath);

              // check if the file already exists
              if (!outputFile.exists()) {
                // the file does not exist

                // create the image file
                outputFile.createNewFile();
                ImageIO.write(image, "png", outputFile);

                // increment the number of images created
                imagesCreatedCounter++;

                // add the mapping from base64 string to image file path
                base64ToFilePath.put(base64StringWithPrefix, newWebFilePath);

                // replace the base64 string with the image file path in the student data
                String updatedStudentData = studentData.replace(base64StringWithPrefix, newWebFilePath);

                debugOutput(writer, response, "Replacing " + truncateString(base64StringWithPrefix) + " with " + newWebFilePath);

                // set the updated student data back into the student work row
                tempStudentWork.setStudentData(updatedStudentData);

                // save the row back to the database
                studentWorkDao.save(tempStudentWork);

                // increment the number of student data replaced
                replaceCounter++;
              } else {
                // the file already exists, it should never go here
                debugOutput(writer, response, "Error: The file we are trying to create already exists");
              }
            } else {
              debugOutput(writer, response, "Error: Invalid Base64 string");
            }
          } else {
            /*
             * we have previously seen this base64 string from this student and created an
             * image for it so we will reuse that image file name
             */

            debugOutput(writer, response, "Base64 string found in hash: true");
            debugOutput(writer, response, "Reusing image");

            // increment the number of images found in the hash
            imagesFoundInHashCounter++;

            // replace the base64 string with the image file path in the student data
            String updatedStudentData = studentData.replace(base64StringWithPrefix, filePath);

            debugOutput(writer, response, "Replacing " + truncateString(base64StringWithPrefix) + " with " + filePath);

            // set the updated student data back into the student work row
            tempStudentWork.setStudentData(updatedStudentData);

            // save the row back to the database
            studentWorkDao.save(tempStudentWork);

            // increment the number of student data replaced
            replaceCounter++;
          }
        } else {
          // we did not find any Base64 string
          debugOutput(writer, response, "Base64 string not found");
        }

        debugOutput(writer, response, "");
      }

      // remove all the entries in the hash map
      base64ToFilePath.clear();

      // attempt to run the garbage collector
      System.gc();
    }

    debugOutput(writer, response, "");
    debugOutput(writer, response, "Student Data Replaced Counter: " + replaceCounter);
    debugOutput(writer, response, "Images Created Counter: " + imagesCreatedCounter);
    debugOutput(writer, response, "Images Found In Hash Counter: " + imagesFoundInHashCounter);

    writer.close();

    return null;
  }


  /**
   * Truncate a string to 80 characters
   * @param s a string
   * @return a string that is 80 characters or less
   */
  private String truncateString(String s) {

    // the number of characters to truncate to
    int numChars = 100;

    String truncatedString = null;

    if (s.length() > numChars) {
      // the string is longer than 80 characters so we will truncate it
      truncatedString = s.substring(0, numChars) + "...";
    } else {
      // the string is shorter than 80 characters so we don't need to truncate it
      truncatedString = s;
    }

    return truncatedString;
  }

  @GetMapping
  public ModelAndView initializeForm(ModelMap model) {
    ModelAndView mav = new ModelAndView();
    return mav;
  }

  /**
   * A comparator for sorting student work by workgroupId, serverSaveTime
   */
  private class StudentWorkComparator implements Comparator<StudentWork> {

    /**
     * Compare StudentWork objects so that they are ordered by workgroupId, serverSaveTime
     */
    @Override
    public int compare(StudentWork sw1, StudentWork sw2) {

      // get workgroup id 1
      Workgroup w1 = sw1.getWorkgroup();
      Long workgroupId1 = w1.getId();

      // get workgroup id 2
      Workgroup w2 = sw2.getWorkgroup();
      Long workgroupId2 = w2.getId();

      if (workgroupId1 > workgroupId2) {
        // workgroup id 1 is larger
        return 1;
      } else if (workgroupId1 < workgroupId2) {
        // workgroup id 1 is smaller
        return -1;
      } else if (workgroupId1.equals(workgroupId2)) {
        // workgroup id is the same so now we will compare them by serverSaveTime

        Timestamp serverSaveTime1 = sw1.getServerSaveTime();
        Timestamp serverSaveTime2 = sw2.getServerSaveTime();

        long milliseconds1 = serverSaveTime1.getTime();
        long milliseconds2 = serverSaveTime2.getTime();

        if (milliseconds1 > milliseconds2) {
          // milliseconds 1 is larger
          return 1;
        } else if (milliseconds1 < milliseconds2) {
          // milliseconds 1 is smaller
          return -1;
        } else if (milliseconds1 == milliseconds2) {
          // the milliseconds are the same
          return 0;
        }
      }

      // it should never go here
      return 0;
    }
  }

  /**
   * Write a line to the debug output log file or response or both
   * @param writer the file to write to
   * @param response the HttpServletResponse to write to
   * @param line a string to write to the file
   */
  private void debugOutput(FileWriter writer, HttpServletResponse response, String line) {

    if (line != null) {
      System.out.println(line);

      if (writer != null) {
        try {
          // write the line to the file
          writer.write(line + "\n");
        } catch (Exception e) {
          e.printStackTrace();
        }
      }

      if (response != null) {
        try {
          // write the line to the response
          response.getWriter().write(line + "\n");
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
    }
  }
}
