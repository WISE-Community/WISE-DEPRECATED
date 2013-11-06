README

Updates from Jonathan Vitale, 3/4/2013
Tag Maps: (all set a mustCompleteBeforeAdvancing constraint)
- mustNotExceedAvgErrorBeforeAdvancing - If the average error (total deviation from expected results/points) is less than this threshold release constraint.
- mustNotExceedMaxErrorBeforeAdvancing - If the maximum error (largest deviation from expected results) is less than this threshold release constraint.
- mustSpanDomainBeforeAdvancing - If user graph spans from minimum to maximum x value release this constraint

New parameters in the json file:
- @ allowDragPoint - if set to true points can be dragged up and down, remain on same x-value
- @ createPrediction - if set to false the graph can not be updated, used in conjunction with other Sensor or CarGraph steps to force revisiting of previous nodes.
- @ animationTimeScaleFactor - currently runs at every 200ms, multiply this by scale factor, default 1.0
- @ tickSpacing - set the interval for which animation ticks will be displayed, e.g. from 0 to 1000 by 100 use 100 here.

-- Within graphParams:
--- @ easyClickExtremes - If true border is thickened and any click on border creates a point within bounds of the graph (e.g. user clicks at x = -1 on graph showing x = 0..10, places point at x = 0).
--- @coordsFollowMouse - If true coordinates hover next to mouse rather than being placed on top of graph.
--- @allowNonFunctionalData - If true data will be ordered in sequence of points given, not resorted by x-value.  E.g. if user clicks points at x = 0, x = 3, and x = 2, the points will be connected in that order, not re-ordered.) 

-- Within expectedResults
--- @ useRelativeValues - sets the initial starting y-value of correct version of dynamic image at the starting y-value of user's dynamic image.  Good for showing things like slope without worrying about discrepency in absolute position
