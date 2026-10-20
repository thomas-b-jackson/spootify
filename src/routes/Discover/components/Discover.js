import React, { Component } from 'react';
import DiscoverBlock from './DiscoverBlock/components/DiscoverBlock';
import { getNewReleases, getFeaturedPlaylists, getCategories } from '../../../common/api/spotify';
import '../styles/_discover.scss';

export default class Discover extends Component {
  constructor() {
    super();

    this.state = {
      newReleases: [],
      playlists: [],
      categories: []
    };
  }

  async componentDidMount() {
    try {
      // Fire all three requests in parallel — they're independent, so there's
      // no reason to wait for one before starting the next.
      const [newReleases, playlists, categories] = await Promise.all([
        getNewReleases(),
        getFeaturedPlaylists(),
        getCategories()
      ]);

      this.setState({ newReleases, playlists, categories });
    } catch (error) {
      console.error('Failed to load Discover data from Spotify:', error);
    }
  }

  render() {
    const { newReleases, playlists, categories } = this.state;

    return (
      <div className="discover">
        <DiscoverBlock text="RELEASED THIS WEEK" id="released" data={newReleases} />
        <DiscoverBlock text="FEATURED PLAYLISTS" id="featured" data={playlists} />
        <DiscoverBlock text="BROWSE" id="browse" data={categories} />
      </div>
    );
  }
}
