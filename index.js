"use strict";
const {
  csvToJson,
  calcCBO,
  calcDit,
  calcLcom_as,
  calcLoc,
} = require("./modulesjs/calc");
const { retry } = require("./modulesjs/helpers");

const cluster = require("cluster");
const v8 = require("v8");
const fs = require("fs");
const { stringify } = require("csv-stringify");
const { parse } = require("csv-parse");
const shell = require("shelljs");

const today = new Date();

const path = "~/Documentos/pessoal/lab6/lab06-puc-22/repos";

const writableStream = fs.createWriteStream("./out/Arquivo.csv");
const stringifier = stringify({
  header: true,
  columns: [
    "name",
    "operatingTime",
    "popularity",
    "releases",
    "cbo",
    "dit",
    "lcom_as",
    "loc",
  ],
});

const getMetrics = async () => {
  await retry(() =>
    shell.exec(
      `java -jar ck-0.7.1-SNAPSHOT-jar-with-dependencies.jar ${path} true 0 False`
    )
  );
};

if (cluster.isMaster) {
  cluster.fork();
  cluster.on("exit", (deadWorker, code, signal) => {
    let worker = cluster.fork();

    let newPID = worker.process.pid;
    let oldPID = deadWorker.process.pid;

    console.log("worker " + oldPID + " died.");
    console.log("worker " + newPID + " born.");
  });
} else {
  const initialStats = v8.getHeapStatistics();
  const totalHeapSizeThreshold = (initialStats.heap_size_limit * 85) / 100;
  let detectHeapOverflow = () => {
    let stats = v8.getHeapStatistics();
    if (stats.total_heap_size > totalHeapSizeThreshold) {
      process.exit();
    }
  };

  setInterval(detectHeapOverflow, 1000);
  fs.createReadStream("./out/lab2.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", (row) => {
      shell.cd("./repos");
      shell.exec(`git clone ${row[3]}`);
      shell.cd("../ck/target");

      getMetrics();

      shell.cd("../../");
      const csvClass = fs.readFileSync("./ck/target/class.csv");
      const csvToJsonResult = csvToJson(csvClass);
      const cbo = calcCBO(csvToJsonResult);
      const dit = calcDit(csvToJsonResult);
      const lcom_as = calcLcom_as(csvToJsonResult);

      const csvMethod = fs.readFileSync("./ck/target/method.csv");
      const csvToJsonResult2 = csvToJson(csvMethod);
      const loc = calcLoc(csvToJsonResult2);

      const createData = new Date(row[1]);

      stringifier.write({
        name: row[0],
        operatingTime: today.getFullYear() - createData.getFullYear(),
        popularity: row[2],
        releases: row[4],
        url: row[3],
        cbo: cbo,
        dit: dit,
        lcom_as: lcom_as,
        loc: loc,
      });
      stringifier.pipe(writableStream);
      shell.rm("-rf", "./repos/*");
    })
    .on("end", () => {
      console.log("Finished writing data");
    })
    .on("error", (error) => {
      stringifier.pipe(writableStream);
      shell.rm("-rf", "./repos/*");
      console.log(error.message);
    });
}
