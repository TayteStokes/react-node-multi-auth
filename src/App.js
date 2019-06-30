import React, { Component } from 'react'

// CSS
import 'reset-css';
import './styles/App.css';

class App extends Component {
  render() {
    return (
      <div className="app-container">
        <form className="form-container">
          <input type="email" placeholder="email"/>
          <input type="password" placeholder="password"/>
          <button>Login</button>
          <button>Register</button>
          <button>Gmail</button>
          <button>Twitter</button>
          <button>Github</button>
          <button>Facebook</button>
        </form>
      </div>
    )
  }
};

export default App;