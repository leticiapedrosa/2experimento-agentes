module.exports = {
  paths: ["features/**/*.feature"],
  requireModule: ["ts-node/register"],
  require: ["./features-step-definitions/**/*.ts", "./features-support/**/*.ts"],
  format: ["progress"],
  publishQuiet: true
};

