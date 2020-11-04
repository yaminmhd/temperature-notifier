require("dotenv").config();
const express = require("express");
const moment = require("moment");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const { run } = require("./tempNotification");
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const app = express();
const sendMessage = async () => {
  const whatsappNumber = `+14${process.env.FROM}`;
  const myPhoneNumber = `+65${process.env.TO}`;
  client.messages
    .create({
      from: `whatsapp:${whatsappNumber}`,
      body: `Checking now. Please wait for a moment`,
      to: `whatsapp:${myPhoneNumber}`,
    })
    .then((message) => console.log(message));
};

const getShift = () => {
  var nowHours = moment().get("hour");
  return nowHours <= 12 ? "am" : "pm";
};

app.post("/check", async (req, res) => {
  await sendMessage();
  const shift = getShift();
  const message = await run(shift);
  const twiml = new MessagingResponse();
  twiml.message(message);
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

app.listen(process.env.PORT, () => {
  console.log(`Application is running on port ${process.env.PORT}`);
});
