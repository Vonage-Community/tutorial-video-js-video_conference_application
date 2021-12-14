# Building a video conference app with Vonage Video API

In this guide series we will build a video conference app using the Vonage Video API. We will build this application out in a few parts. We will start with a backend server that has the necessary endpoints for our application. We will also be serving our frontend code from this server. We will also breakdown our frontend code feature by feature and build it out in a few parts. 

The complete code for these series can be found in this [Github Repository](https://github.com/Vonage-Community/tutorial-video-js-video_conference_application). 


## Running Locally

If you just want to run this code locally, you can do the following:

```bash
git clone git@github.com:Vonage-Community/tutorial-video-js-video_conference_application.git
cd tutorial-video-js-video_conference_application
cp .env.example .env
```

Replace `API_KEY` and `API_SECRET` with you Tokbox project credentials. 

```bash
npm install
npm start
```

You can then go to [http://localhost:3000/](http://localhost:3000/) to see the app in action.

## Building it from Scratch

You might also want to build this app from scratch. To do this, you can clone the `scratch` branch of the repository.

```bash
git clone -b scratch git@github.com:Vonage-Community/tutorial-video-js-video_conference_application.git
cd tutorial-video-js-video_conference_application
```

This has a file structure as follows:

```bash
├── README.md
└── public
    ├── call.html
    ├── css
    │   ├── call.css
    │   └── style.css
    ├── index.html
    └── js
        ├── call.js
        ├── opentok-layout.js
        └── script.js
```

We will fill it out in the next few tutorials.

1. Build a backend server for a video conference app
2. Build a preview page for the app
3. Start a video call
4. Add call controls
5. Add Screen Sharing
6. Add Text Chat
7. Add Archiving



