package org.wise.vle.domain.work;

public class NotebookItemAlreadyInGroupException extends Exception {
  private static final long serialVersionUID = 1L;

  public NotebookItemAlreadyInGroupException(NotebookItem notebookItem, String group) {
    super("Notebook Item " + notebookItem.getId() + " is already in group " + group);
  }
}
