/**
 * 
 */
package vle.domain.annotation;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Vector;

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

import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import vle.domain.PersistableDomain;
import vle.domain.node.Node;
import vle.domain.user.UserInfo;
import vle.domain.work.StepWork;
import vle.hibernate.HibernateUtil;

/**
 * Domain representing Annotation.
 * Annotations are what users annotate on other
 * user's work, such as Comments, Scores, Flags.
 * @author hirokiterashima
 */
@Entity
@Table(name="annotation")
@Inheritance(strategy=InheritanceType.JOINED)
public class Annotation extends PersistableDomain {

	protected static String fromQuery = "from Annotation";
	
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;

	@ManyToOne(cascade = {CascadeType.PERSIST})
	private UserInfo fromUser;  // who created this annotation

	@ManyToOne(cascade = {CascadeType.PERSIST})
	private UserInfo toUser;  // who this annotation is for
	
	@ManyToOne(cascade = {CascadeType.PERSIST})
	private StepWork stepWork;   // the work that is being annotated

	@Column(name="annotateTime")
	private Timestamp annotateTime;  // when the work was actually annotated

	@Column(name="postTime")
	private Timestamp postTime;  // when this annotation was saved

	@Column(name="runId")
	private Long runId = null;
	
	@Column(name="type")
	private String type = null;
	
	@Column(name="data", length=512000)
	private String data = null;

	public Long getId() {
        return id;
    }

    @SuppressWarnings("unused")
	private void setId(Long id) {
        this.id = id;
    }

	/**
	 * @return the fromUser
	 */
	public UserInfo getFromUser() {
		return fromUser;
	}

	/**
	 * @param fromUser the fromUser to set
	 */
	public void setFromUser(UserInfo fromUser) {
		this.fromUser = fromUser;
	}

	/**
	 * @return the toUser
	 */
	public UserInfo getToUser() {
		return toUser;
	}

	/**
	 * @param toUser the toUser to set
	 */
	public void setToUser(UserInfo toUser) {
		this.toUser = toUser;
	}

	/**
	 * @return the stepWork
	 */
	public StepWork getStepWork() {
		return stepWork;
	}

	/**
	 * @param stepWork the stepWork to set
	 */
	public void setStepWork(StepWork stepWork) {
		this.stepWork = stepWork;
	}

	/**
	 * @return the annotateTime
	 */
	public Timestamp getAnnotateTime() {
		return annotateTime;
	}

	/**
	 * @param annotateTime the annotateTime to set
	 */
	public void setAnnotateTime(Timestamp annotateTime) {
		this.annotateTime = annotateTime;
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
	 * @return the id of the run
	 */
    public Long getRunId() {
		return runId;
	}

    /**
     * @param runId the id of the run
     */
	public void setRunId(Long runId) {
		this.runId = runId;
	}

	/**
	 * @see vle.domain.PersistableDomain#getObjectClass()
	 */
	@Override
	protected Class<?> getObjectClass() {
		return Annotation.class;
	}

	/**
	 * 
	 * @return
	 */
	public String getType() {
		return type;
	}

	/**
	 * 
	 * @param type
	 */
	public void setType(String type) {
		this.type = type;
	}

	/**
	 * populates the data of the annotation
	 * @param nodeVisit
	 */
	public void setData(String data) {
		// to be overridden by subclass.
		this.data = data;
	}
	
	/**
	 * Returns the data associated with this stepWork
	 * @return
	 */
	public String getData() {
		return this.data;
	}
	
	/**
	 * The default constructor for Annotation
	 */
	public Annotation() {
	}
	
	/**
	 * The constructor for Annotation
	 * @param type the annotation type
	 */
	public Annotation(String type) {
		this.type = type;
	}
	
	/**
	 * Constructor for Annotation
	 * @param stepWork
	 * @param fromUser who this annotation is from
	 * @param toUser who this annotation is for
	 * @param runId
	 * @param postTime
	 * @param type
	 * @param data
	 */
	public Annotation(StepWork stepWork, UserInfo fromUser, UserInfo toUser, Long runId, Timestamp postTime, String type, String data) {
		setStepWork(stepWork);
		setFromUser(fromUser);
		setToUser(toUser);
		setRunId(runId);
		setPostTime(postTime);
		setType(type);
		setData(data);
	}
	
	/**
	 * Returns a list of Annotation that were made from
	 * the specified workgroup to the specified workgroup.
	 * If either workgroup is null, handle for all workgroup.
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static List<Annotation> getByFromWorkgroupAndToWorkgroup(UserInfo fromWorkgroup, UserInfo toWorkgroup, Class<?> clazz) {
		// first get all the work done by the toWorkgroup.
		List<StepWork> workByToWorkgroup = StepWork.getByUserInfo(toWorkgroup);

		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();

        List<Annotation> result = 
        	session.createCriteria(clazz)
        		.add( Restrictions.eq("fromUser", fromWorkgroup))
        		.add( Restrictions.in("stepWork", workByToWorkgroup))
        		.list();
        session.getTransaction().commit();
        return result;
	}
	
	
	/**
	 * Get a list of Annotation objects given a list of fromWorkgroups and a toWorkgroup
	 * @param fromWorkgroups a list of from workroups
	 * @param toWorkgroup a to workgroup
	 * @param clazz
	 * @return a list of Annotation objects that match the toWorkgroup and any fromWorkgroup
	 * in the list of fromWorkgroups
	 */
	@SuppressWarnings("unchecked")
	public static List<Annotation> getByFromWorkgroupsAndToWorkgroup(List<UserInfo> fromWorkgroups, UserInfo toWorkgroup, Class<?> clazz) {
		// first get all the work done by the toWorkgroup.
		List<StepWork> workByToWorkgroup = StepWork.getByUserInfo(toWorkgroup);

		List<Annotation> result = new Vector<Annotation>();
		
		//check if there was any work
		if(workByToWorkgroup.size() != 0) {
			Session session = HibernateUtil.getSessionFactory().getCurrentSession();
	        session.beginTransaction();

	        result = 
	        	session.createCriteria(clazz)
	        		.add( Restrictions.in("fromUser", fromWorkgroups))
	        		.add( Restrictions.in("stepWork", workByToWorkgroup))
	        		.list();
	        session.getTransaction().commit();
		}

        return result;
	}
	
	/**
	 * Returns a list of Annotation that are for the specified run id
	 * @param runId the id of the run we want annotations for
	 * @param clazz this Annotation.class
	 * @return a list of Annotation
	 */
	@SuppressWarnings("unchecked")
	public static List<? extends Annotation> getByRunId(Long runId, Class<?> clazz) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();

        List<Annotation> result = 
        	session.createCriteria(clazz)
        		.add( Restrictions.eq("runId", runId))
        		.list();
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * Returns a list of Annotations that are for the specified run id and
	 * have the specific annotation type
	 * @param runId the id of the run we want annotations for
	 * @param type the type of annotation we want
	 * @param clazz this Annotation.class
	 * @return a list of Annotation
	 */
	@SuppressWarnings("unchecked")
	public static List<? extends Annotation> getByRunIdAndType(Long runId, String type, Class<?> clazz) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();

        List<Annotation> result = 
        	session.createCriteria(clazz)
        		.add(Restrictions.eq("runId", runId))
        		.add(Restrictions.eq("type", type))
        		.list();
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * @param userInfo User who did the annotation
	 * @param stepWork stepWork that was annotated
	 * @return
	 */
	public static Annotation getByUserInfoAndStepWork(UserInfo userInfo, StepWork stepWork, String type) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();

        Annotation result = null;
        
        if(type != null) {
        	result = 
        			(Annotation) session.createCriteria(Annotation.class)
        			.add( Restrictions.eq("fromUser", userInfo))
        			.add( Restrictions.eq("stepWork", stepWork))
        			.add( Restrictions.eq("type", type))
        			.uniqueResult();
        	session.getTransaction().commit();        	
        } else {
        	result = 
        			(Annotation) session.createCriteria(Annotation.class)
        			.add( Restrictions.eq("fromUser", userInfo))
        			.add( Restrictions.eq("stepWork", stepWork))
        			.uniqueResult();
        	session.getTransaction().commit();
        }
        
        return result;
	}
	
	public static Annotation getByFromUserInfoToUserInfoStepWorkType(UserInfo fromUserInfo, UserInfo toUserInfo, StepWork stepWork, String type) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();

        Annotation result = null;
        
        Criteria criteria = session.createCriteria(Annotation.class)
		.add( Restrictions.eq("fromUser", fromUserInfo))
		.add( Restrictions.eq("toUser", toUserInfo))
		.add( Restrictions.eq("type", type));
        
        if(stepWork != null) {
        	criteria.add( Restrictions.eq("stepWork", stepWork));
        }
        
        result = (Annotation) criteria.uniqueResult();
        
    	/*
    	result = 
    			(Annotation) session.createCriteria(Annotation.class)
    			.add( Restrictions.eq("fromUser", fromUserInfo))
    			.add( Restrictions.eq("toUser", toUserInfo))
    			.add( Restrictions.eq("stepWork", stepWork))
    			.add( Restrictions.eq("type", type))
    			.uniqueResult();
    	session.getTransaction().commit();  
        */
        
        return result;
	}
	
	/**
	 * Get all the annotations that are from any of the users in the fromWorkgroups list
	 * and to the specific step work
	 * @param fromWorkgroups a list of UserInfo objects
	 * @param stepWork a StepWork object
	 * @param clazz
	 * @return a list of annotations that are from anyone in the fromWorkgroups list
	 * to the specific step work
	 */
	@SuppressWarnings("unchecked")
	public static List<Annotation> getByFromWorkgroupsAndStepWork(List<UserInfo> fromWorkgroups, StepWork stepWork, String type) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        
        List<Annotation> results = null;
        		
        if(type != null) {
        	results = 
                	(List<Annotation>) session.createCriteria(Annotation.class)
                		.add( Restrictions.in("fromUser", fromWorkgroups))
                		.add( Restrictions.eq("stepWork", stepWork))
                		.add( Restrictions.eq("type", type))
                		.list();
                session.getTransaction().commit();
        } else {
        	results = 
                	(List<Annotation>) session.createCriteria(Annotation.class)
                		.add( Restrictions.in("fromUser", fromWorkgroups))
                		.add( Restrictions.eq("stepWork", stepWork))
                		.list();
                session.getTransaction().commit();
        }

        return results;
	}
	
	/**
	 * Get all the annotations for the given stepwork
	 * @param stepWork
	 * @param clazz
	 * @return a list of annotations that are for a given stepwork
	 */
	@SuppressWarnings("unchecked")
	public static List<Annotation> getByStepWork(StepWork stepWork, Class<?> clazz) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();

        List<Annotation> results = 
        	(List<Annotation>) session.createCriteria(clazz)
        		.add( Restrictions.eq("stepWork", stepWork))
        		.list();
        session.getTransaction().commit();
        return results;
	}
	
	/**
	 * Get all the annotations for the given stepwork
	 * @param stepWork
	 * @param clazz
	 * @return a list of annotations that are for a given stepwork
	 */
	@SuppressWarnings("unchecked")
	public static List<Annotation> getByFromUserToUserType(List<UserInfo> fromUsers, UserInfo toUser, String annotationType) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();

        List<Annotation> results = 
        	(List<Annotation>) session.createCriteria(Annotation.class)
        		.add( Restrictions.in("fromUser", fromUsers))
        		.add( Restrictions.eq("toUser", toUser))
        		.add( Restrictions.eq("type", annotationType))
        		.list();
        session.getTransaction().commit();
        return results;
	}
	
	/**
	 * Get all the annotations for the given stepwork
	 * @param stepWork
	 * @param clazz
	 * @return a list of annotations that are for a given stepwork
	 */
	@SuppressWarnings("unchecked")
	public static List<Annotation> getByToUserType(UserInfo toUser, String annotationType) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();

        List<Annotation> results = 
        	(List<Annotation>) session.createCriteria(Annotation.class)
        		.add( Restrictions.eq("toUser", toUser))
        		.add( Restrictions.eq("type", annotationType))
        		.list();
        session.getTransaction().commit();
        return results;
	}
	
	/**
	 * Get all the annotations for the given stepwork
	 * @param stepWork
	 * @param clazz
	 * @return a list of annotations that are for a given stepwork
	 */
	@SuppressWarnings("unchecked")
	public static Annotation getByStepWorkAndAnnotationType(StepWork stepWork, String annotationType) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();

        Annotation result = 
        	(Annotation) session.createCriteria(Annotation.class)
        		.add( Restrictions.eq("stepWork", stepWork))
        		.add( Restrictions.eq("type", annotationType))
        		.uniqueResult();
        session.getTransaction().commit();
        return result;
	}
	
	
	/**
	 * Get the latest annotation that is associated with any of the StepWork objects
	 * and has a fromWorkgroup that is in the workgroupIds list 
	 * @param stepWorks the list of StepWork objects whose annotations we want to search
	 * @param workgroupIds the list of workgroup ids that we will accept fromWorkgroup
	 * to be in the annotation
	 * @param type the annotation type. must not be null.
	 * @return the latest annotation associated with any of the StepWork objects and has
	 * a fromWorkgroup that is in the workgroupIds list
	 */
	@SuppressWarnings("unchecked")
	public static Annotation getLatestAnnotationByStepWork(List<StepWork> stepWorks, List<String> workgroupIds, String type) {
		//if either lists are empty we will return null
		if(stepWorks.size() == 0 || workgroupIds.size() == 0) {
			return null;
		}
		
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();

        /*
         * perform the query to obtain the annotations associated with the workgroup ids,
         * order the results from newest to oldest
         */
        List<Annotation> results = 
        	(List<Annotation>) session.createCriteria(Annotation.class)
        		.add(Restrictions.in("stepWork", stepWorks)).addOrder(Order.desc("postTime"))
        		.add(Restrictions.eq("type", type))
        		.list();
        session.getTransaction().commit();

        Annotation annotation = null;

        //loop through all the annotations we found
        Iterator<Annotation> resultsIter = results.iterator();
        while(resultsIter.hasNext()) {
        	//get an annotation
        	Annotation tempAnnotation = resultsIter.next();
        	
        	//get the JSON data from the annotaiton
        	String annotationData = tempAnnotation.getData();
        	try {
        		//get the fromWorkgroup from the annotation JSON data
				JSONObject annotationJSONObj = new JSONObject(annotationData);
				String fromWorkgroup = annotationJSONObj.getString("fromWorkgroup");
				
				if(fromWorkgroup != null && workgroupIds.contains(fromWorkgroup)) {
					/*
					 * the fromWorkgroup matches one of the workgroups in the workgroupIds list
					 * so we are done searching
					 */
					annotation = tempAnnotation;
	        		break;
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
        }
        
        return annotation;
	}
	
	/**
	 * Get the latest annotation that is associated with any of the StepWork objects
	 * @param stepWorks the list of StepWork objects whose annotations we want to search
	 * to be in the annotation
	 * @param type the annotation type. must not be null.
	 * @return the latest annotation associated with any of the StepWork objects
	 */
	@SuppressWarnings("unchecked")
	public static Annotation getLatestAnnotationByStepWork(List<StepWork> stepWorks, String type) {
		if(stepWorks.size() == 0) {
			return null;
		}
		
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();

        /*
         * perform the query to obtain the annotations associated with the workgroup ids,
         * order the results from newest to oldest
         */
        List<Annotation> results = 
        	(List<Annotation>) session.createCriteria(Annotation.class)
        		.add(Restrictions.in("stepWork", stepWorks)).addOrder(Order.desc("postTime"))
        		.add(Restrictions.eq("type", type))
        		.list();
        session.getTransaction().commit();

        Annotation annotation = null;
        
        if(results.size() > 0) {
        	//get the newest annotation
        	annotation = results.get(0);
        }
        
        return annotation;
	}
	
	/**
	 * Get the latest cRater score annotation that is associated with any of the StepWork objects
	 * @param stepWorks the list of StepWork objects whose annotations we want to search
	 * to be in the annotation
	 * @return the latest cRater score annotation associated with any of the StepWork objects and has
	 * a fromWorkgroup that is in the workgroupIds list
	 */
	public static Annotation getLatestCRaterScoreByStepWork(List<StepWork> stepWorks) {
		return (Annotation) getLatestAnnotationByStepWork(stepWorks, "crater");
	}
	
	/**
	 * Get the latest score annotation that is associated with any of the StepWork objects
	 * and has a fromWorkgroup that is in the workgroupIds list 
	 * @param stepWorks the list of StepWork objects whose annotations we want to search
	 * @param workgroupIds the list of workgroup ids that we will accept fromWorkgroup
	 * to be in the annotation
	 * @return the latest score annotation associated with any of the StepWork objects and has
	 * a fromWorkgroup that is in the workgroupIds list
	 */
	public static Annotation getLatestAnnotationScoreByStepWork(List<StepWork> stepWorks, List<String> workgroupIds) {
		return (Annotation) getLatestAnnotationByStepWork(stepWorks, workgroupIds, "score");
	}
	
	/**
	 * Get the latest comment annotation that is associated with any of the StepWork objects
	 * and has a fromWorkgroup that is in the workgroupIds list 
	 * @param stepWorks the list of StepWork objects whose annotations we want to search
	 * @param workgroupIds the list of workgroup ids that we will accept fromWorkgroup
	 * to be in the annotation
	 * @return the latest comment annotation associated with any of the StepWork objects and has
	 * a fromWorkgroup that is in the workgroupIds list
	 */
	public static Annotation getLatestAnnotationCommentByStepWork(List<StepWork> stepWorks, List<String> workgroupIds) {
		return (Annotation) getLatestAnnotationByStepWork(stepWorks, workgroupIds, "comment");
	}
	
	/**
	 * Returns a list of Annotations based on the request parameters
	 * @param map
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static List<Annotation> getByParamMap(Map<String, String[]> map) {
		//obtain the parameters
    	String runId = null;
    	String nodeId = null;
    	String type = null;
    	
    	if(map.containsKey("runId")) {
    		//get the run id
    		runId = map.get("runId")[0];
    	}
    	
    	if(map.containsKey("nodeId")) {
    		//get the node id
    		nodeId = map.get("nodeId")[0];
    	}
    	
    	if(map.containsKey("type")) {
    		//get the annotaiton type
    		type = map.get("type")[0];
    	}
    	
    	List<Annotation> result = new ArrayList<Annotation>();
    	
    	if(runId != null && nodeId != null) {
    		//get all the annotations for a run id and node id
        	Node node = Node.getByNodeIdAndRunId(nodeId, runId, true);
        	List<StepWork> stepWorkList = StepWork.getByNodeId(node.getId());
        	result = getByStepWorkList(stepWorkList);
    	} else if(runId != null && type != null) {
    		//get all the annotations for a run id and annotation type
    		result = (List<Annotation>) getByRunIdAndType(Long.parseLong(runId), type, Annotation.class);
    	} else if(runId != null) {
    		//get all the annotations for a run id
    		result = (List<Annotation>) getByRunId(Long.parseLong(runId), Annotation.class);
    	}
		return result;
	}

	
	/**
	 * Returns a list of Annotation based on the request parameters
	 * @param map
	 * @return
	 */
	@SuppressWarnings("unchecked")	
	public static Annotation getCRaterAnnotationByStepWorkId(Long stepWorkId) {
		// TODO Auto-generated method stub
		StepWork stepWork = StepWork.getByStepWorkId(stepWorkId);
		return getByStepWorkAndAnnotationType(stepWork,"cRater");
	}
	
	/**
	 * Given a list of StepWork, returns all annotation flags that were made on
	 * them. If the stepWorkList is empty, return an empty AnnotationList.
	 * @param stepWorkList
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static List<Annotation> getByStepWorkList(List<StepWork> stepWorkList) {
		List<Annotation> result = new ArrayList<Annotation>();
		if (!stepWorkList.isEmpty()) {
			Session session = HibernateUtil.getSessionFactory().getCurrentSession();
			session.beginTransaction();

			result = 
				session.createCriteria(Annotation.class).add( Restrictions.in("stepWork", stepWorkList)).list();
			session.getTransaction().commit();
		}
		return result;
	}

	public JSONObject getAnnotationForNodeStateId(Long nodeStateId) {
		try {
			JSONObject dataJSON = new JSONObject(this.data);
			if (dataJSON != null) {
				JSONArray valueArray = dataJSON.getJSONArray("value");
				if (valueArray != null) {
					for (int i=0; i<valueArray.length(); i++) {
						JSONObject nodeStateCRaterAnnotation = valueArray.getJSONObject(i);
						long nodeStateIdFromAnnotation = nodeStateCRaterAnnotation.getLong("nodeStateId");
						if (nodeStateId != null && nodeStateId.equals(nodeStateIdFromAnnotation)) {
							return nodeStateCRaterAnnotation;
						}
						
					}
				}
			}
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	public void appendNodeStateAnnotation(JSONObject nodeStateAnnotation) {
		try {
			JSONObject dataJSON = new JSONObject(this.data);
			if (dataJSON != null) {
				JSONArray valueArray = dataJSON.getJSONArray("value");
				if (valueArray != null) {
					valueArray.put(nodeStateAnnotation);
					this.data = dataJSON.toString();
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}
	
	public static JSONObject createCRaterNodeStateAnnotation(Long nodeStateId, int score, String concepts, JSONObject studentResponse, String cRaterResponse) {
		JSONObject cRaterNodeStateAnnotation = new JSONObject();
		
		try {
			cRaterNodeStateAnnotation.put("nodeStateId", nodeStateId);
			cRaterNodeStateAnnotation.put("score", score);
			cRaterNodeStateAnnotation.put("concepts", concepts);
			cRaterNodeStateAnnotation.put("studentResponse", studentResponse);
			cRaterNodeStateAnnotation.put("cRaterResponse", cRaterResponse);
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		return cRaterNodeStateAnnotation;
	}
}
