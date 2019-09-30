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
package org.wise.portal.presentation.web.controllers.admin;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Calendar;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;
import org.wise.portal.domain.AccountQuestion;
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.impl.StudentUserDetails;
import org.wise.portal.domain.project.impl.Projectcode;
import org.wise.portal.domain.user.BatchCreateUserAccountsUpload;
import org.wise.portal.domain.user.User;
import org.wise.portal.service.student.StudentService;
import org.wise.portal.service.user.UserService;

/**
 * Admin tool for batch creating user accounts. Admin uploads a csv file
 * containing a row for each new user to be added to WISE.
 *
 * Currently only supports student accounts
 *
 * @author Hiroki Terashima
 */
@Controller
@RequestMapping("/admin/account/batchcreateuseraccounts.html")
public class BatchCreateUserAccountsController {

  @Autowired
  private UserService userService;

  @Autowired
  private StudentService studentService;

  @RequestMapping(method = RequestMethod.POST)
  protected ModelAndView onSubmit(
      @ModelAttribute("csvFile") BatchCreateUserAccountsUpload csvUpload,
      BindingResult result) throws Exception {
    ArrayList<String> newUsernames = new ArrayList<String>();
    MultipartFile csvFile = csvUpload.getFile();
    InputStreamReader inputStreamReader = new InputStreamReader(csvFile.getInputStream());
    Gender[] genderArray = {Gender.MALE,Gender.FEMALE,Gender.UNSPECIFIED};
    AccountQuestion[] accountQuestionArray =
        { AccountQuestion.QUESTION_FOUR, AccountQuestion.QUESTION_TWO,
        AccountQuestion.QUESTION_THREE };
    BufferedReader br = null;
    String line = "";
    String cvsSplitBy = ",";

    try {
      br = new BufferedReader(inputStreamReader);
      while ((line = br.readLine()) != null) {
        String[] userInfo = line.split(cvsSplitBy);
        if ("Firstname".equals(userInfo[0]) && "Lastname".equals(userInfo[1])) {
          continue;
        }
        String firstname = userInfo[0];
        String lastname = userInfo[1];
        Gender gender = genderArray[Integer.valueOf(userInfo[2])];
        String password = userInfo[5];
        AccountQuestion accountQuestion = accountQuestionArray[Integer.valueOf(userInfo[6])];
        String accountAnswer = userInfo[7];
        StudentUserDetails studentUserDetails = new StudentUserDetails();
        studentUserDetails.setFirstname(firstname);
        studentUserDetails.setLastname(lastname);
        studentUserDetails.setGender(gender);
        studentUserDetails.setPassword(password);
        studentUserDetails.setAccountQuestion(accountQuestion.toString());
        studentUserDetails.setAccountAnswer(accountAnswer);
        studentUserDetails.setSignupdate(Calendar.getInstance().getTime());
        int birthmonth = Integer.parseInt(userInfo[3]);
        int birthdate = Integer.parseInt(userInfo[4]);
        Calendar birthday = Calendar.getInstance();
        birthday.set(Calendar.MONTH, birthmonth - 1);  // month is 0-based
        birthday.set(Calendar.DATE, birthdate);
        studentUserDetails.setBirthday(birthday.getTime());
        User user = userService.createUser(studentUserDetails);
        String accessCode = userInfo[8];
        String period = userInfo[9];
        Projectcode projectcode = new Projectcode(accessCode,period);
        studentService.addStudentToRun(user, projectcode);
        newUsernames.add(studentUserDetails.getUsername());
      }
    } catch (IOException e) {
      e.printStackTrace();
    } finally {
      if (inputStreamReader != null) {
        try {
          inputStreamReader.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
      if (br != null) {
        try {
          br.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
    }
    ModelAndView modelAndView = new ModelAndView("admin/account/batchcreateuseraccounts");
    modelAndView.addObject("msg", "Batch create user accounts complete!");
    modelAndView.addObject("newUsernames", newUsernames);
    return modelAndView;
  }

  @RequestMapping(method = RequestMethod.GET)
  public ModelAndView initializeForm(ModelMap model) {
    ModelAndView mav = new ModelAndView();
    mav.addObject("csvFile", new BatchCreateUserAccountsUpload());
    return mav;
  }
}
