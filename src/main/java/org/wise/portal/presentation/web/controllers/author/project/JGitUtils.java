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
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.ObjectId;
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

  public static JSONArray getCommitHistoryJSONArray(String fullProjectDir)
      throws IOException, GitAPIException, JSONException {
    Iterable<RevCommit> commitHistory = JGitUtils.getCommitHistory(fullProjectDir);
    JSONArray commitHistoryJSONArray = new JSONArray();
    for (RevCommit commit : commitHistory) {
      JSONObject commitHistoryJSONObject = new JSONObject();
      ObjectId commitId = commit.getId();
      commitHistoryJSONObject.put("commitId", commitId);
      String commitName = commit.getName();
      commitHistoryJSONObject.put("commitName", commitName);
      String commitMessage = commit.getFullMessage();
      commitHistoryJSONObject.put("commitMessage", commitMessage);
      String commitAuthor = commit.getAuthorIdent().getName();
      commitHistoryJSONObject.put("commitAuthor", commitAuthor);
      long commitTime = commit.getCommitTime() * 1000l; // x1000 to make into milliseconds since epoch
      commitHistoryJSONObject.put("commitTime", commitTime);
      commitHistoryJSONArray.put(commitHistoryJSONObject);
    }
    return commitHistoryJSONArray;
  }

  /**
   * Returns commit history for specified directory
   *
   * @param directoryPath
   * @throws IOException
   * @throws GitAPIException
   */
  private static Iterable<RevCommit> getCommitHistory(String directoryPath)
      throws IOException, GitAPIException {
    boolean doCreate = false;
    Repository gitRepository = getGitRepository(directoryPath, doCreate);
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
   * Adds all changes in specified directory to git index and then commits them
   * with the specified commit message
   *
   * @param directoryPath
   * @param author author username
   * @param commitMessage
   * @throws IOException
   * @throws GitAPIException
   */
  public static void commitAllChangesToCurriculumHistory(String directoryPath, String author,
      String commitMessage) throws IOException, GitAPIException {
    boolean doCreate = true;
    Repository gitRepository = getGitRepository(directoryPath, doCreate);
    Git git = new Git(gitRepository);
    git.add().addFilepattern(".").call();
    String email = "";
    git.commit()
        .setAll(true)
        .setAuthor(author, email)
        .setMessage(commitMessage)
        .call();
    gitRepository.close();
  }

  /**
   * @param directoryPath
   * @param doCreate create the directory if it doesn't exit
   * @throws IOException
   */
  private static Repository getGitRepository(String directoryPath, boolean doCreate)
      throws IOException {
    File localPath = new File(directoryPath);
    File gitDir = new File(localPath, ".git");
    if (!doCreate && !gitDir.exists()) {
      return null;
    } else {
      Repository repository = FileRepositoryBuilder.create(gitDir);
      if (doCreate && !gitDir.exists()) {
        repository.create();
      }
      return repository;
    }
  }
}
