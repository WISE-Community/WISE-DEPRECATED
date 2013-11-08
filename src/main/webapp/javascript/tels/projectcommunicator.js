function ProjectCommunicators(xmlProjectCommunicators) {
	this.projectcommunicators = [];
	this.setProjectCommunicators(xmlProjectCommunicators);
}

ProjectCommunicators.prototype.setProjectCommunicators = function(xmlProjectCommunicators){
	var xProjectCommunicators = xmlProjectCommunicators.getElementsByTagName('projectcommunicator');
	if (xProjectCommunicators != null && xProjectCommunicators[0] != null) {
	  for(x=0;x<xProjectCommunicators.length;x++) {
		  this.setProjectCommunicator(xProjectCommunicators[x]);
	  };
	};		
};

ProjectCommunicators.prototype.setProjectCommunicator = function(xmlProjectCommunicator) {
	this.projectcommunicators.push(new ProjectCommunicator(xmlProjectCommunicator));
};

function ProjectCommunicator(xmlProjectCommunicator)){	
	this.id = xmlProjectCommunicator.childNodes[0].childNodes[0].nodeValue;
	this.type = xmlProjectCommunicator.childNodes[1].childNodes[1].nodeValue;
	this.baseurl = xmlProjectCommunicator.childNodes[2].childNodes[2].nodeValue;
	this.address = xmlProjectCommunicator.childNodes[3].childNodes[3].nodeValue;
	this.longitude = xmlProjectCommunicator.childNodes[4].childNodes[4].nodeValue;
	this.latitude = xmlProjectCommunicator.childNodes[5].childNodes[5].nodeValue;
	alert(this.id);alert(this.type); alert(this.baseurl); alert(this.longitude);
}