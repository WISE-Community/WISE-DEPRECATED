## Referencing issues

    diagram-rule -> module
                 \-> energy-type
    
    node -> module
    
    link -> energy-type
    
Currently the way to match a node back to its diagram_rule is:
    node->uuid->module->name->diagram-rule
    
If the name is changed in the authoring system then things are still fine because the diagram-rule will be updated too.
However if 2 or more names conflict then there will be a problem.

It might be better to use the uuid for the reference between the module and diagram-rule too.
The current selection view our SCUtil, and the simple model class in SCUtil need to be updated to support this. 

If UUIDs are used for modules, diagram-rules, and nodes.  Then the path can be:
    node->uuid->diagram-rule
    
Which skips the module all together.   Is this better?

- Authors can still go and delete the module which will orphan nodes, in theory diagram rules could still work since they don't really need the module
- it adds a big opaque id to the object that can become annoying.

## which html file should I use? preview.html, index.html, run.html?##

* *Index.html* is the inner frame for the authoring. It would never be used by itself.
* *run.html* is used only to display the runtime, no authoring is included.
* *preivew.html* has two iframes: authoring on the left, and the runtime preview in the right. It is mostly for debugging and testing, becuase it allows the user to set various saving options.
* It should be noted that there is another authoring project called ms_authoring (TODO: link?) which has its own "authoring.html" file. 

 