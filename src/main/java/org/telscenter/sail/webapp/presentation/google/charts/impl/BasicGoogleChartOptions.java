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

import java.util.LinkedList;
import java.util.List;

import org.telscenter.sail.webapp.presentation.google.charts.ChartOption;
import org.telscenter.sail.webapp.presentation.google.charts.GoogleChartOptions;
import org.telscenter.sail.webapp.presentation.google.charts.options.ChartColor;
import org.telscenter.sail.webapp.presentation.google.charts.options.ChartEffect;
import org.telscenter.sail.webapp.presentation.google.charts.options.ChartTitle;
import org.telscenter.sail.webapp.presentation.google.charts.options.DataScaling;
import org.telscenter.sail.webapp.presentation.google.charts.options.SolidFill;

/**
 * Basic implementation of GoogleChartOptions. The options implemented
 * in this class can be used for all types of GoogleCharts except for
 * GoogleMaps
 * 
 * @author patrick lawler
 * @version $Id:$
 */
public class BasicGoogleChartOptions implements GoogleChartOptions{
	
	protected List<ChartOption> options = new LinkedList<ChartOption>();
	
	protected ChartColor chartColor;
	
	protected DataScaling scaling;
	
	protected ChartEffect chartEffect;
	
	protected ChartTitle chartTitle;

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.GoogleChartOptions#addChartColor(java.lang.String)
	 */
	public void addChartColor(String color) {
		if(chartColor==null){
			this.chartColor = new ChartColor();
			this.options.add(this.chartColor);
		}
		this.chartColor.addColor(color);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.GoogleChartOptions#addChartColors(java.util.List)
	 */
	public void addChartColor(List<String> colors) {
		if(chartColor==null){
			this.chartColor = new ChartColor();
			this.options.add(this.chartColor);
		}
		this.chartColor.addColor(colors);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.GoogleChartOptions#addScaling(int, int)
	 */
	public void addScaling(float min, float max) {
		if(this.scaling==null){
			this.scaling = new DataScaling();
			this.options.add(this.scaling);
		}
		this.scaling.addScaling(min, max);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.GoogleChartOptions#addScaling(java.util.List, java.util.List)
	 */
	public void addScaling(List<Float> min, List<Float> max) {
		if(this.scaling==null){
			this.scaling = new DataScaling();
			this.options.add(this.scaling);
		}
		this.scaling.addScaling(min, max);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.GoogleChartOptions#addSolidFill(java.lang.String, java.lang.String)
	 */
	public void addSolidFill(String area, String color) throws Exception {
		if(this.chartEffect==null){
			this.chartEffect = new ChartEffect();
			this.options.add(this.chartEffect);
		}
		this.chartEffect.addChartEffect(new SolidFill(area, color));
	}
	
	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.GoogleChartOptions#addTitle(java.lang.String)
	 */
	public void addTitle(String title){
		if(this.chartTitle==null){
			this.chartTitle = new ChartTitle();
			this.options.add(this.chartTitle);
		}
		this.chartTitle.setTitle(title);
	}
	
	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.GoogleChartOptions#addTitle(java.lang.String, java.lang.String, int)
	 */
	public void addTitle(String title, String color, int fontSize){
		if(this.chartTitle==null){
			this.chartTitle = new ChartTitle();
			this.options.add(this.chartTitle);
		}
		this.chartTitle.setTitle(title);
		this.chartTitle.setColor(color);
		this.chartTitle.setFontSize(fontSize);
	}

	/**
	 * @see org.telscenter.sail.webapp.presentation.google.charts.GoogleChartOptions#getOptionString()
	 */
	public String getOptionString() {
		String options = "";
		for(ChartOption option : this.options){
			options = options + option.getOptionString();
		}
		return options;
	}
}
