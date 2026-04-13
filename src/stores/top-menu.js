import { atom } from "recoil";

const topMenu = atom({
  key: "topMenu",
  default: {
    menu: [
      {
        icon: "Home",
        title: "Dashboard",
        pathname: "/",
      },
    ],
  },
});

export { topMenu };
