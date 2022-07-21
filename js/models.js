"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */
class Story {
  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */
  constructor({ storyId, title, author, url, username, createdAt, isFav }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */
  getHostName() {
    // UNIMPLEMENTED: complete this function!
    return "hostname.com";
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */
class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */
  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map((story) => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */
  async addStory(user, story) {
    console.log(user.loginToken);
    const res = await axios.post(`${BASE_URL}/stories`, { token: user.loginToken, story });
    const newStory = new Story(res.data.story);

    this.stories.unshift(newStory);
    user.ownStories.unshift(newStory);

    return newStory;
  }

  async deleteStory(user, storyId) {
    const story = user.ownStories.find((val) => val.storyId === storyId);
    const res = await axios.delete(`${BASE_URL}/stories/${story.storyId}`, { params: { token: user.loginToken } });
    user.removeOwnStory(res.data.story.storyId);
  }
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */
class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({ username, name, createdAt, favorites = [], ownStories = [] }, token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map((s) => new Story(s, true));
    this.ownStories = ownStories.map((s) => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Update user information with passed data or with an http request */
  async updateUser(arg) {
    let data;

    // if no data passed, get data from server
    if (!arg) {
      data = await axios.get(`${BASE_URL}/users/${this.username}`, { params: { token: this.loginToken } });
    } else {
      data = arg;
    }
    const newData = data.data.user;

    this.name = newData.name;
    this.favorites = mapStories(newData.favorites);
    this.ownStories = mapStories(newData.stories);
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */
  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */
  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */
  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  mapStories(arg) {
    return arg.map((s) => new Story(s));
  }

  async toggleFavorite(storyId) {
    let res;
    console.log(storyId);
    const storyIndex = currentUser.favorites.findIndex((val) => val.storyId === storyId);

    if (storyIndex > -1) {
      res = await axios.delete(`${BASE_URL}/users/${currentUser.username}/favorites/${storyId}`, { params: { token: currentUser.loginToken } });
    } else {
      res = await axios.post(`${BASE_URL}/users/${currentUser.username}/favorites/${storyId}`, {
        token: currentUser.loginToken,
      });
    }
    this.favorites = this.mapStories(res.data.user.favorites);
  }

  removeOwnStory(id) {
    const storyIndex = this.ownStories.findIndex((val) => val.storyId === id);
    console.log(storyIndex);
    this.ownStories.pop(storyIndex, 1);
  }

  // API keeps returning 401 despite sending exactly what is being requested if it returns 400
  async updateProfile(name) {
    console.log(this.loginToken);
    const res = await axios({
      url: `${BASE_URL}/users/${this.username}`,
      method: "PATCH",
      params: {
        user: {
          username: name,
          token: this.loginToken,
        },
      },
    });
  }
}
