import numpy as np
import pandas as pd
import io
import os
import base64
import cv2

import tensorflow as tf
from tensorflow.python.keras.backend import set_session
from keras.models import Sequential
from keras.models import load_model
from keras.preprocessing.image import ImageDataGenerator
from keras.preprocessing.image import img_to_array

from flask import Flask
from flask import request
from flask import jsonify

# Create instance of Flask App
app = Flask(__name__)

@app.route('/ping')
def test():
    response = {
        'ping' : 'OK'
    }
    return response

@app.route('/hello', methods=['POST'])
def hello():
    request_param = request.get_json(force=True)
    name = request_param['name']
    response = {
        'greeting': 'Hello, ' + name + '!'
    }
    return jsonify(response)

def get_model():
    global model
    global graph
    global sess
    tf_config = tf.ConfigProto()
    sess = tf.Session(config=tf_config)
    set_session(sess)
    model_path = os.path.join(os.getcwd(), 'model', 'car-damage-multi-label-model.h5')
    print(f'Model Path: {model_path}')
    model = load_model(model_path)
    model._make_predict_function()
    graph = tf.compat.v1.get_default_graph()
    print(" Model Loaded ")

# preprocess the image to the format (resize, convert to numpy array) needed for the model.
def preprocess_image(image, target_size):
    if image.mode != "RGB":
        image = image.convert("RGB")
    image = image.resize(target_size)
    image = image.astype("float") / 255.0
    image = img_to_array(image)
    image = np.expand_dims(image, axis=0)
    return image

print(" Loading Keras model ...")
get_model() #Load model in memory before the API call.

@app.route("/predict", methods=['POST'])
def predict_damage():
    request_param = request.get_json(force=True)
    encoded_image = request_param['image']
    print("Encoded Image: ", encoded_image)
    decoded_image = base64.b64decode(encoded_image)
    image = Image.open(io.BytesIO(decoded_image))
    print("Encoded Image: ", encoded_image)
    processed_image = preprocess_image(image, target_size=(150, 150))
    mlb_classes = ['damage','front','minor','moderate','rear','severe','side','whole']
    with graph.as_default():
        set_session(sess)
        print("Start Prediction")
        proba = model.predict(processed_image)[0]
        print('Probs: ', proba)
        idxs = np.argsort(proba)[::-1][:2]
        print('idxs: ', idxs)
        for (i, j) in enumerate(idxs):
            # build the label and draw the label on the image
            label = "{}: {:.2f}%".format(mlb_classes[i], proba[i] * 100)
            #cv2.putText(output, label, (10, (i * 30) + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        # show the probabilities for each of the individual labels
        for (label, p) in zip(mlb_classes, proba):
            print("{}: {:.2f}%".format(label, p * 100))

    return "OKAY"