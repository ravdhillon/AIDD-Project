import React from 'react';
import PredictionBar from '../PredictionBar/prediction-bar.js';
import {predictService} from '../../services/main-service.js';

import './image-selector.css';
class ImageSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      selectedImage: null,
      selectedImageIndex: -1,
      imagePredictions: null,
      predictionDone: false,      
      predictions: [],
      loading: false,
    }
    this.image_promises = [];
    this.handleImageLoad = this.handleImageLoad.bind(this);
    this.predict = this.predict.bind(this);
    this.renderPredictionBar = this.renderPredictionBar.bind(this);
    this.renderImages = this.renderImages.bind(this);
    this.runPromises = this.runPromises.bind(this);
    this.viewImagePrediction = this.viewImagePrediction.bind(this);
  }

  handleImageLoad = (evt) => {
    let reader = new FileReader();
    let image_obj = evt.target.files[0];
    const images = this.state.images;
    reader.onloadend = () => {
      let imageURL = reader.result;
      
      let base64Image = imageURL.replace("data:image/png;base64,", "");
      if(image_obj.type === 'image/jpeg') {
        base64Image = imageURL.replace("data:image/jpeg;base64,", "");
      }
      const img = {
        'image': base64Image,
        'src': imageURL
      };
      images.push(img); 
      this.setState({
        images,
        selectedImage: img[0]
      });  
    }
    reader.readAsDataURL(evt.target.files[0]);
  }

  predict = (evt) => {
    evt.preventDefault();
    const images = this.state.images;
    
    images.forEach(image => {
        this.setState({ loading: true, predictionDone: false}, () => { });
        this.image_promises.push(predictService(image.image));
    });
    setTimeout(this.runPromises, 5000);
  }

  runPromises() {
    const predictions = []
    const promises = Promise.all(this.image_promises).then(response => {
      response.map(resp => {
        predictions.push(resp.result.predictions);
      });
      this.setState({
        predictions,
        loading: false,
        predictionDone: true
      })
    });     
  }

  viewImagePrediction(evt, idx) {
    if(this.state.predictionDone) {
      const image = this.state.images[idx];
      const prediction = this.state.predictions[idx];
      this.setState({
        selectedImage: image.src,
        imagePredictions: prediction,
        selectedImageIndex: idx
      });
    } else{
      alert('Please Predict the images first.');
    }
  }

  renderImages(images) {
    const thumbnail_strip = images.map((image, idx) => {
      return (
        <div className="card card-image" key={`image-${idx}`} onClick={evt => this.viewImagePrediction(evt, idx)} >
          <div className="card-body">        
            <img src={image.src} className="card-img-top" alt="Image" />            
          </div>
          <div className={`${this.state.selectedImageIndex === idx ? 'indicator-selected indicator' : 'indicator'}`}></div>
        </div>)
    });
    return thumbnail_strip;
  }
  
  renderPredictionBar() {
      const predictions = this.state.imagePredictions;
      const values  = predictions.map(prediction => Number(prediction.value.replace('%', '')))
      const min = Math.min(values);
      const max = Math.max(values);
      const ratio = max / 100;
      const bars = predictions.map(prediction => {      
        const label = prediction.key;
        const percent = prediction.value;
        const width = Math.round(Number(prediction.value.replace('%', ''))/ratio) * 100;
        // let new_width;
        // if(width > 0 && width <= 1) {
        //   new_width = width * 20;
        // } else if (width > 1 && width <= 5) {
        //   new_width = width * 10;
        // } else if (width > 5 && width <= 10) {
        //   new_width = width * 5
        // } else {
        //   new_width = width;
        // }
        return <PredictionBar label={label}
                              width={width}
                              percent={percent} 
            />
        });
        return bars;
  }

  render() {
    const { images, selectedImage, loading, predictionDone } = this.state;
    let htmlElemt = null;
    if (loading) {
      htmlElemt = <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                  </div>
    }
    if (!loading && selectedImage === null) {
      htmlElemt = <label className="info">Upload Images and click Predict to evaluate.</label>
    }
    if(!loading && predictionDone) {
      htmlElemt = <label className="info">Click on the image to view the predictions.</label>
    }
    if(!loading && selectedImage) {
      htmlElemt = <div className='image-bar-container'>
        <img src={selectedImage} className="card-img-top" alt="Image" style={{maxWidth: '75%'}}/>
        <div className="bars">
          {this.renderPredictionBar()}  
        </div>
      </div>
    }
    return(        
        <div className='image-container'>
            <div className='image-action-bar'>
              <input name="image-box" type="file" onChange = {this.handleImageLoad}/>              
            </div>
            <hr />
            {images.length > 0 ? <button className="btn btn-primary" onClick={this.predict} style={{display: 'flex', marginBottom: '10px'}}>Predict</button>: null}
            <div className='image-section'>
              <div className="image-section-bar">                
                {this.renderImages(images)}
              </div>
              <div className='image-section-detail'>
                {htmlElemt}
              </div>
            </div>
          </div>
      )
  }
}

export default ImageSelector;
