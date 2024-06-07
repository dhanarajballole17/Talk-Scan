var currentUtterance;

// currentUtterance: Keeps track of the current text being spoken.

var speechSynthesizer = window.speechSynthesis; // Get the speech synthesis object

// Purpose: Initializes speechSynthesizer with the browser's speech synthesis object, allowing the program to convert text to speech.

// Image Selection Event Listener
// When We pick an image, this part of the code shows the name of the selected file.
document.getElementById('imageInput').addEventListener('change', function() {
    var selectedFile = this.files[0];
    var selectedFileName = document.getElementById('selectedFileName');

    if (!selectedFile) {
        selectedFileName.textContent = "";
        return;
    }

    if (!selectedFile.type.match('image/png')) {
        selectedFileName.textContent = "Please select a PNG image.";
        this.value = ""; // Clear the file input
    } else {
        selectedFileName.textContent = "Selected File: " + selectedFile.name;
    }
});

// Convert Button Event Listener
document.getElementById('convertButton').addEventListener('click', function() {
    var imageInput = document.getElementById('imageInput');
    var output = document.getElementById('output');
    var loader = document.getElementById('loader');

    if (imageInput.files.length === 0) {
        output.textContent = "Please select an image first.";
        return;
    }

    var file = imageInput.files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        var img = new Image();
        img.src = e.target.result;

        img.onload = function() {
            loader.style.display = "block"; // Show loader while processing image
            Tesseract.recognize(
                img,
                'eng',
                {
                    logger: m => console.log(m)
                }
            ).then(({ data: { text } }) => {
                // Check if text seems meaningful
                if (isMeaningfulText(text)) {
                    output.textContent = text;
                    speak(text);
                } else {
                    output.textContent = "No meaningful text found in the image.";
                }
                loader.style.display = "none"; // Hide loader after processing
            }).catch(error => {
                output.textContent = "Error occurred while processing the image: " + error.message;
                console.error(error);
                loader.style.display = "none"; // Hide loader in case of error
            });
        };
    };

    reader.readAsDataURL(file);
});

// Function to check if text seems meaningful
function isMeaningfulText(text) {
    // Set a minimum length threshold for meaningful text
    var minLengthThreshold = 5;
    // Check if the text length exceeds the minimum threshold
    return text.length >= minLengthThreshold;
}

// Reset Button Event Listener

// When you click the reset button:
// Stops any ongoing speech.
// Clears the text and resets the selected file and its name.

document.getElementById('resetButton').addEventListener('click', function() {
    speechSynthesizer.cancel();
    if (currentUtterance) {
        currentUtterance = null;
    }

    var output = document.getElementById('output');
    var imageInput = document.getElementById('imageInput');
    var selectedFileName = document.getElementById('selectedFileName');

    output.textContent = "";
    imageInput.value = "";
    selectedFileName.textContent = "";
});

// Pause and Resume Button Event Listeners

// Pause button: Pauses the speech if it's currently speaking.
// Resume button: Resumes paused speech or starts speaking again if there's a saved utterance.

document.getElementById('pauseButton').addEventListener('click', function() {
    if (speechSynthesizer.speaking) {
        speechSynthesizer.pause();
    }
});

document.getElementById('resumeButton').addEventListener('click', function() {
    if (speechSynthesizer.paused) {
        speechSynthesizer.resume();
    } else if (currentUtterance) {
        speechSynthesizer.speak(currentUtterance);
    }
});

// Speak Function

// Defines how to convert text to speech:
// Creates a speech object with the text to be spoken.
// Sets the volume, speed, and pitch of the speech.
// Saves this speech object in currentUtterance and tells the browser to speak it.

function speak(text) {
    var speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

    currentUtterance = speech;
    speechSynthesizer.speak(speech);
}

// Ensure only PNG files can be selected
document.getElementById('imageInput').setAttribute('accept', 'image/png');
