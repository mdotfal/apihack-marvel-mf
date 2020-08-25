'use strict';

const publickey = '560e69d868dd8cc9ac726b016f0bfd4a';
const privatekey = '11d97d165628713924acf9d2708a8e2c3b847a6b';
const ts = new Date().getTime();
const stringToHash = ts + privatekey + publickey;
const hash = md5(stringToHash);
const baseUrl = 'https://gateway.marvel.com:443/v1/public';

// format query string to find character key value pair
function formatQueryParams ( params ) {
  const queryItems = Object.keys( params )
    .map( key => `${encodeURIComponent( key )}=${ encodeURIComponent( params[ key ] )}` )
  return queryItems.join( '&' ); 
}

/********************************************************************* GENERATE HTML */

// loop through the data object for the Super Hero Characters info
function displayResults( responseJson ) {
  //  clear comic results from previous query
  $( '#comic-results-list').empty();
  $( '#video-results-list').empty();
  // console.log( responseJson );
  if( responseJson.data.results.length === 0){
    throw new Error("No SuperHero Found. Please try again. " );
  }
  let comicsArray = 0;
  for ( let i = 0; i < responseJson.data.results.length; i++ ) {
    $( '#results-list').html( 
      `
        <li>
          <h3>${responseJson.data.results[i].name}</h3>
          <p>(Click to display comics)</p>
          <img class="hero-image" data-hero-id="${responseJson.data.results[i].id}" 
          src="${responseJson.data.results[i].thumbnail.path}.jpg">
          <p>${responseJson.data.results[i].description}</p>
        </li>
      `
    );
  }
  $( '#results' ).removeClass( 'hidden' );
}

// display comics results
function displayComicResults( responseObj ) {
  console.log( 'getting comics!' );
  // console.log( responseObj );
  if( responseObj.data.results.length === 0){
    throw new Error("No Comics Found. Please try again. " );
  }
  for ( let i = 0; i < responseObj.data.results.length; i++ ) {
    $( '#comic-results-list').append( 
      `
        <li>
        <a href="${responseObj.data.results[i].urls[0].url}"><img class="comic-image" data-comic-id="${responseObj.data.results[i].id}" 
        src="${responseObj.data.results[i].thumbnail.path}.jpg"></a>
        </li>
      `
    );
  }
  $( '#comic-results' ).removeClass( 'hidden' );
}


// display video results
function displayVideoResults( responseVid ) {
  console.log( 'getting videos!' );
  console.log( responseVid );
  if( responseVid.items.length === 0){
    throw new Error("No Videos Found. Please try again. " );
  }
  for ( let i = 0; i < responseVid.items.length; i++ ) {
    $( '#video-results-list').append( 
      `
        <li>
        <img
        src="${responseVid.items[i].snippet.thumbnails.default.url}">
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
    name: query
  };

  const queryString = formatQueryParams( params );
  const url = `${baseUrl}/characters?${queryString}&apikey=${publickey}&hash=${hash}&ts=${ts}`;
  console.log(url)


  fetch( url )
    .then( response => {
      if ( response.ok ) {
        return response.json();
      }
    })
    .then( responseJson => {
      // clear error message and search results before loading to DOM
      $( '#js-error-message' ).empty();
      $( 'results-list' ).empty();
      displayResults( responseJson );
    })
    .catch( err => {
      $( '#js-error-message' ).text( `${err.message}` );
      // $( '#results-list' ).empty();
    });
}

/**************************************************************** getComics */
function getComics( heroId ) {
  const params = {
    id: heroId
  };

  const queryString = formatQueryParams( params );
  const comicUrl = `${baseUrl}/characters/${heroId}/comics?apikey=${publickey}&hash=${hash}&ts=${ts}`;
  console.log( comicUrl );

  fetch( comicUrl )
    .then( response => {
      if ( response.ok ) {
        return response.json();
      }
      $( 'comic-results' ).empty();
      throw new Error( "No comics found" );
    })
    .then( responseObj => {
      $( 'comic-results' ).empty();
      displayComicResults( responseObj );
    })
    .catch( err => {
      $( '#js-error-message' ).text( `${err.message}` );
    })
}

/**************************************************************** getComics */

function getVideos( searchTerm ) {
  const params = {
    part: "snippet",
    key: "AIzaSyBEGT2xQioO85IUOkvIHUXH-mwtQWQsDZI",
    q: `marvel ${searchTerm}`,
    maxResults: 4,
    type: "video"
  }

  const queryString = formatQueryParams( params );
  const ytApiKey = `AIzaSyBEGT2xQioO85IUOkvIHUXH-mwtQWQsDZI`;
  const baseUrl = `https://www.googleapis.com/youtube/v3/search`;
  const videoUrl = `${baseUrl}?${queryString}`;
  console.log( videoUrl, params );

  fetch( videoUrl, params )
    .then( response => {
      if ( response.ok) {
        return response.json();
      }
      $( 'video-results' ).empty();
      throw new Error( "No videos found" );
    })
    .then( responseVid => {
      $( 'video-results' ).empty();
      displayVideoResults( responseVid );
    })
    .catch( err => {
      $( '#js-error-message' ).text( `${err.message}` );
    })
}

/********************************************************************* EVENT LISTENERS */

//  Event handler for submit button
function watchForm() {
  $( 'form' ).submit( function( event ) {
    console.log( `watchForm running!` )
    event.preventDefault();
    const searchTerm = $( '#js-search-term' ).val();
    getSuperHero( searchTerm );
    getVideos( searchTerm );
  })
}

//  Event handler for clicking Hero Image
function watchImageClick() {
  $( '#results-list' ).on( 'click', '.hero-image', function( event ) {
    console.log( `watchImageClick running!` );
    const heroId = $( this ).data( 'hero-id' );
    console.log( heroId );
    getComics( heroId );
  })
}

/********************************************************************* INITIALIZE FUNCTION */

function init() {
  $( watchForm );
  $( watchImageClick );
} 

$( init );