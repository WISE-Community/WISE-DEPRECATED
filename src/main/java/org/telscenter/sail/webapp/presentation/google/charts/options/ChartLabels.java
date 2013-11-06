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
public class ChartLabels implements ChartOption {

	private List<List<?>> xLabels = new LinkedList<List<?>>();
	
	private List<List<?>> yLabels = new LinkedList<List<?>>();
	
	private List<List<?>> tLabels = new LinkedList<List<?>>();
	
	private List<List<?>> rLabels = new LinkedList<List<?>>();
	
	private List<LabelPosition> positions;
	
	private List<AxisRange> ranges;
	
	private List<AxisStyle> styles;
	
	public void addLabels(String axis, List<?> labels)throws Exception{
		if(axis.equals("x")){
			this.xLabels.add(labels);
		} else if(axis.equals("y")){
			this.yLabels.add(labels);
		} else if(axis.equals("t")){
			this.tLabels.add(labels);
		} else if(axis.equals("r")){
			this.rLabels.add(labels);
		} else {
			throw new Exception("axis can only be x,y,t, or r");
		}
	}
	
	public void addLabelPosition(int index, List<Float> positions){
		if(this.positions==null){
			this.positions = new LinkedList<LabelPosition>();
		}
		this.positions.add(new LabelPosition(index,positions));
	}
	
	public void addAxisRange(int index, int start, int end){
		if(this.ranges==null){
			this.ranges = new LinkedList<AxisRange>();
		}
		this.ranges.add(new AxisRange(index, start, end));
	}
	
	public void addAxisStyle(int index, String color){
		if(this.styles==null){
			this.styles = new LinkedList<AxisStyle>();
		}
		this.styles.add(new AxisStyle(index, color));
	}
	
	public void addAxisStyle(int index, String color, int size){
		if(this.styles==null){
			this.styles = new LinkedList<AxisStyle>();
		}
		this.styles.add(new AxisStyle(index, color, size));
	}
	
	public void addAxisStyle(int index, String color, int size, int alignment){
		if(this.styles==null){
			this.styles = new LinkedList<AxisStyle>();
		}
		this.styles.add(new AxisStyle(index, color, size, alignment));
	}
	
	public String getOptionString(){
		int count = 0;
		String declaredLabels = "&chxt=";
		String labels = "&chxl=";
		if(xLabels.size() + yLabels.size() + tLabels.size() + rLabels.size()<1){
			return "";
		} else {
			for(List<?> current : xLabels){
				declaredLabels = declaredLabels + "x,";
				if(current != null){
					labels = labels + count + ":" + getLabelString(current);
				}
				count++;
			}
			for(List<?> current : yLabels){
				declaredLabels = declaredLabels + "y,";
				if(current != null){
					labels = labels + count + ":" + getLabelString(current);
				}
				count++;
			}
			for(List<?> current : tLabels){
				declaredLabels = declaredLabels + "t,";
				if(current != null){
					labels = labels + count + ":" + getLabelString(current);
				}
				count++;
			}
			for(List<?> current : rLabels){
				declaredLabels = declaredLabels + "r,";
				if(current != null){
					labels = labels + count + ":" + getLabelString(current);
				}
				count++;
			}
			return declaredLabels.substring(0, declaredLabels.length()-1) + labels +
				getPositions() + getRange() + getStyle();
		}
	}
	
	private String getLabelString(List<?> labels){
		String labelString = "";
		for(Object o : labels){
			labelString = labelString + "|" + o;
		}
		return labelString + "|";
	}
	
	private String getPositions(){
		String pos = "&chxp=";
		if(this.positions==null){
			return "";
		} else {
			for(LabelPosition position : this.positions){
				pos = pos + position.getOptionString() + "|";
			}
			return pos.substring(0, pos.length()-1);
		}
	}
	
	private String getRange(){
		String range = "&chxr=";
		if(this.ranges==null){
			return "";
		} else {
			for(AxisRange aRange : this.ranges){
				range = range + aRange.getOptionString() + "|";
			}
			return range.substring(0, range.length()-1);
		}
	}
	
	private String getStyle(){
		String style = "&chxs=";
		if(this.styles==null){
			return "";
		} else {
			for (AxisStyle aStyle : this.styles){
				style = style + aStyle.getOptionString() + "|";
			}
			return style.substring(0, style.length()-1);
		}
	}
}
