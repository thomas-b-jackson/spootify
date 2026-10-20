import axios from 'axios';
import config from '../../config';

const { baseUrl, authUrl, clientId, clientSecret } = config.api;

// Content is considered unavailable for client-credentials tokens unless a
// market is supplied, so we pin one. Change if you want a different catalog.
const MARKET = 'US';
const LIMIT = 10;

/*
 * Simple in-memory token cache. The client-credentials token is valid for
 * ~1 hour, so we reuse it until it expires rather than authenticating on
 * every request.
 */
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Authenticate using the client-credentials grant and return an access token.
 * See: https://developer.spotify.com/documentation/web-api/tutorials/client-credentials-flow
 */
async function getAccessToken() {
  const now = Date.now();

  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing Spotify credentials. Add REACT_APP_SPOTIFY_CLIENT_ID and ' +
      'REACT_APP_SPOTIFY_CLIENT_SECRET to a .env file and restart the dev server.'
    );
  }

  const body = new URLSearchParams({ grant_type: 'client_credentials' });

  const { data } = await axios.post(authUrl, body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // Basic auth: base64(clientId:clientSecret)
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    }
  });

  cachedToken = data.access_token;
  // Refresh a minute early to avoid using a token that expires mid-flight.
  tokenExpiresAt = now + (data.expires_in - 60) * 1000;

  return cachedToken;
}

/**
 * Perform an authenticated GET against the Spotify Web API.
 */
async function get(path, params = {}) {
  const token = await getAccessToken();

  const { data } = await axios.get(`${baseUrl}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });

  return data;
}

/**
 * Search the Spotify catalog for a single item type.
 *
 * NOTE: The original challenge used the `new-releases`, `featured-playlists`
 * and `categories` browse endpoints. As of 2024-11-27 Spotify restricted those
 * endpoints for apps in development mode, so they return 403. The Search
 * endpoint remains available, so we use it to power all three Discover blocks.
 * https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api
 */
async function search(query, type) {
  const data = await get('search', {
    q: query,
    type,
    market: MARKET,
    limit: LIMIT
  });

  // Response is keyed by the pluralised type, e.g. { albums: { items } }.
  const items = data[`${type}s`]?.items ?? [];

  // Search results (notably playlists) can contain nulls, and DiscoverItem
  // expects an `images` array with at least one entry, so filter defensively.
  return items.filter((item) => item && item.images && item.images.length);
}

/**
 * Albums released recently (`tag:new` returns albums from the past ~2 weeks).
 * Mapped to the "RELEASED THIS WEEK" block.
 */
export function getNewReleases() {
  return search('tag:new', 'album');
}

/**
 * Popular playlists. Mapped to the "FEATURED PLAYLISTS" block.
 */
export function getFeaturedPlaylists() {
  return search('top hits', 'playlist');
}

/**
 * Artists, used to populate the "BROWSE" block (the original categories
 * endpoint is no longer available to development-mode apps).
 */
export function getCategories() {
  return search('genre', 'artist');
}
