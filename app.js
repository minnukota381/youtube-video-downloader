const express = require('express');
const ytdl = require('ytdl-core');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const rateLimit = require('express-rate-limit');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const port = 3000;

// Rate limiting to prevent too many requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});

app.use(limiter);

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

        res.header('Content-Type', 'video/mp4');

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

        const stream = ytdl(videoURL, { format: format })
            .on('response', (response) => {
                console.log('Response Headers:', response.headers);
            })
            .on('error', (err) => {
                console.error('Stream Error:', err);
                res.status(500).send('Failed to download video');
            });

        const ffmpegProcess = ffmpeg(stream)
            .format('mp4')
            .on('end', () => {
                console.log('Download finished successfully');
            })
            .on('error', (err) => {
                console.error('FFmpeg Error:', err);
                res.status(500).send('Failed to process video');
            });

        ffmpegProcess.pipe(res, { end: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to download video');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
