// Generic get request
const get = (url, headers) => {
    // Default headers - accept json response
    headers = headers || new Headers({
        "accept": "application/json"
    });

    return new Promise((resolve, reject) => {
        fetch(url, { headers: headers })

            .then(jsonResponse)

            .then((data) => { resolve(data) })
            
            .catch((error) => { reject(error) })
    })
}

// JSON response
const jsonResponse = (response) => {
    if (response.ok) {
        return response.json();
    }
    else {
        throw response;
    }
}

export {
    get
}