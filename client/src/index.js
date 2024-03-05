import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import reportWebVitals from './reportWebVitals';
import 'antd/dist/antd';
import store from './redux/store';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_API_TOKEN}>
    <Provider store={store}>
      <App />
    </Provider>
  </GoogleOAuthProvider>
);

reportWebVitals();
