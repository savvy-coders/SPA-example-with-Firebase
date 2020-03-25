export default () => `
<section id="register">
  <form action="" method="POST">
    <label for="firstName">First Name: </label>
    <input type="text" name="firstName" id="firstName" placeholder="First name">

    <label for="lastName">Last Name: </label>
    <input type="text" name="lastName" id="lastName" placeholder="Last name">

    <label for="email">Email: </label>
    <input type="email" name="email" id="email" placeholder="your@email.here">

    <label for="password">Password: </label>
    <input type="password" name="password" id="password">

    <input type="submit" id="register-button" value="Register">
  </form>
</section>
`;
