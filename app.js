'use strict';

const publickey = '560e69d868dd8cc9ac726b016f0bfd4a';
const privatekey = '11d97d165628713924acf9d2708a8e2c3b847a6b';
const ts = new Date().getTime();
const stringToHash = ts + privatekey + publickey;
const hash = md5(stringToHash);
const baseUrl = 'https://gateway.marvel.com:443/v1/public';

function formatQueryParams ( params ) {
  const queryItems = Object.keys( params )
    .map( key => `${encodeURIComponent( key )}=${ encodeURIComponent( params[ key ] )}` )
  return queryItems.join( '&' ); 
}

/********************************************************************* GENERATE HTML */

/**************************************************************** displayResults */
function displayResults( responseJson ) {
  $( '#comic-results-list').empty();
  $( '#video-results-list').empty();
  if( responseJson.data.results.length === 0){
    throw new Error("No SuperHero Found. Please try again. " );
  }
  for ( let i = 0; i < responseJson.data.results.length; i++ ) {
    $( '#results-list').html( 
      `
        <li>
          <h3>${responseJson.data.results[i].name}</h3>
          <p>(Click to display comics & videos)</p>
          <img class="hero-image" data-hero-id="${responseJson.data.results[i].id}" 
          src="${responseJson.data.results[i].thumbnail.path}.jpg">
          <p>${responseJson.data.results[i].description}</p>
        </li>
      `
    );
  }
  $( '#results' ).removeClass( 'hidden' );
}

/**************************************************************** displayComicResults */
function displayComicResults( responseObj ) {
  if( responseObj.data.results.length === 0){
    throw new Error("No Comics Found. Please try again. " );
  }
  for ( let i = 0; i < responseObj.data.results.length; i++ ) {
    if (!(`${responseObj.data.results[i].thumbnail.path}`).includes("not_available")) {
      $( '#comic-results-list').append( 
        `
          <li>
          <a href="${responseObj.data.results[i].urls[0].url}"><img class="comic-image" data-comic-id="${responseObj.data.results[i].id}" 
          src="${responseObj.data.results[i].thumbnail.path}.jpg"></a>
          </li>
        `
      );
    };
  }
  $( '#comic-results' ).removeClass( 'hidden' );
}


/**************************************************************** displayVideoResults */
function displayVideoResults( responseVid ) {
  if( responseVid.items.length === 0){
    throw new Error("No Videos Found. Please try again.");
  }
  for ( let i = 0; i < responseVid.items.length; i++ ) {
    $( '#video-results-list').append( 
      `
        <li>
        <a href="https://www.youtube.com/watch?v=${responseVid.items[0].id.videoId}"><img src="${responseVid.items[i].snippet.thumbnails.high.url}"></a>
        </li>
      `
    );
  }
  $( '#video-results' ).removeClass( 'hidden' );
}

/********************************************************************* FETCH CALLS */

/**************************************************************** getSuperHero */
function getSuperHero( query ) {
  const params = {
    name: query,
    apikey: `${publickey}`,
    hash: `${hash}`,
    ts: `${ts}`
  };

  const queryString = formatQueryParams( params );
  const url = `${baseUrl}/characters?${queryString}`;

  fetch( url )
    .then( response => {
      if ( response.ok ) {
        return response.json();
      }
    })
    .then( responseJson => {
      $( '#js-error-message' ).empty();
      $( '#comic-results' ).addClass( 'hidden' );
      $( '#video-results' ).addClass( 'hidden' );
      displayResults( responseJson );
    })
    .catch( err => {
      $( '#js-error-message' ).text( `${err.message}` );
      $( '#results-list' ).empty();
      $( '#results' ).addClass( 'hidden' );
    });
}

/**************************************************************** getComics */
function getComics( heroId ) {
  const params = {
    apikey: `${publickey}`,
    hash: `${hash}`,
    ts: `${ts}`
  };

  const queryString = formatQueryParams( params );
  const comicUrl = `${baseUrl}/characters/${heroId}/comics?${queryString}`;

  fetch( comicUrl )
    .then( response => {
      if ( response.ok ) {
        return response.json();
      }
      throw new Error( "No comics found" );
    })
    .then( responseObj => {
      displayComicResults( responseObj );
    })
    .catch( err => {
      $( '#js-error-message' ).text( `${err.message}` );
    })
}

/**************************************************************** getVideos */
function getVideos( searchTerm ) {
  const params = {
    part: "snippet",
    key: "AIzaSyBapKVolQSgd51Ofa2cLOsNGua-95aQUH0",
    q: `marvel ${searchTerm}`,
    maxResults: 10,
    type: "video"
  }

  const queryString = formatQueryParams( params );
  const youtubeBaseUrl = `https://www.googleapis.com/youtube/v3/search`;
  const videoUrl = `${youtubeBaseUrl}?${queryString}`;

  fetch( videoUrl )
    .then( response => {
      console.log(response)
      if ( response.ok ) {
        return response.json();
      }
      throw new Error( "No videos found" );
    })
    .then( responseVid => {
      displayVideoResults( responseVid );
    })
    .catch( err => {
      $( '#js-error-message' ).text( `${err.message}` );
    })
}

/********************************************************************* EVENT LISTENERS */

/**************************************************************** watchForm */
function watchForm() {
  $( 'form' ).submit( function( event ) {
    event.preventDefault();
    const searchTerm = $( '#js-search-term' ).val();
    getSuperHero( searchTerm );
  })
}

/**************************************************************** watchImageClick */
function watchImageClick() {
  $( '#results-list' ).on( 'click', '.hero-image', function( event ) {
    const heroId = $( this ).data( 'hero-id' );
    const searchTerm = $( '#js-search-term' ).val();
    getComics( heroId );
    getVideos( searchTerm );
  })
}

/********************************************************************* INITIALIZE FUNCTION */

function init() {
  $( watchForm );
  $( watchImageClick );
} 

$( init );