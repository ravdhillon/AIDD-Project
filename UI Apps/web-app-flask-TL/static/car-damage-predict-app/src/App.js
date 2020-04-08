import React from 'react';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';

import PageContainer  from './components/PageContainer/page-container.js';

function App() {
  return (
    <div className="App">
      <div className="container-fluid">
        <h3>Auto Damage Classifier</h3>        
        <PageContainer />
      </div>
    </div>
  );
}

export default App;
