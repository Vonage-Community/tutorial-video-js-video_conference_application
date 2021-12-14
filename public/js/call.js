const layoutEl = document.getElementById('layout');
// pathname = /session/sessionid?name=user
// split(/) -> ["", "session", "sessionId?name=user"]
// split(/)[2] -> sessionId?name=user
// split(?) -> ["sessionId", "name=user"] 
const sessionId = window.location.pathname.split('/')[2].split('?')[0];

// -- CONTROLS --
const audioButton = document.getElementById('audio');
const videoButton = document.getElementById('video');
const disconnect = document.getElementById('end');
const shareButton = document.getElementById('share');
// const recordButton = document.getElementById('record');

// -- CHAT --
const chat = document.getElementById('chat');
const chatInput = document.getElementById('chat-data');
const chatContainer = document.querySelector('.chat-container');
const chatList = document.getElementById('chat-list');
const chatSendButton = document.getElementById('send');
const messageNotification = document.getElementById('message-notification');
let chatVisible = false;
let messageCount = 0;

let layout;
let publisher;
let scPublisher;
let session;
let username;

let sharing;


// let archiveId;
// let recording = false;

async function getCredentials() {
  const response = await fetch('/api/credentials', {
    method: "post",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: sessionId
    })
  });
  const credentials = await response.json();
  return credentials;
}

function updateLayoutValues() {
  const opts = {
    maxRatio: 3 / 2,
    minRatio: 9 / 16,
    fixedRatio: false,
    alignItems: 'center',
    bigPercentage: 0.8,
    bigFixedRatio: false,
    bigMaxRatio: 3 / 2,
    bigMinRatio: 9 / 16,
    bigFirst: true,
    scaleLastRow: true,
    smallMaxWidth: Infinity,
    smallMaxHeight: Infinity,
    bigMaxWidth: Infinity,
    bigMaxHeight: Infinity,
    bigAlignItems: 'center',
    smallAlignItems: 'center',
  };
  layout = initLayoutContainer(layoutEl, opts).layout;
}

updateLayoutValues();
async function initializeSession() {
  const credentials = await getCredentials();
  session = OT.initSession(credentials.apiKey, credentials.sessionId);
  var pubEl = document.createElement('div');
  const params = new URLSearchParams(window.location.search)
  username = params.get('name');

  if(!username) {
    let _name = window.prompt("Enter your name?");
    if(_name) {
      window.location.href = `/session/${sessionId}?name=${_name}`;
    }
  }
  publisher = OT.initPublisher(pubEl, {
    resolution: '1280x720',
    name: username,
  }, function(err) {
    layout();
  })

  var videoSourceId = localStorage.getItem('videoSourceId');
  if(videoSourceId) {
    publisher.setVideoSource(videoSourceId);
  }
  var audioSourceId = localStorage.getItem('audioSourceId');
  if(audioSourceId) {
    publisher.setVideoSource(videoSourceId);
  }

  var audioEnabled = localStorage.getItem('audioEnabled');
  if(audioEnabled) {
    publisher.publishAudio(JSON.parse(audioEnabled));
  }

  var videoEnabled = localStorage.getItem('videoEnabled');
  if(videoEnabled) {
    publisher.publishVideo(JSON.parse(videoEnabled));
  }

  session.connect(credentials.token, function(error) {
    if(error) {
      alert(error);
    } else {
      session.publish(publisher);
    }
  })


  session.on("streamCreated", function(event) {
    var subEl = document.createElement('div');
    let isScreenShare = event.stream.videoType === 'screen';
    if (isScreenShare) {
      subEl.classList.add('OT_big');
    }
    subscriber = session.subscribe(event.stream, subEl, {
      resolution: '1280x720'
    }, function(err) {
      if(!err) {
        layoutEl.appendChild(subEl);
      }
      layout();
    })
  })

  session.on("streamDestroyed", function(){
    console.log("stream destroyed")
    setTimeout(function () {
      layout();
    }, 200);
  });

  session.on("archiveStarted", function(event){
    console.log("archive started");
    archiveId = event.id;
    recording = true;
    recordButton.style.color = "red"; 
  })

  session.on("archiveStopped", function() {
    console.log("archive stopped");
    archiveId = null;
    recording = false;
    recordButton.style.color = "black";
  })

  session.on("signal:text", function(event) {
    const message = JSON.parse(event.data);
    let listEl = document.createElement('li');
    const isMe = event.from.connectionId === session.connection.id ? "me" : "other";
    if(isMe === "other" && chatVisible === false){
      messageCount += 1;
      messageNotification.innerHTML = messageCount;
      messageNotification.style.display = "flex";
    }
    listEl.classList.add(isMe);
    listEl.innerHTML = `<div class="bubble">
    <span class="user">${message.username}</span>
    <span class="time">${message.timestamp}</span>
    <p class="message">${message.data}</p>
    </div>`
    chatList.appendChild(listEl);
  })

  layoutEl.appendChild(pubEl);
  layout();
}

var resizeTimeout;

window.onresize = function () {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function () {
    layout();
  }, 20);
};

audioButton.onclick = () => {
  const audioSource = publisher.getAudioSource();
  if(audioSource.enabled === false) {
    audioButton.innerHTML = '<i class="fas fa-microphone fa-2x" id="audio-on"></i>';
    publisher.publishAudio(true);
    localStorage.setItem('audioEnabled', JSON.stringify(true));
  } else {
    audioButton.innerHTML = '<i class="fas fa-microphone-slash fa-2x" id="audio-off"></i>';
    publisher.publishAudio(false);
    localStorage.setItem('audioEnabled', JSON.stringify(false));
  }
}

videoButton.onclick = () => {
  const videoSource = publisher.getVideoSource();
  if(!videoSource.track) {
    videoButton.innerHTML = '<i class="fas fa-video fa-2x" id="video-on"></i>';
    publisher.publishVideo(true);
    localStorage.setItem('videoEnabled', JSON.stringify(true));
  } else {
    videoButton.innerHTML = '<i class="fas fa-video-slash fa-2x" id="video-off"></i>';
    publisher.publishVideo(false);
    localStorage.setItem('videoEnabled', JSON.stringify(false));
  }
}

disconnect.onclick = () => {
  if(publisher) {
    publisher.destroy();
  }
  if(scPublisher) {
    scPublisher.destroy();
  }

  setTimeout(() => {
    window.location.href = `/`;
  }, 200)
};

shareButton.onclick = () => {
  var pubEl = document.createElement('div');

  if(!sharing) {
    OT.checkScreenSharingCapability(response => {
      if(!response.supported || response.extensionRegistered === false) {
        alert('screen share not supported by browser');
        return false;
      } else if(response.extensionInstalled === false) {
        alert('install the extension');
        return false;
      }
    })
    let ssEl = layoutEl.querySelector('.OT_big')
    if(ssEl) {
      alert('screen is being shared')
      return false;
    }
  
    pubEl.classList.add('OT_big');
    scPublisher = OT.initPublisher(pubEl, {
      videoSource: 'screen'
    }, function(err) {
      layout();
    })

    scPublisher.on('mediaStopped', function(event){
      scPublisher.destroy();
      layout();
    })
  
    layoutEl.appendChild(pubEl);
    session.publish(scPublisher)
    shareButton.style.color = 'green';
    sharing = true;
    layout();
  } else {
    // this is the case when we are screen sharing
    // 
    scPublisher.destroy();
    shareButton.style.color = 'black';
    sharing = false;
    layout();
  }
}



chat.onclick = () => {
  if(chatVisible) {
    chatVisible = false;
    layoutEl.style.width = '100%';
    chatContainer.style.display = 'none'
  } else {
    messageNotification.innerHTML = "";
    messageNotification.style.display = 'none';
    chatVisible = true;
    layoutEl.style.width = '75%';
    chatContainer.style.display = 'block'
  }

  layout();
}

chatSendButton.onclick = () => {
  const chat = chatInput.value;
  const time = new Date().toLocaleTimeString();
  if(chat && chat !== ""){
    session.signal({
      type: "text",
      data: JSON.stringify({data: chat, timestamp: time, username: username})
    }, function(error) {
      if(error) {
        console.log(error);
      } else {
        console.log("signal sent");
      }
    })
    chatInput.value = "";
  }
}

chatInput.addEventListener("keyup", function(event) {
  if(event.key === "Enter") {
    event.preventDefault();
    chatSendButton.click();
  }
})

// recordButton.onclick = async() => {
//   console.log("record clicked");
//   console.log(recording);
//   if(!recording) {
//     const response = await fetch(`/api/archive/start/${sessionId}`, {
//       method: "post",
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     })

//     const json = await response.json();
//     console.log(json);
//   } else if(recording && archiveId) {
//     const response = await fetch(`/api/archive/${archiveId}/stop`, {
//       method: "post",
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     })

//     const json = await response.json();
//     console.log(json);
//   }
// }

initializeSession();