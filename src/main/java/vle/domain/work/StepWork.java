/**
 * 
 */
package vle.domain.work;

import java.sql.Timestamp;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.Session;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import vle.domain.PersistableDomain;
import vle.domain.node.Node;
import vle.domain.user.UserInfo;
import vle.hibernate.HibernateUtil;

/**
 * Domain representing work for a step
 * @author hirokiterashima
 */
@Entity
@Table(name="stepwork")
@Inheritance(strategy=InheritanceType.JOINED)
public class StepWork extends PersistableDomain {

	protected static String fromQuery = "from StepWork";

	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;

	@ManyToOne(cascade = {CascadeType.PERSIST})
	private UserInfo userInfo;
	
	@ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.MERGE})
	private Node node;

	@Column(name="postTime")
	private Timestamp postTime;

	@Column(name="startTime")
	private Timestamp startTime;

	@Column(name="endTime")
	private Timestamp endTime;
	
	@Column(name="duplicateId")
	private String duplicateId;
	
	@Column(name="data", length=5120000)
	private String data;

    public Long getId() {
        return id;
    }

    @SuppressWarnings("unused")
	private void setId(Long id) {
        this.id = id;
    }


	public UserInfo getUserInfo() {
		return userInfo;
	}

	public void setUserInfo(UserInfo userInfo) {
		this.userInfo = userInfo;
	}

	/**
	 * @return the node
	 */
	public Node getNode() {
		return node;
	}

	/**
	 * @param node the node to set
	 */
	public void setNode(Node node) {
		this.node = node;
	}

	/**
	 * @return the postTime
	 */
	public Timestamp getPostTime() {
		return postTime;
	}

	/**
	 * @param postTime the postTime to set
	 */
	public void setPostTime(Timestamp postTime) {
		this.postTime = postTime;
	}

	/**
	 * @return the startTime
	 */
	public Timestamp getStartTime() {
		return startTime;
	}

	/**
	 * @param startTime the startTime to set
	 */
	public void setStartTime(Timestamp startTime) {
		this.startTime = startTime;
	}

	/**
	 * @return the endTime
	 */
	public Timestamp getEndTime() {
		return endTime;
	}

	/**
	 * @param endTime the endTime to set
	 */
	public void setEndTime(Timestamp endTime) {
		this.endTime = endTime;
	}
	
	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}

	public void populateData(String nodeVisit) {
		this.data = nodeVisit;
	}
	
	public void populateData(JSONObject nodeVisitJSON) {
		this.data = nodeVisitJSON.toString();
	}

	/**
	 * @see vle.domain.PersistableDomain#getObjectClass()
	 */
	@Override
	protected Class<?> getObjectClass() {
		return StepWork.class;
	}
	
	/**
	 * Returns a list of StepWork done by the specified workgroup with the specified id or null
	 * if no such StepWork exists. The list will be ordered oldest to newest.
	 * @param id
	 * @param clazz 
	 * @return 
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static List<StepWork> getByUserInfo(UserInfo userInfo) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<StepWork> result =  session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo)).addOrder(Order.asc("endTime")).list();
        session.getTransaction().commit();
        return result;
	}

	/**
	 * Returns the latest StepWork done by the specified workgroup with the specified id or null
	 * if no such StepWork exists.
	 * @param id
	 * @param clazz 
	 * @return 
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static StepWork getLatestByUserInfo(UserInfo userInfo) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<StepWork> list = session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo)).addOrder(Order.desc("endTime")).list();
        StepWork result = null;
        if (list.size() > 0) {
        	result = list.get(0);
        }
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * Returns the latest StepWork done by the specified workgroup with the specified id and specified node
	 * or null if no such StepWork exists.
	 * @param id
	 * @param clazz 
	 * @return 
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static StepWork getLatestByUserInfoAndNode(UserInfo userInfo,Node node) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<StepWork> list = session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo))
        	.add(Restrictions.eq("node",node)).addOrder(Order.desc("endTime")).list();
        StepWork result = null;
        if (list.size() > 0) {
        	result = list.get(0);
        }
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * Get the StepWork for the given UserInfo and Node. The list will be ordered from
	 * newest to oldest.
	 * @param userInfo
	 * @param node
	 * @return a list of StepWork for the user and node
	 */
	@SuppressWarnings("unchecked")
	public static List<StepWork> getByUserInfoAndNode(UserInfo userInfo,Node node) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<StepWork> result = session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo))
        	.add(Restrictions.eq("node",node)).addOrder(Order.desc("endTime")).list();

        session.getTransaction().commit();
        return result;
	}
	
	
	/**
	 * Returns a list of StepWork done by the specified UserInfo user and have 
	 * a nodeId that is in the nodeList. The list will be ordered oldest to newest.
	 * @param userInfo a UserInfo object
	 * @param nodeList a list of Node objects
	 * @return a list of StepWork objects
	 */
	@SuppressWarnings("unchecked")
	public static List<StepWork> getByUserInfoAndNodeList(UserInfo userInfo, List<Node> nodeList) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<StepWork> result =  session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo)).add(createNodeOrCriterion(nodeList, 0)).addOrder(Order.asc("endTime")).list();
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * A recursive function that chains "or" restrictions of nodes together
	 * @param nodeList a list of Node objects, the list must not be empty
	 * @param index the current index in the list to utilize
	 * @return a Criterion of nodes "or"ed together
	 */
	private static Criterion createNodeOrCriterion(List<Node> nodeList, int index) {
		if(index == (nodeList.size() - 1)) {
			/*
			 * base case if the list has only one element just return a
			 * restriction with the node
			 */
			return Restrictions.eq("node", nodeList.get(index));
		} else {
			/*
			 * "or" together this first element with the recursive call
			 * on the rest of the list
			 */
			return Restrictions.or(Restrictions.eq("node", nodeList.get(index)), createNodeOrCriterion(nodeList, index + 1));
		}
	}
	
	/**
	 * Returns a list of StepWork done by the specified workgroup with the specified id or null
	 * if no such Environment exists. The list will be ordered oldest to newest.
	 * @param id
	 * @param clazz 
	 * @return 
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static List<StepWork> getByUserInfosAndNode(List<UserInfo> userInfos, Node node) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<StepWork> result =  session.createCriteria(StepWork.class).add(createUserInfoOrCriterion(userInfos, 0)).add(Restrictions.eq("node", node)).addOrder(Order.asc("endTime")).list();
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * A recursive function that chains "or" restrictions of userInfos together
	 * @param userInfos a list of UserInfo objects, the list must not be empty
	 * @param index the current index in the list to utilize
	 * @return a Criterion of UserInfo "or"ed together
	 */
	public static Criterion createUserInfoOrCriterion(List<UserInfo> userInfos, int index) {
		if(index == (userInfos.size() - 1)) {
			/*
			 * base case if the list has only one element just return a
			 * restriction with the UserInfo
			 */
			return Restrictions.eq("userInfo", userInfos.get(index));
		} else {
			/*
			 * "or" together this first element with the recursive call
			 * on the rest of the list
			 */
			return Restrictions.or(Restrictions.eq("userInfo", userInfos.get(index)), createUserInfoOrCriterion(userInfos, index + 1));			
		}
	}
	
	/**
	 * A recursive function that chains "or" restrictions of ids together
	 * @param ids a list of ids, the list must not be empty
	 * @param index the current index in the list to utilize
	 * @return a Criterion of id "or"ed together
	 */
	public static Criterion createIdOrCriterion(List<Long> ids, int index) {
		if(index == (ids.size() - 1)) {
			/*
			 * base case if the list has only one element just return a
			 * restriction with the id
			 */
			return Restrictions.eq("id", ids.get(index));
		} else {
			/*
			 * "or" together this first element with the recursive call
			 * on the rest of the list
			 */
			return Restrictions.or(Restrictions.eq("id", ids.get(index)), createIdOrCriterion(ids, index + 1));			
		}
	}
	
	/**
	 * Returns an Environment with the specified id or null
	 * if no such Environment exists. The list will be ordered
	 * oldest to newest.
	 * @param id
	 * @param clazz 
	 * @return 
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static List<StepWork> getByNodeId(Long id) {
    	Node node = (Node) Node.getById(new Long(id), Node.class);
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<StepWork> result =  session.createCriteria(StepWork.class).add(Restrictions.eq("node", node)).addOrder(Order.asc("endTime")).list();
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * Returns the StepWork with the specified id
	 * @param id
	 * @return the StepWork object with the specified id
	 */
	public static StepWork getByStepWorkId(Long id) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        StepWork result =  (StepWork) session.createCriteria(StepWork.class).add(Restrictions.eq("id", id)).uniqueResult();
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * Returns the StepWork with the specified userInfo and data
	 * @param userInfo UserInfo of user to check
	 * @param data String data to check for
	 * @return the StepWork object with the specified userInfo and data or null if DNE.
	 */
	public static StepWork getByUserIdAndData(UserInfo userInfo,String data) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        StepWork result =  (StepWork) session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo)).add(Restrictions.eq("data",data)).uniqueResult();
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * Returns the node state object within this stepwork with the specified timestamp
	 * or null if does not exist.
	 * @param timestamp
	 * @return
	 */
	public JSONObject getNodeStateByTimestamp(Long timestampIn) {
		try {
			JSONObject dataJSON = new JSONObject(this.data);
			if (dataJSON != null) {
				JSONArray valueArray = dataJSON.getJSONArray("nodeStates");
				if (valueArray != null) {
					for (int i=0; i<valueArray.length(); i++) {
						JSONObject nodeStateObj = valueArray.getJSONObject(i);
						long timestampFromNodeState = nodeStateObj.getLong("timestamp");
						if (timestampIn != null && timestampIn.equals(timestampFromNodeState)) {
							return nodeStateObj;
						}
						
					}
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		return null;		
	}
	
	/**
	 * If this StepWork contains response for a CRater item, return the
	 * CRaterItemId. Otherwise, return null.
	 * @return
	 */
	public String getCRaterItemId() {
		String cRaterItemId = null;
		
		try {
			JSONObject dataJSON = new JSONObject(this.data);
			if (dataJSON != null) {
				JSONArray nodeStateArray = dataJSON.getJSONArray("nodeStates");
				if (nodeStateArray != null) {
					for (int i=0; i<nodeStateArray.length(); i++) {
						JSONObject nodeStateObj = nodeStateArray.getJSONObject(i);
						
						if(nodeStateObj.has("cRaterItemId")) {
							cRaterItemId = nodeStateObj.getString("cRaterItemId");
							break;
						}
					}
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		return cRaterItemId;
	}
	
	/**
	 * If this StepWork contains response for a CRater item, return the
	 * CRaterItemType. Otherwise, return null.
	 * @return
	 */
	public String getCRaterItemType() {
		String cRaterItemType = null;
		
		try {
			JSONObject dataJSON = new JSONObject(this.data);
			if (dataJSON != null) {
				JSONArray nodeStateArray = dataJSON.getJSONArray("nodeStates");
				if (nodeStateArray != null) {
					for (int i=0; i<nodeStateArray.length(); i++) {
						JSONObject nodeStateObj = nodeStateArray.getJSONObject(i);
						
						if(nodeStateObj.has("cRaterItemType")) {
							cRaterItemType = nodeStateObj.getString("cRaterItemType");
							break;
						}
					}
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		return cRaterItemType;
	}
	/**
	 * Returns the timestamp of the latest NodeState in this StepWork. 
	 * This is the same as the NodeStateId. If no NodeState exists in this StepWork,
	 * return 0.
	 * @return 0 or the timestamp of the latest NodeState in this StepWork.
	 */
	public long getLastNodeStateTimestamp() {
		long timestamp = 0;

		try {
			JSONObject dataJSON = new JSONObject(this.data);
			if (dataJSON != null) {
				JSONArray nodeStateArray = dataJSON.getJSONArray("nodeStates");
				if (nodeStateArray != null && nodeStateArray.length() > 0) {
					JSONObject nodeStateObj = nodeStateArray.getJSONObject(nodeStateArray.length() - 1);
					if(nodeStateObj.has("timestamp")) {
						timestamp = nodeStateObj.getLong("timestamp");
					}
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}

		return timestamp;
	}
	
	/**
	 * @param args
	 */
	@SuppressWarnings("unchecked")
	public static void main(String[] args) {
		
		if (args[0].equals("store")) {
			if (args[1] != null) {
				StepWork env = new StepWork();
				UserInfo userInfo = (UserInfo) UserInfo.getById(new Long(args[1]), UserInfo.class);
				env.setUserInfo(userInfo);
				env.saveOrUpdate();
			} else {
				StepWork env = new StepWork();
				UserInfo userInfo = new UserInfo();
				env.setUserInfo(userInfo);
				env.saveOrUpdate();
			}
		}
		else if (args[0].equals("list")) {
			List<StepWork> envs = (List<StepWork>) StepWork.getList(StepWork.class);
			for (StepWork env : envs) {
				System.out.println("StepWork: " + env.getId());
				if (env.getUserInfo() != null) {
					System.out.println("userinfo id:" + env.getUserInfo().getId());
				}
			}
		}

	}

	/**
	 * @return the duplicateId
	 */
	public String getDuplicateId() {
		return duplicateId;
	}

	/**
	 * @param duplicateId the duplicateId to set
	 */
	public void setDuplicateId(String duplicateId) {
		this.duplicateId = duplicateId;
	}
}
