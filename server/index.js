// Define our requires
const express = require('express');
const path = require('path');

// Express app
const app = express();
// What port to listen on?
const PORT = process.env.PORT || 5000;

// Priority - serve static files from our build folder
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

// Enable Single Page Application routing by resolving to the react app for all other requests
app.use('*', (request, response) => {
    response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

// Finally, 'listen' on PORT
app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});