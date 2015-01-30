function SetupThemes() {
};

/*
 * This array specifies what themes will be available in the vle.
 * If you want a theme to be available in the vle, you must add
 * an object to the array below that contains the themeName and 
 * an array of the navigation mode names.
 * The first theme in the list will be the default.
 */
SetupThemes.activeThemes = [
	{
		themeName:"wise",
		themeNavModes: ["classic","classic_right"]
	},
	{
		themeName:"starmap",
		themeNavModes: ["standard","map"]
	}
];

//register the active themes with the component loader
for(var i=0;i<SetupThemes.activeThemes.length;i++){
	componentloader.addTheme(SetupThemes.activeThemes[i].themeName, SetupThemes.activeThemes[i].themeNavModes);
}

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/themes/setupThemes.js');
}