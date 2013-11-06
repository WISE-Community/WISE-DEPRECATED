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
public class ShapeMarker implements ChartOption{

	private List<String> types = new LinkedList<String>();
	
	private List<String> colors = new LinkedList<String>();
	
	private List<Integer> indexes = new LinkedList<Integer>();
	
	private List<Float> points = new LinkedList<Float>();
	
	private List<Integer> sizes = new LinkedList<Integer>();
	
	private List<Integer> priority = new LinkedList<Integer>();
	
	private final static List<String> TYPES = new LinkedList<String>();
	static {
		TYPES.add("a");
		TYPES.add("c");
		TYPES.add("d");
		TYPES.add("o");
		TYPES.add("s");
		TYPES.add("t");
		TYPES.add("v");
		TYPES.add("V");
		TYPES.add("h");
		TYPES.add("x");
	}
	
	public void addShapeMarkers(String type, String color, int index, float point,
			int size, int priority) throws Exception{
		if(TYPES.contains(type) || type.startsWith("t")){
			this.types.add(type.replace(' ', '+'));
			this.colors.add(color);
			this.indexes.add(index);
			this.points.add(point);
			this.sizes.add(size);
			this.priority.add(priority);
		} else {
			throw new Exception("Type must be one of the values: a, c, d, o, s, t, v, V, h or x");
		}
	}
	
	public void addShapeMarkers(List<String> type, List<String> color, List<Integer> index,
			List<Float> point, List<Integer> size, List<Integer> priority) throws Exception{
		if(type.size()==color.size() && index.size()==point.size() && size.size()
				==priority.size() && type.size()==index.size() && point.size()==priority.size()){
			for(int x=0; x<type.size(); x++){
				addShapeMarkers(type.get(x), color.get(x), index.get(x), point.get(x),
						size.get(x), priority.get(x));
			}
		} else {
			throw new Exception("Lists must be of the same size");
		}
	}

	public String getOptionString() {
		String markers = "";
		for(int x=0;x<this.types.size();x++){
			markers = markers + this.types.get(x) + "," + this.colors.get(x) + "," +
				this.indexes.get(x) + "," + this.points.get(x) + "," + this.sizes.get(x) +
				"," + this.priority.get(x) + "|";
		}
		return markers.substring(0, markers.length()-1);
	}
}
