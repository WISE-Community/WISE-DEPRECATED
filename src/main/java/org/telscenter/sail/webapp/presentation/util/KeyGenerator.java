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

import java.util.Random;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public final class KeyGenerator {

	private final static String[] CHARACTERS = {"a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r",
		"s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T",
		"U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9"};
	
	/**
	 * Returns a randomly generated <code>String</code> 10 characters in length.
	 * 
	 * @return String - key
	 */
	public static String generateKey(){
		return generateKey(10);
	}
	
	/**
	 * Given a <code>int</code> num, generates and returns a random <code>String</code> key
	 * the length of num.
	 *  
	 * @param num
	 * @return String - key
	 */
	public static String generateKey(int num){
		Random random = new Random();
		String key = "";
		
		for(int x=0;x<num;x++){
			key += CHARACTERS[random.nextInt(CHARACTERS.length)];
		}
		return key;
	}
	
}
