import React from 'react';
import AuthHandler from './AuthHandler';
import {
  CardContainer,
  CardH1,
  CardBody,
  CardText,
  CardLink,
} from './AuthCard';

const Signup = (props) => {
  const { switchForm } = props;
  return (
    <CardContainer>
      <CardH1>Sign up</CardH1>
      <CardBody>
        <AuthHandler />
        <CardText>
          Already have an account?
          <CardLink onClick={switchForm}>Log in!</CardLink>
        </CardText>
      </CardBody>
    </CardContainer>
  );
};

export default Signup;