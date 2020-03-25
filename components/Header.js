import { User } from "../store";

export default st => `
<header>
  <h1>Example SPA: ${st.header}</h1>
  <a href="${!User.loggedIn ? "/Signin" : "/"}">${
  !User.loggedIn ? "LOG IN" : "LOG OUT"
}</a>
</header>
`;
