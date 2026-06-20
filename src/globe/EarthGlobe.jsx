import {
  ArcType,
  BoundingSphere,
  Cartesian2,
  Cartesian3,
  Color,
  DistanceDisplayCondition,
  HeightReference,
  HeadingPitchRange,
  HorizontalOrigin,
  ImageryLayer,
  Math as CesiumMath,
  PolylineGlowMaterialProperty,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  UrlTemplateImageryProvider,
  VerticalOrigin,
  Viewer
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { Pause, Play, RotateCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { typeMeta } from "../constants.js";

const initialCamera = {
  lat: -38.2,
  lng: -63.7,
  height: 4_900_000
};

const siteCameraHeight = {
  alta: 55_000,
  media: 72_000,
  baja: 92_000
};

function colorFromType(type, alpha = 1) {
  const base = Color.fromCssColorString(typeMeta[type].color);
  return Color.fromAlpha(base, alpha);
}

function arcColor(kind) {
  if (kind === "decision") {
    return Color.fromCssColorString("#a78bfa");
  }

  if (kind === "exportacion") {
    return Color.fromCssColorString("#22c55e");
  }

  if (kind === "energia") {
    return Color.fromCssColorString("#fbbf24");
  }

  return Color.fromCssColorString("#38bdf8");
}

function siteDescription(site) {
  return `
    <strong>${site.name}</strong><br />
    ${typeMeta[site.type].label} - ${site.region}<br />
    ${site.status}
  `;
}

function makeSiteEntity(site, selectedId) {
  const selected = site.id === selectedId;
  const color = colorFromType(site.type);
  const labelVisibleTo = selected ? 12_000_000 : 7_000_000;

  return {
    id: `site-${site.id}`,
    name: site.name,
    position: Cartesian3.fromDegrees(site.lng, site.lat, selected ? 110 : 80),
    description: siteDescription(site),
    point: {
      pixelSize: selected ? 17 : 12,
      color,
      outlineColor: selected ? Color.WHITE : Color.fromCssColorString("#06111f"),
      outlineWidth: selected ? 3 : 2,
      heightReference: HeightReference.RELATIVE_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    },
    ellipse: {
      semiMajorAxis: selected ? 12_000 : 7_000,
      semiMinorAxis: selected ? 12_000 : 7_000,
      material: Color.fromAlpha(color, selected ? 0.18 : 0.1),
      outline: true,
      outlineColor: Color.fromAlpha(color, selected ? 0.72 : 0.46),
      height: 65,
      heightReference: HeightReference.RELATIVE_TO_GROUND,
      distanceDisplayCondition: new DistanceDisplayCondition(0, 2_800_000)
    },
    label: {
      text: site.shortName,
      font: selected ? "800 14px Inter, sans-serif" : "800 12px Inter, sans-serif",
      fillColor: selected ? Color.fromCssColorString("#06111f") : Color.WHITE,
      showBackground: true,
      backgroundColor: selected
        ? Color.fromAlpha(color, 0.96)
        : Color.fromCssColorString("rgba(5, 13, 24, 0.82)"),
      backgroundPadding: selected ? new Cartesian2(9, 7) : new Cartesian2(8, 5),
      pixelOffset: new Cartesian2(0, selected ? -31 : -26),
      horizontalOrigin: HorizontalOrigin.CENTER,
      verticalOrigin: VerticalOrigin.BOTTOM,
      distanceDisplayCondition: new DistanceDisplayCondition(0, labelVisibleTo),
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    }
  };
}

function makeArcEntity(arc) {
  const materialColor = Color.fromAlpha(arcColor(arc.kind), 0.82);
  const height = 12_000 + arc.intensity * 58_000;

  return {
    id: `arc-${arc.id}`,
    polyline: {
      positions: Cartesian3.fromDegreesArrayHeights([
        arc.startLng,
        arc.startLat,
        height,
        arc.endLng,
        arc.endLat,
        height
      ]),
      width: 2.5 + arc.intensity * 2,
      arcType: ArcType.GEODESIC,
      material: new PolylineGlowMaterialProperty({
        glowPower: 0.18,
        taperPower: 0.65,
        color: materialColor
      }),
      distanceDisplayCondition: new DistanceDisplayCondition(0, 8_500_000)
    }
  };
}

export default function EarthGlobe({
  arcs,
  focusKey,
  onSelectSite,
  selectedSite,
  sites
}) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const handlerRef = useRef(null);
  const autoRotateRef = useRef(false);
  const entitiesRef = useRef(new Map());
  const onSelectSiteRef = useRef(onSelectSite);
  const siteMapRef = useRef(new Map());
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const selectedId = selectedSite?.id;

  const siteMap = useMemo(() => new Map(sites.map((site) => [site.id, site])), [sites]);

  useEffect(() => {
    autoRotateRef.current = isAutoRotating;
  }, [isAutoRotating]);

  useEffect(() => {
    onSelectSiteRef.current = onSelectSite;
  }, [onSelectSite]);

  useEffect(() => {
    siteMapRef.current = siteMap;
  }, [siteMap]);

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
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      navigationHelpButton: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      baseLayer: new ImageryLayer(
        new UrlTemplateImageryProvider({
          url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          maximumLevel: 19,
          credit: "Esri World Imagery"
        })
      ),
      useBrowserRecommendedResolution: true,
      msaaSamples: 4,
      creditContainer: credits
    });

    viewerRef.current = viewer;
    if (import.meta.env.DEV) {
      window.__ypfCesiumViewer = viewer;
    }
    viewer.scene.globe.enableLighting = false;
    viewer.scene.globe.showGroundAtmosphere = true;
    viewer.imageryLayers.addImageryProvider(
      new UrlTemplateImageryProvider({
        url: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        maximumLevel: 19,
        credit: "Esri labels"
      })
    );
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 25;
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 22_000_000;
    viewer.scene.screenSpaceCameraController.inertiaSpin = 0.55;
    viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.45;
    viewer.scene.screenSpaceCameraController.inertiaZoom = 0.72;

    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(
        initialCamera.lng,
        initialCamera.lat,
        initialCamera.height
      ),
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-58),
        roll: 0
      }
    });

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
      const siteId = picked?.id?.siteId;
      const site = siteId ? siteMapRef.current.get(siteId) : null;

      if (site) {
        onSelectSiteRef.current(site);
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

    return () => {
      viewer.clock.onTick.removeEventListener(rotate);
      handlerRef.current?.destroy();
      handlerRef.current = null;
      viewer.destroy();
      if (import.meta.env.DEV) {
        delete window.__ypfCesiumViewer;
      }
      viewerRef.current = null;
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

    arcs.forEach((arc) => {
      viewer.entities.add(makeArcEntity(arc));
    });

    sites.forEach((site) => {
      const entity = viewer.entities.add(makeSiteEntity(site, selectedId));
      entity.siteId = site.id;
      entitiesRef.current.set(site.id, entity);
    });
  }, [arcs, selectedId, sites]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !selectedSite) {
      return;
    }

    setIsAutoRotating(false);
    const target = Cartesian3.fromDegrees(selectedSite.lng, selectedSite.lat, 0);
    viewer.camera.flyToBoundingSphere(new BoundingSphere(target, 1), {
      duration: 1.25,
      offset: new HeadingPitchRange(
        CesiumMath.toRadians(0),
        CesiumMath.toRadians(-58),
        siteCameraHeight[selectedSite.priority] ?? 80_000
      )
    });
  }, [focusKey, selectedSite]);

  return (
    <div className="earth-globe">
      <div className="cesium-globe" ref={containerRef} />
      <div className="globe-vignette" aria-hidden="true" />
      <div className="globe-control-bar">
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
