import React, { createContext, useContext, useState } from 'react';

/**
 * Shares the currently selected ("now playing") item between the Discover
 * items (which set it on click) and the Player (which renders the Spotify
 * embed for it). The item shape is { id, name, type }.
 */
const PlayerContext = createContext({
  current: null,
  play: () => {}
});

export function PlayerProvider({ children }) {
  const [current, setCurrent] = useState(null);

  const play = (item) => setCurrent(item);

  return (
    <PlayerContext.Provider value={{ current, play }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}

export default PlayerContext;
