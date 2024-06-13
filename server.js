const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();
const port = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route to render the index page
app.get('/', (req, res) => {
    res.render('indexx');
});

// Route to handle playlist download
app.get('/download-playlist', async (req, res) => {
    const playlistURL = req.query.url;
    if (!playlistURL) {
        return res.status(400).send('URL is required');
    }

    try {
        const playlistId = new URLSearchParams(new URL(playlistURL).search).get('list');
        const downloadDir = path.join(__dirname, 'downloads', playlistId);

        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir, { recursive: true });
        }

        const ytDlpPath = 'C:\\Program Files\\yt-dlp\\yt-dlp.exe'; // Update this path
        const ytDlpProcess = spawn(ytDlpPath, ['-o', `${downloadDir}/%(title)s.%(ext)s`, '-f', 'best', playlistURL]);

        ytDlpProcess.stdout.on('data', (data) => {
            console.log(`yt-dlp stdout: ${data}`);
        });

        ytDlpProcess.stderr.on('data', (data) => {
            console.error(`yt-dlp stderr: ${data}`);
        });

        ytDlpProcess.on('close', async (code) => {
            if (code !== 0) {
                console.error(`yt-dlp process exited with code ${code}`);
                return res.status(500).send('Failed to download playlist');
            }

            res.header('Content-Disposition', `attachment; filename="${playlistId}.zip"`);
            const archive = archiver('zip');

            archive.on('error', (err) => {
                console.error('Error:', err);
                res.status(500).send('Failed to create archive');
            });

            archive.pipe(res);

            const files = fs.readdirSync(downloadDir);
            for (const file of files) {
                archive.file(path.join(downloadDir, file), { name: file });
            }

            archive.finalize();

            // Clean up download directory after zipping
            await fs.promises.rm(downloadDir, { recursive: true, force: true });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to download playlist');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
