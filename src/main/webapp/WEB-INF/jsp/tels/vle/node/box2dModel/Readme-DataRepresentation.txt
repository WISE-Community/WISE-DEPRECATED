Stored in each "response" which is saved to the server are the following three objects
savedModels, history, tableData

These may be updated at an event, which include the following types:
'make-model', 'delete-model', 'make-beaker', 'delete-beaker', 'make-scale', 'delete-scale', 'make-beaker', 'delete-beaker', 'add-to-beaker', 'add-to-scale', 'add-to-balance', 'remove-from-beaker', 'remove-from-scale', 'remove-from-balance', 'test-in-beaker', 'test-on-scale', 'test-on-balance'

savedModels:
Description: Provides sufficient information to recreate any model
Update: make-model, delete-model
Details: Each savedObject should have an id, that way there is correspondance to table

history:
Description: Event stream, each event has a type (above)
Update: On intepretation of each event.
Details:
	Each event should have the following:
	type,
	time,
	model [will have all properties described in tableData]

tableData:
Description: For each unique model (and maybe filled vs. unfilled) has a row of values.
Update: make-model, delete-model, test*
Details:
	Each model will have the following in a table:
	id 	|	total_mass	|	total_volume	| total_density |	enclosed_mass |	enclosed_volume	| enclosed_density | volume_displaced | sink_or_float | percent_submerged	 | tested_in_beaker  | tested_on_scale   | tested_on_balance  

	tableData should be structured like this:
	tableData:[
		[
			{text:"x", uneditable:false},
			{text:"3", uneditable:false}
		], 
		[
			{text:"y", uneditable:false},
			{text:"2", uneditable:false}
		]
	]