
package org.wise.portal.dao.work.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.sql.Timestamp;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.wise.portal.domain.authentication.Gender;
import org.wise.portal.domain.authentication.Schoollevel;
import org.wise.portal.domain.group.Group;
import org.wise.portal.domain.run.Run;
import org.wise.portal.domain.user.User;
import org.wise.portal.domain.workgroup.Workgroup;
import org.wise.portal.junit.AbstractTransactionalDbTests;
import org.wise.vle.domain.work.StudentAsset;

/**
 * @author Geoffrey Kwan
 */
@SpringBootTest
@RunWith(SpringRunner.class)
public class HibernateStudentAssetDaoTest extends AbstractTransactionalDbTests {

  Run run;
  Group period1;
  Workgroup workgroup1, workgroup2;

  @Autowired
  HibernateStudentAssetDao studentAssetDao;

  @Before
  public void setUp() throws Exception {
    super.setUp();
    Long id = getNextAvailableProjectId();
    String projectName = "How to be a Fry Cook";
    Date startTime = Calendar.getInstance().getTime();
    String runCode = "Panda123";
    User teacher = createTeacherUser("Mrs", "Puff", "MrsPuff", "Mrs. Puff", "boat", "Bikini Bottom",
        "Water State", "Pacific Ocean", "mrspuff@bikinibottom.com", "Boating School",
        Schoollevel.COLLEGE, "1234567890");
    run = createProjectAndRun(id, projectName, teacher, startTime, runCode);
    period1 = createPeriod("Period 1");
    Set<Group> periods = new TreeSet<Group>();
    periods.add(period1);
    run.setPeriods(periods);
    User student1 = createStudentUser("Spongebob", "Squarepants", "SpongebobS0101", "burger", 1, 1,
        Gender.MALE);
    Set<User> members1 = new HashSet<User>();
    members1.add(student1);
    workgroup1 = createWorkgroup(members1, run, period1);
    User student2 = createStudentUser("Patrick", "Star", "PatrickS0101", "rock", 1, 1, Gender.MALE);
    Set<User> members2 = new HashSet<User>();
    members2.add(student2);
    workgroup2 = createWorkgroup(members2, run, period1);
  }

  @Test
  public void getStudentAssetListByParams_RunWithNoStudentAssets_ShouldReturnNone() {
    List<StudentAsset> studentAssets = 
        studentAssetDao.getStudentAssetListByParams(null, run, null, null, null, null, null, null);
    assertEquals(0, studentAssets.size());
  }

  @Test
  public void getStudentAssetListByParams_RunWithStudentAssets_ShouldReturnStudentAssets() {
    createStudentAsset(workgroup1, "file1.jpg");
    List<StudentAsset> studentAssets = 
        studentAssetDao.getStudentAssetListByParams(null, run, null, null, null, null, null, null);
    assertEquals(1, studentAssets.size());
    assertEquals("file1.jpg", studentAssets.get(0).getFileName());
  }

  @Test
  public void getStudentAssetListByParams_ByWorkgroup_ShouldReturnStudentAssets() {
    createStudentAsset(workgroup1, "file1.jpg");
    createStudentAsset(workgroup1, "file2.jpg");
    createStudentAsset(workgroup2, "file3.jpg");
    List<StudentAsset> studentAssets = studentAssetDao.getStudentAssetListByParams(
        null, run, null, workgroup1, null, null, null, null);
    assertEquals(2, studentAssets.size());
    assertEquals("file1.jpg", studentAssets.get(0).getFileName());
    assertEquals("file2.jpg", studentAssets.get(1).getFileName());
  }

  public StudentAsset createStudentAsset(Workgroup workgroup, String fileName) {
    StudentAsset studentAsset = new StudentAsset();
    Calendar now = Calendar.getInstance();
    Timestamp timestamp = new Timestamp(now.getTimeInMillis());
    studentAsset.setClientSaveTime(timestamp);
    studentAsset.setServerSaveTime(timestamp);
    studentAsset.setRun(run);
    studentAsset.setPeriod(period1);
    studentAsset.setWorkgroup(workgroup);
    studentAsset.setIsReferenced(false);
    studentAsset.setFileName(fileName);
    studentAsset.setFilePath("assets/" + fileName);
    studentAsset.setFileSize(100L);
    studentAssetDao.save(studentAsset);
    return studentAsset;
  }
}