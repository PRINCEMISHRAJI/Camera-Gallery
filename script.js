let video = document.querySelector("video");
let recordButtonCont = document.querySelector(".record-button-cont");
let recordButton = document.querySelector(".record-button");
let captureButtonCont = document.querySelector(".capture-button-cont");
let captureButton = document.querySelector(".capture-button");
let recordFlag = false;
let chunks = [];
let transparentColor = "transparent";
let recorder;

let constraints = {
    video : true,
    audio : true
}

// navigator -> global, browser info
navigator.mediaDevices.getUserMedia(constraints)
.then( (stream) => {
    video.srcObject = stream;

    recorder = new MediaRecorder(stream); 

    recorder.addEventListener( ("start"), (e) => {
        chunks = [];
    })

    recorder.addEventListener( ("dataavailable"), (e) => {
        chunks.push(e.data);
    })

    recorder.addEventListener("stop", (e)=> {
        // Conversion of Media chunks into file
        let blob = new Blob(chunks, { type : "video/mp4"});

        if(db){
            let videoID = shortid();
            let dbTransaction = db.transaction("video", "readwrite");
            let videoStore = dbTransaction.objectStore("video");
            let videoEntry = {
                id : `vid-${videoID}`,
                blobData : blob
            };
            videoStore.add(videoEntry);
        }
        // let videoURL = window.URL.createObjectURL(blob);
        
        // let a = document.createElement("a");
        // a.href = videoURL;
        // a.download = "stream.mp4";
        // a.click();
    })
})

captureButtonCont.addEventListener("click", (e)=> {
    captureButton.classList.add("scale-capture");
    let canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    // filtering
    context.fillStyle = transparentColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
 
    let imageURL = canvas.toDataURL();
    if(db){
        let imageID = shortid();
        let dbTransaction = db.transaction("image", "readwrite");
        let imageStore = dbTransaction.objectStore("image");
        let imageEntry = {
            id : `img-${imageID}`,
            URL : imageURL
        };
        imageStore.add(imageEntry);
    }

    setTimeout(() => {
        captureButton.classList.remove("scale-capture");
    }, 500);
})

recordButtonCont.addEventListener("click", (e) => {
    console.log("recorder");
    if(!recorder) return;
    
    recordFlag = !recordFlag;
    
    if(recordFlag) { // Start
        startTimer();
        console.log("record");
        recorder.start();
        recordButton.classList.add("scale-record");
        
    }else { // Stop
        recorder.stop();
        recordButton.classList.remove("scale-record");
        stopTimer();
    }
 })
 
 let timerID;
 let counter =0;
 let timer = document.querySelector(".timer");
 function startTimer(){
    timer.style.display = "block";
    function displayTimer(){
        let hours = Number.parseInt(counter/3600);
        let totalSeconds = counter%3600;
        
        let minutes = Number.parseInt(totalSeconds/60);
        let seconds = totalSeconds%60;
        
        hours = (hours < 10) ? `0${hours}` : hours;
        minutes = (minutes <10) ? `0${minutes}` : minutes;
        seconds = seconds <10 ? `0${seconds}` : seconds;
        timer.innerText = `${hours}:${minutes}:${seconds}`;
        counter++;
    }
    timerID = setInterval(displayTimer, 1000);
}
function stopTimer(){
    clearInterval(timerID);
    timer.style.display = "none";
    timer.innerText = "00:00:00";
    counter = 0;
}

// Filtering Logic
let filterLayer = document.querySelector(".filter-layer");
let allFilters = document.querySelectorAll(".filter");
allFilters.forEach((filterElem) => {
    filterElem.addEventListener("click", (e) => {
        transparentColor = getComputedStyle(filterElem).getPropertyValue("background-color");
        filterLayer.style.backgroundColor = transparentColor;
    })
})


