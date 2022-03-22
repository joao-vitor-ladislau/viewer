/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import "./App.scss";

import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import type { ScreenViewport } from "@itwin/core-frontend";
import { FitViewTool, IModelApp, StandardViewId } from "@itwin/core-frontend";
import { FillCentered } from "@itwin/core-react";
import { ProgressLinear } from "@itwin/itwinui-react";
import {
  useAccessToken,
  Viewer,
  ViewerPerformance,
} from "@itwin/web-viewer-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import type { ExtensionProvider } from "./config";
import { appConfig, uiConfig } from "./config";
import extensions from "./extensions";
import { history } from "./history";

const App: React.FC = () => {
  const [iModelId, setIModelId] = useState(appConfig.iModelId);
  const [iTwinId, setITwinId] = useState(appConfig.iTwinId);

  const accessToken = useAccessToken();

  const authClient = useMemo(
    () =>
      new BrowserAuthorizationClient({
        scope: appConfig.auth.scope,
        clientId: appConfig.auth.clientId,
        redirectUri: appConfig.auth.redirectUri,
        postSignoutRedirectUri: appConfig.auth.postSignoutRedirectUri ?? "",
        responseType: "code",
        authority: appConfig.auth.authority ?? "",
      }),
    []
  );

  const login = useCallback(async () => {
    try {
      await authClient.signInSilent();
    } catch {
      await authClient.signIn();
    }
  }, [authClient]);

  useEffect(() => {
    void login();
  }, [login]);

  useEffect(() => {
    if (accessToken) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("iTwinId")) {
        setITwinId(urlParams.get("iTwinId") as string);
      } else {
        if (!appConfig.iTwinId) {
          throw new Error(
            "Please add a valid iTwinId to the appConfig object in the config.ts file or add it to the iTwinId query parameter in the url and refresh the page. See the README for more information."
          );
        }
      }

      if (urlParams.has("iModelId")) {
        setIModelId(urlParams.get("iModelId") as string);
      } else {
        if (!appConfig.iModelId) {
          throw new Error(
            "Please add a valid iModelId to the appConfig object in the config.ts file or add it to the iTwinId query parameter in the url and refresh the page. See the README for more information."
          );
        }
      }
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && iTwinId && iModelId) {
      history.push(`?iTwinId=${iTwinId}&iModelId=${iModelId}`);
    }
  }, [accessToken, iTwinId, iModelId]);

  /** NOTE: This function will execute the "Fit View" tool after the iModel is loaded into the Viewer.
   * This will provide an "optimal" view of the model. However, it will override any default views that are
   * stored in the iModel. Delete this function and the prop that it is passed to if you prefer
   * to honor default views when they are present instead (the Viewer will still apply a similar function to iModels that do not have a default view).
   */
  const viewConfiguration = useCallback((viewPort: ScreenViewport) => {
    // default execute the fitview tool and use the iso standard view after tile trees are loaded
    const tileTreesLoaded = () => {
      return new Promise((resolve, reject) => {
        const start = new Date();
        const intvl = setInterval(() => {
          if (viewPort.areAllTileTreesLoaded) {
            ViewerPerformance.addMark("TilesLoaded");
            void ViewerPerformance.addAndLogMeasure(
              "TileTreesLoaded",
              "ViewerStarting",
              "TilesLoaded",
              viewPort.numReadyTiles
            );
            clearInterval(intvl);
            resolve(true);
          }
          const now = new Date();
          // after 20 seconds, stop waiting and fit the view
          if (now.getTime() - start.getTime() > 20000) {
            reject();
          }
        }, 100);
      });
    };

    tileTreesLoaded().finally(() => {
      void IModelApp.tools.run(FitViewTool.toolId, viewPort, true, false);
      viewPort.view.setStandardRotation(StandardViewId.Iso);
    });
  }, []);

  const viewCreatorOptions = useMemo(
    () => ({ viewportConfigurer: viewConfiguration }),
    [viewConfiguration]
  );

  const onIModelAppInit = useCallback(async () => {
    const initFns = extensions.map(
      (extension: ExtensionProvider) => extension.initFn && extension.initFn()
    );
    return await Promise.all(initFns);
  }, []);

  return (
    <div className="viewer-container">
      {!accessToken && (
        <FillCentered>
          <div className="signin-content">
            <ProgressLinear indeterminate={true} labels={["Signing in..."]} />
          </div>
        </FillCentered>
      )}
      <Viewer
        iTwinId={iTwinId}
        iModelId={iModelId}
        authClient={authClient}
        viewCreatorOptions={viewCreatorOptions}
        enablePerformanceMonitors={true} // see description in the README (https://www.npmjs.com/package/@itwin/desktop-viewer-react)
        defaultUiConfig={{ hideDefaultStatusBar: !uiConfig.statusBar }}
        uiProviders={extensions.map(
          (extension: ExtensionProvider) => extension.provider
        )}
        onIModelAppInit={onIModelAppInit}
      />
    </div>
  );
};

export default App;
