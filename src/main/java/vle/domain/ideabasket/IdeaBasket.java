package vle.domain.ideabasket;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.ProjectionList;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;
import org.json.JSONException;
import org.json.JSONObject;

import vle.domain.PersistableDomain;
import vle.domain.work.StepWork;
import vle.hibernate.HibernateUtil;

@Entity
@Table(name="ideaBasket")
public class IdeaBasket extends PersistableDomain implements Serializable {

	private static final long serialVersionUID = 1L;

	//the unique id of the IdeaBasket
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;

	//the id of the run
	@Column(name="runId")
	private Long runId = null;
	
	//the id of the workgroup
	@Column(name="workgroupId")
	private Long workgroupId = null;
	
	//the id of the project
	@Column(name="projectId")
	private Long projectId = null;
	
	//the JSON string for the idea basket
	@Column(name="data", length=512000)
	private String data = null;
	
	//the time the idea basket was posted
	@Column(name="postTime")
	private Timestamp postTime;
	
	//the period id of the basket
	@Column(name="periodId")
	private Long periodId = null;
	
	//whether this basket is a public basket
	@Column(name="isPublic")
	private Boolean isPublic = false;
	
	//the action that is being performed to create this new basket revision (only used for public idea basket)
	@Column(name="action")
	private String action = "";
	
	//the workgroup id performing the action to create a new basket revision (only used for public idea basket)
	@Column(name="actionPerformer")
	private Long actionPerformer = null;
	
	//the idea id for the action being performed (only used for public idea basket)
	@Column(name="ideaId")
	private Long ideaId = null;
	
	//the workgroup id of the owner of the idea that the action is being performed on (only used for public idea basket)
	@Column(name="ideaWorkgroupId")
	private Long ideaWorkgroupId = null;

	/**
	 * the no args constructor
	 */
	public IdeaBasket() {
		
	}

	/**
	 * Constructor that does not populate the data field
	 * @param runId
	 * @param projectId
	 * @param workgroupId
	 */
	public IdeaBasket(long runId, long periodId, long projectId, long workgroupId) {
		this.runId = runId;
		this.projectId = projectId;
		this.workgroupId = workgroupId;
		Calendar now = Calendar.getInstance();
		this.postTime = new Timestamp(now.getTimeInMillis());
	}
	
	/**
	 * Constructor that populates the values
	 * @param runId the id of the run
	 * @param projectId the id of the project
	 * @param workgroupId the id of the workgroup
	 * @param data the idea basket JSON
	 */
	public IdeaBasket(long runId, long periodId, long projectId, long workgroupId, String data, boolean isPublic) {
		this.runId = runId;
		this.projectId = projectId;
		this.periodId = periodId;
		this.workgroupId = workgroupId;
		Calendar now = Calendar.getInstance();
		this.postTime = new Timestamp(now.getTimeInMillis());
		this.data = data;
		this.isPublic = isPublic;
	}
	
	/**
	 * Constructor that populates the values
	 * @param runId the id of the run
	 * @param projectId the id of the project
	 * @param workgroupId the id of the workgroup
	 * @param data the idea basket JSON
	 */
	public IdeaBasket(long runId, long periodId, long projectId, long workgroupId, String data, boolean isPublic, String action, Long actionPerformer, Long ideaId, Long ideaWorkgroupId) {
		this.runId = runId;
		this.projectId = projectId;
		this.periodId = periodId;
		this.workgroupId = workgroupId;
		Calendar now = Calendar.getInstance();
		this.postTime = new Timestamp(now.getTimeInMillis());
		this.data = data;
		this.isPublic = isPublic;
		this.action = action;
		this.actionPerformer = actionPerformer;
		this.ideaId = ideaId;
		this.ideaWorkgroupId = ideaWorkgroupId;
	}
	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}
	
	public Long getRunId() {
		return runId;
	}

	public void setRunId(Long runId) {
		this.runId = runId;
	}

	public Long getWorkgroupId() {
		return workgroupId;
	}

	public void setWorkgroupId(Long workgroupId) {
		this.workgroupId = workgroupId;
	}

	public Long getProjectId() {
		return projectId;
	}

	public void setProjectId(Long projectId) {
		this.projectId = projectId;
	}

	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}
	
	public Timestamp getPostTime() {
		return postTime;
	}

	public void setPostTime(Timestamp postTime) {
		this.postTime = postTime;
	}
	
	public Long getPeriodId() {
		return periodId;
	}

	public void setPeriodId(Long periodId) {
		this.periodId = periodId;
	}

	public Boolean isPublic() {
		return isPublic;
	}

	public void setPublic(Boolean isPublic) {
		this.isPublic = isPublic;
	}
	
	public String getAction() {
		return action;
	}

	public void setAction(String action) {
		this.action = action;
	}

	public Long getActionPerformer() {
		return actionPerformer;
	}

	public void setActionPerformer(Long actionPerformer) {
		this.actionPerformer = actionPerformer;
	}

	public Long getIdeaId() {
		return ideaId;
	}

	public void setIdeaId(Long ideaId) {
		this.ideaId = ideaId;
	}

	public Long getIdeaWorkgroupId() {
		return ideaWorkgroupId;
	}

	public void setIdeaWorkgroupId(Long ideaWorkgroupId) {
		this.ideaWorkgroupId = ideaWorkgroupId;
	}
	
	@Override
	protected Class<?> getObjectClass() {
		return IdeaBasket.class;
	}

	/**
	 * Get the JSON object representation of the IdeaBasket
	 * @return a JSONObject containing the data from the idea basket
	 */
	public JSONObject toJSONObject() {
		JSONObject jsonObject = null;
		
		String dataString = "";
		
		dataString = getData();
		
		if(dataString == null) {
			/*
			 * the data is null so we will create and return a JSONObject
			 * that has the metadata for the idea basket
			 */
			try {
				jsonObject = new JSONObject();
				jsonObject.put("id", getId());
				jsonObject.put("runId", getRunId());
				jsonObject.put("periodId", getPeriodId());
				jsonObject.put("workgroupId", getWorkgroupId());
				jsonObject.put("projectId", getProjectId());
				jsonObject.put("isPublic", isPublic());
			} catch (JSONException e) {
				e.printStackTrace();
			}
		} else {
			/*
			 * the data is not null so we will create a JSONObject from
			 * the data string and inject metadata values if they are
			 * not already present in the data string
			 */
			try {
				jsonObject = new JSONObject(dataString);
				
				if(!jsonObject.has("id")) {
					jsonObject.put("id", getId());
				}
				
				if(!jsonObject.has("runId")) {
					jsonObject.put("runId", getRunId());
				}
				
				if(!jsonObject.has("periodId")) {
					jsonObject.put("periodId", getPeriodId());
				}
				
				if(!jsonObject.has("workgroupId")) {
					jsonObject.put("workgroupId", getWorkgroupId());
				}

				if(!jsonObject.has("projectId")) {
					jsonObject.put("projectId", getProjectId());
				}
				
				if(!jsonObject.has("isPublic")) {
					jsonObject.put("isPublic", isPublic());
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		return jsonObject;
	}
	
	/**
	 * Get the JSON string representation of the IdeaBasket
	 * @return
	 */
	public String toJSONString() {
		String jsonString = null;
		
		//get the JSONObject representation of the idea basket
		JSONObject jsonObject = toJSONObject();

		try {
			if(jsonObject != null) {
				//get the JSON string representation with indentation
				jsonString = jsonObject.toString(3);
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		return jsonString;
	}
	
	/**
	 * Get the latest IdeaBasket with the given run id and workgroup id
	 * @param runId the id of the run
	 * @param workgroupId the id of the workgroup
	 * @return the IdeaBasket with the matching runId and workgroupId
	 */
	public static IdeaBasket getIdeaBasketByRunIdWorkgroupId(long runId, long workgroupId) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        
        //find all the IdeaBasket objects that match
        List<IdeaBasket> result =  session.createCriteria(IdeaBasket.class).add(
        		Restrictions.eq("runId", runId)).add(
        				Restrictions.eq("workgroupId", workgroupId)).addOrder(Order.desc("postTime")).list();
        session.getTransaction().commit();
        
        IdeaBasket ideaBasket = null;
        if(result.size() > 0) {
        	/*
        	 * get the first IdeaBasket from the result list since 
        	 * that will be the latest revision of that idea basket
        	 */
        	ideaBasket = result.get(0);
        }
        return ideaBasket;
	}
	
	/**
	 * Get all the latest IdeaBaskets with the given run id
	 * 
	 * we will basically be performing this query
	 * select * from vle_database.ideaBasket i where id in(SELECT max(id) FROM vle_database.ideaBasket i where runid=<insert runId> group by workgroupid)
	 * 
	 * @param runId the id of the run
	 * @return all the latest IdeaBaskets for a run id
	 */
	@SuppressWarnings("unchecked")
	public static List<IdeaBasket> getLatestIdeaBasketsForRunId(long runId) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        
        /*
         * create a projection that will give us the latest idea basket id
         * for each workgroup id in the run. the projection will return 
         * an array of array objects that will look like [id, workgroupId].
         * each workgroup id will only appear once.
         */
        ProjectionList projectionList = Projections.projectionList();
        projectionList.add(Projections.max("id"));
        projectionList.add(Projections.groupProperty("workgroupId"));
        
        //this first query will filter on the runId and the projection
        List latestIdeaBasketIdsProjection =  session.createCriteria(IdeaBasket.class).add(
        		Restrictions.eq("runId", runId)).setProjection(projectionList).list();
        
        //the list that will contain all the idea basket ids we want
        List<Long> ideaBasketIds = new ArrayList<Long>();
        
        //loop through all the results from our first query
        for(int x=0; x<latestIdeaBasketIdsProjection.size(); x++) {
        	//get the idea basket id
        	Object[] projection = (Object[]) latestIdeaBasketIdsProjection.get(x);
        	Long ideaBasketId = (Long) projection[0];
        	ideaBasketIds.add(ideaBasketId);
        }
        
        List<IdeaBasket> result = new ArrayList<IdeaBasket>();
        
        if(ideaBasketIds.size() > 0) {
        	//this second query will retrieve all the idea basket ids we retrieved from the first query
        	result = session.createCriteria(IdeaBasket.class).add(StepWork.createIdOrCriterion(ideaBasketIds, 0)).list();        	
        }
        
        session.getTransaction().commit();
        
        return result;
	}
	
	/**
	 * Get all the latest IdeaBaskets with the given run id
	 * 
	 * we will basically be performing this query
	 * select * from vle_database.ideaBasket i where id in(SELECT max(id) FROM vle_database.ideaBasket i where runid=<insert runId> and workgroupid in(<insert workgroup ids>) group by workgroupid)
	 * 
	 * @param runId the id of the run
	 * @param workgroupIds a list of workgroup ids
	 * @return all the latest IdeaBaskets for a run id
	 */
	@SuppressWarnings("unchecked")
	public static List<IdeaBasket> getLatestIdeaBasketsForRunIdWorkgroupIds(long runId, List<Long> workgroupIds) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        
        /*
         * create a projection that will give us the latest idea basket id
         * for each workgroup id in the run. the projection will return 
         * an array of array objects that will look like [id, workgroupId].
         * each workgroup id will only appear once.
         */
        ProjectionList projectionList = Projections.projectionList();
        projectionList.add(Projections.max("id"));
        projectionList.add(Projections.groupProperty("workgroupId"));
        
        //this first query will filter on the runId and workgroupids and the projection
        List latestIdeaBasketIdsProjection =  session.createCriteria(IdeaBasket.class).add(
        		Restrictions.eq("runId", runId)).add(Restrictions.in("workgroupId", workgroupIds)).setProjection(projectionList).list();
        
        //the list that will contain all the idea basket ids we want
        List<Long> ideaBasketIds = new ArrayList<Long>();
        
        //loop through all the results from our first query
        for(int x=0; x<latestIdeaBasketIdsProjection.size(); x++) {
        	//get the idea basket id
        	Object[] projection = (Object[]) latestIdeaBasketIdsProjection.get(x);
        	Long ideaBasketId = (Long) projection[0];
        	ideaBasketIds.add(ideaBasketId);
        }
        
        List<IdeaBasket> result = new ArrayList<IdeaBasket>();
        
        if(ideaBasketIds.size() > 0) {
        	//this second query will retrieve all the idea basket ids we retrieved from the first query
        	result = session.createCriteria(IdeaBasket.class).add(StepWork.createIdOrCriterion(ideaBasketIds, 0)).list();        	
        }
        
        session.getTransaction().commit();
        
        return result;
	}
	
	/**
	 * Get all the idea basket revisions for a run. The results will be
	 * ordered by workgroup id and within the ordered workgroup ids it
	 * will be ordered by post time
	 * @param runId the run id
	 * @return a list of idea baskets ordered by workgroup id and then
	 * by post time
	 */
	public static List<IdeaBasket> getIdeaBasketsForRunId(long runId) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        
        //find all the IdeaBasket objects that match
        List<IdeaBasket> result =  session.createCriteria(IdeaBasket.class).add(
        		Restrictions.eq("runId", runId)).addOrder(Order.asc("workgroupId")).addOrder(Order.asc("periodId")).addOrder(Order.asc("postTime")).list();
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * Get the latest public idea basket for the given run id, period id
	 * @param runId the run id
	 * @param periodId the period id
	 * @return the latest public idea basket for this run id, period id or null if there is none
	 */
	public static IdeaBasket getPublicIdeaBasketForRunIdPeriodId(long runId, long periodId) {
		Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        
        //get the latest idea basket revision that matches
        List<IdeaBasket> result =  session.createCriteria(IdeaBasket.class).add(
        		Restrictions.eq("runId", runId)).add(Restrictions.eq("periodId", periodId)).add(Restrictions.eq("isPublic", true)).addOrder(Order.desc("id")).list();
        session.getTransaction().commit();
        
        IdeaBasket ideaBasket = null;
        if(result.size() > 0) {
        	/*
        	 * get the first IdeaBasket from the result list since 
        	 * that will be the latest revision of that idea basket
        	 */
        	ideaBasket = result.get(0);
        }
        return ideaBasket;
	}
}
