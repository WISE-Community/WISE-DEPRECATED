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
public class MoreLineStyles implements ChartOption {
		
	private List<String> colors = new LinkedList<String>();
	
	private List<Integer> indexes = new LinkedList<Integer>();
	
	private List<Integer> sizes = new LinkedList<Integer>();
	
	private List<Integer> priority = new LinkedList<Integer>();
	
	public void addMoreLineStyle(String color, int index, int size, int priority){
		this.colors.add(color);
		this.indexes.add(index);
		this.sizes.add(size);
		this.priority.add(priority);
	}
	
	public void addMoreLineStyle(List<String> colors, List<Integer> indexes, List<Integer> size,
			List<Integer> priority) throws Exception{
		if(colors.size()==indexes.size() && size.size()==priority.size()
				&& colors.size()==size.size()){
			this.colors.addAll(colors);
			this.indexes.addAll(indexes);
			this.sizes.addAll(size);
			this.priority.addAll(priority);
		} else {
			throw new Exception("all lists must be of the same size");
		}
	}

	public String getOptionString() {
		String style = "";
		for(int x=0;x<this.colors.size();x++){
			style = style + "D," + this.colors.get(x) + "," + this.indexes.get(x) +
				",0," + this.sizes.get(x) + "," + this.priority.get(x) + "|";
		}
		return style.substring(0, style.length()-1);
	}
}
