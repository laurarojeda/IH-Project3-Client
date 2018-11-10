import styled from 'styled-components';

const width = '2.63rem';
const width2 = '5rem';

const BlackKey = styled.div`
  background: ${props => props.active ? 'tomato' : '#4C4C4C'};
  border-radius: 0 .2rem .2rem 0;
  width: 3rem; /*42,5px*/
  height: 1.75rem; /*15px*/
  border-left: 5px solid #0F8FAB;
  box-shadow:
  0 0 0 0.06rem inset #353535,
  0.2rem 0 0 0 #353535;
  /* justify-self: end; */

  &:active {
    box-shadow:
    0.2rem 0 0 0 #4C4C4C;
  }

  @media (max-width: 768px) {
    width: calc(2.65rem/2);
  }
`;

export default BlackKey;
