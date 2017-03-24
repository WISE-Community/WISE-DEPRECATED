/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents).
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
package org.wise.portal.presentation.web.controllers.teacher;

import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.authentication.impl.TeacherUserDetails;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.mail.IMailFacade;
import org.wise.portal.service.portal.PortalService;

import javax.mail.MessagingException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Controller for Translating WISE
 * @author Hiroki Terashima
 */
@Controller
public class TranslateWISEController {

    @Autowired
    private PortalService portalService;

    @Autowired
    private Properties wiseProperties;

    @Autowired
    private IMailFacade mailService = null;

    private static final Map<String, String> projectToFileDirMap;

    static
    {
        projectToFileDirMap = new HashMap<String, String>();
        projectToFileDirMap.put("assessmentlist", "vle/node/assessmentlist/i18n/");
        projectToFileDirMap.put("audioOscillator5", "wise5/components/audioOscillator/i18n/");
        projectToFileDirMap.put("authoringTool5", "wise5/authoringTool/i18n/");
        projectToFileDirMap.put("brainstorm", "vle/node/brainstorm/i18n/");
        projectToFileDirMap.put("branching", "vle/node/branching/i18n/");
        projectToFileDirMap.put("classroomMonitor5", "wise5/classroomMonitor/i18n/");
        projectToFileDirMap.put("common5", "wise5/i18n/");
        projectToFileDirMap.put("conceptMap5", "wise5/components/conceptMap/i18n/");
        projectToFileDirMap.put("discussion5", "wise5/components/discussion/i18n/");
        projectToFileDirMap.put("draw", "vle/node/draw/i18n/");
        projectToFileDirMap.put("draw5", "wise5/components/draw/i18n/");
        projectToFileDirMap.put("embedded5", "wise5/components/embedded/i18n/");
        projectToFileDirMap.put("explanationbuilder", "vle/node/explanationbuilder/i18n/");
        projectToFileDirMap.put("fillin", "vle/node/fillin/i18n/");
        projectToFileDirMap.put("flash", "vle/node/flash/i18n/");
        projectToFileDirMap.put("grapher", "vle/node/grapher/i18n/");
        projectToFileDirMap.put("graph5", "wise5/components/graph/i18n/");
        projectToFileDirMap.put("label5", "wise5/components/label/i18n/");
        projectToFileDirMap.put("matchsequence", "vle/node/matchsequence/i18n/");
        projectToFileDirMap.put("match5", "wise5/components/match/i18n/");
        projectToFileDirMap.put("mw", "vle/node/mw/i18n/");
        projectToFileDirMap.put("multiplechoice", "vle/node/multiplechoice/i18n/");
        projectToFileDirMap.put("multipleChoice5", "wise5/components/multipleChoice/i18n/");
        projectToFileDirMap.put("netlogo", "vle/node/netlogo/i18n/");
        projectToFileDirMap.put("openresponse", "vle/node/openresponse/i18n/");
        projectToFileDirMap.put("openResponse5", "wise5/components/openResponse/i18n/");
        projectToFileDirMap.put("sensor", "vle/node/sensor/i18n/");
        projectToFileDirMap.put("table", "vle/node/table/i18n/");
        projectToFileDirMap.put("table5", "wise5/components/table/i18n/");
        projectToFileDirMap.put("themewise", "vle/themes/wise/i18n/");
        projectToFileDirMap.put("themestarmap", "vle/themes/starmap/i18n/");
        projectToFileDirMap.put("vle", "vle/view/i18n/");
        projectToFileDirMap.put("vle5", "wise5/vle/i18n/");
    }

    /**
     * Handles GET request for main index page
     * @param request
     * @return
     * @throws Exception
     */
    @RequestMapping(value = "/translate", method = RequestMethod.GET)
    protected ModelAndView getIndexPage(HttpServletRequest request) throws Exception {
        ModelAndView modelAndView = new ModelAndView("translate/index");
        String supportedLocales = wiseProperties.getProperty("supportedLocales", "en");
        modelAndView.addObject("supportedLocales", supportedLocales);
        return modelAndView;
    }

    /**
     * Retrieves and prints translation file contents in response so it can be downloaded
     * @param response Response
     * @param projectType type of project. e.g. "vle", "openResponse", "vle5"
     * @param locale requested locale. e.g. "en", "ja", etc
     * @throws Exception
     */
    @RequestMapping(value = "/translate/download/{projectType}/{locale}", method = RequestMethod.GET)
    protected void getTranslationFileDownload(
            HttpServletResponse response,
            @PathVariable String projectType,
            @PathVariable String locale) throws Exception {

        File translationFile = getTranslationFile(projectType, locale);

        response.setContentType("application/octet-stream");
        response.addHeader("Content-Disposition", "attachment;filename=\"" + projectType + "_" + translationFile.getName() + "\"");
        FileUtils.copyFile(translationFile, response.getOutputStream());
    }

    /**
     * Retrieves and prints translation file contents in response
     * @param response Response
     * @param projectType type of project. e.g. "vle", "openResponse", "vle5"
     * @param locale requested locale. e.g. "en", "ja", etc
     * @throws Exception
     */
    @RequestMapping(value = "/translate/{projectType}/{locale}", method = RequestMethod.GET)
    protected void getTranslationFile(
            HttpServletResponse response,
            @PathVariable String projectType,
            @PathVariable String locale) throws Exception {

        File translationFile = getTranslationFile(projectType, locale);
        String translationFileContents = "";
        if (translationFile.exists()) {
            translationFileContents = FileUtils.readFileToString(translationFile, "UTF-8");
        }

        response.getWriter().write(translationFileContents);
    }

    protected File getTranslationFile(String projectType, String locale) throws Exception {

        if ("portal".equals(projectType)) {
            // portal properties is in src/main/resource and is a resource, so we must load it differently.
            String propertiesFilePath = "";
            if ("en".equals(locale)) {
                // in properties file, only "en" doesn't have _en.json at the end. All other locales have i18n_ja.properties, i18n_de.properties, etc.
                propertiesFilePath = TranslateWISEController.class.getResource("/i18n/i18n.properties").getFile();
            } else {
                propertiesFilePath = TranslateWISEController.class.getResource("/i18n/i18n_" + locale + ".properties").getFile();
            }
            System.out.println(propertiesFilePath);
            File propertiesFile = new File(propertiesFilePath);
            return propertiesFile;
        } else {
            // lookup the fileDirMapping
            String projectFileDir = projectToFileDirMap.get(projectType);

            String projectFilePath = projectFileDir + "i18n_" + locale + ".json";
            // prepend wiseBaseDir
            String wiseBaseDir = wiseProperties.getProperty("wiseBaseDir", "/");
            if (!wiseBaseDir.endsWith("/")) {
                // make sure wiseBaseDir ends with "/" or the path will be incorrect.
                wiseBaseDir += "/";
            }
            projectFilePath = wiseBaseDir + projectFilePath;

            System.out.println(projectFilePath);
            File projectFile = new File(projectFilePath);
            return projectFile;
        }
    }

    /**
     * Saves the POSTed translation file contents, and emails admin
     * @param projectType type of project. e.g. "vle", "openResponse", "vle5"
     * @param locale requested locale. e.g. "en", "ja", etc
     * @throws Exception
     */
    @RequestMapping(value = "/translate/save/{projectType}/{locale}", method = RequestMethod.POST)
    protected void saveTranslationFile(
            @PathVariable String projectType,
            @PathVariable String locale,
            @RequestParam(value = "translationString", required = true) String translationString
            ) throws Exception {

        File translationFile = getTranslationFile(projectType, locale);
        if (!translationFile.exists()) {
            translationFile.createNewFile();
        }
        FileUtils.writeStringToFile(translationFile, translationString);

        User user = ControllerUtil.getSignedInUser();
        boolean isComplete = false;
        TranslationNotifyAdminEmailService emailService =
                new TranslationNotifyAdminEmailService(user, isComplete, projectType, locale, translationString);
        Thread thread = new Thread(emailService);
        thread.start();
    }

    /**
     * Saves the POSTed translation file contents
     * @param projectType type of project. e.g. "vle", "openResponse", "vle5"
     * @param locale requested locale. e.g. "en", "ja", etc
     * @throws Exception
     */
    @RequestMapping(value = "/translate/complete/{projectType}/{locale}", method = RequestMethod.POST)
    protected void translationComplete(
            @PathVariable String projectType,
            @PathVariable String locale,
            @RequestParam(value = "translationString", required = true) String translationString
    ) throws Exception {

        File translationFile = getTranslationFile(projectType, locale);
        if (!translationFile.exists()) {
            translationFile.createNewFile();
        }
        FileUtils.writeStringToFile(translationFile, translationString);

        User user = ControllerUtil.getSignedInUser();
        boolean isComplete = true;

        TranslationNotifyAdminEmailService emailService =
                new TranslationNotifyAdminEmailService(user, isComplete, projectType, locale, translationString);
        Thread thread = new Thread(emailService);
        thread.start();
    }

    /**
     * Runs on a separate thread to notify admin about completed translation.
     * Also sends a copy of the email to the translator.
     */
    class TranslationNotifyAdminEmailService implements Runnable {

        private User user;
        boolean isComplete;
        private String projectType;
        private String locale;
        private String translationString;

        public TranslationNotifyAdminEmailService(
                User user, boolean isComplete, String projectType, String locale, String translationString) {
            this.user = user;
            this.isComplete = isComplete;
            this.projectType = projectType;
            this.locale = locale;
            this.translationString = translationString;
        }

        public void run() {
            try {
                String sendEmailEnabledStr = wiseProperties.getProperty("send_email_enabled");
                Boolean sendEmailEnabled = Boolean.valueOf(sendEmailEnabledStr);
                if (!sendEmailEnabled) {
                    return;
                }

                String teacherName = null;
                String teacherEmail = null;

                TeacherUserDetails teacherUserDetails =
                        (TeacherUserDetails) user.getUserDetails();

                teacherName = teacherUserDetails.getFirstname() + " " +
                        teacherUserDetails.getLastname();
                teacherEmail = teacherUserDetails.getEmailAddress();

                String message = this.translationString;

                String fromEmail = wiseProperties.getProperty("portalemailaddress");

                String adminSubject = "Translation saved. Project: " + projectType + ", locale: " + locale + ", teacher: " + teacherName;
                if (isComplete) {
                    adminSubject = "[Completed] " + adminSubject;
                }
                String teacherSubject = "[Keep for backup] Translation saved. Project: " + projectType + ", locale: " + locale;

                String[] recipients = wiseProperties.getProperty("uber_admin").split(",");

                //sends the email to the admin
                mailService.postMail(recipients, adminSubject, message, fromEmail);

                //also send email to teacher
                String[] teacherRecipient = new String[]{teacherEmail};

                //sends the email to the teacher
                if (!isComplete) {
                    mailService.postMail(teacherRecipient, teacherSubject, message, fromEmail);
                }
            } catch (MessagingException e) {
                // what if there was an error sending email?
                // should uber_admin be notified?
                e.printStackTrace();
            }
        }
    }
}