"use strict";
//TESTING USER ACCOUNT
//  -username test32
//  -password testing

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");
const $submitForm = $("#submit-form");
const $userProfileForm = $("#user-form");

const $navMyStories = $("#nav-my-stories");
const $navFavorites = $("#nav-favorites");
const $navSubmit = $("#nav-submit");
const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");

/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */
function hidePageComponents() {
  const components = [$allStoriesList, $loginForm, $signupForm, $submitForm];
  components.forEach((c) => c.hide());
}

/** Overall function to kick off the app. */
async function start() {
  console.debug("start");

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  // if we got a logged-in user
  if (currentUser) updateUIOnUserLogin();
}

// ~~~~~~~~~~~~~STARTPOINT~~~~~~~~~~~
$(start);
