define(function() {
    return codebox.settings.schema("git",
        {
            "title": "Git",
            "type": "object",
            "properties": {
                "email": {
                    "description": "Email",
                    "type": "string",
                    "default": ""
                },
                "name": {
                    "description": "Name",
                    "type": "string",
                    "default": ""
                }
            }
        }
    );
});