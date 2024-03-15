const path = require('path');

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
        "import/resolver": {
            "webpack": {
                "config": path.resolve(__dirname, "webpack.config.cjs")
            }
        }
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "project": "./tsconfig.json"
    },
    "plugins": [
        "@typescript-eslint",
        "prefer-arrow"
    ],
    "rules": {
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-unsafe-enum-comparison": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        "no-alert": "warn",
        "no-console": ["warn", { "allow": ["debug", "warn", "error"] }],
        "no-throw-literal": "warn",
        "prefer-arrow/prefer-arrow-functions": [
            "warn",
            {
                "disallowPrototype": true,
                "singleReturnOnly": false,
                "classPropertiesAllowed": true
            }
        ],
        "import/order": [
            "warn", {
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
