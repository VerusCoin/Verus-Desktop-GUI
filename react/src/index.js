import React from 'react';
import { render } from 'react-dom';
import '@fontsource/source-code-pro/latin.css';
import '@fontsource/source-sans-pro/latin.css';
import '@fontsource/source-sans-pro/latin-italic.css';
import {
  Router,
  Route,
  hashHistory
} from 'react-router';
import { Provider } from 'react-redux';
import store from './store';

import App from './components/app/app';
import './styles/index.scss';
import ErrorBoundary from './components/error/ErrorBoundary';
import { TerminalContextProvider } from 'react-terminal';

Object.freeze(Object.prototype);
Object.freeze(Object);

const router = (
  <ErrorBoundary>
    <TerminalContextProvider>
      <Provider store={ store }>
        <Router history={ hashHistory }>
          <Route
            exact path="/"
            component={ App } />
        </Router>
      </Provider>
    </TerminalContextProvider>
  </ErrorBoundary>
);

document.addEventListener('DOMContentLoaded', () => {
  render(
    router,
    document.getElementById('app'),
  );
});
