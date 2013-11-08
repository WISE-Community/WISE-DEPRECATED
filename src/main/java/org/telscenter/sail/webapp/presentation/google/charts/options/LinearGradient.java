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

import java.util.Map;

import org.telscenter.sail.webapp.presentation.google.charts.ChartOption;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public class LinearGradient implements ChartOption{
	
	private String area;
	
	private int angle;
	
	private Map<String, Double> colorsOffsetsMap;
	
	public LinearGradient(String area, int angle, Map<String,Double> colorsOffsets)throws Exception{
		if(area.equals("bg") || area.equals("c")){
			this.area = area;
		} else {
			throw new Exception ("Area specified must be bg (backgroud) or c (chart)");
		}
		if(angle < 0 || angle > 90){
			throw new Exception("Angle specified must be between 0 and 90");
		} else {
			this.angle = angle;
		}
		if(colorsOffsets.size() < 1){
			throw new Exception("Both colors and offsets must be specified");
		}
		for(Double offset : colorsOffsets.values()){
			if(offset < 0 || offset > 1){
				throw new Exception("Offsets specified must be between 0 and 1");
			}
		}
		this.colorsOffsetsMap = colorsOffsets;
	}
	
	public String getOptionString(){
		String gradient = this.area + ",lg," + this.angle + ",";
		for(String color : this.colorsOffsetsMap.keySet()){
			gradient = gradient + color + "," + this.colorsOffsetsMap.get(color) + ",";
		}
		return gradient.substring(0, gradient.length()-1);
	}
}
