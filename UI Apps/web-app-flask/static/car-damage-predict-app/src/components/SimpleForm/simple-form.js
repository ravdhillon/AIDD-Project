import React from 'react';
import { welcomeService } from '../../services/main-service.js';

class SimpleForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      greetings: '',
    };
    this.submitName = this.submitName.bind();
    this.handleChange = this.handleChange.bind(this);
  }

  submitName = (evt) => {
    evt.preventDefault();
    const name = this.state.name;
    welcomeService(name).then(result => {
      this.setState({
        greetings: result.greeting
      });
    })
  }
  handleChange = (e) => {    
    const name = e.target.value;
    this.setState({ name });
  }

  render() {
    return (
      <div>
        <form className="form-inline">
          <div className="form-group mb-2">
            <label for="staticEmail2" className="sr-only">Email</label>
            <input type="text" readonly className="form-control-plaintext" id="staticEmail2" value="email@example.com" />
          </div>
          <div className="form-group mx-sm-3 mb-2">
            <label for="inputPassword2" className="sr-only">Password</label>
            <input
              type="text"
              className="form-control" name="txtboxName"
              placeholder="Enter Name"
              content={this.state.name}
              onChange={this.handleChange} />
          </div>
          <button className="btn btn-primary mb-2" onClick={this.submitName}>submit</button>
        </form>
        <h4>{this.state.greetings}</h4>
      </div>
    )
  }
}
export default SimpleForm;