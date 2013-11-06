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

/**
 * GoogleChartOptions handles optional parameters for GoogleCharts.
 * 
 * @author patrick lawler
 * @version $Id:$
 */
public interface GoogleChartOptions {

	/**
	 * Specifies the colors for chart data sets, data points or chart legend. When
	 * specified, the SAME color is used for each data set and matching legend. If less colors
	 * than data sets are specified: for line charts, the last color specified will 
	 * be used for the remaining data sets, for bar charts, the colors are alternated
	 * after last specified. Colors are a six digit <code>String</code> hexadecimal RGB color.
	 * For transparent colors concatenate two digits 00 - FF for a total where 00 is 
	 * completely transparent and FF is totally opaque.
	 * 
	 * Note: Order is important! Colors should be added in the same order as the data
	 * sets that they are intended for.
	 * 
	 * @param <code>String</code> color
	 */
	public void addChartColor(String color);
	
	/**
	 * Specifies a list of colors for this charts data sets, points and legend.
	 * @see GoogleChartOptions#addChartColor(String) 
	 * 
	 * @param <code>String</code> colors
	 */
	public void addChartColor(List<String> colors);
	
	/**
	 * Adds scaling from <code>float</code> min to <code>float</code> max for a
	 * data set. Scaling needs to be added in the same order as that their 
	 * respective data sets were added. If only one scaling value is added
	 * and there are multiple sets of data, that value is used for all data 
	 * sets. If less scaling values are added than there are data sets, the 
	 * last one added is applied to the remaining data sets.
	 * 
	 * @param <code>float</code> min
	 * @param <code>float</code> max
	 */
	public void addScaling(float min, float max);
	
	/**
	 * Adds scaling for multiple data sets.
	 * @see GoogleChartOptions#addScaling(float, float)
	 * 
	 * @param <code>List<Float></code> min
	 * @param <code>List<Float></code> max
	 */
	public void addScaling(List<Float> min, List<Float> max);
	
	/**
	 * A Solid Fill can be added to either the background, chart area or 
	 * to apply a transparency to the entire chart and can be used in conjunction
	 * with Linear Stripe and Linear Gradient if available for that type of
	 * chart. Multiple solid fill effects can be added.
	 * 
	 * @param <code>String</code> the area of effect - either bg (background), c (chartarea)
	 * or a (to apply transparency to whole chart)
	 * @param <code>String</code> color - a hexadecimal RGB color for the fill area. Color
	 * transparency can be specified by appending 00 to FF to the hexadecimal color where 
	 * 00 is completely transparent and FF is completely opaque.
	 *  
	 * @throws <code>Exception</code> when the area is not bg, c or a.
	 */
	public void addSolidFill(String area, String color) throws Exception;
	
	
	/**
	 * Adds a title to this chart. Use a | in the String to force a line break.
	 * 
	 * @param <code>String</code> title
	 */
	public void addTitle(String title);
	
	/**
	 * Adds a <code>String</code> title to this chart with the optional
	 * <code>String</code> hexadecimal RGB color and <code>int</code> font size.
	 * Note: if color is specified, fontsize must also be specified and vice versa.
	 * 
	 * @param <code>String</code> title
	 * @param <code>String</code> color
	 * @param <code>int</code> fontSize
	 */
	public void addTitle(String title, String color, int fontSize);
	
	/**
	 * Returns a <code>String</code> in Google Chart API format of the values
	 * of the options that have been specified for this chart
	 *
	 * @return <code>String</code>
	 */
	public String getOptionString();
}
