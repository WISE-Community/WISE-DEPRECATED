<%@ include file="../include.jsp"%>
<c:choose>
    <c:when test="${empty param.userLocale}">
        <!-- case when user needs to choose locale. This is the very first thing they need to do. -->
        <html>
        <head>

            <script type="text/javascript">
                var supportedLocalesString = "${supportedLocales}";
                var supportedLocales = supportedLocalesString.split(",");  //[ "en","ar","zh_TW","zh_CN","nl","fr","de","he","it","ja","ko","pt","es","th","tr" ];
            </script>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
            <meta http-equiv="X-UA-Compatible" content="chrome=1" />
            <link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
            <title>WISE Translation Tool</title>

            <link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
            <link href="${contextPath}/<spring:theme code="jquerystylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
            <link href="${contextPath}/<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
            <link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" media="screen" rel="stylesheet" type="text/css" >

            <script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource"/>"></script>
            <script type="text/javascript" src="${contextPath}/<spring:theme code="jqueryuisource"/>"></script>
            <script type="text/javascript" src="${contextPath}/<spring:theme code="superfishsource"/>"></script>
            <script type="text/javascript" src="${contextPath}/<spring:theme code="jquerymigrate.js"/>"></script>

            <script type="text/javascript" src="${contextPath}/portal/translate/js/common.js"></script>
            <script type="text/javascript">

                $(document).ready(function() {

                    // add supported locales to selectable drop-down list
                    for (var i=0; i<supportedLocales.length; i++) {
                        var supportedLocale = supportedLocales[i];
                        if (supportedLocale != "en") {
                            $("#userLocaleSelect").append("<option value='"+supportedLocale+"'>"+localeToHumanReadableLanguage(supportedLocale)+" ("+supportedLocale+") "+"</option>");
                        }
                    };

                    // add option for new languages
                    $("#userLocaleSelect").append("<option id='otherLanguage'>Other...</option>");

                    $("#userLocaleSelect").change(function() {
                        var idSelected = $(this).find("option:selected").attr("id");
                        if (idSelected == "otherLanguage") {
                            alert('Please contact WISE with your name and the language you\'d like to translate to.\n\nWe will add the language and let you know so you can start translating. Thanks!');
                        } else {
                            // add userLocale to url param
                            var localeSelected = $(this).find("option:selected").attr("value");
                            window.location = "${contextPath}/translate?userLocale=" + localeSelected;
                        }
                    });
                });
            </script>
            <style type="text/css">
                #loginDiv {
                    width: 400px;
                    height: 250px;
                    background-color: #FFF9EF;
                    padding:20px;

                    position: absolute;
                    top:0;
                    bottom: 0;
                    left: 0;
                    right: 0;

                    margin: auto;

                    border:2px solid;
                    border-radius:25px;
                }

                table {
                    margin-left:5px;
                }

                td {
                    padding: 2px;
                }
            </style>
        </head>
        <body>
        <div id="loginDiv">
            <h2 style="margin-top:0px">WISE Translation Tool</h2>
            <br/>
            <p> Thank you for helping us translate WISE!! You can use this page to translate the WISE student and teacher pages.<br/><br/>Choose the language that you want to translate to. If you don't see your language listed, or if you have any questions, please <a href="${contextPath}/contact/contactwise.html">contact us.</a></p>
            <br/>
            <form>
                <table>
                    <tr><td>Language:</td>
                        <td>
                            <select id="userLocaleSelect" name="userLocale">
                                <option value="">Choose a language...</option>
                            </select>
                        </td>
                    </tr>
                    <tr></tr>
                    <tr></tr>
                    <tr></tr>
                </table>
            </form>
        </div>
        <script type="text/javascript">

            var _gaq = _gaq || [];
            _gaq.push(['_setAccount', 'UA-789725-7']);
            _gaq.push(['_trackPageview']);

            (function() {
                var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
                ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
            })();

        </script>
        </body>
        </html>
    </c:when>
    <c:when test="${!empty param.userLocale && empty param.projectType}">
        <!-- case when user has chosen a locale but not the project to translate. Show them the translatable projects -->
        <!DOCTYPE html>
        <html dir="${textDirection}">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
            <meta http-equiv="X-UA-Compatible" content="chrome=1" />
            <link rel="shortcut icon" href="${contextPath}/<spring:theme code="favicon"/>" />
            <title>WISE Translation Tool</title>

            <link href="${contextPath}/<spring:theme code="globalstyles"/>" media="screen" rel="stylesheet"  type="text/css" />
            <link href="${contextPath}/<spring:theme code="jquerystylesheet"/>" media="screen" rel="stylesheet" type="text/css" />
            <link href="${contextPath}/<spring:theme code="teacherhomepagestylesheet" />" media="screen" rel="stylesheet" type="text/css" />
            <link href="${contextPath}/<spring:theme code="superfishstylesheet"/>" media="screen" rel="stylesheet" type="text/css" >

            <script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource"/>"></script>
            <script type="text/javascript" src="${contextPath}/<spring:theme code="jqueryuisource"/>"></script>
            <script type="text/javascript" src="${contextPath}/<spring:theme code="superfishsource"/>"></script>
            <script type="text/javascript" src="${contextPath}/<spring:theme code="jquerymigrate.js"/>"></script>

            <script type="text/javascript" src="${contextPath}/portal/translate/js/common.js"></script>
            <script type="text/javascript" src="${contextPath}/portal/translate/js/jsonFormat.js"></script>
            <script type="text/javascript" src="${contextPath}/portal/translate/js/translateJSON.js"></script>
            <script type="text/javascript" src="${contextPath}/portal/translate/js/translateProperties.js"></script>
            <script type="text/javascript">
                $(document).ready(function() {
                    var currentLanguage = "${param.userLocale}";

                    // show userLocale in the page title
                    $("#userLocale").html(localeToHumanReadableLanguage(currentLanguage));

                    $(".stats").each(function() {
                        var projectType = $(this).attr("projectType");
                        View.prototype.i18n[View.prototype.i18n.defaultLocale] = {};
                        View.prototype.retrieveLocale(View.prototype.i18n.defaultLocale,projectType);

                        View.prototype.i18n[currentLanguage] = {};
                        View.prototype.retrieveLocale(currentLanguage,projectType);

                        // get actual number of completions. Check if value is actually set
                        var defaultLanguageKeys = Object.keys(View.prototype.i18n[View.prototype.i18n.defaultLocale]);
                        var numTotal = defaultLanguageKeys.length;
                        var numCompleted = 0;
                        if (projectType != "portal") {
                            // this is a non-portal project, which uses JSON file format
                            for (var i = 0; i < defaultLanguageKeys.length; i++) {
                                var defaultLanguageKey = defaultLanguageKeys[i];
                                // make sure that there is an actual translated value in the current language
                                if (typeof View.prototype.i18n[currentLanguage][defaultLanguageKey] != "undefined" &&
                                    typeof View.prototype.i18n[currentLanguage][defaultLanguageKey]["value"] != "undefined" &&
                                    View.prototype.i18n[currentLanguage][defaultLanguageKey]["value"].trim() != "") {
                                    numCompleted++;
                                }
                            }
                        } else {
                            // this is the portal project, which uses Properties (key=value) file format
                            // re-calculate number of total translatable keys
                            numTotal = 0;
                            numCompleted = 0;
                            for (var k = 0; k < defaultLanguageKeys.length; k++) {
                                if (!defaultLanguageKeys[k].endsWith(".description")) {
                                    numTotal++;
                                }
                            }
                            for (var i = 0; i < defaultLanguageKeys.length; i++) {
                                var defaultLanguageKey = defaultLanguageKeys[i];
                                // make sure that there is an actual translated value in the current language
                                if (!defaultLanguageKey.endsWith(".description") &&
                                    typeof View.prototype.i18n[currentLanguage][defaultLanguageKey] != "undefined" &&
                                    View.prototype.i18n[currentLanguage][defaultLanguageKey].trim() != "") {
                                    numCompleted++;
                                }
                            }
                        }

                        if (numCompleted < numTotal) {
                            $(this).css("background-color","yellow");
                        } else if (numCompleted > numTotal) {
                            // for some reason numCompleted > numTotal, show as completed so it won't confuse the translator.
                            numCompleted = numTotal;
                        }

                        $(this).append(" ["+ numCompleted + "/" + numTotal + "]");

                        // Also show a button to download the translation file
                        $(this).parent("a").append(" <a href=\"${contextPath}/translate/download/" + projectType + "/" + currentLanguage + "\"><img src=\"${contextPath}/<spring:theme code="download"/>\" alt=\"WISE\" style=\"margin-left:5px; width:18px; height:18px; vertical-align:middle\"></a>");

                    });

                    $(".stats5").each(function() {
                        var projectType = $(this).attr("projectType");

                        View.prototype.i18n["en"] = {};
                        View.prototype.retrieveLocale("en",projectType);

                        View.prototype.i18n[currentLanguage] = {};
                        View.prototype.retrieveLocale(currentLanguage,projectType);
                        // get actual number of completions. Check if value is actually set
                        var defaultLanguageKeys = Object.keys(View.prototype.i18n["en"]);
                        var numTotal = defaultLanguageKeys.length;
                        var numCompleted = 0;

                        // this is a non-portal project, which uses JSON file format
                        for (var i = 0; i < defaultLanguageKeys.length; i++) {
                            var defaultLanguageKey = defaultLanguageKeys[i];
                            // make sure that there is an actual translated value in the current language
                            if (typeof View.prototype.i18n[currentLanguage][defaultLanguageKey] != "undefined" &&
                                typeof View.prototype.i18n[currentLanguage][defaultLanguageKey] != "undefined" &&
                                View.prototype.i18n[currentLanguage][defaultLanguageKey].trim() != "") {
                                numCompleted++;
                            }
                        }

                        if (numCompleted < numTotal) {
                            $(this).css("background-color","yellow");
                        } else if (numCompleted > numTotal) {
                            // for some reason numCompleted > numTotal, show as completed so it won't confuse the translator.
                            numCompleted = numTotal;
                        }

                        $(this).append(" ["+ numCompleted + "/" + numTotal + "]");

                        // Also show a button to download the translation file
                        $(this).parent("a").append(" <a href=\"${contextPath}/translate/download/" + projectType + "/" + currentLanguage + "\"><img src=\"${contextPath}/<spring:theme code="download"/>\" alt=\"WISE\" style=\"margin-left:5px; width:18px; height:18px; vertical-align:middle\"></a>");

                    });

                });
            </script>
            <style>
                ul {
                    list-style: initial;
                    padding-left: 50px;
                }
                h1 {
                    margin: 15px 0px 5px 0px;
                    padding: initial;
                }
                h3 {
                    margin-top: 5px;
                }
                #top {
                    border: 2px solid;
                    border-radius: 25px;
                    background-color: #FFF9EF;
                    padding: 0px 15px 15px 15px;
                }
            </style>
        </head>
        <body>

        <div id="pageWrapper">
            <div id="page">

                <div id="pageContent">
                    <div><a href="${contextPath}/teacher">Back to Teacher Home</a></div>
                    <div id="top">
                    <h1>Welcome to the WISE Translation Tool (English-><span id='userLocale'></span>)</h1>
                        <ul>
                            <li>Items that need translation will be highlighted in yellow.</li>
                            <li>We recommend that you translate in this order:
                                <ul>
                                    <li>WISE5 (Common->VLE->Classroom Monitor->Authoring Tool)</li>
                                    <li>Portal</li>
                                    <li>WISE4 (VLE->Themes->Steps)</li>
                                </ul>
                            </li>
                            <li>You can preview your translations on all projects except the portal by opening another browser tab, opening the relevant tool/step, and refreshing the page as you translate.</li>
                            <li>If you need help, please post to the <a href="https://wise-discuss.berkeley.edu/t/wise-in-other-languages" target=_blank>WISE-Translation Discussion Forum</a> or <a href="${contextPath}/contact/contactwise.html">contact WISE</a>.</li>
                        </ul>
                    </div>
                    <h1>WISE5</h1>
                    <div style="margin-left:50px">
                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=common5">Common Phrases <span class='stats5' projectType='common5'></span></a></h3>
                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=vle5">Virtual Learning Environment (VLE) <span class='stats5' projectType='vle5'></span></a></h3>
                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=authoringTool5">Authoring Tool <span class='stats5' projectType='authoringTool5'></span></a></h3>
                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=classroomMonitor5">Classroom Monitor <span class='stats5' projectType='classroomMonitor5'></span></a></h3>
                    </div>

                    <h1>WISE5 Components</h1>
                    <div style="margin-left:50px">
                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=audioOscillator5">Audio Oscillator <span class='stats5' projectType='audioOscillator5'></span></a></h3>
                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=conceptMap5">Concept Map <span class='stats5' projectType='conceptMap5'></span></a></h3>
                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=discussion5">Discussion <span class='stats5' projectType='discussion5'></span></a></h3>
                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=draw5">Draw <span class='stats5' projectType='draw5'></span></a></h3>
                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=embedded5">Embedded <span class='stats5' projectType='embedded5'></span></a></h3>
                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=graph5">Graph <span class='stats5' projectType='graph5'></span></a></h3>
                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=label5">Label <span class='stats5' projectType='label5'></span></a></h3>
                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=match5">Match <span class='stats5' projectType='match5'></span></a></h3>
                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=multipleChoice5">Multiple Choice <span class='stats5' projectType='multipleChoice5'></span></a></h3>
                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=openResponse5">Open Response <span class='stats5' projectType='openResponse5'></span></a></h3>
                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=table5">Table <span class='stats5' projectType='table5'></span></a></h3>
                    </div>

                    <h1><a href="translate?userLocale=${param.userLocale}&projectType=portal">The Portal <span class='stats' projectType='portal'></span></a></h1>
                    <p>The WISE Portal is the user and classroom management system. This includes user registration and project and run management.</p>

                    <h1>WISE4</h1>
                    <h3><a href="translate?userLocale=${param.userLocale}&projectType=vle">Virtual Learning Environment (VLE) <span class='stats' projectType='vle'></span></a></h3>
                    <p>The VLE includes the Student VLE, Authoring Tool, Grading Tool, and Researcher Tool.</p>

                    <h2>Translate Themes</h2>
                    <div id="themeDiv" style="margin-left:50px">
                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=themewise">WISE Default Theme<span class='stats' projectType='themewise'></span></a></h3>
                        <p>WISE default theme</p>

                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=themestarmap">Starmap Theme<span class='stats' projectType='themestarmap'></span></a></h3>
                        <p>Starmap theme</p>

                    </div>

                    <h2>Translate Steps</h2>
                    <div id="stepDiv" style="margin-left:50px">
                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=assessmentlist">Assessment List (Questionnaire) <span class='stats' projectType='assessmentlist'></span></a></h3>
                        <p>Students answer a collection of questions that require text or multiple choice answers</p>

                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=brainstorm">Brainstorm <span class='stats' projectType='brainstorm'></span></a></h3>
                        <p>Students post their answer for everyone in the class to read and discuss</p>

                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=branching">Branching <span class='stats' projectType='branching'></span></a></h3>
                        <p>Students go down different branches/paths in the project based on various criteria</p>

                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=draw">Draw Step <span class='stats' projectType='draw'></span></a></h3>
                        <p>	Students draw using basic drawing tools, take snapshots and create flipbook animations</p>

                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=explanationbuilder">Explanation Builder <span class='stats' projectType='explanationbuilder'></span></a></h3>
                        <p>Students use ideas from their Idea Basket to generate a response</p>

                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=fillin">Fill In <span class='stats' projectType='fillin'></span></a></h3>
                        <p>Students fill in the missing text blanks in a body of text</p>

                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=flash">Flash <span class='stats' projectType='flash'></span></a></h3>
                        <p>Embed Flash content in a WISE step.</p>

                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=grapher">Grapher <span class='stats' projectType='grapher'></span></a></h3>
                        <p>This is a lightweight version of the grapher step that allows graphing of multiple series, and connects to the cargraph step.</p>

                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=matchsequence">Match & Sequence <span class='stats' projectType='matchsequence'></span></a></h3>
                        <p>Students drag and drop choices into boxes</p>

                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=mw">Molecular Workbench <span class='stats' projectType='mw'></span></a></h3>
                        <p>Students work on a Molecular Workbench applet</p>

                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=multiplechoice">Multiple Choice <span class='stats' projectType='multiplechoice'></span></a></h3>
                        <p>Students answer a multiple choice question</p>

                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=netlogo">NetLogo <span class='stats' projectType='netlogo'></span></a></h3>
                        <p>Students work on a NetLogo activity</p>

                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=openresponse">Open Response <span class='stats' projectType='openresponse'></span></a></h3>
                        <p>Students write text to answer a question or explain their thoughts</p>

                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=sensor">Sensor <span class='stats' projectType='sensor'></span></a></h3>
                        <p>Students plot points on a graph and can use a USB probe to collect data</p>

                        <h3><a href="translate?userLocale=${param.userLocale}&projectType=table">Table <span class='stats' projectType='table'></span></a></h3>
                        <p>Students fill out a table</p>
                    </div>

                </div>
            </div>
        </div>
        </body>
        </html>
    </c:when>
    <c:otherwise>
        <!-- case when user chose locale and project type. ready to translate! -->
        <html>
        <head>
            <title>WISE Translation Tool</title>
            <script type="text/javascript" src="${contextPath}/<spring:theme code="jquerysource"/>"></script>
            <script type="text/javascript" src="${contextPath}/<spring:theme code="jqueryuisource"/>"></script>
            <script type="text/javascript" src="${contextPath}/<spring:theme code="superfishsource"/>"></script>
            <script type="text/javascript" src="${contextPath}/<spring:theme code="jquerymigrate.js"/>"></script>

            <link rel="stylesheet" type="text/css" href="${contextPath}/portal/translate/css/jquery-ui-1.10.0.custom.min.css" />
            <script type="text/javascript" src="${contextPath}/portal/translate/js/common.js"></script>
            <script type="text/javascript" src="${contextPath}/portal/translate/js/jsonFormat.js"></script>
            <script type="text/javascript" src="${contextPath}/portal/translate/js/translateJSON.js"></script>
            <script type="text/javascript" src="${contextPath}/portal/translate/js/translateProperties.js"></script>
            <script type="text/javascript">
                var projectType = "${param.projectType}";
                var currentLanguage = "${param.userLocale}";
                $(document).ready(function() {
                    View.prototype.i18n.defaultLocale = "en";
                    View.prototype.i18n[View.prototype.i18n.defaultLocale] = {};
                    View.prototype.retrieveLocale(View.prototype.i18n.defaultLocale,projectType);

                    View.prototype.i18n[currentLanguage] = {};
                    View.prototype.retrieveLocale(currentLanguage,projectType);

                    var wise5ProjectTypes = ["common5", "vle5", "authoringTool5", "classroomMonitor5"];
                    if (wise5ProjectTypes.indexOf(projectType) > -1 || projectType.endsWith("5")) {
                        // this is a WISE5 project
                        buildTable5();
                    } else {
                        buildTable(projectType);
                    }
                    $("#heading").append(" ").append(projectType).append(" <a href=\"${contextPath}/translate/download/" + projectType + "/" + currentLanguage + "\"><img src=\"${contextPath}/<spring:theme code="download"/>\" alt=\"WISE\" style=\"margin-left:5px; width:18px; height:18px; vertical-align:middle\"></a>");
                });

            </script>
            <style>
                #translationTable {
                    table-layout: fixed;
                    border-collapse:collapse;
                    width: 100%;
                    font-size:1.1em;
                }

                #translationTable, td, th
                {
                    border:1px solid black;
                }

                .cell_key {
                    word-wrap:break-word;
                    width:200px;
                }
            </style>
        </head>
        <body>
        <span style="float:right; margin-right:10px"><a href="${contextPath}/translate?userLocale=${param.userLocale}">Go back to project select page</a> | <a href="${contextPath}/logout">Logout</a></span>
        <h1 id='heading'>WISE Translate: </h1>
        <div id="translationTableDiv">
        </div>
        </body>
        </html>

    </c:otherwise>
</c:choose>
