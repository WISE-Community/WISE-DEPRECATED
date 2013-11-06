Steps of this type can be any of several subtypes, specified in the "mode" property of the step JSON.
Valid subtypes:
	map - View the Star Map, a graphical navigation interface for the entire WISE project.
	tutorial - Play a prefabricated tutorial mission to learn the basics of the game (recommended in any project containing a "mission" subtype).
	mission - Play a mission, specified by the provided "levelString" value.
	editor - Build and test your own unique mission, starting with the provided "levelString" value.
	adaptiveMission - Automatically selects from a predefined list of missions based on the player's needs (see app/AdaptiveMissions.so.xml).
	adaptiveQuiz - Automatically selects from a predefined list of quizzes based on the player's needs (see app/AdaptiveTopic.so.xml).
	
Epigame steps rely on a set of global campaign options, which should be specified in the first Epigame step of a project.
The easiest way to handle this is to include all your settings in the "map" step for a project using the Star Map theme.
These global options are stored as an object in the "settings" property of the step JSON.


Epigame saves state as JSON strings.  The "success" object only exists for Win Reports.
An Exit Report (state data only, no scores) can be retrieved from the game by calling the swf's "getExitReport" function.

EpigameState Response formats:

Standard Mission:
{
	mode: "mission",
	missionSource: "",
	userPrefs: {
		soundVolume: 1.0,
		musicVolume: 1.0,
		needsTutorial: "true"
	},
	planningQuestion: {
		questionText: "",
		userResponses: ["","","",""]
	},
	failures: [
		{
			missionLog: "",
			userTrajectory: "",
			userActionPlan: "",
			question: {
				questionText: "",
				userResponses: ["","","",""]
			}
		}
	],
	success: {
		attempt: {
			missionLog: "",
			userTrajectory: "",
			userActionPlan: "",
			question: {
				questionText: "",
				userResponses: ["","","",""]
			}
		}
		score_performance: 0,
		score_explanation: 0
	},
	highScore_performance: 0,
	highScore_explanation: 0,
	timestamp: 521614173,
	timeTaken: 120000
}

Adaptive/Warp Mission:
{
	mode: "warp",
	missionSource: "",
	userPrefs: {
		soundVolume: 1.0,
		musicVolume: 1.0,
		needsTutorial: "true"
	},
	attempts: [
		{
			missionLog: "",
			userTrajectory: "",
			userActionPlan: ""
		}
	],
	success: {
		questions: [
			{
				questionText: "",
				userResponses: ["","","",""]
			}
		],
		score: 0
	},
	finalScore: 0,
	timestamp: 521614173,
	timeTaken: 120000
}

Star Map Visit:
{
	mode: "map",
	userPrefs: {
		soundVolume: 1.0,
		musicVolume: 1.0,
		needsTutorial: "true"
	}
}