/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
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
package org.wise;

import java.io.File;
import java.io.IOException;
import java.util.InputMismatchException;
import java.util.Scanner;

import org.apache.commons.io.FileUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.wise.portal.spring.SpringConfiguration;

/**
 * WISE Setup via maven/command line
 *
 * @author Hiroki Terashima
 */
public class WISE {

  static String springConfigClassname = "org.wise.portal.spring.impl.SpringConfigurationImpl";

  /**
   * @param args
   */
  public static void main(String[] args) {
    System.out.println("\n*** WISE Setup ***\n");
    try {
      int mainMenuOptionSelected = mainMenuPrompt();

      switch (mainMenuOptionSelected) {
        case 0:
          while (true) {
            System.out.println("\nThis will wipe out all WISE data and reset to initial state. Continue? [y/n]:");
            Scanner reader = new Scanner(System.in);
            String input = reader.next();
            if (input.equals("y")) {
              System.out.println("Deleting any existing data and reverting to initial state...");
              resetDB(springConfigClassname);
              resetCurriculum();
              System.out.println("WISE has been reset to initial state. Exiting WISE Setup...");
              break;
            } else if (input.equals("n")) {
              System.out.println("Data will NOT be deleted. Exiting WISE Setup...");
              break;
            } else {
              continue;
            }
          }
          break;
        case 1:
          System.out.println("Exiting WISE Setup...");
          break;
        default:
          System.out.println("Invalid input. Exiting WISE Setup...");
      }
    } catch (Exception all) {
      System.err.println(all.getLocalizedMessage());
      all.printStackTrace(System.out);
      System.exit(2);
    }
  }

  private static int mainMenuPrompt() {
    Scanner reader = new Scanner(System.in);
    System.out.println("\nAvailable actions:\n" +
      "[0] Reset WISE (database & curriculum) to initial state\n" +
      "[1] Exit\n" +
      "Enter number:");
    try {
      return reader.nextInt();
    } catch (InputMismatchException ime) {
      return mainMenuPrompt();
    }
  }

  /**
   * Resets curriculum to initial state (stored in src/main/resources/sample/curriculum)
   * @throws IOException
   */
  private static void resetCurriculum() throws IOException {
    File destination_curriculum_dir = new File("src/main/webapp/curriculum");
    File sample_curriculum_dir = new File("src/main/resources/sample/curriculum");
    FileUtils.deleteDirectory(destination_curriculum_dir);
    FileUtils.copyDirectory(sample_curriculum_dir, destination_curriculum_dir);
  }

  /**
   * @param springConfigClassname
   * @throws ClassNotFoundException
   * @throws IOException
   */
  public static void resetDB(String springConfigClassname) throws ClassNotFoundException,
    IOException {
    ConfigurableApplicationContext applicationContext = null;
    try {
      File appPropertiesFile = new File("target/classes/application.properties");
      String appPropertiesString = FileUtils.readFileToString( appPropertiesFile );
      appPropertiesString = appPropertiesString.replaceAll("#hibernate.hbm2ddl.auto=create", "");
      appPropertiesString = appPropertiesString.replaceAll("hibernate.hbm2ddl.auto=create", "");
      appPropertiesString = "hibernate.hbm2ddl.auto=create\n\n" + appPropertiesString;
      FileUtils.writeStringToFile(appPropertiesFile, appPropertiesString, "UTF-8");

      try {
        Thread.sleep(5000);  // give it time to save the file
      } catch (InterruptedException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
      }
      SpringConfiguration springConfig = (SpringConfiguration) BeanUtils
        .instantiateClass(Class.forName(springConfigClassname));
      applicationContext = new ClassPathXmlApplicationContext(
        springConfig.getRootApplicationContextConfigLocations()
      );
    } finally {
      if (applicationContext != null) {
        applicationContext.close();
      }
    }
  }

}
