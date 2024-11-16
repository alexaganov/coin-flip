import { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: ["./src/**/*.{ts,js,tsx,jsx}", "./index.html"],
  theme: {
    extend: {},
  },

  plugins: [
    plugin(({ addBase, addUtilities }) => {
      addUtilities({
        ".flex-center": {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
      });

      addBase({
        ".mask-image-fade-x": {
          "mask-image":
            "linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 1) 90%, rgba(0, 0, 0, 0) 100%)",
        },
      });
    }),
  ],
};

export default config;
