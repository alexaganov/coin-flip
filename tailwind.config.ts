import { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: ["./src/**/*.{ts,js,tsx,jsx}", "./index.html"],
  theme: {
    extend: {
      keyframes: {
        "move-bg-full-bottom": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 100%" },
        },
        "move-bg-full-right": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "100% 0" },
        },
        "move-bg-full-left": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "-100% 0" },
        },
      },
    },
  },
  plugins: [
    plugin(({ matchUtilities, theme, addComponents, addUtilities }) => {
      addComponents({
        ".button-group": {
          display: "flex",
          padding: "1px",

          "& > *": {
            margin: "-1px",
          },
        },
      });

      matchUtilities(
        {
          "nb-shadow": (value) => {
            const length = Number(value);

            return {
              boxShadow: `${value}px ${value}px var(--tw-shadow-color)`,
              // Array.from({ length }, (_, i) => {
              //   const offset = i + 1;

              //   return `${offset}px ${offset}px var(--tw-shadow-color)`;
              // }).join(", "),
              // "linear-gradient(currentcolor 2px, transparent 2px), linear-gradient(to right, currentcolor 2px, transparent 2px)",
              // backgroundSize: `${value} ${value}`,
            };
          },
        },
        {
          values: {
            1: 1,
            2: 2,
            4: 4,
          },
        }
      );

      matchUtilities(
        {
          "pattern-boxes": (value) => ({
            backgroundImage:
              "linear-gradient(currentcolor 2px, transparent 2px), linear-gradient(to right, currentcolor 2px, transparent 2px)",
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
