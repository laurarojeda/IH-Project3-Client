import React, { Component } from 'react';
import styled from 'styled-components';

const Key = styled.div`
  border-top: 6px solid #E2BE09;
  border-radius: 0 0 5px 5px; 
  background: #4c4c4c;
  width: 30px;
  height: 85px;
  box-shadow:
    0 0 0 0.5px inset #353535, 
    0 8px #353535; 

  &:active {
   box-shadow: 0 8px #4c4c4c;
  }
`;

export default class BlackKey extends Component {
  render() {
    return (
      <React.Fragment>
        <Key />
      </React.Fragment>
    );
  };
}