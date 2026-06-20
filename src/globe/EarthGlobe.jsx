import {
  ArcGISTiledElevationTerrainProvider,
  BoundingSphere,
  Cartesian2,
  Cartesian3,
  Color,
  DistanceDisplayCondition,
  GeoJsonDataSource,
  HeightReference,
  HeadingPitchRange,
  HorizontalOrigin,
  ImageryLayer,
  Matrix4,
  Math as CesiumMath,
  PolylineDashMaterialProperty,
  PolylineGlowMaterialProperty,
  SceneMode,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  UrlTemplateImageryProvider,
  VerticalOrigin,
  Viewer
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import {
  Box,
  Compass,
  Home,
  Layers2,
  Map as MapIcon,
  Minus,
  MoveDown,
  MoveLeft,
  MoveRight,
  MoveUp,
  Pause,
  Play,
  Plus,
  RotateCw
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { isLayerEnabled } from "../earth/layerRegistry.js";
import { prefersReducedMotion, publicEnv } from "../utils/env.js";

const initialCamera = publicEnv.defaultCamera;
const globalCameraPitch = -90;

const terrainUrl =
  "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer";

const navigationStepRatio = 0.22;

const layerStyles = {
  "rv-installations": {
    color: "#2dd4bf",
    label: "#06111f"
  },
  "rv-midstream-construction": {
    color: "#ff4d57",
    label: "#ffffff"
  },
  "rv-midstream-project": {
    color: "#a78bfa",
    label: "#ffffff"
  },
  "rv-transport-pipelines": {
    color: "#38bdf8",
    label: "#06111f"
  },
  "rv-ypf-pipelines": {
    color: "#fbbf24",
    label: "#06111f"
  }
};

function styleForLayer(layerId) {
  return layerStyles[layerId] ?? layerStyles["rv-installations"];
}

function colorForLayer(layerId, alpha = 1) {
  return Color.fromAlpha(Color.fromCssColorString(styleForLayer(layerId).color), alpha);
}

function parseDiameter(value) {
  if (!value) {
    return null;
  }

  const match = String(value).match(/[0-9]+(?:[.,][0-9]+)?/);
  return match ? Number(match[0].replace(",", ".")) : null;
}

function formatRouteQuality(value) {
  return value === "endpoints-resueltos"
    ? "Extremos resueltos por atributos"
    : "Traza derivada por atributos";
}

function installationDescription(item) {
  return `
    <strong>${item.name}</strong><br />
    ${item.type}<br />
    Estado: ${item.status}<br />
    Fuente: ${item.sourceFile}
  `;
}

function pipelineDescription(item) {
  return `
    <strong>${item.name}</strong><br />
    ${item.origin || "Origen s/d"} -> ${item.destination || "Destino s/d"}<br />
    Estado: ${item.status}<br />
    Fuente: ${item.sourceFile}<br />
    ${formatRouteQuality(item.geometryQuality)}
  `;
}

function routePositions(coordinates) {
  return Cartesian3.fromDegreesArray(coordinates.flatMap(([lng, lat]) => [lng, lat]));
}

function routeMidpoint(coordinates) {
  const index = Math.floor(coordinates.length / 2);
  return coordinates[index] ?? coordinates[0];
}

function featureSphere(feature) {
  const coordinates =
    feature.kind === "pipeline" ? feature.coordinates : [feature.coordinates];
  return BoundingSphere.fromPoints(
    coordinates.map(([lng, lat]) => Cartesian3.fromDegrees(lng, lat, 0))
  );
}

function featureRange(feature) {
  if (feature.kind !== "pipeline") {
    return 28_000;
  }

  const lngs = feature.coordinates.map(([lng]) => lng);
  const lats = feature.coordinates.map(([, lat]) => lat);
  const span = Math.hypot(
    Math.max(...lngs) - Math.min(...lngs),
    Math.max(...lats) - Math.min(...lats)
  );

  return Math.min(4_200_000, Math.max(55_000, span * 180_000));
}

function makeInstallationEntity(item, selectedId) {
  const selected = item.id === selectedId;
  const color = colorForLayer(item.layerId);

  return {
    id: `installation-${item.id}`,
    name: item.name,
    position: Cartesian3.fromDegrees(item.coordinates[0], item.coordinates[1], 120),
    description: installationDescription(item),
    point: {
      color,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      heightReference: HeightReference.RELATIVE_TO_GROUND,
      outlineColor: selected ? Color.WHITE : Color.fromCssColorString("#06111f"),
      outlineWidth: selected ? 3 : 2,
      pixelSize: selected ? 17 : 11
    },
    ellipse: {
      distanceDisplayCondition: new DistanceDisplayCondition(0, 1_500_000),
      height: 80,
      heightReference: HeightReference.RELATIVE_TO_GROUND,
      material: Color.fromAlpha(color, selected ? 0.22 : 0.1),
      outline: true,
      outlineColor: Color.fromAlpha(color, selected ? 0.82 : 0.46),
      semiMajorAxis: selected ? 3_200 : 1_650,
      semiMinorAxis: selected ? 3_200 : 1_650
    },
    label: {
      backgroundColor: selected
        ? Color.fromAlpha(color, 0.96)
        : Color.fromCssColorString("rgba(5, 13, 24, 0.78)"),
      backgroundPadding: new Cartesian2(8, 5),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      distanceDisplayCondition: new DistanceDisplayCondition(
        0,
        selected ? 2_800_000 : 180_000
      ),
      fillColor: selected
        ? Color.fromCssColorString(styleForLayer(item.layerId).label)
        : Color.WHITE,
      font: selected ? "850 13px Inter, sans-serif" : "800 11px Inter, sans-serif",
      horizontalOrigin: HorizontalOrigin.CENTER,
      pixelOffset: new Cartesian2(0, selected ? -31 : -24),
      showBackground: true,
      text: item.name,
      verticalOrigin: VerticalOrigin.BOTTOM
    }
  };
}

function makePipelineEntity(item, selectedId) {
  const selected = item.id === selectedId;
  const color = colorForLayer(item.layerId, selected ? 1 : 0.82);
  const diameter = parseDiameter(item.diameter);
  const midpoint = routeMidpoint(item.coordinates);
  const material =
    item.geometryQuality === "endpoints-resueltos"
      ? new PolylineGlowMaterialProperty({
          color,
          glowPower: selected ? 0.2 : 0.12,
          taperPower: 0.72
        })
      : new PolylineDashMaterialProperty({
          color,
          dashLength: 18
        });

  return {
    id: `pipeline-${item.id}`,
    name: item.name,
    position: Cartesian3.fromDegrees(midpoint[0], midpoint[1], 500),
    description: pipelineDescription(item),
    polyline: {
      clampToGround: true,
      distanceDisplayCondition: new DistanceDisplayCondition(0, 12_000_000),
      material,
      positions: routePositions(item.coordinates),
      width: selected ? 6.8 : Math.min(5.4, Math.max(2.2, 2 + (diameter ?? 4) * 0.12))
    },
    label: {
      backgroundColor: Color.fromCssColorString("rgba(5, 13, 24, 0.84)"),
      backgroundPadding: new Cartesian2(8, 5),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      distanceDisplayCondition: new DistanceDisplayCondition(
        0,
        selected ? 4_500_000 : 900_000
      ),
      fillColor: selected ? color : Color.WHITE,
      font: selected ? "850 12px Inter, sans-serif" : "800 10px Inter, sans-serif",
      horizontalOrigin: HorizontalOrigin.CENTER,
      pixelOffset: new Cartesian2(0, -16),
      show: selected,
      showBackground: true,
      text: item.name,
      verticalOrigin: VerticalOrigin.BOTTOM
    }
  };
}

function setGlobalCameraView(viewer) {
  viewer.camera.cancelFlight();
  if (viewer.scene.mode === SceneMode.MORPHING) {
    viewer.scene.completeMorph();
  }
  if (viewer.scene.mode !== SceneMode.SCENE3D) {
    viewer.scene.morphTo3D(0);
  }
  viewer.camera.lookAtTransform(Matrix4.IDENTITY);
  viewer.camera.setView({
    destination: Cartesian3.fromDegrees(
      initialCamera.lng,
      initialCamera.lat,
      initialCamera.height
    ),
    orientation: {
      heading: CesiumMath.toRadians(0),
      pitch: CesiumMath.toRadians(globalCameraPitch),
      roll: 0
    }
  });
  viewer.scene.requestRender();
}

function flyToFrame(viewer, frame, duration) {
  return new Promise((resolve) => {
    viewer.camera.flyTo({
      cancel: resolve,
      complete: resolve,
      destination: Cartesian3.fromDegrees(frame.lng, frame.lat, frame.height),
      duration,
      orientation: {
        heading: CesiumMath.toRadians(frame.heading ?? 0),
        pitch: CesiumMath.toRadians(frame.pitch ?? -60),
        roll: 0
      }
    });
  });
}

function flyToFeature(viewer, feature, duration) {
  viewer.camera.flyToBoundingSphere(featureSphere(feature), {
    duration,
    offset: new HeadingPitchRange(
      CesiumMath.toRadians(0),
      CesiumMath.toRadians(feature.kind === "pipeline" ? -62 : -52),
      featureRange(feature)
    )
  });
}

export default function EarthGlobe({
  cameraCommand,
  focusKey,
  installations,
  layerVisibility,
  onCameraStateChange,
  onReady,
  onSelectFeature,
  performanceMode = false,
  pipelines,
  selectedFeature
}) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const handlerRef = useRef(null);
  const autoRotateRef = useRef(false);
  const dataSourcesRef = useRef(new Map());
  const entitiesRef = useRef(new Map());
  const featureMapRef = useRef(new Map());
  const layerVisibilityRef = useRef(layerVisibility);
  const onCameraStateChangeRef = useRef(onCameraStateChange);
  const onReadyRef = useRef(onReady);
  const onSelectFeatureRef = useRef(onSelectFeature);
  const lastFocusKeyRef = useRef(focusKey);
  const tourRunRef = useRef(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [viewMode, setViewMode] = useState("3d");
  const selectedId = selectedFeature?.id;

  const featureMap = useMemo(() => {
    return new Map(
      [...installations, ...pipelines].map((feature) => [feature.id, feature])
    );
  }, [installations, pipelines]);

  useEffect(() => {
    autoRotateRef.current = isAutoRotating;
  }, [isAutoRotating]);

  useEffect(() => {
    featureMapRef.current = featureMap;
  }, [featureMap]);

  useEffect(() => {
    onSelectFeatureRef.current = onSelectFeature;
  }, [onSelectFeature]);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    onCameraStateChangeRef.current = onCameraStateChange;
  }, [onCameraStateChange]);

  useEffect(() => {
    layerVisibilityRef.current = layerVisibility;
    dataSourcesRef.current.forEach((dataSource, layerId) => {
      dataSource.show = isLayerEnabled(layerVisibility, layerId);
    });
  }, [layerVisibility]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const credits = document.createElement("div");
    credits.className = "cesium-credit-shelf";
    container.appendChild(credits);

    const viewer = new Viewer(container, {
      animation: false,
      baseLayerPicker: false,
      baseLayer: new ImageryLayer(
        new UrlTemplateImageryProvider({
          credit: "Esri World Imagery",
          maximumLevel: 19,
          url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        })
      ),
      creditContainer: credits,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      msaaSamples: performanceMode ? 1 : 4,
      navigationHelpButton: false,
      sceneMode: SceneMode.SCENE3D,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      useBrowserRecommendedResolution: true
    });

    viewerRef.current = viewer;
    if (import.meta.env.DEV) {
      window.__ypfCesiumViewer = viewer;
    }
    viewer.scene.globe.enableLighting = false;
    viewer.scene.globe.baseColor = Color.fromCssColorString("#0b5f88");
    viewer.scene.globe.showGroundAtmosphere = true;
    viewer.scene.globe.depthTestAgainstTerrain = false;
    viewer.resolutionScale = performanceMode ? 0.82 : 1;
    viewer.imageryLayers.addImageryProvider(
      new UrlTemplateImageryProvider({
        credit: "Esri labels",
        maximumLevel: 19,
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
      })
    );
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 2;
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 45_000_000;
    viewer.scene.screenSpaceCameraController.inertiaSpin = 0.55;
    viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.45;
    viewer.scene.screenSpaceCameraController.inertiaZoom = 0.72;

    ArcGISTiledElevationTerrainProvider.fromUrl(terrainUrl)
      .then((terrainProvider) => {
        if (!viewer.isDestroyed()) {
          viewer.terrainProvider = terrainProvider;
        }
      })
      .catch(() => {});

    GeoJsonDataSource.load("/data/geography/admin0-boundaries.geojson", {
      clampToGround: true,
      stroke: Color.fromCssColorString("#f8fafc"),
      strokeWidth: 2
    })
      .then((dataSource) => {
        if (viewer.isDestroyed()) {
          return;
        }

        dataSource.name = "Fronteras politicas";
        dataSource.show = isLayerEnabled(layerVisibilityRef.current, "admin0");
        dataSource.entities.values.forEach((entity) => {
          if (entity.polyline) {
            entity.polyline.material = Color.fromCssColorString(
              "rgba(248, 250, 252, 0.68)"
            );
            entity.polyline.width = 2;
            entity.polyline.distanceDisplayCondition = new DistanceDisplayCondition(
              0,
              42_000_000
            );
          }
        });
        dataSourcesRef.current.set("admin0", dataSource);
        viewer.dataSources.add(dataSource);
      })
      .catch(() => {});

    GeoJsonDataSource.load("/data/geography/admin1-boundaries.geojson", {
      clampToGround: true,
      stroke: Color.fromCssColorString("#38bdf8"),
      strokeWidth: 1.25
    })
      .then((dataSource) => {
        if (viewer.isDestroyed()) {
          return;
        }

        dataSource.name = "Divisiones jurisdiccionales";
        dataSource.show = isLayerEnabled(layerVisibilityRef.current, "admin1");
        dataSource.entities.values.forEach((entity) => {
          if (entity.polyline) {
            entity.polyline.material = Color.fromCssColorString("rgba(56, 189, 248, 0.5)");
            entity.polyline.width = 1.25;
            entity.polyline.distanceDisplayCondition = new DistanceDisplayCondition(
              0,
              9_000_000
            );
          }
        });
        dataSourcesRef.current.set("admin1", dataSource);
        viewer.dataSources.add(dataSource);
      })
      .catch(() => {});

    setGlobalCameraView(viewer);

    const pauseOnInteraction = () => {
      if (autoRotateRef.current) {
        setIsAutoRotating(false);
      }
    };

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(pauseOnInteraction, ScreenSpaceEventType.LEFT_DOWN);
    handler.setInputAction(pauseOnInteraction, ScreenSpaceEventType.RIGHT_DOWN);
    handler.setInputAction(pauseOnInteraction, ScreenSpaceEventType.MIDDLE_DOWN);
    handler.setInputAction(pauseOnInteraction, ScreenSpaceEventType.WHEEL);
    handler.setInputAction(pauseOnInteraction, ScreenSpaceEventType.PINCH_START);
    handler.setInputAction((movement) => {
      pauseOnInteraction();
      const picked = viewer.scene.pick(movement.position);
      const featureId = picked?.id?.featureId;
      const feature = featureId ? featureMapRef.current.get(featureId) : null;

      if (feature) {
        onSelectFeatureRef.current(feature);
      }
    }, ScreenSpaceEventType.LEFT_CLICK);
    handlerRef.current = handler;

    const rotate = () => {
      if (!autoRotateRef.current) {
        return;
      }

      viewer.camera.rotate(Cartesian3.UNIT_Z, -0.00022);
    };

    viewer.clock.onTick.addEventListener(rotate);

    let cameraEmitFrame = 0;
    const emitCameraState = () => {
      window.cancelAnimationFrame(cameraEmitFrame);
      cameraEmitFrame = window.requestAnimationFrame(() => {
        const cartographic = viewer.camera.positionCartographic;
        onCameraStateChangeRef.current?.({
          height: cartographic.height,
          lat: CesiumMath.toDegrees(cartographic.latitude),
          lng: CesiumMath.toDegrees(cartographic.longitude),
          sceneMode: viewer.scene.mode
        });
      });
    };

    viewer.camera.changed.addEventListener(emitCameraState);
    emitCameraState();

    let readyFired = false;
    const markReady = () => {
      if (readyFired) {
        return;
      }
      readyFired = true;
      onReadyRef.current?.();
    };
    const readyFallback = window.setTimeout(markReady, 5_200);
    const removeTileLoadListener =
      viewer.scene.globe.tileLoadProgressEvent.addEventListener((pendingTiles) => {
        if (pendingTiles === 0) {
          window.setTimeout(markReady, 350);
        }
      });

    return () => {
      viewer.clock.onTick.removeEventListener(rotate);
      viewer.camera.changed.removeEventListener(emitCameraState);
      removeTileLoadListener?.();
      window.cancelAnimationFrame(cameraEmitFrame);
      window.clearTimeout(readyFallback);
      handlerRef.current?.destroy();
      handlerRef.current = null;
      viewer.destroy();
      if (import.meta.env.DEV) {
        delete window.__ypfCesiumViewer;
      }
      viewerRef.current = null;
      dataSourcesRef.current.clear();
      entitiesRef.current.clear();
      container.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }

    viewer.entities.removeAll();
    entitiesRef.current.clear();

    pipelines.forEach((pipeline) => {
      const entity = viewer.entities.add(makePipelineEntity(pipeline, selectedId));
      entity.featureId = pipeline.id;
      entitiesRef.current.set(pipeline.id, entity);
    });

    installations.forEach((installation) => {
      const entity = viewer.entities.add(makeInstallationEntity(installation, selectedId));
      entity.featureId = installation.id;
      entitiesRef.current.set(installation.id, entity);
    });
  }, [installations, pipelines, selectedId]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !selectedFeature || focusKey === lastFocusKeyRef.current) {
      return;
    }

    lastFocusKeyRef.current = focusKey;
    setIsAutoRotating(false);
    flyToFeature(viewer, selectedFeature, prefersReducedMotion() ? 0 : 1.15);
  }, [focusKey, selectedFeature]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !cameraCommand) {
      return;
    }

    tourRunRef.current += 1;
    const reducedMotion = prefersReducedMotion();
    setIsAutoRotating(false);

    if (cameraCommand.type === "stop-tour") {
      viewer.camera.cancelFlight();
      return;
    }

    if (cameraCommand.type === "home") {
      flyToEarth();
      return;
    }

    if (cameraCommand.type === "frame" && cameraCommand.payload) {
      flyToFrame(viewer, cameraCommand.payload, reducedMotion ? 0 : 1.35);
      return;
    }

    if (cameraCommand.type === "feature" && cameraCommand.payload?.feature) {
      flyToFeature(viewer, cameraCommand.payload.feature, reducedMotion ? 0 : 1.15);
    }
  }, [cameraCommand]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }

    viewer.resolutionScale = performanceMode ? 0.82 : 1;
    viewer.scene.globe.maximumScreenSpaceError = performanceMode ? 4 : 2;
  }, [performanceMode]);

  function flyToEarth() {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }

    setIsAutoRotating(false);
    tourRunRef.current += 1;
    setGlobalCameraView(viewer);
  }

  function zoom(direction) {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }

    setIsAutoRotating(false);
    viewer.camera.cancelFlight();
    const height = Math.max(viewer.camera.positionCartographic.height, 120);
    const amount = Math.max(height * 0.42, 40);

    if (direction === "in") {
      viewer.camera.zoomIn(amount);
    } else {
      viewer.camera.zoomOut(amount);
    }
  }

  function pan(direction) {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }

    setIsAutoRotating(false);
    viewer.camera.cancelFlight();
    const height = Math.max(viewer.camera.positionCartographic.height, 200);
    const amount = Math.max(height * navigationStepRatio, 80);
    const actions = {
      down: () => viewer.camera.moveDown(amount),
      left: () => viewer.camera.moveLeft(amount),
      right: () => viewer.camera.moveRight(amount),
      up: () => viewer.camera.moveUp(amount)
    };

    actions[direction]?.();
  }

  function setScene(mode) {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }

    setIsAutoRotating(false);
    viewer.camera.cancelFlight();
    if (viewer.scene.mode === SceneMode.MORPHING) {
      viewer.scene.completeMorph();
    }
    setViewMode(mode);

    if (mode === "3d") {
      viewer.scene.morphTo3D(0);
    } else if (mode === "2d") {
      viewer.scene.morphTo2D(0);
    } else {
      viewer.scene.morphToColumbusView(0);
    }
    viewer.scene.requestRender();
  }

  return (
    <div className="earth-globe">
      <div className="cesium-globe" ref={containerRef} />
      <div className="globe-vignette" aria-hidden="true" />
      <div className="earth-toolbar" aria-label="Controles de mapa">
        <div className="toolbar-cluster">
          <button onClick={() => zoom("in")} title="Acercar" type="button">
            <Plus aria-hidden="true" size={18} />
          </button>
          <button onClick={() => zoom("out")} title="Alejar" type="button">
            <Minus aria-hidden="true" size={18} />
          </button>
          <button onClick={flyToEarth} title="Tierra completa" type="button">
            <Home aria-hidden="true" size={18} />
          </button>
        </div>

        <div className="toolbar-cluster scene-modes">
          <button
            className={viewMode === "3d" ? "active" : ""}
            onClick={() => setScene("3d")}
            title="Vista 3D"
            type="button"
          >
            <Box aria-hidden="true" size={18} />
            <span>3D</span>
          </button>
          <button
            className={viewMode === "2d" ? "active" : ""}
            onClick={() => setScene("2d")}
            title="Vista 2D"
            type="button"
          >
            <MapIcon aria-hidden="true" size={18} />
            <span>2D</span>
          </button>
          <button
            className={viewMode === "flat" ? "active" : ""}
            onClick={() => setScene("flat")}
            title="Aplanar"
            type="button"
          >
            <Layers2 aria-hidden="true" size={18} />
            <span>Plano</span>
          </button>
        </div>

        <div className="toolbar-pad" aria-label="Desplazar mapa">
          <button className="pad-up" onClick={() => pan("up")} title="Subir" type="button">
            <MoveUp aria-hidden="true" size={17} />
          </button>
          <button
            className="pad-left"
            onClick={() => pan("left")}
            title="Izquierda"
            type="button"
          >
            <MoveLeft aria-hidden="true" size={17} />
          </button>
          <button
            className="pad-center"
            onClick={flyToEarth}
            title="Recentrar"
            type="button"
          >
            <Compass aria-hidden="true" size={17} />
          </button>
          <button
            className="pad-right"
            onClick={() => pan("right")}
            title="Derecha"
            type="button"
          >
            <MoveRight aria-hidden="true" size={17} />
          </button>
          <button
            className="pad-down"
            onClick={() => pan("down")}
            title="Bajar"
            type="button"
          >
            <MoveDown aria-hidden="true" size={17} />
          </button>
        </div>

        <button
          className={isAutoRotating ? "rotation-toggle active" : "rotation-toggle"}
          onClick={() => setIsAutoRotating((current) => !current)}
          type="button"
        >
          {isAutoRotating ? (
            <Pause aria-hidden="true" size={16} />
          ) : (
            <Play aria-hidden="true" size={16} />
          )}
          <span>{isAutoRotating ? "Pausar giro" : "Reanudar giro"}</span>
          <RotateCw aria-hidden="true" size={16} />
        </button>
      </div>
    </div>
  );
}
