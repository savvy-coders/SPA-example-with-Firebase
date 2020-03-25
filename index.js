import { Header, Nav, Main, Footer } from "./components";
import * as state from "./store";
import Navigo from "navigo";
import { capitalize } from "lodash";
import axios from "axios";
import "./env";
import { auth, db } from "./firebase";

const coll = db.collection("doggoPics");

// ROUTER //
const router = new Navigo(window.location.origin);
router
  .on({
    ":page": params => render(state[capitalize(params.page)]),
    "/": () => render(state.Home)
  })
  .resolve();

// API CALLS //
// get blog posts from json placeholder API
axios
  .get("https://jsonplaceholder.typicode.com/posts")
  .then(response => {
    response.data.forEach(post => {
      state.Blog.posts.push(post);
    });
    const params = router.lastRouteResolved().params;
    if (params) {
      render(state[params.page]);
    }
  })
  .catch(err => console.log(err));

// get current St. Louis weather from open weather map API
axios
  .get(
    `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.OWM_API_KEY}&q=st.%20louis`
  )
  .then(response => {
    state.Home.weather.city = response.data.name;
    state.Home.weather.temp = response.data.main.temp;
    state.Home.weather.feelsLike = response.data.main.feels_like;
    state.Home.weather.description = response.data.weather[0].main;
  })
  .catch(err => console.log(err));

// // get github repo data
// axios
//   .get(`https://api.github.com/users/${process.env.GITHUB_USERNAME}/repos`, {
//     headers: {
//       Authorization: `token ${process.env.GITHUB_TOKEN}`
//     }
//   })
//   .then(response => console.log(response.data));

function render(st = state.Home) {
  // console.log("rendering state", st);
  // console.log("state.Blog", state.Blog);
  document.querySelector("#root").innerHTML = `
  ${Header(st)}
  ${Nav(state.Links)}
  ${Main(st)}
  ${Footer()}
`;

  router.updatePageLinks();
  addSiteListeners(st);
}

function addSiteListeners(st) {
  addLogInAndOutListener(state.User);
  listenForAuthChange();
  addNavEventListeners();
  listenForRegister(st);
  listenForSignIn(st);
  getDoggoPics(st);
  addPicOnFormSubmit(st);
  removePic(st);
}

// FUNCTIONS & EVENT LISTENERS
function addLogInAndOutListener(user) {
  // select link in header
  document.querySelector("header a").addEventListener("click", event => {
    // if user is logged in,
    if (user.loggedIn) {
      event.preventDefault();
      // log out functionality
      auth.signOut().then(() => {
        console.log("user logged out");
        logOutUserInDb(user.email);
        resetUserInState();
        //update user in database
        db.collection("users").get;
        render(state.Home);
      });
      console.log(state.User);
    }
    // if user is logged out, clicking the link will render sign in page (handled by <a>'s href)
  });
}
function logOutUserInDb(email) {
  if (state.User.loggedIn) {
    db.collection("users")
      .get()
      .then(snapshot =>
        snapshot.docs.forEach(doc => {
          if (email === doc.data().email) {
            let id = doc.id;
            db.collection("users")
              .doc(id)
              .update({ signedIn: false });
          }
        })
      );
    console.log("user signed out in db");
  }
}
function resetUserInState() {
  state.User.username = "";
  state.User.firstName = "";
  state.User.lastName = "";
  state.User.email = "";
  state.User.loggedIn = false;
}

function listenForAuthChange() {
  // log user object from auth if a user is signed in
  auth.onAuthStateChanged(user => (user ? console.log(user) : ""));
}

function addNavEventListeners() {
  // add menu toggle to bars icon in nav bar
  document
    .querySelector(".fa-bars")
    .addEventListener("click", () =>
      document.querySelector("nav > ul").classList.toggle("hidden--mobile")
    );
}

function listenForRegister(st) {
  if (st.view === "Register") {
    document.querySelector("form").addEventListener("submit", event => {
      event.preventDefault();
      // convert HTML elements to Array
      let inputList = Array.from(event.target.elements);
      // remove submit button from list
      inputList.pop();
      const inputs = inputList.map(input => input.value);
      let firstName = inputs[0];
      let lastName = inputs[1];
      let email = inputs[2];
      let password = inputs[3];

      //create user in Firebase
      auth.createUserWithEmailAndPassword(email, password).then(response => {
        console.log("user registered");
        console.log(response);
        console.log(response.user);
        addUserToStateAndDb(firstName, lastName, email, password);
        render(state.Home);
      });
    });
  }
}
function addUserToStateAndDb(first, last, email, pass) {
  state.User.username = first + last;
  state.User.firstName = first;
  state.User.lastName = last;
  state.User.email = email;
  state.User.loggedIn = true;

  db.collection("users").add({
    firstName: first,
    lastName: last,
    email: email,
    password: pass,
    signedIn: true
  });
}

function listenForSignIn(st) {
  if (st.view === "Signin") {
    document.querySelector("form").addEventListener("submit", event => {
      event.preventDefault();
      // convert HTML elements to Array
      let inputList = Array.from(event.target.elements);
      // remove submit button from list
      inputList.pop();
      const inputs = inputList.map(input => input.value);
      let email = inputs[0];
      let password = inputs[1];
      auth.signInWithEmailAndPassword(email, password).then(() => {
        console.log("user signed in");
        getUserFromDb(email).then(() => render(state.Home));
      });
    });
  }
}
function getUserFromDb(email) {
  return db
    .collection("users")
    .get()
    .then(snapshot =>
      snapshot.docs.forEach(doc => {
        if (email === doc.data().email) {
          let id = doc.id;
          db.collection("users")
            .doc(id)
            .update({ signedIn: true });
          console.log("user signed in in db");
          let user = doc.data();
          state.User.username = user.firstName + user.lastName;
          state.User.firstName = user.firstName;
          state.User.lastName = user.lastName;
          state.User.email = email;
          state.User.loggedIn = true;
          console.log(state.User);
        }
      })
    );
}

let initialGetPicture = true;
function getDoggoPics(st) {
  if (st.view === "Gallery" || st.view === "Form") {
    db.collection("doggoPics")
      .get()
      .then(snapshot => {
        state.Gallery.pictures = snapshot.docs.map(doc => doc.data());
        if (initialGetPicture) {
          initialGetPicture = false;
          const params = router.lastRouteResolved().params;
          render(state[params.page]);
        }
      });
  }
}
function addPicOnFormSubmit(st) {
  if (st.view === "Form") {
    // console.log("before submit", state.Gallery.pictures);
    document.querySelector("#addPhoto").addEventListener("submit", event => {
      event.preventDefault();
      // convert HTML elements to Array
      let inputList = Array.from(event.target.elements);
      // remove submit button from list
      inputList.pop();
      // construct new picture object
      let newPic = inputList.reduce((pictureObject, input) => {
        pictureObject[input.name] = input.value;
        return pictureObject;
      }, {});
      // add new picture to Firebase collection
      coll
        .add(newPic)
        .then(() => getDoggoPics(st))
        .then(() => clearSubmittedForm());
    });
  }
}

function removePic(st) {
  if (st.view === "Form") {
    document.querySelector("#removePhoto").addEventListener("submit", event => {
      event.preventDefault();
      // convert HTML elements to Array
      let inputList = Array.from(event.target.elements);
      let url = inputList[0].value;
      db.collection("doggoPics")
        .get()
        .then(snapshot =>
          snapshot.docs.forEach(doc => {
            if (url === doc.data().url) {
              let id = doc.id;
              db.collection("doggoPics")
                .doc(id)
                .delete()
                .then(() => getDoggoPics(st))
                .then(() => clearSubmittedForm());
            }
          })
        );
    });
  }
}

function clearSubmittedForm() {
  document.querySelectorAll("input").forEach(input => {
    if (input.type !== "submit") {
      input.value = "";
    }
  });
}
