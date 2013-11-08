README

Updates from Jonathan Vitale, 3/4/2013
Tag Maps: (all set a mustCompleteBeforeAdvancing constraint)
- mustSpanDomainBeforeAdvancing - If user graph spans from minimum to maximum x value release this constraint

New parameters in the json file:
- @ useCustomUnitsAndGraphLabel - if true can set xUnits, yUnits (within graphParams), as well as graphLabel (which really should be seriesLabel, but being consistent with CarGraph).
- @ allowDragPoint - if set to true points can be dragged up and down, remain on same x-value
- @ graphLabel - if useCustomUnitsAndGraphLabel is true the text written here will be used to name the prediction series.

-- Within graphParams:
--- @ xUnits, @ yUnits - If useCustomUnitsAndGraphLabel is true, set these to provide units to hovering coordinates.
--- @ allowUpdateAxisLabel - If true the label on the x- and y- axes can be changed by user
--- @ easyClickExtremes - If true border is thickened and any click on border creates a point within bounds of the graph (e.g. user clicks at x = -1 on graph showing x = 0..10, places point at x = 0).
--- @coordsFollowMouse - If true coordinates hover next to mouse rather than being placed on top of graph.
--- @allowNonFunctionalData - If true data will be ordered in sequence of points given, not resorted by x-value.  E.g. if user clicks points at x = 0, x = 3, and x = 2, the points will be connected in that order, not re-ordered.) 