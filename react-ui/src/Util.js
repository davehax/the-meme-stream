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

// Download a file form a url.
const saveFile = (url) => {
    // credit - https://ausdemmaschinenraum.wordpress.com/2012/12/06/how-to-save-a-file-from-a-url-with-javascript/
    // Get file name from url.
    var filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function () {
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob
        a.download = filename; // Set the file name.
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        // delete a;
        a = null;
    };
    xhr.open('GET', url);
    xhr.send();
}

export {
    get,
    saveFile
}