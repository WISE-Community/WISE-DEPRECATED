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
 * 
 * @version $Id$
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
						System.out.println("Deleting data and reverting to initial state...");
						resetDB(springConfigClassname);
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
			//get user input
			return reader.nextInt();
		} catch (InputMismatchException ime) {
			return mainMenuPrompt();
		}
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
			File wisePropertiesFile = new File("target/classes/wise.properties");
			String wisePropertiesString = FileUtils.readFileToString( wisePropertiesFile );
			wisePropertiesString = wisePropertiesString.replaceAll("#hibernate.hbm2ddl.auto=create", "");
			wisePropertiesString = wisePropertiesString.replaceAll("hibernate.hbm2ddl.auto=create", "");

			wisePropertiesString = "hibernate.hbm2ddl.auto=create\n\n" + wisePropertiesString;	

			FileUtils.writeStringToFile(wisePropertiesFile, wisePropertiesString);

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