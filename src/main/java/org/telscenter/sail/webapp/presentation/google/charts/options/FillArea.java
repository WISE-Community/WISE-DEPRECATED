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
public class FillArea implements ChartOption{
	
	private List<String> colors = new LinkedList<String>();
	
	private List<Integer> start = new LinkedList<Integer>();
	
	private List<Integer> end = new LinkedList<Integer>();
	
	public void addFillArea(String color, int start, int end){
		this.colors.add(color);
		this.start.add(start);
		this.end.add(end);
	}
	
	public void addFillArea(List<String> color, List<Integer> start, List<Integer> end) throws Exception{
		if(color.size()==start.size() && color.size()==end.size()){
			this.colors.addAll(color);
			this.start.addAll(start);
			this.end.addAll(end);
		} else {
			throw new Exception("Lists must be of same size");
		}
	}

	public String getOptionString() {
		String fill = "";
		for(int x=0;x<this.colors.size();x++){
			if(this.start.get(x)==0 && this.end.get(x)==0){
				fill = fill + "B" + "|";
			} else {
				fill = fill + "b," + this.colors.get(x) + "," + this.start.get(x) +
					"," + this.end.get(x) + "|";
			}
		}
		return fill.substring(0, fill.length()-1);
	}
	
}
