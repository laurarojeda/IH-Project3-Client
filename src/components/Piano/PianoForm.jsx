import React from 'react';
import {
  Formik,
  Form,
  Field,
  ErrorMessage
} from 'formik';
import styled from 'styled-components';

const PianoForm = (props) => {
  const { initialValues, changeName } = props;
  return (
    <React.Fragment>
      <Formik
        itinialValues={initialValues}
        onSubmit={(values) => {
          const { songName } = values;
          changeName(songName);
        }}
        render={() => {
          return (
            <Form>
              <Field type="text" name="songName" placeholder="Song name" />
              <button type="button">Change</button>
            </Form>
          );
        }}
      />
    </React.Fragment>
  );
};

export default PianoForm;
