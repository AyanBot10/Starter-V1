const axios = require("axios");

const models = [
  {
    name: "3 Guofeng3 V3.4",
    model: "3Guofeng3_v34.safetensors [50f420de]"
    },
  {
    name: "Absolute Reality V1.6",
    model: "absolutereality_V16.safetensors [37db0fc3]"
    },
  {
    name: "Absolute Reality V1.8.1",
    model: "absolutereality_v181.safetensors [3d9d4d2b]"
    },
  {
    name: "Am I Real V4.1",
    model: "amIReal_V41.safetensors [0a8a2e61]"
    },
  {
    name: "Analog V1",
    model: "analog-diffusion-1.0.ckpt [9ca13f02]"
    },
  {
    name: "Anything V3",
    model: "anythingv3_0-pruned.ckpt [2700c435]"
    },
  {
    name: "Anything V4.5",
    model: "anything-v4.5-pruned.ckpt [65745d25]"
    },
  {
    name: "Anything V5",
    model: "anythingV5_PrtRE.safetensors [893e49b9]"
    },
  {
    name: "AbyssOrangeMix V3",
    model: "AOM3A3_orangemixs.safetensors [9600da17]"
    },
  {
    name: "Blazing Drive V10g",
    model: "blazing_drive_v10g.safetensors [ca1c1eab]"
    },
  {
    name: "BreakDomain I2428",
    model: "breakdomain_I2428.safetensors [43cc7d2f]"
    },
  {
    name: "BreakDomain M2150",
    model: "breakdomain_M2150.safetensors [15f7afca]"
    },
  {
    name: "CetusMix Version35",
    model: "cetusMix_Version35.safetensors [de2f2560]"
    },
  {
    name: "Children's Stories V1 3D",
    model: "childrensStories_v13D.safetensors [9dfaabcb]"
    },
  {
    name: "Children's Stories V1 SemiReal",
    model: "childrensStories_v1SemiReal.safetensors [a1c56dbb]"
    },
  {
    name: "Children's Stories V1 Toon-Anime",
    model: "childrensStories_v1ToonAnime.safetensors [2ec7b88b]"
    },
  {
    name: "Counterfeit V3.0",
    model: "Counterfeit_v30.safetensors [9e2a8f19]"
    },
  {
    name: "CuteYukimix MidChapter3",
    model: "cuteyukimixAdorable_midchapter3.safetensors [04bdffe6]"
    },
  {
    name: "CyberRealistic V3.3",
    model: "cyberrealistic_v33.safetensors [82b0d085]"
    },
  {
    name: "Dalcefo V4",
    model: "dalcefo_v4.safetensors [425952fe]"
    },
  {
    name: "Deliberate V2",
    model: "deliberate_v2.safetensors [10ec4b29]"
    },
  {
    name: "Deliberate V3",
    model: "deliberate_v3.safetensors [afd9d2d4]"
    },
  {
    name: "Dreamlike Anime V1",
    model: "dreamlike-anime-1.0.safetensors [4520e090]"
    },
  {
    name: "Dreamlike Diffusion V1",
    model: "dreamlike-diffusion-1.0.safetensors [5c9fd6e0]"
    },
  {
    name: "Dreamlike Photoreal V2",
    model: "dreamlike-photoreal-2.0.safetensors [fdcf65e7]"
    },
  {
    name: "Dreamshaper 6 baked vae",
    model: "dreamshaper_6BakedVae.safetensors [114c8abb]"
    },
  {
    name: "Dreamshaper 7",
    model: "dreamshaper_7.safetensors [5cf5ae06]"
    },
  {
    name: "Dreamshaper 8",
    model: "dreamshaper_8.safetensors [9d40847d]"
    },
  {
    name: "Edge of Realism EOR V2.0",
    model: "edgeOfRealism_eorV20.safetensors [3ed5de15]"
    },
  {
    name: "Eimis Anime Diffusion V1.0",
    model: "EimisAnimeDiffusion_V1.ckpt [4f828a15]"
    },
  {
    name: "Elldreth's Vivid",
    model: "elldreths-vivid-mix.safetensors [342d9d26]"
    },
  {
    name: "epiCPhotoGasm X Plus Plus",
    model: "epicphotogasm_xPlusPlus.safetensors [1a8f6d35]"
    },
  {
    name: "EpiCRealism Natural Sin RC1",
    model: "epicrealism_naturalSinRC1VAE.safetensors [90a4c676]"
    },
  {
    name: "EpiCRealism Pure Evolution V3",
    model: "epicrealism_pureEvolutionV3.safetensors [42c8440c]"
    },
  {
    name: "I Cant Believe Its Not Photography Seco",
    model: "ICantBelieveItsNotPhotography_seco.safetensors [4e7a3dfd]"
    },
  {
    name: "Indigo Furry Mix V7.5 Hybrid",
    model: "indigoFurryMix_v75Hybrid.safetensors [91208cbb]"
    },
  {
    name: "Juggernaut Aftermath",
    model: "juggernaut_aftermath.safetensors [5e20c455]"
    },
  {
    name: "Lofi V4",
    model: "lofi_v4.safetensors [ccc204d6]"
    },
  {
    name: "Lyriel V1.6",
    model: "lyriel_v16.safetensors [68fceea2]"
    },
  {
    name: "MajicMix Realistic V4",
    model: "majicmixRealistic_v4.safetensors [29d0de58]"
    },
  {
    name: "MechaMix V1.0",
    model: "mechamix_v10.safetensors [ee685731]"
    },
  {
    name: "MeinaMix Meina V9",
    model: "meinamix_meinaV9.safetensors [2ec66ab0]"
    },
  {
    name: "MeinaMix Meina V11",
    model: "meinamix_meinaV11.safetensors [b56ce717]"
    },
  {
    name: "Neverending Dream V1.22",
    model: "neverendingDream_v122.safetensors [f964ceeb]"
    },
  {
    name: "Openjourney V4",
    model: "openjourney_V4.ckpt [ca2f377f]"
    },
  {
    name: "Pastel-Mix",
    model: "pastelMixStylizedAnime_pruned_fp16.safetensors [793a26e8]"
    },
  {
    name: "Portrait+ V1",
    model: "portraitplus_V1.0.safetensors [1400e684]"
    },
  {
    name: "Protogen x3.4",
    model: "protogenx34.safetensors [5896f8d5]"
    },
  {
    name: "Realistic Vision V1.4",
    model: "Realistic_Vision_V1.4-pruned-fp16.safetensors [8d21810b]"
    },
  {
    name: "Realistic Vision V2.0",
    model: "Realistic_Vision_V2.0.safetensors [79587710]"
    },
  {
    name: "Realistic Vision V4.0",
    model: "Realistic_Vision_V4.0.safetensors [29a7afaa]"
    },
  {
    name: "Realistic Vision V5.0",
    model: "Realistic_Vision_V5.0.safetensors [614d1063]"
    },
  {
    name: "Redshift Diffusion V1.0",
    model: "redshift_diffusion-V10.safetensors [1400e684]"
    },
  {
    name: "ReV Animated V1.2.2",
    model: "revAnimated_v122.safetensors [3f4fefd9]"
    },
  {
    name: "RunDiffusion FX 2.5D V1.0",
    model: "rundiffusionFX25D_v10.safetensors [cd12b0ee]"
    },
  {
    name: "RunDiffusion FX Photorealistic V1.0",
    model: "rundiffusionFX_v10.safetensors [cd4e694d]"
    },
  {
    name: "SD V1.4",
    model: "sdv1_4.ckpt [7460a6fa]"
    },
  {
    name: "SD V1.5",
    model: "v1-5-pruned-emaonly.safetensors [d7049739]"
    },
  {
    name: "SD V1.5 Inpainting",
    model: "v1-5-inpainting.safetensors [21c7ab71]"
    },
  {
    name: "Shonin's Beautiful People V1.0",
    model: "shoninsBeautiful_v10.safetensors [25d8c546]"
    },
  {
    name: "TheAlly's Mix II",
    model: "theallys-mix-ii-churned.safetensors [5d9225a4]"
    },
  {
    name: "Timeless V1",
    model: "timeless-1.0.ckpt [7c4971d4]"
    },
  {
    name: "ToonYou Beta 6",
    model: "toonyou_beta6.safetensors [980f6b15]"
    }
];

const modes = models.map((model, index) => `${index + 1}. ${model.name}`);

module.exports = {
  config: {
    name: "imagine",
    aliases: ["prodia"],
    usage: "{pn} <prompt>" +
      ` --v ModelID\nAvailable Models:\n\n${modes.join("\n")}`,
    description: "Image Generator from Prodia"
  },
  start: async function({ event, args, api }) {
    const prompt = args.join(" ");
    let cook;
    try {
      if (!prompt || prompt.length <= 5)
        return api.sendMessage(event.chat.id, "Include a valid prompt");
      const { text, model, rando } = formatPrompt(prompt);
      cook = await api.sendMessage(event.chat.id, "Processing Query");
      const jobID = await generateImage({ text, model });
      await global.utils.sleep(2500);
      api.sendChatAction(event.chat.id, 'upload_photo')
      const polledImage = await pollImage({ jobID });
      api.deleteMessage(event.chat.id, cook.message_id);
      await api.sendPhoto(event.chat.id, polledImage, {
        caption: models[rando].name
      });
    } catch (err) {
      console.error(err);
      if (cook) api.deleteMessage(event.chat.id, cook.message_id);
      const options = {
        reply_markup: {
          inline_keyboard: [
                        [
              {
                text: "Try Again",
                callback_data: prompt
                            }
                        ]
                    ]
        },
        reply_to_message_id: event.message_id
      };

      const sent = await api.sendMessage(
        event.chat.id,
        "Darn Error!",
        options
      );
      global.bot.callback_query.set(sent.message_id, {
        event,
        ctx: sent,
        cmd: this.config.name,
        prompt
      });
    }
  },
  callback_query: async function({ event, api, ctx, Context }) {
    const prompt = Context.prompt;
    let cook;
    try {
      await api.deleteMessage(event.chat.id, ctx.message.message_id);
      cook = await api.sendMessage(event.chat.id, "Lemme Cook");
      await api.answerCallbackQuery({ callback_query_id: ctx.id });
      const { text, model, rando } = formatPrompt(prompt);
      const jobID = await generateImage({ text, model });
            await global.utils.sleep(2500);
      api.sendChatAction(event.chat.id, 'upload_photo')
      const polledImage = await pollImage({ jobID });
      api.deleteMessage(event.chat.id, cook.message_id);
      await api.sendPhoto(event.chat.id, polledImage, {
        caption: models[rando].name
      });
    } catch (err) {
      if (cook) api.deleteMessage(event.chat.id, cook.message_id);
      console.error(err);
      const options = {
        reply_markup: {
          inline_keyboard: [
                        [
              {
                text: "Try Again",
                callback_data: prompt
                            }
                        ]
                    ]
        }
      };

      const sent = await api.sendMessage(
        event.chat.id,
        err.message,
        options
      );
      global.bot.callback_query.set(sent.message_id, {
        event,
        ctx: sent,
        cmd: this.config.name,
        prompt
      });
    }
  }
};

function formatPrompt(text) {
  let rando = Math.floor(Math.random() * models.length);
  const regex = /--v/;
  if (regex.test(text)) {
    const versionRegex = /--v (\d+)/;
    if (!versionRegex.test(text))
      return { text, model: models[rando].model, rando };
    let digit = parseInt(text.match(versionRegex)[1]) - 1;
    if (digit >= models.length || digit < 0) digit = rando;
    text = text.replace(versionRegex, "").trim();
    return { text, model: models[digit].model, rando: digit };
  }
  return { text, model: models[rando].model, rando };
}

async function generateImage({ text, model }) {
  try {
    const request = await axios.get(
      `https://api.prodia.com/generate?new=true&prompt=${encodeURIComponent(
                text
            )}&model=${encodeURIComponent(
                model
            )}&negative_prompt=${encodeURIComponent(
                `verybadimagenegative_v1.3, ng_deepnegative_v1_75t, (ugly face:0.8),cross-eyed,sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, bad anatomy, DeepNegative, facing away, tilted head, {Multiple people}, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worstquality, low quality, normal quality, jpegartifacts, signature, watermark, username, blurry, bad feet, cropped, poorly drawn hands, poorly drawn face, mutation, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, extra fingers, fewer digits, extra limbs, extra arms,extra legs, malformed limbs, fused fingers, too many fingers, long neck,mutated hands, polar lowres, bad body, bad proportions, gross proportions, text, error, missing fingers, missing arms, missing legs, extra digit, extra arms, extra leg, extra foot, zombie, elf ear, animal ears, cat ears, fox ears, dog ears, rabbit ears, atrist name, user name, multipul angle, split view, grid view, multipul shot`
            )}&steps=25&cfg=7&seed=${Date.now()}&sampler=${encodeURIComponent(
                "DPM++ 2M Karras"
            )}
            }`
    );
    return request.data.job;
  } catch (error) {
    throw error;
  }
}

async function pollImage({ jobID }) {
  try {
    while (true) {
      const response = (
        await axios.get(`https://api.prodia.com/job/${jobID}`)
      ).data;
      if (response.status == "succeeded") {
        return `https://images.prodia.xyz/${jobID}.png`;
      } else if (response.status == "generating") {
        await new Promise(resolve => setTimeout(resolve, 3500));
      } else {
        throw new Error("Exception Occurred");
      }
    }
  } catch (error) {
    throw error;
  }
}