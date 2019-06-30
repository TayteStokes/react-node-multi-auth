import React, { Component } from 'react'
import axios from 'axios';

// CSS
import 'reset-css';
import './styles/App.css';

class App extends Component {

  state = {
    username: '',
    password: '',
    user: {}
  };

  // handle input change
  handleInputChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  // local register
  registerUser = event => {
    event.preventDefault();
    const {username, password} = this.state;
    const body = {
      username,
      password
    };
    axios.post('/auth/local/register', body)
      .then(response => {
        this.setState({
          user: response.data
        })
      })
      .catch(error => {
        if (error) throw error
      });
  };

  // local login
  loginUser = event => {
    event.preventDefault();
    const {username, password} = this.state;
    const body = {
      username,
      password
    };
    axios.post('/auth/local/login', body)
      .then(response => {
        this.setState({
          user: response.data
        })
      })
      .catch(error => {
        if (error) throw error
      });
  }

  render() {
    console.log(this.state)
    return (
      <div className="app-container">
        <div className="form-container">
          <input type="username" placeholder="username" name="username" onChange={this.handleInputChange}/>
          <input type="password" placeholder="password" name="password" onChange={this.handleInputChange}/>
          <button onClick={this.loginUser}>Login</button>
          <button onClick={this.registerUser}>Register</button>
          <a href="http://localhost:3005/auth/google">Sign In with Google</a>
          <button>Twitter</button>
          <button>Github</button>
          <button>Facebook</button>
        </div>
      </div>
    )
  }
};

export default App;