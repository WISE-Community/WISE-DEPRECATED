/**
 * Copyright (c) 2007-2015 Regents of the University of California (Regents).
 * Created by WISE, Graduate School of Education, University of California, Berkeley.
 * 
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 * 
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 * 
 * REGENTS SPECIFICALLY DISCLAIMS ANY WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE SOFTWARE AND ACCOMPANYING DOCUMENTATION, IF ANY, PROVIDED
 * HEREUNDER IS PROVIDED "AS IS". REGENTS HAS NO OBLIGATION TO PROVIDE
 * MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS, OR MODIFICATIONS.
 * 
 * IN NO EVENT SHALL REGENTS BE LIABLE TO ANY PARTY FOR DIRECT, INDIRECT,
 * SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS,
 * ARISING OUT OF THE USE OF THIS SOFTWARE AND ITS DOCUMENTATION, EVEN IF
 * REGENTS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
package org.wise.portal.presentation.web;

import java.io.Serializable;

/**
 * The class encapsulates all of the data necessary for students
 * in a workgroup to sign in before starting a project
 * 
 * @author Hiroki Terashima
 */
public class TeamSignInForm implements Serializable {

	private static final long serialVersionUID = 1L;
	
	private Long runId;
	
	private int maxWorkgroupSize;
	
	private String username1="", username2="", username3="", username4="", username5="", username6="", username7="", username8="", username9="", username10="",
						      password2, password3, password4, password5, password6, password7, password8, password9, password10;

    private boolean isExistingMember1 = false;
    private boolean isExistingMember2 = false;
    private boolean isExistingMember3 = false;
    private boolean isExistingMember4 = false;
    private boolean isExistingMember5 = false;
    private boolean isExistingMember6 = false;
    private boolean isExistingMember7 = false;
    private boolean isExistingMember8 = false;
    private boolean isExistingMember9 = false;
    private boolean isExistingMember10 = false;
    
    private boolean isAbsent1 = false;
    private boolean isAbsent2 = false;
    private boolean isAbsent3 = false;
    private boolean isAbsent4 = false;
    private boolean isAbsent5 = false;
    private boolean isAbsent6 = false;
    private boolean isAbsent7 = false;
    private boolean isAbsent8 = false;
    private boolean isAbsent9 = false;
    private boolean isAbsent10 = false;

    /**
	 * @return the runId
	 */
	public Long getRunId() {
		return runId;
	}

	/**
	 * @param runId the runId to set
	 */
	public void setRunId(Long runId) {
		this.runId = runId;
	}

	/**
	 * @return the maxWorkgroupSize
	 */
	public int getMaxWorkgroupSize() {
		return maxWorkgroupSize;
	}

	/**
	 * @param maxWorkgroupSize the maxWorkgroupSize to set
	 */
	public void setMaxWorkgroupSize(int maxWorkgroupSize) {
		this.maxWorkgroupSize = maxWorkgroupSize;
	}

	/**
	 * @return the password2
	 */
	public String getPassword2() {
		return password2;
	}

	/**
	 * @param password2 the password2 to set
	 */
	public void setPassword2(String password2) {
		this.password2 = password2;
	}

	/**
	 * @return the password3
	 */
	public String getPassword3() {
		return password3;
	}

	/**
	 * @param password3 the password3 to set
	 */
	public void setPassword3(String password3) {
		this.password3 = password3;
	}

	/**
	 * @return the password4
	 */
	public String getPassword4() {
		return password4;
	}

	/**
	 * @param password4 the password4 to set
	 */
	public void setPassword4(String password4) {
		this.password4 = password4;
	}

	/**
	 * @return the password5
	 */
	public String getPassword5() {
		return password5;
	}

	/**
	 * @param password5 the password5 to set
	 */
	public void setPassword5(String password5) {
		this.password5 = password5;
	}

	/**
	 * @return the password6
	 */
	public String getPassword6() {
		return password6;
	}

	/**
	 * @param password6 the password6 to set
	 */
	public void setPassword6(String password6) {
		this.password6 = password6;
	}

	/**
	 * @return the password7
	 */
	public String getPassword7() {
		return password7;
	}

	/**
	 * @param password7 the password7 to set
	 */
	public void setPassword7(String password7) {
		this.password7 = password7;
	}

	/**
	 * @return the password8
	 */
	public String getPassword8() {
		return password8;
	}

	/**
	 * @param password8 the password8 to set
	 */
	public void setPassword8(String password8) {
		this.password8 = password8;
	}

	/**
	 * @return the password9
	 */
	public String getPassword9() {
		return password9;
	}

	/**
	 * @param password9 the password9 to set
	 */
	public void setPassword9(String password9) {
		this.password9 = password9;
	}

	/**
	 * @return the password10
	 */
	public String getPassword10() {
		return password10;
	}

	/**
	 * @param password10 the password10 to set
	 */
	public void setPassword10(String password10) {
		this.password10 = password10;
	}

	/**
	 * @return the username1
	 */
	public String getUsername1() {
		return username1;
	}

	/**
	 * @param username1 the username1 to set
	 */
	public void setUsername1(String username1) {
		this.username1 = username1;
	}

	/**
	 * @return the username2
	 */
	public String getUsername2() {
		return username2;
	}

	/**
	 * @param username2 the username2 to set
	 */
	public void setUsername2(String username2) {
		this.username2 = username2;
	}

	/**
	 * @return the username3
	 */
	public String getUsername3() {
		return username3;
	}

	/**
	 * @param username3 the username3 to set
	 */
	public void setUsername3(String username3) {
		this.username3 = username3;
	}

	/**
	 * @return the username4
	 */
	public String getUsername4() {
		return username4;
	}

	/**
	 * @param username4 the username4 to set
	 */
	public void setUsername4(String username4) {
		this.username4 = username4;
	}

	/**
	 * @return the username5
	 */
	public String getUsername5() {
		return username5;
	}

	/**
	 * @param username5 the username5 to set
	 */
	public void setUsername5(String username5) {
		this.username5 = username5;
	}

	/**
	 * @return the username6
	 */
	public String getUsername6() {
		return username6;
	}

	/**
	 * @param username6 the username6 to set
	 */
	public void setUsername6(String username6) {
		this.username6 = username6;
	}

	/**
	 * @return the username7
	 */
	public String getUsername7() {
		return username7;
	}

	/**
	 * @param username7 the username7 to set
	 */
	public void setUsername7(String username7) {
		this.username7 = username7;
	}

	/**
	 * @return the username8
	 */
	public String getUsername8() {
		return username8;
	}

	/**
	 * @param username8 the username8 to set
	 */
	public void setUsername8(String username8) {
		this.username8 = username8;
	}

	/**
	 * @return the username9
	 */
	public String getUsername9() {
		return username9;
	}

	/**
	 * @param username9 the username9 to set
	 */
	public void setUsername9(String username9) {
		this.username9 = username9;
	}

	/**
	 * @return the username10
	 */
	public String getUsername10() {
		return username10;
	}

	/**
	 * @param username10 the username10 to set
	 */
	public void setUsername10(String username10) {
		this.username10 = username10;
	}
	

    public boolean isExistingMember1() {
        return isExistingMember1;
    }

    public void setExistingMember1(boolean isExistingMember1) {
        this.isExistingMember1 = isExistingMember1;
    }

    public boolean isExistingMember2() {
        return isExistingMember2;
    }

    public void setExistingMember2(boolean isExistingMember2) {
        this.isExistingMember2 = isExistingMember2;
    }

    public boolean isExistingMember3() {
        return isExistingMember3;
    }

    public void setExistingMember3(boolean isExistingMember3) {
        this.isExistingMember3 = isExistingMember3;
    }

    public boolean isExistingMember4() {
        return isExistingMember4;
    }

    public void setExistingMember4(boolean isExistingMember4) {
        this.isExistingMember4 = isExistingMember4;
    }

    public boolean isExistingMember5() {
        return isExistingMember5;
    }

    public void setExistingMember5(boolean isExistingMember5) {
        this.isExistingMember5 = isExistingMember5;
    }

    public boolean isExistingMember6() {
        return isExistingMember6;
    }

    public void setExistingMember6(boolean isExistingMember6) {
        this.isExistingMember6 = isExistingMember6;
    }

    public boolean isExistingMember7() {
        return isExistingMember7;
    }

    public void setExistingMember7(boolean isExistingMember7) {
        this.isExistingMember7 = isExistingMember7;
    }

    public boolean isExistingMember8() {
        return isExistingMember8;
    }

    public void setExistingMember8(boolean isExistingMember8) {
        this.isExistingMember8 = isExistingMember8;
    }

    public boolean isExistingMember9() {
        return isExistingMember9;
    }

    public void setExistingMember9(boolean isExistingMember9) {
        this.isExistingMember9 = isExistingMember9;
    }

    public boolean isExistingMember10() {
        return isExistingMember10;
    }

    public void setExistingMember10(boolean isExistingMember10) {
        this.isExistingMember10 = isExistingMember10;
    }
    

    public boolean isAbsent1() {
        return isAbsent1;
    }

    public void setAbsent1(boolean isAbsent1) {
        this.isAbsent1 = isAbsent1;
    }

    public boolean isAbsent2() {
        return isAbsent2;
    }

    public void setAbsent2(boolean isAbsent2) {
        this.isAbsent2 = isAbsent2;
    }

    public boolean isAbsent3() {
        return isAbsent3;
    }

    public void setAbsent3(boolean isAbsent3) {
        this.isAbsent3 = isAbsent3;
    }

    public boolean isAbsent4() {
        return isAbsent4;
    }

    public void setAbsent4(boolean isAbsent4) {
        this.isAbsent4 = isAbsent4;
    }

    public boolean isAbsent5() {
        return isAbsent5;
    }

    public void setAbsent5(boolean isAbsent5) {
        this.isAbsent5 = isAbsent5;
    }

    public boolean isAbsent6() {
        return isAbsent6;
    }

    public void setAbsent6(boolean isAbsent6) {
        this.isAbsent6 = isAbsent6;
    }

    public boolean isAbsent7() {
        return isAbsent7;
    }

    public void setAbsent7(boolean isAbsent7) {
        this.isAbsent7 = isAbsent7;
    }

    public boolean isAbsent8() {
        return isAbsent8;
    }

    public void setAbsent8(boolean isAbsent8) {
        this.isAbsent8 = isAbsent8;
    }

    public boolean isAbsent9() {
        return isAbsent9;
    }

    public void setAbsent9(boolean isAbsent9) {
        this.isAbsent9 = isAbsent9;
    }

    public boolean isAbsent10() {
        return isAbsent10;
    }

    public void setAbsent10(boolean isAbsent10) {
        this.isAbsent10 = isAbsent10;
    }
	
    /**
     * Get the username for a specific username field
     * @param usernameString the username field e.g. "username2"
     * @return the user name that was typed into the field e.g. "Spongebob Squarepants"
     */
	public String getUsernameByString(String usernameString) {
	    String username = null;
	    
	    if (usernameString == null) {
	        
	    } else if (usernameString.equals("username1")) {
            username = this.username1;
        } else if (usernameString.equals("username2")) {
            username = this.username2;
        } else if (usernameString.equals("username3")) {
            username = this.username3;
        } else if (usernameString.equals("username4")) {
            username = this.username4;
        } else if (usernameString.equals("username5")) {
            username = this.username5;
        } else if (usernameString.equals("username6")) {
            username = this.username6;
        } else if (usernameString.equals("username7")) {
            username = this.username7;
        } else if (usernameString.equals("username8")) {
            username = this.username8;
        } else if (usernameString.equals("username9")) {
            username = this.username9;
        } else if (usernameString.equals("username10")) {
            username = this.username10;
        }
	    
	    return username;
	}
	
	/**
	 * Get the password for a specific password field
	 * @param usernameString the password field e.g. "password2"
	 * @return the password that was typed into the field e.g. "frycook123"
	 */
	public String getPasswordByString(String usernameString) {
	    String password = null;
	    
       if (usernameString == null) {
            
        } else if (usernameString.equals("password2")) {
            password = this.password2;
        } else if (usernameString.equals("password3")) {
            password = this.password3;
        } else if (usernameString.equals("password4")) {
            password = this.password4;
        } else if (usernameString.equals("password5")) {
            password = this.password5;
        } else if (usernameString.equals("password6")) {
            password = this.password6;
        } else if (usernameString.equals("password7")) {
            password = this.password7;
        } else if (usernameString.equals("password8")) {
            password = this.password8;
        } else if (usernameString.equals("password9")) {
            password = this.password9;
        } else if (usernameString.equals("password10")) {
            password = this.password10;
        }
	    
	    return password;
	}

	/**
	 * Get the absent value for a specific absent field
	 * @param absentString the name of the absent field e.g. "absent2"
	 * @return the value of the field
	 */
	public boolean getIsAbsentByString(String absentString) {
	       boolean isAbsent = false;
	        
	       if (absentString == null) {
	            
	        } else if (absentString.equals("absent2")) {
	            isAbsent = this.isAbsent2;
	        } else if (absentString.equals("absent3")) {
	            isAbsent = this.isAbsent3;
	        } else if (absentString.equals("absent4")) {
	            isAbsent = this.isAbsent4;
	        } else if (absentString.equals("absent5")) {
	            isAbsent = this.isAbsent5;
	        } else if (absentString.equals("absent6")) {
	            isAbsent = this.isAbsent6;
	        } else if (absentString.equals("absent7")) {
	            isAbsent = this.isAbsent7;
	        } else if (absentString.equals("absent8")) {
	            isAbsent = this.isAbsent8;
	        } else if (absentString.equals("absent9")) {
	            isAbsent = this.isAbsent9;
	        } else if (absentString.equals("absent10")) {
	            isAbsent = this.isAbsent10;
	        }
	        
	        return isAbsent;
	}

}