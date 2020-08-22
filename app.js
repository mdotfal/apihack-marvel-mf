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

// loop through the data object for the Super Hero Characters info
function displayResults( responseJson ) {
  console.log( responseJson );
  if( responseJson.data.results.length === 0){
    throw new Error("No SuperHero Found. Please try again. " );
  }
  for ( let i = 0; i < responseJson.data.results.length; i++ ) {
    $( '#results-list').html( 
      `
        <li>
          <h3>${responseJson.data.results[i].name}</h3>
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
  console.log( responseObj );
}

//  fetch the Super Hero data object
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

// fetch the Comics object
function getComics( heroId ) {
  const params = {
    id: heroId
  };

  const queryString = formatQueryParams( params );
  const comicUrl = `${baseUrl}/${heroId}/comics?format=comic&${queryString}&apikey=${publickey}&hash=${hash}&ts=${ts}`;
  // console.log( comicUrl );

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

/********************************************************************* EVENT LISTENERS */

//  Event handler for submit button
function watchForm() {
  $( 'form' ).submit( function( event ) {
    console.log( `watchForm running!` )
    event.preventDefault();
    const searchTerm = $( '#js-search-term' ).val();
    getSuperHero( searchTerm );
  })
}

//  Event hander for clicking Hero Image
function watchImageClick() {
  $( '#results-list' ).on( 'click', '.hero-image', function( event ) {
    console.log( `watchImageClick running!` );
    const heroId = $( this ).data( 'hero-id' );
    console.log( heroId );
    getComics( heroId );
  })
}


$( watchForm );
$( watchImageClick );