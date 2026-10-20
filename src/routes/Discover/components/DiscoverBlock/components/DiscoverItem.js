import React from 'react';
import cx from 'classnames';
import { usePlayer } from '../../../../../common/context/PlayerContext';
import '../styles/_discover-item.scss';

export default function DiscoverItem({ id, type, images, name }) {
  const { current, play } = usePlayer();

  // Only items with an id/type can be played via the Spotify embed.
  const playable = Boolean(id && type);
  const isSelected = playable && current && current.id === id;

  const onPlay = () => {
    if (playable) {
      play({ id, type, name });
    }
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPlay();
    }
  };

  return (
    <div
      className={cx('discover-item animate__animated animate__fadeIn', {
        'discover-item--selected': isSelected
      })}
      role={playable ? 'button' : undefined}
      tabIndex={playable ? 0 : undefined}
      aria-label={playable ? `Play ${name}` : undefined}
      aria-pressed={playable ? isSelected : undefined}
      onClick={onPlay}
      onKeyDown={playable ? onKeyDown : undefined}
    >
      <div
        className="discover-item__art"
        style={{ backgroundImage: `url(${images[0].url})` }}
      />
      <p className="discover-item__title">{name}</p>
    </div>
  );
}
