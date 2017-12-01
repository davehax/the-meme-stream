let _ = require("lodash");

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

// Random merge arrays
const randomMerge = (...arrays) => {
    let clonedArrays = [];
    let mergedArray = [];

    arrays.forEach((arr, idx) => {
        clonedArrays.push(_.clone(arr));
    });

    const getArraysLength = () => {
        return clonedArrays
            .filter((arr) => { return arr.length })
            .length;
    }

    do {

        let availableArrays = clonedArrays.filter((arr) => { return arr.length > 0 });
        // pick a random array
        let arr = availableArrays[ Math.floor(Math.random() * availableArrays.length) ];
        let index = Math.floor(Math.random() * arr.length);

        // splice arr at index and push onto merged array
        // splice returns an array, we just want the first item in that array though
        let item = arr.splice(index, 1);
        mergedArray.push(item[0]);

    } while(getArraysLength() > 0);

    return mergedArray;
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
    saveFile,
    randomMerge
}