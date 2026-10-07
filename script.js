// ---------- Sound helper ----------
const ctx = new AudioContext();
const waveSelect = document.querySelector("#wave-select");
const lastNote = document.querySelector("#last-note");

function playNote(freq) {
  // Browsers may start the AudioContext "suspended" until the user interacts
  if (ctx.state === "suspended") ctx.resume();

  const osc = ctx.createOscillator();
  osc.type = waveSelect.value;          // bonus: sound selector
  osc.frequency.value = freq;
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
}

// ---------- Helpers ----------
// Find the piano key element for a letter (returns null if there isn't one)
function findKey(letter) {
  return document.querySelector('[data-key="' + letter + '"]');
}

// Light up a key, play it, and show its name
function pressKey(keyEl) {
  checkGuide(keyEl.dataset.key);                // music guide: right key?
  keyEl.classList.add("active");
  playNote(Number(keyEl.dataset.freq));
  lastNote.textContent = keyEl.dataset.name;   // bonus: show last note
}

function releaseKey(keyEl) {
  keyEl.classList.remove("active");
}

// ---------- Keyboard events ----------
document.addEventListener("keydown", function (e) {
  if (e.repeat) return;                         // ignore auto-repeat while held
  const keyEl = findKey(e.key.toLowerCase());   // works with Caps Lock too
  if (!keyEl) return;                           // unmapped keys do nothing
  pressKey(keyEl);
});

document.addEventListener("keyup", function (e) {
  const keyEl = findKey(e.key.toLowerCase());
  if (!keyEl) return;
  releaseKey(keyEl);
});

// ---------- Bonus: click to play ----------
document.querySelectorAll(".key").forEach(function (keyEl) {
  keyEl.addEventListener("mousedown", function () { pressKey(keyEl); });
  keyEl.addEventListener("mouseup", function () { releaseKey(keyEl); });
  keyEl.addEventListener("mouseleave", function () { releaseKey(keyEl); });
});

// ---------- Music guide ----------
// Each song is a list of keyboard letters, in the order to press them.
const songs = {
  mary:    "d s a s d d d  s s s  d g g  d s a s d d d d  s s d s a",
  twinkle: "a a g g h h g  f f d d s s a",
  ode:     "d d f g g f d s a a s d d s s",
  // "Nearer, My God, to Thee" (tune: Bethany, Lowell Mason). Opening only.
  // Notes: B A G G E E D G B A  B A G G E  (G major, fits our keys)
  nearer:  "j h g g d d s g j h  j h g g d  "
};

const songSelect = document.querySelector("#song-select");
const songNotes = document.querySelector("#song-notes");
const songMsg = document.querySelector("#song-msg");
let song = [];     // letters of the chosen song
let pos = 0;       // which note we are waiting for

function updateGuide() {
  // remove the old "next" highlight from every key
  document.querySelectorAll(".key.next").forEach(function (k) {
    k.classList.remove("next");
  });

  // update the chips (done / current)
  songNotes.querySelectorAll(".chip").forEach(function (chip, i) {
    chip.classList.toggle("done", i < pos);
    chip.classList.toggle("current", i === pos);
  });

  // highlight the key to press next
  if (pos < song.length) {
    findKey(song[pos]).classList.add("next");
  }
}

function checkGuide(letter) {
  if (pos >= song.length) return;               // no song, or already finished
  if (letter !== song[pos]) return;             // wrong key: just plays, no progress
  pos++;
  updateGuide();
  if (pos === song.length) songMsg.textContent = "Song complete! Well played!";
}

songSelect.addEventListener("change", function () {
  songNotes.innerHTML = "";
  songMsg.textContent = "";
  pos = 0;
  song = songSelect.value ? songs[songSelect.value].split(/\s+/) : [];

  song.forEach(function (letter) {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = letter.toUpperCase();
    songNotes.appendChild(chip);
  });
  updateGuide();
  songSelect.blur();    // so pressing letters isn't swallowed by the dropdown
});
