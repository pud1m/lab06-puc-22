const csvToJsonResult = [];

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

// mediana
const calcCBO = () => {
  const resp = csvToJsonResult
    .filter((result) => Number.isNaN(parseInt(result.cbo)) !== true)
    .sort((a, b) => a.cbo - b.cbo);

  const half = Math.floor(resp.length / 2);
  let item = null;

  if (resp.length % 2 === 1) {
    item = resp[half];
    return parseInt(item.cbo);
  }

  if (resp.length % 2 === 0) {
    item = (parseInt(resp[half - 1].cbo) + parseInt(resp[half].cbo)) / 2.0;
    return item;
  }
};

// moda
const calcDit = () => {
  const resp = csvToJsonResult
    .filter((result) => Number.isNaN(parseInt(result.dit)) !== true)
    .reduce(
      (prev, current) =>
        current.dit && parseInt(prev.dit) > parseInt(current.dit)
          ? prev
          : current,
      0
    ).dit;
  return parseInt(resp);
};

//madiana
const calcLcom_as = () => {
  const resp = csvToJsonResult
    .filter((result) => Number.isNaN(parseFloat(result["lcom*"])) !== true)
    .sort((a, b) => a["lcom*"] - b["lcom*"]);

  const half = Math.floor(resp.length / 2);
  let item = null;

  if (resp.length % 2 === 1) {
    item = resp[half];
    return parseFloat(item["lcom*"]);
  }

  if (resp.length % 2 === 0) {
    item =
      (parseFloat(resp[half - 1]["lcom*"]) + parseFloat(resp[half]["lcom*"])) /
      2.0;
    return item;
  }
};

// soma
const calcLoc = () => {
  const resp = csvToJsonResult.reduce(
    (acc, values) => acc + parseInt(values.loc),
    0
  );
  return resp;
};

module.exports = { csvToJson, calcCBO, calcDit, calcLcom_as, calcLoc };
