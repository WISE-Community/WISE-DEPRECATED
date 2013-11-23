package org.wise.vle.domain;


/**
 * @author hirokiterashima
 *
 */
public abstract class PersistableDomain {

	protected static String fromQuery = "from PersistableDomain";
	
	protected abstract Class<?> getObjectClass();
	
}
