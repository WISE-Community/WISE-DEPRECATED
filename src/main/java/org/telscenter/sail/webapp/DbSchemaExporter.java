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
package org.telscenter.sail.webapp;

import java.io.FileNotFoundException;

import net.sf.sail.webapp.spring.SpringConfiguration;

import org.hibernate.cfg.Configuration;
import org.hibernate.tool.hbm2ddl.SchemaExport;
import org.springframework.beans.BeanUtils;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.orm.hibernate3.LocalSessionFactoryBean;

/**
 * @author Cynick Young
 * 
 * @version $Id$
 */
public class DbSchemaExporter {
	
	static String springConfigClassname = "org.telscenter.sail.webapp.spring.impl.SpringConfigurationImpl";
	static String outputFilename = "src/main/resources/tels/wise4-createtables.sql";
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
     * @param filename
     * @throws ClassNotFoundException
     * @throws FileNotFoundException
     */
    public static void exportSchemaToFile(String springConfigClassname,
            String filename) throws ClassNotFoundException,
            FileNotFoundException {
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
                    .setOutputFile(filename);
            schemaExport.execute(printScriptToConsole, exportScriptToDb,
                    justDrop, justCreate);

        } finally {
            if (applicationContext != null) {
                applicationContext.close();
            }
        }
    }

}