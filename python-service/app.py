from flask import Flask, request, jsonify
import numpy as np
import os
import io
from PIL import Image

app = Flask(__name__)

# ── CONFIG ───────────────────────────────────────────────
IMG_SIZE = 64
people = ["sajawal", "ali"]

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

# ── IMAGE LOADER (FIXED) ────────────────────────────────

def load_image(data):
    img = Image.open(io.BytesIO(data))
    img = img.convert("RGB")          # ensure 3 channels
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

# ── MODEL INIT ───────────────────────────────────────────

np.random.seed(0)
input_size = IMG_SIZE * IMG_SIZE
hidden_size = 128
output_size = len(people)

W1 = np.random.randn(input_size, hidden_size) * 0.01
b1 = np.zeros((1, hidden_size))
W2 = np.random.randn(hidden_size, output_size) * 0.01
b2 = np.zeros((1, output_size))

model_trained = False

# ── TRAIN ────────────────────────────────────────────────

@app.route("/train", methods=["POST"])
def train():
    global W1, b1, W2, b2, model_trained

    dataset_path = DATASET_DIR   # FORCE correct path

    X, y = [], []

    for label, person in enumerate(people):
        folder = os.path.join(dataset_path, person)

        if not os.path.exists(folder):
            return jsonify({"error": f"Folder not found: {folder}"}), 400

        for file in os.listdir(folder):
            if file.lower().endswith((".bmp", ".jpg", ".png")):
                file_path = os.path.join(folder, file)

                with open(file_path, "rb") as f:
                    img_data = f.read()

                img = load_image(img_data)
                gray = rgb_to_grayscale(img) / 255.0

                X.append(gray.flatten())
                y.append(label)

    X = np.array(X)
    y = np.array(y)

    # one-hot encoding
    y_oh = np.zeros((len(y), output_size))
    y_oh[np.arange(len(y)), y] = 1

    # reset weights
    np.random.seed(0)
    W1[:] = np.random.randn(input_size, hidden_size) * 0.01
    b1[:] = 0
    W2[:] = np.random.randn(hidden_size, output_size) * 0.01
    b2[:] = 0

    history = []

    # training loop
    for epoch in range(300):  # faster training
        Z1 = np.dot(X, W1) + b1
        A1 = relu(Z1)
        Z2 = np.dot(A1, W2) + b2
        Yp = softmax(Z2)

        loss = -np.mean(np.sum(y_oh * np.log(Yp + 1e-7), axis=1))

        dZ2 = (Yp - y_oh) / len(X)
        dW2 = np.dot(A1.T, dZ2)
        db2 = np.sum(dZ2, axis=0, keepdims=True)

        dZ1 = np.dot(dZ2, W2.T) * relu_deriv(Z1)
        dW1 = np.dot(X.T, dZ1)
        db1 = np.sum(dZ1, axis=0, keepdims=True)

        W2 -= 0.01 * dW2
        b2 -= 0.01 * db2
        W1 -= 0.01 * dW1
        b1 -= 0.01 * db1

        if epoch % 50 == 0:
            acc = np.mean(np.argmax(Yp, axis=1) == y)
            history.append({
                "epoch": epoch,
                "loss": float(loss),
                "accuracy": float(acc)
            })

    model_trained = True

    return jsonify({
        "message": "Training complete",
        "samples": len(X),
        "history": history
    })

# ── PREDICT ──────────────────────────────────────────────

@app.route("/predict", methods=["POST"])
def predict():
    if not model_trained:
        return jsonify({"error": "Model not trained yet"}), 400

    if "image" not in request.files:
        return jsonify({"error": "No image file"}), 400

    data = request.files["image"].read()

    img = load_image(data)
    flat = (rgb_to_grayscale(img) / 255.0).flatten().reshape(1, -1)

    output = softmax(
        np.dot(relu(np.dot(flat, W1) + b1), W2) + b2
    )

    idx = int(np.argmax(output))

    return jsonify({
        "predicted": people[idx],
        "confidence": float(output[0][idx]),
        "probabilities": {
            people[i]: float(output[0][i]) for i in range(len(people))
        }
    })

# ── HEALTH ───────────────────────────────────────────────

@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "model_trained": model_trained,
        "people": people
    })

# ── RUN ──────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)