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
package org.telscenter.sail.webapp.presentation.google.charts.options;

import java.util.LinkedList;
import java.util.List;

import org.telscenter.sail.webapp.presentation.google.charts.ChartOption;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public class ChartColor implements ChartOption{

	private List<String> colors = new LinkedList<String>();
	
	private String separator = ",";
	
	/**
	 * Adds a <code>String</code> color
	 * 
	 * @param <code>String</code> color
	 */
	public void addColor(String color){
		this.colors.add(color);
	}
	
	/**
	 * Adds a <code>List<String></code> of colors
	 * 
	 * @param <code>List<String></code> colors
	 */
	public void addColor(List<String> colors){
		this.colors.addAll(colors);
	}
	
	/**
	 * Sets the separator depending on whether the colors specified are
	 * intended for data points or data sets.
	 * 
	 * @param <code>boolean</code> v
	 */
	public void colorForPoints(boolean v){
		if(v){
			this.separator = "|";
		} else {
			this.separator = ",";
		}
	}
	
	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.ChartOption#getOptionString()
	 */
	public String getOptionString(){
		String colors = "&chco=";
		for(String color : this.colors){
			colors = colors + color + this.separator;
		}
		return colors.substring(0, colors.length()-1);
	}
}
