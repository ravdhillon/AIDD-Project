import numpy as np
import pandas as pd
import io
import os
import base64
import cv2
import pickle
from PIL import Image
import tensorflow as tf
from tensorflow.python.keras.backend import set_session
from keras.models import Sequential
from keras.models import load_model
from keras.preprocessing.image import ImageDataGenerator
from keras.preprocessing.image import img_to_array

from flask import Flask
from flask import request
from flask import jsonify

# Create instance of Flask Application
application = Flask(__name__)
@application.route('/ping')
def test():
    response = {
        'ping' : 'OK'
    }
    return response

@application.route('/hello', methods=['POST'])
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
    global mlb
    tf_config = tf.compat.v1.ConfigProto()
    sess = tf.compat.v1.Session(config=tf_config)
    set_session(sess)
    model_path = os.path.join(os.getcwd(), 'model', 'car-damage-multi-label-model.h5')
    print('Loading Model ...')
    model = load_model(model_path)
    model._make_predict_function()
    graph = tf.compat.v1.get_default_graph()
    print(" Model Loaded ")
    print()
    print('Loading Pickle file...')
    pickle_file = os.path.join(os.getcwd(), 'picklefiles', 'pickle')
    mlb = pickle.loads(open(pickle_file, "rb").read())

# preprocess the image to the format (resize, convert to numpy array) needed for the model.
def preprocess_image(image, target_size):
    if image.mode != "RGB":
        image = image.convert("RGB")
    image = image.resize(target_size)
    image = img_to_array(image)
    image = image.astype("float") / 255.0
    image = np.expand_dims(image, axis=0)
    return image

print(" Loading Keras model ...")
get_model() #Load model in memory before the API call.

@application.route("/predict", methods=['POST'])
def predict_damage():
    request_param = request.get_json(force=True)
    encoded_image = request_param['image']
    decoded_image = base64.b64decode(encoded_image)
    PIL_image = Image.open(io.BytesIO(decoded_image))    
    processed_image = preprocess_image(PIL_image, target_size=(150, 150))
    predictions = []
    count=0
    with graph.as_default():
        set_session(sess)
        print("Start Prediction")
        proba = model_damage_whole.predict(processed_image)[0]
        print('Probs: ', proba)
        idxs = np.argsort(proba)[::-1][:2]
        print('idxs: ', idxs)
        for (i, j) in enumerate(idxs):
            # build the label
            count = count + 1
            label = "{}: {:.2f}%".format(mlb.classes_[j], proba[j] * 100)

        # show the probabilities for each of the individual labels
        for (label, p) in zip(mlb.classes_, proba):
            print("{}: {:.2f}%".format(label, p * 100))
            json = {
                'key': f'{label}',
                'value': '{:.2f}%'.format(p * 100)
            }
            predictions.append(json)
    response = {
        'result': {
            'count': count,
            'predictions': predictions
        }
    }
    print(response)
    return jsonify(response)

if __name__=="__main__":
    application.debug = True
    application.run()