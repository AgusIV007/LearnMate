// let sendBtn = document.getElementById("send-btn");
// sendBtn.addEventListener("click", sendMessageToAi);

// let messageInput = document.getElementById("message-input");
// messageInput.addEventListener("keydown", function (event) {
//   if (event.key === "13" || event.key === 13) {
//     event.preventDefault();
//     sendMessageToAi();
//   }
// });

// function sendMessageToAi() {
//   const message = document.getElementById("message-input").value;
//   if (message) {
//     appendMessage("Tú: " + message);
//     fetch("/chat", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ message: message }),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         appendMessage(data.response);
//       });
//     document.getElementById("message-input").value = "";
//   }
// }
// function appendMessage(message) {
//   const messageElement = document.createElement("div");
//   messageElement.textContent = message;
//   document.getElementById("messages").appendChild(messageElement);
//   const chatBox = document.getElementById("chat-box");
//   chatBox.scrollTop = chatBox.scrollHeight;
// }
// function appendLine(message) {
//   const line = document.createElement("hr");

//   document.getElementById("messages").appendChild(messageElement);
//   const chatBox = document.getElementById("chat-box");
//   chatBox.scrollTop = chatBox.scrollHeight;
// }

// Settings.embedModel = new HuggingFaceEmbedding("BAAI/bge-small-en-v1.5");

// const hf = new HfInference("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");

// // Cargar documentos y crear el índice de búsqueda
// async function createIndex() {
//   let loader = new SimpleDirectoryReader();
//   let documents = await loader.loadData({
//     directoryPath: "./test",
//     recursive: true,
//     requiredExts: [".txt"],
//   });
//   const documentsWithEmbeddings = [];

//   for (let doc of documents) {
//     // Extraer el embedding de Hugging Face
//     const embedding = await hf.featureExtraction({
//       model: "BAAI/bge-small-en-v1.5",
//       inputs: doc.text,
//     });

//     // Crear un objeto de documento con el texto y el embedding
//     const documentWithEmbedding = new Document({
//       text: doc.text,
//       embedding: embedding, // Agregar el embedding al documento
//     });

//     // Guardar el documento con embedding
//     documentsWithEmbeddings.push(documentWithEmbedding);
//   }
//   console.log(documents);
//   // Crear el índice usando los documentos con embeddings en los metadatos y el tamaño de fragmento
//   return await VectorStoreIndex.fromDocuments(documentsWithEmbeddings);
// }

// // Endpoint principal de chat

import ollama, { Ollama } from "ollama";
import "dotenv/config";
import express from "express";
import cors from "cors";

import {
  SimpleDirectoryReader,
  VectorStoreIndex,
  Document,
  Settings,
  HuggingFaceEmbedding,
  PromptHelper,
  DEFAULT_CONTEXT_WINDOW,
} from "llamaindex";
import { HfInference } from "@huggingface/inference";

Settings.chunkSize = 4096;
Settings.llm = new Ollama({ model: "llama3.1:latest" });

// Configura los settings para desactivar OpenAI y usar Hugging Face
import ollama, { Ollama } from "ollama";
import "dotenv/config";
import express from "express";
import cors from "cors";

Settings.chunkSize = 4096;
Settings.llm = new Ollama({ model: "llama3.1:latest" });

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const userQuery = req.body.message;
    if (!userQuery) {
      return res.status(400).send({ error: "Query not provided" });
    }

    // Crear índice y motor de consulta
    const index = await createIndex();

    const llama = await ollama.create({
      model: "llama3.1:latest",
      modelfile: `
      FROM llama3.1:8b
      PARAMETER num_ctx 32768
      SYSTEM "Eres un asistente de estudio cuyo propósito es enseñar a los usuarios."
      `,
    });

    console.log("Index:", index);
    console.log("LLM:", llama);

    // Eliminar o ajustar esta parte de PromptHelper
    // PromptHelper.fromLLMMetadata({ contextWindow: 32768 }); // Eliminar si no es necesario

    const queryEngine = index.asQueryEngine({
      llm: llama,
    });

    // Realizar la consulta al motor
    const result = await queryEngine.query({ query: userQuery });
    res.send({
      response: "Respuesta generada por la IA: " + result.toString(),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: "An error occurred while processing the query." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Llamar a la función para crear el índice
// createIndex().catch((error) => {
//   console.error("Error al crear el índice:", error);
// });
