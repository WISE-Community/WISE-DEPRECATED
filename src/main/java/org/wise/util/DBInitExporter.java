/**
 * Copyright (c) 2007-2017 Encore Research Group, University of Toronto
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Public License for more details.
 *
 * You should have received a copy of the GNU Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.util;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.EnumSet;

import org.hibernate.tool.hbm2ddl.SchemaExport;
import org.springframework.beans.BeanUtils;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.wise.portal.spring.SpringConfiguration;

/**
 * Generates sql file for creating tables and populating them with initial values.
 * Called when running "mvn exec:java" (defined in pom.xml file)
 *
 * @author Cynick Young
 * @author Hiroki Terashima
 */
public class DBInitExporter {

  static String springConfigClassname = "org.wise.portal.spring.impl.SpringConfigurationImpl";
  static String outputFilename = "src/main/resources/wise_db_init.sql";

  public static void main(String[] args) {
    try {
      exportSchemaToFile(springConfigClassname, outputFilename);
    } catch (Exception all) {
      System.err.println(all.getLocalizedMessage());
      all.printStackTrace(System.out);
      System.exit(2);
    }
  }

  /**
   * Exports schema definitions to the specified outputFilename.
   * @param springConfigClassname Spring configuration file
   * @param outputFilename output file
   */
  public static void exportSchemaToFile(String springConfigClassname, String outputFilename)
      throws ClassNotFoundException, IOException {
    ConfigurableApplicationContext applicationContext = null;
    try {
      SpringConfiguration springConfig =
          (SpringConfiguration) BeanUtils.instantiateClass(Class.forName(springConfigClassname));
      applicationContext = new ClassPathXmlApplicationContext(
          springConfig.getRootApplicationContextConfigLocations());

      final boolean printScriptToConsole = false, exportScriptToDb = false,
          justDrop = false, justCreate = true;

      /*
      final SchemaExport schemaExport = new SchemaExport();
      schemaExport
          .setDelimiter(";").setFormat(true).setHaltOnError(true)
          .setOutputFile(outputFilename);
      schemaExport.execute(EnumSet.of(TargetType.STDOUT, TargetType.SCRIPT),
          SchemaExport.Action.BOTH, MetadataProvider.getMetadata());
          */

      // now append initial data, which we read in from import.sql
      File initialDataFile = new File("src/main/resources/import.sql");
      FileInputStream initialDataFileInputStream = new FileInputStream(initialDataFile);
      BufferedReader initialDataFileReader =
          new BufferedReader(new InputStreamReader(initialDataFileInputStream));

      boolean doAppend = true;
      BufferedWriter outputFileWriter = new BufferedWriter(new FileWriter(outputFilename, doAppend));

      String aLine;
      while ((aLine = initialDataFileReader.readLine()) != null) {
        // Process each line and add append to output file, unless it's a hsqldb-specific line
        if (!aLine.contains("SET DATABASE REFERENTIAL INTEGRITY")) {
          outputFileWriter.write(aLine);
          outputFileWriter.newLine();
        }
      }
      initialDataFileReader.close();
      outputFileWriter.close();
    } finally {
      if (applicationContext != null) {
        applicationContext.close();
      }
    }
  }
}
