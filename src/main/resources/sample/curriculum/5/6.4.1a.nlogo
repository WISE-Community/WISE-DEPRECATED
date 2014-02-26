
breed [ sunray ]
breed [ IR ]
breed [ heat ]
breed [ CO2 ]
breed [ car ] 
breed [ truck ]
breed [ factory ]

globals [ sky-top earth-top temperature num-CO2 starter sun-brightness albedo car-pollution  truck-pollution factory-pollution xxx]

to setup
  ca
  setup-world
end


to get-pollution ;; computes the number of CO2 molecules required. 
  ;; Reads in the values of the factors that control the Greenhouse Gases
  ;; Computes the amount of CO2 emitted by cars (car-pollution), trucks (truck-pollution), and factories (factory-pollution)
  ;; The choices are now: "Always", "Often", "Sometimes", "Rarely", "Never"
  ;; For example, if the user reports that she is sometimes a vegitarian, f2 is set to 2 and this contribues 3x of this to truck and pollution  
  let f1 fval Recycle_Cans ;; sets f1 to 0, 1, 2, 3, 4, depending on the user input
  let f2 fval Recycle_paper
   set car-pollution 4 * f1 ;; non-walking pollutes a lot
  set truck-pollution f1 + 0 * f2 + 0 ;; walking, heat/cool, veg, and showers
  set factory-pollution f1 + 0 * f2 + 0  ;; walking, Al, heat/cool, elect, veg, showers
end

to-report fval [fstring]
  ;; Converts the choices in fstring into pollution multiplers
  if fstring = "Always" [report 0]
   if fstring = "Sometimes" [report 2]
   if fstring = "Never" [report 4]
end
  
to execute 
  wait 10 / (model_speed ^ 2 + 15)
  if (starter = 0) [
    set starter 1 
    setup-world]
  run-sunshine 
  ask patches [ update-albedo ]
  run-heat  ;; moves heat dots
  run-IR    ;; moves the IR arrowheads
  run-CO2   ;; moves CO2 molecules
  every .5 [
    get-pollution  ;; gets the amount of pollution from each source
    move-and-pollute ] ;; moves the polluters, pollutes, cleans some pollutants 
  set num-CO2 count CO2
end

to update-albedo
  if (pycor = earth-top) [ set pcolor 50 + 9 * albedo ]
end       

to setup-world
  set sun-brightness 1.1
  set albedo .6
  set temperature 12  ;; start with a cold earth
  set sky-top (max-pycor - 5)
  set earth-top (8 + min-pycor)
  ask patches [                           ;; set colors of the world
      if (pycor = max-pycor) [ set pcolor black ]
      if (pycor < max-pycor) and (pycor > sky-top) [
        set pcolor 9 - scale-color white pycor sky-top max-pycor   ]
      if ((pycor <= sky-top) and (pycor > earth-top)) [
        set pcolor blue + 2 * (pycor + max-pycor) / max-pycor  ]
      if (pycor < earth-top) [ set pcolor red + 3 ]  
      update-albedo ] 
   create-heat 60 [ set heading random 360 ;; start with some heat energy in the earth
     setxy min-pxcor + random (max-pxcor - min-pxcor) min-pycor + random (earth-top - min-pycor) ;; scatter throughout earth
     set color 13 + random 4  
     set breed heat    
     set shape "dot"  ]
  ;; place trucks, factories, cars
  create-truck 1 [
    set shape "truck"
    set size 3
    set color red
    setxy -3 * min-pxcor / 4 earth-top + 1
    set heading 90 ]
  create-truck 1 [
    set shape "truck"
    set size 3
    set color blue
    setxy min-pxcor / 4 earth-top + 1
    set heading 90 ]
  create-car 1 [
    set shape "car"
    set size 2
    set color green
    setxy 0 - min-pxcor / 4 earth-top + 1
    set heading 90 ]
  create-car 1 [
    set shape "car"
    set size 2
    set color yellow
    setxy 3 * min-pxcor / 4 earth-top + 1
    set heading 90 ]
  create-factory 1 [
    set shape "factory"
    set size 5
    set color black
    setxy 0 - min-pxcor / 2  earth-top + 2 ]
  create-factory 1 [
    set shape "factory"
    set size 5
    set color black
    setxy  min-pxcor / 2  earth-top + 2 ]
end      

to run-sunshine
  ask sunray [
     fd .3    ;; move sunrays forward
     if ((heading = 20) and (ycor = max-pycor)) [ die ] ] ;; kill rays leaving upward
  create-sunshine  ;; start new sun rays from top
  encounter-earth   ;; check for reflection off earth and absorbtion
 end

to create-sunshine
  if 10 * sun-brightness > random 50
    [ create-sunray 1 
      [ set heading 160
      set color yellow
      setxy min-pxcor + random (max-pxcor - min-pxcor)  max-pycor ] ] ;; start the sunrays anywhere along the top
end

to encounter-earth
  ask sunray [
    if (ycor <= earth-top) [
      ifelse (100 * albedo > random 100) 
          [ set heading 20  ]           ;; reflect
          [ set heading 95 + random 170 ;; morph into heat energy
            set color 13 + random 4  
            set breed heat    
            set shape "dot"  ]]]
end

to run-heat    ;; advances the heat energy turtles
  set temperature .99 * temperature + .01 * (5 + .2 * count heat) ;; the temperature is related to the number of heat turtles
  plot temperature
  ask heat [
    fd .5 * ( random 11 ) / 10
    if (ycor <= 0 + min-pycor )[ set heading 70 - random 170 ] ;; if heading into the earth's core, bounce
    if (ycor >= earth-top ) [  ;; if heading back into sky
      ifelse (temperature > -20 + random 200)    ;; select some to escape, more if it is hot
        [ set breed IR
        set heading -50 + random 100 ;; start the IR off in a random upward direction
        set color magenta 
        set shape "default" ]           ;; let them escape as IR with arrowhead shapes
      [ set heading 100 + random 160 ]]] ;; otherwise return them to earth
end 

to run-IR
  ask IR [
    fd .3
    if (ycor >= max-pycor ) [ die ]
    if (ycor <= earth-top ) [   ;; convert to heat 
      set breed heat
      set heading 95 + random 170
      set color 13 + random 4  
      set shape "dot" ]
    if (count CO2-here > 0)   ;; check for collision with CO2
      [ set heading random 360 ]] ;; send off in a new direction
end

to draw-CO2 [N]  ;; puts N GG molecules into atmosphere randomly placed
  ask CO2 [die] ;; kill off any old GG molecules (called CO2 for simplicity)
  let width sky-top - earth-top
    repeat N [
      create-CO2 1
        [let i random 3
          if i = 0 [set shape "co2"]
          if i = 1 [set shape "molecule water"]
          if i = 2 [set shape "black ball"]
          set color black
          setxy random (2 * max-pxcor) + min-pxcor earth-top + random width
          set heading random 360 ]] ;; heading is used to spin molecule 
  set num-CO2 count CO2 
end

to run-CO2
  let d 0
  ask CO2 [
    set heading heading + (random 51) - 25 ;; turn a bit
    fd .01 * (5 + random 10) ;; move forward a bit
    if (ycor <= earth-top + 1) 
       [ifelse random 100 > 10   ; change the number to get more or fewer to be absorbed
          [die] ; be absorbed
          [set heading 45 - random 90 ]] ; bounce off earth
    if (ycor >= sky-top) [set heading 135 + random 90] ] ;; bounce off sky top
end

to add-CO2 [N xlocation ylocation] ;; adds 0 to N-1 (selected at random) pollution molecules at xlocation ylocation
    repeat N [
      create-CO2 1
        [let i random 3
          if i = 0 [set shape "co2"]
          if i = 1 [set shape "molecule water"]
          if i = 2 [set shape "black ball"]
          set color black
          setxy xlocation ylocation
          set heading random 180 - 90 ]] ;; head upward
  set num-CO2 count CO2 
end

to remove-CO2 [N] ;; randomly remove N CO2 molecules
  repeat N [
    if (count CO2 > 0 ) [
      ask one-of CO2 [ die ]]]
end

to move-and-pollute ;; moves cars and trucks, emits pollutants from them and factories
  ask car [
    fd .3
    set xxx xcor ]
  add-CO2 car-pollution / 2 xxx earth-top + 1
  ask truck [
    fd .2
    set xxx xcor ]
  add-CO2 truck-pollution / 2 xxx earth-top + 1
  ask factory [ set xxx xcor ]
  add-CO2 factory-pollution / 2  xxx earth-top + 3
  ; remove-CO2 num-CO2 / 5 ;; remove one-fifth of the CO2. (Old code--now CO2 is absorbed by the earth)
end
  
    






















@#$#@#$#@
GRAPHICS-WINDOW
343
18
972
440
24
15
12.633
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
0
0
1
ticks

BUTTON
44
12
124
45
Reset
Setup
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL

BUTTON
44
46
124
79
Run
execute
T
1
T
OBSERVER
NIL
NIL
NIL
NIL

PLOT
44
108
344
440
Global Temperature
Years
Celsius
0.0
10000.0
0.0
40.0
true
false
PENS
"default" 1.0 0 -2674135 true

MONITOR
258
60
339
105
NIL
Temperature
1
1
11

CHOOSER
130
60
253
105
Recycle_paper
Recycle_paper
"Always" "Sometimes" "Never"
2

MONITOR
258
12
339
57
GGas
Num-CO2
0
1
11

CHOOSER
130
12
253
57
Recycle_Cans
Recycle_Cans
"Always" "Sometimes" "Never"
2

SLIDER
566
10
738
43
Model_Speed
Model_Speed
0
100
100
1
1
NIL
HORIZONTAL

BUTTON
342
10
467
43
Watch a sunray
watch one-of sunray with [ycor > (max-pycor / 2 ) and heading > 90 ]
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL

BUTTON
833
10
971
43
Watch a pollutant
if num-CO2 > 0 [watch one-of CO2]
NIL
1
T
OBSERVER
NIL
NIL
NIL
NIL

@#$#@#$#@
WHAT IS IT?
-----------
This is a model that illustrates what would happen if everyone on earth adjusted their consumption the same way. The user can explore the effect of different choices on the long-term climate trends. Try to find which changes have no effect and which have the greatest effect. 

This is based on a model of energy flow in the earth. It shows the earth as rose colored. On the earth surface is a green strip. Above that is a blue atmosphere and black space at the top. Pollution molecules are added to the atmosphere from cars and factories. The pollution is represented by different kinds of molecules that block infrared light that the earth emits. 

This is a qualitative model--the actual warming trends are only indicators of the effect of different kinds of consumption. 


HOW IT WORKS
------------
Yellow arrowheads stream downward representing sunlight energy. If sunlight is absorbed by the earth, it turns into a red dot, representing heat energy. Each dot represents the energy of one yellow sunlight arrowhead. The red dots randomly move around the earth. The temperature of the earth is related to the total number of red dots. 

Sometimes the red dots transform into infrared (IR) light that heads toward space, carrying off energy. The probability of a red dot becoming IR light depends on the earth temperature. When the earth is cold, few red dots cause IR light; when it is hot, most do. The IR energy is represented by a magenta arrowhead. Each carries the same energy as a yellow arrowhead and as a red dot. The IR light goes through clouds but can bounce off CO2 molecules. 

HOW TO USE IT
-------------
To see what is happening, slow down the model with the slider above the model. To get longer runs, speed it up. 

Experiment with the different kinds of actions by selecting different settings from the pull-down menu. Let the model run until it settles down. Try to estimate the average temperature over several minutes. 

ght arrowhead now. 

DETAILS ABOUT THE MODEL
-----------------------
There is a relation between the number of red dots in the earth and the temperature of the earth. This is because the earth temperature goes up as the total thermal energy is increased. Thermal energy is added by sunlight that reaches the earth as well as from infrared (IR) light reflected down to the earth. Thermal energy is removed by IR emitted by the earth. The balance of these determines the energy in the earth with is proportional to its temperature. 

There are, of course, many simplifications in this model. The earth is not a single temperature, does not have a single albedo, and does not have a single heat capacity. Visible light is somewhat absorbed by CO2 and some IR light does bounce off clouds. No model is completely accurate. What is important, is that a model react in some ways like the system it is supposed to model. This model does that, showing how the greenhouse effect is caused by CO2 and other gases that absorb IR. 

CREDITS AND REFERENCES
----------------------
Created Nov 19, 2005 by Robert Tinker for the TELS project. Updated Jan 9, 2006. Updated Jan 2010. 

@#$#@#$#@
default
true
0
Polygon -7500403 true true 150 5 40 250 150 205 260 250

airplane
true
0
Polygon -7500403 true true 150 0 135 15 120 60 120 105 15 165 15 195 120 180 135 240 105 270 120 285 150 270 180 285 210 270 165 240 180 180 285 195 285 165 180 105 180 60 165 15

arrow
true
0
Polygon -7500403 true true 150 0 0 150 105 150 105 293 195 293 195 150 300 150

black ball
true
0
Circle -7500403 true true 45 90 120
Circle -7500403 true true 135 90 120

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

co2
true
0
Circle -16777216 true false 0 90 120
Circle -16777216 true false 180 90 120
Circle -13345367 true false 75 75 150

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
Circle -7500403 true true 90 75 120

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

factory
false
0
Rectangle -7500403 true true 76 194 285 270
Rectangle -7500403 true true 36 95 59 231
Rectangle -16777216 true false 90 210 270 240
Line -7500403 true 90 195 90 255
Line -7500403 true 120 195 120 255
Line -7500403 true 150 195 150 240
Line -7500403 true 180 195 180 255
Line -7500403 true 210 210 210 240
Line -7500403 true 240 210 240 240
Line -7500403 true 90 225 270 225
Circle -1 true false 37 73 32
Circle -1 true false 55 38 54
Circle -1 true false 96 21 42
Circle -1 true false 105 40 32
Circle -1 true false 129 19 42
Rectangle -7500403 true true 14 228 78 270

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
@#$#@#$#@
default
0.0
-0.2 0 1.0 0.0
0.0 1 1.0 0.0
0.2 0 1.0 0.0
link direction
true
0
Line -7500403 true 150 150 90 180
Line -7500403 true 150 150 210 180

@#$#@#$#@
0
@#$#@#$#@
