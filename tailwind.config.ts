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
        ".btn": {
          "--btn-contrast-color": "#000",
          // '--btn-contrast-muted-color': "#777",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",

          "&:disabled, &-disabled, &-muted": {
            "--btn-contrast-color": "#777",
            color: "var(--btn-contrast-color)",
          },

          // "&:disabled &-shadow, &-disabled &-shadow": {
          //   backgroundColor: "#777",
          // },

          "&:disabled &-content, &-disabled &-content": {
            transform: `translate3d(0.125rem, 0.125rem, 0)`,
          },

          "&-content": {
            position: "relative",
            width: "100%",
            padding: "0 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "3.75rem",
            minHeight: "3.75rem",
            border: "2px solid var(--btn-contrast-color)",
            transition: "all 0.1s ease-out",
            background: "#fff",
          },

          "&:active &-content, &-active &-content": {
            transform: `translate3d(0.125rem, 0.125rem, 0)`,
          },

          "&-shadow": {
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "var(--btn-contrast-color)",
            transform: `translate3d(0.25rem, 0.25rem, 0)`,
            zIndex: "-1",
          },
        },
      });

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
          "pattern-grid": (value) => ({
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
