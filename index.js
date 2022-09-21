const fs = require("fs");
const { parse } = require("csv-parse");
const shell = require("shelljs");
const converter = require("json-2-csv");

const today = new Date();
const fields = [];
const csvToJsonResult = [];

const path = "~/Documentos/pessoal/lab6/lab06-puc-22/repos";

const csvToJson = (csv) => {
  const array = csv.toString().split("\n");
  const headers = array[0].split(",");

  for (let i = 1; i < array.length - 1; i++) {
    const jsonObject = {};
    const currentArrayString = array[i];

    let string = "";

    let quoteFlag = 0;
    for (let character of currentArrayString) {
      if (character === '"' && quoteFlag === 0) {
        quoteFlag = 1;
      } else if (character === '"' && quoteFlag == 1) quoteFlag = 0;
      if (character === "," && quoteFlag === 0) character = "|";
      if (character !== '"') string += character;
    }
    let jsonProperties = string.split("|");

    for (let j in headers) {
      if (jsonProperties[j].includes(", ")) {
        jsonObject[headers[j]] = jsonProperties[j]
          .split(", ")
          .map((item) => item.trim());
      } else jsonObject[headers[j]] = jsonProperties[j];
    }
    csvToJsonResult.push(jsonObject);
  }
};

const calcCBO = () => {
  const resp = csvToJsonResult
    .filter((result) => !Number.isNaN(parseInt(result.cbo)) === false)
    .reduce((acc, values) => acc + parseInt(values.cbo), 0);
  return resp;
};

const calcDit = () => {
  const resp = csvToJsonResult
    .filter((result) => Number.isNaN(parseInt(result.dit)) === false)
    .reduce(
      (prev, current) =>
        current.dit && parseInt(prev.dit) > parseInt(current.dit)
          ? prev
          : current,
      0
    ).dit;
  return parseInt(resp);
};

const calcLcom_as = () => {
  const filted = csvToJsonResult
    .filter((number) => Number.isNaN(parseFloat(number["lcom*"])) === false)
    .sort((a, b) => a["lcom*"] - b["lcom*"]);
  const length = filted.length;
  const half = Math.floor(length / 2);

  const resp1 = filted[length / 2];
  const resp2 = filted[length / 2 - 1];
  const resp3 = parseFloat(resp1["lcom*"]) === undefined ? 0.0 : parseFloat(resp1["lcom*"]);
  const resp4 = parseFloat(resp2["lcom*"]) === undefined ? 0.0 : parseFloat(resp2["lcom*"]);
  const resp5 = resp3 + resp4
  const resp6 = resp5 / 2.0;

  if (length % 2) {
    return  parseFloat(resp1[half]["lcom*"]);
  } else {
    return resp6;
  }
};

const calcLoc = () => {
  const resp = csvToJsonResult.reduce(
    (acc, values) => acc + parseInt(values.loc),
    0
  );
  return resp;
};

fs.createReadStream("./out/lab2.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", (row) => {
    fields.push({
      name: row[0],
      operatingTime: row[1],
      popularity: row[2],
      url: row[3],
      releases: row[4],
    });
  })
  .on("end", () => {
    fields.map((field) => {
      shell.cd("./repos");
      shell.exec(`git clone ${field.url}`);
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
      const createData = new Date(field.operatingTime);
      const data = {
        name: field.name,
        operatingTime: today.getFullYear() - createData.getFullYear(),
        popularity: field.popularity,
        releases: field.releases,
        url: field.url,
        cbo: cbo,
        dit: dit,
        lcom_as: lcom_as,
        loc: loc,
      };

      converter.json2csv(data, (err, csv) => {
        if (err) {
          throw err;
        }

        // write CSV to a file
        fs.writeFileSync("./out/Arquivo.csv", csv, { flag: "a+" });
      });

      shell.rm("-rf", "./repos/*");
    });
  })
  .on("error", (error) => {
    console.log(error.message);
  });
