package background.jobs;

import java.util.List;

import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import vle.domain.cRater.CRaterRequest;
import vle.domain.work.StepWork;
import vle.web.VLEAnnotationController;

public class CRaterJob implements Job {

	/**
	 * Loops through incomplete CRaterRequests and requests them 10 seconds apart.
	 */
	@Override
	public void execute(JobExecutionContext context) throws JobExecutionException {
		JobDataMap mergedJobDataMap = context.getMergedJobDataMap();
		//String cRaterVerificationUrl = mergedJobDataMap.getString("cRater_verification_url");
		String cRaterScoringUrl = mergedJobDataMap.getString("cRater_scoring_url");
		String cRaterClientId = mergedJobDataMap.getString("cRater_client_id");
		
		if(cRaterScoringUrl != null) {
			List<CRaterRequest> incompleteCRaterRequests = CRaterRequest.getIncompleteCRaterRequests();
			
			for(int x=0; x<incompleteCRaterRequests.size(); x++) {
				CRaterRequest cRaterRequest = incompleteCRaterRequests.get(x);
				
				StepWork stepWork = cRaterRequest.getStepWork();
				Long stepWorkId = stepWork.getId();
				Long nodeStateId = cRaterRequest.getNodeStateId();
				String runId = cRaterRequest.getRunId().toString();
				String annotationType = "cRater";
				
				VLEAnnotationController.getCRaterAnnotation(nodeStateId, runId, stepWorkId, annotationType, cRaterScoringUrl, cRaterClientId);
				
				//sleep for 10 seconds between each request
				try {
					Thread.sleep(10000);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}			
		}
	}
}
