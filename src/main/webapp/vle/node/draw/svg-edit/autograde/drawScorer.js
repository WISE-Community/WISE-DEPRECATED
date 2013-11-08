var DrawScorer = function() {
    //Distance that can separate atoms and still have them be part of the same molecule
    const epsilonForLooseMolecules = 10.0;
    
    //The system tries to name remaining atoms that are not all part of one connected component that
    //maps to one molecule. This is the maximum number of atoms that the system will try to combine
    //into molecules in this way.
    //TODO: Change the ordering of the CSP to make it possible for this number to be larger without massive speed issues
    const maxUnnamedComponentsToSearch = 12;
    
    //Maximum distance between two atoms' centers for those atoms to still be considered identically placed
    const identicalAtomDistance = 3;
    
    //Slight hack. Many stamps have bounding boxes that are larger than the images they contain, leaving exra white space.
    //This is a rough measure of how much extra white space there is on a side. (Does not account for the fact that amount
    //of extra space may vary based on location - side versus corner)
    const clippingDistance = 0;
    
    //All of the images we're processing
    this.uncompressedSVGStrings;
    
    //Number of images
    this.imageCount = 0;
    
    //XML specification for this problem. xmlDoc is the actual spec; atoms and molecules are preprocessed.
    this.xmlSpecInfo = {
        "xmlDoc": null,
        "atoms": null,
        "molecules" : null,
    };
    
    //Decompresser
    var lz77 = new LZ77();
    
    //Get the name of this problem from the XML spec. Returns a string.
    this.getProblemName = function() {
        return this.xmlSpecInfo.xmlDoc.getElementsByTagName("problemDescription")[0].getAttribute("name");
    }
    
    //Get the description of this problem from the XML spec. Returns a string.
    this.getProblemDescription = function() {
        return this.xmlSpecInfo.xmlDoc.getElementsByTagName("problemDescription")[0].childNodes[0].nodeValue;
    }
    
    //Assumes that scoring has already been run, and returns the number of images seen as correct
    this.getTotalCorrect = function() {
        var totalCorrect = 0;
        for(var i = 0; i < this.imageCount; i++) {            
            if(this.uncompressedSVGStrings[i].isCorrect) {
                totalCorrect++;
            }
        }
        return totalCorrect;
    }
    
    //Scores the drawing represented by curImageString, decompressing if necessary. Returns an object with the score as well
    //as relevant quantities (atoms, molecules) annotated.
    this.scoreDrawing = function(curImageString) {
        if (typeof(curImageString) == "string" && curImageString.trim().match(/^--lz77--/)) {
            return this.scoreCompressedDrawing(curImageString);
        } else {
            return this.scoreUncompressedDrawing(curImageString);
        }
    }
    
    //Decompresses the given string and then scores it. Returns an object with the score as well
    //as relevant quantities (atoms, molecules) annotated.
    this.scoreCompressedDrawing = function(curImageString) {
        curImageString = curImageString.trim().replace(/^--lz77--/,"");
        var uncompressedString = lz77.decompress(curImageString);
        curImageString = $.parseJSON(lz77.decompress(curImageString));
        return this.scoreUncompressedDrawing(curImageString);
    }
    
    //Scores the drawing represented by svgFullObject. Returns an object with the score as well
    //as relevant quantities (atoms, molecules) annotated.
    this.scoreUncompressedDrawing = function(svgFullObject) {
        for(var j = 0; j < svgFullObject.snapshots.length; j++) {
            svgFullObject.snapshots[j].xmlDoc = $.parseXML(svgFullObject.snapshots[j].svg);
            this.removeDuplicateImages(svgFullObject.snapshots[j]);
            this.removeOffscreenImages(svgFullObject.snapshots[j]);
            this.removeConcealedImages(svgFullObject.snapshots[j]);
            
            this.getAtoms(svgFullObject.snapshots[j]);
            this.getAllStrictMolecules(svgFullObject.snapshots[j]);
            this.nameAllMolecules(svgFullObject.snapshots[j]);
            if(svgFullObject.snapshots[j].unnamedComponents.length > 0) {
                this.getAllLooseMolecules(svgFullObject.snapshots[j]);
                // var atomSets = this.findAllPossibleMoleculeSets(combineUnnamedComponentsIntoAtomList(svgFullObject.snapshots[j].unnamedComponents));
                // var atomSetMatched = this.tryToMatchAtomSet(atomSets, svgFullObject.snapshots[j]);
                // if(atomSetMatched == null) {
                //     this.tryToMatchOverlappingAtomSet(atomSets, svgFullObject.snapshots[j]);
                // }
                
            } else {
                svgFullObject.snapshots[j].allMoleculesMatched = true;
            }
        }
        svgFullObject.isCorrect = this.checkCorrect(svgFullObject);
        this.assignRubricScore(svgFullObject);
        
        /*
         * remove variables set into the svgFullObject.snapshots that were used
         * for calculating the score
         */
        for(var j = 0; j < svgFullObject.snapshots.length; j++) {
        	delete svgFullObject.snapshots[j]['allMoleculesMatched'];
        	delete svgFullObject.snapshots[j]['atoms'];
        	delete svgFullObject.snapshots[j]['connectedComponents'];
        	delete svgFullObject.snapshots[j]['looselyMatchedComponents'];
        	delete svgFullObject.snapshots[j]['molecules'];
        	delete svgFullObject.snapshots[j]['overlappingComponents'];
        	delete svgFullObject.snapshots[j]['searchTerminated'];
        	delete svgFullObject.snapshots[j]['unnamedComponents'];
        	delete svgFullObject.snapshots[j]['xmlDoc'];
        }
        
        //remove variables set into the svgFullObject used for calculating the score
        delete svgFullObject['hasFrames'];
        delete svgFullObject['hasAtoms'];
        delete svgFullObject['hasMolecules'];
        delete svgFullObject['isCorrect'];
        
        return svgFullObject;
    }
    
    //Takes in an array of compressed svg strings and scores each of them
    this.uncompressSVGFromFile = function(arrayOfImages) {
        imageCount = 0;
        this.uncompressedSVGStrings = new Array(arrayOfImages.length);
        for(var i = 0; i < arrayOfImages.length; i++) {
            var curImageString = arrayOfImages[i].trim();
            if(curImageString.length == 0) {
                continue;
            }
            this.uncompressedSVGStrings[imageCount] = this.scoreDrawing(curImageString);
            imageCount++;
        }
        this.imageCount = imageCount;
    }
    
    //Takes in an array of compressed svg strings and scores each of them. Also adds fields for the workgroup and wiseid.
    this.uncompressSVGFromFileWithIDs = function(arrayOfImages, wiseIDs) {
        imageCount = 0;
        this.uncompressedSVGStrings = new Array(arrayOfImages.length);
        for(var i = 0; i < arrayOfImages.length; i++) {
            var curImageString = arrayOfImages[i].trim();
            if(curImageString.length == 0) {
                continue;
            }
            var curWISEIDs = wiseIDs[i].split("\t");
            
            this.uncompressedSVGStrings[imageCount] = this.scoreDrawing(curImageString);
            this.uncompressedSVGStrings[imageCount].workgroup = curWISEIDs[0];
            this.uncompressedSVGStrings[imageCount].wiseid = curWISEIDs[1];
            imageCount++;
        }
        this.imageCount = imageCount;
    }
    
    
    //Compares the given drawing object (contains both frames and has already been annotatd) to the rubric
    //to assign a numerical integer score. This score is annotated on the object, and returned.
    //Right now, we just have a hard coded rubric - could think about changing that to allow rubrics
    //to be specified in the XML for the problem.
    // Version of rubric from October 2012
    this.assignMethaneRubricScore = function(svgFullObject) {
        rubricScore = {
        	score:-1,
        	key:'-1'
        };
        if(svgFullObject.isCorrect) {//5 for correct, then work up from the bottom
            rubricScore = {
            	score:5,
            	key:'5'
            };
        } else if(!svgFullObject.hasFrames || someFramesLackImages(svgFullObject)) {//Interface issues get a 0
            rubricScore = {
            	score:0,
            	key:'0'
            };
        } else if(this.atomsAddedOrDeletedBetweenFrames(svgFullObject)) {//Lack of particle conservation is a 1
            rubricScore = {
            	score:1,
            	key:'1'
            }
        } else {
            //First, do they have the wrong number of CH_{4} in reactants?
            if(!this.frameHasDesiredMoleculeByName(svgFullObject,0,"CH4")) {
            	//wrong number of CH4 in reactants frame
            	rubricScore = {
            		score:2,
            		key:'2 Case 1'
            	}
            } else if(!this.frameHasDesiredMoleculeByName(svgFullObject,0,"O2")) {
            	rubricScore = {
                	score:2,
                	key:'2 Case 2'
                };
            } else if(!this.frameHasOverlappingDesiredMolecules(svgFullObject,0)) {//Now we know you have the right number of CH4, O2 - check if there's nothing extra
            	rubricScore = {
                	score:2,
                	key:'2 Case 3'
                };
            } else {
                if(!this.frameHasOverlappingDesiredMolecules(svgFullObject,1)) {//reactants are right, but products are not
                	rubricScore = {
                    	score:3,
                    	key:'3'
                    };
                } else {
                	rubricScore = {
                    	score:4,
                    	key:'4'
                    };
                }
            }
        }  
        svgFullObject.rubricScore = rubricScore;
        return rubricScore;
    }
    
    //Compares the given drawing object (contains both frames and has already been annotatd) to the rubric
    //to assign a numerical integer score. This score is annotated on the object, and returned.
    //Right now, we just have a hard coded rubric - could think about changing that to allow rubrics
    //to be specified in the XML for the problem.
    // Version of rubric from October 2012
    this.assignEthaneRubricScore = function(svgFullObject) {
        rubricScore = {
        	score:-1,
       		key:'-1'
       	};
        if(svgFullObject.isCorrect) {//5 for correct, then work up from the bottom
            rubricScore = {
            	score:5,
            	key:'5'
            };
        } else if(!svgFullObject.hasFrames || someFramesLackImages(svgFullObject)) {//Interface issues get a 0
            rubricScore = {
            	score:0,
            	key:'0'
            };
        } else if(this.atomsAddedOrDeletedBetweenFrames(svgFullObject)) {//Lack of particle conservation is a 1
            rubricScore = {
            	score:1,
            	key:'1'
            };
        } else {
            //First, do they have the wrong number of desired reactants?
            if(!this.frameHasDesiredMoleculeByName(svgFullObject,0,"C2H6") || !this.frameHasDesiredMoleculeByName(svgFullObject,0,"O2")) {
            	rubricScore = {
                	score:2,
                	key:'2 Case 1'
                };//wrong number of C2H6 or O2 in reactants frame
            } else if(!this.frameHasOverlappingDesiredMolecules(svgFullObject,0)) {
            	rubricScore = {
                	score:2,
                	key:'2 Case 2'
                };
            } else {
                if(!this.frameHasOverlappingDesiredMolecules(svgFullObject,1)) {//reactants are right, but products are not
                	rubricScore = {
                    	score:3,
                    	key:'3'
                    };
                } else {
                	rubricScore = {
                    	score:4,
                    	key:'4'
                    };
                }
            }
        }  
        svgFullObject.rubricScore = rubricScore;
        return rubricScore;
    }

    this.assignRubricScore = function(svgFullObject) {
        problemName = this.getProblemName();
        if(problemName == "Combust Methane") {
            return this.assignMethaneRubricScore(svgFullObject);
        } else if(problemName == "Combust Ethane"){
            return this.assignEthaneRubricScore(svgFullObject);
        } else {
            return this.assignRubricScoreOriginal(svgFullObject);
        }
    }
    
    //Compares the given drawing object (contains both frames and has already been annotatd) to the rubric
    //to assign a numerical integer score. This score is annotated on the object, and returned.
    //Right now, we just have a hard coded rubric - could think about changing that to allow rubrics
    //to be specified in the XML for the problem.
    //This is the old version used for studies prior to September 2012 - it assigned on the original 1-5 rubric
    this.assignRubricScoreOriginal = function(svgFullObject) {
        rubricScore = -1;
        if(svgFullObject.isCorrect) {//5 for correct, then work up from the bottom
            rubricScore = 5;
        } else if(!svgFullObject.hasFrames || someFramesLackImages(svgFullObject)) {//Interface issues get a 0
            rubricScore = 0;
        } else if(this.atomsAddedOrDeletedBetweenFrames(svgFullObject)) {//Lack of particle conservation is a 1
            rubricScore = 1;
        } else {
            //have to distinguish between having bad molecules and having overlapping molecules
            if(hasNonOverlappingUnnamedComponents(svgFullObject)) {
                //Want to mark the object if we're unsure. Uncertainty is indicated by having terminated
                //our search to match overlapping molecules (so there may exist correct atom groupings
                //that we missed), and having the correct atoms and no wrong molecules.
                if(hasAnyEarlySearchTermination(svgFullObject)) { //&& svgFullObject.hasAtoms) {// && this.hasNoUndesiredMolecules(svgFullObject)) {
                    svgFullObject.scoreUncertain = true;
                }
                rubricScore = 2;//have bad molecules that we didn't match as overlapping
            } else {
                //need to add up the molecule objects
                var allFramesCorrect = true;
                for(var i = 0; i < svgFullObject.snapshots.length; i++) {
                    if(!this.frameHasOverlappingDesiredMolecules(svgFullObject,i)) {
                        allFramesCorrect = false;
                        break;
                    }
                }
                if(allFramesCorrect) {
                    rubricScore = 4;
                } else {
                    rubricScore = 3;
                }
            }
        }
        svgFullObject.rubricScore = rubricScore;
        return rubricScore;
    }
    
    

    
    
    //Assumes svgFullObject has been annotated, and checks whether any frames
    //have molecules that overlap with another. If so, returns true. 
    function hasAnyOverlappingMolecules(svgFullObject) {
        for(var i = 0; i < svgFullObject.snapshots.length; i++) {
            if(typeof(svgFullObject.snapshots[i].overlappingMolecules) != "undefined") {
                return true;
            }
        }
        return false;
    }
    
    //Assumes svgFullObject has been annotated with whether search had to be terminated early, and
    //checks whether any frames had the search terminated early.
    function hasAnyEarlySearchTermination(svgFullObject) {
        for(var i = 0; i < svgFullObject.snapshots.length; i++) {
            if(svgFullObject.snapshots[i].searchTerminated) {
                return true;
            }
        }
        return false;
    }
    
    //Right now, we insist on complete atom sets, so we couldn't get this condition if there are any
    //overappping molecules. However, one could imagine wanting to change that, making checking this condition
    //necessary.
    function hasNonOverlappingUnnamedComponents(svgFullObject) {
        for(var i = 0; i < svgFullObject.snapshots.length; i++) {
            if(frameHasNonOverlappingUnnamedComponents(svgFullObject, i)) {
                return true;
            }
        }
        return false;
    }
    
    
    //Returns true if there are grouped atoms that couldn't be matched to allowable molecules
    //in the XML spec. Does not include atoms that may be grouped but have been classified as 
    //multiple overlapping named molecules.
    function frameHasNonOverlappingUnnamedComponents(svgFullObject, frameID) {
        return !svgFullObject.snapshots[frameID].allMoleculesMatched;
        // return (svgFullObject.snapshots[frameID].unnamedComponents.length > 0 &&
        //                (typeof(svgFullObject.snapshots[frameID].overlappingMolecules) == "undefined" ||
        //                (typeof(svgFullObject.snapshots[frameID].overlappingMolecules) != "undefined" 
        //                && svgFullObject.snapshots[frameID].unnamedComponents != svgFullObject.snapshots[frameID].overlappingComponents)));            
    }
    
    //Reurns true if there are frames that don't have any stamps.
    function someFramesLackImages(svgFullObject) {
        for(var i = 0; i < svgFullObject.snapshots.length; i++) {
            var images = getImageChildrenOfStudentDrawing(svgFullObject.snapshots[i].xmlDoc);
            if(typeof(images) == "undefined" || images.length == 0) {
                return true;
            }
        }
        return false;
    }
    
    //Takes in a list of image lists, and combines them into one big list of images.
    function combineUnnamedComponentsIntoAtomList(unnamedComponents) {
        var listSoFar = new Array();
        for(var i = 0; i < unnamedComponents.length; i++) {
            listSoFar = listSoFar.concat(unnamedComponents[i]);
        }
        return listSoFar;
    }
    
    
    //atomSet is a list of molecule names (strings). This returns a list with the corresponding
    //doc info (in xml) for those named molecules.
    this.turnAtomSetIntoMoleculeList = function(atomSet) {
        var moleculeList = new Array();
        for(moleculeName in atomSet) {
            for(var i = 0; i < atomSet[moleculeName]; i++) {
                moleculeList.push(this.getMoleculeNodeByName(moleculeName));
            }
        }
        return moleculeList;
    }
    
    //Want to find what possible molecules might be formed from the remaining images. We want
    //to find the possible that could be formed from exactly the number of atoms and types of
    //atoms we have in the images
    //This is a variation on the knapsack problem.
    this.findAllPossibleMoleculeSets = function(listOfImages) {
        var atomNames = this.getAtomsGivenImages(listOfImages);
        var molSoFar = new Object();
        for(var i = 0; i < this.xmlSpecInfo.molecules.length; i++) {
        	if(this.xmlSpecInfo.molecules[i].getAttribute) {
        		molSoFar[this.xmlSpecInfo.molecules[i].getAttribute('name')] = 0;        		
        	}
        }
        var allSets = new Array();        
        return this.addMolecules(0, atomNames, molSoFar, allSets);
        
    }
    
    
    //Recursive function that turns "curAtomList" into all the possible molecule sets that could
    //be made from exactly those atoms. For instance, 4H, 4O, and 1C could be made into CH4 and 2O2,
    //or CO2 and 2H2O. This function would return both of those sets.
    this.addMolecules = function(indexForMoleculeToAdd, curAtomList, molSoFar, allSets) {
        if(indexForMoleculeToAdd >= this.xmlSpecInfo.molecules.length) {
            return allSets;
        }
        var atomsInMolecule = this.xmlSpecInfo.molecules[indexForMoleculeToAdd].getElementsByTagName("atom");
       for(var numToAdd = 0; numToAdd < 20; numToAdd++) {//we'll break out in the list
            var feasible = true;
            var atomsUsed = new Object();
            var newAtomList = copyAssociativeArray(curAtomList);//$.extend(true, {}, curAtomList);
            for(var i = 0; i < atomsInMolecule.length; i++) {
                var curAtomName = getAtomName(atomsInMolecule[i]);
                newAtomList[curAtomName] -= numToAdd;
                if(newAtomList[curAtomName] < 0) {
                    feasible = false;
                    break;
                }
            }
            if(feasible) {//recurse with this number of the molecule added
                var newMolSoFar = copyAssociativeArray(molSoFar);//$.extend(true, {}, molSoFar);
                newMolSoFar[this.xmlSpecInfo.molecules[indexForMoleculeToAdd].getAttribute('name')] += numToAdd;
                if(getSumOfAssociativeArray(newAtomList) == 0) {//we've used all the molecules
                    allSets.push(newMolSoFar);
                } else {
                    this.addMolecules(indexForMoleculeToAdd + 1, newAtomList, newMolSoFar, allSets);
                }
            } else {
                break;//if this isn't feasible, adding even more certainly won't be feasible
            }
        }
        return allSets;
    }
    
    //Utility function that assumes the fields in the object countsToSubtract are
    //also present in arrayToSubtract from, and that in both cases the object maps
    //from field names to counts. The counts in countsToSubtract are subtracted from arrayToSubtractFrom
    function subtractFromAssociativeArray(arrayToSubtractFrom, countsToSubtract) {
        for(var item in countsToSubtract) {
            arrayToSubtractFrom[item] -= countsToSubtract[item];
        }
        return arrayToSubtractFrom;
    }
    
    //Assumes arrayToCopy is an object with fields, and makes a copy.
    function copyAssociativeArray(arrayToCopy) {
        var newArray = new Object();
        for(var item in arrayToCopy) {
            newArray[item] = arrayToCopy[item];
        }
        return newArray;
    }
    
    //Sums up the counts of the fields in obj.
    function getSumOfAssociativeArray(obj) {
        var total = 0;
        for(var field in obj) {
            total += obj[field];
        }
        return total;
    }
    
    
    //For each pair of atoms in the connected components, finds the distance between
    //their centers minus each of their radii (i.e., the distance between their edges).
    //Returns the smallest such pairwise distance.
    function findSmallestDistance(connectedComponent1, connectedComponent2) {
        var minDistance = 100000;
        for(var i = 0; i < connectedComponent1.length; i++) {
            for(var j = 0; j < connectedComponent2.length; j++) {
                var curDistance = findCircularDistance(connectedComponent1[i], connectedComponent2[j]);
                if(curDistance < minDistance) {
                    minDistance = curDistance;
                }
            }
        }    
        return minDistance;
    }
    
    //Finds the distance between the images' centers minus each of their radii (i.e., the distance between their edges).
    function findCircularDistance(imageNode1, imageNode2) {
        var center1 = getCenter(imageNode1);
        var center2 = getCenter(imageNode2);
        var radius1 = (+imageNode1.getAttribute("width")/2);//we assume these are circular, so choice of width or height doesn't matter
        var radius2 = (+imageNode2.getAttribute("width")/2);
        return findCenterDistance(center1, center2) - (radius1+radius2);
    }
    
    //Tries to name all of the molecules in the svg. Assumes the connected components have already been calculated.
    //Adds several fields to the svg: molecules - object with the names and counts of all molecules for which matches
    //could be found; unnamedComponents - an array with the connected components that couldn't be named
    //Assumes strict touching
    this.nameAllMolecules = function(svg) {
        var molecules = new Object();
        var unnamedComponents = new Array();
        for (var i = 0; i < this.xmlSpecInfo.molecules.length; i++) {
        	if(this.xmlSpecInfo.molecules[i].getAttribute != null) {
        		molecules[this.xmlSpecInfo.molecules[i].getAttribute('name')] = 0;        		
        	}
        }
        for(var i = 0; i < svg.connectedComponents.length; i++) {
           var name = this.matchMoleculeToComponent(svg.connectedComponents[i], this.xmlSpecInfo.molecules, false);
           if(name != null) {
               molecules[name]++;
           } else {
               unnamedComponents.push(svg.connectedComponents[i]);
           }
        }
        svg.molecules = molecules;
        svg.unnamedComponents = unnamedComponents;
    }
    
    // this.tryToMatchAllUnmatchedComponents = function(svg) {
    //     
    // }
    
    //Takes in the possible sets of molecules that could be made from the atoms in unnamed components in the svg (as
    //the list atomSets), and determines if the atoms are correctly configured to match any of these sets. If so,
    //that set is returned. Otherwise, null is returned. If a match is found, svg is annotated with the match.
    this.tryToMatchAtomSet = function(atomSets, svg) {
        result = this.tryToMatchAtomSetHelper(atomsSets,svg,combineUnnamedComponentsIntoAtomList(svg.unnamedComponents),true);
        if(result != null) {
            svg.looselyMatchedComponents = svg.unnamedComponents;
            svg.unnamedComponents = new Array();//clear the list
        }
        return result;
    }
    
    
    //Takes in the possible sets of molecules that could be made from the atoms in unnamed components in the svg (as
    //the list atomSets), and determines if the atoms are correctly configured to match any of these sets. If so,
    //that set is returned. Otherwise, null is returned. If a match is found, svg is annotated with the match.
    this.tryToMatchAtomSetHelper = function(atomSets, svg, listOfNodes, enforceOverlappingConstraints) {
        for(var i = 0; i < atomSets.length; i++) {
            //we can omit initial checks for atom identity as we assume those were done to make "atomSets"
            var unassignedNodes = listOfNodes;
            var allUnnamedComponents = listOfNodes.slice(0);
            if(allUnnamedComponents.length > maxUnnamedComponentsToSearch) {
                svg.searchTerminated = true;
                return null;//too big to compute quickly
            } else {
                svg.searchTerminated = false;
            }
            var moleculesArray = this.turnAtomSetIntoMoleculeList(atomSets[i]);
            var partialAssignments = new Array();
            for(var molNum = 0; molNum < moleculesArray.length; molNum++) {
                partialAssignments.push(new Object());
            }
            var finalAssignment = this.backtrackingCSPSolverForMoleculeMatching(partialAssignments, unassignedNodes, allUnnamedComponents, moleculesArray,true, enforceOverlappingConstraints);
            if(countAllAssignments(partialAssignments) == unassignedNodes.length) {
                for(curAtom in atomSets[i]) {
                    svg.molecules[curAtom] += atomSets[i][curAtom];
                }
                // svg.looselyMatchedComponents = svg.unnamedComponents;
                // svg.unnamedComponents = new Array();//clear the list
                return atomSets[i];
            }
        }
        return null;
    }
    
    //Similar to tryToMatchAtomSet, except now overlaps in molecules are not counted as configuration problems.
    //If match is found, svg is annotated and the match is returned.
    this.tryToMatchOverlappingAtomSetHelper = function(atomSets, svg, listOfNodes) {
        return this.tryToMatchAtomSetHelper(atomSets, svg, listOfNodes, false);
    }
    
    //Similar to tryToMatchAtomSet, except now overlaps in molecules are not counted as configuration problems.
    //If match is found, svg is annotated and the match is returned.
    this.tryToMatchOverlappingAtomSet = function(atomSets, svg) {
        var atomSetFound = tryToMatchOverlappingAtomSetHelper(atomSets, svg, combineUnnamedComponentsIntoAtomList(svg.unnamedComponents));
        if(atomSetFound != null) {
            svg.overlappingMolecules = overlappingMolecules;
            svg.overlappingComponents = svg.unnamedComponents;
        }
        return atomSetFound;
        // 
        // for(var i = 0; i < atomSets.length; i++) {
        //     //we can omit initial checks for atom identity as we assume those were done to make "atomSets"
        //     var unassignedNodes = combineUnnamedComponentsIntoAtomList(svg.unnamedComponents);
        //     var allUnnamedComponents = combineUnnamedComponentsIntoAtomList(svg.unnamedComponents);
        //     if(allUnnamedComponents.length > maxUnnamedComponentsToSearch) {
        //         return null;//too big to compute quickly
        //     }
        //     var moleculesArray = this.turnAtomSetIntoMoleculeList(atomSets[i]);
        //     var partialAssignments = new Array();
        //     for(var molNum = 0; molNum < moleculesArray.length; molNum++) {
        //         partialAssignments.push(new Object());
        //     }
        //     var overlappingMolecules = new Object();
        //     for (var j = 0; j < this.xmlSpecInfo.molecules.length; j++) {
        //         overlappingMolecules[this.xmlSpecInfo.molecules[j].getAttribute('name')] = 0;
        //     }
        //     var finalAssignment = this.backtrackingCSPSolverForMoleculeMatching(partialAssignments, unassignedNodes, allUnnamedComponents, moleculesArray,true, false);
        //     if(countAllAssignments(partialAssignments) == unassignedNodes.length) {
        //         for(curAtom in atomSets[i]) {
        //             overlappingMolecules[curAtom] += atomSets[i][curAtom];
        //         }
        //         svg.overlappingMolecules = overlappingMolecules;
        //         svg.overlappingComponents = svg.unnamedComponents;
        //         //svg.unnamedComponents = new Array();//clear the list
        //         return atomSets[i];
        //     }
        // }
        // return null;
    }
    
    //Checks if any frame has molecules that were "loosely matched" - i.e., had large spaces between the atoms.
    this.hasLooselyMatchedMolecules = function(drawingIndex, frameNumber) {
        var hasFrame = typeof(scorer.uncompressedSVGStrings[drawingIndex].snapshots[frameNumber]) != "undefined";
        var hasComponents = false;
        if(hasFrame) {
            hasComponents = typeof(scorer.uncompressedSVGStrings[drawingIndex].snapshots[frameNumber].looselyMatchedComponents) != "undefined"; 
        }
        return hasFrame && hasComponents;        
    }

    //Convenience method for writing debug messages
    function writeObj(obj, message) {
      if (!message) { message = obj; }
      var details = "*****************" + "\n" + message + "\n";
      var fieldContents;
      for (var field in obj) {
        fieldContents = obj[field];
        if (typeof(fieldContents) == "function") {
          fieldContents = "(function)";
        }
        details += "  " + field + ": " + fieldContents + "\n";
      }
      console.log(details);
    }

    //Parses the xml problem specification and saves it as xmlSpecInfo.
    this.parseXMLSpec = function(xmlFileName) {
        this.xmlSpecInfo.xmlDoc = loadXMLDoc(xmlFileName);
        //Traverse the children so we can store the atom names and images
        //This traversal might be done more easily with "getElementsByTagName" or with jquery, but I couldn't get either to work
        var rootChildren = this.xmlSpecInfo.xmlDoc.documentElement.childNodes;
        for(i=0; i < rootChildren.length; i++) {
            if(rootChildren[i].nodeType == 1) {
                if(rootChildren[i].nodeName == ("atoms")) {
                    //Traverse the children so we can store the atom names and images
                    this.xmlSpecInfo.atoms = new Object();
                    var atomsChildren = rootChildren[i].childNodes;
                    for(j = 0; j < atomsChildren.length; j++) {
                        if(atomsChildren[j].nodeType == 1) {
                            //Store the image string as the key and the name as the value
                            var imageList = atomsChildren[j].getElementsByTagName("image");
                            for(var k = 0; k < imageList.length; k++) {
                                this.xmlSpecInfo.atoms[imageList[k].childNodes[0].nodeValue] = atomsChildren[j].getAttribute("name");
                            }
                            
                        }
                    }
                } else if(rootChildren[i].nodeName == "molecules") {//For now, we're just going to store the list of nodes
                	this.xmlSpecInfo.molecules = getChildNodesThatAreNotTextNodes(rootChildren[i]);
                }
            }
        }
    }


    // Tries to find a name for the component by seeing if it matches any of our named molecules.
    // Pseudo-code:
    // for each molecule:
    //      check if molecule and connected component have the same number of atoms - if not, return false (NOTE: this is something that could be modified to look at potentially overlapping molecules)
    //      check if molecule and connected component have the same number of each type of atom - if not, return false (NOTE: see note above; this is done sequentially to rule things out quickly)
    //      perform a DFS to match each atom in the connected component to a role in the molecule. Should only try
    //          matches that are for the right molecule, and at each step, should check that the appropriate touches
    //          relations are fulfilled (more pseudo-code version below - this is a backtracking solution for DFS)
    //      currentAssignments = (none)
    //      call below method recursively, starting with all atoms unassigned; keep a record of assigned atoms
    //      for each unassigned atom in connected component
    //          make list of all possible ids for atom from molecule (need to match on atom name)
    //          for each id
    //              assign atom id
    //              check touches constraints for molecule - if there are touches constraints where both values are assigned but the constraint is violated, remove assignment and continue;
    //                  note that above line can be accomplished by just checking the constraints for this last assignment
    //              call method with remaining unassigned atoms, and current assigned atom
    //              if call returns null, remove assignment and continue
    //          if atom doesn't get assigned, return null
    //      if all atoms assigned, return the assignment; otherwise, return null (no match)
    this.matchMoleculeToComponent = function(connectedComponent, molecules, useLooseTouching) {
        for(var i = 0; i < molecules.length; i++) {
        	if(molecules[i].getElementsByTagName) {
                var atomsInMolecule = molecules[i].getElementsByTagName("atom");
                if(atomsInMolecule.length != connectedComponent.length) {
                    continue;
                }
                if(!this.checkMatchingAtomTypes(connectedComponent, molecules[i])) {
                    continue;
                }
                // now do the backtracking DFS search (this is the potentially expensive part)
                var unassignedNodes = new Array();
                for(var j = 0; j < connectedComponent.length; j++) {
                    unassignedNodes.push(connectedComponent[j]);
                }
                var partialAssignments = new Array();
                partialAssignments.push(new Object());
                var moleculesArray = new Array();
                moleculesArray.push(molecules[i]);
                var finalAssignment = this.backtrackingCSPSolverForMoleculeMatching(partialAssignments, unassignedNodes, connectedComponent, moleculesArray,useLooseTouching,true);
                if(countAllAssignments(finalAssignment) == unassignedNodes.length) {
                    return molecules[i].getAttribute('name');
                }        		
        	}
        }
        return null;//no molecules matched
    }
    

    //Implements a constraint satisfaction solver. See matchMoleculeToComponent for algorithm.
    //TODO: Consider making the ordering smarter and using something like arc consistency or another algorithm
    //to backtrack more quickly. This would improve speed and allow us to solve larger CSPs.
    this.backtrackingCSPSolverForMoleculeMatching = function(partialAssignments, unassignedNodes, allImagesToAssign, molecules, useLooseTouching, enforceNoOverlappingMolecules) {
        if(unassignedNodes.length == 0) {
            return partialAssignments;//partialAssignment is actually a full and correct assignment
        }
        
        var curImageNode = unassignedNodes.pop();
        for(var moleculeNum = 0; moleculeNum < molecules.length; moleculeNum++) {
            var molecule = molecules[moleculeNum];
            var atomsInMolecule = molecule.getElementsByTagName("atom");
            for(var i = 0; i < atomsInMolecule.length; i++) {
                //check if it's a valid assignment - needs to not be already assigned, have the same atom identity, 
                //and meet touches constraints
                if(typeof(partialAssignments[moleculeNum][atomsInMolecule[i].getAttribute('id')]) != "undefined" 
                    || getAtomName(atomsInMolecule[i]) != this.getAtomNameFromImage(curImageNode)
                    || (enforceNoOverlappingMolecules && this.touchesOtherMolecules(curImageNode, moleculeNum, partialAssignments))) {
                    continue;//is either already assigned or doesn't meet identity constraint
                }
                //now go through the constraints
                var touchesConstraints = atomsInMolecule[i].getElementsByTagName("touches");
                var touchesConstraintsAreMet = true;
                for(var j = 0; j < touchesConstraints.length; j++) {
                    if(typeof(partialAssignments[moleculeNum][touchesConstraints[j].childNodes[0].nodeValue]) != "undefined") { //&& partialAssignments[moleculeNum][atomsInMolecule[i].getAttribute('id')] != undefined) {
                        //there is already an assignment to this node
                        var assignedNode = partialAssignments[moleculeNum][touchesConstraints[j].childNodes[0].nodeValue];
                        if(useLooseTouching) {
                            if(!areLooselyTouchingCircular(assignedNode, curImageNode)) {
                                touchesConstraintsAreMet = false;
                                break;
                            }
                        } else if(!areTouchingCircular(assignedNode, curImageNode)) {
                            touchesConstraintsAreMet = false; 
                            break;
                        }
                    }
                }
                if(!touchesConstraintsAreMet) {
                    continue;
                }
                // all constraints met, this is a good assignment
                partialAssignments[moleculeNum][atomsInMolecule[i].getAttribute('id')] = curImageNode;
                partialAssignments = this.backtrackingCSPSolverForMoleculeMatching(partialAssignments, unassignedNodes, allImagesToAssign, molecules,useLooseTouching,enforceNoOverlappingMolecules);
                if(countAllAssignments(partialAssignments) == allImagesToAssign.length) {//count whether everything is assigned - otherwise, need to backtrack
                    break;
                } else {
                    partialAssignments[moleculeNum][atomsInMolecule[i].getAttribute('id')] = undefined;
                }
            }
        }
        unassignedNodes.push(curImageNode);
        return partialAssignments;
    }
    
    //Checks whether imageNode, which is being considered for assignment into the moleculeIndex'th molecule,
    //touches atoms that are assigned to other molecules.
    this.touchesOtherMolecules = function(imageNode, moleculeIndex, partialAssignments) {
        for(var i = 0; i < partialAssignments.length; i++) {
            if(i == moleculeIndex) {
                continue;
            } else {
                //can't touch any atoms in other molecules
                for(curAssignment in partialAssignments[i]) {
                    if(typeof(partialAssignments[i][curAssignment]) == "undefined") {
                        continue;
                    }
                    if(areTouchingCircularStricter(partialAssignments[i][curAssignment], imageNode)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    //Returns an object that has fields equal to each of the allowed atom names in the XML spec. Sets
    //the count for each of these fields to 0.
    this.getObjectWithAtomNames = function() {
        var atoms = new Object();
        for (var field in this.xmlSpecInfo.atoms) {
            atoms[this.xmlSpecInfo.atoms[field]] = 0;
        }
        return atoms;
    }
    
    //Counts how many fields are present and assigned in partialAssignments
    function countAllAssignments(partialAssignments) {
        var total = 0;
        for(var i = 0; i < partialAssignments.length; i++) {
            total += countProperties(partialAssignments[i]);
        }
        return total;
    }
    
    //Counts how many fields object obj has that are not undefined, and returns the count.
    function countProperties(obj) {
        var count = 0;
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop) && typeof(obj[prop]) != "undefined"  && obj[prop] != "undefined")
                    ++count;
        }
        return count;
    }
    
    //Purely a convenience method to get the name of a particular atom (as specified in a problem spec xml file)
    function getAtomName(atomFromMoleculeSpec) {
        //return atomFromMoleculeSpec.getElementsByTagName("name")[0].childNodes[0].nodeValue;
        return atomFromMoleculeSpec.getAttribute('name');
    }
    
    //Gets the name from an SVG image node
    this.getAtomNameFromImage = function(imageNode) {
    	var atomName = '';
    	
    	//get the full path to the image
    	var fullFilePath = imageNode.getAttribute('xlink:href');
    	
    	if(fullFilePath != null) {
        	//get the file name of the image
        	var fileName = fullFilePath.substring(fullFilePath.lastIndexOf('/') + 1);
        	
        	//get the atom name associated with the file name
        	atomName = this.xmlSpecInfo.atoms[fileName];
    	}
    	
    	return atomName;
    }
    
    //Returns the XML for the named molecule
    this.getMoleculeNodeByName = function(moleculeName) {
        for(var i = 0; i < this.xmlSpecInfo.molecules.length; i++) {
            if(this.xmlSpecInfo.molecules[i].getAttribute('name') == moleculeName) {
                return this.xmlSpecInfo.molecules[i];
            }
        }
        return null;
    }
    
    //Returns an array with fields that are all the possible molecule names (from spec) and counts based on the
    //list of atoms (children of a molecule in the original xml spec)
    this.getAtomCountsFromMolecules = function(atomsInMolecule) {
        var atoms = new Object();
        for (var field in this.xmlSpecInfo.atoms) {
            atoms[this.xmlSpecInfo.atoms[field]] = 0;
        }
        for(var j = 0; j < atomsInMolecule.length; j++) {
            atoms[getAtomName(atomsInMolecule[j])]++;
        }
        return atoms;
    }
    
    //Returns true if the connectedComponent has the same atom names in the same amounts as the molecule
    this.checkMatchingAtomTypes = function(connectedComponent, molecule) {
        var atomsInMolecule = molecule.getElementsByTagName("atom");
         var atomNames = this.getAtomsGivenImages(connectedComponent);
         for(var j = 0; j < atomsInMolecule.length; j++) {
             atomNames[getAtomName(atomsInMolecule[j])]--;
         }
         for(atomName in atomNames) {
            if(atomNames[atomName] != 0) {
                return false;
            }
         }
         return true;
    }

    // svg is the object for this student's drawing. It contains an array svgXML that has the DOM representations
    // for each SVG string. This method looks for images for which we are given atom names in the original xml spec -
    // all other images are ignored.
    this.getAtoms = function(svg) {
        // get all the <image> elements in the student's svg drawing
        var $images = getImageChildrenOfStudentDrawing(svg.xmlDoc);//$svgXML.find('image');
        svg.atoms = this.getAtomsGivenImages($images);
    }
    
    //Removes images that are displayed entirely outside of the viewport, as these would not be viewable for
    //non-computerized grading (and students may not be aware that they still exist)
    this.removeOffscreenImages = function(svg) {
        var imagesToRemove = new Array();
        var images = getImageChildrenOfStudentDrawing(svg.xmlDoc);//$svgXML.find('image');
        var viewportHeight = +svg.xmlDoc.firstChild.getAttribute("height");
        var viewportWidth = +svg.xmlDoc.firstChild.getAttribute("width");
        
        for(var i = 0; i < images.length; i++) {
            var xRange = getXRange(images[i]);
            var yRange = getYRange(images[i]);
            //four conditions: too high, too low, too far left, too far right
            if((xRange[0] < 0 && xRange[1] < 0) ||
               (xRange[0] > viewportWidth && xRange[1] > viewportWidth) ||
               (yRange[0] < 0 && yRange[1] < 0) ||
               (yRange[0] > viewportHeight && yRange[1] > viewportHeight)) {
                   imagesToRemove.push(images[i]);
               } else if(images[i].hasAttribute("opacity") && images[i].getAttribute("opacity")=="0") {//might be transparent
                   imagesToRemove.push(images[i]);
               }
        }
        for(var i = 0; i < imagesToRemove.length; i++) {
            if(imagesToRemove[i].parentNode != null) {
                //writeObj(imagesToRemove[i].parentNode,"Parent node: ")
                
                imagesToRemove[i].parentNode.removeChild(imagesToRemove[i]);
            }
        } 
    }
    
    //Removes images that are completely covered by another image. Only deals with the case where one image
    //covers another, not cases where an image is completely covered by more than one image (and not by any
    //individual image)
    //TODO: could also handle cases where an image is concealed by something other than an image (e.g., a shape)
    this.removeConcealedImages = function(svg) {
        var imagesToRemove = new Array();
        var images = getImageChildrenOfStudentDrawing(svg.xmlDoc);//$svgXML.find('image');
        var viewportHeight = +svg.xmlDoc.firstChild.getAttribute("height");
        var viewportWidth = +svg.xmlDoc.firstChild.getAttribute("width");
        
        for(var i = 0; i < images.length; i++) {
            for(var j = i+1; j < images.length; j++) {
                //Circle on top must be at least as large as the circle beneath and R-d >= r,
                //where R is the radius of the top circle, r is the radius of the bottom circle, and d
                //is the distance between their centers
                var centerDistance = findCenterDistanceFromImages(images[i],images[j]);
                var radius1 = (+images[i].getAttribute("width")/2);//we assume these are circular, so choice of width or height doesn't matter
                var radius2 = (+images[j].getAttribute("width")/2);
                if(radius2 >= radius1 && (radius2 - centerDistance) >= radius1) {
                    imagesToRemove.push(images[i]);
                }
            }
        }
        for(var i = 0; i < imagesToRemove.length; i++) {
            if(imagesToRemove[i].parentNode != null) {
                imagesToRemove[i].parentNode.removeChild(imagesToRemove[i]);
            }
        } 
    }
    
    //Removes images that have the same identity and are essentially in the same place as another image
    this.removeDuplicateImages = function(svg) {
        var imagesToRemove = new Array();
        var images = getImageChildrenOfStudentDrawing(svg.xmlDoc);//$svgXML.find('image');
        for(var i = 0; i < images.length; i++) {
            for(var j = i+1; j < images.length; j++) {
                var centerDistance = findCenterDistanceFromImages(images[i],images[j]);
                // if(centerDistance < 5){
                //     console.log("Center: " + centerDistance + "; " + images[i].getAttribute('id') + ", " + images[j].getAttribute('id'));
                // }
                if(findCenterDistanceFromImages(images[i],images[j]) <= identicalAtomDistance && this.getAtomNameFromImage(images[i]) == this.getAtomNameFromImage(images[j])) {
                    //console.log("identical: " + images[i].getAttribute('id') + ", " + images[j].getAttribute('id'));
                    imagesToRemove.push(images[j]);
                }
            }
        }
        for(var i = 0; i < imagesToRemove.length; i++) {
            if(imagesToRemove[i].parentNode != null) {                
                imagesToRemove[i].parentNode.removeChild(imagesToRemove[i]);
            }
        }

    }
    
    //Takes a list of images, and returns an object with fields equal to atom names and entries equal to number of
    //that atom name in the list of images.
    this.getAtomsGivenImages = function(images) {
        //initialize the components of the atoms object for this image - all counts should start at 0, fields should be the image names
        var atoms = new Object();
        for (var field in this.xmlSpecInfo.atoms) {
            atoms[this.xmlSpecInfo.atoms[field]] = 0;
        }
        for(var j = 0; j < images.length; j++) {
        	//get the full path to the image
        	var fullFilePath = images[j].getAttribute('xlink:href');
        	
        	if(fullFilePath != null) {
            	//get the file name of the image
            	var fileName = fullFilePath.substring(fullFilePath.lastIndexOf('/') + 1);
            	
                if (typeof(this.xmlSpecInfo.atoms[fileName]) != "undefined") {
                    var imageName = this.xmlSpecInfo.atoms[fileName];
                    atoms[imageName]++;
                }        		
        	}
        }
        return atoms;
    }
    
    //Gets the children of this xmlDoc that are images and have a sibling "title" that has value "student".
    //This is to separate out the background image
    function getImageChildrenOfStudentDrawing(xmlDoc) {
        $xmlDoc = $(xmlDoc);
        var gChildren = xmlDoc.getElementsByTagName('g');
        for (i=0; i < gChildren.length; i++) {
            if($(gChildren[i]).find('title').text() == "student") {
                return $(gChildren[i]).find('image');
            }
        }
        return new Array();
    }

    // Adds a field to the svg for molecules
    this.getAllStrictMolecules = function(svg) {
         $svgXML = $(svg.xmlDoc);
            // get all the <image> elements in the svg drawing
        //var $images = $svgXML.find('image');
        var $images = getImageChildrenOfStudentDrawing(svg.xmlDoc);
        // essentially here we need to find the connected components of the graph
        // we use a depth first search
        var checkedImages = new Array($images.length);
        
        var exploredImages = new Array();
        var connectedComponents = new Array();
        for(var i = 0; i < $images.length; i++) {
            if($.inArray($images[i], exploredImages) == -1) {
                curComponent = new Array();
                curComponent.push($images[i]);
                dfs($images[i], $images,exploredImages,curComponent);
                connectedComponents.push(curComponent); 
            }
        }
        svg.connectedComponents = connectedComponents;
    }
    
    // Adds a field to the svg for potential loose molecules
    this.getAllLooseMolecules = function(svg) {
         $svgXML = $(svg.xmlDoc);
            // get all the <image> elements in the svg drawing
        //var $images = $svgXML.find('image');
        var $images = combineUnnamedComponentsIntoAtomList(svg.unnamedComponents);
        // essentially here we need to find the loosely connected components of the graph
        // we use a depth first search
        var checkedImages = new Array($images.length);
        
        var exploredImages = new Array();
        var looselyConnectedComponents = new Array();
        for(var i = 0; i < $images.length; i++) {
            if($.inArray($images[i], exploredImages) == -1) {
                curComponent = new Array();
                curComponent.push($images[i]);
                dfsLooseTouching($images[i], $images,exploredImages,curComponent);
                looselyConnectedComponents.push(curComponent); 
            }
        }
        var matchedLooselyConnectedComponents = new Array();
        var matchedOverlappingComponents = new Array();
        for(var i = 0; i < looselyConnectedComponents.length; i++) {
            var atomSets = this.findAllPossibleMoleculeSets(looselyConnectedComponents[i]);
            var atomSetMatched = this.tryToMatchAtomSetHelper(atomSets, svg, looselyConnectedComponents[i],true);
            if(atomSetMatched == null) {
                var overlapMatch = this.tryToMatchOverlappingAtomSetHelper(atomSets, svg, looselyConnectedComponents[i]);
                if(overlapMatch != null) {
                    matchedOverlappingComponents.push(looselyConnectedComponents[i])
                }
            } else {
                matchedLooselyConnectedComponents.push(looselyConnectedComponents[i])
            }
        }
        //now clean up unnamed components and put annotate found molecules on the svg
        svg.looselyMatchedComponents = matchedLooselyConnectedComponents;
        if(matchedLooselyConnectedComponents.length == looselyConnectedComponents.length) {
            svg.unnamedComponents = new Array();//clear the list
        }
        svg.overlappingComponents = matchedOverlappingComponents;
        if(matchedLooselyConnectedComponents.length + matchedOverlappingComponents.length == looselyConnectedComponents.length) {
            svg.allMoleculesMatched = true;
        } else {
            svg.allMoleculesMatched = false;
        }
    }
    

    
    //Performs depth first search to add all of the images that are touching curImage to the component curComponent.
    function dfs(curImage, allImages, exploredImages, curComponent) {
        exploredImages.push(curImage);
        for(var i = 0; i < allImages.length; i++) {
            if($.inArray(allImages[i], exploredImages) == -1 && areTouchingCircular(curImage, allImages[i])) {
                curComponent.push(allImages[i]);
                dfs(allImages[i],allImages,exploredImages,curComponent);
            }
        }
    }
    
    //Performs depth first search to add all of the images that are touching curImage to the component curComponent.
    function dfsLooseTouching(curImage, allImages, exploredImages, curComponent) {
        exploredImages.push(curImage);
        for(var i = 0; i < allImages.length; i++) {
            if($.inArray(allImages[i], exploredImages) == -1 && areLooselyTouchingCircular(curImage, allImages[i])) {
                curComponent.push(allImages[i]);
                dfsLooseTouching(allImages[i],allImages,exploredImages,curComponent);
            }
        }
    }
    
    // Takes in two image nodes (from an svg DOM) and returns true if their bounding boxes overlap
    function areTouching(imageNode1, imageNode2) {
        var xRange1 = getXRange(imageNode1);
        var xRange2 = getXRange(imageNode2);
        var yRange1 = getYRange(imageNode1);
        var yRange2 = getYRange(imageNode2);
        return checkOverlapOneCoordinate(xRange1,xRange2) && checkOverlapOneCoordinate(yRange1,yRange2);
    }
    
    //Takes in a molecule, and for the atom with idOfTouchedAtom, returns the number of atomName atoms that
    //must touch that atom. E.g., for CH4, if the idOfTouchedAtom points to the carbon and atom name is H, should
    //return 4.
    this.getNumberTouchingOfIdentity = function(molecule, idOfAtomToCountConstraints, nameOfConstraintsToCount) {
        var atoms = molecule.getElementsByTagName("atom");
        var targetAtom = getAtomByID(idOfAtomToCountConstraints, atoms);
        var touchesConstraints = targetAtom.getElementsByTagName("touches");
        var totalTouched = 0;
        for(var i = 0; i < touchesConstraints.length; i++) {
            var curAtom = getAtomByID(touchesConstraints[i].childNodes[0].nodeValue, atoms);
            //if(curAtom.getElementsByTagName("name")[0].childNodes[0].nodeValue == nameOfConstraintsToCount) {
            if(curAtom.getAttribute('name') == nameOfConstraintsToCount) {
           
                ++totalTouched;
            }
        }
        return totalTouched;
    }
    
    //Takes in an atom id, and returns the xml doc portion corresponding to that id.
    function getAtomByID(id, atoms) {
        for(var i = 0; i < atoms.length; i++) {
            if(atoms[i].getAttribute('id') == id) {
                return atoms[i];
            }
        }
        return null;
    }
    
    //Returns an array where the first element is the far left x-coordinate of the image and the second is the far right
    //x-coordinage. 
    //Use of unary-+ is to convert the strings to numbers
    function getXRange(imageNode) {
        var range = new Array(2);
        range[0] = (+imageNode.getAttribute("x"));
        range[1] = range[0] + (+imageNode.getAttribute("width"));
        return range;
    }
    
    //Returns an array where the first element is the top y-coordinate of the image and the second is the bottom
    //y-coordinage.
    function getYRange(imageNode) {
        var range = new Array(2);
        range[0] = (+imageNode.getAttribute("y"));
        range[1] = range[0] + (+imageNode.getAttribute("height"));
        return range;
    }
    
    //Checks whether the two ranges overlap with one another - e.g., [0 1] and [0.5 1.5] overlap.
    function checkOverlapOneCoordinate(range1, range2) {
        return isWithin(range1[0], range2) || isWithin(range1[1], range2) || isWithin(range2[0], range1) || isWithin(range2[1], range1);
    }
    
    //Checks if the given number if in the range specified by the array range 
    //(with length 2, item 0 is the min and item 1 is the max)
    function isWithin(num, range) {
        return (range[0] <= num && range[1] >= num);
    }
    
    //Two circles touch iff the distance between their centers is <= the sum of their radii
    function checkCircularOverlap(center1, radius1, center2, radius2) {
        return (findCenterDistance(center1,center2) <= (radius1+radius2));
    }
    
    //Returns the distance between the center of image1 and the center of image2.
    function findCenterDistanceFromImages(image1, image2) {
        return findCenterDistance(getCenter(image1),getCenter(image2));
    }
    
    //Takes in center coordinates (arrays) and returns the Euclidean distance between them.
    function findCenterDistance(center1, center2) {
        return Math.sqrt(Math.pow(center1[0]-center2[0],2) + Math.pow(center1[1]-center2[1],2));
    }
    
    //Finds the center coordinates (returned as an array) for the image node
    function getCenter(imageNode) {
        var center = new Array(2);
        center[0] = (+imageNode.getAttribute("x")) + (+imageNode.getAttribute("width")/2);
        center[1] = (+imageNode.getAttribute("y")) + (+imageNode.getAttribute("height")/2);
        return center;
    }
    
    // Takes in two image nodes (from an svg DOM) and assumes they are circular. Returns true if their circles overlap
    function areTouchingCircular(imageNode1, imageNode2) {
        var center1 = getCenter(imageNode1);
        var center2 = getCenter(imageNode2);
        var radius1 = (+imageNode1.getAttribute("width")/2);//we assume these are circular, so choice of width or height doesn't matter
        var radius2 = (+imageNode2.getAttribute("width")/2);
        return checkCircularOverlap(center1,radius1,center2,radius2);
    }
    
    // Takes in two image nodes (from an svg DOM) and assumes they are circular. Returns true if their circles overlap, with
    // a small margin making the touching "stricter" - tries to deal with the fact that the images are not clipped tightly by
    //assuming the sum of the radii is clippingDistance smaller. 
    function areTouchingCircularStricter(imageNode1, imageNode2) {
        var center1 = getCenter(imageNode1);
        var center2 = getCenter(imageNode2);
        var radius1 = (+imageNode1.getAttribute("width")/2);//we assume these are circular, so choice of width or height doesn't matter
        var radius2 = (+imageNode2.getAttribute("width")/2);
        return (findCenterDistance(center1,center2) <= (radius1+radius2-clippingDistance));
    }
    
    // Takes in two image nodes (from an svg DOM) and assumes they are circular. Returns true if their distance is <=
    // epsilonForLooseMolecules - i.e., the circles almost touch.
     function areLooselyTouchingCircular(imageNode1, imageNode2) {
         return (findCircularDistance(imageNode1, imageNode2) <= epsilonForLooseMolecules);
     }

    // Checks whether the given svg object meets the requirements in the problem spec. This is the full object (with
    // snapshots fields) because we need to check if all frames are present and check requirements for all frames
    // Deemed correct if all the following pass:
    // - Right number of frames
    // - Right atoms in each frame (no extra atoms)
    // - Right molecules in each frame
    // Currently ignores extraneous objects that aren't extra atoms (e.g., if a student adds a text field)
    this.checkCorrect = function(svgFullObject) {
        svgFullObject.hasFrames = this.hasDesiredFrames(svgFullObject);
        svgFullObject.hasAtoms = this.hasDesiredAtoms(svgFullObject);
        svgFullObject.hasMolecules = this.hasDesiredMolecules(svgFullObject);
        return svgFullObject.hasFrames && svgFullObject.hasAtoms && svgFullObject.hasMolecules;
    }
    
    //Checks if the object has all of the frames mentioned in the xml spec.
    this.hasDesiredFrames = function(svgFullObject) {
        var numDesiredFrames = this.xmlSpecInfo.xmlDoc.getElementsByTagName("frame").length;
        return svgFullObject.snapshots.length == numDesiredFrames;
    }
    
    
    //Checks if each frame in this object has all and only the molecules mentioned in the xml spec.
    this.hasDesiredMolecules = function(svgFullObject) {
        for(var i = 0; i < svgFullObject.snapshots.length; i++) {
            if(!this.frameHasDesiredMolecules(svgFullObject, i)) {
                return false;
            }
        }
        return true;
    }
    
    //Checks if each frame in this object has no undesired molecules (as mentioned in the xml spec).
    this.hasNoUndesiredMolecules = function(svgFullObject) {
        for(var i = 0; i < svgFullObject.snapshots.length; i++) {
            if(!this.frameHasNoUndesiredMolecules(svgFullObject, i)) {
                return false;
            }
        }
        return true;
    }
    
    //Checks if the given frame has exactly the desired molecules from the xml spec, although they may be overlapping.
    this.frameHasOverlappingDesiredMolecules = function(svgFullObject, frameID) {
        if(typeof(svgFullObject.snapshots[frameID]) == "undefined") {
            return false;
        }
        var svg = svgFullObject.snapshots[frameID];
        if(typeof(svg.molecules) == "undefined") {
            this.getAllStrictMolecules(svg);
            this.nameAllMolecules(svg);
        }
        var allMolecules = svg.molecules;
        if(typeof(svg.overlappingMolecules) != "undefined") {
            allMolecules = combineTwoAssociativeArrays(svg.molecules, svg.overlappingMolecules);
        }
        var moleculesInFrame = getChildNodesThatAreNotTextNodes(this.getFrame(frameID).getElementsByTagName("molecules")[0]);
        return this.frameHasDesiredItems(moleculesInFrame,allMolecules) && !frameHasNonOverlappingUnnamedComponents(svgFullObject, frameID);
        
    }
     
     //Takes all the properties in each array, and combines them in a new array. If a property is in
     //both arrays, the new value is the sum of the old values
    function combineTwoAssociativeArrays(array1, array2) {
        var combinedArray = new Object();
        for(var prop in array1) {
            combinedArray[prop] = array1[prop];
        }
        for(var prop in array2) {
            if(typeof(combinedArray[prop]) == "undefined") {
                combinedArray[prop] = array2[prop];
            } else {
                combinedArray[prop] += array2[prop];
            }
        }
        return combinedArray;
    }
    
    //Checks if the given frame has exactly the desired molecules from the xml spec. They may not be overlapping.
    this.frameHasDesiredMolecules = function(svgFullObject, frameID) {
        if(typeof(svgFullObject.snapshots[frameID]) == "undefined") {
            return false;
        }
        var svg = svgFullObject.snapshots[frameID];
        if(typeof(svg.molecules) == "undefined") {
            this.getAllStrictMolecules(svg);
            this.nameAllMolecules(svg);
        }
        var moleculesInFrame = getChildNodesThatAreNotTextNodes(this.getFrame(frameID).getElementsByTagName("molecules")[0]);
        return this.frameHasDesiredItems(moleculesInFrame,svg.molecules) && svg.unnamedComponents.length == 0;
        
    }
    
    //Checks if the given frame has exactly the right number of molecule with the given name. They may not be overlapping.
    this.frameHasDesiredMoleculeByName = function(svgFullObject, frameID, moleculeName) {
        if(typeof(svgFullObject.snapshots[frameID]) == "undefined") {
            return false;
        }
        var svg = svgFullObject.snapshots[frameID];
        if(typeof(svg.molecules) == "undefined") {
            this.getAllStrictMolecules(svg);
            this.nameAllMolecules(svg);
        }
        var moleculesInFrame = getChildNodesThatAreNotTextNodes(this.getFrame(frameID).getElementsByTagName("molecules")[0]);
        for(var i = 0; i < moleculesInFrame.length; i++) {
            if(moleculesInFrame[i].getAttribute('name') == moleculeName) {
                if(svg.molecules[moleculeName] != moleculesInFrame[i].getAttribute('count')) {
                    return false;
                } else {
                    return true;
                }
            }
        }
        return svg.molecules[curItem] == 0;
        
    }
    
    //Checks if the given frame has no molecules that are not desired (based on the xml spec). They may not be overlapping.
    this.frameHasNoUndesiredMolecules = function(svgFullObject, frameID) {
        if(typeof(svgFullObject.snapshots[frameID]) == "undefined") {
            return false;
        }
        var svg = svgFullObject.snapshots[frameID];
        if(typeof(svg.molecules) == "undefined") {
            this.getAllStrictMolecules(svg);
            this.nameAllMolecules(svg);
        }
        var moleculesInFrame = getChildNodesThatAreNotTextNodes(this.getFrame(frameID).getElementsByTagName("molecules")[0]);
        return this.frameHasNoUndesiredItems(moleculesInFrame,svg.molecules) && svg.unnamedComponents.length == 0;
        
    }
    
    // listOfXMLElements are some elements with name and count attribute values. objectWithCounts is an object
    // with fields that should be the same as the names of the elements. This checks that any extra counts
    // in objectWithCounts have value 0, and that the values for each field match the count attribute value.
    // Assumes there are no repeated names in listOfXMLElements.
    this.frameHasDesiredItems = function(listOfXMLElements,objectWithCounts) {
        var totalFoundMoleculeCounts = 0;
        for(curItem in objectWithCounts) {
            var found = false;
            //get desired number of this item in the frame
            for(var i = 0; i < listOfXMLElements.length; i++) {
                if(listOfXMLElements[i].getAttribute('name') == curItem) {
                    if(objectWithCounts[curItem] != listOfXMLElements[i].getAttribute('count')) {
                        return false;
                    }
                    found = true;
                    totalFoundMoleculeCounts++;
                    break;
                }
            }
        }
        return totalFoundMoleculeCounts == listOfXMLElements.length;
    }
    
    // listOfXMLElements are some elements with name and count attribute values. objectWithCounts is an object
    // with fields that should be the same as the names of the elements. This checks that all counts in objectWithCounts
    // are less than or equal to the counts in listOfXMLElements. Thus, we may be missing some items in the drawing object
    // (object with counts) but we don't have any objects we shouldn't have.
    // Assumes there are no repeated names in listOfXMLElements.
    this.frameHasNoUndesiredItems = function(listOfXMLElements,objectWithCounts) {
        var totalFoundMoleculeCounts = 0;
        for(curItem in objectWithCounts) {
            var found = false;
            //get desired number of this item in the frame
            for(var i = 0; i < listOfXMLElements.length; i++) {
                if(listOfXMLElements[i].getAttribute('name') == curItem) {
                    if(objectWithCounts[curItem] > listOfXMLElements[i].getAttribute('count')) {
                        return false;
                    }
                    found = true;
                    totalFoundMoleculeCounts++;
                    break;
                }
            }
        }
        return totalFoundMoleculeCounts == listOfXMLElements.length;
    }
    
    //Returns true if atom identity is not concerved among frames.
    this.atomsAddedOrDeletedBetweenFrames = function(svgFullObject) {
        if(svgFullObject.snapshots.length < 2) {
            return false; //base case - can't add or delete if you don't have multiple frames
        }
        var atomCounts = svgFullObject.snapshots[0].atoms;
        var totalAtomsFrame1 = getSumOfAssociativeArray(atomCounts);
        for(var i = 1; i < svgFullObject.snapshots.length; i++) {
            var curAtoms = svgFullObject.snapshots[i].atoms;
            if(totalAtomsFrame1 != getSumOfAssociativeArray(curAtoms)) {
                return true;
            }
            for(var curAtomName in atomCounts) {
                if(atomCounts[curAtomName] != curAtoms[curAtomName]) {
                    return true;
                }
            }
        }
        return false;
    }
    
    //Checks if all frames have exactly the desired atoms from the xml spec.
    this.hasDesiredAtoms = function(svgFullObject) {
        for(var i = 0; i < svgFullObject.snapshots.length; i++) {
            if(!this.frameHasDesiredAtoms(svgFullObject, i)) {
                return false;
            }
        }
        return true;
    }
    
    //Takes in a snapshot and the frame id it should match, and returns true if the snapshot has the same atoms
    //as given in the xml spec
    this.frameHasDesiredAtoms = function(svgFullObject, frameID) {
        if(typeof(svgFullObject.snapshots[frameID]) == "undefined") {
            return false;
        }
        var svg = svgFullObject.snapshots[frameID];
        if(typeof(svg.atoms) == "undefined") {
            this.getAtoms(svg);
        }
        var atomsInFrame = getChildNodesThatAreNotTextNodes(this.getFrame(frameID).getElementsByTagName("atoms")[0]);
        return this.frameHasDesiredItems(atomsInFrame, svg.atoms);
    }
    
    //Gets the frame specification for the frame with given id from the xml spec
    this.getFrame = function(frameID) {
        var allFrames = this.xmlSpecInfo.xmlDoc.getElementsByTagName("frame");
        for(var i = 0; i < allFrames.length; i++) {
            if(allFrames[i].getAttribute('id') == frameID) {
                return allFrames[i];
            }
        }
        return null;
    }
    
    /**
     * Get all the child nodes of the node
     * @param node the node to get the child nodes from
     * @returns an array that contains the child nodes
     */
    function getChildNodesThatAreNotTextNodes(node) {
    	var resultChildNodes = [];
    	
    	if(node != null) {
    		//get the child nodes
    		var childNodes = node.childNodes;
    		
    		//loop through all the child nodes
    		for(var x=0; x<childNodes.length; x++) {
    			//get a child node
    			var childNode = childNodes[x];
    			
    			/*
    			 * make sure the child node is not a text node. in Chrome, the new line
    			 * white space shows up as a node which we want to ignore.
    			 */
    			if(childNode.nodeName != '#text') {
    				//add this node to the array we will return
    				resultChildNodes.push(childNode);
    			}
    		}
    	}
    	
    	return resultChildNodes;
    };

    /**
     * Get the possible scores for methane
     */
    this.getPossibleMethaneScoreKeys = function() {
    	var possibleScores = [
    	                      {score:0, key:'0'},
    	                      {score:1, key:'1'},
    	                      {score:2, key:'2 Case 1'},
    	                      {score:2, key:'2 Case 2'},
    	                      {score:2, key:'2 Case 3'},
    	                      {score:3, key:'3'},
    	                      {score:4, key:'4'},
    	                      {score:5, key:'5'}
    	                     ];
    	                      
    	
    	return possibleScores;
    };
    
    /**
     * Get the possible scores for ethane
     */
    this.getPossibleEthaneScoreKeys = function() {
    	var possibleScores = [
    	                      {score:0, key:'0'},
    	                      {score:1, key:'1'},
    	                      {score:2, key:'2 Case 1'},
    	                      {score:2, key:'2 Case 2'},
    	                      {score:3, key:'3'},
    	                      {score:4, key:'4'},
    	                      {score:5, key:'5'}
    	                     ];
    	
    	return possibleScores;
    };
};

    //used to notify scriptloader that this script has finished loading
    if(typeof eventManager != 'undefined'){
        eventManager.fire('scriptLoaded', 'vle/node/draw/svg-edit/autograde/drawScorer.js');
    };