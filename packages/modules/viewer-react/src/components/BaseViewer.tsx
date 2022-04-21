/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { FillCentered } from "@itwin/core-react";
import { ErrorBoundary } from "@itwin/error-handling-react";
import React from "react";

import { useAccessToken } from "../hooks/useAccessToken";
import { useBaseViewerInitializer } from "../hooks/useBaseViewerInitializer";
import type {
  BlankViewerProps,
  ConnectedViewerProps,
  FileViewerProps,
  ViewerCommonProps,
} from "../types";
import IModelLoader from "./iModel/IModelLoader";

type ViewerProps = (ConnectedViewerProps | FileViewerProps | BlankViewerProps) &
  ViewerCommonProps;

export const BaseViewer = ({
  productId,
  i18nUrlTemplate,
  onIModelAppInit,
  additionalI18nNamespaces,
  additionalRpcInterfaces,
  enablePerformanceMonitors,
  ...loaderProps
}: ViewerProps) => {
  const viewerInitialized = useBaseViewerInitializer({
    productId,
    i18nUrlTemplate,
    onIModelAppInit,
    additionalI18nNamespaces,
    additionalRpcInterfaces,
    enablePerformanceMonitors,
  });

  const accessToken = useAccessToken();
  return (
    <ErrorBoundary>
      {("filePath" in loaderProps && loaderProps.filePath) || accessToken ? (
        viewerInitialized ? (
          <IModelLoader {...loaderProps} />
        ) : (
          <FillCentered>initializing...</FillCentered>
        )
      ) : (
        <FillCentered>Please sign in.</FillCentered>
      )}
    </ErrorBoundary>
  );
};
