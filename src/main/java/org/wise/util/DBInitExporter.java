/**
 * Copyright (c) 2007 Encore Research Group, University of Toronto
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
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

import org.hibernate.cfg.Configuration;
import org.hibernate.tool.hbm2ddl.SchemaExport;
import org.springframework.beans.BeanUtils;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.orm.hibernate3.LocalSessionFactoryBean;
import org.wise.portal.spring.SpringConfiguration;

/**
 * Generates sql file for creating tables and populating them with initial values
 * 
 * @author Cynick Young
 * @author Hiroki Terashima
 * 
 * @version $Id$
 */
public class DBInitExporter {
	
	static String springConfigClassname = "org.wise.portal.spring.impl.SpringConfigurationImpl";
	static String outputFilename = "src/main/resources/wise_db_init.sql";
    /**
     * @param args
     */
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
     * @param springConfigClassname
     * @param outputFilename
     * @throws ClassNotFoundException
     * @throws IOException 
     */
    public static void exportSchemaToFile(String springConfigClassname,
            String outputFilename) throws ClassNotFoundException,
            IOException {
        ConfigurableApplicationContext applicationContext = null;
        try {
            SpringConfiguration springConfig = (SpringConfiguration) BeanUtils
                    .instantiateClass(Class.forName(springConfigClassname));
            applicationContext = new ClassPathXmlApplicationContext(
                    springConfig.getRootApplicationContextConfigLocations());
            Configuration hibernateConfig = ((LocalSessionFactoryBean) applicationContext
                    .getBean("&sessionFactory")).getConfiguration();

            final boolean printScriptToConsole = false, exportScriptToDb = false, justDrop = false, justCreate = true;
            final SchemaExport schemaExport = new SchemaExport(hibernateConfig)
                    .setDelimiter(";").setFormat(true).setHaltOnError(true)
                    .setOutputFile(outputFilename);
            schemaExport.execute(printScriptToConsole, exportScriptToDb,
                    justDrop, justCreate);

            // now append initial data, which we read in from import.sql
            File initialDataFile = new File("src/main/resources/import.sql");
    		FileInputStream initialDataFileInputStream = new FileInputStream(initialDataFile);
    		BufferedReader initialDataFileReader = new BufferedReader(new InputStreamReader(initialDataFileInputStream));
    		
    		boolean doAppend = true;
            BufferedWriter outputFileWriter = new BufferedWriter( new FileWriter(outputFilename, doAppend));
            
    		String aLine = null;
    		while ((aLine = initialDataFileReader.readLine()) != null) {
    			// Process each line and add append to output file, unless it's a hsqldb-specific line
    			if (!aLine.contains("SET DATABASE REFERENTIAL INTEGRITY")) {
    				outputFileWriter.write(aLine);
    				outputFileWriter.newLine();
    			}
    		}
     
    		// close the buffer reader
    		initialDataFileReader.close();
     
    		// close buffer writer
    		outputFileWriter.close();
        } finally {
            if (applicationContext != null) {
                applicationContext.close();
            }
        }
    }

}