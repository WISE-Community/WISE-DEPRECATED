<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
<title>WISE 4.0 Credits Screen</title>

<link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />

<style>
.blueText {
	color: #0000FF;
	padding: 0 0 0 5px;
}
	
#previewProjectTitle {
	clear:both;
	width:95%;
	text-align: center;
	font-size:2em;
	border: 1px solid #333333;
	background-color:#FFCE8E;
	background-image: url(../images/Gradient_7a.png);
    background-position: bottom;
    background-repeat:repeat-x;
	margin: 20px auto;
	vertical-align:text-bottom;
	padding:10px 0;
}
		
#boxPreviewProject {
	border: 1px solid #006600;
	width:95%;
	margin:15px auto 30px auto;
}
	
#creditsIntroText {
	margin:20px; 
	line-height:130%;
}

#creditsTeamTable {
	margin:10px auto 10px auto;
	width:98%;
	border-collapse:collapse;
	border-top:1px solid #666666;
	border-right:1px solid black;
	border-bottom:1px solid black;
	border-left:1px solid #666666;
	text-align:left;
}

#creditsTeamTable th {
	padding:5px 10px;
	background-color:#000066;
    color:#FFFFFF;
    font-size:1.4em;
	font-weight:bold;
	font-variant:small-caps; 
	vertical-align:top;
}

#creditsTeamTable td {
	padding: 10px;
	border:1px solid #333333;
	background-image: url(../images/textureUltraLightBlue.png); 
    background-position: top;	
    background-repeat: repeat;
    vertical-align:top;
}

.creditCategory {
	font-style:italic; 
	color:#000033;
	font-size:.9em;
	width:100px; 
}

#creditsTeamTable dl {
	line-height:140%;
	margin:0;
	padding:0;
}
 
 #creditsTeamTable dt {
	float:left; 
	width:180px;
	font-weight:bold;
	font-size:.9em;
	margin-left:10px; 
}

#creditsTeamTable dd {
	font-weight:normal;
	color:#333333;
	font-size:.8em;
}

#creditsTeamTable .email {
	color:green;
	margin-left:25px;
}
	
.alumnaeHeader {
	margin: 10px 10px 0 10px;
	font-size:.8em;
	font-variant:small-caps; 
	color:#333333;
}
	
.alumnaeNames {
	margin: 5px 10px 0 10px;
	font-size:.9em;
	color:#000000;
	font-weight:bold;
}

#creditsTeamTable .secondaryDL dt {
 	width:220px;
}
</style>
</head>
<body>
<div id="centeredDiv">

<h1 id="previewProjectTitle" class="blueText">Credits</h1>

<div id="boxPreviewProject">

<div id="creditsIntroText">+credits.3=The open-source WISE 4.0 science education system -- in conjunction with the TELS, CLEAR, MODELS, LOOPS, and VISUAL research projects -- has reached fruition through the dedicated efforts of the individuals listed below.</div>

<table border="0" cellpadding="4" id="creditsTeamTable">
	<tr>  
		<th colspan=2> 
		contributors&nbsp;<span style="font-size:.8em;font-weight:normal;">(alphabetical per section)</span>
		</th>  
	</tr>
	<tr>
		<td class="creditCategory">Program Directors</td> 
		<td>
		<dl> 
			<dt>Ken Bell</dt>
				<dd>The Concord Consortium<span class="email">email: kbell at concord dot org</span></dd>
			<dt>Jane Bowyer</dt>
				<dd>Mills College <span class="email">email: jane at mills dot edu</span></dd>
			<dt>S. Raj Chaudbury</dt>
				<dd>Christopher Newport University <span class="email">email: schaudhury at cnu dot edu</span></dd>
			<dt>Doug Clark</dt>
				<dd>Arizona State University <span class="email">email: dbc at asu dot edu</span></dd>
						<dt>Chad Dorsey</dt>
				<dd>The Concord Consortium<span class="email">email: cdorsey at concord dot org</span>
			<dt>Chris Hoadley</dt>
				<dd>Pennsylvania State University <span class="email">email: tophe at psu dor edu</span></dd>
			<dt>Paul Horwitz</dt>
				<dd>The Concord Consortium <span class="email">email: paul at concord dot org</span></dd>
			<dt>Yael Kali</dt>
				<dd>Technion--Israel Institute of Technology <span class="email">email: yael dot kail at gmail dot com</span></dd>
			<dt>Marica Linn</dt>
				<dd>University of California, Berkeley <span class="email">email: mlinn at berkeley dot edu</span></dd>
			<dt>Tun Nyein</dt>
				 <dd>North Carolina Central University <span class="email">email: tnyein at nccu dot edu</span></dd>
			<dt>James Slotta</dt>
				<dd>University of Toronto <span class="email">email: jslotta at oise dot utoronto dot ca</span></dd>
			<dt>Bob Tinker</dt>
				<dd>The Concord Consortium <span class="email">email: bob at concord dot org<span></dd>
		</dl>
		</td> 	
	</tr> 
	<tr>
		<td class="creditCategory">Software Programming Team</td> 
		<td>
			<dl> 
			<dt>Jon Breitbart</dt>
				<dd>Univerity of California, Berkeley <span class="email">email: breity at berkeley dot edu</span></dd>
			<dt>Geoffrey Kwan</dt>
				<dd>Univerity of California, Berkeley <span class="email">email: geoffreykwan at gmail dot com</span></dd>
			<dt>Patrick Lawler</dt>
				<dd>Univerity of California, Berkeley <span class="email">email: shadowtorn at gmail dot com</span></dd>
			<dt>Hiroki Terashima</dt>
				<dd>Univerity of California, Berkeley <span class="email">email: hirochan at berkeley dot edu</span></dd>
			</dl>
			<div class="alumnaeHeader">WISE 2.0, WISE 3.0 and Contributors (alphabetical)</div>
			<div class="alumnaeNames">Sally Ahn, Turadg Aleahmad, Stephen Bannasch, Scott Cytacki, Brian Levy, Jeff Marrow, Dustin Masterson, Zach Millman, Anthony Perritano, Archana Raghunathan, 
Jinna Lei, Noah Paessel, Greg Pitter, Rokham Sadeghnezhadfard, Jeff Schoner, Nathaniel Titterton, Aaron Unger, Cynick Young, Laurel Williams</div>
				
		</td> 	
	</tr>
	<tr>
		<td class="creditCategory">Interactive Design (UX/Interface)</td> 
		<td>
			<dl> 
			<dt>Matt Fishbach</dt>
				<dd>Univerity of California, Berkeley<span class="email">email: fish771 at yahoo dot com</span>
			</dl>
		</td> 
	</tr>
	<tr>
		<td class="creditCategory">Project Manager</td> 
		<td>
			<dl>
			<dt>Kathy Benneman</dt>
				<dd>Univerity of California, Berkeley <span class="email">email: kbenneman at berkeley dot edu</span></dd>
			</dl>
			<div class="alumnaeHeader">alumnae</div>
			<div class="alumnaeNames">Freda Husic</div>
		</td>  
	</tr>
	<tr>
		<td class="creditCategory">Classroom/Teacher Support</td> 
		<td>
			<dl>
			<dt>Doug Kirkpatrick</dt>
				<dd>Univerity of California, Berkeley  <span class="email">email: dougkirk at berkeley dot edu</span></dd>
			</dl>
		</td>  
	</tr>
	<tr>
		<td class="creditCategory">Project & Grant Support</td> 
		<td>
		<dl>
		<dt>David Crowell</dt>
				<dd>Univerity of California, Berkeley <span class="email">email: dcrowell at berkeley dot edu</span></dd>

		<dt>Suparna Kudesia  </dt>
				<dd>Univerity of California, Berkeley <span class="email">email: skudesia at berkeley dot edu</span></dd>
		</dl> 
		</td> 
		
	</tr>
	<tr>
	<td class="creditCategory">WISE/TELS Research Team</td>  
		<td>
		<dl class="secondaryDL">
			<dt>Hsin-Yi Chang</dt> <dd></dd>
			<dt>Jennie Chiu</dt> <dd></dd>
			<dt>Stephanie Corliss,</dt> <dd></dd>
			<dt>Paul Dabenmire</dt> <dd></dd>
			<dt>Andrew Fisher</dt> <dd></dd>
			<dt>Libby Gerard</dt> <dd></dd>
			<dt>Tara Higgins</dt> <dd></dd>
			<dt>Patty Holman</dt> <dd></dd>
			<dt>Jeff Holmes</dt> <dd></dd>
			<dt>Diane Johnson</dt> <dd></dd>
			<dt>Samantha Johnson</dt> <dd></dd>
			<dt>Nathan Kirk</dt> <dd></dd>
			<dt>Hee-Sun Lee</dt> <dd></dd>
			<dt>Joey Lee</dt> <dd></dd>
			<dt>Dalit Levy</dt> <dd></dd>
			<dt>Jacqueline Madhok</dt> <dd></dd>
			<dt>Paul Mazzei</dt> <dd></dd>
			<dt>Kevin McElhaney</dt> <dd></dd>
			<dt>Muhsin Meneskse</dt> <dd></dd>
			<dt>Frank Raminrez-Marin</dt> <dd></dd>
			<dt>Tamar Ronen-Fuhrmann</dt> <dd></dd>
			<dt>Kelly Ryoo</dt> <dd></dd>
			<dt>Barrington Ross</dt> <dd></dd>
			<dt>Beat Schwendimann,</dt> <dd></dd>
			<dt>Michelle Spitulnick</dt> <dd></dd>
			<dt>Ji Shen</dt> <dd></dd>
			<dt>Tina Skjerping</dt> <dd></dd>
			<dt>Vanessa Svihla</dt> <dd></dd>
			<dt>Erika Tate</dt> <dd></dd>
			<dt>Keisha Varma,</dt> <dd></dd>
			<dt>Stephanie Touchman</dt> <dd></dd>
			<dt>Michelle Williams</dt> <dd></dd>
			<dt>Zhihui (Helen) Zhang</dt> <dd></dd>
		</dl>
		</td>
	</tr>
	<tr>
		<td class="creditCategory">Participating School Districts</td> 
		<td>
			<dl class="secondaryDL">
			<dt>Mount Diablo Unified (CA)</dt>
				<dd>Foothill Middle School, Sequoia MS, Pine Hollow MS</dd>
			<dt>Martinez Unified (CA)</dt>
				<dd>Martinez Middle School, Martinez High School</dd>
			<dt>Albany Unified (CA)</dt> 
				<dd>Albany Middle School, Albany High School</dd> 
			</dl>
		</td>  
	</tr>
	<tr>
		<td class="creditCategory">WISE Translators</td>  
		<td>
			<dl>
			<dt>Chinese (Simplified)</dt>
				<dd>Nathan Zhao</dd>
			</dl>
			<dl>
			<dt>Chinese (Traditional)</dt>
				<dd>Researchers at National Kaohsiung Normal University</dd>
			</dl>
			<dl>
			<dt>Dutch</dt>
				<dd>Annelies Raes, Stefanie De Sloovere</dd>
			</dl>
			<dl>
			<dt>Korean</dt>
				<dd>Se Jin Youn</dd>
			</dl>
			<dl>
			<dt>Spanish</dt>
				<dd>Cristian Rizzi</dd>
			</dl>
		</td>  
	</tr>	
	<tr>
		<td class="creditCategory">Special Thanks To</td>  
		<td>
			<dl>
			<dt>Amanda the Panda</dt>
				<dd>The WISE Mascot, 1996-2010</dd>
			</dl>
		</td>  
	</tr>	
	</table>

</div>
	
</div>   <!-- end of centered div-->
</body>
</html>