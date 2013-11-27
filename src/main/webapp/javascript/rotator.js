<!--
var delay = 3000;
var counter = 0;
var flag=0;
var oldCtr = -1;
var firstLClicked = 0;
var firstRClicked = 0;
var prevClick = -1;

var oldCtr_T = 0;
var counter_T = 0;
var prevClick_T = 0;
var firstLClicked_T = 0;
var firstRClicked_T = 0;

//obtained the tips on rotating Images, source code from http://www.communitymx.com/content/article.cfm?cid=651FF
// Comma separated list of images to rotate
var wiseinactions = new Array('./themes/tels/default/images/wiseInAction/AirBag.png',
                     './themes/tels/default/images/wiseInAction/kidsOnComputer.png',
                     './themes/tels/default/images/wiseInAction/kidsinaquarium.png',
                     './themes/tels/default/images/wiseInAction/csiScreenshot.png',
                     './themes/tels/default/images/wiseInAction/Studentputdata.png',
                     './themes/tels/default/images/wiseInAction/Reflection.png',
                     './themes/tels/default/images/wiseInAction/PondSim.png',
                     './themes/tels/default/images/wiseInAction/OnlineDiscussion.png',
                     './themes/tels/default/images/wiseInAction/MolecularModel.png',
                     './themes/tels/default/images/wiseInAction/SkinCells.png');

var testimonials = new Array('./themes/tels/default/images/testimonial_1B.png',
                             './themes/tels/default/images/testimonial_2B.png',
                             './themes/tels/default/images/testimonial_3B.png',
                             './themes/tels/default/images/testimonial_4B.png',
                             './themes/tels/default/images/testimonial_5B.png');
							
							 
//http://code.blizaga.com/javascript_drawing_gradients.html
function js_gradient(grWidth, grHeight, grDir, grRed1, grGreen1, grBlue1, grRed2, grGreen2, grBlue2) { 
  var i = 0;
  document.write("<div style=\"display: block; width: "+grWidth+"; height: "+grHeight+"\">"); 
  if (grDir == 'horizontal') { 
    while (i < grWidth) {  
      red=grRed1+Math.round(i*((grRed2-grRed1)/grWidth));  
      green=grGreen1+Math.round(i*((grGreen2-grGreen1)/grWidth));  
      blue=grBlue1+Math.round(i*((grBlue2-grBlue1)/grWidth));  
      document.write("<div style=\"display: block; font-size: 1px; ");  
      document.write("width: 1px; height: "+grHeight+"px; float: left;");  
      document.write("background: RGB("+red+","+green+","+blue+"); ");  
      document.write("\"><table width=1 height=1></table></div>");  
      i++;    
    }  
  } 
  else { 
    i=0; 
    while (i < grHeight) { 
      red=grRed1+Math.round(i*((grRed2-grRed1)/grHeight)); 
      green=grGreen1+Math.round(i*((grGreen2-grGreen1)/grHeight)); 
      blue=grBlue1+Math.round(i*((grBlue2-grBlue1)/grHeight)); 
      document.write("<div style=\"display: block; font-size: 1px; "); 
      document.write("width: "+grWidth+"px; height: 1px; "); 
      document.write("background: RGB("+red+","+green+","+blue+"); "); 
      document.write("\"><table width=1 height=1></table></div>"); 
      i++;   
    } 
  } 
//  document.write("</div>");
}

							 
function MM_findObj(n, d) { //  v4.01
  var p,i,x;  if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length) {
    d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}
  if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
  for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);
  if(!x && d.getElementById) x=d.getElementById(n); return x;
}

function MM_swapImage() { //v3.01
  var i,j=0,x,a=MM_swapImage.arguments; document.MM_sr=new Array; for(i=0;i<(a.length-2);i+=3)
   if ((x=MM_findObj(a[i]))!=null){document.MM_sr[j++]=x; if(!x.oSrc) x.oSrc=x.src; x.src=a[i+2];}
}

function setLClicked(){
  if(firstLClicked==0){
    firstLClicked = 1;
  }else{
    firstLClicked = 2;
  }
    return firstLClicked;
}

function setLClicked_T(){
 if(firstLClicked_T==0){
    firstLClicked_T = 1;
 }else{
    firstLClicked_T = 2;
 }
    return firstLClicked_T;
}

function setRClicked(){
  if(firstRClicked==0){
    firstRClicked = 1;
  }else{
    firstRClicked = 2;
  }
    return firstRClicked;
}

function setRClicked_T(){
 if(firstRClicked_T==0){
    firstRClicked_T = 1;
 }else{
    firstRClicked_T = 2;
 }
    return firstRClicked_T;
}

function swapBigImage(index,counter,whichAction){
  if(whichAction=='Action'){
	flag=1;
	MM_swapImage('rotator', '', wiseinactions[index]);
	counter=index;
	return counter;
  }else{
    MM_swapImage('rotatorT','',testimonials[index]); 
    counter_T=index;	
    return counter_T;
   }	
}

function getPrevClick(prevClick,curr,oldCtr){
      if(prevClick < 0){
			prevClick = oldCtr-1;
      }
	   prevClick = curr;
   	   return prevClick;
}

function getPrevClick_T(prevClick_T,curr,oldCtr_T){
    if(prevClick_T < 0){
	  prevClick_T = oldCtr_T - 1;
	}
	
	prevClick_T = curr;
	return prevClick_T;
}

function proceedToPreviousImage(counter){
  counter = counter-1;
  if(counter<0){
    counter=9;
	}
	MM_swapImage('rotator','', wiseinactions[counter]);
	prevClick=counter;
	return counter;
}

function proceedToNextImage(counter){
  counter=counter+1;
  
  if(counter == (wiseinactions.length)){
    counter = 0;
  }
  MM_swapImage('rotator', '', wiseinactions[counter]);
  prevClick=counter+1;
  return counter;
}

function proceedToPreviousImage_T(counter_T){
  counter_T = counter_T-1;
  if(counter_T<0){
    counter_T=4;
	}
	MM_swapImage('rotatorT','', testimonials[counter_T]);
	prevClick=counter_T;
	return counter_T;
}

function proceedToNextImage_T(counter_T){
  counter_T=counter_T+1;
  
  if(counter_T == (testimonials.length)){
    counter_T = 0;
  }
  MM_swapImage('rotatorT', '', testimonials[counter_T]);
  prevClick=counter_T+1;
  return counter_T;
}

function randomImages(){
   if(flag==0){
	//colorImage(counter,0);
   
	if(counter == (imgs.length)){
		counter = 0;
	}
  
	MM_swapImage('rotator', '', imgs[counter++]);
	changeImageNum('actionImgLink',counter);
	//colorImage(counter,2);
	setTimeout('randomImages()', delay);
	}
}

function changeImageNum(id,value){
	document.getElementById(id).innerHTML = value + " of 10";
}
//-->
