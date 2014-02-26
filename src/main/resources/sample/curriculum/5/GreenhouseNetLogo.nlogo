;;;; Global CLimate Change Netlogo Model
;;;  created for TELS Center
;;   Bob Tinker & Jason Finley (jfinley@ucla.edu)
;    THIS VERSION LAST MODIFIED ON: 6/21/06
;    THIS VERSION:
;      User interaction:        allowed
;      Use-my-start-values:     disabled
;      Population components:   not included
;      Output of user data:     disabled

breed [ clouds ]
breed [ sunray ]
breed [ IR ]
breed [ heat ]
breed [ people ]
breed [ factories ]
breed [ CO2 ]

clouds-own [ cloud-num ]
globals [ sky-top earth-top temperature num-CO2 num-clouds starter stop-now date cycles cycles-per-year run-number
  sun-start albedo-start
  Use-My-Start-Values
  ] ;sunrays-from-all-over IR-from-all-over]


to startup
  clear-all
  
  ;if not (file-exists? "GCCa_data.txt") [
  ;file-open "GCCa_data.txt"
  ;file-type "Model\tCurrent time & date\tModel status\tRun Number\tCycle\tUsing student-selected start values\tChange made\tOld value\tNew Value\tYear in model\tTemperature\tCO2 amount\tCO2 emission\tPopulation\tPop-growth-rate\tSun Brightness\tAlbedo\tNumber of clouds\n"
  ;file-close]
  
  set Use-My-Start-Values 0
  ;this didn't end up working for some reason ;set sunrays-from-all-over 1  ;if true, sunrays will appear from anywhere along the sky.  if false, they'll come from the topleft, heading down and right
  ;this didn't end up working for some reason ;set IR-from-all-over 1 ;if true IR will emerge from anywhere along the ground.  if false, they'll come out kind of from the middle, heading right and up
end

to setup
  let temp-run-number run-number ;otherwise run-number won't survive the clear-all
  clear-all
  set run-number temp-run-number + 1 ;restore and increment run-number
  setup-world
  set starter 1
end

to execute 
  if (stop-now = 1) [
    set stop-now 0
    stop]
  if (starter = 0) [
    set starter 1 
    setup]
  ask clouds [ fd .3 * (0.1 + (3 + cloud-num) / 10) ]  ; move clouds along
  run-sunshine 
  ask patches [ update-albedo ]
  run-heat  ;; moves heat dots
  run-IR    ;; moves the IR arrowheads
  run-CO2   ;; moves CO2 molecules
  update-outputs
  set date date + 1 / cycles-per-year  ;; advance the date.
  ; set year date                                         ;;updates slider where student can choose starting value
  ; set temp temperature                                  ;;updates slider where student can choose starting value
  set cycles cycles + 1  ;;increments cycle #
  if (albedo != albedo-start)
    [;do-output-change-albedo
    set albedo-start albedo]
  if (sun-brightness != sun-start)
    [;do-output-change-sun
    set sun-start sun-brightness]
end

to stop-executing
  set stop-now 1
  ;do-output-stop
  ;export-interface (word "GCCa-StopPic-Run_" (precision run-number 0) "-Cycle_" cycles ".png")
end

to update-outputs
  set-current-plot "Global Temperature"
  plotxy date temperature
end

to update-albedo
  if (pycor = earth-top) [ set pcolor 50 + 9 * albedo ]
end       


to setup-world
  set cycles-per-year 200 ;; this determines how slowly time passes
  set sky-top (max-pycor - 5)
  set earth-top (8 + min-pycor)
  ; ifelse Use-My-Start-Values = true[set temperature temp][set temperature 12 set temp temperature]  ;;if using student's starting values, assign those
   set temperature 12
  ; ifelse Use-My-Start-Values = true[set date year][set date 1 set year date]
    set date 1
  ask patches [                           ;; set colors of the world
      if (pycor = max-pycor) [ set pcolor black ]
      if (pycor < max-pycor) and (pycor > sky-top) [
        set pcolor 9 - scale-color white pycor sky-top max-pycor   ]
      if ((pycor <= sky-top) and (pycor > earth-top)) [
        set pcolor blue + 2 * (pycor + max-pycor) / max-pycor  ]
      if (pycor < earth-top) [ set pcolor red + 3 ]  
      update-albedo ] 
  create-custom-heat 120 [  ;; make some heat objects
     set color 13 ;; + random 4  
     set ycor  random (earth-top + max-pycor) + min-pycor 
     set xcor random (2 * max-pxcor )
     set shape "dot"  ]
  set sun-start sun-brightness ;;this will keep track of where this value started so we can keep an eye out for the student changing it
  set albedo-start albedo  ;;same as above
  ; set-plot-x-range year (year + 50)
  set-plot-x-range date (date + 50)
  ;do-output-startup   
end      


to do-output-startup
  file-open "GCCa_data.txt"
file-type "GCCsimple\t"
file-type date-and-time
file-type "\tSetting Up\t"
file-type run-number
file-type "\t"
file-type cycles
file-type "\t"
ifelse Use-My-Start-Values = true[file-type "yes\t"][file-type "no\t"]
file-type "<n/a>\t"
file-type "<n/a>\t"
file-type "<n/a>\t"
file-type (precision date 3)
file-type "\t"
file-type (precision temperature 3)
file-type "\t"
file-type (num-CO2 * 10)
file-type "\t<n/a>\t<n/a>\t<n/a>\t"
file-type sun-brightness
file-type "\t"
file-type albedo
file-type "\t"
file-type num-clouds
file-type "\n"
  file-close
end

to do-output-stop
  file-open "GCCa_data.txt"
file-type "GCCsimple\t"
file-type date-and-time
file-type "\tStopping\t"
file-type run-number
file-type "\t"
file-type cycles
file-type "\t"
ifelse Use-My-Start-Values = true[file-type "yes\t"][file-type "no\t"]
file-type "<n/a>\t"
file-type "<n/a>\t"
file-type "<n/a>\t"
file-type (precision date 3)
file-type "\t"
file-type (precision temperature 3)
file-type "\t"
file-type (num-CO2 * 10)
file-type "\t<n/a>\t<n/a>\t<n/a>\t"
file-type sun-brightness
file-type "\t"
file-type albedo
file-type "\t"
file-type num-clouds
file-type "\n"
  file-close
end

to do-output-change-addcloud
  file-open "GCCa_data.txt"
file-type "GCCsimple\t"
file-type date-and-time
file-type "\tStudent made change\t"
file-type run-number
file-type "\t"
file-type cycles
file-type "\t"
ifelse Use-My-Start-Values = true[file-type "yes\t"][file-type "no\t"]
file-type "Cloud added\t"
file-type (num-clouds - 1)
file-type "\t"
file-type num-clouds
file-type "\t"
file-type (precision date 3)
file-type "\t"
file-type (precision temperature 3)
file-type "\t"
file-type (num-CO2 * 10)
file-type "\t<n/a>\t<n/a>\t<n/a>\t"
file-type sun-brightness
file-type "\t"
file-type albedo
file-type "\t"
file-type num-clouds
file-type "\n"
  file-close
end   

to do-output-change-removecloud
  file-open "GCCa_data.txt"
file-type "GCCsimple\t"
file-type date-and-time
file-type "\tStudent made change\t"
file-type run-number
file-type "\t"
file-type cycles
file-type "\t"
ifelse Use-My-Start-Values = true[file-type "yes\t"][file-type "no\t"]
file-type "Cloud removed\t"
file-type (num-clouds + 1)
file-type "\t"
file-type num-clouds
file-type "\t"
file-type (precision date 3)
file-type "\t"
file-type (precision temperature 3)
file-type "\t"
file-type (num-CO2 * 10)
file-type "\t<n/a>\t<n/a>\t<n/a>\t"
file-type sun-brightness
file-type "\t"
file-type albedo
file-type "\t"
file-type num-clouds
file-type "\n"
  file-close
end

to do-output-change-addCO2
  file-open "GCCa_data.txt"
file-type "GCCsimple\t"
file-type date-and-time
file-type "\tStudent made change\t"
file-type run-number
file-type "\t"
file-type cycles
file-type "\t"
ifelse Use-My-Start-Values = true[file-type "yes\t"][file-type "no\t"]
file-type "CO2 added\t"
file-type ((num-CO2 - 25) * 10)
file-type "\t"
file-type (num-CO2 * 10)
file-type "\t"
file-type (precision date 3)
file-type "\t"
file-type (precision temperature 3)
file-type "\t"
file-type (num-CO2 * 10)
file-type "\t<n/a>\t<n/a>\t<n/a>\t"
file-type sun-brightness
file-type "\t"
file-type albedo
file-type "\t"
file-type num-clouds
file-type "\n"
  file-close
end   

to do-output-change-removeCO2
  file-open "GCCa_data.txt"
file-type "GCCsimple\t"
file-type date-and-time
file-type "\tStudent made change\t"
file-type run-number
file-type "\t"
file-type cycles
file-type "\t"
ifelse Use-My-Start-Values = true[file-type "yes\t"][file-type "no\t"]
file-type "CO2 removed\t"
file-type ((num-CO2 + 25) * 10)
file-type "\t"
file-type (num-CO2 * 10)
file-type "\t"
file-type (precision date 3)
file-type "\t"
file-type (precision temperature 3)
file-type "\t"
file-type (num-CO2 * 10)
file-type "\t<n/a>\t<n/a>\t<n/a>\t"
file-type sun-brightness
file-type "\t"
file-type albedo
file-type "\t"
file-type num-clouds
file-type "\n"
  file-close
end

to do-output-change-sun
  file-open "GCCa_data.txt"
file-type "GCCsimple\t"
file-type date-and-time
file-type "\tStudent made change\t"
file-type run-number
file-type "\t"
file-type cycles
file-type "\t"
ifelse Use-My-Start-Values = true[file-type "yes\t"][file-type "no\t"]
file-type "sun brightness\t"
file-type sun-start
file-type "\t"
file-type sun-brightness
file-type "\t"
file-type (precision date 3)
file-type "\t"
file-type (precision temperature 3)
file-type "\t"
file-type (num-CO2 * 10)
file-type "\t<n/a>\t<n/a>\t<n/a>\t"
file-type sun-brightness
file-type "\t"
file-type albedo
file-type "\t"
file-type num-clouds
file-type "\n"
  file-close
end

to do-output-change-albedo
  file-open "GCCa_data.txt"

file-type "GCCsimple\t"
file-type date-and-time
file-type "\tStudent made change\t"
file-type run-number
file-type "\t"
file-type cycles
file-type "\t"
ifelse Use-My-Start-Values = true[file-type "yes\t"][file-type "no\t"]
file-type "albedo\t"
file-type albedo-start
file-type "\t"
file-type albedo
file-type "\t"
file-type (precision date 3)
file-type "\t"
file-type (precision temperature 3)
file-type "\t"
file-type (num-CO2 * 10)
file-type "\t<n/a>\t<n/a>\t<n/a>\t"
file-type sun-brightness
file-type "\t"
file-type albedo
file-type "\t"
file-type num-clouds
file-type "\n"
  file-close
end

to add-cloud            ;; erase clouds and then create new ones
  set num-clouds num-clouds + 1
  ;do-output-change-addcloud
  setup-clouds num-clouds
end

to remove-cloud
  if (num-clouds > 0 ) [
      set num-clouds num-clouds - 1
      ;do-output-change-removecloud
      setup-clouds num-clouds ]
end

to setup-clouds [ n ] 
  ask clouds [ die ]
  let i 0
  repeat n
     [ make-cloud  i n
     set i i + 1]
end

to make-cloud [ k n ]                   ;; makes cloud number k out of n total
  let width sky-top - earth-top
  let mid ( sky-top + earth-top ) / 2
  let y mid + width * ((k / n) - 0.3 ) - 2  ;; the ratio k/n determines its altitude
  if k = 0 [set y 6 ]
  let x 2 * (random max-pxcor ) + min-pxcor
  repeat 3 + random 20 [ create-custom-clouds 1  ;; lots of turtles make up a cloud
    [set cloud-num k
    setxy x + (random 9) - 4 y + random random 5
    set color white
    set size 2 + random 2
    set heading 90 
    Set shape "cloud" ]  ]
end

to run-sunshine
  ask sunray [
     fd .3    ;; move sunrays forward
     if ((heading = 20) and (ycor = max-pycor)) [ die ] ] ;; kill rays leaving upward
  create-sunshine  ;; start new sun rays from top
  reflect-sunrays-from-clouds  ;; check for reflection off clouds
  encounter-earth   ;; check for reflection off earth and absorbtion
 end

;;this didn't end up working for some reason
;to create-sunshine
;  if 10 * sun-brightness > random 50
;    [ create-custom-sunray 1 
;      [ set heading 160
;      set color yellow
;      ifelse (sunrays-from-all-over = 1)
;        [setxy (random screen-size-x) screen-edge-y]  ;sunrays come from all over
;        [setxy (random 10) - screen-edge-x  screen-edge-y] ;or come from just topleft
;      ] ]
;end


to create-sunshine
  if 10 * sun-brightness > random 50
    [ create-custom-sunray 1 
      [ set heading 160
      set color yellow
        setxy (random world-width) max-pycor  ;sunrays come from all over
        ;setxy (random 10) - screen-edge-x  screen-edge-y ;or come from just topleft
      ] ]
end
 
to reflect-sunrays-from-clouds
 ask sunray [
    if (count clouds-here > 0 ) [   ;; if sunray shares patch with a cloud
      set heading 180 - heading ]]  ;; turn the sunray around
end 

to encounter-earth
  ask sunray [
    if (ycor <= earth-top) [
      ifelse (100 * albedo > random 100) 
          [ set heading 20  ]           ;; reflect
          [ set heading 95 + random 170 ;; morph into heat energy
            set color 13 ;; + random 4  
            set breed heat    
            set shape "dot"  ]]]
end

;;this didn't end up working for some reason
;to run-heat    ;; advances the heat energy turtles
;  set temperature .99 * temperature + .01 * (1 + .1 * count heat) ;; the temperature is related to the number of heat turtles
;  ask heat [
;    fd .5 * ( random 11 ) / 10
;    if (ycor <= 0 - screen-edge-y )[ set heading 70 - random 170 ] ;; if heading into the earth's core, bounce
;    if (ycor >= earth-top ) [  ;; if heading back into sky
;    ifelse (IR-from-all-over = 1) ;checks whether IR will come from all over the surface or not
;    [ifelse (temperature > 20 + random 40) ;; select more if it is hot
;        [ set breed IR
;        set heading 20
;        set color magenta 
;        set shape "default" ]           ;; let them escape as IR
;        [ set heading 100 + random 160 ]]
;    [ifelse ((temperature > 20 + random 40) and    ;; select more if it is hot
;          (( xcor < screen-edge-x - 8 )  and (xcor + 5 > 0 )))  ;; select some to escape
;        [ set breed IR
;        set heading 20
;        set color magenta 
;        set shape "default" ]           ;; let them escape as IR
;        [ set heading 100 + random 160 ]]]] ;; return them to earth   
;end 

to run-heat    ;; advances the heat energy turtles
  set temperature .99 * temperature + .01 * (1 + .1 * count heat) ;; the temperature is related to the number of heat turtles
  ask heat [
    fd .5 * ( random 11 ) / 10
    if (ycor <= 0 + min-pycor )[ set heading 70 - random 170 ] ;; if heading into the earth's core, bounce
    if (ycor >= earth-top ) [  ;; if heading back into sky

    ;;below makes IR come from all over
    ifelse (temperature > 20 + random 40) ;; select more if it is hot
        [ set breed IR
        set heading 20
        set color magenta 
        set shape "default" ]           ;; let them escape as IR
        [ set heading 100 + random 160 ]]]
        
    ;;below makes IR come from only right side
;    ifelse ((temperature > 20 + random 40) and    ;; select more if it is hot
;          (( xcor < screen-edge-x - 8 )  and (xcor + 5 > 0 )))  ;; select some to escape
;        [ set breed IR
;        set heading 20
;        set color magenta 
;        set shape "default" ]           ;; let them escape as IR
;        [ set heading 100 + random 160 ]]] ;; return them to earth   
end
 

to run-IR
  ask IR [
    fd .3
    if (ycor >= max-pycor ) [ die ]
    if (ycor <= earth-top ) [   ;; convert to heat 
      set breed heat
      set heading 95 + random 170
      set color 13 ;; + random 4  
      set shape "dot" ]
    if (count CO2-here > 0)   ;; check for collision with CO2
      [ set heading 180 - heading ]]
end

to add-CO2  ;; randomly adds 25 CO2 molecules to atmosphere
  let width sky-top - earth-top
  if (num-CO2 < 150) [  ;; stop adding CO2 at 150 molecules--more slow the model too much
    repeat 25 [
      create-custom-CO2 1
        [ set color green
        set shape "molecule water"
        setxy random (2 * max-pxcor) + min-pxcor earth-top + random width
        set heading random 360 ]] ;; heading is used to spin molecule 
  set num-CO2 count CO2 
  ;do-output-change-addCO2
  ]  
end

to remove-CO2 ;; randomly remove 25 CO2 molecules
  repeat 25 [
    if (count CO2 > 0 ) [
      ask one-of CO2 [ die ]]]
  set num-CO2 count CO2
  ;do-output-change-removeCO2
end

to run-CO2
  let d 0
  ask CO2 [
    set heading heading + (random 51) - 25 ;; turn a bit
    fd .01 * (5 + random 10) ;; move forward a bit
    if (ycor <= earth-top + 1) [set heading 45 - random 90 ] ;; bounce off earth
    if (ycor >= sky-top) [set heading 135 + random 90] ] ;; bounce off sky top
end























@#$#@#$#@
GRAPHICS-WINDOW
296
62
851
437
24
15
11.12245
1
10
1
1
1
0
1
1
1
-24
24
-15
15

CC-WINDOW
5
451
860
546
Command Center
0

BUTTON
9
10
64
43
Reset
Setup
NIL
1
T
OBSERVER
T
NIL

BUTTON
69
10
124
43
Go
execute
T
1
T
OBSERVER
T
NIL

SLIDER
9
46
182
79
Sun-brightness
Sun-brightness
0
5
1.5
0.1
1
NIL

SLIDER
9
81
182
114
Albedo
Albedo
0
1
0.6
0.02
1
NIL

PLOT
9
117
289
423
Global Temperature
Date (years)
Temp (¡C)
0.0
50.0
0.0
100.0
true
false
PENS
"default" 1.0 0 -2674135 false

BUTTON
563
10
641
43
Add CO2
add-CO2
NIL
1
T
OBSERVER
T
NIL

BUTTON
642
10
733
43
Remove CO2
remove-CO2
NIL
1
T
OBSERVER
T
NIL

MONITOR
185
65
289
114
Temperature(¡C)
Temperature
1
1

BUTTON
329
10
417
43
Form Cloud
add-cloud
NIL
1
T
OBSERVER
T
NIL

BUTTON
418
10
517
43
Remove Cloud
remove-cloud
NIL
1
T
OBSERVER
T
NIL

MONITOR
735
10
851
59
CO2 Level (ppm)
Num-CO2 * 10
0
1

BUTTON
127
10
182
43
Stop
stop-executing
NIL
1
T
OBSERVER
T
NIL

BUTTON
202
10
289
43
Watch Sunray
watch one-of sunray
NIL
1
T
OBSERVER
T
NIL

@#$#@#$#@
WHAT IS IT?
-----------
This is a simplified model of the Greenhouse Effect.  Greenhouse gas molecules, represented by CO2 in this model, absorb infrared light but not visible light.  These molecules then re-emit some of the absorbed energy towards the earth's surface.

This model shows the earth as rose colored.  On the earth surface is a green strip. Above that is a blue atmosphere, with black space at the top.  Clouds and CO2 molecules can be added to the atmosphere. The CO2 molecules represent the many different greenhouse gases, such as methane.


HOW IT WORKS
------------
Yellow arrowheads stream downward representing sunlight energy. Some of the sunlight reflects off clouds and more can reflect off the earth surface. 

If sunlight is absorbed by the earth, it turns into a red dot, representing heat energy. Each dot represents the energy of one yellow sunlight arrowhead. The red dots randomly move around the earth. The temperature of the earth is related to the total number of red dots. 

Sometimes the red dots transform into infrared (IR) light that heads toward space, carrying off energy. The probability of a red dot becoming IR light depends on the earth temperature. When the earth is cold, few red dots cause IR light; when it is hot, most do. The IR energy is represented by a magenta arrowhead. Each carries the same energy as a yellow arrowhead and as a red dot. The IR light goes through clouds but can bounce off CO2 molecules. 

HOW TO USE IT
-------------
The "Reset" button sets the model to a reasonable approximation of the situation in the year 2000, if "Use-My-Start-Values" is switched off.  If "Use-My-Start-Values" is switched on, "Reset" uses the values in the "year," and "temp" sliders. The "Go" button runs the model and the "Stop" button stops it.

The "sun-brightness" slider controls how much sun energy enters the earth atmosphere. A value of 1.0 corresponds to our sun. Higher values allow you to see what would happen if the earth was closer to the sun, or if the sun got brighter. 

The "albedo" slider controls how much of the sun energy hitting the earth is absorbed. 
If the albedo is 1.0, the earth reflects all sunlight. This could happen if the earth froze and is indicated by a white surface. If the albedo is zero, the earth absorbs all sunlight. This is indicated as a black surface. The earth's albedo is about 0.6. 

You can add and remove clouds with the FORM CLOUDS and REMOVE CLOUDS buttons.  Clouds block sunlight but not IR.

You can add and remove greenhouse gasses, represented as CO2 molecules. CO2 blocks IR light but not sunlight. The buttons add and subtract molecules in groups of 25 up to 150.

The temperature of the earth is related to the amount of heat in the earth. The more red dots you see, the hotter it is. 

The graph and brown box on the left display the Global Temperature over time as the model runs.

The brown box on the top-right simply displays the current value for CO2 Level.

THINGS TO NOTICE
----------------
Follow a single sunlight arrowhead using the WATCH SUNRAY button. This easier if you slow down the model using the slider at the top of the model. 

What happens to the arrowhead when it hits the earth? Describe its later path. Does it escape the earth? What happens then? Do all arrowheads follow similar paths? 

THINGS TO TRY
-------------
1. Play with model. Change the albedo and run the model. 
Add clouds and CO2 to the model and then watch a single sunlight arrowhead. 
What is the highest earth temperature you can produce? 

2. Run the model with a bright sun but no clouds and no CO2. What happens to the temperature? It should rise quickly and then settle down around 50 degrees. Why does it stop rising? Why does the temperatuer continue to bounce around? Remember, the temperature reflects the number of red dots in the earth. When the temperature is constant, there about as many incoming yellow arrowheads as outgoing IR ones. Why? 

3. Explore the effect of albedo holding everything else constant. Does increasing the albedo increase or decrease the earth temperature? When you experiment, be sure to run the model long enough for the temperature to settle down. 

4. Explore the effect of clouds holding everything else constant. 

5. Explore the effect of adding 100 CO2 molecules. What is the cause of the change you observe. Follow one sunlight arrowhead now. 

DETAILS ABOUT THE MODEL
-----------------------
There is a relation between the number of red dots in the earth and the temperature of the earth. This is because the earth temperature goes up as the total thermal energy is increased. Thermal energy is added by sunlight that reaches the earth as well as from infrared (IR) light reflected down to the earth. Thermal energy is removed by IR emitted by the earth. The balance of these determines the energy in the earth with is proportional to its temperature. 

There are, of course, many simplifications in this model. The earth is not a single temperature, does not have a single albedo, and does not have a single heat capacity. Visible light is somewhat absorbed by CO2 and some IR light does bounce off clouds. No model is completely accurate. What is important, is that a model react in some ways like the system it is supposed to model. This model does that, showing how the greenhouse effect is caused by CO2 and other gases that absorb IR. 



USAGE DATA OUTPUT
----------------
This model saves data about how it is used, intended solely for educational research purposes.  The model must be run from a location where it will have write access to the directory it is in.  Because of this, it doesn't currently work as a standalone Java applet.  It also saves teh datat files in the same folder that it is in, rather than a subfolder.  Trying to fix this.

The output consists mainly of one tab-delimited text file, "GCCpop_data.txt", and screenshots of the model.

There are three general times when new data is written to this file:
-When setup is run (either initially or when "Reset" button pressed)
-When the model is stopped (by pressing "Stop" button only)
-When the student makes a change while the model is running (e.g. clicks the "Form cloud" button, or adjusts the sun brightness slider)

In all of the above cases, the current values of all the major variables are written to the file, along with other helpful stuff.  When Stop is clicked, a screen capture of the window is saved also.

CREDITS AND REFERENCES
----------------------
Created Nov 19, 2005 by Robert Tinker for the TELS project. Updated Jan 9, 2006.
Modified Jan - April 2006 by Jason Finley, working with Keisha Varma for the TELS project. 

@#$#@#$#@
default
true
0
Polygon -7500403 true true 150 5 40 250 150 205 260 250

link
true
0
Line -7500403 true 150 0 150 300

link direction
true
0
Line -7500403 true 150 150 30 225
Line -7500403 true 150 150 270 225

airplane
true
0
Polygon -7500403 true true 150 0 135 15 120 60 120 105 15 165 15 195 120 180 135 240 105 270 120 285 150 270 180 285 210 270 165 240 180 180 285 195 285 165 180 105 180 60 165 15

arrow
true
0
Polygon -7500403 true true 150 0 0 150 105 150 105 293 195 293 195 150 300 150

box
false
0
Polygon -7500403 true true 150 285 285 225 285 75 150 135
Polygon -7500403 true true 150 135 15 75 150 15 285 75
Polygon -7500403 true true 15 75 15 225 150 285 150 135
Line -16777216 false 150 285 150 135
Line -16777216 false 150 135 15 75
Line -16777216 false 150 135 285 75

bug
true
0
Circle -7500403 true true 96 182 108
Circle -7500403 true true 110 127 80
Circle -7500403 true true 110 75 80
Line -7500403 true 150 100 80 30
Line -7500403 true 150 100 220 30

butterfly
true
0
Polygon -7500403 true true 150 165 209 199 225 225 225 255 195 270 165 255 150 240
Polygon -7500403 true true 150 165 89 198 75 225 75 255 105 270 135 255 150 240
Polygon -7500403 true true 139 148 100 105 55 90 25 90 10 105 10 135 25 180 40 195 85 194 139 163
Polygon -7500403 true true 162 150 200 105 245 90 275 90 290 105 290 135 275 180 260 195 215 195 162 165
Polygon -16777216 true false 150 255 135 225 120 150 135 120 150 105 165 120 180 150 165 225
Circle -16777216 true false 135 90 30
Line -16777216 false 150 105 195 60
Line -16777216 false 150 105 105 60

car
false
0
Polygon -7500403 true true 300 180 279 164 261 144 240 135 226 132 213 106 203 84 185 63 159 50 135 50 75 60 0 150 0 165 0 225 300 225 300 180
Circle -16777216 true false 180 180 90
Circle -16777216 true false 30 180 90
Polygon -16777216 true false 162 80 132 78 134 135 209 135 194 105 189 96 180 89
Circle -7500403 true true 47 195 58
Circle -7500403 true true 195 195 58

circle
false
0
Circle -7500403 true true 0 0 300

circle 2
false
0
Circle -7500403 true true 0 0 300
Circle -16777216 true false 30 30 240

cloud
false
0
Circle -7500403 true true 13 118 94
Circle -7500403 true true 86 101 127
Circle -7500403 true true 51 51 108
Circle -7500403 true true 118 43 95
Circle -7500403 true true 158 68 134

cow
false
0
Polygon -7500403 true true 200 193 197 249 179 249 177 196 166 187 140 189 93 191 78 179 72 211 49 209 48 181 37 149 25 120 25 89 45 72 103 84 179 75 198 76 252 64 272 81 293 103 285 121 255 121 242 118 224 167
Polygon -7500403 true true 73 210 86 251 62 249 48 208
Polygon -7500403 true true 25 114 16 195 9 204 23 213 25 200 39 123

cylinder
false
0
Circle -7500403 true true 0 0 300

dot
false
0
Circle -7500403 true true 90 90 120

face happy
false
0
Circle -7500403 true true 8 8 285
Circle -16777216 true false 60 75 60
Circle -16777216 true false 180 75 60
Polygon -16777216 true false 150 255 90 239 62 213 47 191 67 179 90 203 109 218 150 225 192 218 210 203 227 181 251 194 236 217 212 240

face neutral
false
0
Circle -7500403 true true 8 7 285
Circle -16777216 true false 60 75 60
Circle -16777216 true false 180 75 60
Rectangle -16777216 true false 60 195 240 225

face sad
false
0
Circle -7500403 true true 8 8 285
Circle -16777216 true false 60 75 60
Circle -16777216 true false 180 75 60
Polygon -16777216 true false 150 168 90 184 62 210 47 232 67 244 90 220 109 205 150 198 192 205 210 220 227 242 251 229 236 206 212 183

fish
false
0
Polygon -1 true false 44 131 21 87 15 86 0 120 15 150 0 180 13 214 20 212 45 166
Polygon -1 true false 135 195 119 235 95 218 76 210 46 204 60 165
Polygon -1 true false 75 45 83 77 71 103 86 114 166 78 135 60
Polygon -7500403 true true 30 136 151 77 226 81 280 119 292 146 292 160 287 170 270 195 195 210 151 212 30 166
Circle -16777216 true false 215 106 30

flag
false
0
Rectangle -7500403 true true 60 15 75 300
Polygon -7500403 true true 90 150 270 90 90 30
Line -7500403 true 75 135 90 135
Line -7500403 true 75 45 90 45

flower
false
0
Polygon -10899396 true false 135 120 165 165 180 210 180 240 150 300 165 300 195 240 195 195 165 135
Circle -7500403 true true 85 132 38
Circle -7500403 true true 130 147 38
Circle -7500403 true true 192 85 38
Circle -7500403 true true 85 40 38
Circle -7500403 true true 177 40 38
Circle -7500403 true true 177 132 38
Circle -7500403 true true 70 85 38
Circle -7500403 true true 130 25 38
Circle -7500403 true true 96 51 108
Circle -16777216 true false 113 68 74
Polygon -10899396 true false 189 233 219 188 249 173 279 188 234 218
Polygon -10899396 true false 180 255 150 210 105 210 75 240 135 240

house
false
0
Rectangle -7500403 true true 45 120 255 285
Rectangle -16777216 true false 120 210 180 285
Polygon -7500403 true true 15 120 150 15 285 120
Line -16777216 false 30 120 270 120

leaf
false
0
Polygon -7500403 true true 150 210 135 195 120 210 60 210 30 195 60 180 60 165 15 135 30 120 15 105 40 104 45 90 60 90 90 105 105 120 120 120 105 60 120 60 135 30 150 15 165 30 180 60 195 60 180 120 195 120 210 105 240 90 255 90 263 104 285 105 270 120 285 135 240 165 240 180 270 195 240 210 180 210 165 195
Polygon -7500403 true true 135 195 135 240 120 255 105 255 105 285 135 285 165 240 165 195

line
true
0
Line -7500403 true 150 0 150 300

line half
true
0
Line -7500403 true 150 0 150 150

molecule water
true
0
Circle -1 true false 183 63 84
Circle -16777216 false false 183 63 84
Circle -7500403 true true 75 75 150
Circle -16777216 false false 75 75 150
Circle -1 true false 33 63 84
Circle -16777216 false false 33 63 84

pentagon
false
0
Polygon -7500403 true true 150 15 15 120 60 285 240 285 285 120

person
false
0
Circle -7500403 true true 110 5 80
Polygon -7500403 true true 105 90 120 195 90 285 105 300 135 300 150 225 165 300 195 300 210 285 180 195 195 90
Rectangle -7500403 true true 127 79 172 94
Polygon -7500403 true true 195 90 240 150 225 180 165 105
Polygon -7500403 true true 105 90 60 150 75 180 135 105

plant
false
0
Rectangle -7500403 true true 135 90 165 300
Polygon -7500403 true true 135 255 90 210 45 195 75 255 135 285
Polygon -7500403 true true 165 255 210 210 255 195 225 255 165 285
Polygon -7500403 true true 135 180 90 135 45 120 75 180 135 210
Polygon -7500403 true true 165 180 165 210 225 180 255 120 210 135
Polygon -7500403 true true 135 105 90 60 45 45 75 105 135 135
Polygon -7500403 true true 165 105 165 135 225 105 255 45 210 60
Polygon -7500403 true true 135 90 120 45 150 15 180 45 165 90

square
false
0
Rectangle -7500403 true true 30 30 270 270

square 2
false
0
Rectangle -7500403 true true 30 30 270 270
Rectangle -16777216 true false 60 60 240 240

star
false
0
Polygon -7500403 true true 151 1 185 108 298 108 207 175 242 282 151 216 59 282 94 175 3 108 116 108

target
false
0
Circle -7500403 true true 0 0 300
Circle -16777216 true false 30 30 240
Circle -7500403 true true 60 60 180
Circle -16777216 true false 90 90 120
Circle -7500403 true true 120 120 60

tree
false
0
Circle -7500403 true true 118 3 94
Rectangle -6459832 true false 120 195 180 300
Circle -7500403 true true 65 21 108
Circle -7500403 true true 116 41 127
Circle -7500403 true true 45 90 120
Circle -7500403 true true 104 74 152

triangle
false
0
Polygon -7500403 true true 150 30 15 255 285 255

triangle 2
false
0
Polygon -7500403 true true 150 30 15 255 285 255
Polygon -16777216 true false 151 99 225 223 75 224

truck
false
0
Rectangle -7500403 true true 4 45 195 187
Polygon -7500403 true true 296 193 296 150 259 134 244 104 208 104 207 194
Rectangle -1 true false 195 60 195 105
Polygon -16777216 true false 238 112 252 141 219 141 218 112
Circle -16777216 true false 234 174 42
Rectangle -7500403 true true 181 185 214 194
Circle -16777216 true false 144 174 42
Circle -16777216 true false 24 174 42
Circle -7500403 false true 24 174 42
Circle -7500403 false true 144 174 42
Circle -7500403 false true 234 174 42

turtle
true
0
Polygon -10899396 true false 215 204 240 233 246 254 228 266 215 252 193 210
Polygon -10899396 true false 195 90 225 75 245 75 260 89 269 108 261 124 240 105 225 105 210 105
Polygon -10899396 true false 105 90 75 75 55 75 40 89 31 108 39 124 60 105 75 105 90 105
Polygon -10899396 true false 132 85 134 64 107 51 108 17 150 2 192 18 192 52 169 65 172 87
Polygon -10899396 true false 85 204 60 233 54 254 72 266 85 252 107 210
Polygon -7500403 true true 119 75 179 75 209 101 224 135 220 225 175 261 128 261 81 224 74 135 88 99

wheel
false
0
Circle -7500403 true true 3 3 294
Circle -16777216 true false 30 30 240
Line -7500403 true 150 285 150 15
Line -7500403 true 15 150 285 150
Circle -7500403 true true 120 120 60
Line -7500403 true 216 40 79 269
Line -7500403 true 40 84 269 221
Line -7500403 true 40 216 269 79
Line -7500403 true 84 40 221 269

x
false
0
Polygon -7500403 true true 270 75 225 30 30 225 75 270
Polygon -7500403 true true 30 75 75 30 270 225 225 270

@#$#@#$#@
NetLogo 4.1
@#$#@#$#@
@#$#@#$#@
@#$#@#$#@
@#$#@#$#@
