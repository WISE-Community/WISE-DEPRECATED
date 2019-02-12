package org.wise.portal.presentation.web.controllers.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.acls.model.Permission;
import org.springframework.web.bind.annotation.*;
import org.wise.portal.dao.ObjectNotFoundException;
import org.wise.portal.domain.authentication.MutableUserDetails;
import org.wise.portal.domain.project.Project;
import org.wise.portal.domain.user.User;
import org.wise.portal.presentation.web.controllers.ControllerUtil;
import org.wise.portal.service.project.ProjectService;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/project/shared")
public class UpdateProjectSharedPermissionsAPIController {

  @Autowired
  private ProjectService projectService;

  /**
   * View all the projects that are shared. Each project will display the
   * Project ID
   * Project Owner
   * The Shared Owners and their permission numbers
   */
  @RequestMapping(value = "/view", method = RequestMethod.GET)
  protected String viewProjectPermissions(@RequestParam(value = "min", required = false) Long min,
                                          @RequestParam(value = "max", required = false) Long max) {
    User signedInUser = ControllerUtil.getSignedInUser();
    if (signedInUser.isAdmin()) {
      long startTime = System.currentTimeMillis();
      StringBuffer projectsSB = new StringBuffer();
      Integer sharedProjectsCount = 0;

      List<Project> allSharedProjects = projectService.getAllSharedProjects();
      for (Project project: allSharedProjects) {
        Long projectId = (Long) project.getId();
        if (isInRange(projectId, min, max)) {
          outputProject(projectsSB, project);
          sharedProjectsCount += 1;
        }
      }
      long endTime = System.currentTimeMillis();
      Long elapsedTimeInSeconds = calculateElapsedTime(startTime, endTime);

      StringBuffer summarySB = new StringBuffer();
      outputMin(summarySB, min);
      outputLineBreak(summarySB);
      outputMax(summarySB, max);
      outputLineBreak(summarySB);
      outputSharedProjectCount(summarySB, sharedProjectsCount);
      outputLineBreak(summarySB);
      outputElapsedTime(summarySB, elapsedTimeInSeconds);
      outputLineBreak(summarySB);
      outputLineBreak(summarySB);

      projectsSB.insert(0, summarySB);
      return projectsSB.toString();
    } else {
      return getPermissionDeniedMessage();
    }
  }

  /**
   * Find all the projects that are shared and then find all the shared owners that have the admin
   * permission 16. For those shared owners with permission 16, add the permission 1 (view), and the
   * permission 2 (edit) if they do not already have them.
   */
  @RequestMapping(value = "/update", method = RequestMethod.GET)
  protected String updateProjectPermissions(@RequestParam(value = "min", required = false) Long min,
                                            @RequestParam(value = "max", required = false) Long max) {
    User signedInUser = ControllerUtil.getSignedInUser();
    if (signedInUser.isAdmin()) {
      long startTime = System.currentTimeMillis();
      StringBuffer projectsSB = new StringBuffer();
      int sharedProjectsCount = 0;
      int sharedProjectsChangedCount = 0;
      int sharedOwnersChangedCount = 0;

      List<Project> allSharedProjects = projectService.getAllSharedProjects();
      for (Project project: allSharedProjects) {
        Long projectId = (Long) project.getId();
        if (isInRange(projectId, min, max)) {
          int tempSharedOwnersChangedCount = updatePermissionsIfNecessary(project);
          if (tempSharedOwnersChangedCount > 0) {
            sharedOwnersChangedCount += tempSharedOwnersChangedCount;
            sharedProjectsChangedCount += 1;
          }
          outputProject(projectsSB, project);
          sharedProjectsCount += 1;
        }
      }
      long endTime = System.currentTimeMillis();
      Long elapsedTimeInSeconds = calculateElapsedTime(startTime, endTime);

      StringBuffer summarySB = new StringBuffer();
      outputMin(summarySB, min);
      outputLineBreak(summarySB);
      outputMax(summarySB, max);
      outputLineBreak(summarySB);
      outputSharedProjectCount(summarySB, sharedProjectsCount);
      outputLineBreak(summarySB);
      outputSharedProjectsChangedCount(summarySB, sharedProjectsChangedCount);
      outputLineBreak(summarySB);
      outputSharedOwnersChangedCount(summarySB, sharedOwnersChangedCount);
      outputLineBreak(summarySB);
      outputElapsedTime(summarySB, elapsedTimeInSeconds);
      outputLineBreak(summarySB);
      outputLineBreak(summarySB);

      projectsSB.insert(0, summarySB);
      return projectsSB.toString();
    } else {
      return getPermissionDeniedMessage();
    }
  }

  private Long calculateElapsedTime(Long startTime, Long endTime) {
    return (endTime - startTime) / 1000;
  }

  private boolean isInRange(Long id, Long min, Long max) {
    if (min == null) {
      min = 0L;
    }
    if (max == null) {
      max = Long.MAX_VALUE;
    }
    return min <= id && id <= max;
  }

  private StringBuffer outputProject(StringBuffer sb, Project project) {
    outputProjectId(sb, project);
    outputLineBreak(sb);
    outputProjectOwner(sb, project);
    outputLineBreak(sb);

    Set<User> sharedOwners = project.getSharedowners();
    for (User sharedOwner: sharedOwners) {
      outputSharedTeacherPermissions(sb, project, sharedOwner);
      outputLineBreak(sb);
    }
    outputLineBreak(sb);
    return sb;
  }

  private StringBuffer outputLineBreak(StringBuffer sb) {
    return outputString(sb, "<br/>");
  }

  private StringBuffer outputProjectId(StringBuffer sb, Project project) {
    return outputString(sb, "Project ID: " + project.getId());
  }

  private StringBuffer outputProjectOwner(StringBuffer sb, Project project) {
    return outputString(sb, "Project Owner: " + project.getOwner().getUserDetails().getUsername());
  }

  private StringBuffer outputSharedTeacherPermissions(StringBuffer sb, Project project, User sharedOwner) {
    MutableUserDetails userDetails = sharedOwner.getUserDetails();
    String username = userDetails.getUsername();
    outputString(sb, username);
    outputString(sb, ": ");
    ouputSharedTeacherPermissionIds(sb, project, sharedOwner);
    return sb;
  }

  private StringBuffer ouputSharedTeacherPermissionIds(StringBuffer sb, Project project, User sharedOwner) {
    StringBuffer sbPermissionIds = new StringBuffer();
    List<Permission> sharedTeacherPermissions = projectService.getSharedTeacherPermissions(project, sharedOwner);
    for (Permission permission: sharedTeacherPermissions) {
      if (sbPermissionIds.length() != 0) {
        sbPermissionIds.append(",");
      }
      int mask = permission.getMask();
      sbPermissionIds.append(mask);
    }
    sb.append(sbPermissionIds);
    return sb;
  }

  private int updatePermissionsIfNecessary(Project project) {
    int sharedOwnersChangedCount = 0;
    Long projectId = (Long) project.getId();
    Set<User> sharedOwners = project.getSharedowners();
    for (User sharedOwner: sharedOwners) {
      List<Permission> sharedTeacherPermissions = projectService.getSharedTeacherPermissions(project, sharedOwner);
      boolean changed = addViewAndEditPermissionToAdminPermission(projectId, sharedOwner.getId(), sharedTeacherPermissions);
      if (changed) {
        sharedOwnersChangedCount += 1;
      }
    }
    return sharedOwnersChangedCount;
  }

  private boolean addViewAndEditPermissionToAdminPermission(Long projectId, Long userId, List<Permission> sharedTeacherPermissions) {
    boolean hasPermission1 = false;
    boolean hasPermission2 = false;
    boolean hasPermission16 = false;

    for (Permission permission: sharedTeacherPermissions) {
      int mask = permission.getMask();
      if (mask == 1) {
        hasPermission1 = true;
      } else if (mask == 2) {
        hasPermission2 = true;
      } else if (mask == 16) {
        hasPermission16 = true;
      }
    }

    boolean changed = false;
    if (hasPermission16) {
      if (!hasPermission1) {
        addSharedTeacherPermission(projectId, userId, 1);
        changed = true;
      }
      if (!hasPermission2) {
        addSharedTeacherPermission(projectId, userId, 2);
        changed = true;
      }
    }

    return changed;
  }

  private void addSharedTeacherPermission(Long projectId, Long userId, Integer permissionId) {
    try {
      projectService.addSharedTeacherPermission(projectId, userId, permissionId);
    } catch (ObjectNotFoundException e) {
      e.printStackTrace();
    }
  }

  private String getPermissionDeniedMessage() {
    return "You must be an admin.";
  }

  private StringBuffer outputMin(StringBuffer sb, Long min) {
    return outputString(sb, "Min: " + min);
  }

  private StringBuffer outputMax(StringBuffer sb, Long max) {
    return outputString(sb, "Max: " + max);
  }

  private StringBuffer outputElapsedTime(StringBuffer sb, Long seconds) {
    return outputString(sb, "Elapsed Time: " + seconds + " seconds");
  }

  private StringBuffer outputSharedProjectCount(StringBuffer sb, Integer sharedProjectsCount) {
    return outputString(sb, "Shared Projects: " + sharedProjectsCount);
  }

  private StringBuffer outputSharedProjectsChangedCount(StringBuffer sb, int sharedProjectsChangedCount) {
    return outputString(sb, "Shared Projects Changed: " + sharedProjectsChangedCount);
  }

  private StringBuffer outputSharedOwnersChangedCount(StringBuffer sb, int sharedOwnersChangedCount) {
    return outputString(sb, "Shared Owners Changed: " + sharedOwnersChangedCount);
  }

  private StringBuffer outputString(StringBuffer sb, String s) {
    return sb.append(s);
  }
}
