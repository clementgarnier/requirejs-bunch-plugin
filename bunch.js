define(["jquery", "underscore"], function($, _, text) {

    return {
        version: "0.1-SNAPSHOT",

        load: function(name, req, onLoad, config) {

            // Load the definition object
            req([name], function(definition) {

                // Iterate over scopes
                var deferredResources = _.map(definition, function(keys, scope) {
                    // Create a jQuery Deferred object for this scope
                    var deferredScope = $.Deferred();

                    // Generate an array of dependencies with plugin name (if any), full path and extension
                    var deps = _.map(keys.resources, function(module) {
                        return (keys.plugin ? keys.plugin + "!" : "") +
                            keys.dir +
                            module +
                            keys.ext;
                    });

                    // Require all resources for this scope
                    req(deps, function() {
                        // Generate a mapping of name => module
                        var mapping = _.object(keys.resources, arguments);

                        // Resolve the Deferred object for this scope
                        deferredScope.resolve(mapping);
                    });

                    return deferredScope;
                });
                
                // When resources of all scopes have been fetched, call the onLoad callback
                $.when.apply(this, deferredResources)
                    .done(function() {
                        // Get the array of scope names
                        var scopes = _.map(definition, function(value, scope) { return scope; });

                        // Generate a mapping of scope => (name => module)
                        var mapping = _.object(scopes, arguments);

                        onLoad(mapping);
                    });
            });
        }
    }
});
