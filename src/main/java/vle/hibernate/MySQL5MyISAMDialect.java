package vle.hibernate;

import org.hibernate.dialect.MySQL5Dialect;

/**
 * Overrides getTableTypeString() method of MySQL5Dialect
 * and returns engine=MyISAM instead of type=MyISAM when "create table..." queries
 * are created by hibernate.
 * 
 * Solves this problem: http://code.google.com/p/wise4/issues/detail?id=192
 * 
 * @author hirokiterashima
 */
public class MySQL5MyISAMDialect extends MySQL5Dialect {


	@Override
	public String getTableTypeString() {
	    return " ENGINE=MyISAM DEFAULT CHARSET=utf8";
	}
	
	@Override
	public boolean dropConstraints() {
	    return false;
	}	
}
