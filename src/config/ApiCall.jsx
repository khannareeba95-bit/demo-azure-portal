// export async function fetchData(payload, url) {
//   var myHeaders = new Headers();
//   myHeaders.append('Content-Type', 'application/json');
//   let requestParams = { method: 'POST', headers: myHeaders };
//   if (Object.keys(payload).length > 0) {
//     requestParams['body'] = JSON.stringify(payload);
//   }

//   return await fetch(url, requestParams)
//     .then((response) => response.json())
//     .then((responseData) => {
//       return responseData;
//     })
//     .catch((error) => console.warn(error));
// }

// export default fetchData;

// import { URLs } from '@/config/URLs';
// import React, { useState } from 'react';

export async function fetchData(payload, url) {
  if (window.location.href.includes('ntt')) {
    payload['source'] = 'ntt';
  }
  let myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  let requestParams = {
    method: 'POST',
    headers: myHeaders,
  };

  if (Object.keys(payload).length > 0) {
    requestParams['body'] = JSON.stringify(payload);
  }

  return await fetch(url, requestParams)
    .then((response) => response.json())
    .then((responseData) => {
      return responseData;
    })
    .catch((error) => console.warn(error));
}
export default fetchData;
