const path = require('path');
const express = require('express');
const url = require('url');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted`)));

app.listen(port, (err) => {
    if (err) throw err;
    console.log(`Listening on port ${port}`);
});

