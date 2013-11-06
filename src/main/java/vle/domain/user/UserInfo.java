/**
 * 
 */
package vle.domain.user;

import java.util.Calendar;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Vector;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import org.hibernate.NonUniqueResultException;
import org.hibernate.Session;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;

import vle.domain.PersistableDomain;
import vle.domain.journal.Journal;
import vle.domain.work.StepWork;
import vle.hibernate.HibernateUtil;

/**
 * @author hirokiterashima
 *
 */
@Entity
@Table(name="userinfo")
public class UserInfo extends PersistableDomain {

	protected static String fromQuery = "from UserInfo";

	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;

	@Column(name="workgroupId", unique=true)
	private Long workgroupId = null;
	
	@OneToOne(mappedBy = "userInfo")
	public Journal journal;
	
    public Long getId() {
        return id;
    }

    @SuppressWarnings("unused")
	private void setId(Long id) {
        this.id = id;
    }

	public Long getWorkgroupId() {
		return workgroupId;
	}

	public void setWorkgroupId(Long workgroupId) {
		this.workgroupId = workgroupId;
	}

	/**
	 * @return the journal
	 */
	public Journal getJournal() {
		return journal;
	}

	/**
	 * @param journal the journal to set
	 */
	public void setJournal(Journal journal) {
		this.journal = journal;
	}

	/**
	 * @see vle.domain.PersistableDomain#getObjectClass()
	 */
	@Override
	protected Class<?> getObjectClass() {
		return UserInfo.class;
	}

	/**
	 * Returns an Environment with the specified id or null
	 * if no such Environment exists.
	 * @param id
	 * @param clazz 
	 * @return 
	 * @return
	 */
	public static UserInfo getByWorkgroupId(Long id) {
		try {
			Session session = HibernateUtil.getSessionFactory().getCurrentSession();
			session.beginTransaction();
			UserInfo result = (UserInfo) session.createCriteria(UserInfo.class).add( Restrictions.eq("workgroupId", id)).uniqueResult();
			session.getTransaction().commit();
			return result;
		} catch (NonUniqueResultException e) {
			System.err.println("workgroupId: " + id);
			throw e;
		}
	}
	
	/**
	 * Similar to getByWorkgroupId, but if the user is
	 * not found, create one. This method will always return 
	 * a non-null UserInfo.
	 * @param id
	 * @return
	 */
	public synchronized static UserInfo getOrCreateByWorkgroupId(Long workgroupId) {
		UserInfo userInfo = getByWorkgroupId(workgroupId);
		if (userInfo == null) {
			userInfo = new UserInfo();
			userInfo.setWorkgroupId(workgroupId);
			userInfo.saveOrUpdate();
		}
        return userInfo;
	}
	
	/**
	 * Obtain a list of UserInfo objects from a list of workgroup ids
	 * @param workgroupIds a list of workgroup ids in String format
	 * @return a list of UserInfo objects
	 */
	public static List<UserInfo> getByWorkgroupIds(List<String> workgroupIds) {
		//the list to hold all the UserInfo objects we will retrieve
		List<UserInfo> userInfos = new Vector<UserInfo>();
		
		//an iterator of all the workgroup ids we want
		Iterator<String> workgroupIdsIterator = workgroupIds.iterator();
		
		//loop through all the workgroup ids
		while(workgroupIdsIterator.hasNext()) {
			//get a workgroup id
			String currentWorkgroupId = workgroupIdsIterator.next();
			
			//retrieve the UserInfo object for that workgroup id
			UserInfo currentUserInfo = getOrCreateByWorkgroupId(new Long(currentWorkgroupId));
			
			if(currentUserInfo != null) {
				//add the UserInfo object to our list
				userInfos.add(currentUserInfo);				
			}
		}
		
		return userInfos;
	}
	
	/**
	 * Create a query criterion of 'or' statements recursively
	 * @param workgroupList a list of workgroup ids as strings, the list
	 * must not be empty
	 * @param index the index within the list that we are on, for the first call
	 * it should be 0
	 * @return a Criterion object with 'or' statements combining all the workgroupIds
	 */
	private static Criterion createNodeOrCriterion(List<String> workgroupList, int index) {
		if(index == (workgroupList.size() - 1)) {
			/*
			 * base case if the list has only one element just return a
			 * restriction with the workgroupId
			 */
			return Restrictions.eq("workgroupId", Long.parseLong(workgroupList.get(index)));
		} else {
			/*
			 * "or" together this first element with the recursive call
			 * on the rest of the list
			 */
			return Restrictions.or(Restrictions.eq("workgroupId", Long.parseLong(workgroupList.get(index))), createNodeOrCriterion(workgroupList, index + 1));
		}
	}
	
	
	/**
	 * Out of the list of UserInfo objects that are passed in, find the ones that have
	 * submitted any work today and return them in a list.
	 * 
	 * note: this function is currently inefficient as it queries each UserInfo individually.
	 * This should be changed so that it obtains the latest StepWork for each UserInfo
	 * all at the same time.
	 * 
	 * @param userInfos a list of UserInfo objects that we will filter
	 * @return a list of UserInfo objects that have been filtered and only
	 * contain the UserInfos that have performed any work today
	 */
	public static List<UserInfo> getUserInfosThatHaveWorkedToday(List<UserInfo> userInfos) {
		List<UserInfo> userInfosThatHaveWorkedToday = new Vector<UserInfo>();
		
		//get a calendar object
		Calendar calendar = Calendar.getInstance();
		
		//set the calendar to today without the hours, minutes, seconds
		calendar.set(Calendar.YEAR, Calendar.MONTH, Calendar.DAY_OF_MONTH, 0, 0, 0);
		
		//get the date object
		Date today = calendar.getTime();
		
		//loop through all the UserInfos
        for(UserInfo userInfo : userInfos) {
            Session session = HibernateUtil.getSessionFactory().getCurrentSession();
            session.beginTransaction();
            
            //get all the work for a user
        	List<StepWork> list = session.createCriteria(StepWork.class).add(Restrictions.eq("userInfo", userInfo)).addOrder(Order.desc("postTime")).list();
            StepWork result = null;
            
            //check if there were any results
            if (list.size() > 0) {
            	//get the latest work
            	result = list.get(0);
            	
            	//check if the latest work was done today
            	if(result.getPostTime().after(today)) {
            		//latest work was done today so we will add the user to our array to return it
                	userInfosThatHaveWorkedToday.add(userInfo);
                }
            }
            
            session.getTransaction().commit();
        }
        
        //return the list of UserInfos that have done work today
        return userInfosThatHaveWorkedToday;
	}
	
	
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		if (args[0].equals("store")) {
			UserInfo obj = new UserInfo();
			obj.setWorkgroupId(new Long(5));
			obj.saveOrUpdate();
		}
		else if (args[0].equals("list")) {
			List<UserInfo> objs = (List<UserInfo>) UserInfo.getList(UserInfo.class);
			for (UserInfo obj : objs) {
				System.out.println("UserInfo: " + obj.getId());
			}
		}
	}

}
