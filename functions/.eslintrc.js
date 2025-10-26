module.exports = {
  env: {
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  extends: ["eslint:recommended"],
  rules: {
    "quotes": ["error", "double"],
    "no-undef": "off"
  },
  globals: {
    require: "readonly",
    module: "readonly",
    exports: "readonly"
  }
};
