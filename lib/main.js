var _ = require('lodash');
var Q = require('q');
var Gittle = require('gittle');

module.exports = function(codebox) {
    var workspace = codebox.workspace;
    var events = codebox.events;

    var repo = new Gittle(workspace.root());

    codebox.rpc.service("git", {
        init: function(args) {
            return Gittle.init(workspace.root()).then(function(_repo) {
                events.emit('git:init');

                repo = _repo;
                return repo.status();
            });
        },

        clone: function(args) {
            if (!args.url) throw "Need an url for cloning a repository";

            return Gittle.clone(args.url, workspace.root(), args.auth || {})
            .then(function(_repo) {
                events.emit('git:clone');

                repo = _repo;
                return repo.status();
            });
        },

        status: function() {
            return repo.status();
        },

        sync: function(args) {
            return repo.sync(null, null, args.auth || {})
            .then(function() {
                events.emit('git.sync');
            });
        },

        push: function(args) {
            return repo.push(null, null, args.auth || {})
            .then(function() {
                events.emit('git.push');
            });
        },

        pull: function(args) {
            return repo.pull(null, null, args.auth || {})
            .then(function() {
                events.emit('git.pull');
            });
        },

        commit: function(args) {
            var msg = args.message;
            var files = args.files || [];
            var name = args.name;
            var email = args.email;

            if(!_.all([msg, files])) {
                throw "Could not commit because arguments are missing and/or invalid";
            }

            return ((name && email)?
                Q({
                    name: name,
                    email: email
                }) :
                repo.identity()
            )
            .then(function(identity) {
                return repo.commitWith(identity.name, identity.email, msg, files)
            })
            .then(function() {
                events.emit('git.commit', {
                    message: msg,
                    name: name,
                    email: email,
                    files: files
                });
            });
        },

        commits: function(args) {
            return repo.commits(args.ref, args.limit, args.skip);
        },

        branches: function(args) {
            var activeBranch;

            // Get current active branch
            return repo.branch().then(function(branch) {
                activeBranch = branch;

                // Get all local branches
                return repo.branches();
            }).then(function(branches) {
                return _.map(branches, function(branch) {
                    return {
                        'name': branch.name,
                        'active': branch.name == activeBranch.name
                    }
                });
            })
        },

        branch_create: function(args) {
            if (!args.name) throw "Need a name to create a branch";
            return repo.create_branch(args.name);
        },

        checkout: function(args) {
            if (!args.ref) throw "Need a referance (ref) to checkout";
            return repo.checkout(args.ref);
        },

        branch_delete: function(args) {
            if (!args.name) throw "Need a name to delete a branch";
            return repo.delete_branch(args.name);
        },

        commits_pending: function() {
            return repo.commits_pending();
        },

        diff: function(args) {
            return repo.diff(args.new, args.old).then(function(diffs) {
                return _.map(diffs, function(diff) {
                    return diff.normalize();
                })
            });
        }
    });
};
