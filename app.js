const express = require('express');
const ytdl = require('ytdl-core');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const port = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route to render the index page
app.get('/', (req, res) => {
    res.render('index');
});

// Route to handle video search and display quality options
app.get('/search', async (req, res) => {
    const videoURL = req.query.url;
    if (!videoURL) {
        return res.status(400).send('URL is required');
    }

    try {
        const info = await ytdl.getInfo(videoURL);
        const formats = ytdl.filterFormats(info.formats, format => format.hasVideo);
        const thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url;
        const title = info.videoDetails.title;
        res.render('results', { url: videoURL, formats: formats, thumbnail: thumbnail, title: title });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to fetch video information');
    }
});

// Route to handle video streaming
app.get('/stream', async (req, res) => {
    const videoURL = req.query.url;
    const quality = req.query.quality;
    if (!videoURL || !quality) {
        return res.status(400).send('URL and quality are required');
    }

    try {
        const videoInfo = await ytdl.getInfo(videoURL);
        const format = ytdl.chooseFormat(videoInfo.formats, { quality: quality });

        if (!format) {
            return res.status(404).send('No such format found');
        }

        // Set content type to video/mp4 for streaming
        res.header('Content-Type', 'video/mp4');

        // Use ytdl to directly pipe the video stream to the response
        ytdl(videoURL, { format: format })
            .on('error', (err) => {
                console.error('Error:', err);
                res.status(500).send('Failed to stream video');
            })
            .pipe(res);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to stream video');
    }
});

// Route to handle video download
app.get('/download', async (req, res) => {
    const videoURL = req.query.url;
    const quality = req.query.quality;
    const title = decodeURIComponent(req.query.title);
    if (!videoURL || !quality || !title) {
        return res.status(400).send('URL, quality, and title are required');
    }

    try {
        const videoInfo = await ytdl.getInfo(videoURL);
        const format = ytdl.chooseFormat(videoInfo.formats, { quality: quality });

        if (!format) {
            return res.status(404).send('No such format found');
        }

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);

        // Use ytdl to directly pipe the video stream to the response
        ytdl(videoURL, { format: format })
            .on('error', (err) => {
                console.error('Error:', err);
                res.status(500).send('Failed to download video');
            })
            .pipe(res);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to download video');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
