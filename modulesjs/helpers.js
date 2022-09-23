const sleep = async (ms = 200000) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

async function retry(fn) {
  try {
    return await fn();
  } catch (err) {
    console.log(`Retrying in 2 seconds...`);
    await sleep(2 * 1000);
    return retry(fn);
  }
}

module.exports = { retry };