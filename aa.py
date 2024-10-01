from llama_index.llms.ollama import Ollama
from llama_index.core import VectorStoreIndex
from llama_index.core import SimpleDirectoryReader
import warnings
from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings
from flask import Flask,render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    def ia(query):
        warnings.simplefilter(action='ignore', category=FutureWarning)
        loader = SimpleDirectoryReader(
            input_dir="./test/",
            recursive=True,
            required_exts=[".txt"],
        )
        documents = loader.load_data()

        inference_api_key = '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'
        embeddings = HuggingFaceInferenceAPIEmbeddings(
            api_key=inference_api_key, model_name="BAAI/bge-small-en-v1.5"
        )

        index = VectorStoreIndex.from_documents(
            documents,
            embed_model=embeddings,
        )

        llama = Ollama(model="llama3.1:latest")

        query_engine = index.as_query_engine(llm=llama, timeout=None)

        result = query_engine.query(query)
        return result
    user_input = request.json.get("message")
    response = "Respuesta generada por la IA: " + str(ia(user_input))
    return jsonify({"response": response})


if __name__ == '__main__':
    app.run(debug=True)

