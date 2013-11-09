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
package utils;

import java.util.ArrayList;
import java.util.Date;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * @author patrick lawler
 *
 */
public final class Template {
	
	public final static String NL = System.getProperty("line.separator");

	public static JSONObject getProjectTemplate(String name) throws JSONException{
		JSONObject project = new JSONObject();
		JSONObject master = getSequenceTemplate("master", "Master");
		ArrayList<JSONObject> nodes = new ArrayList<JSONObject>();
		ArrayList<JSONObject> sequences = new ArrayList<JSONObject>();
		sequences.add(master);
		project.put("autoStep", true);
		project.put("stepLevelNum", false);
		project.put("stepTerm", "Step");
		project.put("title", name);
		project.put("nodes", nodes);
		project.put("sequences", sequences);
		project.put("startPoint", "master");
		project.put("constraints", new ArrayList<JSONObject>());
		return project;
	}
	
	public static JSONObject getProjectNodeTemplate(String type, String name, String title, String nodeClass) throws JSONException{
		JSONObject node = new JSONObject();
		node.put("type", type);
		node.put("identifier", name);
		node.put("title", title);
		node.put("class", nodeClass);
		node.put("ref", name);
		node.put("previousWorkNodeIds", new JSONArray());
		node.put("hints", new JSONArray());
		node.put("links", new JSONArray());
		return node;
	}
	
	public static JSONObject getSequenceTemplate(String id, String title) throws JSONException{
		JSONObject sequence = new JSONObject();
		sequence.put("type", "sequence");
		sequence.put("identifier", id);
		sequence.put("title", title);
		sequence.put("refs", new ArrayList<String>());
		return sequence;
	}
	
	public static JSONObject getNodeTemplate(String type, String title, String filename) throws JSONException{
		if(type.equals("BrainstormNode")){
			return getBrainstormTemplate();
		} else if(type.equals("FillinNode")){
			return getFillinTemplate();
		} else if(type.equals("HtmlNode")){
			return getHtmlTemplate(title, filename);
		} else if(type.equals("MatchSequenceNode")){
			return getMatchSequenceTemplate();
		} else if(type.equals("MultipleChoiceNode")){
			return getMultipleChoiceTemplate("MultipleChoice");
		} else if(type.equals("ChallengeNode")){
			return getChallengeTemplate();
		} else if(type.equals("BranchNode")){
			return getBranchTemplate();
		} else if(type.equals("NoteNode")){
			return getNoteTemplate();
		} else if(type.equals("OutsideUrlNode")){
			return getOutsideUrlTemplate();
		} else if(type.equals("OpenResponseNode")){
			return getOpenResponseTemplate();
		} else if(type.equals("DrawNode")){
			return getDrawingTemplate(title, filename);
		} else if(type.equals("DataGraphNode")){
			return getDataGraphTemplate();
		} else if(type.equals("MySystemNode")){
			return getMySystemTemplate();
		} else if(type.equals("SVGDrawNode")){
			return getSVGDrawTemplate();
		} else if(type.equals("AssessmentListNode")){
			return getAssessmentListTemplate();
		} else if(type.equals("SensorNode")) {
			return getSensorTemplate();
		} else if(type.equals("ExplanationBuilderNode")) {
			return getExplanationBuilderTemplate();
		} else {
			return null;
		}
	}

	/**
	 * Returns an Outside URL Template
	 * @throws JSONException 
	 */
	private static JSONObject getOutsideUrlTemplate() throws JSONException {
		JSONObject node = new JSONObject();
		node.put("type","OutsideUrl");
		node.put("url","");
		return node;
	}
	
	/**
	 * Returns an Open Response Template
	 * @throws JSONException 
	 */
	protected static JSONObject getOpenResponseTemplate() throws JSONException{
		JSONObject node = new JSONObject();
		JSONObject assessmentItem = new JSONObject();
		JSONObject responseDeclaration = new JSONObject();
		JSONObject interaction = new JSONObject();
		JSONObject starterSentence = new JSONObject();
		
		responseDeclaration.put("baseType", "string");
		responseDeclaration.put("cardinality", "single");
		responseDeclaration.put("identifier", "OR");
		
		interaction.put("hasInlineFeedback", false);
		interaction.put("placeholderText", "");
		interaction.put("responseIdentifier", "OR");
		interaction.put("expectedLines", "5");
		interaction.put("prompt","");
		
		assessmentItem.put("timeDependent", false);
		assessmentItem.put("adaptive", false);
		assessmentItem.put("identifier", "OpenResponse");
		assessmentItem.put("responseDeclaration", responseDeclaration);
		assessmentItem.put("interaction", interaction);
		
		starterSentence.put("display", "0");
		starterSentence.put("sentence", "");
		
		node.put("type","OpenResponse");
		node.put("isRichTextEditorAllowed", false);
		node.put("assessmentItem", assessmentItem);
		node.put("starterSentence", starterSentence);
		return node;
	}

	/**
	 * Returns a Note Template
	 * @throws JSONException 
	 */
	protected static JSONObject getNoteTemplate() throws JSONException {
		JSONObject node = new JSONObject();
		JSONObject assessmentItem = new JSONObject();
		JSONObject responseDeclaration = new JSONObject();
		JSONObject interaction = new JSONObject();
		JSONObject starterSentence = new JSONObject();
		
		responseDeclaration.put("baseType", "string");
		responseDeclaration.put("cardinality", "single");
		responseDeclaration.put("identifier", "Note");
		
		interaction.put("hasInlineFeedback", false);
		interaction.put("placeholderText", "");
		interaction.put("responseIdentifier", "Note");
		interaction.put("expectedLines", "5");
		interaction.put("prompt","");
		
		assessmentItem.put("timeDependent", false);
		assessmentItem.put("adaptive", false);
		assessmentItem.put("identifier", "Note");
		assessmentItem.put("responseDeclaration", responseDeclaration);
		assessmentItem.put("interaction", interaction);
		
		starterSentence.put("display", "0");
		starterSentence.put("sentence", "");
		
		node.put("type","Note");
		node.put("isRichTextEditorAllowed", true);
		node.put("assessmentItem", assessmentItem);
		node.put("starterSentence", starterSentence);
		return node;
	}

	protected static JSONObject getMultipleChoiceTemplate(String identifier) throws JSONException {
		JSONObject node = new JSONObject();
		JSONObject assessmentItem = new JSONObject();
		JSONObject responseDeclaration = new JSONObject();
		JSONObject interaction = new JSONObject();
		
		responseDeclaration.put("identifier", identifier);
		responseDeclaration.put("correctResponse", new ArrayList<String>());
		
		interaction.put("hasInlineFeedback", true);
		interaction.put("responseIdentifier",identifier);
		interaction.put("maxChoices", "1");
		interaction.put("shuffle", true);
		interaction.put("prompt", "");
		interaction.put("choices", new ArrayList<JSONObject>());
		
		assessmentItem.put("timeDependent", false);
		assessmentItem.put("adaptive", false);
		assessmentItem.put("identifier", identifier);
		assessmentItem.put("responseDeclaration", responseDeclaration);
		assessmentItem.put("interaction", interaction);
		
		node.put("type", "MultipleChoice");
		node.put("assessmentItem", assessmentItem);
		return node;
	}

	protected static JSONObject getChallengeTemplate() throws JSONException {
		JSONObject node = getMultipleChoiceTemplate("Challenge");
		
		if(node.has("assessmentItem")){
			JSONObject assessmentItem = node.getJSONObject("assessmentItem");
			if(assessmentItem.has("interaction")){
				JSONObject interaction = assessmentItem.getJSONObject("interaction");
				if(interaction != null){
					JSONObject attempts = new JSONObject();
					attempts.put("navigateTo", "");
					attempts.put("scores", new JSONObject());
					
					interaction.put("attempts", attempts);
				}
			}
		}
		node.put("type", "Challenge");
		
		return node;
	}
	
	protected static JSONObject getBranchTemplate() throws JSONException {
		JSONObject node = getMultipleChoiceTemplate("Branch");
		
		node.put("branches", new ArrayList<String>());
		node.put("type", "Branch");
		
		return node;
	}
	
	protected static JSONObject getMatchSequenceTemplate() throws JSONException {
		JSONObject node = new JSONObject();
		JSONObject assessmentItem = new JSONObject();
		JSONObject responseDeclaration = new JSONObject();
		JSONObject interaction = new JSONObject();
		
		responseDeclaration.put("identifier", "MatchSequence");
		responseDeclaration.put("correctResponses", new ArrayList<JSONObject>());
		
		interaction.put("hasInlineFeedback", true);
		interaction.put("responseIdentifier", "MatchSequence");
		interaction.put("shuffle", false);
		interaction.put("ordered", false);
		interaction.put("prompt", "");
		interaction.put("choices", new ArrayList<JSONObject>());
		interaction.put("fields", new ArrayList<JSONObject>());
		
		assessmentItem.put("timeDependent", false);
		assessmentItem.put("adaptive", false);
		assessmentItem.put("identifier", "MatchSequence");
		assessmentItem.put("responseDeclaration", responseDeclaration);
		assessmentItem.put("interaction", interaction);
		
		node.put("type", "MatchSequence");
		node.put("assessmentItem", assessmentItem);
		
		return node;
	}

	protected static JSONObject getHtmlTemplate(String title, String filename) throws JSONException {
		JSONObject node = new JSONObject();
		node.put("type","Html");
		node.put("src", filename.replace("ht", "html"));
		
		return node;
	}
	
	protected static String getHtmlStringForType(String type, String title, String filename){
		if(type.equals("HtmlNode")){
			return "<html>" + NL + "<head>" + NL + "<title>" + title + "</title>" + NL + "</head>" + NL + "<body>" + NL + "</body>" + NL + "</html>";
		} else if(type.equals("DrawNode")){
			return getDrawingString(title);
		} else {
			return null;
		}
	}

	protected static JSONObject getFillinTemplate() throws JSONException {
		JSONObject node = new JSONObject();
		JSONObject assessmentItem = new JSONObject();
		JSONObject outcomeDeclaration = new JSONObject();
		JSONArray interaction = new JSONArray();
		JSONArray responseDeclarations = new JSONArray();
		
		outcomeDeclaration.put("identifier", "SCORE");
		outcomeDeclaration.put("cardinality", "single");
		outcomeDeclaration.put("baseType", "float");
		
		assessmentItem.put("timeDependent", false);
		assessmentItem.put("adaptive", false);
		assessmentItem.put("identifier", "Fillin");
		assessmentItem.put("outcomeDeclaration", outcomeDeclaration);
		assessmentItem.put("interaction", interaction);
		assessmentItem.put("responseDeclarations", responseDeclarations);
		
		node.put("type","Fillin");
		node.put("assessmentItem", assessmentItem);
		
		return node;
	}

	protected static JSONObject getBrainstormTemplate() throws JSONException {
		JSONObject node = new JSONObject();
		JSONObject assessmentItem = new JSONObject();
		JSONObject interaction = new JSONObject();
		JSONObject starterSentence = new JSONObject();
		
		interaction.put("responseIdentifier", "Brainstorm");
		interaction.put("expectedLines", "5");
		interaction.put("prompt","");
		
		assessmentItem.put("timeDependent", false);
		assessmentItem.put("adaptive", false);
		assessmentItem.put("identifier", "Brainstorm");
		assessmentItem.put("interaction", interaction);
		
		starterSentence.put("display", "0");
		starterSentence.put("sentence", "");
		
		node.put("type","Brainstorm");
		node.put("isRichTextEditorAllowed", true);
		node.put("isGated", true);
		node.put("title", "");
		node.put("displayName", "0");
		node.put("isPollEnded", false);
		node.put("isInstantPollActive", false);
		node.put("assessmentItem", assessmentItem);
		node.put("cannedResponses", new ArrayList<JSONObject>());
		node.put("starterSentence", starterSentence);
		node.put("useServer", true);
		return node;
	}
	
	private static JSONObject getDrawingTemplate(String title, String filename) throws JSONException{
		JSONObject node = new JSONObject();
		node.put("type", "Draw");
		node.put("src", filename.replace(".ht", ".html"));
		
		return node;
	}
	
	protected static JSONObject getSVGDrawTemplate() throws JSONException {
		JSONObject node = new JSONObject();
		
		node.put("svg_background", "");
		node.put("prompt", "");
		node.put("stamps", new ArrayList<String>());
		node.put("snapshots_active", true);
		node.put("description_active", true);
		node.put("description_default", "Enter description here.");
		node.put("type","SVGDraw");
		
		return node;
	}
	
	protected static JSONObject getAssessmentListTemplate() throws JSONException {
		JSONObject node = new JSONObject();
		
		node.put("prompt", "");
		node.put("assessments", new ArrayList<JSONObject>());
		node.put("type","AssessmentList");
		node.put("displayAnswerAfterSubmit", true);
		node.put("isMustCompleteAllPartsBeforeExit",true);
		node.put("isLockAfterSubmit", false);
		
		return node;
	}
	
	protected static JSONObject getDataGraphTemplate() throws JSONException{
		JSONObject node = new JSONObject();
		JSONObject options = new JSONObject();
		JSONObject display = new JSONObject();
		JSONObject graph = new JSONObject();
		JSONObject table = new JSONObject();
		
		display.put("which", "2");
		display.put("start", "0");
		
		graph.put("range", true);
		graph.put("bar", true);
		graph.put("line", true);
		graph.put("point", true);
		graph.put("linePoint", true);
		
		options.put("display", display);
		options.put("graph", graph);
		
		table.put("title", "");
		table.put("titleEditable", true);
		table.put("independentIndex", -1);
		table.put("titleIndex", -1);
		table.put("isQualitative", false);
		table.put("xLabel", "");
		table.put("yLabel", "");
		table.put("xLabelEditable", true);
		table.put("yLabelEditable", true);
		table.put("rows", new ArrayList<JSONObject>());
		table.put("graphWidth", 800);
		table.put("graphHeight", 573);
		
		node.put("type", "DataGraph");
		node.put("prompt", "");
		node.put("options", options);
		node.put("table", table);
		
		return node;
	}
	
	/**
	 * Create the template for the Sensor step content. The JSON string
	 * will be saved to the step file.
	 * @return a JSONObject that represents the content for the step
	 * @throws JSONException
	 */
	protected static JSONObject getSensorTemplate() throws JSONException {
		//the object that represents the step
		JSONObject node = new JSONObject();
		
		//create a starter sentence object with attributes
		JSONObject starterSentence = new JSONObject();
		starterSentence.put("display", "0");
		starterSentence.put("sentence", "");
		
		//set the attributes in the step
		node.put("prompt", "");
		node.put("graphParams", new JSONObject());
		node.put("sensorType", "motion");
		node.put("starterSentence", starterSentence);
		node.put("expectedLines", 5);
		node.put("type", "Sensor");
		
		return node;
	}
	
	/**
	 * Create the template for the Explanation Builder step content. The JSON string
	 * will be saved to the step file.
	 * @return a JSONObject that represents the content for the step
	 * @throws JSONException
	 */
	protected static JSONObject getExplanationBuilderTemplate() throws JSONException {
		//the object that represents the step
		JSONObject node = new JSONObject();
		
		//set the attributes in the step
		node.put("prompt", "");
		node.put("background", "");
		node.put("type", "ExplanationBuilder");
		
		return node;
	}
	
	protected static JSONObject getMySystemTemplate() throws JSONException{
		JSONObject node = new JSONObject();
		node.put("type", "MySystem");
		node.put("prompt", "");
		node.put("modules", new ArrayList<JSONObject>());
		
		return node;
	}
	
	private static String getDrawingString(String title){
		return "<html>" + NL + "<head>" + NL + "<title>" + title + "</title>" + NL + 
		"<script type=\"text/javascript\" src=\"/vlewrapper/vle/node/draw/wisedraw.js\"></script>" +
		NL + "</head>" + NL + "<body onload=\"doneLoading()\">" + NL +
		"<input type=\"button\" name=\"drawSave\" value=\"Save\" onClick=\"saveDrawingData()\"></input>" +
		NL + "<br></br>" + NL +
		"<applet id=\"wisedraw\" name=\"wisedraw\" width=\"620\" height=\"480\" code=\"org.telstech.pedraw.util.PDLauncher\" codebase=\"/vlewrapper/vle/node/draw/\" archive=\"pedraw.jar,aelfred-1.1.jar,commons-logging-1.0.4.jar,log4j-1.2.8.jar\" mayscript>" +
		NL + "<param name=\"tool:1\" value=\"SelectTool\">" + NL + "<param name=\"tool:2\" value=\"PathTool\">" + NL +
		"<param name=\"tool:3\" value=\"LineTool\">" + NL + "<param name=\"tool:4\" value=\"ArrowTool\">" + NL +
		"<param name=\"tool:5\" value=\"RectTool\">" + NL + "<param name=\"tool:6\" value=\"EllipseTool\">" + NL +
		"<param name=\"tool:7\" value=\"CircleTool\">" + NL + "<param name=\"tool:8\" value=\"TextTool\">" + NL +
		"<param name=\"tool:9\" value=\"StampTool\">" + NL + "</applet>" + NL + "</body>" + NL + "</html>";
	}
	
	protected static JSONObject getProjectMetaTemplate(String title) throws JSONException{
		JSONObject meta = new JSONObject();
		
		meta.put("title", title);
		meta.put("subject", "");
		meta.put("summary", "");
		meta.put("author", "");
		meta.put("graderange", "");
		meta.put("totaltime", "");
		meta.put("comptime", "");
		meta.put("contact", "");
		meta.put("techreqs", "");
		meta.put("tools", "");
		meta.put("lessonplan", "");
		meta.put("standards", "");
		meta.put("keywords", "");
		
		Long timestamp = new Date().getTime();
		meta.put("lastEdited", timestamp);
		meta.put("lastCleaned", getLastCleanedJSON(timestamp + 1));
		
		return meta;
	}
	
	private static JSONObject getLastCleanedJSON(Long timestamp) throws JSONException{
		JSONObject lastCleaned = new JSONObject();
		JSONObject results = new JSONObject();
		JSONObject severe = new JSONObject();
		JSONObject warning = new JSONObject();
		JSONObject notification = new JSONObject();
		
		severe.put("detected", 0);
		severe.put("resolved", 0);
		warning.put("detected", 0);
		warning.put("resolved", 0);
		notification.put("detected", 0);
		notification.put("resolved", 0);
		
		results.put("severe",severe);
		results.put("warning",warning);
		results.put("notification",notification);
		
		lastCleaned.put("timestamp",timestamp);
		lastCleaned.put("results",results);
		
		return lastCleaned;
	}
}
