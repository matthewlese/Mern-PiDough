import * as APIUtil from '../util/session_api_util';
import jwt_decode from 'jwt-decode';

export const RECEIVE_CURRENT_USER = 'RECEIVE_CURRENT_USER'
export const SIGNOUT_CURRENT_USER = 'SIGNOUT_CURRENT_USER'
export const RECEIVE_SESSION_ERRORS = 'RECEIVE_SESSION_ERRORS'
export const CLEAR_SESSION_ERRORS = 'CLEAR_SESSION_ERRORS' 

export const receiveCurrentUser = currentUser => ({
  type: RECEIVE_CURRENT_USER,
  currentUser
});

export const receiveErrors = errors => ({
  type: RECEIVE_SESSION_ERRORS,
  errors
});

export const clearErrors = () => ({
  type: CLEAR_SESSION_ERRORS
})

export const logoutUser = () => ({
  type: SIGNOUT_CURRENT_USER
});

export const signUp = user => dispatch => (
  APIUtil.signUp(user).then(res => (
    dispatch(signIn({ username: user.username, password: user.password }))
  ), err => (
    dispatch(receiveErrors(err.response.data))
  ))
);

export const signIn = user => dispatch => (
  APIUtil.signIn(user).then(res => {
    const { token } = res.data;
    localStorage.setItem('jwtToken', token);
    APIUtil.setAuthToken(token);
    const decoded = jwt_decode(token);
    dispatch(receiveCurrentUser(decoded))
  })
    .catch(err => {
      dispatch(receiveErrors(err.response.data));
    })
)

export const signOut = () => dispatch => {
  localStorage.removeItem('jwtToken')
  APIUtil.setAuthToken(false)
  dispatch(logoutUser())
};