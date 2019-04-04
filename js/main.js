var config;
var data;
var database;
var ref;
var modal;

function init() {
    // Initializeer Firebase
    config = {
        apiKey: "AIzaSyAyy1WBZaAnUG8wB97jQD2sVMlRYFDWLhk",
        authDomain: "smoelenboek-2db2c.firebaseapp.com",
        databaseURL: "https://smoelenboek-2db2c.firebaseio.com",
        projectId: "smoelenboek-2db2c",
        storageBucket: "smoelenboek-2db2c.appspot.com",
        messagingSenderId: "777069648093"
    };
    
    firebase.initializeApp(config);
    console.log(firebase);
    database = firebase.database();
    ref = database.ref('profielen');
    ref.on('value', gotData, errData);

    // Open en sluit modal
    modal = document.getElementById('myModal');
    var openen = document.getElementById("toevoegenButton");
    var sluiten = document.getElementsByClassName("sluitIcon")[0];
    
    openen.onclick = function () {
        modal.style.display = "block";
        document.forms["profileInfo"]["verwijderenButton"].hidden = true;
    }
    
    sluiten.onclick = function () {
        modal.style.display = "none";
        clearFields();
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
                clearFields();
            }
        }
    }
}

function openProfiel(profileID, voornaam, achternaam, functietitel, geboortedatum, biografie, pasfoto) {
    document.forms["profileInfo"]["verwijderenButton"].hidden = false;
    document.forms["profileInfo"]["verwijderenButton"].onclick = function () {
        ref.child(profileID).remove();
        clearFields();
        modal.style.display = "none";
    }
    document.forms["profileInfo"]["firebaseid"].value = profileID;
    document.forms["profileInfo"]["voornaam"].value = voornaam;
    document.forms["profileInfo"]["achternaam"].value = achternaam;
    document.forms["profileInfo"]["geboortedatum"].value = geboortedatum;
    document.forms["profileInfo"]["functietitel"].value = functietitel;
    document.forms["profileInfo"]["biografie"].value = biografie;
    document.forms["profileInfo"]["pasfoto"].value = pasfoto;
    document.forms["profileInfo"]["pasFotoFile"].value = "";
    document.getElementById("examplePicture").innerHTML = '<img id="foto" src="' + pasfoto + '"/>';
    modal.style.display = "block";
}

function clearFields() {
    document.forms["profileInfo"]["firebaseid"].value = "";
    document.forms["profileInfo"]["voornaam"].value = "";
    document.forms["profileInfo"]["achternaam"].value = "";
    document.forms["profileInfo"]["geboortedatum"].value = "";
    document.forms["profileInfo"]["functietitel"].value = "";
    document.forms["profileInfo"]["biografie"].value = "";
    document.forms["profileInfo"]["pasfoto"].value = "";
    document.forms["profileInfo"]["pasFotoFile"].value = "";
    document.getElementById("examplePicture").innerHTML = '<img id="foto" src="images/Portrait_Placeholder.png"/>';
}

function requiredFieldFilled() {
    var x = document.forms["profileInfo"]["voornaam"].value;
    if (x == "") {
        alert("Vul een voornaam in.");
        return false;
    }
    x = document.forms["profileInfo"]["achternaam"].value;
    if (x == "") {
        alert("Vul een achternaam in.");
        return false;
    }
    x = document.forms["profileInfo"]["geboortedatum"].value;
    if (x == "") {
        alert("Vul een geboortedatum in.");
        return false;
    }
    var x = document.forms["profileInfo"]["functietitel"].value;
    if (x == "") {
        alert("Vul een functietitel in.");
        return false;
    }
    var x = document.forms["profileInfo"]["biografie"].value;
    if (x == "") {
        alert("Vul een biografie in.");
        return false;
    }
    var x = document.forms["profileInfo"]["pasfoto"].value;
    if (x == "") {
        alert("Selecteer een pasfoto.");
        return false;
    }
    // Alles goed
    return true;
}

function checkAndSend() {
    if (requiredFieldFilled()) {
        var firebaseid = document.getElementById("firebaseid").value;
        if (firebaseid.length > 0) {
            ref.child(firebaseid).remove(); // oude verwijderen
        }
        sendToFirebase();
        clearFields();
        modal.style.display = "none";
        return true;
    } else {
        return false;
    }
}

function sendToFirebase() {
    data = {
        voornaam: document.getElementById("voornaam").value,
        achternaam: document.getElementById("achternaam").value,
        geboortedatum: document.getElementById("geboortedatum").value,
        functietitel: document.getElementById("functietitel").value,
        biografie: document.getElementById("biografie").value,
        pasfoto: document.getElementById("pasfoto").value
    }
    ref.push(data);
    console.log(data);
}

function gotData(data) {
    var profielen = data.val();
    var keys = Object.keys(profielen);
    console.log(keys)
    var totaleHTML = '';
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var achternaam = profielen[k].achternaam;
        var voornaam = profielen[k].voornaam;
        var functietitel = profielen[k].functietitel;
        var geboortedatum = profielen[k].geboortedatum;
        var biografie = profielen[k].biografie;
        var pasfoto = profielen[k].pasfoto;
        var card = '<div class="card" id="' + k + '" onclick="openProfiel(' + "'" + k + "','" + voornaam + "','" + achternaam + "','" + functietitel + "','" + geboortedatum + "','" + biografie + "','" + pasfoto + "'" + ');">' + '<img class="cardPasfoto" src="' + pasfoto + '" />' + '<h2 class="cardVoornaam">' + voornaam + " " + achternaam + '</h2>' + '<p class="cardFunctietitel">' + functietitel + '</p>' + '</div>';
        totaleHTML = totaleHTML + card;
    }
    document.getElementById("cards").innerHTML = totaleHTML;
}

function errData(err) {
    console.log('Error!');
    console.log(err);
}

function connectToDatabase() {
    // Get a reference to the storage service, which is used to create references in your storage bucket
    var storage = firebase.storage();
    return storage.ref();
}

function isEmpty(str) {
    if (typeof str == "string") {
        str = str.trim();
    }
    return (!str || 0 === str.length);
}

function uploadFile(file) {
    var storageRef = connectToDatabase();
    
    // Create the file metadata
    var metadata = {
        contentType: 'image/jpeg'
    };

    // Upload file and metadata to the object 'images/...'
    var milliseconds = new Date().getTime();
    var uploadTask = storageRef.child('images/' + milliseconds + '_' + file.name).put(file, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
    
    function (snapshot) {
        document.getElementById("opslaanButton").style.display = "none";

        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');

        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
                console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
                console.log('Upload is running');
                break;
        }
    },
    function (error) {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
            case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break;

            case 'storage/canceled':
                // User canceled the upload
                break;
                
            case 'storage/unknown':
                // Unknown error occurred, inspect error.serverResponse
                break;
        }
    },
    function () {
        // Upload completed successfully, now we can get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            console.log('File available at', downloadURL);
            document.getElementById("opslaanButton").style.display = "block";
            document.getElementById("pasfoto").value = downloadURL;
            document.getElementById("examplePicture").innerHTML = '<img id="foto" src="' + downloadURL + '" />';
        });
    });
}

function fileLoad() {
    var x = document.getElementById("myFile");
    var txt = "";
    if ('files' in x) {
        if (x.files.length == 0) {
            txt = "Select a file";
        } else {
            var file = x.files[0];
            uploadFile(file);
            txt = Math.round(x.files[0].size / 1024) + 'kb';
        }
    } else {
        if (x.value == "") {
            txt = "Select a file";
        } else {
            txt = "The files property is not supported by your browser!";
            txt += "<br>The path of the selected file: " + x.value; // If the browser does not support the files property, it will return the path of the selected file instead. 
        }
    }
    document.getElementById("info").innerHTML = txt;
}