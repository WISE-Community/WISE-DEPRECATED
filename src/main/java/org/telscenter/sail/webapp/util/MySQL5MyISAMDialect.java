package org.telscenter.sail.webapp.util;

import org.hibernate.dialect.MySQLMyISAMDialect;

/**
 * Overrides getTableTypeString() method of MySQL5Dialect
 * and returns engine=MyISAM instead of type=MyISAM when "create table..." queries
 * are created by hibernate.
 * 
 * Solves this problem: http://code.google.com/p/wise4/issues/detail?id=192
 * 
 * @author hirokiterashima
 */
public class MySQL5MyISAMDialect extends MySQLMyISAMDialect {


	@Override
	public String getTableTypeString() {
	    return " ENGINE=MyISAM DEFAULT CHARSET=utf8";
	}
	
	@Override
	public boolean dropConstraints() {
	    return false;
	}	
}
