/**
 * Copyright (c) 2008-2015 Regents of the University of California (Regents).
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
package org.wise.vle.utils;

import java.io.IOException;

import javax.servlet.Servlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;
import org.wise.portal.presentation.util.http.Connector;

/**
 * The Mode Master is responsible for reading the settings.xml file in the vle folder
 * and determining the startup mode for the servlets. If the mode is portal, notifies
 * all servlets to run in portal mode. Also responds to queries about the current mode.
 *
 * @author Patrick Lawler
 */
public class ModeMaster extends HttpServlet implements Servlet{

  private static final long serialVersionUID = 1L;

  private final static String PORTAL_MODE = "portalMode";

  private boolean portalMode = false;

  private boolean retrievedMode = false;

  /* Constructor */
  public ModeMaster(){
    super();
  }

  /**
   * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException{
    this.doPost(request, response);
  }

  /**
   * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
   */
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException{
    if(!this.retrievedMode){
      this.getModeFromFile(request);
    }

    String mode = request.getParameter(PORTAL_MODE);

    if(mode != null){
      try{
        response.getWriter().write(String.valueOf(this.portalMode));
        response.setStatus(HttpServletResponse.SC_OK);
        return;
      } catch(IOException e){
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        return;
      }
    }

    response.sendError(HttpServletResponse.SC_BAD_REQUEST);
  }

  /**
   * Attempts to retrieve the settings.xml file in th vle directory, find the status of the portal
   * mode and set the mode in all known servlets this would affect.
   *
   * @param request
   */
  private void getModeFromFile(HttpServletRequest request){
    try{
      String settingsUrl = request.getRequestURL().toString().replace("modemaster.html","vle/settings.json");
      String settings = Connector.request(settingsUrl);

      /* if there is no settings file or we failed to retrieve it, then we cannot assume portal mode */
      if(settings == null || settings.equals("")){
        return;
      }

      try {
        JSONObject settingsJSON = new JSONObject(settings);

        if(settingsJSON.has("mode")) {
          JSONObject modeJSON = settingsJSON.getJSONObject("mode");

          if(modeJSON.has("portal")) {
            this.portalMode = modeJSON.getBoolean("portal");

            /* set status of retrieved mode */
            this.retrievedMode = true;
          }
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }

    } catch(IOException e){
      //e.printStackTrace();
    }
  }
}
