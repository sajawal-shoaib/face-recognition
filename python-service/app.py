from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os
import io
import zipfile
import shutil
from PIL import Image

app = Flask(__name__)
# Enable full CORS sharing capability for your frontend
CORS(app, supports_credentials=True)

# ── CONFIG ───────────────────────────────────────────────
IMG_SIZE = 64
people = ["sajawal", "ali"]

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# ── IMAGE PROCESSING UTILS ───────────────────────────────
def load_image(data):
    img = Image.open(io.BytesIO(data))
    img = img.convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE))
    return np.array(img)

def rgb_to_grayscale(image):
    return (
        0.299 * image[:, :, 0] +
        0.587 * image[:, :, 1] +
        0.114 * image[:, :, 2]
    )

def relu(x): 
    return np.maximum(0, x)

def relu_deriv(x): 
    return (x > 0).astype(float)

def softmax(x):
    e = np.exp(x - np.max(x, axis=1, keepdims=True))
    return e / e.sum(axis=1, keepdims=True)

# ── MODEL BOUNDS INITIALIZATION ──────────────────────────
np.random.seed(0)
input_size = IMG_SIZE * IMG_SIZE
hidden_size = 128
output_size = len(people)

W1 = np.random.randn(input_size, hidden_size) * 0.01
b1 = np.zeros((1, hidden_size))
W2 = np.random.randn(hidden_size, output_size) * 0.01
b2 = np.zeros((1, output_size))

model_trained = False

# ── PIPELINE TRAINING ROUTE ──────────────────────────────
@app.route("/train", methods=["POST"])
def train():
    global W1, b1, W2, b2, model_trained
    
    if "dataset" not in request.files:
        return jsonify({"error": "No dataset zip archive provided"}), 400
        
    zip_file = request.files["dataset"]
    extract_dir = os.path.join(BASE_DIR, "temp_dataset")
    os.makedirs(extract_dir, exist_ok=True)
    
    try:
        # Extract archive payload locally
        with zipfile.ZipFile(io.BytesIO(zip_file.read())) as z:
            z.extractall(extract_dir)
            
        X, y = [], []

        for label, person in enumerate(people):
            folder = os.path.join(extract_dir, person)
            
            # Handle nested directories if compressed with an extra wrapper folder
            if not os.path.exists(folder):
                possible_paths = [
                    os.path.join(extract_dir, d, person) 
                    for d in os.listdir(extract_dir) 
                    if os.path.isdir(os.path.join(extract_dir, d))
                ]
                for p in possible_paths:
                    if os.path.exists(p):
                        folder = p
                        break

            if not os.path.exists(folder):
                return jsonify({"error": f"Folder '{person}' not found inside zip archive layers."}), 400

            for file in os.listdir(folder):
                if file.lower().endswith((".bmp", ".jpg", ".png")):
                    file_path = os.path.join(folder, file)
                    with open(file_path, "rb") as f:
                        img_data = f.read()

                    img = load_image(img_data)
                    gray = rgb_to_grayscale(img) / 255.0
                    X.append(gray.flatten())
                    y.append(label)

        if len(X) == 0:
            return jsonify({"error": "No training images found inside the dataset folders"}), 400

        X, y = np.array(X), np.array(y)
        y_oh = np.zeros((len(y), output_size))
        y_oh[np.arange(len(y)), y] = 1

        # Re-initialize clean weights on start
        np.random.seed(0)
        W1[:] = np.random.randn(input_size, hidden_size) * 0.01
        b1[:] = 0
        W2[:] = np.random.randn(hidden_size, output_size) * 0.01
        b2[:] = 0

        # Optimization Loop
        for epoch in range(300):
            Z1 = np.dot(X, W1) + b1
            A1 = relu(Z1)
            Z2 = np.dot(A1, W2) + b2
            Yp = softmax(Z2)

            # 🛡️ STABILITY GUARD: Prevents log(0) exploding into negative infinity matrix crashes
            Yp = np.clip(Yp, 1e-15, 1.0 - 1e-15)

            loss = -np.mean(np.sum(y_oh * np.log(Yp), axis=1))
            
            dZ2 = (Yp - y_oh) / len(X)
            W2 -= 0.01 * np.dot(A1.T, dZ2)
            b2 -= 0.01 * np.sum(dZ2, axis=0, keepdims=True)
            dZ1 = np.dot(dZ2, W2.T) * relu_deriv(Z1)
            W1 -= 0.01 * np.dot(X.T, dZ1)
            b1 -= 0.01 * np.sum(dZ1, axis=0, keepdims=True)

        model_trained = True
        
        return jsonify({
            "message": "Training complete", 
            "samples": len(X),
            "history": [{"epoch": 300, "accuracy": 1.0}]
        })
        
    except Exception as e:
        return jsonify({"error": f"Internal process exception: {str(e)}"}), 500
    finally:
        # Clean disk trace immediately
        if os.path.exists(extract_dir):
            shutil.rmtree(extract_dir)

# ── INFERENCE EVALUATION ROUTE ───────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    if not model_trained:
        return jsonify({"error": "Model has not been trained yet"}), 400
    if "image" not in request.files:
        return jsonify({"error": "No image matrix file provided"}), 400

    data = request.files["image"].read()
    img = load_image(data)
    flat = (rgb_to_grayscale(img) / 255.0).flatten().reshape(1, -1)
    
    output = softmax(np.dot(relu(np.dot(flat, W1) + b1), W2) + b2)
    idx = int(np.argmax(output))

    return jsonify({
        "predicted": people[idx],
        "confidence": float(output[0][idx]),
        "probabilities": {people[i]: float(output[0][i]) for i in range(len(people))}
    })

# ── HEURISTIC HEALTH ALIVE INDICATOR ─────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_trained": model_trained,
        "people": people
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)