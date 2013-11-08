package org.telscenter.sail.webapp.spring.impl;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;

import java.io.FileNotFoundException;
import java.io.IOException;

public class Converter {

	/**
	 * @param args
	 */
	public static void main(String[] args) throws FileNotFoundException, IOException {
		// TODO Auto-generated method stub
		BufferedReader fileReader = new BufferedReader(new FileReader(new File("testfile.txt")));
		BufferedWriter fileWriter = new BufferedWriter(new FileWriter(new File("testoutput.txt")));
		
		String line = fileReader.readLine();
		while (line != null) {
			line = fileReader.readLine();
			System.out.println(line);
			if(line.indexOf("LOST USERNAME OR PASSWORD") > -1){
				String replacement = line.replace("LOST USERNAME OR PASSWORD", "<spring:message code='' />");
				fileWriter.append(replacement);
			}
		}
		fileReader.close();
		fileWriter.close();
	}

}
