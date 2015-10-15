(function (window) {
    /**
     *   The feedbackManager stores all events explicitly passed to it from the main js file.
     *   The feedbackEvents array is defined in the template json and includes a list of
     *       queries.
     *   The eventTypes array is used to ensure that the query pattern is valid.
     *   Each feedbackEvent in the feedbackEvents array should have the following format:
     *   {
    *        "query": // [includes the pattern that will be matched and the time window in which it must occur]
    *        {  "pattern":"SEQ(AND(A a, NOT(B b), C c, [a].prop == [c].prop), OR(A a, B b))" //[pattern is a nested call of SEQ, AND< OR, NOT functions with expressions]
    *           "within":10 //[event must have occured completely in the last N seconds]
    *        }
    *        "feedback":  // [the type, body of feedback and number of times it may be given, Can be left out if only using constraint
    *        {
    *           "type":"text",
    *           "text":"Great job, you made a model and placed it on the balance.",
    *           "repeatMax":2
    *        },
    *        "constraint":  // [Should this feedback event constrain students from progressing?]
    *        {
    *            "necessaryOrSufficient": "necessary", // [If necessary then this must be completed, if sufficient, and no necessary constraints exist, then accomplishing this event is enough to proceed]
    *            "text": "You must add and remove an object."
    *        }
    *    }
     *
     *    The main source for the query format comes from:
     *
     *    Mo Liu, Elke A. Rundensteiner, Dan Dougherty, Chetan Gupta, Song Wang, Ismail Ari, and Abhay Mehta, NEEL: The Nested Complex Event Language for Real-Time Event Analytics, BIRTE 2010
     *
     *   This complex event processing language uses nested AND, OR, SEQ, NOT functions (each described below)
     *   Additionally a set of predicates can be defined (except in OR), which check whether events
     *   that are of the matching eventTypes have specified properties.
     *
     *   For example:
     *       SEQ(A a, B b, [a].prop1 >= [b].prop1)
     *       Checks whether two events A and B occured in their respective orders and whether
     *           prop1 of the 'a' event was greater than the prop1 of the 'b' event.
     *
     *       More concretely.  In an experiment where two objects are compared on a balance scale:
     *       AND (add-balance a1, add-balance a2, [a1].obj_id != [a2].obj_id)
     *           checks to see whether two objects have been added to the balance, and they do not have the same id.
     */
    var FeedbackManager = function (node, feedbackEvents, eventTypes) {
        //console.log("patterns", patterns);
        this.node = node;
        this.initialFeedbackEvents = feedbackEvents;
        this.feedbackEvents = feedbackEvents;
        this.eventTypes = eventTypes;
        this.initialTimestamp = new Date().getTime();
        this.history = []; // stores all previous events;
        this.modelTable = null;
        this.eventCount = 0;
        this.DEBUG = false;

        // for each feedback event attach a parsed object associated with each query
        var constraintFound = false;
        for (var i = 0; i < this.feedbackEvents.length; i++) {
            this.feedbackEvents[i].query.parsedPattern = this.parseFunctionString(this.feedbackEvents[i].query.pattern);
            if (typeof this.feedbackEvents[i].constraint !== "undefined") {
                this.feedbackEvents[i].constraint["released"] = false;
                if (!constraintFound) {
                    constraintFound = true;
                }
            }
            if (typeof this.feedbackEvents[i].feedback === "undefined") {
                this.feedbackEvents[i].feedback = {"repeatMax":0};
            }
            this.feedbackEvents[i].feedback["repeatCount"] = -1;
            this.feedbackEvents[i].feedback["lastGivenIndex"] = -1;
        }
        //console.log(constraintFound, this.feedbackEvents, this.node);
        this.completed = !constraintFound;
        if (!constraintFound) {
            this.node.setCompleted();
        } else {
            this.node.setNotCompleted();
        }
    };

    var p = FeedbackManager.prototype;

    /** Since we don't want to overwhelm the server we make sure that the returnd history is not too large */
    p.getHistory = function (maxSize) {
        var hstring = this.historyToString(0);
        var i = 0;
        while (hstring.length * 2 > maxSize) {
            i++;
            hstring = this.historyToString(i);
        }
        return this.history.slice(i);
    }
    p.historyToString = function (start) {
        var s = JSON.stringify(this.history.slice(start));
        //for (var i = start; i < this.history.length; i++){
        //    s = s + this.history[i];
        // }
        return s;
    }

    /**
     *   A new event is passed to checkEvent to search for any matching feedbackEvents.
     *   The event should be an object with all of its accessible properties on the top-level.
     *    i.e., any property that will be checked should be on the top level.
     *     if properties are nested in objects, a "flattening" function should be applied first
     */
    p.checkEvent = function (obj, modelTable) {
        if (typeof modelTable !== "undefined") this.modelTable = modelTable;
        var evt = this.flattenObject(obj, "", {});
        if (GLOBAL_PARAMETERS.DEBUG) console.log(evt.type, evt);
        evt.index = this.eventCount;
        evt.id = evt.type + "_" + this.eventCount;
        if (typeof evt.time === "undefined") {
            var d = new Date();
            evt.time = d.getTime();
        }
        var stored = {'index': evt.index, 'id': evt.id, 'type': evt.type, 'time': evt.time};

        // look for models and add ids to the stored object
        if (typeof obj.models !== "undefined") {
            for (var i = 0; i < obj.models.length; i++) {
                if (typeof obj.models[i].id !== "undefined") {
                    stored["models[" + i + "].id"] = obj.models[i].id;
                }
            }
        }
        // look for additional details and add directly to stored history
        if (typeof obj.details !== "undefined" && typeof obj.details !== "object") {
            // in this case we want to get the text, but also the text length in a flat form
            stored["text"] = obj.details;
            stored["text.length"] = obj.details.length;
        } else if (typeof obj.details !== "undefined"){
            for (var key in obj.details) {
                stored[key] = obj.details[key];
            }
        }

        this.history.push(stored);
        // this.printEventHistory(false);
        this.eventCount++;

        var minOrder = 10000;
        var minFound = false;
        // get the minimum order of existing feedbackEvents (which have not been given)
        for (var i = 0; i < this.feedbackEvents.length; i++) {
            if (this.feedbackEvents[i].feedback.repeatCount == -1 && typeof this.feedbackEvents[i].query.order !== "undefined") {
                if (this.feedbackEvents[i].query.order < minOrder) {
                    minOrder = this.feedbackEvents[i].query.order;
                    minFound = true;
                }
            }
        }

        // iterate through each feedbackEvent
        for (var i = this.feedbackEvents.length - 1; i >= 0; i--) {
            // if this event doesn't match a found minimum order then skip
            if (minFound && this.feedbackEvents[i].query.order != minOrder) continue;
            // don't bother checking events prior to window
            var startingIndex = this.feedbackEvents[i].feedback.lastGivenIndex + 1;
            if (typeof this.feedbackEvents[i].query.within != "undefined") {
                var ts = evt.time;
                for (var j = this.history.length - 1; j >= startingIndex; j--) {
                    if (ts - this.history[j].time > this.feedbackEvents[i].query.within * 1000) {
                        startingIndex = j + 1;
                        break;
                    }
                }
            }
            var matchArr = [];
            if (startingIndex >= 0) matchArr = this.matchQuery(startingIndex, this.feedbackEvents[i].query);
            // hit, deliver
            if (matchArr.length > 0) {
                var f = this.feedbackEvents[i];
                this.feedbackEvents[i].feedback.repeatCount++;
                if (typeof this.feedbackEvents[i].constraint != "undefined") this.feedbackEvents[i].constraint.released = true;
                this.feedbackEvents[i].feedback.lastGivenIndex = matchArr[matchArr.length - 1];
                //console.log("matched history array indices:", matchArr);
                //vle.notificationManager.notify(this.feedbackEvents[i].feedback.text, 3, false, 'messageDiv');
                this.giveFeedback(this.feedbackEvents[i].feedback)
                //alert(this.feedbackEvents[i].feedback.text);
                if (this.feedbackEvents[i].feedback.repeatCount >= this.feedbackEvents[i].feedback.repeatMax) {
                    this.feedbackEvents.splice(i, 1);
                }
                //this.giveFeedback(this.feedbackEvents[i].feedback);
                this.completed = !this.isConstrained();
                if (this.completed) {
                    this.node.setCompleted();
                }
                return f;
            }
        }
        return null;
    }

    /**
    *   Gives the proper feedback according to type, implemented
    *   text(or html): Give feedback in a jquery ui dialog.
    */
    p.giveFeedback = function (feedback){
         if (feedback.type == "text" || feedback.type == "html"){
            $(function() {
                $("#messageDiv").html(feedback.text).dialog({
                   //position: {my: "left", at: "center", of: "window"},
                   modal:true,
                   show:"scale",
                   hide:"blind"
                });
            });
        } else {
            console.log("type of feedback not valid");
        }
    }

    /**
    *   If the properties in the event object are to be used in expression they must be placed
    *   on the top level of the object.  This function recurses through the nested hierarchy
    *   and constructs a path string representing the original nesting.
    *   For example: 
    *   {
    *        "ObjectProperties":
    *        {
    *            "id":1,
    *            "size":5
    *        }
    *    }
    *    will become:
    *    {
    *        "ObjectProperties.id":1,
    *        "ObjectProperties.size":5
    *    }
    *  Arrays objects will be expanded with index between straight brackets
    *  models[objX, objY, objZ, ...]  ->  models[0], models[1], models[2], ...  
    *  
    *  }
    *
    */
    p.flattenObject = function(obj, prefix, returnObj) {
        if (typeof obj == "object"){
            if (Object.prototype.toString.call(obj) == "[object Object]"){
                if (prefix.length > 0) prefix += ".";
                for (var key in obj){
                    if (typeof obj[key] !== "object"){
                        returnObj[prefix+key] = obj[key];
                    } else {
                        returnObj = this.flattenObject(obj[key], prefix+key, returnObj);
                    }   
                } 
                return returnObj;
            } else if (Object.prototype.toString.call(obj) == "[object Array]"){             
                for (var i = 0; i < obj.length; i++){
                    if (typeof obj[i] !== "object"){
                        returnObj[prefix+"["+i+"]"] = obj[i];
                    } else {
                        returnObj = this.flattenObject(obj[i], prefix+"["+i+"]", returnObj);
                    }   
                }
                
                return returnObj;
            }
        } else {
            return returnObj;
        }

    };

    /**
    *   Walks through the feedback events array in the json file looking for constaints that are
    *   necessary or sufficient.  If all sufficient condiitons have been met then no constraint.
    *   If there are no unmet necessary conditions, then if any sufficient condition is met then no constriant.
    *
    */
    p.isConstrained = function() {
        // cycle through the feedback events to see if there are any constraints.
        var feedbackEvents = this.feedbackEvents;
        if (typeof feedbackEvents != "undefined"){
            var metASufficient = false;
            // necessary constraints?
            for (var i = 0; i < feedbackEvents.length; i++){
                var evt = feedbackEvents[i];
                if (typeof evt.constraint != "undefined" && typeof evt.constraint.necessaryOrSufficient != "undefined" 
                && evt.constraint.necessaryOrSufficient == "necessary" && (typeof evt.constraint.released == "undefined" || !evt.constraint.released)){
                    return true;
                } else
                if (typeof evt.constraint != "undefined" && typeof evt.constraint.necessaryOrSufficient != "undefined" 
                && typeof evt.constraint.released != "undefined" && evt.constraint.necessaryOrSufficient == "sufficient" && evt.constraint.released){
                    metASufficient = true;
                }
            }
            
            return metASufficient;
        } else {
            return false;
        }

    }

    /**
    *   Head function for matching a queries' pattern.
    */
    p.matchQuery = function (lindex, query){
        //console.log(this.history[this.history.length-1].type, "event______________________________________", lindex);
        var matchArr = [];
        matchArr = this.matchByFunctionType (lindex, this.history.length-1, query.parsedPattern, {}, []);
       return matchArr;
    }

    /**
    *   Passes arguments along to appropriate function.
    */
    p.matchByFunctionType = function (lindex, uindex, fcall, parentVars, skipArr){
        var matchArr;
        if (fcall.functionName.toUpperCase() == "SEQ"){
            matchArr = this.matchSEQ(lindex, fcall.args, parentVars, skipArr);
        } else if(fcall.functionName.toUpperCase() == "OR"){
            matchArr = this.matchOR(lindex, fcall.args, parentVars, skipArr);
        } else if(fcall.functionName.toUpperCase() == "AND"){
            matchArr = this.matchAND(lindex, fcall.args, parentVars, skipArr);
        } else if(fcall.functionName.toUpperCase() == "NOT"){
            matchArr = this.matchNOT(lindex, uindex, fcall.args, parentVars, skipArr);
        } else {

        }
        if (this.DEBUG) console.log(fcall.functionName.toUpperCase(), matchArr);
        return matchArr;
    }

    /**
    *   Matches a pattern of the type:   OR(ARG1, ARG2, ARG3)
    *   If any of the ARGS are matched then this function return the matching indices.
    *       Else [] is returned.
    *   In each case the ARG is a pre-defined eventType.  
    *   While the EventType eventVar structure can be applied here, such as:
    *       OR (CHANGE-VAL c, TEST t, c.prop == t.prop) can be used here, the expression 
    *       c.prop == t.prop will not be evaluated because or statements are processed
    *       independently of each other.
    *   NOT functions on the top-level are not processed:
    *       e.g.  OR (A, NOT(B), C)  <--- NOT(B) is ignored.  However:
    *       OR (A, SEQ(B, NOT(C), D))  <--- the NOT(C) is relevant to the SEQ and is processed
    */
    p.matchOR = function (lindex, args, parentVars, skipArr){
        if (lindex >= this.history.length) return [];
        var theseVars = $.extend({}, parentVars);
        var sequenceFailed = false;
        for (var i = 0; i < args.length; i++){
            if (this.isEvent(args[i])){
                var index = this.matchHistoryForEvent(lindex, this.history.length-1, args[i].eventType, skipArr);
                if (index < this.history.length){
                   if (typeof args[i].variable != "undefined"){
                        theseVars[args[i].variable] = this.getEventFromHistory(index);
                    }  
                    return [index];
                }
                else {
                    sequenceFailed = true;
                    break;
                } 
            } else if (this.isFunction(args[i])){
                if (args[i].functionName.toUpperCase() != "NOT")
                {
                    var arr = this.matchByFunctionType(lindex, this.history.length-1, args[i], skipArr);           
                    if (arr.length > 0){
                        return arr;
                    } else {
                        sequenceFailed = true;
                    }
                } else {
                    // DONT PROCESS NOT CALLS BECAUSE AN EVENT MUST OCCUR TO PROMPT FEEDBACK                  
                }
            } else if (this.isExpression(args[i])){
                // DON'T PROCESS EXPRESSIONS BECAUSE WE ARE LOOKING AT EACH ARGUMENT INDEPENDENTLY
            }
        }
        
        // we did not find a match from the starting position lindex.  However, we can try again from lindex+1.
        // so for example if we are matching A, NOT B, C  and we have event history A B A C
        // we will fail from lindex 0, but we will succeed from lindex 2
        if (sequenceFailed){
           if (lindex < this.history.length-1){
               return this.matchOR(lindex+1, args, parentVars, skipArr);
            } else {
                return [];
            }
        }

        return [];
    }

    
    /**
    *   Matches a pattern of the type:   AND(ARG1 a1, ARG2 a2, ARG3 a3, expression)
    *   If all of the ARGS are matched (in any order) then this function return the matching indices.
    *       Else [] is returned.
    *   In each case the ARG is a pre-defined eventType.  
    *   The last argument can be an expression that uses event variable established in previous arguments.
    *       Place the event variable (e.g. a1) in straight braces (i.e., [a1]) to use it in an expression. 
    *        The expression will also have any variables set in a parent level of nesting.
    *        e.g.  AND(A a, AND(B b, C, c, [a].prop1 == [c].prop1)).  In this case a was
    *        defined on the parent level and c was defined on the child level.   
    *   NOT arguments are processed after each of the non-NOT arguments.  If a NOT argument
    *     matches between the first and last matched AND arguments, then a match is not found.
    *       For example: AND (A, B, NOT(C)).  If A occured at index 0 of the history and
    *          B occcured at index 4 of the history, then if C occured between 1-3 (inclusive)
    *           then a match is not returned.
    */
    p.matchAND = function (lindex, args, parentVars, skipArr){
        if (lindex >= this.history.length) return [];
        var theseVars = $.extend({}, parentVars);
        var sequenceFailed = false;
        var iskipArr = skipArr.slice();
        var returnArr = [];
        var notCalls = []; // we collect not calls for processing at the end.
        var arr, narr;
        for (var i = 0; i < args.length; i++){
            if (this.isEvent(args[i])){
                var index = this.matchHistoryForEvent(lindex, this.history.length-1, args[i].eventType, skipArr);
                if (index < this.history.length){
                    returnArr.push(index);
                    skipArr.push(index);
                    if (typeof args[i].variable != "undefined"){
                        theseVars[args[i].variable] = this.getEventFromHistory(index);
                    }  
                }
                else {
                    sequenceFailed = true;
                    break;
                } 
            } else if (this.isFunction(args[i])){
                if (args[i].functionName.toUpperCase() != "NOT")
                {
                    arr = this.matchByFunctionType(lindex, this.history.length-1, args[i], skipArr);  

                    if (arr.length > 0){
                        returnArr = returnArr.concat(arr);
                        skipArr = skipArr.concat(arr);
                    } else {
                        sequenceFailed = true;
                    }
                } else {
                    // special case for not, set not array to check against next sequence item
                    notCalls.push(args[i]);
                }
            } else if (this.isExpression(args[i])){
                if (!this.evalExpression(args[i].expression, theseVars)){
                    sequenceFailed = true;
                }
            }
        }
        // if we have a return array with multiple items sort it and check to see if any not calls can be found between
        if (returnArr.length > 1){
            returnArr.sort(function(a,b){return a - b});
            for (var i = 0; i < notCalls.length; i++){
                narr = this.matchNOT(returnArr[0]+1, returnArr[returnArr.length-1]-1, notCalls[i].args, theseVars, skipArr);
                if (narr.length > 0){
                    sequenceFailed = true;
                    break;
                }
            }
        }


        // we did not find a match from the starting position lindex.  However, we can try again from lindex+1.
        // so for example if we are matching A, NOT B, C  and we have event history A B A C
        // we will fail from lindex 0, but we will succeed from lindex 2
        if (sequenceFailed){
           if (lindex < this.history.length-1){
               return this.matchAND(lindex+1, args, parentVars, iskipArr);
            } else {
                return [];
            }
        }

        return returnArr;
    }

    /**
    *   Matches a pattern of the type:   SEQ(ARG1 a1, ARG2 a2, ARG3 a3, expression)
    *   If all of the ARGS are matched (in given order) then this function return the matching indices.
    *       Else [] is returned.
    *   In each case the ARG is a pre-defined eventType.  
    *   The last argument can be an expression that uses event variable established in previous arguments.
    *       Place the event variable (e.g. a1) in straight braces (i.e., [a1]) to use it in an expression. 
    *        The expression will also have any variables set in a parent level of nesting.
    *        e.g.  AND(A a, AND(B b, C, c, [a].prop1 == [c].prop1)).  In this case a was
    *        defined on the parent level and c was defined on the child level.   
    *   NOT arguments are processed between non-NOT arguments.  
    *       For example: SEQ (A, NOT(B), C).  If A occured at index 0 of the history and
    *          c occcured at index 4 of the history, then if B occured between 1-3 (inclusive)
    *           then a match is not returned.
    *   more than one NOT function can be placed in sequence between not-NOT events, order is irrelevant.
    */
    p.matchSEQ = function (lindex, args, parentVars, skipArr){
        if (lindex >= this.history.length) return [];
        var theseVars = $.extend({}, parentVars);
        var sequenceFailed = false;
        var returnArr = [];
        var notCalls = []; // we don't process not function calls immediately, we wait until the next item.
        var index = lindex;
        var arr, narr;
        for (var i = 0; i < args.length; i++){
            if (this.isEvent(args[i])){
                index = this.matchHistoryForEvent(index, this.history.length-1, args[i].eventType, skipArr);
                if (index < this.history.length){
                    // is there a previous not call that must be processed
                    for (var j = 0; j < notCalls.length; j++){
                        narr = this.matchNOT(returnArr[returnArr.length-1]+1, index, notCalls[j].args, theseVars, skipArr);
                        //console.log("return from not", narr,"from", returnArr[returnArr.length-1]+1, "to", index, "lindex", lindex, this.history);
                        if (narr.length > 0){
                            sequenceFailed = true;
                            break;
                        }
                                  
                    }
                    notCalls = []; 
                    returnArr.push(index);
                    if (typeof args[i].variable != "undefined"){
                        theseVars[args[i].variable] = this.getEventFromHistory(index);
                    }                    
                    index++;
                }
                else {
                    sequenceFailed = true;
                    break;
                } 
            } else if (this.isFunction(args[i])){
                if (args[i].functionName.toUpperCase() != "NOT")
                {
                    arr = this.matchByFunctionType(index, this.history.length-1, args[i], skipArr);           
                    if (arr.length > 0){
                        for (j = 0; j < notCalls.length; j++){
                            narr = this.matchNOT(returnArr[returnArr.length-1]+1, arr[0], notCalls[j].args, theseVars, skipArr);
                            if (narr.length > 0){
                                sequenceFailed = true;
                                break;
                            }         
                        }
                        notCalls = [];  
                        returnArr = returnArr.concat(arr);
                    } else {
                        sequenceFailed = true;
                    }
                } else {
                    // special case for not, set not array to check against next sequence item
                    notCalls.push(args[i]);
                }
            } else if (this.isExpression(args[i])){
                if (!this.evalExpression(args[i].expression, theseVars)){
                    sequenceFailed = true;
                }
            }
        }

        // we did not find a match from the starting position lindex.  However, we can try again from lindex+1.
        // so for example if we are matching A, NOT B, C  and we have event history A B A C
        // we will fail from lindex 0, but we will succeed from lindex 2
        if (sequenceFailed){
           if (lindex < this.history.length-1){
               return this.matchSEQ(lindex+1, args, parentVars, skipArr);
            } else {
                return [];
            }
        }

        return returnArr;
    }
    
    /** 
    *   Only the first argument can contain events that will be matched against the history.
    *   The second argument may be an expression.
    *   For example:  Seq(A a, NOT(B b, [a].prop == [b].prop), C)
    *   Checks to make sure that some event B with the same property as A does not occur
    *   right after A.  If 'a' and 'b' have different "prop" then this returns [].
    *   Unlike the examples the uindex is used here to represent an ending point to search the history.
    *   This is needed because NOT functions are searched between two other SEQ or AND events.
    */
    p.matchNOT = function (lindex, uindex, args, parentVars, skipArr){
        if (args.length < 1) return [-1];
        var theseVars = $.extend({}, parentVars);
        var arg = args[0];
        var exp = null;
        if (args.length > 1 && this.isExpression(args[1])){ exp = args[1].expression;}
        if (this.isEvent(arg)){            
            var index = this.matchHistoryForEvent(lindex, uindex, arg.eventType, skipArr);
            if (index < this.history.length){
                if (typeof arg.variable != "undefined"){
                    theseVars[arg.variable] = this.getEventFromHistory(index);
                } 
                if (exp != null){
                    if (this.evalExpression(exp, theseVars)){
                        return [index];
                    } else {
                        return [];
                    }
                } else {
                    return [index];
                }               
            }
            else {
                return [];
            } 
        } else if (this.isFunction(arg)){
            return this.matchByFunctionType(lindex, hindex, arg, parentVars, skipArr);
        } else {
            return [];
        }
    };

    /**
    *   Searches the history array between start and stop for the given eventType.
    *   If the matching index is in the skipArr it is not returned.
    */
    p.matchHistoryForEvent = function (start, stop, eventType, skipArr){
        if (typeof skipArr === "undefined") skipArr = [];
        var history = this.history;
        for (var i = start; i <= stop; i++){
            if (eventType == history[i].type){
                var skipFound = false;
                for (var j = 0; j < skipArr.length; j++){
                    if (skipArr[j] == i){
                        skipFound = true; break;
                    }
                }
                if (!skipFound) return i;
            }
        }
        return history.length;
    };

    /** The history array currently only contains the model id. Use the table to retreive the model info and append to event */
    p.getEventFromHistory = function (index){
        var evt = this.history[index];
        evt.models = [];
        for (var key in evt){
            var matches = key.match(/^models\[[0-9]+\].id$/);
            if (matches != null && matches.length > 0){
                var model = {};
                var id = evt[key];
                // iterate through modelTable to find the matching id
                var idIndex = -1;
                // find column with id (should be first, but lets be safe)
                for (var i=0; i < this.modelTable.length; i++){
                    if (this.modelTable[i][0].text == "id"){
                        idIndex = i;
                        break;
                    }
                }
                if (idIndex > -1){
                    // find matching id
                    var objIndex = -1;
                    for (var j = 0; j < this.modelTable[idIndex].length; j++){
                        if (this.modelTable[idIndex][j].text == id){
                            objIndex = j;
                        }
                    }
                    // we have the correct index, attach all information to model object and attach to event
                    if (objIndex > -1){
                        for (var i=0; i < this.modelTable.length; i++){
                            model[this.modelTable[i][0].text] = this.modelTable[i][objIndex].text;
                        }
                        evt.models.push(model);
                    }
                }
            }
        }
        evt = this.flattenObject(evt,"",{});
        return (evt);
    }

    /**
    *   Given an expression of the form [a].prop == [b].prop,
    *   searches through the variables object for a key 'a' and 'b' with some
    *   property 'prop'.  
    *   For example the variables object may look like:
    *   {
    *        'a':
    *        {
    *            'prop':1,
    *            'propA':2
    *        },
    *        'b':
    *        {
    *            'prop':1,
    *            'propB':3
    *        }
    *    } 
    *   If those values are found then expression is replaced with
    *   the values in the variables object, and then evaluated. 
    *   Since the javascript eval() function is being used, the operations in the
    *   expression should be a valid combination of [+ - / * () < > == <=  >=]
    */
    p.evalExpression = function (expression, variables){
        // go through each variable and replace corresponding in expression with numerical value
        for (var key in variables){
            var s = new RegExp('\\['+key+'\\]');
            var exp = expression;
            while (exp.length > 0){
                var index = exp.search(s);
                if (index >= 0){
                    var pre = exp.match(s)[0];
                    var post = exp.substr(index+pre.length).match(/[A-Za-z0-0_\-\.\[\]]*/)[0];
                    var full = pre + post;
                    if (post.substr(0,1) == ".") post = post.substr(1);
                    var replacement = variables[key][post];
                    if (typeof replacement == "string") replacement = "'"+replacement+"'";
                    expression = expression.replace(full, replacement);
                    if (exp.length > 1){
                        exp = exp.substr(index+1);
                    } else {
                        exp = [];
                    }   
                } else {
                    exp = [];      
                }      
            }
        }
        //console.log("new expression", expression, eval(expression));
        var b;
        try {
            b = eval(expression); 
        } catch (e) {
            b = false;
        }
        return b;
    }

    
    p.printEventHistory = function (full){
        for (var i = 0; i < this.history.length; i++){
            if (full){
                console.log(this.history[i]);
            } else {
                console.log(this.history[i].eventID);
            }
        }
    };
    ///////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// PARSING FUNCTIONS //////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////
     /** 
     *   Parses a string that represents a recursive function call with matching parentheses.
     *   e.g.  SEQ(A a, SEQ(B b, C c, b.id == a.id), AND(D d, E e)), F f, f.id == a.id)
     *  
     */
     p.parseFunctionString = function (str){
         var returnObj = {};
         var start = -1, length = 0;
         var curIndex = Number.MAX_VALUE;
         if (str.indexOf("AND(")>-1 && str.indexOf("AND(") < curIndex){start = str.indexOf("AND("); length = 3; curIndex = start;}
         if (str.indexOf("SEQ(")>-1 && str.indexOf("SEQ(") < curIndex){start = str.indexOf("SEQ("); length = 3; curIndex = start;}
         if (str.indexOf("OR(")>-1 && str.indexOf("OR(") < curIndex){start = str.indexOf("OR("); length = 3; curIndex = start;}
         if (str.indexOf("NOT(")>-1 && str.indexOf("NOT(") < curIndex){start = str.indexOf("NOT("); length = 3; curIndex = start;}
          
         var finish = str.lastIndexOf(")");
         if (start > -1 && finish > -1 && start < finish){
             var fname = str.substr(start,length).replace(/^\s*/,'').replace(/\s*$/,'');
             returnObj.functionName = fname;
             returnObj.args = this.parseArguments(str.substring(start+length+1, finish));
            return returnObj;
            // if (print) console.log(sstr);
         } else {
             return this.parseArgument(str);
         }
     }
    
    /**
    *    With the function name and matching parens already filtered, this function finds commas
    *    at the top level of parenthesis depth and passes the string between these commas back to the function parser.
    */
    p.parseArguments = function (str){
         // search for commas, be aware of matching parens
         var parenDepth = 0;
         var start = 0;
         var returnArr = [];
         for (var i = 0; i < str.length; i++){
             var c = str.substr(i,1);
             if (c == "," && parenDepth == 0)
             {
                 returnArr.push(this.parseFunctionString(str.substring(start, i)));
                 start = i + 1;
             } else if (c == "("){
                 parenDepth++;
             } else if (c == ")"){
                 parenDepth--;
             }
         }
         returnArr.push(this.parseFunctionString(str.substring(start, str.length)));
         return returnArr;
    }

    
     /** 
     *   Detects whether this argument is a valid event type (with or without a variable), or an expression.
     *   Returns an object that either has an eventType and variable field or an expression field.
     */
     p.parseArgument = function (arg){
         arg = arg.replace(/^\s*/,'').replace(/\s*$/,'');
         // split string with empty space - looking for eventType eventVar syntax
         var strarr = arg.split(/\s+/);
         var eventType = strarr[0];
         // look to see if eventType actually matches a valid event Type
         var eventTypeFound = false;
         for (var i = 0; i < this.eventTypes.length; i++){
             if (eventType == this.eventTypes[i]){
                 eventTypeFound = true; break;
             }
         }        
         var returnObj = {};
         if (eventTypeFound){
             returnObj.eventType = eventType;
             if (strarr.length > 1) returnObj.variable = strarr[1];
             return returnObj;
         } else {
             returnObj.expression = arg;
             return returnObj;
         }
     }

     /**    
    *   Is this parsed object an event?
    */
    p.isEvent = function (obj){
        if (typeof obj.eventType != "undefined"){
            return true;
        } else {
            return false;
        }
    };

    /**    
    *   Is this parsed object a function?
    */
    p.isFunction = function (obj){
        if (typeof obj.functionName != "undefined"){
            return true;
        } else {
            return false;
        }
    };

    /**    
    *   Is this parsed object an expression?
    */
    p.isExpression = function (obj){
         if (typeof obj.expression != "undefined"){
            return true;
        } else {
            return false;
        }
    };

    
    window.FeedbackManager = FeedbackManager;
}(window));