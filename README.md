# 3D Coin Flip Simulator

## TODO

- [x] Rotate coin before it hit the ground to make label look in direction of the camera (when outcome is different label will look in opposite direction)
- [x] When coin is on the ground return it on initial position but with current face looking at the camera (right now it's always head as initial position)
- [ ] Improve environment (right now it's too plain)
- [ ] Add proper 3d coin model
- [ ] Add symbols for each side of the 3d coin
- [ ] Add effects to the 3d coin model (shine, reflection etc.)
- [ ] Refactor to improve readability (too much code in single file)
- [ ] Add ability to embed via iframe
- [x] Move camera closer to coin when it's on the ground
- [ ] Add tutorial to show available controls
- [ ] Add sound for rotation
- [x] Add ability to rotate coin on click

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json', './tsconfig.app.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

