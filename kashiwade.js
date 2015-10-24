var fileBS={ "ir":"audiofiles/TokyoBigSite_IR-9_LR.wav","se":"","image":"images/tokyoBigSiteBasement.jpg" };
var fileSH={ "ir":"audiofiles/bktk-shinjuku-01_03may09_44116stereo.wav","se":"","image":"" };
var fileCP={ "ir":"audiofiles/carpool_IR-9_LR.wav","se":"audiofiles/carpool_SE-9.wav","image":"images/carpool.jpg" };
var filePK={ "ir":"audiofiles/pokemon _IR-9_LR.wav","se":"audiofiles/pokemon_SE-9.wav","image":"images/pokemon.jpg" };
var fileRF={ "ir":"audiofiles/rooftop_IR-9_LR.wav","se":"audiofiles/rooftop_SE-9.wav","image":"images/rooftop.jpeg" };
var files={"ビッグサイト":fileBS,"新宿":fileSH,"真鶴1":fileRF,"ポケモンセンター":filePK,"真鶴2":fileCP };
         
navigator.getMedia = navigator.getUserMedia ||
                     navigator.webkitGetUserMedia ||
                     navigator.mozGetUserMedia ||
                     navigator.msGetUserMedia;

//端末のビデオ、音声ストリームを取得
var mic;
if (navigator.getMedia) {
    navigator.getMedia ({ audio:true }, function(stream) {
            mic = audioctx.createMediaStreamSource(stream);
    }, function(err){ console.log("err") });
}

var AudioContext = window.AudioContext || window.webkitAudioContext || false;
var audioctx;
if (AudioContext) {
    var audioctx = new AudioContext;
} else {
    alert("Sorry, but the Web Audio API is not supported by your browser. Please, consider upgrading to the latest version or downloading Google Chrome or Mozilla Firefox");
}
 
var player = null;
var ismicconnect = 0;
var convolver = audioctx.createConvolver();
var miclevelmax=0.5;
var revlevelmax=1.0;
var selevelmax=1.0;
var miclevel = audioctx.createGain();
var revlevel = audioctx.createGain();
var selevel = audioctx.createGain();
var dummy = audioctx.createGain();
miclevel.gain.value=miclevelmax*0.1;
revlevel.gain.value=revlevelmax*0.5;
selevel.gain.value=selevelmax*0.5;
convolver.connect(revlevel);
selevel.connect(audioctx.destination);
revlevel.connect(audioctx.destination);
var loadfiles = [
    "",
    "",
];
var buffers = [];
var clapwave;
var loadidx = 0;

function LoadClapWave() {
    var req = new XMLHttpRequest();
    req.open("GET", "audiofiles/kashiwade.wav", true);
    req.responseType = "arraybuffer";
    req.onload = function() {
        if(req.response) {
            audioctx.decodeAudioData(req.response,function(b){
                clapwave=b;
           },function(){});
        }
        else
            clapwave = audioctx.createBuffer(VBArray(req.responseBody).toArray(), false);
    };
    req.send();
}
function LoadBuffers() {
    var req = new XMLHttpRequest();
    req.open("GET", loadfiles[loadidx], true);
    req.responseType = "arraybuffer";
    req.onload = function() {
        if(req.response) {
            audioctx.decodeAudioData(req.response,function(b){
                buffers[loadidx]=b;
                if(++loadidx < loadfiles.length)
                    LoadBuffers();
            },function(){});
        }
        else
            buffers[loadidx] = audioctx.createBuffer(VBArray(req.responseBody).toArray(), false);
    };
    req.send();
}

function loadContents(key) {
    Stop();
    loadidx = 0;
    buffers[0]=null;
    buffers[1]=null;
    loadfiles[0]=files[key]["ir"];
    loadfiles[1]=files[key]["se"];
    LoadBuffers();
}
function getImageURL(key) {
    return files[key]["image"];
}
function setMicLevel() {
    var level=document.getElementById("miclevel").value;
    miclevel.gain.value=parseInt(level)/100*miclevelmax;
}
function setRevLevel() {
    var level=document.getElementById("revlevel").value;
    revlevel.gain.value=parseInt(level)/100*revlevelmax;
}
function setSELevel() {
    var level=document.getElementById("selevel").value;
    selevel.gain.value=parseInt(level)/100*selevelmax;
}
function clap() {
    convolver.buffer = buffers[0];
    var source = audioctx.createBufferSource();
    source.buffer = clapwave;
    source.loop = false;
    source.connect(audioctx.destination);
    source.connect(convolver);
    if (buffers[0]) source.start(0);
}
function connectMic()
{
    if (mic) {
        mic.connect(miclevel);
        miclevel.connect(convolver);
        miclevel.connect(audioctx.destination);
        ismicconnect=1;
    }
}
function disconnectMic()
{
    if (mic) {
        mic.disconnect();
        ismicconnect=0;
    }
}
function Play() {
    if (player == null) {
        convolver.buffer = buffers[0];
        if (buffers[1]==null) {
            if (ismicconnect) {
                disconnectMic();
            } else {
                connectMic();
            }
            return;
        }
        connectMic();
        player = audioctx.createBufferSource();
        player.buffer = buffers[1];
        player.loop = true;
        player.connect(selevel);
        player.start(0);
    } else {
        Stop();
    }
}
function Stop() {
    disconnectMic();
    if (player==null) return;
    player.stop(0);
    player = null;
}
