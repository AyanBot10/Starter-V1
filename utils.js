const axios = require("axios");
const crypto = require("crypto");
const fs = require('fs');
const FormData = require("form-data");

const regexURL = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;


async function getStream(link) {
  try {
    const response = await axios.get(link, { responseType: 'stream' });
    if (response.status === 200) {
      return response.data;
    } else {
      throw { status: response.status }
    }
  } catch (err) {
    return `Response returned status ${err?.status}`;
  }
};

async function sleep(ms) {
  return await new Promise(resolve => setTimeout(resolve, ms))
}



function uuid() {
  return crypto.randomUUID();
}

function configSync(json) {
  const currentConfig = fs.existsSync("config_handler.json") ? JSON.parse(fs.readFileSync("config_handler.json", 'utf8')) : {};
  fs.writeFileSync("config_handler.json", JSON.stringify({ ...currentConfig, ...json }, null, 2), 'utf8');
  global.config_handler = require("./config_handler.json");
  return true;
};


function translateAPI(text, lang) {
  // Ntkhang03
  return new Promise((resolve, reject) => {
    axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`)
      .then(res => {
        resolve(res.data[0][0][0]);
      })
      .catch(err => {
        reject(err);
      });
  });
}

async function translate(text, lang) {
  // @NTKhang03
  if (typeof text !== "string")
    throw new Error(`The first argument (text) must be a string`);
  if (!lang)
    lang = 'en';
  if (typeof lang !== "string")
    throw new Error(`The second argument (lang) must be a string`);
  const wordTranslate = [''];
  const wordNoTranslate = [''];
  const wordTransAfter = [];
  let lastPosition = 'wordTranslate';

  if (word.indexOf(text.charAt(0)) == -1)
    wordTranslate.push('');
  else
    wordNoTranslate.splice(0, 1);

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (word.indexOf(char) !== -1) { // is word
      const lengWordNoTranslate = wordNoTranslate.length - 1;
      if (wordNoTranslate[lengWordNoTranslate] && wordNoTranslate[lengWordNoTranslate].includes('{') && !wordNoTranslate[lengWordNoTranslate].includes('}')) {
        wordNoTranslate[lengWordNoTranslate] += char;
        continue;
      }
      const lengWordTranslate = wordTranslate.length - 1;
      if (lastPosition == 'wordTranslate') {
        wordTranslate[lengWordTranslate] += char;
      }
      else {
        wordTranslate.push(char);
        lastPosition = 'wordTranslate';
      }
    }
    else { // is no word
      const lengWordNoTranslate = wordNoTranslate.length - 1;
      const twoWordLast = wordNoTranslate[lengWordNoTranslate]?.slice(-2) || '';
      if (lastPosition == 'wordNoTranslate') {
        if (twoWordLast == '}}') {
          wordTranslate.push("");
          wordNoTranslate.push(char);
        }
        else
          wordNoTranslate[lengWordNoTranslate] += char;
      }
      else {
        wordNoTranslate.push(char);
        lastPosition = 'wordNoTranslate';
      }
    }
  }

  for (let i = 0; i < wordTranslate.length; i++) {
    const text = wordTranslate[i];
    if (!text.match(/[^\s]+/))
      wordTransAfter.push(text);
    else
      wordTransAfter.push(translateAPI(text, lang));
  }

  let output = '';

  for (let i = 0; i < wordTransAfter.length; i++) {
    let wordTrans = (await wordTransAfter[i]);
    if (wordTrans.trim().length === 0) {
      output += wordTrans;
      if (wordNoTranslate[i] != undefined)
        output += wordNoTranslate[i];
      continue;
    }

    wordTrans = wordTrans.trim();
    const numberStartSpace = lengthWhiteSpacesStartLine(wordTranslate[i]);
    const numberEndSpace = lengthWhiteSpacesEndLine(wordTranslate[i]);

    wordTrans = ' '.repeat(numberStartSpace) + wordTrans.trim() + ' '.repeat(numberEndSpace);

    output += wordTrans;
    if (wordNoTranslate[i] != undefined)
      output += wordNoTranslate[i];
  }
  return output;
}

async function uploadImgbb(file) {
  let type = "file";
  try {
    if (!file)
      throw new Error('The first argument (file) must be a stream or a image url');
    if (regCheckURL.test(file) == true)
      type = "url";
    if (
      (type != "url" && (!(typeof file._read === 'function' && typeof file._readableState === 'object'))) ||
      (type == "url" && !regCheckURL.test(file))
    )
      throw new Error('The first argument (file) must be a stream or an image URL');

    const res_ = await axios({
      method: 'GET',
      url: 'https://imgbb.com'
    });

    const auth_token = res_.data.match(/auth_token="([^"]+)"/)[1];
    const timestamp = Date.now();

    const res = await axios({
      method: 'POST',
      url: 'https://imgbb.com/json',
      headers: {
        "content-type": "multipart/form-data"
      },
      data: {
        source: file,
        type: type,
        action: 'upload',
        timestamp: timestamp,
        auth_token: auth_token
      }
    });

    return res.data;
  }
  catch (err) {
    throw new CustomError(err.response ? err.response.data : err);
  }
}

module.exports = {
  getStream,
  sleep,
  uuid,
  configSync,
  translateAPI,
  translate,
  uploadImgbb
}