/**
 * 
 */
package vle.hibernate;

import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.AnnotationConfiguration;

/**
 * Hibernate Utilities
 * @author hirokiterashima
 */
public class HibernateUtil {

    private static final SessionFactory sessionFactory = buildSessionFactory();

    private static SessionFactory buildSessionFactory() {
        try {
            // Create the SessionFactory from hibernate.cfg.xml and from vle.properties
            AnnotationConfiguration cfg = new AnnotationConfiguration().configure();  // reads from hibernate.cfg.xml
            
        	Properties extraProperties = new Properties();
        	extraProperties.load(HibernateUtil.class.getClassLoader().getResourceAsStream("vle.properties"));
            cfg.addProperties(extraProperties);  // add extra property overrides (like url,username,password) in vle.properties
            return cfg.buildSessionFactory();
        }
        catch (Throwable ex) {
            // Make sure you log the exception, as it might be swallowed
            System.err.println("Initial SessionFactory creation failed." + ex);
            throw new ExceptionInInitializerError(ex);
        }
    }

    public static SessionFactory getSessionFactory() {
        return sessionFactory;
    }

    public static Session getSession() {
    	return sessionFactory.openSession();
    }
}
