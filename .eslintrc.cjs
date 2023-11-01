module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended"
    ],
    "settings": {
        "import/resolver": "typescript"
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "prefer-arrow"
    ],
    "rules": {
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        "no-alert": "error",
        "no-console": "error",
        "prefer-arrow/prefer-arrow-functions": [
            "error",
            {
                "disallowPrototype": true,
                "singleReturnOnly": false,
                "classPropertiesAllowed": true
            }
        ],
        "import/order": [
            "error", {
                "groups": [
                    "index",
                    "sibling",
                    "parent",
                    "internal",
                    "external",
                    "builtin",
                    "object",
                    "type"
                ]
            }
        ]
    }
};
