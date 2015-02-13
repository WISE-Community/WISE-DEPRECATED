
//Called sometime after postMessage is called
function receiveMessage(event)
{
	console.log('event received in multipleChoice.js event.data='+event.data.viewType);
	
    if (event.data.viewType == "author") {
		 document.getElementById("message").appendChild( document.createTextNode("author view") );
	} else if (event.data.viewType == "student") {
		 document.getElementById("message").appendChild( document.createTextNode("student view") );
	} else if (event.data.viewType == "grading") {
		 document.getElementById("message").appendChild( document.createTextNode("grading view") );
	}


  // Do we trust the sender of this message?
  if (event.origin !== "http://example.com:8080")
    return;

  // event.source is window.opener
  // event.data is "hello there!"

  // Assuming you've verified the origin of the received message (which
  // you must do in any case), a convenient idiom for replying to a
  // message is to call postMessage on event.source and provide
  // event.origin as the targetOrigin.
  //event.source.postMessage("hi there yourself!  the secret response " +
    //                       "is: rheeeeet!",
      //                     event.origin);
}

window.addEventListener("message", receiveMessage, false);