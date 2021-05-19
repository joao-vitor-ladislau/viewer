/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import "@testing-library/jest-dom/extend-expect";

import { SnapshotConnection } from "@bentley/imodeljs-frontend";
import { UiCore } from "@bentley/ui-core";
import { render, waitFor } from "@testing-library/react";
import React from "react";

import { BaseViewer } from "../..";
import { BaseInitializer } from "../../services/BaseInitializer";
import * as IModelService from "../../services/iModel/IModelService";
import { IModelBackend, IModelBackendOptions } from "../../types";

jest.mock("../../services/iModel/IModelService");
jest.mock("@bentley/ui-framework");
jest.mock("@bentley/presentation-frontend");
jest.mock("react-i18next");

jest.mock("@microsoft/applicationinsights-react-js", () => ({
  ReactPlugin: jest.fn(),
  withAITracking: (
    reactPlugin: any | undefined, // eslint-disable-line no-unused-vars
    component: any,
    componentName?: string, // eslint-disable-line no-unused-vars
    className?: string // eslint-disable-line no-unused-vars
  ) => component,
}));

jest.mock("@bentley/imodeljs-frontend", () => {
  return {
    IModelApp: {
      startup: jest.fn(),
      telemetry: {
        addClient: jest.fn(),
      },
      i18n: {
        registerNamespace: jest.fn().mockReturnValue({
          readFinished: jest.fn().mockResolvedValue(true),
        }),
        languageList: jest.fn().mockReturnValue(["en-US"]),
        unregisterNamespace: jest.fn(),
      },
      uiAdmin: {
        updateFeatureFlags: jest.fn(),
      },
      authorizationClient: {
        hasSignedIn: true,
        isAuthorized: true,
        onUserStateChanged: {
          addListener: jest.fn(),
        },
      },
    },
    SnapMode: {},
    ActivityMessageDetails: jest.fn(),
    PrimitiveTool: jest.fn(),
    NotificationManager: jest.fn(),
    Tool: jest.fn(),
    RemoteBriefcaseConnection: {
      open: jest.fn(),
    },
    SnapshotConnection: {
      openFile: jest.fn(),
    },
    ItemField: {},
    CompassMode: {},
    RotationMode: {},
    AccuDraw: class {},
    ToolAdmin: class {},
  };
});

jest.mock("../../services/telemetry/TelemetryService");
jest.mock("@bentley/property-grid-react");

const mockProjectId = "123";
const mockIModelId = "456";

describe("BaseViewer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (UiCore.initialized) {
      UiCore.terminate();
    }
  });

  it("loads the model loader for the specified contextId and iModelId", async () => {
    const { getByTestId } = render(
      <BaseViewer contextId={mockProjectId} iModelId={mockIModelId} />
    );

    const viewerContainer = await waitFor(() => getByTestId("loader-wrapper"));

    expect(viewerContainer).toBeInTheDocument();
  });

  it("queries the iModel with the provided changeSetId", async () => {
    const { getByTestId } = render(
      <BaseViewer
        contextId={mockProjectId}
        iModelId={mockIModelId}
        productId={"0000"}
        changeSetId={"123"}
      />
    );

    await waitFor(() => getByTestId("loader-wrapper"));

    expect(IModelService.openRemoteImodel).toHaveBeenCalledWith(
      mockProjectId,
      mockIModelId,
      "123"
    );
  });

  it("ensures that either a contextId/iModelId combination or a local snapshot is provided", async () => {
    const events = {
      onError: (event: ErrorEvent) => {
        event.preventDefault();
      },
    };

    jest.spyOn(events, "onError");

    window.addEventListener("error", events.onError);

    const { getByTestId } = render(<BaseViewer />);

    const loader = await waitFor(() => getByTestId("loader-wrapper"));

    expect(loader).not.toBeInTheDocument();
    expect(events.onError).toHaveBeenCalled();

    window.removeEventListener("error", events.onError);
  });

  it("renders and establishes a SnapshotConnection if a local snapshot is provided", async () => {
    const snapshotPath = "/path/to/snapshot";

    const { getByTestId } = render(<BaseViewer snapshotPath={snapshotPath} />);

    const loader = await waitFor(() => getByTestId("loader-wrapper"));

    expect(loader).toBeInTheDocument();
    expect(SnapshotConnection.openFile).toHaveBeenCalledWith(snapshotPath);
  });

  it("initializes the Viewer with the provided backend configuration", async () => {
    jest.spyOn(BaseInitializer, "initialize");

    const backendConfig: IModelBackendOptions = {
      hostedBackend: {
        title: IModelBackend.GeneralPurpose,
        version: "v2.0",
      },
    };

    const { getByTestId } = render(
      <BaseViewer
        contextId={mockProjectId}
        iModelId={mockIModelId}
        backend={backendConfig}
        productId={"0000"}
      />
    );

    const viewerContainer = await waitFor(() => getByTestId("loader-wrapper"));

    expect(viewerContainer).toBeInTheDocument();

    expect(BaseInitializer.initialize).toHaveBeenCalledWith({
      appInsightsKey: undefined,
      backend: backendConfig,
      imjsAppInsightsKey: undefined,
      productId: "0000",
    });
  });

  it("executes a callback after IModelApp is initialized", async () => {
    const callbacks = {
      onIModelAppInit: jest.fn(),
    };
    const { getByTestId } = render(
      <BaseViewer
        contextId={mockProjectId}
        iModelId={mockIModelId}
        onIModelAppInit={callbacks.onIModelAppInit}
      />
    );

    const loader = await waitFor(() => getByTestId("loader-wrapper"));

    expect(loader).toBeInTheDocument();
    expect(callbacks.onIModelAppInit).toHaveBeenCalled();
  });
});