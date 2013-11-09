package vle.web;

import java.io.File;
import java.io.IOException;
import java.util.Vector;

import org.apache.commons.io.FileUtils;

public class MySystemExporter {


	private String basedir;
	private File zipFolder;
	Vector<String> filesToCopy;
	Vector<String> directoriesToCopy;

	public MySystemExporter(String _vlewrapperBaseDir, File _zipFolder) {
		basedir = _vlewrapperBaseDir;
		zipFolder = _zipFolder;
		filesToCopy = new Vector<String>();
		directoriesToCopy = new Vector<String>();
		addFiles();
	}
	
	private void addDir(String path) {
		directoriesToCopy.add(basedir + path);
	}
	
	private void addFile(String path) {
		filesToCopy.add(basedir + path);
	}
	
	private void copyFileToZipDir(String sourcePath) {
		copyFileToZipDir(sourcePath, "");
	}
	
	private void copyFileToZipDir(String sourcePath, String relativeDest) {
		File sourceFile = new File(sourcePath);
		File destDir = new File(zipFolder.getPath() + relativeDest);
		try {
			FileUtils.copyFileToDirectory(sourceFile, destDir);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	private void copyDirToZipDir(String sourcpath) {
		copyDirToZipDir(sourcpath, "mysystem2");
	}
	
	private void copyDirToZipDir(String sourcePath, String relativePath) {
		File sourceFile = new File(sourcePath);
		File destDir = new File(zipFolder.toString(), relativePath);
		try {
			FileUtils.forceMkdir(destDir);
			FileUtils.copyDirectoryToDirectory(sourceFile, destDir);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	private void addFiles() {
		addFile("/vle/node/mysystem2/authoring/js/libs/lz77.js");
		addFile("/vle/node/mysystem2/viewStudentWork.html");
//		addFile("/vle/node/mysystem2/viewStudentWork.css");
		addFile("/vle/node/mysystem2/viewStudentWork.js");
		addDir( "/vle/node/mysystem2/css");
		addDir( "/vle/node/mysystem2/js");
		addDir( "/vle/node/mysystem2/images");
		addDir( "/vle/node/mysystem2/icons");
	}

	public void copyFiles() {
		for(int fileIndex=0; fileIndex<filesToCopy.size(); fileIndex++) {
			copyFileToZipDir(filesToCopy.get(fileIndex));
		}
		for(int dirIndex=0; dirIndex < directoriesToCopy.size(); dirIndex++) {
			copyDirToZipDir(directoriesToCopy.get(dirIndex));
		}
		copyFileToZipDir(basedir + "/vle/node/mysystem2/mysystem2.html", "/mysystem2");
	}

}
