import React, { Component } from 'react';
import styled from 'styled-components';
import song from '../../services/song-service';
import Controls from './Controls';
import Board from './Board';
import PianoForm from './PianoForm';
import Display from './Display';

const PianoWrapper = styled.div`
  display: grid;
  grid-column: 1;
  grid-row: 3;
  place-items: start start;
  align-self: start;
  margin: 0 0 2rem 2rem;
`;

const ControlBtn = styled.button`
  grid-area: play;
  cursor: pointer;
  width: 60px;
  height: 30px;
  text-align: center;
  text-shadow: 0 1px #353535;
  color:#F8F8F8;
  border: 1px solid #6B6A6A;
  border-radius: 3px;
  background: linear-gradient(#6B6A6A,#4C4C4C);

  &:active {
    color: #D3D3D3;
    background:#4C4C4C;
    box-shadow: inset 0 0 5px 2px rgba(53,53,53,.5);
  }
`;

const PlaySymbol = styled.div`
  display: inline-block;
  border-style: solid;
  border-color: transparent transparent transparent white;
  box-sizing: border-box;
  border-width: 0.5rem 0 0.5rem 0.8rem;
`;

const PauseSymbol = styled.div`
  display: block;
  border-color: white;
  border-style: double;
  border-width: 0 0 0 0.5rem;
`;

const AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();
class Piano extends Component {
  state = {
    songId: null,
    songName: null,
    songBPM: 60,
    midiInstrument: null,
    recStartTimeStamp: 0,
    recStopTimeStamp: 0,
    offset: null,
    activeNotes: [],
    noteHistory: [],
    isRecording: false,
    isEditing: false,
  }

  // Is called on component mount. Fetches song using id in URL if it already
  // exists.
  // Calls listenForMIDIAccess() to set up MIDI event listening/capture.
  componentDidMount() {
    const { params: songId, note } = this.props;
    if (songId) {
      song.getSong(songId)
        .then((response) => {
          const { songName, noteHistory } = response;
          // const songTimeStamp = noteHistory[0].timeStampOn - 10;
          this.setState({ songId, songName, noteHistory });
        });
    }
    this.listenForMIDIAccess();
  }

  // MIDI LOGIC

  // Converts MIDI note value to Hz for oscillator.
  // @params {number} noteData - MIDI note value.
  // @returns {number} - Frequency to be played by oscillator.
  convertNoteDataToFrequency = (noteData) => {
    const hertz = 440;
    const semitones = 12;
    return hertz * (2 ** ((noteData - 69) / semitones));
  }

  // Creates oscillator/gain nodes for new notes and adds them to
  // activeNotes/noteHistory arrays.
  // @param {object} midiData - MIDI event object with all note information.
  // @param {number} midiNote - MIDI note value.
  // @param {number} midiVelocity - MIDI note velocity value to be used by gain node.
  noteOn = (midiData, midiNote, midiVelocity, isEditing) => {
    const {
      recStartTimeStamp,
      recStopTimeStamp,
      offset,
      activeNotes,
      noteHistory,
      isRecording,
    } = this.state;

    // Create oscillator and gain nodes for synth.
    const oscillatorNode = context.createOscillator();
    const gainNode = context.createGain();

    // Variables used to create noteObject.
    const noteHz = this.convertNoteDataToFrequency(midiNote);

    let noteTimeStamp = new Date().getTime();
    const localOffset = recStartTimeStamp - recStopTimeStamp;
    let goalTs = 0;
    if (isEditing) {
      goalTs = recStartTimeStamp - localOffset;
      noteTimeStamp -= goalTs;
    } else {
      noteTimeStamp -= recStartTimeStamp;
    }

    const noteObject = {};

    // Setup gain node.
    gainNode.connect(context.destination);
    gainNode.gain.value = midiVelocity / 127;

    // Set up and start oscillator node.
    oscillatorNode.type = 'square';
    oscillatorNode.frequency.value = noteHz;
    oscillatorNode.connect(gainNode);
    oscillatorNode.start();

    // Create note object to push to noteHistory if recording.
    noteObject.oscillator = oscillatorNode;
    noteObject.note = {
      data: midiData,
      timeStampOn: noteTimeStamp,
      timeStampOff: null,
    };
    isRecording && noteHistory.push(noteObject.note);

    // Push notes to activeNotes and update state.
    activeNotes.push(noteObject);
    this.setState(prevState => ({
      recStartTimestamp: prevState.recStartTimestamp - localOffset,
      offset: goalTs,
      activeNotes,
      noteHistory,
    }));
  };

  // Kills note oscllators and removes notes from activeNotes array.
  // @param {object} midiData - MIDI event object with all note information.
  noteOff = (midiData) => {
    const {
      recStartTimeStamp,
      recStopTimeStamp,
      offset,
      activeNotes,
      noteHistory,
      isEditing,
    } = this.state;

    // Finds index of note to kill.
    const indexOfNoteToKill = activeNotes.findIndex((noteObject) => noteObject.note.data[1] === midiData[1]);

    // Stops/disconnects oscillator and removes note from activeNotes array.
    // const date = new Date();
    // const noteTimeStamp = date.getTime() - recStartTimeStamp;
    let noteTimeStamp = new Date().getTime();
    if (isEditing) {
      noteTimeStamp -= offset;
    } else {
      noteTimeStamp -= recStartTimeStamp;
    }

    activeNotes[indexOfNoteToKill].note.timeStampOff = noteTimeStamp;
    activeNotes[indexOfNoteToKill].oscillator.stop();
    activeNotes[indexOfNoteToKill].oscillator.disconnect();
    activeNotes.splice(indexOfNoteToKill, 1);

    this.setState({ recStartTimeStart: recStartTimeStamp - offset, activeNotes, noteHistory });
  };

  // Calls noteOn() or noteOff methods according to MIDI status value.
  // Sets midiInstrument value.
  // @params {object} midiMessage - MIDI event object.
  getMidiInput = (midiMessage) => {
    const { isEditing } = this.state;
    const {
      manufacturer: midiManufacturer,
      name: midiModel,
    } = midiMessage.currentTarget;
    const midiData = Array.from(midiMessage.data);
    const midiStatus = midiData[0];
    const midiNote = midiData[1];
    const midiVelocity = midiData[2];

    switch (midiStatus) {
      case 144:
        this.noteOn(midiData, midiNote, midiVelocity, isEditing);
        break;
      case 128:
        this.noteOff(midiData, midiNote, midiVelocity);
        break;
      default:
        console.log('Soy un default :D');
        break;
    }

    this.setState({
      midiInstrument: `${midiManufacturer} ${midiModel}`,
    });
  };

  // Loops through and calls getMidiInput on MIDI messages.
  onMIDISuccess = (midiAccess) => {
    midiAccess.inputs.forEach((message) => {
      message.onmidimessage = this.getMidiInput;
    });
  };

  onMIDIFailure = (error) => {
    console.log('requestMIDIAccess fail', error);
  };

  // Listens for MIDI access (events).
  listenForMIDIAccess = () => {
    navigator.requestMIDIAccess({ sysex: false })
      .then(this.onMIDISuccess)
      .catch(this.onMIDIFailure);
  }

  // Starts/stops recording of songs into noteHistory array.
  // Makes song-service API calls to create/update songs.
  handleRecording = () => {
    const {
 songId, songName, noteHistory, isRecording 
} = this.state;
    const recStartTimeStamp = new Date().getTime();
    if (!isRecording) {
      if (!songId) {
        song.newSong({ songName, noteHistory })
          .then((newSong) => {
            this.setState({ songId: newSong._id, recStartTimeStamp, isRecording: true });
          });
      } else {
        this.setState({ recStartTimeStamp, isRecording: true, isEditing: true });
      }
    } else {
      const recStopTimeStamp = new Date().getTime();
      song.editSong(songId, { songName, noteHistory });
      this.setState({ recStopTimeStamp, isRecording: false, isEditing: true });
    }
  }

  // Translates midi note value to actual musical notation.
  // @params {number} midiNote - Midi note value.
  // @returns {string}
  translateMidiToNote = (midiNote) => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return `${noteNames[midiNote % 12]} ${(Math.trunc(midiNote / 12) - 1)}`;
  }

  // Shows notes from noteHistory on the music sheet.
  // @returns {DOM Element}
  showNotes = () => {
    const { noteHistory } = this.state;
    return (
      noteHistory.map((input, index) => (
          <span key={index}>{this.translateMidiToNote(input.data[1])}</span>
      ))
    );
  }

  // Changes the current name of the song by changing the state.
  // @param {string} songName - New name of the song from form.
  changeName = (songName) => {
    console.log('name changed');
    this.setState({ songName });
  }

  // Clears current noteHistory array by changing state.
  clearHistory = () => {
    this.setState({ noteHistory: [] });
  }

  // Plays back song (noteHistory array).
  playSong = () => {
    const {
      songTimeStamp,
      editTimeStamp,
      noteHistory,
      isEditing,
    } = this.state;

    let playbackTimeStamp = 0;
    let noteIndex = 0;

    // Delays execution of next line for the duration of a note.
    // @param {number} miliseconds - Time to wait in miliseconds.
    const delay = miliseconds => new Promise(resolve => setTimeout(resolve, miliseconds));

    // Plays and kills notes at appropriate times.
    // @param {object} note - Note object from noteHistory array.
    const playNote = async (note) => {
      const midiData = Array.from(note.data);
      const midiNote = note.data[1];
      const midiVelocity = note.data[2];
      const noteDuration = note.timeStampOff - note.timeStampOn;

      this.noteOn(midiData, midiNote, midiVelocity, isEditing);
      await delay(noteDuration);
      this.noteOff(midiData);
    };

    // Starts playback interval and checks notes in noteHistory one by one
    // for a matching (<=) start time. Kills interval when it reaches the end of
    // the noteHistory array.
    const playbackInterval = setInterval(() => {
      console.log(playbackTimeStamp);
      if (noteHistory[noteIndex].timeStampOn <= playbackTimeStamp) {
        playNote(noteHistory[noteIndex]);
        noteIndex++;
      }
      if (noteIndex === noteHistory.length) {
        clearInterval(playbackInterval);
      }
      playbackTimeStamp += +10;
    }, 10);
  }

  playUiKeys = (noteNumber) => {
    console.log('down', noteNumber);
    // const keyDataOn = [144, noteNumber, 100];
    // this.noteOn(keyDataOn, keyDataOn[1], keyDataOn[2]);
  }

  stopUiKeys = (noteNumber) => {
    console.log('up', noteNumber);
    // const keyDataOff = [128, noteNumber, 100];
    // this.noteOff(keyDataOff);
  }

  render() {
    const { activeNotes, isRecording, midiInstrument } = this.state;
    return (
      <React.Fragment>
        <Controls
          activeNotes={activeNotes}
          isRecording={isRecording}
          onRecording={this.handleRecording}
          midiInstrument={midiInstrument}
          clearHistory={this.clearHistory}
        >
          <ControlBtn type="button" onClick={this.playSong}>
            <PlaySymbol />
          </ControlBtn>
          <PianoForm changeName={this.changeName} />
          {/* <button type="button" onClick={this.clearHistory}>Clear</button> */}
        </Controls>
        <PianoWrapper>
          <Board
            activeNotes={activeNotes}
            onMouseDown={this.playUiKeys}
            onMouseUp={this.stopUiKeys}
          />
        </PianoWrapper>
        <Display activeNotes={activeNotes}>
          { this.showNotes() }
        </Display>
      </React.Fragment>
    );
  }
}

export default Piano;
