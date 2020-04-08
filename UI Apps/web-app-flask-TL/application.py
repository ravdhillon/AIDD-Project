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
    # Model Variables
    global damage_model
    global dent_model
    global scratch_model
    global smash_model

    global graph
    global sess
    global mlb

    tf_config = tf.compat.v1.ConfigProto()
    sess = tf.compat.v1.Session(config=tf_config)
    set_session(sess)
    
    
    model_folder = os.path.join(os.getcwd(), 'model')    
    
    # 1. Load the Damage Whole model
    h5_file = os.path.join(model_folder, 'damage-classifier', 'car-damage-whole-TL-model.h5')    
    damage_model = load_model(h5_file)
    damage_model._make_predict_function()    
    print('[ Damage Whole model Loaded ]')

    # 2. Load the Dent model
    h5_file = os.path.join(model_folder, 'dent-classifier', 'car-dent-TL-model.h5')    
    dent_model = load_model(h5_file)
    dent_model._make_predict_function()    
    print('[ Dent model Loaded ]')

    # 3. Load the Scratch model
    h5_file = os.path.join(model_folder, 'scratch-classifier', 'car-scratch-TL-model.h5')    
    scratch_model = load_model(h5_file)
    scratch_model._make_predict_function()    
    print('[ Scratch model Loaded ]')

    # 4. Load the Smash model
    h5_file = os.path.join(model_folder, 'smash-classifier', 'car-smash-TL-model.h5')    
    smash_model = load_model(h5_file)
    smash_model._make_predict_function()    
    print('[ Smash model Loaded ]')
    
    graph = tf.compat.v1.get_default_graph()    
    # print()
    # print('Loading Pickle file...')
    # pickle_file = os.path.join(os.getcwd(), 'picklefiles', 'pickle')
    # mlb = pickle.loads(open(pickle_file, "rb").read())

# preprocess the image to the format (resize, convert to numpy array) needed for the model.
def preprocess_image(image, target_size):
    if image.mode != "RGB":
        image = image.convert("RGB")
    image = image.resize(target_size)
    image = img_to_array(image)
    image = image.astype("float") / 255.0
    image = np.expand_dims(image, axis=0)
    return image

print("Please wait while looading Keras model ...")
get_model() #Load model in memory before the API call.

def predict_damage(classifier, labels, request):
    request_param = request.get_json(force=True)
    encoded_image = request_param['image']
    decoded_image = base64.b64decode(encoded_image)
    PIL_image = Image.open(io.BytesIO(decoded_image))    
    processed_image = preprocess_image(PIL_image, target_size=(224, 224))

    predictions = []
    count=0
    with graph.as_default():
        set_session(sess)
        print("Start Prediction")
        proba = classifier.predict(processed_image)[0]
        print('Probs: ', proba)
        idxs = np.argsort(proba)[::-1][:2]
    #     for (i, j) in enumerate(idxs):
    #         # build the label
    #         count = count + 1
    #         label = "{}: {:.2f}%".format(mlb.classes_[j], proba[j] * 100)

    #     # show the probabilities for each of the individual labels
        for (label, p) in zip(labels, proba):            
            json = {
                'key': f'{label}',
                'value': '{:.2f}%'.format(p * 100)
            }
            predictions.append(json)
    return predictions

@application.route("/predict", methods=['POST'])
def run_damage_classifiers():    
    predictions = predict_damage(damage_model, ['Damage', 'Whole'], request)
    response = {
        'result': {
            'model': 'DAMAGE-WHOLE',
            'predictions': predictions
        }
    }
    print(f'Prediction Result for {damage_model} Classifier: ', response)
    return jsonify(response)    

@application.route("/predict/dent", methods=['POST'])
def run_dent_classifiers():  
    predictions = predict_damage(dent_model, ['Dent', 'No-Dent'], request)
    response = {
        'result': {
            'model': 'DENT',
            'predictions': predictions
        }
    }
    print(f'Prediction Result for {dent_model} Classifier: ', response)
    return jsonify(response)

@application.route("/predict/scratch", methods=['POST'])
def run_scratch_classifiers():  
    predictions = predict_damage(scratch_model, ['Scratch', 'No-Scratch'], request)
    response = {
        'result': {
            'model': 'SCRATCH',
            'predictions': predictions
        }
    }
    print(f'Prediction Result for {scratch_model} Classifier: ', response)
    return jsonify(response)

@application.route("/predict/smash", methods=['POST'])
def run_smash_classifiers():  
    predictions = predict_damage(smash_model, ['Smash', 'No-Smash'], request)
    response = {
        'result': {
            'model': 'SMASH',
            'predictions': predictions
        }
    }
    print(f'Prediction Result for {smash_model} Classifier: ', response)
    return jsonify(response)        


if __name__=="__main__":
    application.debug = True
    application.run()