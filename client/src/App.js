import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/chat" component={Chat} />
        </Switch>
      </div>
    </Router>
  );
}

function Home() {
  return <h1>Welcome to Modern Messaging App</h1>;
}

export default App;