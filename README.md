# YouTube Video Downloader

A simple web application built with Node.js and Express to search for YouTube videos and download them in different qualities.

## Features

- Search for a YouTube video by URL.
- Display available video formats and thumbnails.
- Download the video in the selected quality as an MP4 file.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/minnukota381/ytdl-downloader-node.git
   cd ytdl-downloader-node
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

4. Open your web browser and go to `http://localhost:3000` to use the application.

## Usage

1. Enter a YouTube video URL in the search box and click "Search".
2. Select the desired video quality from the options provided.
3. Click "Download" to start downloading the video.

## Dependencies

- [Express](https://www.npmjs.com/package/express): Fast, unopinionated, minimalist web framework for Node.js.
- [ejs](https://www.npmjs.com/package/ejs): Embedded JavaScript templating engine.
- [axios](https://www.npmjs.com/package/axios): HTTP client for the browser and Node.js.
- [ytpl](https://www.npmjs.com/package/ytpl): YouTube playlist downloader.
- [ytdl](https://www.npmjs.com/package/ytdl): YouTube video downloader.
- [ytdl-core](https://www.npmjs.com/package/ytdl-core): YouTube video downloader in pure JavaScript.
- [fluent-ffmpeg](https://www.npmjs.com/package/fluent-ffmpeg): A fluent API to FFmpeg (video encoding).


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.