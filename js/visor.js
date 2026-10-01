
/* ============================================================
   MOTOR GIS INSTITUCIONAL
   Leaflet + GeoServer WMS/WFS
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    /* --------------------------------------------------------
       CONFIGURACIÓN GENERAL
       -------------------------------------------------------- */

    const GIS_CONFIG = {
        geoserver:
            "https://geocloud.municipalidadsalta.gob.ar/geoserver",

        workspace:
            "public",

        wms:
            "https://geocloud.municipalidadsalta.gob.ar/geoserver/public/wms",

        wfs:
            "https://geocloud.municipalidadsalta.gob.ar/geoserver/ows",

        center:
            [-24.79303, -65.41527],

        zoom:
            12,

        projection:
            "EPSG:4326"
    };


    /* --------------------------------------------------------
       CONFIGURACIÓN DEL VISOR
       -------------------------------------------------------- */

    const visorConfig = window.VISOR_CONFIG || {

        title: "Visor GIS",

        description:
            "Sistema institucional de información geográfica.",

        groups: [],

        layers: []
    };


    /* --------------------------------------------------------
       ELEMENTOS HTML
       -------------------------------------------------------- */

    const mapElement =
        document.getElementById("map");

    const layersContainer =
        document.getElementById("layers-container");

    const legendPanel =
        document.getElementById("legend-panel");

    const legendContent =
        document.getElementById("legend-content");

    const coordinatesDisplay =
        document.getElementById("coordinates");

    const loadingOverlay =
        document.getElementById("loading-overlay");

    const sidebar =
        document.getElementById("visor-sidebar");

    const sidebarToggle =
        document.getElementById("sidebar-toggle");


    /* --------------------------------------------------------
       VALIDACIÓN
       -------------------------------------------------------- */

    if (!mapElement) {
        console.error(
            "No se encontró el elemento #map."
        );

        return;
    }


    /* --------------------------------------------------------
       MAPA BASE
       -------------------------------------------------------- */

    const map = L.map("map", {

        center:
            GIS_CONFIG.center,

        zoom:
            GIS_CONFIG.zoom,

        zoomControl:
            true,

        attributionControl:
            true
    });


    /* --------------------------------------------------------
       OPENSTREETMAP
       -------------------------------------------------------- */

    const osm = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                '&copy; OpenStreetMap contributors'
        }
    );

    osm.addTo(map);

    const GoogleSatelite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        opacity: 0.8,
        attribution: '<a href="https://www.google.at/permissions/geoguidelines/attr-guide.html">Map data ©2015 Google</a>' + 'contributors',
        maxZoom: 18
    });
    GoogleSatelite.addTo(map)

    /* --------------------------------------------------------
       CAPAS BASE
       -------------------------------------------------------- */

    const baseLayers = {

        "OpenStreetMap": osm,
        "Google Satelital": GoogleSatelite

    };


    /* --------------------------------------------------------
       CAPAS GIS
       -------------------------------------------------------- */

    const overlayLayers = {
        
    };


    /* --------------------------------------------------------
       CREAR CAPAS
       -------------------------------------------------------- */

    visorConfig.layers.forEach(layerConfig => {

        if (
            !layerConfig.geoserverLayer
        ) {
            console.warn(
                "Capa sin geoserverLayer:",
                layerConfig
            );

            return;
        }


        if (
            layerConfig.type &&
            layerConfig.type.toUpperCase() !== "WMS"
        ) {

            console.warn(
                "Actualmente el motor base procesa WMS:",
                layerConfig
            );

            return;
        }


        const wmsLayer =
            L.tileLayer.wms(
                GIS_CONFIG.wms,
                {

                    layers:
                        layerConfig.geoserverLayer,

                    format:
                        "image/png",

                    transparent:
                        true,

                    version:
                        "1.1.1",

                    attribution:
                        layerConfig.source ||
                        " ",

                    opacity:
                        layerConfig.opacity ??
                        1,

                    tiled:
                        true
                }
            );


        overlayLayers[
            layerConfig.id ||
            layerConfig.geoserverLayer
        ] = wmsLayer;


        if (
            layerConfig.visible === true
        ) {
            wmsLayer.addTo(map);
        }

    });


    /* --------------------------------------------------------
       PANEL DE CAPAS
       -------------------------------------------------------- */

    renderLayerPanel();


    function renderLayerPanel() {

        if (!layersContainer) {
            return;
        }

        layersContainer.innerHTML = "";


        if (
            visorConfig.layers.length === 0
        ) {

            layersContainer.innerHTML = `
                <div style="
                    padding:20px;
                    font-size:12px;
                    color:#68737d;
                ">
                    No hay capas configuradas para este visor.
                </div>
            `;

            return;
        }


        const groups = {};


        visorConfig.layers.forEach(layer => {

            const group =
                layer.group ||
                "Capas";

            if (!groups[group]) {
                groups[group] = [];
            }

            groups[group].push(layer);
        });


        Object.keys(groups).forEach(groupName => {

            const groupElement =
                document.createElement("div");

            groupElement.className =
                "layer-group";


            const title =
                document.createElement("div");

            title.className =
                "layer-group-title";

            title.textContent =
                groupName;


            groupElement.appendChild(title);


            groups[groupName].forEach(
                layerConfig => {

                    const item =
                        createLayerItem(
                            layerConfig
                        );

                    groupElement.appendChild(
                        item
                    );
                }
            );


            layersContainer.appendChild(
                groupElement
            );

        });

    }


    /* --------------------------------------------------------
       ELEMENTO DE CAPA
       -------------------------------------------------------- */

    function createLayerItem(layerConfig) {

        const item =
            document.createElement("div");

        item.className =
            "layer-item";


        const checkbox =
            document.createElement("input");

        checkbox.type =
            "checkbox";

        checkbox.checked =
            layerConfig.visible === true;


        const layerName =
            document.createElement("span");

        layerName.className =
            "layer-name";

        layerName.textContent =
            layerConfig.name ||
            layerConfig.geoserverLayer;


        const opacity =
            document.createElement("input");

        opacity.type =
            "range";

        opacity.min =
            "0";

        opacity.max =
            "1";

        opacity.step =
            "0.05";

        opacity.value =
            layerConfig.opacity ??
            1;

        opacity.className =
            "layer-opacity";


        const layerId =
            layerConfig.id ||
            layerConfig.geoserverLayer;

        const mapLayer =
            overlayLayers[layerId];


        checkbox.addEventListener(
            "change",
            () => {

                if (!mapLayer) {
                    return;
                }


                if (checkbox.checked) {

                    mapLayer.addTo(map);

                } else {

                    map.removeLayer(
                        mapLayer
                    );
                }


                updateLegend();
            }
        );


        opacity.addEventListener(
            "input",
            () => {

                if (!mapLayer) {
                    return;
                }

                mapLayer.setOpacity(
                    parseFloat(
                        opacity.value
                    )
                );
            }
        );


        item.appendChild(
            checkbox
        );

        item.appendChild(
            layerName
        );

        item.appendChild(
            opacity
        );


        return item;
    }


    /* --------------------------------------------------------
       LEYENDA WMS
       -------------------------------------------------------- */

    function updateLegend() {

        if (
            !legendContent
        ) {
            return;
        }


        legendContent.innerHTML = "";


        visorConfig.layers
            .filter(layer => {

                const id =
                    layer.id ||
                    layer.geoserverLayer;

                const mapLayer =
                    overlayLayers[id];

                return (
                    map.hasLayer(mapLayer)
                );
            })
            .forEach(layer => {

                const item =
                    document.createElement("div");

                item.className =
                    "legend-item";


                const title =
                    document.createElement("div");

                title.className =
                    "legend-item-title";

                title.textContent =
                    layer.name ||
                    layer.geoserverLayer;


                const image =
                    document.createElement("img");


                const legendUrl =
                    GIS_CONFIG.geoserver +
                    "/wms?" +
                    new URLSearchParams({

                        SERVICE:
                            "WMS",

                        VERSION:
                            "1.1.1",

                        REQUEST:
                            "GetLegendGraphic",

                        FORMAT:
                            "image/png",

                        LAYER:
                            layer.geoserverLayer
                    }).toString();


                image.src =
                    legendUrl;


                image.alt =
                    "Leyenda";


                item.appendChild(
                    title
                );

                item.appendChild(
                    image
                );


                legendContent.appendChild(
                    item
                );

            });

    }


    /* --------------------------------------------------------
       CONTROL DE LEYENDA
       -------------------------------------------------------- */

    const legendButton =
        document.getElementById(
            "legend-button"
        );


    if (legendButton) {

        legendButton.addEventListener(
            "click",
            () => {

                if (!legendPanel) {
                    return;
                }

                legendPanel.classList.toggle(
                    "visible"
                );

                updateLegend();
            }
        );

    }


    /* --------------------------------------------------------
       COORDENADAS
       -------------------------------------------------------- */

    map.on(
        "mousemove",
        event => {

            if (!coordinatesDisplay) {
                return;
            }


            const lat =
                event.latlng.lat.toFixed(5);

            const lng =
                event.latlng.lng.toFixed(5);


            coordinatesDisplay.textContent =
                `Lat: ${lat} | Lon: ${lng}`;
        }
    );


    /* --------------------------------------------------------
       VOLVER AL CENTRO
       -------------------------------------------------------- */

    const homeButton =
        document.getElementById(
            "home-button"
        );


    if (homeButton) {

        homeButton.addEventListener(
            "click",
            () => {

                map.setView(
                    GIS_CONFIG.center,
                    GIS_CONFIG.zoom
                );
            }
        );

    }


    /* --------------------------------------------------------
       GEOLOCALIZACIÓN
       -------------------------------------------------------- */

    const locationButton =
        document.getElementById(
            "location-button"
        );


    if (locationButton) {

        locationButton.addEventListener(
            "click",
            () => {

                map.locate({
                    setView: true,
                    maxZoom: 16
                });
            }
        );

    }


    /* --------------------------------------------------------
       GEOLOCALIZACIÓN RESULTADO
       -------------------------------------------------------- */

    map.on(
        "locationfound",
        event => {

            L.circleMarker(
                event.latlng,
                {
                    radius: 7,
                    weight: 2
                }
            )
                .addTo(map)
                .bindPopup(
                    "Ubicación actual"
                )
                .openPopup();

        }
    );


    map.on(
        "locationerror",
        () => {

            alert(
                "No fue posible obtener la ubicación."
            );

        }
    );


    /* --------------------------------------------------------
       SIDEBAR
       -------------------------------------------------------- */

    if (sidebarToggle) {

        sidebarToggle.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "closed"
                );

            }
        );

    }


    /* --------------------------------------------------------
       BÚSQUEDA DE CAPAS
       -------------------------------------------------------- */

    const layerSearch =
        document.getElementById(
            "layer-search"
        );


    if (layerSearch) {

        layerSearch.addEventListener(
            "input",
            () => {

                const text =
                    layerSearch.value
                        .toLowerCase()
                        .trim();


                document
                    .querySelectorAll(
                        ".layer-item"
                    )
                    .forEach(item => {

                        const name =
                            item
                                .querySelector(
                                    ".layer-name"
                                )
                                ?.textContent
                                .toLowerCase() ||
                            "";


                        item.style.display =
                            name.includes(text)
                                ? "flex"
                                : "none";

                    });

            }
        );

    }


    /* --------------------------------------------------------
       FULLSCREEN
       -------------------------------------------------------- */

    const fullscreenButton =
        document.getElementById(
            "fullscreen-button"
        );


    if (fullscreenButton) {

        fullscreenButton.addEventListener(
            "click",
            () => {

                const element =
                    document.documentElement;


                if (
                    !document.fullscreenElement
                ) {

                    element.requestFullscreen();

                } else {

                    document.exitFullscreen();

                }

            }
        );

    }


    /* --------------------------------------------------------
       INFORMACIÓN DEL VISOR
       -------------------------------------------------------- */

    const visorDescription =
        document.getElementById(
            "visor-description"
        );


    if (visorDescription) {

        visorDescription.textContent =
            visorConfig.description ||
            "";

    }


    const visorTitle =
        document.getElementById(
            "visor-title"
        );


    if (visorTitle) {

        visorTitle.textContent =
            visorConfig.title ||
            "Visor GIS";

    }


    /* --------------------------------------------------------
       FINALIZACIÓN
       -------------------------------------------------------- */

    if (loadingOverlay) {

        setTimeout(
            () => {

                loadingOverlay.classList.remove(
                    "visible"
                );

            },
            500
        );

    }


    console.log(
        "Visor GIS institucional iniciado."
    );

});
