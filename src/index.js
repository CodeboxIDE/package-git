define(function(Manager) {
    var rpc = codebox.require("core/rpc");
    var commands = codebox.require("core/commands");

    var cmdBranchSwitch, cmdInit;

    // Toggle commands that need git to be ok
    var toggleStatus = function(state) {
        _.invoke([
            cmdBranchSwitch
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