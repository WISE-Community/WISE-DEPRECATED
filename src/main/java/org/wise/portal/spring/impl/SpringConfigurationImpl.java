/**
 * Copyright (c) 2007-2019 Encore Research Group, University of Toronto
 *
 * This software is distributed under the GNU General Public License, v3,
 * or (at your option) any later version.
 *
 * Permission is hereby granted, without written agreement and without license
 * or royalty fees, to use, copy, modify, and distribute this software and its
 * documentation for any purpose, provided that the above copyright notice and
 * the following two paragraphs appear in all copies of this software.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Public License for more details.
 *
 * You should have received a copy of the GNU Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
package org.wise.portal.spring.impl;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.intercept.RunAsImplAuthenticationProvider;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.wise.portal.service.authentication.UserDetailsService;
import org.wise.portal.spring.SpringConfiguration;

/**
 * Implementation of <code>SpringConfiguration</code> for WISE.
 *
 * @author Cynick Young
 * @author Hiroki Terashima
 */
@Configuration
public class SpringConfigurationImpl implements SpringConfiguration {

  @Autowired
  RunAsImplAuthenticationProvider runAsAuthenticationProvider;

  @Autowired
  PasswordEncoder passwordEncoder;

  @Autowired
  UserDetailsService userDetailsService;

  @Bean
  public ProviderManager authenticationManager() {
    ArrayList<AuthenticationProvider> providers = new ArrayList<>();
    providers.add(daoAuthenticationProvider());
    providers.add(runAsAuthenticationProvider);
    return new ProviderManager(providers);
  }

  @Bean
  public DaoAuthenticationProvider daoAuthenticationProvider() {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    provider.setUserDetailsService(userDetailsService);
    provider.setPasswordEncoder(passwordEncoder);
    return provider;
  }

  public String[] getDispatcherServletContextConfigLocations() {
    return new String[]{};
  }

  public String[] getRootApplicationContextConfigLocations() {
    return new String[]{};
  }
}
