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

import ollama from "ollama";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { SimpleDirectoryReader, VectorStoreIndex, Document } from "llamaindex";
import { HfInference } from "@huggingface/inference"; // Importar Hugging Face Inference API

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const hf = new HfInference("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"); // Clave de API para Hugging Face

// Cargar documentos y crear el índice de búsqueda
const embeddingStorage = {}; // Objeto para almacenar embeddings externamente

async function createIndex() {
  const loader = new SimpleDirectoryReader();
  const rawDocuments = await loader.loadData({
    directoryPath: "./test",
    recursive: true,
    requiredExts: [".txt"],
  });

  // Asegurarse de que cada documento esté en el formato correcto
  const documents = rawDocuments.map((doc) => new Document({ text: doc.text }));

  // Generar embeddings con Hugging Face
  const embeddings = await Promise.all(
    documents.map(async (doc) => {
      const embedding = await hf.featureExtraction({
        model: "BAAI/bge-small-en-v1.5",
        inputs: doc.toJSON(),
      });
      return { ...doc, embedding };
    })
  );
  // Crear el índice usando los documentos procesados y los embeddings
  return await VectorStoreIndex.fromDocuments(embeddings);
}

// Endpoint principal de chat
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
      FROM llama3.1
      SYSTEM "Eres un asistente de estudio cuyo propósito es enseñar a los usuarios."
      `,
    });
    const queryEngine = index.asQueryEngine({ llm: llama });

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
  console.log(`http://localhost:${port}`);
});
