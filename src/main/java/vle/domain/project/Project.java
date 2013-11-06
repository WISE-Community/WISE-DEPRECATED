package vle.domain.project;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Vector;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import utils.FileManager;
import vle.domain.node.Node;

/**
 * Project Domain Object to encapsulate WISE LD Project
 * @author geoffreykwan
 * @author hirokiterashima
 */
public class Project {

	private JSONObject projectJSON;
	
	private HashMap<String, String> nodeIdToNodeTitles = new HashMap<String, String>();
	
	private HashMap<String, JSONObject> nodeIdToNode = new HashMap<String, JSONObject>();

	private HashMap<String, String> nodeIdToNodeTitlesWithPosition = new HashMap<String, String>();

	private List<String> nodeIdList = new Vector<String>();

	/**
	 * @param projectFile File containing project json
	 */
	public Project(File projectFile) {
		FileManager fileManager = new FileManager();
		try {
			projectJSON = new JSONObject(fileManager.getFileText(projectFile));
			
			//create the map of node ids to node titles
			makeNodeIdToNodeTitleAndNodeMap(projectJSON);
			
			/*
			 * create the list of node ids in the order they appear in the project.
			 * this also creates the map of node ides to node titles with positions
			 */
			makeNodeIdList(projectJSON);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	/**
	 * Create a map of node id to node titles by looping through the array
	 * of nodes in the project file and creating an entry in the map
	 * for each node
	 * @param project the project JSON object
	 * @return a map of node id to node titles
	 */
	private void makeNodeIdToNodeTitleAndNodeMap(JSONObject project) {
		nodeIdToNodeTitles = new HashMap<String, String>();
		nodeIdToNode = new HashMap<String, JSONObject>();
		
		try {
			//get the array of nodes defined in the project
			JSONArray nodesJSONArray = project.getJSONArray("nodes");
			
			//loop through all the nodes
			for(int x=0; x<nodesJSONArray.length(); x++) {
				//get a node
				JSONObject node = nodesJSONArray.getJSONObject(x);
				
				if(node != null) {
					//obtain the id and title
					String nodeId = node.getString("identifier");
					String title = node.getString("title");
					
					if(nodeId != null && title != null) {
						//put the id and title into the map
						nodeIdToNodeTitles.put(nodeId, title);
					}
					
					if(nodeId != null) {
						nodeIdToNode.put(nodeId, node);
					}
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Make the list of node ids
	 * 
	 * Note: makeNodeIdToNodeTitlesMap() must be called before this function
	 * 
	 * @param project the project JSON object
	 */
	private void makeNodeIdList(JSONObject project) {
		//make a new Vector and set it to the global list object
		nodeIdList = new Vector<String>();
		
		try {
			//get the sequences
			JSONArray sequences = project.getJSONArray("sequences");
			
			//get the start point of the project
			String startPoint = project.getString("startPoint");
			
			//pass startsequence to recursive function that traverses activities and steps
			traverseNodeIdsToMakeNodeIdList(sequences, startPoint, "", 1, startPoint);
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Traverses the sequences in the project file to create a list of nodes in 
	 * the order that they appear in the project and at the same time determining
	 * the position of each node (e.g. 1.1, 1.2, 2.1, 2.2, etc.)
	 * 
	 * @param sequences the JSONArray of sequences
	 * @param identifier the id of the sequence or node we are currently on
	 * @param positionSoFar the position we have traversed down to so far
	 * e.g. if we are on Activity 2
	 * positionSoFar will be "2."
	 * @param nodePosition the position within the current sequence
	 * e.g. if we are on Activity 2, Step 3
	 * @param startPoint the id of the start point sequence of the project
	 * nodePosition will be 3
	 */
	private void traverseNodeIdsToMakeNodeIdList(JSONArray sequences, String identifier, String positionSoFar, int nodePosition, String startPoint) {
		try {
			//try to get the project sequence with the given identifier
			JSONObject projectSequence = getProjectSequence(sequences, identifier);
			
			if(projectSequence == null) {
				//the identifier actually points to a node, this is our base case
				
				//whether to include the data for this step in the export
				boolean exportStep = true;

				/*
				if(customSteps.size() != 0) {
					//the teacher has provided a list of custom steps
					
					if(!customSteps.contains(identifier)) {
						//the current node id is not listed in the custom steps so we will not export the data for it
						exportStep = false;
					}
				}
				*/
				
				if(exportStep) {
					//we will export the data for this step
					
					//add the identifier to our list of nodes
					nodeIdList.add(identifier);
					
					//obtain the title of the node
					String nodeTitle = nodeIdToNodeTitles.get(identifier);
					
					//add the pre-pend the position to the title
					String nodeTitleWithPosition = positionSoFar + nodePosition + " " + nodeTitle;
					
					//add the title with position to the map
					nodeIdToNodeTitlesWithPosition.put(identifier, nodeTitleWithPosition);					
				}
			} else {
				//the identifier points to a sequence so we need to loop through its refs
				JSONArray refs = projectSequence.getJSONArray("refs");
				
				if(!identifier.equals(startPoint)) {
					/*
					 * only do this for sequences that are not the startsequence otherwise
					 * all the positions would start with "1."
					 * so instead of Activity 2, Step 5 being 1.2.5 we really just want 2.5
					 */
					positionSoFar = positionSoFar + nodePosition + ".";
				}
				
				//loop through all the refs
				for(int x=0; x<refs.length(); x++) {
					//get the identifier for a ref
					String refIdentifier = refs.getString(x);
					
					//recursively call the traverse function on the refs
					traverseNodeIdsToMakeNodeIdList(sequences, refIdentifier, positionSoFar, x + 1, startPoint);
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Retrieves the JSONObject for a sequence with the given sequenceId
	 * @param sequences a JSONArray of sequence JSONObjects
	 * @param sequenceId the identifier of the sequence we want
	 * @return the sequence JSONObject or null if we did not find it
	 */
	private JSONObject getProjectSequence(JSONArray sequences, String sequenceId) {
		//loop through all the sequences
		for(int x=0; x<sequences.length(); x++) {
			try {
				//get a sequence
				JSONObject sequence = sequences.getJSONObject(x);
				
				if(sequence != null) {
					//check if the identifier of the sequence is the one we want
					if(sequence.getString("identifier").equals(sequenceId)) {
						//return the sequence since we have found it
						return sequence;
					}
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		//we did not find the sequence we wanted
		return null;
	}

	/**
	 * Returns true iff the specified node is marked as aggregatable.
	 * That is, the node is tag mapped and that tag is associated with
	 * a tag map function "showAggregateWork".
	 * 
	 * Ex: 
	 * nodeToCheck.tags = ["tag1","tag2"]
	 * AnotherNodeInTheProject.tagMaps = [{"tag":"tag1","functionName":"showAggregateWork"}]
	 * 
	 * @param nodeToCheck
	 * @return true iff specified node is marked as aggregatable.
	 */
	public boolean isNodeAggregatable(Node nodeToCheck) {
		try {
		String nodeId = nodeToCheck.getNodeId();
		JSONObject nodeJSONObject = nodeIdToNode.get(nodeId);
		if (nodeJSONObject != null) {
			JSONArray nodeTagsJSONArray = nodeJSONObject.getJSONArray("tags");
			for (int i=0; i < nodeTagsJSONArray.length(); i++) {
				String nodeTagName = (String) nodeTagsJSONArray.get(i);
				String tagMapFunctionName = "showAggregateWork";
				List<JSONObject> nodesThatHaveTagMapsByTagNameAndTagFunctionName = getNodesThatHaveTagMapsByTagNameAndTagFunctionName(nodeTagName, tagMapFunctionName);
				if (nodesThatHaveTagMapsByTagNameAndTagFunctionName.size() > 0) {
					return true;
				}
			}
		}
		} catch (JSONException jsonException) {
			return false;
		}
		return false;
	}
	
	/**
	 * Returns a list of nodes that has a TagMap function whose
	 * tagName is the specified tagMapTagName and whose 
	 * functionName is the specified tagMapFunctionName
	 * 
	 * @param tagName
	 * @return List of Nodes
	 */
	public List<JSONObject> getNodesThatHaveTagMapsByTagNameAndTagFunctionName(String tagMapTagName, String tagMapFunctionName) {
		List<JSONObject> nodesThatHaveTagMapsByTagNameAndTagFunctionName = new ArrayList<JSONObject>();
		try {
			// go through all the nodes in the project and find nodes that has a tagMap whose tagName and functionName match what is specified.
			JSONArray nodesJSONArray = projectJSON.getJSONArray("nodes");
			for (int i=0; i < nodesJSONArray.length(); i++) {
				JSONObject nodeJSONObject = (JSONObject) nodesJSONArray.get(i);
				if (nodeJSONObject.has("tagMaps")) {
					JSONArray nodeTagMapsJSONArray = (JSONArray) nodeJSONObject.get("tagMaps");
					for (int j=0; j < nodeTagMapsJSONArray.length(); j++) {
						JSONObject nodeTagMapJSONObject = (JSONObject) nodeTagMapsJSONArray.get(j);
						if (nodeTagMapJSONObject.getString("tagName").equals(tagMapTagName)
								&& nodeTagMapJSONObject.getString("functionName").equals(tagMapFunctionName)) {
							nodesThatHaveTagMapsByTagNameAndTagFunctionName.add(nodeJSONObject);
						}
					}
				}
			}
		} catch (JSONException e) {
			// do nothing...
		}
		return nodesThatHaveTagMapsByTagNameAndTagFunctionName;
	}
}
