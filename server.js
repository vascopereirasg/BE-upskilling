const http = require('http'); // Import the built-in HTTP module
const fs = require('fs'); // Import the File System module

// Create an HTTP server
const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        // Handle GET request: Read the file and send its content as response
        fs.readFile('message.txt', 'utf8', (err, data) => {
            if (err) {
                // Send a 500 response if there's an error reading the file
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error reading file');
                return;
            }
            // Send a 200 response with the file content
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(data);
        });
    } else if (req.method === 'POST') {
        // Handle POST request: Receive data and write it to the file
        let body = '';

        // Collect data chunks from the request
        req.on('data', chunk => {
            body += chunk.toString(); // Convert buffer to string
        });

        req.on('end', () => {
            // Write received data to the file
            fs.writeFile('message.txt', body, (err) => {
                if (err) {
                    // Send a 500 response if there's an error writing to the file
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error writing file');
                    return;
                }
                // Send a 200 response indicating success
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('File updated successfully');
            });
        });
    } else {
        // Send a 405 response if the request method is not GET or POST
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }
});

// Start the server on port 3000
server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
