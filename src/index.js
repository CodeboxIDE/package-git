define([
    "text!src/templates/branch.html"
], function(templateBranch) {
    var rpc = codebox.require("core/rpc");
    var commands = codebox.require("core/commands");
    var dialogs = codebox.require("utils/dialogs");

    var cmdBranchSwitch, cmdBranchCreate, cmdInit;

    // Toggle commands that need git to be ok
    var toggleStatus = function(state) {
        _.invoke([
            cmdBranchSwitch, cmdBranchCreate
        ], "set", "hidden", !state);

        _.invoke([
            cmdInit
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


    updateStatus();
});