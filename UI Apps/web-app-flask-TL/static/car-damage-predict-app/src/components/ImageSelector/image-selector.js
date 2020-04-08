import React from 'react';
import PredictionBar from '../PredictionBar/prediction-bar.js';
import {predictDamageService, predictDentService, predictScratchService, predictSmashService } from '../../services/main-service.js';

import './image-selector.css';

const CLASIFIERS = [
    {model:'DAMAGE-WHOLE', key: 'Damage Classifier',description: 'Damage Whole Classifier'},
    {model:'DENT', key: 'Dent Classifier',description: 'Dent Classifier'},
    {model:'SCRATCH', key: 'Scratch Classifier',description: 'Scratch Classifier'},
    {model:'SMASH', key: 'Smash Classifier',description: 'Smash Classifier'}
];
     
class ImageSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      selectedImage: null,
      selectedImageIndex: -1,
      imagePredictions: null,
      
      damagePredictions: [],
      dentPredictions: [],
      scratchPredictions: [],
      smashPredictions: [],
      
      predictionDone: false,      
      predictions: [],
      isLoadingDamage: false,
      isLoadingDent: false,
      isLoadingScratch: false,
      isLoadingSmash: false,
      isLoading: false,
      estimateModal: false,
    }
    this.image_promises = [];
    this.handleImageLoad = this.handleImageLoad.bind(this);
    this.predict = this.predict.bind(this);
    this.renderPredictionBar = this.renderPredictionBar.bind(this);
    this.renderImages = this.renderImages.bind(this);
    this.runPromises = this.runPromises.bind(this);
    this.viewImagePrediction = this.viewImagePrediction.bind(this);
    this.setSelectedImage = this.setSelectedImage.bind(this);
    this.renderImageCardsByClassifier = this.renderImageCardsByClassifier.bind(this);
    this.getEstimates = this.getEstimates.bind(this);
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
        selectedImage: null,
      });  
    }
    reader.readAsDataURL(evt.target.files[0]);
  }

  predict = (evt) => {
    evt.preventDefault();
    const images = this.state.images;
    this.setState({
      isLoadingDamage: true,
      isLoadingDent: true,
      isLoadingScratch: true,
      isLoadingSmash: true,
      isLoading: true
    });
    images.forEach(image => {
      this.image_promises.push(predictDamageService(image.image));
      this.image_promises.push(predictDentService(image.image));
      this.image_promises.push(predictScratchService(image.image));
      this.image_promises.push(predictSmashService(image.image));
    });
    setTimeout(this.runPromises, 2000);
  }

  runPromises() {
    const damagePredictions = [];
    const dentPredictions = [];
    const scratchPredictions = [];
    const smashPredictions = []
    const promises = Promise.all(this.image_promises).then(response => {
      response.map(resp => {
        const model = resp.result.model;
        switch(model) {
          case 'DAMAGE-WHOLE':
            damagePredictions.push(resp.result.predictions)
            break;
          case 'DENT':
            dentPredictions.push(resp.result.predictions);
            break;
          case 'SCRATCH':
            scratchPredictions.push(resp.result.predictions);
            break;
          case 'SMASH':
            smashPredictions.push(resp.result.predictions);
            break;                            
        }
      });
      this.setState({
        damagePredictions,
        dentPredictions,
        scratchPredictions,
        smashPredictions,
        isLoading: false,
        predictionDone: true
      })
    });     
  }


  // predict = (evt) => {
  //   evt.preventDefault();
  //   const images = this.state.images;
  //   const damage_predictions = []
  //   images.forEach(image => {
  //       this.setState({ loading: true}, () => { });
  //       damagePredictService(image.image).then(resp => {
  //         damage_predictions.push(resp.result.predictions);            
  //       })
  //   });
  // }

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
        <div className="card card-image" key={`image-${idx}`} onClick={evt => this.setSelectedImage(evt, idx)} >
          <div className="card-body">        
            <img src={image.src} className="card-img-top" alt="Image" />            
          </div>
          <div className={`${this.state.selectedImageIndex === idx ? 'indicator-selected indicator' : 'indicator'}`}></div>
        </div>)
    });
    return thumbnail_strip;
  }
  
  getEstimates() {
    return (<div>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Hours</th>
            <th>Rate</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Body Labor</td>
            <td>3.5</td>
            <td>120.0</td>
            <td></td>
          </tr>
          <tr>
            <td>Paint Labor</td>
            <td>1.5</td>
            <td>95.0</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>)
  }

  renderPredictionBar(card_title) {
      let model_predictions;
      switch(card_title) {
        case 'DAMAGE-WHOLE':
            model_predictions = this.state.damagePredictions[0];
          break;
        case 'DENT':
            model_predictions  = this.state.dentPredictions[0];
          break;
        case 'SCRATCH':
            model_predictions  = this.state.scratchPredictions[0];
          break;
        case 'SMASH':
            model_predictions  = this.state.smashPredictions[0];
          break;           
      }
      const values  = model_predictions.map(data => Number(data.value.replace('%', '')))
      const min = Math.min(values);
      const max = Math.max(values);
      const ratio = max / 100;            
      const bars = model_predictions.map(data => {      
        const label = data.key;
        const percent = data.value;
        const width = Math.round(Number(data.value.replace('%', ''))/ratio) * 100;
        return <PredictionBar label={label}
                              width={width}
                              percent={percent} 
            />
        });
      return bars;
  }

  setSelectedImage(evt, idx) {
    const image = this.state.images[idx];
    this.setState({
      selectedImage: image.src,
      selectedImageIndex: idx
    });
  }

  renderImageCardsByClassifier(selectedImage) {
    const classifier_cards = CLASIFIERS.map(model => {
      return (<div className="card" style={{maxWidth: '25%'}}>
      <img className="card-img-top" src={selectedImage} alt="Card image" />
      <div className="card-body">
        <h4 className="card-title">{model.key}</h4>
        <p className="card-text">{model.description}</p>
        <hr />
        <div className="bars">
          {this.state.isLoading ? <div className="spinner-border text-primary" role="status">
  <span className="sr-only">Loading...</span>
</div> : null}
          {this.state.predictionDone && this.renderPredictionBar(model.model)}  
        </div>        
      </div>
    </div>)
    });
    return classifier_cards;
  }

  render() {
    const { images, selectedImage, loading, predictionDone } = this.state;
    let htmlElemt = selectedImage && this.renderImageCardsByClassifier(selectedImage);
    
    // if (!loading && selectedImage === null) {
    //   htmlElemt = <label className="info">Upload Images and click Predict to evaluate.</label>
    // }
    // if(!loading && predictionDone) {
    //   htmlElemt = <label className="info">Click on the image to view the predictions.</label>
    // }
    // if(!loading && selectedImage) {
    //   htmlElemt = <div className='image-bar-container'>
    //     <img src={selectedImage} className="card-img-top" alt="Image" style={{maxWidth: '75%'}}/>
    //     <div className="bars">
    //       {this.renderPredictionBar()}  
    //     </div>
    //   </div>
    // }
    return(        
        <div className='image-container'>
          <div className='image-action-bar'>
            <input name="image-box" type="file" onChange = {this.handleImageLoad}/>              
          </div>
            
          <div className='image-section'>
            <div className="image-section-bar">                
              {this.renderImages(images)}                              
            </div>
            <hr />
            {images.length > 0 ? <button className="predict-button btn btn-primary" onClick={this.predict}>Predict</button>: null}            
            <div className='image-section-detail'>
              {htmlElemt}
            </div>
            <hr />
            {this.state.predictionDone && <button className="predict-button btn btn-primary" data-toggle="modal" data-target="#exampleModal" onClick={this.getEstimates}>Estimates</button> }
          </div>
        <div className="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Modal title</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {this.getEstimates()}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                <button type="button" className="btn btn-primary">Save changes</button>
              </div>
            </div>
          </div>
        </div>          
        </div>
      )
  }
}

export default ImageSelector;
