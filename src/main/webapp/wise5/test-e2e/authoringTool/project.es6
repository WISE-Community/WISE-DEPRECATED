export default {
    "nodes": [
        {
            "id": "group0",
            "type": "group",
            "title": "Master",
            "startId": "group1",
            "ids": [
                "group1"
            ]
        },
        {
            "id": "group1",
            "type": "group",
            "title": "First Activity2",
            "startId": "node1",
            "ids": [
                "node1",
                "node2",
                "node3"
            ],
            "icons": {
                "default": {
                    "color": "#2196F3",
                    "type": "font",
                    "fontSet": "material-icons",
                    "fontName": "info"
                }
            }
        },
        {
            "id": "node1",
            "title": "Step 1",
            "type": "node",
            "constraints": [],
            "transitionLogic": {
                "transitions": [
                    {
                        "to": "node2"
                    }
                ]
            },
            "showSaveButton": false,
            "showSubmitButton": false,
            "components": []
        },
        {
            "id": "node2",
            "title": "Step 2",
            "type": "node",
            "constraints": [],
            "transitionLogic": {
                "transitions": [
                    {
                        "to": "node3"
                    }
                ]
            },
            "showSaveButton": false,
            "showSubmitButton": false,
            "components": []
        },
        {
            "id": "node3",
            "title": "Step 3",
            "type": "node",
            "constraints": [],
            "transitionLogic": {
                "transitions": []
            },
            "showSaveButton": false,
            "showSubmitButton": false,
            "components": []
        }
    ],
    "constraints": [],
    "startGroupId": "group0",
    "startNodeId": "node1",
    "navigationMode": "guided",
    "metadata": {
        "title": "My Science Project"
    },
    "notebook": {
        "enabled": false,
        "label": "Notebook",
        "enableAddNew": true,
        "itemTypes": {
            "note": {
                "type": "note",
                "enabled": true,
                "enableLink": true,
                "enableAddNote": true,
                "enableClipping": true,
                "enableStudentUploads": true,
                "requireTextOnEveryNote": false,
                "label": {
                    "singular": "note",
                    "plural": "notes",
                    "link": "Notes",
                    "icon": "note",
                    "color": "#1565C0"
                }
            },
            "question": {
                "type": "question",
                "enabled": false,
                "enableLink": true,
                "enableClipping": true,
                "enableStudentUploads": true,
                "label": {
                    "singular": "QUESTION_LOWER_CASE",
                    "plural": "QUESTIONS_LOWER_CASE",
                    "link": "Questions",
                    "icon": "live_help",
                    "color": "#F57C00"
                }
            },
            "report": {
                "enabled": false,
                "label": {
                    "singular": "report",
                    "plural": "reports",
                    "link": "Report",
                    "icon": "assignment",
                    "color": "#AD1457"
                },
                "notes": [
                    {
                        "reportId": "finalReport",
                        "title": "Final Report",
                        "description": "Final summary report of what you learned in this project",
                        "prompt": "Use this space to write your final report using evidence from your notebook.",
                        "content": "<h3>This is a heading</h3><p>This is a paragraph.</p>"
                    }
                ]
            }
        }
    },
    "inactiveGroups": [],
    "inactiveNodes": []
}
