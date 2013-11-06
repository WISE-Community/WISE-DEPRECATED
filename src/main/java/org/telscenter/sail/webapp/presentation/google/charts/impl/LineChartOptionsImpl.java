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
package org.telscenter.sail.webapp.presentation.google.charts.impl;

import java.util.List;
import java.util.Map;

import org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions;
import org.telscenter.sail.webapp.presentation.google.charts.options.ChartColor;
import org.telscenter.sail.webapp.presentation.google.charts.options.ChartEffect;
import org.telscenter.sail.webapp.presentation.google.charts.options.ChartLabels;
import org.telscenter.sail.webapp.presentation.google.charts.options.ChartLegend;
import org.telscenter.sail.webapp.presentation.google.charts.options.FillArea;
import org.telscenter.sail.webapp.presentation.google.charts.options.GridLines;
import org.telscenter.sail.webapp.presentation.google.charts.options.LineStyles;
import org.telscenter.sail.webapp.presentation.google.charts.options.LinearGradient;
import org.telscenter.sail.webapp.presentation.google.charts.options.LinearStripes;
import org.telscenter.sail.webapp.presentation.google.charts.options.MarkersAndStyle;
import org.telscenter.sail.webapp.presentation.google.charts.options.MoreLineStyles;
import org.telscenter.sail.webapp.presentation.google.charts.options.RangeMarker;
import org.telscenter.sail.webapp.presentation.google.charts.options.ShapeMarker;

/**
 * @author patrick lawler
 * @version $Id:$
 */
public class LineChartOptionsImpl extends BasicGoogleChartOptions implements LineChartOptions{

	private ChartLegend legend;
	
	private GridLines gridLines;
	
	private MarkersAndStyle markersAndStyle;
	
	private ChartLabels chartLabels;
	
	private LineStyles lineStyles;

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#colorForPoints(boolean)
	 */
	public void colorForPoints(boolean v) {
		if(this.chartColor==null){
			this.chartColor = new ChartColor();
			this.options.add(this.chartColor);
		}
		this.chartColor.colorForPoints(v);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addLabels(java.lang.String, java.util.List)
	 */
	public void addLabels(String axis, List<?> labels) throws Exception{
		if(this.chartLabels==null){
			this.chartLabels = new ChartLabels();
			this.options.add(this.chartLabels);
		}
		this.chartLabels.addLabels(axis, labels);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addAxisRange(int, int, int)
	 */
	public void addAxisRange(int index, int start, int end) {
		if(this.chartLabels==null){
			this.chartLabels = new ChartLabels();
			this.options.add(this.chartLabels);
		}
		this.chartLabels.addAxisRange(index, start, end);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addAxisStyle(int, java.lang.String, int, int)
	 */
	public void addAxisStyle(int index, String color, int size, int alignment) {
		if(this.chartLabels==null){
			this.chartLabels = new ChartLabels();
			this.options.add(this.chartLabels);
		}
		this.chartLabels.addAxisStyle(index, color, size, alignment);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addAxisStyle(int, java.lang.String)
	 */
	public void addAxisStyle(int index, String color) {
		if(this.chartLabels==null){
			this.chartLabels = new ChartLabels();
			this.options.add(this.chartLabels);
		}
		this.chartLabels.addAxisStyle(index, color);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addAxisStyle(int, java.lang.String, int)
	 */
	public void addAxisStyle(int index, String color, int size) {
		if(this.chartLabels==null){
			this.chartLabels = new ChartLabels();
			this.options.add(this.chartLabels);
		}
		this.chartLabels.addAxisStyle(index, color, size);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addLabelPosition(int, java.util.List)
	 */
	public void addLabelPosition(int index, List<Float> positions) {
		if(this.chartLabels==null){
			this.chartLabels = new ChartLabels();
			this.options.add(this.chartLabels);
		}
		this.chartLabels.addLabelPosition(index, positions);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addLinearGradient(java.lang.String, int, java.util.Map)
	 */
	public void addLinearGradient(String area, int angle, Map<String, Double> colorsOffsets) throws Exception {
		if(this.chartEffect==null){
			this.chartEffect = new ChartEffect();
			this.options.add(this.chartEffect);
		}
		this.chartEffect.addChartEffect(new LinearGradient(area, angle, colorsOffsets));
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addLinearStripe(java.lang.String, int, java.util.Map)
	 */
	public void addLinearStripe(String area, int angle,	Map<String, Double> colorsWidths) throws Exception {
		if(this.chartEffect==null){
			this.chartEffect = new ChartEffect();
			this.options.add(this.chartEffect);
		}
		this.chartEffect.addChartEffect(new LinearStripes(area, angle, colorsWidths));
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addLegendLabels(java.util.List)
	 */
	public void addLegendLabels(List<String> labels) {
		if(this.legend==null){
			this.legend = new ChartLegend();
			this.options.add(this.legend);
		}
		this.legend.addLegendLabels(labels);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#setLegendPosition(java.lang.String)
	 */
	public void setLegendPosition(String position) throws Exception {
		if(this.legend==null){
			throw new Exception("Cannot set legend position before adding legend labels");
		}
		this.legend.setLegendPosition(position);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addGridLines(double, double)
	 */
	public void addGridLines(double x, double y) {
		if(this.gridLines==null){
			this.gridLines = new GridLines();
			this.options.add(this.gridLines);
		}
		this.gridLines.addGridLines(x, y);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addGridLines(double, double, double, double)
	 */
	public void addGridLines(double x, double y, double line, double blank) {
		if(this.gridLines==null){
			this.gridLines = new GridLines();
			this.options.add(this.gridLines);
		}
		this.gridLines.addGridLines(x, y, line, blank);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addFillArea(java.lang.String, int, int)
	 */
	public void addFillArea(String color, int start, int end) {
		if(this.markersAndStyle==null){
			this.markersAndStyle = new MarkersAndStyle();
			this.options.add(this.markersAndStyle);
		}
		FillArea fillArea = new FillArea();
		fillArea.addFillArea(color, start, end);
		this.markersAndStyle.addMarkerAndStyle(fillArea);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addFillArea(java.util.List, java.util.List, java.util.List)
	 */
	public void addFillArea(List<String> color, List<Integer> start, List<Integer> end) throws Exception {
		if(this.markersAndStyle==null){
			this.markersAndStyle = new MarkersAndStyle();
			this.options.add(this.markersAndStyle);
		}
		FillArea fillArea = new FillArea();
		fillArea.addFillArea(color, start, end);
		this.markersAndStyle.addMarkerAndStyle(fillArea);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addLineStyle(float, float, float)
	 */
	public void addLineStyle(float thickness, float line, float blank){
		if(this.lineStyles==null){
			this.lineStyles = new LineStyles();
			this.options.add(this.lineStyles);
		}
		this.lineStyles.addLineStyle(thickness, line, blank);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addLineStyle(java.util.List, java.util.List, java.util.List)
	 */
	public void addLineStyle(List<Float> thickness, List<Float> line, List<Float> blank){
		if(this.lineStyles==null){
			this.lineStyles = new LineStyles();
			this.options.add(this.lineStyles);
		}
		this.lineStyles.addLineStyle(thickness, line, blank);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addMoreLineStyle(java.lang.String, int, int, int)
	 */
	public void addMoreLineStyle(String color, int index, int size, int priority) {
		if(this.markersAndStyle==null){
			this.markersAndStyle = new MarkersAndStyle();
			this.options.add(this.markersAndStyle);
		}
		MoreLineStyles moreLineStyles = new MoreLineStyles();
		moreLineStyles.addMoreLineStyle(color, index, size, priority);
		this.markersAndStyle.addMarkerAndStyle(moreLineStyles);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addMoreLineStyle(java.util.List, java.util.List, java.util.List, java.util.List)
	 */
	public void addMoreLineStyle(List<String> colors, List<Integer> indexes,
			List<Integer> size, List<Integer> priority) throws Exception {
		if(this.markersAndStyle==null){
			this.markersAndStyle = new MarkersAndStyle();
			this.options.add(this.markersAndStyle);
		}
		MoreLineStyles moreLineStyles = new MoreLineStyles();
		moreLineStyles.addMoreLineStyle(colors, indexes, size, priority);
		this.markersAndStyle.addMarkerAndStyle(moreLineStyles);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addRangeMarker(java.lang.String, java.lang.String, double, double)
	 */
	public void addRangeMarker(String type, String color, double start, double end) throws Exception {
		if(this.markersAndStyle==null){
			this.markersAndStyle = new MarkersAndStyle();
			this.options.add(this.markersAndStyle);
		}
		RangeMarker range = new RangeMarker();
		range.addRangeMarkers(type, color, start, end);
		this.markersAndStyle.addMarkerAndStyle(range);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addRangeMarker(java.util.List, java.util.List, java.util.List, java.util.List)
	 */
	public void addRangeMarker(List<String> type, List<String> color,
			List<Double> start, List<Double> end) throws Exception {
		if(this.markersAndStyle==null){
			this.markersAndStyle = new MarkersAndStyle();
			this.options.add(this.markersAndStyle);
		}
		RangeMarker range = new RangeMarker();
		range.addRangeMarkers(type, color, start, end);
		this.markersAndStyle.addMarkerAndStyle(range);	
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addShapeMarker(java.lang.String, java.lang.String, int, float, int, int)
	 */
	public void addShapeMarker(String type, String color, int index, float point,
			int size, int priority) throws Exception {
		if(this.markersAndStyle==null){
			this.markersAndStyle = new MarkersAndStyle();
			this.options.add(this.markersAndStyle);
		}
		ShapeMarker shape = new ShapeMarker();
		shape.addShapeMarkers(type, color, index, point, size, priority);
		this.markersAndStyle.addMarkerAndStyle(shape);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.LineChartOptions#addShapeMarker(java.util.List, java.util.List, java.util.List, java.util.List, java.util.List, java.util.List)
	 */
	public void addShapeMarker(List<String> type, List<String> color, List<Integer> index, 
			List<Float> point, List<Integer> size, List<Integer> priority) throws Exception {
		if(this.markersAndStyle==null){
			this.markersAndStyle = new MarkersAndStyle();
			this.options.add(this.markersAndStyle);
		}
		ShapeMarker shape = new ShapeMarker();
		shape.addShapeMarkers(type, color, index, point, size, priority);
		this.markersAndStyle.addMarkerAndStyle(shape);
	}
}
