"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */
async function getAndShowStoriesOnStart() {
  console.debug("getAndShowStoriesOnStart");
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage(storyList.stories);
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */
function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const _includes = (test, story) => {
    return test.some((val) => val.storyId === story.storyId);
  };
  const isFav = _includes(currentUser.favorites, story);
  const isTrash = _includes(currentUser.ownStories, story);

  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}">
          <span class="star"><i class="far fa-star ${isFav ? "fas" : ""}"></i></span>
          <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
          </a>
          <small class="story-hostname">(${hostName})</small>
          <small class="story-author">by ${story.author}</small>
          ${isTrash ? '<span class="trash"><i class="fas fa-trash-alt"></i></span>' : ""}
          <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */
function putStoriesOnPage(stories) {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  // adding click handlers for fav and trash
  $(".star").on("click", favoriteHandler);
  $(".trash").on("click", deleteHandler);

  $allStoriesList.show();
}

/** Handle click of story submit button */
async function submitStory(evt) {
  evt.preventDefault();
  const newStory = {
    title: $("#submit-title").val(),
    author: $("#submit-author").val(),
    url: $("#submit-url").val(),
  };
  await storyList.addStory(currentUser, newStory);
  hidePageComponents();
  putStoriesOnPage(storyList.stories);
}
$submitForm.on("submit", submitStory);

async function favoriteHandler(evt) {
  const storyId = evt.currentTarget.parentElement.id;
  await currentUser.toggleFavorite(storyId);

  // update DOM
  $(`#${storyId} .fa-star`).toggleClass("fas");
}

async function deleteHandler(evt) {
  const storyId = evt.currentTarget.parentElement.id;
  await storyList.deleteStory(currentUser, storyId);
  evt.currentTarget.parentElement.remove();
}
