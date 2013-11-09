package vle.domain;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;
import vle.hibernate.HibernateUtil;

/**
 * @author hirokiterashima
 *
 */
public abstract class PersistableDomain {

	protected static String fromQuery = "from PersistableDomain";
	
	protected abstract Class<?> getObjectClass();
	
	/**
	 * Saves this environment to the datastore in a transaction
	 */
	public void saveOrUpdate() {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        
        session.saveOrUpdate(this);
        session.getTransaction().commit();
	}

	/**
	 * Deletes this Environments in the datastore.
	 */
	public void delete() {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        session.delete(this);
        session.getTransaction().commit();
	}

	/**
	 * Returns a list of all Environment in the datastore.
	 * @param class1 
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public static List<? extends PersistableDomain> getList(Class<?> clazz) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        List<? extends PersistableDomain> result = session.createCriteria(clazz).list();
        session.getTransaction().commit();
        return result;
	}
	
	/**
	 * Returns an Environment with the specified id or null
	 * if no such Environment exists.
	 * @param id
	 * @param clazz 
	 * @return 
	 * @return
	 */
	public static PersistableDomain getById(Long id, Class<?> clazz) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();
        PersistableDomain result = (PersistableDomain) session.createCriteria(clazz).add( Restrictions.eq("id", id)).uniqueResult();
        
        session.getTransaction().commit();
        return result;
	}
}
