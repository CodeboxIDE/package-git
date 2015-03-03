define(function() {
    return function() {
        if (!codebox.menubar) return;

        return codebox.menubar.createMenu("tools", {
            id: "git",
            caption: "Git",
            items: [
                {
                    caption: "Init Repository",
                    command: "git.init"
                },
                {
                    caption: "Clone Repository",
                    command: "git.clone"
                },
                { type: "separator" },
                {
                    caption: "Commit Changes",
                    command: "git.commit"
                },
                {
                    caption: "Status",
                    command: "git.status"
                },
                { type: "separator" },
                {
                    caption: "Push Changes",
                    command: "git.push"
                },
                {
                    caption: "Pull Changes",
                    command: "git.pull"
                },
                { type: "separator" },
                {
                    caption: "Switch Branch...",
                    command: "git.branch.change"
                },
                {
                    caption: "Create New Branch",
                    command: "git.branch.create"
                },
                {
                    caption: "Delete a Branch",
                    command: "git.branch.delete"
                }
            ]
        });
    };
});