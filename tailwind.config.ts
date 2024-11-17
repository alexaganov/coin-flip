import { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: ["./src/**/*.{ts,js,tsx,jsx}", "./index.html"],
  theme: {
    extend: {},
  },

  plugins: [
    plugin(({ matchUtilities, theme, addUtilities }) => {
      matchUtilities(
        {
          "pattern-boxes": (value) => ({
            backgroundImage:
              "linear-gradient(currentcolor 1px, transparent 1px), linear-gradient(to right, currentcolor 1px, transparent 1px)",
            backgroundSize: `${value} ${value}`,
          }),
        },
        {
          values: theme("spacing"),
        }
      );

      addUtilities({
        ".flex-center": {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
        ".mask-image-fade-x": {
          "mask-image":
            "linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 1) 90%, rgba(0, 0, 0, 0) 100%)",
        },
        ".mask-image-fade-t": {
          "mask-image":
            "linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%)",
        },
        ".mask-image-fade-r": {
          "mask-image":
            "linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%)",
        },
      });
    }),
  ],
};

export default config;
