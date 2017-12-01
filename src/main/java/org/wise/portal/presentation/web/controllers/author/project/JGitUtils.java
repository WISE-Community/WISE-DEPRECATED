/**
 * Copyright (c) 2008-2017 Regents of the University of California (Regents). Created
 * by TELS, Graduate School of Education, University of California at Berkeley.
 *
 * This software is distributed under the GNU General Public License, v3.
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
package org.wise.portal.presentation.web.controllers.author.project;

import java.io.File;
import java.io.IOException;

import org.apache.commons.collections4.IterableUtils;
import org.apache.commons.io.FileUtils;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * @author Hiroki Terashima
 */
public class JGitUtils {

  /**
   * Returns commit history for the specified directory path
   */
  public static JSONArray getCommitHistoryJSONArray(String dirPath)
      throws IOException, GitAPIException, JSONException {
    Iterable<RevCommit> commitHistory = JGitUtils.getCommitHistory(dirPath);
    JSONArray commitHistoryJSONArray = new JSONArray();
    for (RevCommit commit : commitHistory) {
      JSONObject commitHistoryJSONObject = new JSONObject();
      commitHistoryJSONObject.put("commitId", commit.getId());
      commitHistoryJSONObject.put("commitName", commit.getName());
      commitHistoryJSONObject.put("commitMessage", commit.getFullMessage());
      commitHistoryJSONObject.put("commitAuthor", commit.getAuthorIdent().getName());
      commitHistoryJSONObject.put("commitTime", commit.getCommitTime() * 1000l);
      commitHistoryJSONArray.put(commitHistoryJSONObject);
    }
    return commitHistoryJSONArray;
  }

  private static Iterable<RevCommit> getCommitHistory(String dirPath)
      throws IOException, GitAPIException {
    boolean doCreate = false;
    Repository gitRepository = getGitRepository(dirPath, doCreate);
    if (gitRepository == null) {
      return IterableUtils.emptyIterable();
    } else {
      Git git = new Git(gitRepository);
      Iterable<RevCommit> commits = git.log().all().call();
      gitRepository.close();
      return commits;
    }
  }

  /**
   * Adds changes to project.json file in specified directory to git index and then commits them
   * with the specified commit message
   *
   * @param projectDirPath path of directory containing project.json
   * @param author author username
   * @param authorEmail
   * @param commitMessage
   * @throws IOException
   * @throws GitAPIException
   */
  public static void commitChangesToProjectJSON(String projectDirPath, String author,
      String authorEmail, String commitMessage) throws IOException, GitAPIException {
    boolean doCreate = true;
    Repository gitRepository = getGitRepository(projectDirPath, doCreate);
    Git git = new Git(gitRepository);
    git.add()
        .addFilepattern("project.json")
        .call();
    git.commit()
        .setAuthor(author, authorEmail)
        .setMessage(commitMessage)
        .call();
    gitRepository.close();
  }

  private static Repository getGitRepository(String projectDirPath, boolean doCreate)
      throws IOException {
    File projectDir = new File(projectDirPath);
    File projectGitDir = new File(projectDir, ".git");
    if (!doCreate && !projectGitDir.exists()) {
      return null;
    } else {
      Repository repository = FileRepositoryBuilder.create(projectGitDir);
      if (doCreate && !projectGitDir.exists()) {
        repository.create();
        addGitIgnoreFileToProjectDir(projectDir);
      }
      return repository;
    }
  }

  private static void addGitIgnoreFileToProjectDir(File projectDir) throws IOException {
    File projectGitIgnore = new File(projectDir, ".gitignore");
    if (!projectGitIgnore.exists()) {
      projectGitIgnore.createNewFile();
      String ignoreRule = "assets";
      FileUtils.writeStringToFile(projectGitIgnore, ignoreRule);
    }
  }
}
