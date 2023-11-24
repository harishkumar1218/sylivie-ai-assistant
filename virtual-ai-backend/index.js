import { exec,spawn } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import express, { json } from "express";
import * as fs from 'fs';
import OpenAI from "openai";
import ffmpeg from 'fluent-ffmpeg';
import fetch from "node-fetch";
// import { encode } from "punycode";
import { PythonShell } from "python-shell";
dotenv.config();
import { Buffer } from "buffer";
import wavefile from "wavefile";
import { Writer } from 'wav';
import { encode } from 'node-wav';
import axios from "axios";

import { stderr, stdout } from "process";
import { Console } from "console";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "-", // Your OpenAI API key here, I used "-" to avoid errors when the key is not set but you should not do that
});



// Access the camera
const camera = new cv.VideoCapture(0); // Use 0 for default camera, change if necessary
const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);


// Continuous loop for reading frames and performing face detection
function startFaceDetection() {
  setInterval(() => {
    camera.read((err, frame) => {
      if (!err && !frame.empty()) {
        // Detect faces
        classifier.detectMultiScale(frame, (err, faces) => {
          if (!err && faces.length > 0) {
            // Draw rectangles around detected faces
            faces.forEach(faceRect => {
              const point1 = new cv.Point(faceRect.x, faceRect.y);
              const point2 = new cv.Point(
                faceRect.x + faceRect.width,
                faceRect.y + faceRect.height
              );
              console.log(point1,point2);
              //frame.rectangle(point1, point2, [0, 255, 0], 2);
            });
          }

          // Show the frame with detected faces
          cv.imshow('Face Detection', frame);
          cv.waitKey(10);
        });
      } else {
        console.log('No frame captured');
      }
    });
  }, 10);
}

// Start face detection
startFaceDetection();








const elevenLabsApiKey = "*************";
const voiceID = "EXAVITQu4vr4xnSDxMaL";

const app = express();
app.use(express.json());
app.use(cors());
const port = 3001;


app.post('/receiveData', (req, res) => {
  const receivedData = req.body.data;
  console.log(`Received data from Python: ${receivedData}`);
  // Process the received data as needed
  // Send a response back to Python if required
  res.send('Data received by Node.js');
});
const ec2InstanceURL = 'http://ec2-54-82-23-218.compute-1.amazonaws.com:3000/add';

const inputData = {
  num1: 5,
  num2: 10,
};

axios.post(ec2InstanceURL, inputData)
  .then((response) => {
    console.log('Sum:', response.data.result);
  })
  .catch((error) => {
    console.error('Error:', error.response ? error.response.data : error.message);
  });






app.get("/", (req, res) => {
  res.send("Hello World!");
});
const elevenlabs = require('elevenlabs-node');

const client = new elevenlabs({
  apiKey: elevenLabsApiKey,
});
const text = 'This is the text that I want to convert to speech.';

const genspeech= client.generateSpeech(text, (err, audio) => {
  if (err) {
    console.log(err);
    return;
  }

  // Save the audio to a file.
  fs.writeFileSync('speech.wav', audio);
});
app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
// });
app.get("/voices", async (req, res) => {
  res.send(await t2s("hello how are you"));
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};







const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);
  await execCommand(
    `ffmpeg -i audios/message_${message}.mp3 audios/message_${message}.wav`
    // -y to overwrite the file
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `./bin/rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
  );
  // -r phonetic is faster but less accurate
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};







const inputFilePath = 'audios/api_1.mp3';
const outputFilePath = 'audios/output.flac';




let s2t= async function (filename) {
  const data = fs.readFileSync(filename);
  const response = await fetch(
    "https://api-inference.huggingface.co/models/openai/whisper-large-v3",
    {
      headers: { Authorization: "Bearer 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" },
      method: "POST",
      body: data,
    }
  );
  const result = await response.json();
  return result;
}
let txt="";
// s2t("audios/output.flac").then((response) => {
//   txt=response.text;
//   console.log(txt);
//   console.log(response.text);
// });

let t2s=async function (data) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/facebook/hf-seamless-m4t-medium",
    // "https://api-inference.huggingface.co/models/facebook/mms-tts-eng",
    {
      headers: { Authorization: "Bearer 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" },
      method: "POST",
      body: data,
    }
  );
  if (!response.ok) {

    throw new Error(`HTTP error! Status: ${response.status}`);
  }
    const result = await response.blob()
    const arr=await result.arrayBuffer();
    return arr;
  }
  t2s("hello how are you").then( async(response) => {
    console.dir(response);
    const audioData = await response;
    console.log(audioData);
   fs.writeFileSync("audios/abcd.wav",

   Buffer.from(audioData), 
  (err) => {
    if (err) {
      console.error('Error writing audio file:', err);
    } else {
      console.log('Audio file saved successfully!');
    }
  })});
 function saveArrayBufferToWav(arrayBuffer, outputFilePath, sampleRate = 44100, numChannels = 2, bitsPerSample = 16) {
    const wavData = encode({
      sampleRate: sampleRate,
      channelData: [new Float32Array(arrayBuffer)], // Assuming the ArrayBuffer contains Float32 audio data
    });
  
    fs.writeFileSync(outputFilePath, Buffer.from(wavData));
  }
  
  // Example usage:
  // Replace 'yourArrayBuffer' with your actual ArrayBuffer
  // const yourArrayBuffer = audioData;
  // const outputFilePath = 'audios/abc.wav';
  
  // Call the function to save the ArrayBuffer as a WAV file







app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  console.log("ffmpeg.........");
  ffmpeg()
  .input(inputFilePath)
  .audioCodec('flac')
  .output(outputFilePath)
  .on('end', () => {
    console.log('Conversion complete');
  })
  .on('error', (err) => {
    console.error('Error:', err);
  })
  .run();

  console.log("ffmpeg.........");
  if (!userMessage) {
    res.send({
      messages: [
        {
          text: "Hey dear... How was your day?",
          audio: await audioFileToBase64("audios/intro_0.wav"),
          //lipsync: await readJsonTranscript("audios/intro_0.json"),
          facialExpression: "smile",
          animation: "Talking_1",
        },
        {
          text: "I missed you so much... Please don't go for so long!",
          audio: await audioFileToBase64("audios/intro_1.wav"),
          //lipsync: await readJsonTranscript("audios/intro_1.json"),
          facialExpression: "sad",
          animation: "Crying",
        },
      ],
    });
    return;
  }
 
  if (!elevenLabsApiKey || !openai.apiKey === "-") {
    if(elevenLabsApiKey){
    res.send({
      messages: [
        {
          text: "Please my dear, don't forget to add your API keys!",
          audio: arrayBufferToBase64( await t2s("hello my dear,I am your Virtual Girlfriend listening")),
          //lipsync: await readJsonTranscript("audios/api_0.json"),
          facialExpression: "angry",
          animation: "Angry",
        },
        {
          text: "You don't want to ruin Wawa Sensei with a crazy ChatGPT and ElevenLabs bill, right?",
          audio: await audioFileToBase64("audios/api_1.wav"),
         // lipsync: await readJsonTranscript("audios/api_1.json"),
          facialExpression: "smile",
          animation: "Laughing",
        },
      ],
    });
    return;
    }

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    max_tokens: 1000,
    temperature: 0.6,
    messages: [
      {
        role: "system",
        content: `
        You are a virtual girlfriend.
        You will always reply with a JSON array of messages. With a maximum of 3 messages.
        Each message has a text, facialExpression, and animation property.
        The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
        The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry. 
        `,
      },
      {
        role: "user",
        content: userMessage || "Hello",
      },
    ],
  });
// let messages = JSON.parse(completion.choices[0].message.content);
// let messages = [
//   {
//     text: userMessage,
//     audio: await audioFileToBase64("audios/api_0.wav"),
//     lipsync: await readJsonTranscript("audios/api_0.json"),
//     facialExpression: "angry",
//     animation: "Angry",
//   },

//  ];
  if (messages.messages) {
    messages = messages.messages; // ChatGPT is not 100% reliable, sometimes it directly returns an array and sometimes a JSON object with a messages property
  }
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    // generate audio file
    const fileName = `audios/message_${i}.mp3`; // The name of your audio file
    const textInput = message.text; // The text you wish to convert to speech
    await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput);
    // generate lipsync
    await lipSyncMessage(i);
    message.audio = await audioFileToBase64(fileName);
    message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
  }

  res.send({ messages });
   
};


const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file,"utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFileSync(file);
  return data.toString("base64");
};

function arrayBufferToBase64(arrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer);
  let binaryString = '';
  uint8Array.forEach((byte) => {
    binaryString += String.fromCharCode(byte);
  });
  return btoa(binaryString);
}
});
  

// Example usage:
// Replace 'yourArrayBuffer' with your actual ArrayBuffer



app.listen(port, () => {
  console.log(`Virtual Girlfriend listening on port ${port}`);
  
  let ar={
    a:20,
    b:50,
  }
  
  var options={
    // pythonPath: 'C:/Users/sathish C/anaconda3/bin',
    // scriptPath: 'eyepoint.py',
    mode:"json",
    args: JSON.stringify(ar)
  }
  PythonShell.run('eyeponts.py',options).then(data=>{
    Console.log(data)
  })
    // Make an HTTP POST request to Node.js REST API endpoint
    // You might need to install 'axios' or use 'node-fetch' for making HTTP requests
    // Here's an example using 'axios'
    
    axios.post('http://localhost:3001/receiveData', { data: receivedData })
      .then((response) => {
        console.log('Response from Node.js:', response.data);
      })
      .catch((error) => {
        console.error('Error sending data to Node.js:', error);
      });
  

  // Handle error output from Python
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Error from Python: ${data}`);
  });

  // Handle Python process exit
  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
  });
});
});
  
