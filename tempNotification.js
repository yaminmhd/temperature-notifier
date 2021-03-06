const webdriver = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const group1Url = process.env.GROUP1_URL;
const group2Url = process.env.GROUP2_URL;

function createWebDriver() {
  let options = new chrome.Options();
  options.setChromeBinaryPath(process.env.CHROME_BINARY_PATH);
  options.addArguments("--headless");
  options.addArguments("--disable-gpu");
  options.addArguments("--incognito");
  options.addArguments("--no-sandbox");

  let serviceBuilder = new chrome.ServiceBuilder(
    process.env.CHROME_DRIVER_PATH
  );

  const chromeDriver = new webdriver.Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .setChromeService(serviceBuilder)
    .build();

  return chromeDriver;
}

function processData(id, shift, data) {
  let stack = [];
  let aaSubSet;
  let tempSchedule;
  let result = "";

  let promise = new Promise(function (resolve, reject) {
    if (id === 1) {
      aaSubSet = data.split("\n").slice(0, 17);
      aaSubSet.splice(15, 1);
    } else {
      aaSubSet = data.split("\n").slice(0, 16);
      aaSubSet.splice(12, 1);
      aaSubSet.splice(13, 1);
    }

    aaSubSet.forEach((row) => {
      const newRow = row.substring(4);
      const [name] = newRow.split(/\sNil|\s\d\d\.\d.\w/);
      const a = newRow.split(" ");
      stack.push(a);
      const pmTemp = a.pop();
      const amTemp = a.pop();
      tempSchedule = shift === "am" ? amTemp : pmTemp;

      if (tempSchedule === "Nil") {
        result += `Inform ${name} to update ${shift} temp\n`;
      }
    });

    setTimeout(() => resolve(result), 1000);
  });

  return promise;
}

async function getDataFromGroup(id, groupUrl, shift) {
  const driver = createWebDriver();
  await driver.get(groupUrl);
  await driver.wait(
    webdriver.until.elementLocated(webdriver.By.id("member-table"))
  );
  const table = await driver.findElement(webdriver.By.id("member-table"));
  const data = await table.getText();
  const result = await processData(id, shift, data);
  await driver.quit();
  return result.length > 0 ? result : "All is ok!";
}

async function run(shift) {
  const group1Data = await getDataFromGroup(1, group1Url, shift);
  const group2Data = await getDataFromGroup(2, group2Url, shift);

  const result = `
  =========GROUP 1=========\n${group1Data}\n
  =========GROUP 2=========\n${group2Data}\n`;

  return result;
}

module.exports = { run };
