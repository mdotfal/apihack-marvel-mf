'use strict';

function formatQueryParams ( params ) {
  const queryItems = Object.keys( params )
    .map( key => `${encodeURIComponent( key )}=${ encodeURIComponent( params[ key ] )}` )
  return queryItems.join( '&' ); 
}

function displayResults( responseJson ) {
  // console.log( responseJson );
  for ( let i = 0; i < responseJson.data.results.length; i++ ) {
    $( '#results-list').html( 
      `
        <li>
          <h3>${responseJson.data.results[i].name}</h3>
          <img src="${responseJson.data.results[i].thumbnail.path}.jpg">
          <p>${responseJson.data.results[i].description}</p>
        </li>
      `
    );
    for ( let j = 0; j < responseJson.data.results.length; j++ ) {

      $( '#js-results-comics' ).append(
        `
        <div class="comic-item">
          <img src="${responseJson.data.results[i].thumbnail}.jpg">
        </div>
        `
      );
    }

  }
  $( '#results' ).removeClass( 'hidden' );
  $( '.results-comics' ).removeClass( 'hidden' );
}

function getSuperHero( query ) {
  const params = {
    name: query
  };

  const publickey = '560e69d868dd8cc9ac726b016f0bfd4a';
  const privatekey = '11d97d165628713924acf9d2708a8e2c3b847a6b';
  const ts = new Date().getTime();
  const stringToHash = ts + privatekey + publickey;
  const hash = md5(stringToHash);
  const baseUrl = 'https://gateway.marvel.com:443/v1/public/characters';

  const queryString = formatQueryParams( params );
  const url = `${baseUrl}?${queryString}&apikey=${publickey}&hash=${hash}&ts=${ts}`;
  console.log(url)


  fetch( url )
    .then( response => {
      if ( response.ok ) {
        return response.json();
      }
      //empty results list
      throw new Error( 'SuperHero not found.' );
    })
    .then( responseJson => {
      $( 'results-list' ).empty();
      displayResults( responseJson );
      // $( 'error-message' ).empty();
    })
    .catch( err => {
      $( '#js-error-message' ).text( `Something went wrong: ${err.message}` );
      $( '#results-list' ).empty();
    });
}

function watchForm() {
  $( 'form' ).submit( e => {
    console.log( `watchForm running!` )
    e.preventDefault();
    const searchTerm = $( '#js-search-term' ).val();
    getSuperHero( searchTerm );
  })
}

$( watchForm );