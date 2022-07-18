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

// Once the DOM is entirely loaded, begin the app
console.warn(
  "HEY STUDENT: This program sends many debug messages to" +
    " the console. If you don't see the message 'start' below this, you're not" +
    " seeing those helpful debug messages. In your browser console, click on" +
    " menu 'Default Levels' and add Verbose"
);
$(start);

// ~~~~~~~~ TESTING CHANGES

// function to remove Test storys
async function delete1(...args) {
  if (args.length === 0) {
    const ids = storyList.stories.filter((val) => {
      return val.title.indexOf("Test") > -1;
    });
    console.log(ids);

    for (let id of ids) {
      await axios.delete(`https://hack-or-snooze-v3.herokuapp.com/stories/${id.storyId}`, { params: { token: currentUser.loginToken } });
    }
    alert("tests deleted. reloading now");
    location.reload();
  } else {
    for (let id of args) {
      await axios.delete(`https://hack-or-snooze-v3.herokuapp.com/stories/${id}`, { params: { token: currentUser.loginToken } });
    }
  }
}

$("#submit-title").val("Test1");
$("#submit-author").val("Me");
$("#submit-url").val("https://www.firefox.com");

/*
autoclick submit
*/
// $(document).ready(function () {
//   setTimeout(function () {
//     $("#nav-submit").trigger("click");
//     console.log("click");
//   }, 100);
// });
