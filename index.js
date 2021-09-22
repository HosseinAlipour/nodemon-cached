const { Command } = require("commander");
const chokidar = require("chokidar");
let path = require("path");
let chalk = require("chalk");

const program = new Command();
program.version("0.3.0");

program
  .argument("<app>", "entry file location")
  .argument("<cache>", "cached script file location")
  .option("-i, --ignore <regex>", "ignore files");

program.parse(process.argv);

const options = program.opts();

let [appModule, cacheModule] = program.args.map((p) => path.resolve(p));

function appExec() {
  console.log(chalk.green("Starting"));
  require(appModule);
  console.log(chalk.green("Finished."), "\n");
}

function handleErrors(cb) {
  try {
    cb();
  } catch (err) {
    switch (err.code) {
      case "MODULE_NOT_FOUND":
        console.log(chalk.red(err.message));
        break;
      default:
        console.log(chalk.red("import aborted"), err);
    }
  }
}

handleErrors(() => {
  require(cacheModule);
  console.log(chalk.green("Cache has been loaded"));
  appExec();
});

chokidar
  .watch(".", {
    ignored: options.ignore,
    persistent: true,
  })
  .on("change", () => {
    handleErrors(() => {
      delete require.cache[appModule];
      appExec();
    });
  });
