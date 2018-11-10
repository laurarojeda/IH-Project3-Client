import React, { Component } from 'react';
import styled from 'styled-components';
import DisplayWrapper from './DisplayWrapper';
import NoteRow from './NoteRow';
import NoteBox from './NoteBox';


const CanvasWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  align-content: start;
  background-color: #6B6A6A;
  grid-column: 2;
  /* grid-row: 3; */
  margin: 0 2rem 2rem 0;
  padding-top: 0.13rem;
  /* row-gap: 1px; */
  /* background-image:
    repeating-linear-gradient(0deg,transparent,transparent 24px,#ccc 24px,#ccc 24.96px),
    repeating-linear-gradient(-90deg,transparent,transparent 24px,#ccc 24px,#ccc 24.96px);
  background-size: 24.96px 24.96px; 1.012*/
  /* grid-template-rows:
    1.095rem 0.93rem 0.63rem 0.93rem 1.095rem 1.095rem 0.93rem 0.63rem 0.93rem 0.63rem 0.93rem 1.095rem
    1.095rem 0.93rem 0.63rem 0.93rem 1.095rem 1.095rem 0.93rem 0.63rem 0.93rem 0.63rem 0.93rem 1.095rem
    1.095rem 0.93rem 0.63rem 0.93rem 1.095rem 1.57rem; */
`;

export default class Display extends Component {
  state = {
    numberOfKeys: 30,
  };

  createRows = () => {
    const { numberOfKeys } = this.state;
    const array = [];
    for (let i = 0; i < numberOfKeys; i++) {
      array[i] = i + 36;
    }
    return array;
  };

  checkNoteType = (noteNumber) => {
    const blackKeys = [37, 39, 42, 44, 46, 49, 51, 54, 56, 58, 61, 63];
    return blackKeys.some((key) => {
      return key === noteNumber;
    });
  };

  render() {
    const { noteHistory } = this.props;
    return (
      <CanvasWrapper>
        {
          this.createRows().map((note) => {
            return (
              this.checkNoteType(note)
                ? <NoteRow type="black" key={note} note={note} noteHistory={noteHistory} />
                : <NoteRow key={note} note={note} noteHistory={noteHistory} />
            );
          })
        }
      </CanvasWrapper>
    );
  }
}
