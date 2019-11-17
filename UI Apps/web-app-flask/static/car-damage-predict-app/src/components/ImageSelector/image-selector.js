import React from 'react';
import {predictService} from '../../services/main-service.js';

class ImageSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
      imageSorce: null,
    }
    this.handleImageLoad = this.handleImageLoad.bind(this);
    this.predict = this.predict.bind(this);
  }

  handleImageLoad = (evt) => {
    let reader = new FileReader();
    let image_obj = evt.target.files[0];
    reader.onloadend = () => {
      let imageURL = reader.result;
      
      let base64Image = imageURL.replace("data:image/png;base64,", "");
      if(image_obj.type === 'image/jpeg') {
        base64Image = imageURL.replace("data:image/jpeg;base64,", "");
      }
      console.log(base64Image);      
      this.setState({
        image: base64Image,
        imageSorce: imageURL
      });  
    }
    reader.readAsDataURL(evt.target.files[0]);
  }

  predict = (evt) => {
    evt.preventDefault();
    const image = this.state.image;
    predictService(image).then(response => {
      console.log(response);
    });
  }

  render() {
    const {image, imageSorce} = this.state;
    return image ? (<div className="card" style={{width: "18rem"}}>
      <img src={imageSorce} className="card-img-top" alt="Image" />
      <div className="card-body">
        <h5 className="card-title">Card title</h5>
        <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
        <button className="btn btn-primary" onClick={this.predict}>Predict</button>
      </div>
    </div>) : (
        <div>
          <input name="image-box" type="file" onChange = {this.handleImageLoad}/>
        </div>
      )
  }
}

export default ImageSelector;
