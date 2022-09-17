const fs = require("fs");
const { parse } = require("csv-parse");
const shell = require("shelljs");
const converter = require("json-2-csv");

const names = [];
const urls = [];
const csvToJsonResult = [];
const data = [];

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
  const resp = csvToJsonResult.reduce(
    (acc, values) => acc + parseInt(values.cbo),
    0
  );
  return resp;
};

const calcDit = () => {
  const resp = csvToJsonResult.reduce(
    (prev, current) =>
      !isNaN(current.dit) && parseInt(prev.dit) > parseInt(current.dit)
        ? prev
        : current,
    0
  ).dit;
  return parseInt(resp);
};

const calcLcom_as = () => {
  const elm = csvToJsonResult.length + 1;
  const resp = csvToJsonResult.reduce(
    (acc, values) =>
      !isNaN(values["lcom*"]) && acc + parseFloat(values["lcom*"]),
    0
  );
  const media = resp / elm;
  return media;
};

const calcLoc = () => {
  const resp = csvToJsonResult.reduce(
    (acc, values) => acc + parseInt(values.loc),
    0
  );
  return resp;
};

fs.createReadStream("./out/lab01.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", (row) => {
    row.map((name) => names.push(name));
    row.map((url) => url.includes("https") && urls.push(url));
  })
  .on("end", () => {
    urls.map((url, i) => {
      shell.cd("./repos");
      shell.exec(`git clone ${url}`);
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
      data.push({
        name: names[0],
        url: url,
        cbo: cbo,
        dit: dit,
        lcom_as: lcom_as,
        loc: loc,
      });
      shell.rm("-rf", "./repos/*");
    });

    converter.json2csv(data, (err, csv) => {
      if (err) {
        throw err;
      }

      // print CSV string
      console.log(csv);

      // write CSV to a file
      fs.writeFileSync("./out/Arquivo.csv", csv);
    });
    console.log(data);
  })
  .on("error", (error) => {
    console.log(error.message);
  });
