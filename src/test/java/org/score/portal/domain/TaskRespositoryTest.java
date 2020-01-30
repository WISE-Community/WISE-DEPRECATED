package org.score.portal.domain;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.score.portal.domain.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.wise.Application;

import lombok.Data;

@RunWith(SpringRunner.class)
// @AutoConfigureTestDatabase
@ContextConfiguration(classes={Application.class})
// @SpringBootTest(classes = Application.class)
// @SpringBootTest
@DataJpaTest
public class TaskRespositoryTest {


//    @Autowired
//    TaskRespository taskRespository;

    @Test
    public void testTaskCreation() {

      Task task = Task.builder().name("activity 1").build();

      // this.taskRespository.save(task);

    }
}
