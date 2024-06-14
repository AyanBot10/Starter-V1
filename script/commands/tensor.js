const axios = require("axios");

async function generate({ prompt, ratio, negativePrompt, token, seed, params }) {
  const authToken = `Bearer ${token}`;
  const apiEndpoint = 'https://api.tensor.art/works/v1/works/task';
  const headers = {
    authorization: authToken,
    'content-type': 'application/json',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    Referer: 'https://tensor.art/',
    'Referrer-Policy': 'unsafe-url',
  };

  function calculateSize(aspectRatio) {
    const minPixels = 1024;
    const maxPixels = 1536 * 1024;
    const [width, height] = aspectRatio.split(':').map(Number);

    let adjustedHeight = height;
    let adjustedWidth = width;

    if (height < minPixels || width < minPixels) {
      const increaseRatio = Math.max(minPixels / height, minPixels / width);
      adjustedHeight = Math.round(height * increaseRatio);
      adjustedWidth = Math.round(width * increaseRatio);
    }

    const currentPixels = adjustedHeight * adjustedWidth;

    if (currentPixels <= maxPixels) {
      return { height: adjustedHeight, width: adjustedWidth };
    } else {
      const ratio = Math.sqrt(maxPixels / currentPixels);
      const newHeight = Math.round(adjustedHeight * ratio);
      const newWidth = Math.round(adjustedWidth * ratio);
      if (newHeight > 1536 || newWidth > 1536) {
        const ratio2 = Math.min(1536 / newHeight, 1536 / newWidth);
        return { height: Math.round(newHeight * ratio2), width: Math.round(newWidth * ratio2) };
      } else {
        return { height: newHeight, width: newWidth };
      }
    }
  }

  const dimensions = calculateSize(ratio);

  if (!params?.baseModel) {
    throw new Error({
      error: "Include request body",
      example: {
        params: {
          baseModel: {
            modelId: "681308059685024766",
            modelFileId: "681308059683976191"
          },
          sdxl: {
            refiner: true
          },
          sdVae: 'Automatic',
          prompt,
          negativePrompt,
          height: dimensions.height,
          width: dimensions.width,
          imageCount: 1,
          steps: 30,
          models: [{
            modelId: "635012521302153732",
            modelFileId: "635012521301105157",
            weight: 0.3
          }],
          samplerName: 'Euler a',
          images: [],
          cfgScale: 7.5,
          seed: seed.toString(),
          clipSkip: 2,
          workEngine: "TAMS_V1",
          etaNoiseSeedDelta: 3749
        },
        credits: 0.1,
        taskType: 'TXT2IMG'
      }
    });
  }

  const data = { params: { height: dimensions.height, width: dimensions.width, ...params }, taskType: 'TXT2IMG', credits: 1.0 };

  try {
    const response = await axios.post(apiEndpoint, data, { headers });
    const taskId = response.data.data.task.taskId;
    const timeout = 300000;
    const interval = 1500;
    const endTime = Date.now() + timeout;

    while (Date.now() < endTime) {
      const taskResponse = await axios.post('https://api.tensor.art/works/v1/works/mget_task', {
        ids: [taskId],
      }, { headers });

      const task = taskResponse.data.data.tasks[taskId];
      if (task.status === 'FINISH') {
        return { result: task.items[0].url };
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('Timeout');
  } catch (error) {
    throw error
  }
}

async function main({ token, params }) {
  if (!params.prompt || !token) {
    throw new Error('Prompt and token are required.');
  }

  let fullPrompt = params.prompt;
  const ratioMatch = fullPrompt.match(/--ar (\d+:\d+)/);
  const seedMatch = fullPrompt.match(/--seed (\d+)/);
  const weightMatch = fullPrompt.match(/--weight ([0-9.]+)/);
  const styleMatch = fullPrompt.match(/--style (\d+)/);

  const weight = weightMatch ? Math.min(Math.max(parseFloat(weightMatch[1]), 0.1), 1.0) : null;
  const ratio = ratioMatch ? ratioMatch[1] : '1:1';
  const seed = seedMatch ? parseInt(seedMatch[1], 10) : -1;
  const style = styleMatch ? parseInt(styleMatch[1], 10) : null;

  const regex = /(--ar\s+\d+:\d+|--seed\s+\d+|--weight\s+[0-9.]+|--style\s+\d+)/g;
  fullPrompt = fullPrompt.replace(regex, '').trim();

  let styleName = '';
  let stylePrompt = fullPrompt;
  let styleNegativePrompt = 'lowres, bad anatomy, bad hands, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name, verybadimagenegative_v1.3, (worst quality, low quality:1.4), (malformed hands:1.4), (mutated fingers:1.4), signature, simple background';

  if (styleMatch) {
    const styleIndex = parseInt(styleMatch[1], 10);
    if (styleIndex >= 0 && styleIndex < style_list.length) {
      styleName = style_list[styleIndex].name;
      stylePrompt = style_list[styleIndex].prompt.replace('{prompt}', fullPrompt);
      styleNegativePrompt = style_list[styleIndex].negative_prompt;
    }
  }

  try {
    const response = await generate({
      prompt: stylePrompt,
      ratio,
      params,
      negativePrompt: styleNegativePrompt,
      seed,
      token
    });
    return response
  } catch (error) {
    throw error
  }
}

const style_list = [
  {
    "name": "(None)",
    "prompt": "{prompt}",
    "negative_prompt": "lowres, (bad), text, error, fewer, extra, missing, worst quality, jpeg artifacts, low quality, watermark, unfinished, displeasing, oldest, early, chromatic aberration, signature, extra digits, artistic error, username, scan, [abstract], malformed hands, mutated fingers, deformed body",
    },
  {
    "name": "Cinematic",
    "prompt": "{prompt}, cinematic still, emotional, harmonious, vignette, highly detailed, high budget, bokeh, cinemascope, moody, epic, gorgeous, film grain, grainy",
    "negative_prompt": "cartoon, graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured, malformed hands, mutated fingers",
    },
  {
    "name": "Photographic",
    "prompt": "{prompt}, cinematic photo, 35mm photograph, film, bokeh, professional, 4k, highly detailed",
    "negative_prompt": "drawing, painting, crayon, sketch, graphite, impressionist, noisy, blurry, soft, deformed, ugly, malformed hands, mutated fingers",
    },
  {
    "name": "Anime",
    "prompt": "{prompt}, anime artwork, anime style, key visual, vibrant, studio anime, highly detailed",
    "negative_prompt": "photo, deformed, black and white, realism, disfigured, low contrast, malformed hands, mutated fingers",
    },
  {
    "name": "Manga",
    "prompt": "{prompt}, manga style, vibrant, high-energy, detailed, iconic, Japanese comic style",
    "negative_prompt": "ugly, deformed, noisy, blurry, low contrast, realism, photorealistic, Western comic style, malformed hands, mutated fingers",
    },
  {
    "name": "Digital Art",
    "prompt": "{prompt}, concept art, digital artwork, illustrative, painterly, matte painting, highly detailed",
    "negative_prompt": "photo, photorealistic, realism, ugly, malformed hands, mutated fingers",
    },
  {
    "name": "Pixel art",
    "prompt": "{prompt}, pixel-art, low-res, blocky, pixel art style, 8-bit graphics",
    "negative_prompt": "sloppy, messy, blurry, noisy, highly detailed, ultra textured, photo, realistic, malformed hands, mutated fingers",
    },
  {
    "name": "Fantasy art",
    "prompt": "{prompt}, ethereal fantasy concept art, magnificent, celestial, ethereal, painterly, epic, majestic, magical, fantasy art, cover art, dreamy",
    "negative_prompt": "photographic, realistic, realism, 35mm film, dslr, cropped, frame, text, deformed, glitch, noise, noisy, off-center, deformed, cross-eyed, closed eyes, bad anatomy, ugly, disfigured, sloppy, duplicate, mutated, black and white, malformed hands, mutated fingers",
    },
  {
    "name": "Neonpunk",
    "prompt": "{prompt}, neonpunk style, cyberpunk, vaporwave, neon, vibes, vibrant, stunningly beautiful, crisp, detailed, sleek, ultramodern, magenta highlights, dark purple shadows, high contrast, cinematic, ultra detailed, intricate, professional",
    "negative_prompt": "painting, drawing, illustration, glitch, deformed, mutated, cross-eyed, ugly, disfigured, malformed hands, mutated fingers",
    },
  {
    "name": "3D Model",
    "prompt": "{prompt}, professional 3d model, octane render, highly detailed, volumetric, dramatic lighting",
    "negative_prompt": "ugly, deformed, noisy, low poly, blurry, painting, malformed hands, mutated fingers",
    },
];

module.exports = {
  config: {
    name: "tensor",
    aliases: ["generate"],
    author: "Tanvir",
    cooldown: 15,
    description: "Use Tensor models with your tokens",
    usage: "{pn} Params:\n\nprompt\n• description of the image you want to generate.\n\n--ar\n• aspect ratio of the image\n\n--weight\n• weight of niji style, 0.1 - 0.9\n\n--style\n• style of the image.\nAvailable Styles:\n1. Cinematic\n2. Photographic\n3. Anime\n4. Manga\n5. Digital Art\n6. Pixel Art\n7. Fantasy Art\n8. Neon Punk\n9. 3D Model\n\nExample Usage:\n.niji cute girl, smiling --ar 1:1 --weight 0.9\n\n.niji cute girl, smiling --ar 9:16\n\n.niji cute girl, smiling --style 3\n\n.niji cute girl, smiling"
  },
  start: async function({ event, args, api, message, cmd }) {
    if (!args[0]) return message.Syntax(cmd)
    try {
      const form = {
        token: '',
        params: {
          baseModel: {
            modelId: "681308059685024766",
            modelFileId: "681308059683976191"
          },
          sdxl: {
            refiner: true
          },
          sdVae: 'Automatic',
          prompt: args.join(' '),
          negativePrompt: "lowres, bad anatomy, bad hands, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name, verybadimagenegative_v1.3, (worst quality, low quality:1.4), (malformed hands:1.4), (mutated fingers:1.4), signature, simple background",
          imageCount: 1,
          steps: 20,
          models: [{
            modelId: "635012521302153732",
            modelFileId: "635012521301105157",
            weight: 0.3
        }],
          samplerName: 'Euler a',
          images: [],
          cfgScale: 5,
          clipSkip: 2,
          workEngine: "TAMS_V1",
          etaNoiseSeedDelta: 3749
        },
        notes: "Get authorization bearer token from tensor.art"
      }
      if (!form.token) return message.reply("Token not Set")
      message.react("👍", event.message_id)
      const response = await main(form)
      message.react("💯", event.message_id)
      message.indicator('upload_image');
      api.sendPhoto(event.chat.id, response.result, {
        caption: args.join(' ')
      })
    } catch (err) {
      message.reply(err.message);
      console.error(err)
    }
  }
}