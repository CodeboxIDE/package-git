define([
    "src/settings",
    "text!src/templates/branch.html"
], function(settings, templateBranch) {
    var rpc = codebox.require("core/rpc");
    var commands = codebox.require("core/commands");
    var dialogs = codebox.require("utils/dialogs");

    var cmdBranchSwitch, cmdBranchCreate, cmdInit, cmdClone, cmdCommit, cmdPush, cmdSync;

    // Toggle commands that need git to be ok
    var toggleStatus = function(state) {
        _.invoke([
            cmdBranchSwitch, cmdBranchCreate, cmdCommit, cmdPush, cmdPull, cmdSync
        ], "set", "hidden", !state);

        _.invoke([
            cmdInit, cmdClone
        ], "set", "hidden", state);
    };

    // Check git status
    var updateStatus = function(p) {
        return (p || rpc.execute("git/status"))
        .then(function() {
            toggleStatus(true);
        }, function(err) {
            toggleStatus(false);
        })
    };

    // Handle http auth
    var handleHttpAuth = function(method) {
        return Q(method())
        .fail(function(err) {
            if (err.code == 401) {
                // Fields for https auth
                var fields = {
                    username: {
                        type: "string",
                        decription: "Username"
                    },
                    password: {
                        type: "string",
                        description: "Password",
                        password: true
                    }
                };

                // Passphrase for ssh
                if (err.message.toLowerCase().indexOf("authentication") < 0) {
                    fields = {
                        passphrase: {
                            type: "string",
                            label: "Passphrase"
                        }
                    };
                }

                return dialogs.schema({
                    title: "Need authentication:",
                    properties: fields
                })
                .then(method);
            } else {
                return Q.reject(err);
            }
        })
    };

    ///// branches

    cmdBranchSwitch = commands.register({
        id: "git.branch.change",
        title: "Git: Switch To Branch",
        run: function(args, context) {
            return codebox.statusbar.loading(
            rpc.execute("git/branches"),
            {
                prefix: "Listing branches"
            })
            .fail(dialogs.error)
            .then(function(branches) {
                return dialogs.list(branches, {
                    template: templateBranch
                })
            })
            .then(function(branch) {
                return codebox.statusbar.loading(
                    rpc.execute("git/checkout", {
                        'ref': branch.get("name")
                    }),
                    {
                        prefix: "Checkout '"+branch.get("name")+"'"
                    }
                ).fail(dialogs.error);
            });
        }
    });

    cmdBranchCreate = commands.register({
        id: "git.branch.create",
        title: "Git: Create New Branch",
        run: function(args, context) {
            return dialogs.prompt("Create a branch")
            .then(function(branch) {
                return codebox.statusbar.loading(
                    rpc.execute("git/branch_create", {
                        'name': branch
                    }),
                    {
                        prefix: "Creating branch '"+branch+"'"
                    }
                ).fail(dialogs.error);
            });
        }
    });

    ///// Init/Clone

    cmdInit = commands.register({
        id: "git.init",
        title: "Git: Init",
        run: function(args, context) {
            return updateStatus(rpc.execute("git/init"));
        }
    });

    cmdClone = commands.register({
        id: "git.clone",
        title: "Git: Clone Remote",
        run: function(args, context) {
            return dialogs.prompt("Clone repository:")
            .then(function(url) {
                return codebox.statusbar.loading(
                    handleHttpAuth(function(creds) {
                        return updateStatus(rpc.execute("git/clone", {
                            'url': url,
                            'auth': creds || {}
                        }));
                    }),
                    {
                        prefix: "Cloning repository"
                    }
                ).fail(dialogs.error);
            });
        }
    });

    ///// Commit

    cmdCommit = commands.register({
        id: "git.commit",
        title: "Git: Commit Changes",
        run: function(args, context) {
            return dialogs.schema({
                title: "Commit Changes:",
                properties: {
                    message: {
                        description: "Message:",
                        type: "string"
                    },
                    files: {
                        description: "Files (paths separeated by coma, * for all changes)",
                        type: "string",
                        default: "*"
                    }
                }
            })
            .then(function(infos) {
                infos.name = settings.data.get("name");
                infos.email = settings.data.get("email");

                if (infos.files == "*") {
                    infos.files = [];
                } else {
                    infos.files = infos.files.split(",");
                }


                return codebox.statusbar.loading(
                    rpc.execute("git/commit", infos),
                    {
                        prefix: "Commiting"
                    }
                ).fail(dialogs.error);
            });
        }
    });

    cmdPush = commands.register({
        id: "git.push",
        title: "Git: Push",
        run: function() {
            return codebox.statusbar.loading(
                handleHttpAuth(function(creds) {
                    return updateStatus(rpc.execute("git/push"));
                }),
                {
                    prefix: "Pushing"
                }
            ).fail(dialogs.error);
        }
    });

    cmdPull = commands.register({
        id: "git.pull",
        title: "Git: Pull",
        run: function() {
            return codebox.statusbar.loading(
                handleHttpAuth(function(creds) {
                    return updateStatus(rpc.execute("git/pull"));
                }),
                {
                    prefix: "Pulling"
                }
            ).fail(dialogs.error);
        }
    });

    cmdSync = commands.register({
        id: "git.sync",
        title: "Git: Sync",
        run: function() {
            return codebox.statusbar.loading(
                handleHttpAuth(function(creds) {
                    return updateStatus(rpc.execute("git/sync"));
                }),
                {
                    prefix: "Syncing (pull & push)"
                }
            ).fail(dialogs.error);
        }
    });

    updateStatus();
});