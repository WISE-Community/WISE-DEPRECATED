/**
 * Copyright (c) 2008 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU Lesser General Public License, v2.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWAREAND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 *
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.telscenter.sail.webapp.presentation.util;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public final class RetrieveFile {
	
	/**
	 * Given a <code>String</code> path the absolute path to a file, reads 
	 * the text from the file as a <code>String</code> and returns the string.
	 * 
	 * @param <code>String</code> path
	 * @return <code>String</code> text
	 * @throws <code>IOException</code>
	 */
	public static String getFileText(String path) throws IOException {
		return getFileText(new File(path));
	}
	
	/**
	 * Given a <code>File</code>, reads the text from the file as a <code>String</code>
	 * and returns the string.
	 * 
	 * @param <code>File</code> file
	 * @return <code>String</code> text
	 * @throws <code>IOException</code>
	 */
	public static String getFileText(File file) throws IOException{
		if(file.exists()){
			BufferedReader br = new BufferedReader(new FileReader(file));
			String current = br.readLine();
			String fullText = "";
			while(current != null){
				fullText += current + System.getProperty("line.separator");
				current = br.readLine();
			}
			br.close();
			
			return fullText;
		} else {
			throw new IOException("Could not find specified file " + file.getAbsolutePath());
		}
	}

}
