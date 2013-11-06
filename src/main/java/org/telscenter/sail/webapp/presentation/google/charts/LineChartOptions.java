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
package org.telscenter.sail.webapp.presentation.google.charts;

import java.util.List;
import java.util.Map;

/**
 * Chart options that are available for the LineChart. Extends GoogleChartOptions.
 * @see GoogleChartOptions
 * 
 * @author patrick lawler
 * @version $Id:$
 */
public interface LineChartOptions extends GoogleChartOptions {

	/**
	 * Adds a <code>List<?></code> of labels to the <code>String</code>
	 * axis specified. Valid axis are x (x-axis), y (y-axis), t (top), or
	 * r (right). Multiple labels for any given axis is allowed. To allow
	 * default labeling for an axis, provide the axis parameter value and null for the
	 * labels parameter.
	 * 
	 * @param <code>String</code> axis
	 * @param <code>List<?></code> labels
	 * @throws <code>Exception</code> when axis parameter is invalid
	 */
	public void addLabels(String axis, List<?> labels) throws Exception;
	
	/**
	 * Sets the position of the provided labels along a specified axis. <code>int</code>
	 * index is the index of the axis (in the order added when specifying axis
	 * labels). The <code>List<Float></code> are floating point values that
	 * specify the positions of the labels for this axis. If no labels are specified, the
	 * value of the data at that position is used for the label.
	 * 
	 * @param <code>int</code> index
	 * @param <code>List<Float></code> positions
	 */
	public void addLabelPosition(int index, List<Float> positions);
	
	/**
	 * Sets the range of a specified axis. <code>int</code>index is the index of 
	 * the axis (in the order specified when adding axis labels). <code>int</code> start
	 * specifies the start of the range and <code>int</code> species the end of the range.
	 * If no labels are specified, values in this range are evenly spaced as labels along 
	 * the specified axis. This can be used in conjunction with label positions.
	 * 
	 * @param <code>int</code> index
	 * @param <code>int</code> start
	 * @param <code>int</code> end
	 */
	public void addAxisRange(int index, int start, int end);
	
	/**
	 * Sets styling information for the specified axis labels. <code>int</code> 
	 * index is the index of the axis for these styling values. <code>String</code> 
	 * color is a six digit hexadecimal RGB color. Transparency can be achieved by
	 * appending a two digit value from 00 to ff, where 00 is completely transparent
	 * and ff is totally opaque.
	 * 
	 * @param <code>int</code> index
	 * @param <code>String</code> color
	 */
	public void addAxisStyle(int index, String color);
	
	/**
	 * Sets styling information for the specified axis labels. Same as above
	 * but includes the optional parameter of <code>int</code> font size for the
	 * labels along the specified axis.
	 * 
	 * @param <code>int</code> index
	 * @param <code>int</code> color
	 * @param <code>int</code> size
	 */
	public void addAxisStyle(int index, String color, int size);
	
	/**
	 * Sets styling information for the specified axis labels. Same as above but
	 * with the additional parameter of <code>int</code> alignment which overrides 
	 * the default alignment for the labels along the specified axis. Default values for
	 * x-axis (top and bottom) -centered, for left y-axis -right aligned, for right
	 * y-axis -left aligned. To override these, specify 1 = right aligned, 0 = centered
	 * and -1 = left aligned.
	 *  
	 * @param <code>int</code> index
	 * @param <code>String</code> color
	 * @param <code>int</code> size
	 * @param <code>int</code> alignment
	 */
	public void addAxisStyle(int index, String color, int size, int alignment);
	
	/**
	 * Used in conjunction with Chart Colors. Colors specified are used for
	 * the given data sets. If colors are to be used for data points instead,
	 * then this should be called with <code>boolean</code> v set to true.
	 * 
	 * @param <code>boolean</code> v
	 */
	public void colorForPoints(boolean v);
	
	/**
	 * A Linear Gradient can be added to either the background or chart area and can be
	 * used in conjunction with Linear Stripe and Solid Fill for various chart effects.
	 * Multiple linear gradient effects can be added.
	 * 
	 * @param <code>String</code> the area of effect (either bg -background or c -chartarea)
	 * @param <code>int</code> the angle of the gradient - must be between 0 (horizontal)
	 * and 90 (vertical)
	 * @param <code>Map<String,Double></code> specifies a hexadecimal RGB color and offset(where
	 * the color is pure between 0 and 1. 0=leftmost 1=rightmost) map. Color transparency can be
	 * specified by appending 00 to FF to the hexidecimal color with 00 being completely transparent
	 * and FF being completely opaque.
	 * @throws <code>Exception</code> when area is not bg or c, when angle is not between 0 and
	 * 90 and when the offsets are not between 0 and 1.
	 */
	public void addLinearGradient(String area, int angle, Map<String,Double> colorsOffsets) throws Exception;
	
	/**
	 * A Linear Stripe can be added to either the background or chart area and can be
	 * used in conjunction with Linear Gradient and Solid Fill for various chart effects.
	 * Multiple linear stripe effects can be added.
	 * 
	 * @param <code>String</code> the area of effect (either bg -background or c -chartarea)
	 * @param <code>int</code> the angle of the stripe - must be between 0 (horizontal)
	 * and 90 (vertical)
	 * @param <code>Map<String,Double></code> specifies a hexadecimal RGB color for the stripe and 
	 * the width (between 0 and 1) of the stripe, where 1 is the full width of the chart. Color 
	 * transparency can be specified by appending 00 to FF to the hexadecimal color with 00 
	 * being completely transparent and FF being completely opaque.
	 * @throws <code>Exception</code> when area is not bg or c, when angle is not between 0 and
	 * 90 and when the widths are not between 0 and 1.
	 */
	public void addLinearStripe(String area, int angle, Map<String,Double> colorsWidths) throws Exception;
	
	
	/**
	 * A legend can be added to the chart by specifying labels for the data. Colors
	 * can also be specified for the legend (see addChartColors).
	 * 
	 * @param <code>List<String></code> labels
	 */
	public void addLegendLabels(List<String> labels);
	
	/**
	 * Four positions are available for the legend; t (top), b (bottom), r(right) and
	 * l (left). This option is only available if legend labels have already been set.
	 * 
	 * @param position
	 * @throws <code>Exception</code> when the position is not t, b, r or l or if
	 * legend labels have not been set.
	 */
	public void setLegendPosition(String position) throws Exception;
	
	/**
	 * Adds gridlines to the chart. The <code>double</code> x parameter specifies the
	 * step along the x axis while <code>double</code> y parameter specifies the step
	 * along the y axis.
	 * 
	 * @param <code>double</code> x
	 * @param <code>double</code> y
	 */
	public void addGridLines(double x, double y);
	
	/**
	 * Adds gridlines to the chart. The <code>double</code> x parameter specifies the
	 * step along the x axis while <code>double</code> y parameter specifies the step
	 * along the y axis. The <code>double</code> line parameter specifies the length for
	 * each line segment in the dashed-line and the <code>double</code> blank parameter
	 * specifies the length of the spaces in between the line segments. For solid lines,
	 * set the blank parameter to 0.
	 * 
	 * @param <code>double</code> x
	 * @param <code>double</code> y
	 * @param <code>double</code> line
	 * @param <code>double</code> blank
	 */
	public void addGridLines(double x, double y, double line, double blank);
	
	/**
	 * The fill area is determined by the index and order of the data sets that have
	 * been added. The first data set is index 0, second is index 1 and so on. The
	 * <code>String</code> is a hexadecimal RGB color value. The <code>int</code> start
	 * is index of the line (data set) where the color fill is to begin. The <code>int</code>
	 * end is the index of the line (data set) where the color fill is to end. Multiple
	 * fill areas are allowed. If there is only one data set, to fill the area underneath,
	 * set both start and end = 0;
	 * 
	 * @param <code>String</code> color
	 * @param <code>int</code> start
	 * @param <code>int</code> end
	 */
	public void addFillArea(String color, int start, int end);
	
	/**
	 * Same as above except that multiple fill areas can be specified in <code>List</code>.
	 * An Exception will be thrown if the Lists are not of the same size.
	 * 
	 * @param <code>List<String></code> color
	 * @param <code>List<Integer></code> start
	 * @param <code>List<Integer></code> end
	 * @throws <code>Exception</code> when list sizes do not match
	 */
	public void addFillArea(List<String> color, List<Integer> start, List<Integer> end) throws Exception;
	
	/**
	 * Specifies styling for a LineChart line. Styling for a line must be added
	 * in the same order as the datasets. <code>float</code> thickness is
	 * the thickness of the line. <code>float</code> line is length of line 
	 * segment in pixels. <code>float</code> blank is length of space between
	 * line segments in pixels - enter 0 for a solid line.
	 * 
	 * @param <code>float</code> thickness
	 * @param <code>float</code> line
	 * @param <code>float</code> blank
	 */
	public void addLineStyle(float thickness, float line, float blank);
	
	/**
	 * Specifies styling for LineChart lines. Each list must contain values
	 * in the same order as the datasets were entered.
	 * 
	 * @see LineChartOptions#addLineStyle(float, float, float)
	 * 
	 * @param <code>List<Float></code> thickness
	 * @param <code>List<Float></code> line
	 * @param <code>List<Float></code> blank
	 */
	public void addLineStyle(List<Float> thickness, List<Float> line, List<Float> blank);
	
	/**
	 * Adds a line marker to a bar chart. <code>String</code> color is the hexadecimal
	 * RGB color of the line to add. <code>int</code> index is the index of the data
	 * set that this line is for; 0 for the first data set, 1 for the second, etc.
	 * <code>int</code> size of the line marker in pixels. <code>int</code> priority
	 * determines the order in which bars, lines, markers and fills are drawn; 1 - line
	 * is drawn on top of bars and markers, 0 - line is drawn on top of bars, beneath
	 * markers, -1 - line is drawn beneath bars and markers.
	 * 
	 * @param <code>String</code> color
	 * @param <code>int</code> index
	 * @param <code>int</code> size
	 * @param <code>int</code> priority
	 */
	public void addMoreLineStyle(String color, int index, int size, int priority);
	
	/**
	 * Same as above except that multiple line styles can be specified in <code>List</code>.
	 * An Exception will be thrown if the Lists are not of the same size.
	 * 
	 * @param <code>List<String></code> colors
	 * @param <code>List<Integer></code> indexes
	 * @param <code>List<Integer></code> size
	 * @param <code>List<Integer></code> priority
	 * @throws <code>Exception</code> when the list sizes do not match
	 */
	public void addMoreLineStyle(List<String> colors, List<Integer> indexes, List<Integer> size,
			List<Integer> priority) throws Exception;
	
	/**
	 * Adds a range marker to this chart. The range marker can be of <code>String</code>
	 * type h - horizontal or v - vertical. Any other values will cause an <code>Exception</code>
	 * to be thrown. <code>String</code> color is a hexadecimal RGB color. <code>double</code>
	 * start is the start point of the range (a value between 0.00 and 1.00). <code>double</code>
	 * end is the end point of the range (a value between 0.00 and 1.00). Horizontal range
	 * markers are positioned along the y-axis, spanning the length of the x-axis, where
	 * 0.00 is bottom and 1.00 is top. Vertical range markers are positioned along the
	 * x-axis, spanning the length of the y-axis, where 0.00 is left and 1.00 is right.
	 * Multiple range markers are allowed.
	 * 
	 * @param <code>String</code> type
	 * @param <code>String</code> color
	 * @param <code>double</code> start
	 * @param <code>double</code> end
	 */
	public void addRangeMarker(String type, String color, double start, double end) throws Exception;
	
	/**
	 * Same as above except that multiple range markers can be specified in <code>List</code>s.
	 * An Exception will be thrown if the Lists are not of the same size.
	 * 
	 * @param <code>List<String></code> type
	 * @param <code>List<String></code> color
	 * @param <code>List<Double></code> start
	 * @param <code>List<Double></code> end
	 * @throws <code>Exception</code> when the list sizes do not match
	 */
	public void addRangeMarker(List<String> type, List<String> color, List<Double> start,
			List<Double> end) throws Exception;
	
	/**
	 * Adds a shape marker to this chart. <code>String</code> type can be one of
	 * the following: a - arrow, c - cross, d - diamond, o - circle, s - square,
	 * t - text (with text concatenated e.g. tHello World), v - vertical line from
	 * x-axis to data point, V - vertical line from top of chart through data point
	 * to x-axis, h - horizontal line from y-axis to right side of chart, x - x-shape.
	 * <code>String</code> color is the hexadecimal RGB color of the shape marker.
	 * <code>int</code> index is the index of the data set for which this is to belong.
	 * 0 for the first data set, 1 for the second data set, etc. <code>float</code> point
	 * is the data point within the data set for which this marker is to be used. Use -1
	 * to assign this marker to all data points within this data set. Use a fraction to set
	 * a marker between data points. <code>int</code> size to set the size of the shape
	 * marker in pixels. <code>int</code> priority determines the order in which bars, lines,
	 * markers and fills are drawn; 1 - line is drawn on top of bars and markers, 0 - line
	 * is drawn on top of bars, beneath markers, -1 - line is drawn beneath bars and markers.
	 * 
	 * @param <code>String</code> type
	 * @param <code>String</code> color
	 * @param <code>int</code> index
	 * @param <code>float</code> point
	 * @param <code>int</code> size
	 * @param <code>int</code> priority
	 * @throws <code>Exception</code> when the type value is invalid.
	 */
	public void addShapeMarker(String type, String color, int index, float point,
			int size, int priority) throws Exception;
	
	/**
	 * Same as above except that multiple shape markers can be specified in <code>List</code>s.
	 * An Exception will be thrown if the Lists are not of the same size
	 * 
	 * @param <code>String</code> type
	 * @param <code>String</code> color
	 * @param <code>int</code> index
	 * @param <code>float</code> point
	 * @param <code>int</code> size
	 * @param <code>int</code> priority
	 * @throws <code>Exception</code> when this list sizes do not match
	 */
	public void addShapeMarker(List<String> type, List<String> color, List<Integer> index,
			List<Float> point, List<Integer> size, List<Integer> priority) throws Exception;
}
