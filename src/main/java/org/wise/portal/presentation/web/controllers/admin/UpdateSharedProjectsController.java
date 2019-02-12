package org.wise.portal.presentation.web.controllers.admin;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping("/admin/project/updatesharedprojects")
public class UpdateSharedProjectsController {

  @RequestMapping(method= RequestMethod.GET)
  public ModelAndView initializeForm(ModelMap model) {
    ModelAndView mav = new ModelAndView();
    return mav;
  }

}
