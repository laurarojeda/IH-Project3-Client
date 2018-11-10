import React from 'react';
import styled from 'styled-components';

const CardButton = styled.button`
  width: 100%;
  padding: 1rem 0;
  margin-top: 5rem;
  border-radius: 5px;
  background: #0F8FAB;
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  /* animation: mymove 15s infinite;
  }
    @keyframes mymove {
        50% { background-color: #EF4957; }
  } */

  &:focus{
    transform: translateY(2px);
    animation: none !important;
  }
`;

export default function Button(props) {
  return (
    <CardButton type="submit">
      {props.children}
    </CardButton>
  );
}
