const { csvToJson, calcCBO, calcDit, calcLcom_as, calcLoc } = require("./calc");
const fs = require("fs");
const { stringify } = require("csv-stringify");
const { parse } = require("csv-parse");
const shell = require("shelljs");

const today = new Date();
let data = null;

const columns = [
  "name",
  "operatingTime",
  "popularity",
  "releases",
  "cbo",
  "dit",
  "lcom_as",
  "loc",
];

const path = "~/Documentos/pessoal/lab6/lab06-puc-22/repos";

const writableStream = fs.createWriteStream("./out/Arquivo.csv");
const stringifier = stringify({ header: true, columns: columns });

fs.createReadStream("./out/lab2.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", (row) => {
    shell.cd("./repos");
    shell.exec(`git clone ${row[3]}`);
    shell.cd("../ck/target");
    shell.exec(
      `java -jar ck-0.7.1-SNAPSHOT-jar-with-dependencies.jar ${path} true 0 False`
    );
    shell.cd("../../");
    const csvClass = fs.readFileSync("./ck/target/class.csv");
    csvToJson(csvClass);
    const cbo = calcCBO();
    const dit = calcDit();
    const lcom_as = calcLcom_as();
    const csvMethod = fs.readFileSync("./ck/target/method.csv");
    csvToJson(csvMethod);
    const loc = calcLoc();

    const createData = new Date(row[1]);

    data = {
      name: row[0],
      operatingTime: today.getFullYear() - createData.getFullYear(),
      popularity: row[2],
      releases: row[4],
      url: row[3],
      cbo: cbo,
      dit: dit,
      lcom_as: lcom_as,
      loc: loc,
    };

    stringifier.write(data);
    stringifier.pipe(writableStream);
  })
  .on("end", () => {
    console.log("Finished writing data");
    shell.rm("-rf", "./repos/*");
  })
  .on("error", (error) => {
    console.log(error.message);
  });
