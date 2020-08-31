'use strict';

const publickey = '560e69d868dd8cc9ac726b016f0bfd4a';
const privatekey = '11d97d165628713924acf9d2708a8e2c3b847a6b';
const ts = new Date().getTime();
const stringToHash = ts + privatekey + publickey;
const hash = md5(stringToHash);
const baseUrl = 'https://gateway.marvel.com:443/v1/public';

let results = [];
let currentResultViewed = 0;


/********************************************************************* GENERATE HTML */

/**************************************************************** formatQueryParams */
  function formatQueryParams ( params ) {
    const queryItems = Object.keys( params )
      .map( key => `${encodeURIComponent( key )}=${ encodeURIComponent( params[ key ] )}` )
    return queryItems.join( '&' ); 
  }

/**************************************************************** displayResults */
function displayResults( responseJson ) {
  $( '#comic-results-list').empty();
  $( '#video-results-list').empty();
  if( responseJson.data.results.length === 0){
    throw new Error("No SuperHero Found. Please try again. " );
  }
  for ( let i = 0; i < responseJson.data.results.length; i++ ) {
    if (!(`${responseJson.data.results[i].thumbnail.path}`).includes("not_available") && (`${responseJson.data.results[i].stories.available}` > 1)) {
      $( '#results-list').append( 
        `
          <li class="hero-list-item">
            <h3>${responseJson.data.results[i].name}</h3>
            <img class="hero-image" data-hero-id="${responseJson.data.results[i].id}" 
            src="${responseJson.data.results[i].thumbnail.path}.jpg">
            
          </li>
        `
      );
    }
  }
  $( '#results' ).removeClass( 'hidden' );
}

/**************************************************************** displayModal */

function displayModal( responseJson ) {
  if ( responseJson ) {
    responseJson.data.results.forEach(result => results.push(result))
  }
  for ( let i = 0; i < results.length; i++ ) {
    if ( currentResultViewed === results.length - 1) {
      currentResultViewed = 0;
    }
    if (!(`${results[currentResultViewed].thumbnail.path}`).includes("not_available")) {
      $( '#modal-results' ).html( `
        <div id ="modal" class="modal">
          <div class="modal-content">
            <div class="modal-header">
              <span class="close-btn">&times;</span>
              <h3 class="modal-heading">${results[currentResultViewed].title}</h3>
            </div> 
            <div class="modal-body">
              <img class="comic-image center" data-comic-id="${results[currentResultViewed].id}" 
              src="${results[currentResultViewed].thumbnail.path}.jpg">
            </div>
            <div class="modal-footer">
              <span class="previous-comic-btn btn">&#8678;</span>
              <button class="video-btn">View Video</button>
              <span class="next-comic-btn btn">&#8680;</span>
            </div>
          </div>
        </div>
      `);
    }
  }
}

/**************************************************************** displayVideoResults */
function displayVideoResults( responseVid ) {
  if( responseVid.items.length === 0){
    throw new Error("No Videos Found. Please try again.");
  }
  for ( let i = 0; i < responseVid.items.length; i++ ) {
    $( '#video-results-list' ).append( 
      `
        <li>
        <a href="https://www.youtube.com/watch?v=${responseVid.items[0].id.videoId}"><img class="video-image" src="${responseVid.items[i].snippet.thumbnails.high.url}"></a>
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
    nameStartsWith: query,
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
      $( '#results-list' ).empty();
      $( '#comic-results' ).addClass( 'hidden' );
      $( '#video-results' ).addClass( 'hidden' );
      displayResults( responseJson );
    })
    .catch( err => {
      $( '#js-error-message' ).text( `${err.message}` );
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
      $( '#comic-results-list' ).empty();
      $( '#video-results-list' ).empty();
      displayModal( responseObj );
    })
    .catch( err => {
      $( '#js-error-message' ).text( `${err.message}` );
    })
}

/**************************************************************** getVideos */
function getVideos( searchTerm ) {
  const params = {
    part: "snippet",
    key: "AIzaSyDrinht3l55mZR90NNEne-IgGTN2zUHlqE",
    q: `marvel ${searchTerm}`,
    maxResults: 5
  }

  const queryString = formatQueryParams( params );
  const baseUrl = `https://www.googleapis.com/youtube/v3/search`;
  const videoUrl = `${baseUrl}?${queryString}`;

  fetch( videoUrl )
    .then( response => {
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
    getComics( heroId );
    currentResultViewed = 0;
    results = [];
  })
}

/**************************************************************** watchVideoClick */
function watchVideoClick() {
  $( '#modal-results' ).on( 'click', '.video-btn', function( event ) {
    $( '.modal' ).addClass( 'hidden' );
    const searchTerm = $( '#js-search-term' ).val();
    getVideos( searchTerm );
  })
}

/**************************************************************** watchCloseClick */
function watchCloseClick() {
  $( '#modal-results' ).on( 'click', '.close-btn', function( event ) {
    $( '.modal' ).addClass( 'hidden' );
    currentResultViewed = 0;
    results = [];
  })
}

/**************************************************************** watchNextClick */
function watchNextClick() {
  $( 'body' ).on( 'click', '.next-comic-btn', function( event ) {
    if ( currentResultViewed < results.length ) {
      currentResultViewed++;
      displayModal();
    } else {
      currentResultViewed = 0;
    }
  })
}

/**************************************************************** watchPreviousClick */
function watchPreviousClick() {
  $( 'body' ).on( 'click', '.previous-comic-btn', function( event ) {
    if ( currentResultViewed < results.length ) {
      currentResultViewed--;
      displayModal();
    } else {
      currentResultViewed = 0;
    }
  })
}

function watchReloadPage() {
  $( 'body' ).on( 'click', '.logo-img', function( event ) {
    location.reload( true );
  })
}
 

/********************************************************************* INITIALIZE FUNCTION */

function init() {
  $( watchForm );
  $( watchImageClick );
  $( watchVideoClick );
  $( watchCloseClick );
  $( watchNextClick );
  $( watchPreviousClick );
  $( watchReloadPage );
} 

$( init );