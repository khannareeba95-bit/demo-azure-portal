let uri = window.location.origin;

if (window.location.href.includes("localhost")) {
  uri = "http://localhost:3000";
}
const AuthConfig = {
  Auth: {
    identityPoolId: "ap-south-1:a4bcb78f-278f-4f4c-80a3-61bc434fb0bf",
    region: "ap-south-1",
    userPoolId: "ap-south-1_cDQo1I0VD",
    userPoolWebClientId: "45d44vo7tuap8rtsm6vpar8kvd",
  },
  oauth: {
    domain: "ap-south-1cdqo1i0vd.auth.ap-south-1.amazoncognito.com",
    scope: [
      "phone",
      "email",
      "profile",
      "openid",
      "aws.cognito.signin.user.admin",
    ],
    redirectSignIn: uri,
    redirectSignOut: uri,
    responseType: "token",
  },
};

export default AuthConfig;
