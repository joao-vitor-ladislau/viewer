export const packageJson = {
  common: {
    dependencies: {
      "@itwin/core-telemetry": "^3.2.0-dev.14",
      "@itwin/appui-abstract": "^3.2.0-dev.14",
      "@itwin/appui-layout-react": "^3.2.0-dev.14",
      "@itwin/appui-react": "^3.2.0-dev.14",
      "@itwin/browser-authorization": "^0.5.1",
      "@itwin/components-react": "^3.2.0-dev.14",
      "@itwin/core-bentley": "^3.2.0-dev.14",
      "@itwin/core-common": "^3.2.0-dev.14",
      "@itwin/core-frontend": "^3.2.0-dev.14",
      "@itwin/core-geometry": "^3.2.0-dev.14",
      "@itwin/core-i18n": "^3.2.0-dev.14",
      "@itwin/core-markup": "^3.2.0-dev.14",
      "@itwin/core-orbitgt": "^3.2.0-dev.14",
      "@itwin/core-quantity": "^3.2.0-dev.14",
      "@itwin/core-react": "^3.2.0-dev.14",
      "@itwin/imodel-components-react": "^3.2.0-dev.14",
      "@itwin/imodels-access-frontend": "^1.0.1",
      "@itwin/imodels-client-management": "^1.0.1",
      "@itwin/itwinui-react": "^1.16.2",
      "@itwin/presentation-common": "^3.2.0-dev.14",
      "@itwin/presentation-frontend": "^3.2.0-dev.14",
      "@itwin/reality-data-client": "^0.7.0",
      "@itwin/web-viewer-react": "^3.0.0-dev.3",
      "@itwin/webgl-compatibility": "^3.2.0-dev.14",
      history: "^4.10.1",
      react: "^17.0.2",
      "react-dom": "^17.0.2",
      "react-redux": "^7.2.0",
    },
    devDependencies: {
      "@esbuild-plugins/node-globals-polyfill": "~0.1.1",
      "@esbuild-plugins/node-modules-polyfill": "~0.1.2",
      "@kckst8/vite-plugin-commonjs": "^0.1.0",
      "@testing-library/react": "^12.1.4",
      "@types/history": "^4.7.6",
      "@types/jest": "^27.4.1",
      "@types/node": "^14.0.19",
      "@types/react": "^17.0.9",
      "@types/react-dom": "^17.0.9",
      "@typescript-eslint/eslint-plugin": "^5.18.0",
      "@typescript-eslint/parser": "^5.18.0",
      "@vitejs/plugin-react": "^1.0.7",
      copyfiles: "^2.4.1",
      eslint: "^8.12.0",
      "eslint-plugin-react": "^7.29.4",
      jest: "^27.5.1",
      sass: "^1.49.9",
      typescript: "~4.4.0",
      vite: "^2.8.0",
    },
  },
  web: {
    dependencies: {
      "@itwin/web-viewer-react": "^3.0.0-dev.3",
    },
    scripts: {
      start: "vite",
      "copy-assets": "node scripts/copyAssets.mjs",
      build: "npm run copy-assets && vite build",
      preview: "npm run copy-assets && vite preview",
    },
    browserslist: [
      "last 4 chrome version",
      "last 4 firefox version",
      "last 4 safari version",
      "last 4 ios version",
      "last 4 ChromeAndroid version",
      "last 4 edge version",
      "not dead",
      "not <0.2%",
    ],
  },
  desktop: {
    main: "lib/backend/main.js",
    dependencies: {
      "@itwin/core-backend": "^3.2.0-dev.14",
      "@itwin/core-electron": "^3.2.0-dev.14",
      "@itwin/ecschema-metadata": "^3.2.0-dev.14",
      "@itwin/electron-authorization": "^0.8.3",
      "@itwin/express-server": "^3.2.0-dev.14",
      "@itwin/desktop-viewer-react": "^3.0.0-dev.3",
      "@itwin/imodel-browser-react": "^0.12.2",
      "@itwin/imodels-access-backend": "^1.0.0",
      "@itwin/itwinui-css": "^0.18.1",
      "@itwin/itwinui-icons-react": "^1.2.0",
      "@itwin/presentation-backend": "^3.2.0-dev.14",
      "@itwin/presentation-components": "^3.2.0-dev.14",
      "@itwin/presentation-frontend": "^3.2.0-dev.14",
      "@reach/router": "~1.3.4",
      "dotenv-flow": "^3.2.0",
      electron: "^14.0.0",
      minimist: "^1.2.5",
    },
    devDependencies: {
      "@itwin/build-tools": "^3.1.0-dev.42",
      "@types/electron-devtools-installer": "^2.2.0",
      "@types/minimist": "^1.2.0",
      "@types/reach__router": "~1.3.9",
      "cross-env": "^5.2.1",
      "electron-devtools-installer": "^2.2.3",
      "electron-reload": "^2.0.0-alpha.1",
      "npm-run-all": "^4.1.5",
    },
    browserslist: ["electron 8.0.0"],
    os: ["win32", "linux", "darwin"],
    engines: {
      node: ">=10.17.0 <15.0",
    },
    scripts: {
      "copy-assets": "node scripts/copyAssets.mjs",
      "electron:debug": "cross-env NODE_ENV=development electron .",
      build:
        "npm run -s copy-assets && npm run -s build:frontend && npm run -s build:backend",
      "build:backend": "tsc -p tsconfig.backend.json",
      "build:frontend": "tsc && vite build",
      start:
        'run-p "copy-assets" "start:backend" "start:frontend" "electron:debug"',
      "start:frontend": "vite",
      "start:backend": "tsc -p tsconfig.backend.json --watch",
    },
  },
};
