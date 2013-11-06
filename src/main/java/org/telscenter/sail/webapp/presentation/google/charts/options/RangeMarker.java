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
public class RangeMarker implements ChartOption {
	
	private List<String> types = new LinkedList<String>();
	
	private List<String> colors = new LinkedList<String>();
	
	private List<Double> start = new LinkedList<Double>();
	
	private List<Double> end = new LinkedList<Double>();
	
	public void addRangeMarkers(String type, String color, double start, double end) throws Exception{
		if(type.equals("h") || type.equals("v")){
			if(type.equals("h")){
				this.types.add("r");
			} else {
				this.types.add("R");
			}
			this.colors.add(color);
			this.start.add(start);
			this.end.add(end);			
		} else {
			throw new Exception("Type must either be h (horizontal) or v (vertical)");
		}
	}

	public void addRangeMarkers(List<String> type, List<String> color, List<Double> start,
			List<Double> end) throws Exception{
		if(type.size()==color.size() && start.size()==end.size() && type.size()==end.size()){
			for(int x = 0; x<type.size(); x++){
				this.addRangeMarkers(type.get(x), color.get(x), start.get(x), end.get(x));
			}
		} else {
			throw new Exception("Lists must be of the same size");
		}
	}

	public String getOptionString() {
		String markers = "";
		for(int x=0;x<this.colors.size();x++){
			markers = markers + this.types.get(x) + "," + this.colors.get(x) + ",0," +
				this.start.get(x) + "," + this.end.get(x) + "|";
		}
		return markers.substring(0, markers.length()-1);
	}
}
