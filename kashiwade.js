var fileBS={ "ir":"audiofiles/TokyoBigSite_IR-9_LR.wav","se":"","image":"images/tokyoBigSiteBasement.jpg" };
var fileSH={ "ir":"audiofiles/bktk-shinjuku-01_03may09_44116mono.wav","se":"","image":"" };
var fileCP={ "ir":"audiofiles/carpool_IR-9_LR.wav","se":"audiofiles/carpool_SE-9.wav","image":"images/carpool.jpg" };
var filePK={ "ir":"audiofiles/pokemon _IR-9_LR.wav","se":"audiofiles/pokemon_SE-9.wav","image":"images/pokemon.jpg" };
var fileRF={ "ir":"audiofiles/rooftop_IR-9_LR.wav","se":"audiofiles/rooftop_SE-9.wav","image":"images/rooftop.jpeg" };
var files={"ビックサイト":fileBS,"新宿":fileSH,"真鶴1":fileCP,"ポケモンセンター":filePK,"真鶴2":fileRF };
         
navigator.getMedia = navigator.getUserMedia ||
                     navigator.webkitGetUserMedia ||
                     navigator.mozGetUserMedia ||
                     navigator.msGetUserMedia;

//端末のビデオ、音声ストリームを取得
var mic;
navigator.getMedia ({ audio:true }, function(stream) {
        mic = audioctx.createMediaStreamSource(stream);
}, function(err){ console.log("err") });

var audioctx = new AudioContext();
 
var player = null;
var convolver = audioctx.createConvolver();
var revlevel = audioctx.createGain();
var selevel = audioctx.createGain();
var dummy = audioctx.createGain();
revlevel.gain.value=0.5;
selevel.gain.value=0.5;
convolver.connect(revlevel);
selevel.connect(audioctx.destination);
var loadfiles = [
    "",
    "",
];
var buffers = [];
var loadidx = 0;

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
    console.log(files[key]);
    buffers[0]=null;
    buffers[1]=null;
    loadfiles[0]=files[key]["ir"];
    loadfiles[1]=files[key]["se"];
    LoadBuffers();
}
function getImageURL(key) {
    return files[key]["image"];
}
function setRevLevel() {
    var level=document.getElementById("revlevel").value;
    revlevel.gain.value=parseInt(level)*0.01;
}
function setSELevel() {
    var level=document.getElementById("selevel").value;
    selevel.gain.value=parseInt(level)*0.01;
}
function Play() {
    if(player == null) {
        convolver.buffer = buffers[0];
        revlevel.connect(audioctx.destination);
        mic.connect(convolver);
        mic.connect(audioctx.destination);
        if (buffers[1]==null) return;
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
    revlevel.disconnect();
    mic.disconnect();
    if (player==null) return;
    player.stop(0);
    player = null;
}
