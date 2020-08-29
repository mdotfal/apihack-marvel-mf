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
  // $( '.hero-list-item' ).empty();
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
{/* <p>${responseJson.data.results[i].description}</p> */}
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

/**************************************************************** displayModal */

function displayModal( responseJson ) {
  console.log( responseJson );

  for ( let i = 0; i < responseJson.data.results.length; i++ ) {
    $( '#modal-results' ).html( `
      <div id ="modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <span class="close-btn">&times;</span>
            <h2>${responseJson.data.results[i].title}</h2>
          </div> 
          <div class="modal-body">
            <img class="comic-image" data-comic-id="${responseJson.data.results[i].id}" 
            src="${responseJson.data.results[i].thumbnail.path}.jpg">
            <p>${responseJson.data.results[0].description}</p>
            <button>view comics</button>
          </div>
          <div class="modal-footer">
            <p>more comics</p>
          </div>
        </div>
      </div>
    `);
  }


  console.log('1');
  
}

/**************************************************************** displayVideoResults */
// function displayVideoResults( responseVid ) {
//   if( responseVid.items.length === 0){
//     throw new Error("No Videos Found. Please try again.");
//   }
//   for ( let i = 0; i < responseVid.items.length; i++ ) {
//     $( '#video-results-list').append( 
//       `
//         <li>
//         <a href="https://www.youtube.com/watch?v=${responseVid.items[0].id.videoId}"><img src="${responseVid.items[i].snippet.thumbnails.high.url}"></a>
//         </li>
//       `
//     );
//   }
//   $( '#video-results' ).removeClass( 'hidden' );
// }

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
      // console.log(responseJson)
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
      // console.log( responseObj )
      $( '#comic-results-list' ).empty();
      // $( '#js-error-message' ).empty();
      displayModal( responseObj );
      // displayComicResults( responseObj );
    })
    .catch( err => {
      $( '#js-error-message' ).text( `${err.message}` );
    })
}

/**************************************************************** getVideos */
// function getVideos( searchTerm ) {
//   const params = {
//     part: "snippet",
//     key: "AIzaSyC3EYAPdSJEuk0ThnQnXeIBRYyZR-3LCRs",
//     q: `marvel ${searchTerm}`,
//     maxResults: 10
//   }

//   const queryString = formatQueryParams( params );
//   const baseUrl = `https://www.googleapis.com/youtube/v3/search`;
//   const videoUrl = `${baseUrl}?${queryString}`;

//   fetch( videoUrl )
//     .then( response => {
//       console.log(response)
//       if ( response.ok ) {
//         return response.json();
//       }
//       throw new Error( "No videos found" );
//     })
//     .then( responseVid => {
//       displayVideoResults( responseVid );
//     })
//     .catch( err => {
//       $( '#js-error-message' ).text( `${err.message}` );
//     })
// }

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
    // getVideos( searchTerm );
  })
}

/**************************************************************** watchCloseClick */
function watchCloseClick() {
  $( '#modal-results' ).on( 'click', '.close-btn',function( event ) {
    $( '.modal' ).addClass( 'hidden' );
  })
}

/********************************************************************* INITIALIZE FUNCTION */

function init() {
  $( watchForm );
  $( watchImageClick );
  $( watchCloseClick );
} 

$( init );