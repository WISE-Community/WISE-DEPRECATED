package vle.domain.statistics;

import java.sql.Timestamp;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.json.JSONException;
import org.json.JSONObject;

import vle.domain.PersistableDomain;
import vle.hibernate.HibernateUtil;

/**
 * Stores the vle statistics snapshot at a particular point in time
 * @author geoffreykwan
 *
 */
@Entity
@Table(name="vle_statistics")
public class VLEStatistics extends PersistableDomain {

	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	private Long id = null;
	
	@Column(name="timestamp")
	private Timestamp timestamp;
	
	@Column(name="data", length=5000)
	private String data;
	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Timestamp getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Timestamp timestamp) {
		this.timestamp = timestamp;
	}

	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}
	
	/**
	 * Get the JSONObject representation of the data
	 * @return the data converted to a JSONObject
	 */
	public JSONObject getJSONObject() {
		JSONObject jsonObject = new JSONObject();
		
		//get the data
		String data = getData();
		
		if(data != null && !data.equals("")) {
			try {
				//convert the data JSON string into a JSONObject
				jsonObject = new JSONObject(data);
			} catch (JSONException e) {
				e.printStackTrace();
			}
		}
		
		return jsonObject;
	}
	
	/**
	 * Get all the vle statistics rows ordered from oldest to newest
	 * @return a list of all the vle statistics
	 */
	public static List<VLEStatistics> getVLEStatistics() {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        
        //get the vle statistics from oldest to newest
        List<VLEStatistics> result =  session.createCriteria(VLEStatistics.class).addOrder(Order.asc("timestamp")).list();
        
        session.getTransaction().commit();
        return result;
	}

	@Override
	protected Class<?> getObjectClass() {
		return null;
	}
}
