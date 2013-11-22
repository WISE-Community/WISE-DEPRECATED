/**
 * 
 */
package org.wise.vle.hibernate;

import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;

import net.sf.sail.webapp.service.UserService;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.AnnotationConfiguration;
import org.hibernate.cfg.Configuration;
import org.springframework.beans.BeanUtils;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.orm.hibernate3.LocalSessionFactoryBean;
import org.springframework.web.context.support.WebApplicationContextUtils;
import org.wise.portal.spring.SpringConfiguration;

/**
 * Hibernate Utilities
 * @author hirokiterashima
 */
public class HibernateUtil {

    private static SessionFactory sessionFactory = buildSessionFactory();
    //private static SessionFactory sessionFactory;
    
	private static SessionFactory buildSessionFactory() {
        try {
            // Create the SessionFactory from hibernate.cfg.xml and from wise.properties
            AnnotationConfiguration cfg = new AnnotationConfiguration().configure("configurations/hibernate/hibernate-wise.cfg.xml");  // reads from hibernate.cfg.xml
            
        	Properties extraProperties = new Properties();
        	extraProperties.load(HibernateUtil.class.getClassLoader().getResourceAsStream("wise.properties"));
            cfg.addProperties(extraProperties);  // add extra property overrides (like url,username,password) in wise.properties
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
