export const pingService = () => {
  const request = new Request('/ping', {
      method: 'GET',
      credentials: 'same-origin',
  });      
  return fetch(request)
    .then(response => {
        return response.json();      
    })
}

export const welcomeService = (data) => {
  let message = {
    name: data
  }
  const request = new Request('/hello', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
  });      
  return fetch(request)
    .then(response => {
        return response.json();      
    })
}

export const predictService = (data) => {
  let message = {
    image: data
  }
  const request = new Request('/predict', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
  });      
  return fetch(request)
    .then(response => {
        return response.json();      
    })
}