package org.telscenter.sail.webapp.domain.attendance;

import java.util.Date;

import org.telscenter.sail.webapp.presentation.util.json.JSONObject;

import net.sf.sail.webapp.domain.Persistable;

public interface StudentAttendance extends Persistable  {

	/**
	 * Get the JSONObject representation of this StudentAttendanceImpl object
	 */
	public JSONObject toJSONObject();
	
	public Long getWorkgroupId();

	public void setWorkgroupId(Long workgroupId);

	public Long getRunId();

	public void setRunId(Long runId);

	public Date getLoginTimestamp();

	public void setLoginTimestamp(Date loginTimestamp);

	public String getPresentUserIds();

	public void setPresentUserIds(String presentUserIds);

	public String getAbsentUserIds();

	public void setAbsentUserIds(String absentUserIds);
}
