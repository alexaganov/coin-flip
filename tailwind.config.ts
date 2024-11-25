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
        "translate-b-full": {
          "95%": {
            transform: `translateY(0%)`,
          },
          "100%": {
            transform: `translateY(100%)`,
          },
        },
      },
    },
  },
  plugins: [
    plugin(({ matchUtilities, theme, addComponents, addUtilities }) => {
      addComponents({
        ".popover-content": {
          border: "2px solid #000",
          boxShadow: "4px 4px 0 #000",
          backgroundColor: "#fff",
        },
      });

      addComponents({
        ".neo-brut-text-shadow": {
          textShadow: Array.from({ length: 2 }, (_, i) => {
            const offset = i + 1;
            return `${offset - 0.5}px ${offset - 0.5}px black, ${offset}px ${offset}px black`;
          }).join(","),
        },
      });

      addComponents({
        ".btn": {
          "--btn-contrast-color": "#000",
          "--btn-shadow-offset": "0.25rem",
          "--btn-active-shadow-shift-ratio": "0.5",
          "--btn-active-shift":
            "calc(var(--btn-shadow-offset) * var(--btn-active-shadow-shift-ratio))",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          // TODO: add custom focus
          outline: "none",
          // prevents issue when translations causing shadow
          // element appear on top of all elements
          transform: "translateZ(0)",

          "&:disabled, &-disabled, &-muted": {
            // "--btn-contrast-color": "#777",
            // background: "#777",
            // color:
          },

          "&:where(&:disabled, &-disabled, &-muted) &-content": {
            backgroundColor: "#ddd",
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
            transition: "all 0.1s ease-in-out",
            background: "#fff",
          },

          "&-sm :where(&-content)": {
            minWidth: "2.5rem",
            minHeight: "2.5rem",
            padding: "0 0.5rem",
          },

          [[
            "&:active &-content, &-active &-content",
            "&:disabled &-content, &-disabled &-content",
          ].join(",")]: {
            transform: `translate3d(var(--btn-active-shift), var(--btn-active-shift), 0)`,
          },

          [[
            "&:active &-shadow, &-active &-shadow",
            "&:disabled &-shadow, &-disabled &-shadow",
          ].join(",")]: {
            "&:after": {
              transform:
                "scale(calc(1 - var(--btn-active-shadow-shift-ratio)))",
            },
            "&:before": {
              transform:
                "scale(calc(1 - var(--btn-active-shadow-shift-ratio)))",
            },
          },

          "&-shadow": {
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "var(--btn-contrast-color)",
            left: "var(--btn-shadow-offset)",
            top: "var(--btn-shadow-offset)",
            zIndex: "-1",

            "&:after": {
              content: "''",
              position: "absolute",
              transformOrigin: "right bottom",
              top: "calc(var(--btn-shadow-offset) * -1)",
              right: "0",
              width: "var(--btn-shadow-offset)",
              height: "var(--btn-shadow-offset)",
              // prevents issues when on io transition is not animated
              transform: "translateZ(0)",
              backgroundImage:
                "linear-gradient(to top right, var(--btn-contrast-color) 0%, var(--btn-contrast-color) 50%, transparent 50%, transparent 100%)",
              transition: "all 0.1s ease-in-out",
            },

            "&:before": {
              content: "''",
              position: "absolute",
              bottom: "0",
              left: "calc(var(--btn-shadow-offset) * -1)",
              width: "var(--btn-shadow-offset)",
              height: "var(--btn-shadow-offset)",
              // prevents issues when on io transition is not animated
              transform: "translateZ(0)",
              backgroundImage:
                "linear-gradient(to bottom left, var(--btn-contrast-color) 0%, var(--btn-contrast-color) 50%, transparent 50%, transparent 100%)",
              transition: "all 0.1s ease-in-out",
              transformOrigin: "right bottom",
            },
          },
        },
      });

      addComponents({
        ".neo-brut-card": {
          "--neo-brut-border-width": "2px",

          position: "relative",
          border: "var(--neo-brut-border-width) solid #000",
          backgroundColor: "#fff",
        },
      });

      addComponents({
        ".neo-brut-shadow": {
          "--neo-brut-shadow-color": "#000",
          "--neo-brut-shadow-offset": "0.25rem",

          margin: "calc(var(--neo-brut-border-width, 0) * -1)",
          top: "0",
          left: "0",
          bottom: "0",
          right: "0",
          position: "absolute",
          // width: "100%",
          // height: "100%",
          backgroundColor: "var(--neo-brut-shadow-color)",
          transform: `translate3d(var(--neo-brut-shadow-offset), var(--neo-brut-shadow-offset), 0)`,
          zIndex: "-1",

          "&:after": {
            content: "''",
            position: "absolute",
            transformOrigin: "right bottom",
            top: "calc(var(--neo-brut-shadow-offset) * -1)",
            right: "0",
            width: "var(--neo-brut-shadow-offset)",
            height: "var(--neo-brut-shadow-offset)",
            // prevents issues when on io transition is not animated
            transform: "translateZ(0)",
            backgroundImage:
              "linear-gradient(to top right, var(--neo-brut-shadow-color) 0%, var(--neo-brut-shadow-color) 50%, transparent 50%, transparent 100%)",
            transition: "all 0.1s ease-in-out",
          },

          "&:before": {
            content: "''",
            position: "absolute",
            bottom: "0",
            left: "calc(var(--neo-brut-shadow-offset) * -1)",
            width: "var(--neo-brut-shadow-offset)",
            height: "var(--neo-brut-shadow-offset)",
            // prevents issues when on io transition is not animated
            transform: "translateZ(0)",
            backgroundImage:
              "linear-gradient(to bottom left, var(--neo-brut-shadow-color) 0%, var(--neo-brut-shadow-color) 50%, transparent 50%, transparent 100%)",
            transition: "all 0.1s ease-in-out",
            transformOrigin: "right bottom",
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
