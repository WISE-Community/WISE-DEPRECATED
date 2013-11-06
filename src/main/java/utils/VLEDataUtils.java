/**
 * 
 */
package utils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Utitlity class for working with VLEData
 * @author hirokiterashima
 */
public class VLEDataUtils {

    /**
     * Obtains the value inbetween two xml tags
     * @param nodeVisit the xml
     * @param startTag the start tag
     * @param endTag the end tag
     * @return the value inbetween the start and end tag
     */
    public static String getValueInbetweenTag(String nodeVisit, String startTag, String endTag) {
    	String value = "";
    	
    	//look for the start tag
    	int startPos = nodeVisit.indexOf(startTag);
    	if(startPos == -1) {
    		//if start tag is not found, we will exit
    		return null;
    	}
    	
    	//look for the end tag
    	int endPos = nodeVisit.indexOf(endTag);
    	if(endPos == -1) {
    		//if the end tag is not found, we will exit
    		return null;
    	}
    	
    	//obtain the value inbetween the tags
    	value = nodeVisit.substring(startPos + startTag.length(), endPos);
    	
    	return value;
    }
    
    /**
     * Obtain the value between the type tags
     * @param nodeVisit the xml
     * @return the value inbetween the two tags
     */
    public static String getNodeType(String nodeVisit) {
    	return getValueInbetweenTag(nodeVisit, "<type>", "</type>");
    }
    
    /**
     * Returns the specified nodeVisit's node type
     * @param nodeVisitJSON
     * @return
     * @throws JSONException 
     */
	public static String getNodeType(JSONObject nodeVisitJSON) throws JSONException {
		return nodeVisitJSON.getString("nodeType");
	}
	
	 /**
     * Obtain the value between the id tags
     * @param nodeVisit the xml
     * @return the value inbetween the two tags
     */
    public static String getNodeId(String nodeVisit) {
    	return VLEDataUtils.getValueInbetweenTag(nodeVisit, "<id>", "</id>");
    }
    
    /**
     * Returns the id of the nodeVisit given the nodeVisit JSON object
     * @param nodeVisitJSON
     * @return
     * @throws JSONException 
     */
	public static String getNodeId(JSONObject nodeVisitJSON) throws JSONException {
		return nodeVisitJSON.getString("nodeId");
	}

    /**
     * Obtain the value between the visitStartTime tags without the time zone
     * @param nodeVisit the xml
     * @return the value inbetween the two tags
     */
    public static String getVisitStartTime(String nodeVisit) {
    	String visitStartTime = VLEDataUtils.getValueInbetweenTag(nodeVisit, "<visitStartTime>", "</visitStartTime>");
    	
    	return visitStartTime;
    }
    
    /**
     * Returns the node visit's start time given a JSON object
     * @param nodeVisitJSON
     * @return
     * @throws JSONException 
     */
	public static String getVisitStartTime(JSONObject nodeVisitJSON) throws JSONException {
		return nodeVisitJSON.getString("visitStartTime");
	}

    /**
     * Obtain the value between the visitEndTime tags without the time zone
     * @param nodeVisit the xml
     * @return the value inbetween the two tags
     */
    public static String getVisitEndTime(String nodeVisit) {
    	String visitEndTime = VLEDataUtils.getValueInbetweenTag(nodeVisit, "<visitEndTime>", "</visitEndTime>");
    	
    	return visitEndTime;
    }
    
    /**
     * Returns the node visit's end time given the nodeVisit JSON object
     * @param nodeVisitJSON
     * @return
     * @throws JSONException 
     */
	public static String getVisitEndTime(JSONObject nodeVisitJSON) throws JSONException {
		return nodeVisitJSON.getString("visitEndTime");
	}

    /**
     * Obtain the value between the nodeStates tags. The nodeStates will
     * be what we store in the data column of the vle_visits table.
     * @param nodeVisit the xml
     * @return the value inbetween the two tags
     */
    public static String getNodeStates(String nodeVisit) {
    	return VLEDataUtils.getValueInbetweenTag(nodeVisit, "<nodeStates>", "</nodeStates>");
    }
    
    /**
     * Obtain the value in the nodeStates field
     * @param nodeVisit the node visit JSONObject
     * @return the nodeStates JSONArray or null if the field does not exist or the
     * field is not a JSONArray
     */
    public static JSONArray getNodeStates(JSONObject nodeVisit) {
    	JSONArray nodeStates = null;
    	
    	if(nodeVisit != null) {
    		//try to get the nodeStates field if it exists
    		nodeStates = nodeVisit.optJSONArray("nodeStates");
    	}
    	
    	return nodeStates;
    }

    /**
     * Check if this node visit is a peer review submit
     * @param nodeVisitJSON
     * @return
     * @throws JSONException
     */
    public static boolean isSubmitForPeerReview(JSONObject nodeVisitJSON) throws JSONException {
    	//obtain the node states array from the node visit
    	JSONArray jsonArray = nodeVisitJSON.getJSONArray("nodeStates");
    	
    	//loop through all the node states
    	for(int x=0; x<jsonArray.length(); x++) {
    		
    		//get an element in the array
    		Object jsonArrayElement = jsonArray.get(x);
    		
    		//make sure the element is a JSONObject
    		if(jsonArrayElement instanceof JSONObject) {
    			//get a node state
        		JSONObject nodeState = (JSONObject) jsonArrayElement;

        		//check if it has the attribute "submitForPeerReview"
        		if(nodeState.has("submitForPeerReview")) {
        			return true;
        		}
    		}
    	}
    	
    	return false;
    }
    
    public static String getDuplicateId(JSONObject nodeVisitJSON){
    	try{
    		String duplicateId = null;
    		if(nodeVisitJSON.has("duplicateId")) {
    			nodeVisitJSON.getString("duplicateId");
    		}
    		return duplicateId;
    	} catch (JSONException e){
    		e.printStackTrace();
    		return null;
    	}
    }
}
