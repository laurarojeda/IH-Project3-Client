import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import combinedReducers from './reducers';

const session = {
  user: null,
  isLogged: false,
  status: 'loading',
  error: null,
};

const ui = {
  showLogin: false,
};

/* eslint-disable no-underscore-dangle */
const store = createStore(
  combinedReducers,
  { session, ui },
  composeWithDevTools(applyMiddleware(thunkMiddleware)),
);
/* eslint-enable */

// store.subscribe(() => {
//   console.log('Store changed!', store.getState());
// });

export default store;
