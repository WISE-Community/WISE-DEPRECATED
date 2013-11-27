	function createAttribute(doc, node, type, val){
		var attribute = doc.createAttribute(type);
		attribute.nodeValue = val;
		node.setAttributeNode(attribute);
	};

	function createElement(doc, type, attrArgs){
		var newElement = doc.createElement(type);
		if(attrArgs!=null){
			for(var option in attrArgs){
				createAttribute(doc, newElement, option, attrArgs[option]);
			};
		};
		return newElement;
	};

	function newOption(){
		document.getElementById('error').innerHTML = "";
		var val = document.getElementById('selectType').options[document.getElementById('selectType').selectedIndex].value;
		var typeList = document.getElementById('typeList');
		typeList.removeChild(document.getElementById('list'));
		
		if(val=='null'){
			var list = createElement(document, 'div', {id: 'list'});
			typeList.appendChild(list);
		} else {
			var types = nodedataManager.getNodedataSet().getTypes(val);
			var list = createElement(document, 'select', {id: 'list', name: 'list', size: 10});
			for(x=0;x<types.length;x++){
				var option = createElement(document, 'option', {id: types[x].getId(), value: types[x].getName(), onclick: "document.getElementById('text').value=this.value"});
				option.innerHTML = types[x].getName();
				list.appendChild(option);
			};
			typeList.appendChild(list);
		};
	};

	function clearAll(){
		document.getElementById('error').innerHTML = "";
		var typeList = document.getElementById('typeList');
		var list = createElement(document, 'div', {id: 'list'});
		document.getElementById('selectType').selectedIndex = 0;
		document.getElementById('text').value = "";
		typeList.removeChild(document.getElementById('list'));
		typeList.appendChild(list);
	};
	
	function submit(){
		document.getElementById('error').innerHTML = "";
		if(validate()){
			nodedataManager.createNewType(document.getElementById('selectType').options[document.getElementById('selectType').selectedIndex].value, document.getElementById('text').value);
		};		
	};
	
	function validate(){
		var type = document.getElementById('selectType').options[document.getElementById('selectType').selectedIndex].value;
		var text = document.getElementById('text').value;
				
		if(type==null || type=="null" || type==""){
			displayFormError("A hierarchy type must be selected before submitting");
			return false;
		};
		
		if(text==null || text==""){
			displayFormError("You must enter text before submitting");
			return false;
		};
		
		if(document.getElementById('list').selectedIndex >= 0){
			var listText = document.getElementById('list').options[document.getElementById('list').selectedIndex].value;
			var listTextId = document.getElementById('list').options[document.getElementById('list').selectedIndex].id;
			
			if(listText==text){
				return false; //text is same, no need to update
			} else {
				if(confirm("Continuing will change nodedata with id: " + listTextId + " from: " + listText + " to: " + text + ". Are you sure you wish to continue?")){
					nodedataManager.updateType(type, text, listTextId);
					return false;
				} else {
					return false;
				};
			};
		};
		
		return true;
	};
	
	function displayFormError(error){
		document.getElementById('error').innerHTML = "<font color='8B0000'>" + error + "</font>";
	};

	function NodedataManager(xmlNodedata){
		this.nodedata = new NodedataSet((new DOMParser()).parseFromString(xmlNodedata, "text/xml"));
	};
	
	NodedataManager.prototype.getNodedataSet = function(){
		return this.nodedata;
	};
	
	NodedataManager.prototype.createNewType = function(type, data){
		var callback = {
			success: function(o){
				this.nodedata.addXMLNodedata((new DOMParser()).parseFromString(o.responseText, "text/xml"));
				clearAll();
			},
			failure: function(o){alert('server failed creation of hierarchy type');},
			scope: this
		};
	
		YAHOO.util.Connect.asyncRequest('GET', 'createhierarchytype.html?type=' + type + '&data=' + data, callback);
	};
	
	NodedataManager.prototype.updateType = function(type, data, id){
		var callback = {
			success: function(o){
				xmlDoc = (new DOMParser()).parseFromString(o.responseText, "text/xml").getElementsByTagName('nodedata')[0];
				xmlDocId = xmlDoc.childNodes[0].childNodes[0].nodeValue;
				nodeData = this.nodedata.getByNodedataId(xmlDocId);
				
				xmlType = xmlDoc.getElementsByTagName('district');
				if(xmlType==null || xmlType[0]==null){
					xmlType = xmlDoc.getElementsByTagName('school');
					if(xmlType==null || xmlType[0]==null){
						xmlType = xmlDoc.getElementsByTagName('period');
						if(xmlType!=null && xmlType[0]!=null){
							nodeData.setType('period');
						};
					} else {
						nodeData.setType('school');
					};
				} else {
					nodeData.setType('district');
				};
				nodeData.setTypeId(xmlType[0].getElementsByTagName('id')[0].childNodes[0].nodeValue);
				nodeData.setName(xmlType[0].getElementsByTagName('name')[0].childNodes[0].nodeValue);
				clearAll();
			},
			failure: function(o){alert('server failed update of hierarchy type');},
			scope: this
		};
	
		YAHOO.util.Connect.asyncRequest('GET', 'createhierarchytype.html?type=' + type + '&data=' + data + '&id=' + id, callback);
	
	};
	
	function NodedataSet(xmlNodedataSet){
		this.nodedata = [];
		this.addXMLNodedata(xmlNodedataSet.getElementsByTagName('nodedataset')[0]);
	};
	
	NodedataSet.prototype.getNodedata = function(){
		return this.nodedata;
	};
	
	NodedataSet.prototype.addXMLNodedata = function(xmlNodedata){
		var nodedata = xmlNodedata.getElementsByTagName('nodedata');
		if(nodedata!=null && nodedata[0]!=null){
			for(x=0;x<nodedata.length;x++){
				this.nodedata.push(new Nodedata(nodedata[x]));
			};
		};
	};
	
	NodedataSet.prototype.getTypes = function(type){
		var types = [];
		for(x=0;x<this.nodedata.length;x++){
			if(this.nodedata[x].getType()==type){
				types.push(this.nodedata[x]);
			};
		};
		return types;
	};
	
	NodedataSet.prototype.getByNodedataId = function(id){
		for(x=0;x<this.nodedata.length;x++){
			if(this.nodedata[x].getId()==id){
				return this.nodedata[x];
			};
		};
	};
	
	function Nodedata(xmlNodedata){
		this.types = ['district', 'school', 'period', 'user'];
		this.id;
		this.type;
		this.typeId;
		this.name;
		this.role;
		
		this.addXMLNodedata(xmlNodedata);
	};
	
	Nodedata.prototype.addXMLNodedata = function(xmlNodedata){
		this.id = xmlNodedata.childNodes[0].childNodes[0].nodeValue;
		for(y=0;y<this.types.length;y++){
			this.populateType(this.types[y], xmlNodedata);
		};
	};
	
	Nodedata.prototype.populateType = function(possible, xmlType){
		var foundType = xmlType.getElementsByTagName(possible);
		if(foundType!=null && foundType[0]!=null){
			this.type = possible;
			this.typeId = foundType[0].getElementsByTagName('id')[0].childNodes[0].nodeValue;
			this.name = foundType[0].getElementsByTagName('name')[0].childNodes[0].nodeValue;
			if(this.type=='user'){
				this.role = foundType[0].getElementsByTagName('role')[0].childNodes[0].nodeValue;
			};
		};
	};
	
	Nodedata.prototype.getId = function(){
		return this.id;
	};
	
	Nodedata.prototype.getType = function(){
		if(this.type=='user'){
			return this.role;
		} else {
			return this.type;
		};
	};
	
	Nodedata.prototype.getTypeId = function(){
		return this.typeId;
	};
	
	Nodedata.prototype.getName = function(){
		return this.name;
	};
	
	Nodedata.prototype.getRole = function(){
		return this.role;
	};
	
	Nodedata.prototype.setType = function(type){
		this.type = type;
	};
	
	Nodedata.prototype.setTypeId = function(id){
		this.typeId = id;
	};
	
	Nodedata.prototype.setName = function(name){
		this.name = name;
	};
	
	Nodedata.prototype.setRole = function(role){
		this.role = role;
	};
	
	function Node(xmlNode, parentNode){
		this.parent;
		this.id;
		this.nodeData;
		this.children = [];
		
		this.parent = parentNode;
		this.id = xmlNode.firstChild.childNodes[0].nodeValue;
		this.nodeData = new Nodedata(xmlNode.childNodes[1]);
		xmlChildren = xmlNode.childNodes[2];
		this.childNode = xmlChildren.firstChild;
		while(this.childNode){
			this.children.push(new Node(this.childNode, this));
			this.childNode = this.childNode.nextSibling;
		};
	};
	
	Node.prototype.getParent = function(){
		return this.parent;
	};
	
	Node.prototype.getId = function(){
		return this.id;
	};
	
	Node.prototype.getNodeData = function(){
		return this.nodeData;
	};
	
	Node.prototype.getChildren = function(){
		return this.children;
	};
	
	Node.prototype.addChild = function(node){
		node.setParent(this);
		this.children.push(node);
	};
	
	Node.prototype.setParent = function(node){
		this.parent = node;
	};
	
	Node.prototype.setNodeData = function(nodeData){
		this.nodeData = nodeData;
	};
	
	Node.prototype.getById = function(id){
		if(this.id==id){
			return this;
		} else {
			for(this.x=0;this.x<this.children.length;this.x++){
				this.childGotIt = this.children[this.x].getById(id);
				if(this.childGotIt!=null){
					return this.childGotIt;
				};
			};
		};
		return null;
	};
	
	Node.prototype.returnStructure = function(){
		if(this.children.length<1){
			arr = [];
			arr.push(this.nodeData.getType());
			return arr;
		} else {
			currentWinner = [];
			for(this.a=0;this.a<this.children.length;this.a++){
				if(this.children[this.a].returnStructure().length > currentWinner.length){
					currentWinner = this.children[this.a].returnStructure();
				};
			};
			currentWinner.push(this.nodeData.getType());
			return currentWinner;
		};
	};
	
	function User(xmlUser){
		this.name = xmlUser.childNodes[1].childNodes[0].nodeValue;
		this.id = xmlUser.childNodes[0].childNodes[0].nodeValue;
		this.role = xmlUser.childNodes[2].childNodes[0].nodeValue;
	};
	
	User.prototype.getId = function(){
		return this.id;
	};
	
	User.prototype.getName = function(){
		return this.name;
	};
	
	User.prototype.getRole = function(){
		return this.role;
	};
	
	function NodeManager(xmlNodes, xmlUsers){
		this.structureElements = ['district', 'school', 'teacher', 'period', 'student'];
		this.nodes = [];
		this.teachers = [];
		this.students = [];
		
		xmlNodeset = (new DOMParser()).parseFromString(xmlNodes, "text/xml").getElementsByTagName('nodeset')[0];
		this.currentNode = xmlNodeset.firstChild
		while(this.currentNode){
			this.nodes.push(new Node(this.currentNode));
			this.currentNode = this.currentNode.nextSibling;
		};
		
		this.parseUsers((new DOMParser()).parseFromString(xmlUsers, "text/xml"));
		
		alert(this.nodes[0].returnStructure().reverse());
	};
	
	NodeManager.prototype.parseUsers = function(xmlUsers){
		var users = xmlUsers.getElementsByTagName('user');
		for(b=0;b<users.length;b++){
			currentUser = new User(users[b]);
			if(currentUser.getRole()=='teacher'){
				this.teachers.push(currentUser);
			} else if(currentUser.getRole()=='student'){
				this.students.push(currentUser);
			};
		};
	};
	
	NodeManager.prototype.retrieveById = function(id){
		for(this.x=0;this.x<this.nodes.length;this.x++){
			this.nodeGotIt = this.nodes[this.x].getById(id);
			if(this.nodeGotIt!=null){
				return this.nodeGotIt;
			};
		};
	};
	
	NodeManager.prototype.addStructure = function(structure){
		//alert();
	};
	
	NodeManager.prototype.getStructureElements = function(){
		return this.structureElements;
	};
	
	NodeManager.prototype.createTopLevel = function(){
		if(this.nodes.length>0){
			var topTr = createElement(document, 'tr', {id: 'topLevel'});
			var existingTd = createElement(document, 'td', {id: 'topLevelExisting'});
			topTr.appendChild(existingTd);		
			var nodeSelect = createElement(document, 'select', {id: 'nodeSelect', name: 'nodeSelect', size: 5});
			var nodeSelectTextDiv = createElement(document, 'div', {id: 'nodeSelectText'});
			nodeSelectTextDiv.innerHTML = this.nodes[0].getNodeData().getType();
			for(z=0;z<this.nodes.length;z++){
				option = createElement(document, 'option', {id: this.nodes[z].getId(), value: this.nodes[z].getId(), onclick: 'nodeManager.propagateNextLevel(this.value, 1)'});
				option.innerHTML = this.nodes[z].getNodeData().getName();
				nodeSelect.appendChild(option);
			};
			existingTd.appendChild(nodeSelectTextDiv);
			existingTd.appendChild(nodeSelect);
			document.getElementById('selectTable').appendChild(topTr);
			
			var existingDataTd = createElement(document, 'td', {id: 'topLevelExistingData'});
			var nodedataSelect = createElement(document, 'select', {id: 'nodedataSelect', name: 'nodedataSelect', size: 5});
			var nodedataSelectTextDiv = createElement(document, 'div', {id: 'nodedataSelectText'});
			nodedataSelectTextDiv.innerHTML = this.nodes[0].getNodeData().getType() + "s to add";
			
			var nodedata;
			if(this.nodes[0].getNodeData().getType()=='teacher'){
				nodedata = this.teachers;
			} else if(this.nodes[0].getNodeData().getType()=='student'){
				nodedata = this.students;
			} else {
				nodedata = nodedataManager.getNodedataSet().getTypes(this.nodes[0].getNodeData().getType());
			};
			for(p=0;p<nodedata.length;p++){
				option = createElement(document, 'option', {id: nodedata[p].getId(), value: nodedata[p].getId(), onclick: "alert('clicked')"});
				option.innerHTML = nodedata[p].getName();
				nodedataSelect.appendChild(option);
			};
			existingDataTd.appendChild(nodedataSelectTextDiv);
			existingDataTd.appendChild(nodedataSelect);
			topTr.appendChild(existingDataTd);
		};	
	};
	
	NodeManager.prototype.createNew = function(){
		alert('not yet implemented');
	};
	
	NodeManager.prototype.propagateNextLevel = function(id, depth){
		var currentNode = this.retrieveById(id);
		if(currentNode!=null){
			var children = currentNode.getChildren();
			this.removeUnwantedSiblings(depth);
			if(children.length>0){
				var levelTr = createElement(document, 'tr', {id: 'level' + depth});
				var levelSelectTd = createElement(document, 'td', {id: 'levelTd' + depth});
				levelTr.appendChild(levelSelectTd);
				var levelSelect = createElement(document, 'select', {id: 'levelSelect' + depth, size: 5});
				var levelSelectDiv = createElement(document, 'div', {id: 'levelSelectDiv' + depth});
				levelSelectDiv.innerHTML = children[0].getNodeData().getType();
				for(v=0;v<children.length;v++){
					option = createElement(document, 'option', {id: children[v].getId(), value: children[v].getId(), onclick: 'nodeManager.propagateNextLevel(this.value,' + (depth + 1) + ')'});
					option.innerHTML = children[v].getNodeData().getName();
					levelSelect.appendChild(option);
				};
				levelSelectTd.appendChild(levelSelectDiv);
				levelSelectTd.appendChild(levelSelect);
				document.getElementById('selectTable').appendChild(levelTr);
				
				var dataSelectTd = createElement(document, 'td', {id: 'dataTd' + depth});
				var dataSelect = createElement(document, 'select', {id: 'dataSelect' + depth, size: 5});
				var dataSelectDiv = createElement(document, 'div', {id: 'dataSelectDiv' + depth});
				dataSelectDiv.innerHTML = children[0].getNodeData().getType() + 's to add';
				
				var nodedata;
				if(children[0].getNodeData().getType()=='teacher'){
					nodedata = this.teachers;
				} else if(children[0].getNodeData().getType()=='student'){
					nodedata = this.students;
				} else {
					nodedata = nodedataManager.getNodedataSet().getTypes(children[0].getNodeData().getType());
				};
				for(u=0;u<nodedata.length;u++){
					option = createElement(document, 'option', {id: nodedata[u].getId(), value: nodedata[u].getId(), onclick: "alert('clicked')"});
					option.innerHTML = nodedata[u].getName();
					dataSelect.appendChild(option);
				};
				dataSelectTd.appendChild(dataSelectDiv);
				dataSelectTd.appendChild(dataSelect);
				levelTr.appendChild(dataSelectTd);
			};
		};
	};
	
	NodeManager.prototype.removeUnwantedSiblings = function(depth){
		var parent = document.getElementById('selectTable');
		for(t=depth;t<this.structureElements.length;t++){
			var currentRow = document.getElementById('level' + t);
			if(currentRow!=null){
				parent.removeChild(currentRow);
			};
		};
	};