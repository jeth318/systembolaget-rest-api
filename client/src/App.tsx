import * as React from 'react';
import {ProductService} from './services/ProductService';
import './App.css';
const productService = new ProductService();

const logo = require('./logo.svg');

class App extends React.Component <any, any> {

  constructor() {
    super({});
    this.state = {
      email: '',
      password: '',
      products: null,
    };
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>

        <form onSubmit={this.doLogin}>
          <input type="text" onChange={this.handleEmailChange} value={this.state.email} />
          <input type="password" onChange={this.handlePasswordChange} value={this.state.password} />
          <input type="submit" value="Login" />
        </form>

      <button>GET COOKIE</button>

      <button onClick={this.handleClick} >Click to view all stores!</button>
      <div>
      <ul>
        {this.state.products !== null && this.renderProducts}
      </ul>
      </div>
      </div>
    );
  }

  private get renderProducts(){
    console.log(this.state.products);

    return this.state.products.products.map((prod)=>{
      return (
      <h3 key={prod._id}>{prod.namn}</h3>
      )
    })
  }

  handleClick = () => {
   this.setState({loading: true});
    return productService.GetAllStores()
    .then((products)=>{
      console.log('State set');
      console.log(products);      
      this.setState({products, loading: false})
    })
    .catch((err)=>console.log('Error: ' + err ))
  }

  handleEmailChange = (event: any) => {
    console.log(event);
    this.setState({
      email: event.target.value
    });
  }
  handlePasswordChange = (event: any) => {
    this.setState({
      password: event.target.value
    });
  }

   doLogin = (e: any) => {
    e.preventDefault();
    var username = this.state.email;
    var password = this.state.password;

    fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({email: username, password: password}),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .catch(error => console.error('Error:', error))
    .then(response => {
        console.log(response);
       if (response.token) {
           document.cookie = `token=${response.token}`;
           console.log('Cookie set.')
       } else {
           console.log(response);
       }
    });
}

  getCookie = (cname: any) => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
    }
}

export default App;
