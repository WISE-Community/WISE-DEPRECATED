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
package utils;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Properties;

import org.hibernate.cfg.AnnotationConfiguration;
import org.hibernate.tool.hbm2ddl.SchemaExport;

/**
 * @author Hiroki Terashima
 * @author Cynick Young
 * 
 * @version $Id$
 */
public class DbSchemaExporter {
	
	static String outputFilenameMysql = "src/main/resources/vle-createtables-mysql.sql";

	/**
     * @param args
     */
    public static void main(String[] args) {
        try {
          
            exportSchemaToFile();
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
    public static void exportSchemaToFile() throws ClassNotFoundException,
            FileNotFoundException {
        try {

            // Create the SessionFactory from hibernate.cfg.xml and from vle.properties
            AnnotationConfiguration cfg = new AnnotationConfiguration().configure();  // reads from hibernate.cfg.xml
            
            String outFilename = outputFilenameMysql;
            
            final boolean printScriptToConsole = false, exportScriptToDb = false, justDrop = false, justCreate = true;
            final SchemaExport schemaExport = new SchemaExport(cfg)
                    .setDelimiter(";").setFormat(true).setHaltOnError(true)
                    .setOutputFile(outFilename);
            schemaExport.execute(printScriptToConsole, exportScriptToDb,
                    justDrop, justCreate);

        } catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} finally {
        }
    }

}