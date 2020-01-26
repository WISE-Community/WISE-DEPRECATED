package org.wise.portal.spring.impl;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceContext;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableAutoConfiguration
@EnableJpaRepositories(basePackages = {"org.wise.portal.score.repository"})
@EntityScan(basePackages = {"org.wise.portal"})
@EnableTransactionManagement
public class RepositoryConfiguration {

  @PersistenceContext
  private EntityManager entityManager;

  @Bean
  public EntityManagerFactory entityManagerFactory() {
    return entityManager.getEntityManagerFactory();
  }
}

