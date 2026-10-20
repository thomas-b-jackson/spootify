import React from 'react';
import ReactDOM from 'react-dom';
import Routes from './routes';
import CoreLayout from './common/layouts/CoreLayout';
import { PlayerProvider } from './common/context/PlayerContext';
import './styles/_main.scss';

ReactDOM.render(
  <React.StrictMode>
    <PlayerProvider>
      <CoreLayout>
        <Routes />
      </CoreLayout>
    </PlayerProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
