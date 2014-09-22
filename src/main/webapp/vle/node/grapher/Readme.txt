Starting with GRIDS, I will document any new features of this tool.

authorview_grapher.js:

Each new series now has a data structure in this.content containing the following elements:
id: name of series (no default)
color: color of points/lines in series (no default)
showLines: will points be connected as segments (default:true)
showPoints: will points show between lines (default: true)
editable: can the user change existing points or add new ones? (default: true)
points: Array of {x, y, fixed} where fixed is whether the points can move (default is 0: not fixed)

Can now create two types of new series.
Point series - disconnected points
Segment series - connected points (default when not specified).
Line series - connected, where no points are showing.

When an author has created a new series, he or she can add points, 
which appear like (__, __, ___) for (x, y, fixed)

grapher.js

To get the independent series to be either connected or disconnected, removed this line from parseParams:
>>> graphParams.series = {lines:{show:true}, points:{show:true}};
because it was setting lines and points to show for all series.
Instead when creating dataSets in plotData, push this into array for each series
>>>{data:expectedPoints, label:graphLabel, color:"blue", lines:lines, points:points,name:graphName}
Where lines is {show:true/false} depending on content
Do this for expected graph too.

Now when user selects a point that is not the currently selected series, 
the radio button changes and the current series changes.
UNLESS the point is near the x-axis or y-axis. In this case we make a new point because it is the
only way to make two series start from the origin or same y-intercept.