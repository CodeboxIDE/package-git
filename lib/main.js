var _ = require('lodash');
var Gittle = require('gittle');

module.exports = function(codebox) {
    var workspace = codebox.workspace;
    var events = codebox.events;

    var repo = new Gittle(workspace.root());

    codebox.rpc.service("git", {
        // Init a git repository
        init: function(args) {
            return Gittle.init(workspace.root()).then(function(_repo) {
                events.emit('git:init');

                repo = _repo;
                return repo.status();
            });
        },

        // Clone a repository
        clone: function(args) {
            if (!args.url) throw "Need an url for cloning a repository";

            return Gittle.clone(args.url, workspace.root(), args.auth || {})
            .then(function(_repo) {
                events.emit('git:clone');

                repo = _repo;
                return repo.status();
            });
        },

        // Return status for this repo
        status: function() {
            return repo.status();
        }
    });
};
