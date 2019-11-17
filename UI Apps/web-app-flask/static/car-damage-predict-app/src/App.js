import React from 'react';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import SimpleForm from './components/SimpleForm/simple-form.js';
import logo from './logo.svg';
import './App.css';
import ImageSelector from './components/ImageSelector/image-selector.js';

function App() {
  return (
    <div className="App">
      <div className="container-fluid">
        <ImageSelector />
      </div>
    </div>
  );
}

export default App;
