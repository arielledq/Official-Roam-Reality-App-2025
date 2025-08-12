import {h, render} from 'https://unpkg.com/preact@latest?module';
import {useEffect, useState, useMemo, useRef, useCallback} from 'https://unpkg.com/preact@latest/hooks/dist/hooks.module.js?module';
import htm from 'https://unpkg.com/htm?module';
import {debounce} from 'https://unpkg.com/lodash-es@4.17.21?module'

// import * as deepEqual from 'https://unpkg.com/fast-deep-equal?module';

const html = htm.bind(h); // Initialize htm with Preact

const invertTuple = (tupl) => [tupl[1], tupl[0]]

import {MAP_CENTER, MAPBOX_STYLES} from "./app/consts.js";
import {STYLES} from "./app/styles.js";
import {dashboardData, postSiteChanges} from "./app/backend_link.js";
import {
    capitalize,
    getImagedMarker,
    getScanPopup,
    getSitePopup,
    getStarPopup,
    getStockMarker,
    Toast
} from "./app/helpers.js";

function App(props) {
    const [mapx, setMapx] = useState(null)
    const [satMapStyle, setSatMapStyle] = useState(false)
    const [dataLoading, setDataLoading] = useState(false)
    const [cachedSites, setCachedSites] = useState({})
    const [cachedStars, setCachedStars] = useState({})
    const [cachedScans, setCachedScans] = useState({})
    const cachedMarkers = useRef({})
    const cachedMarkers2 = useRef({})
    const cachedMarkers3 = useRef({})
    const [totalizerString, setTotalizerString] = useState('')
    const [searchfield, setSearchfield] = useState('')
    const [selectedTypes, setSelectedTypes] = useState(['geo-tag', 'band', 'hunt', 'scans'])
    const [siteChanges, setSiteChanges] = useState({})
    const [starChanges, setStarChanges] = useState({})
    const [scanChanges, setScanChanges] = useState({})
    const [mapBounds, setMapBounds] = useState(null)

    const reloadMapData = () => {
         if (mapx) {
            let bounds = mapx.getBounds().toArray()
            loadSiteData(null, bounds, mapx)
        }
    }

    const saveBtn = () => {
        const site_data = Object.entries(siteChanges).map(([site_id, latlng]) => {
            return {
                id: site_id,
                lat_long: { "type": "Point", "coordinates": invertTuple(latlng) }
            }
        })

        const star_data = Object.entries(starChanges).map(([star_id, {location, elevation}]) => {
            return {
                id: star_id,
                location: { "type": "Point", "coordinates": invertTuple(location) },
                elevation: elevation
            }
        })

        const scan_data = Object.entries(scanChanges).map(([scan_id, {location}]) => {
            return {
                id: scan_id,
                coordinates: { "type": "Point", "coordinates": invertTuple(location) },
            }
        })
        // console.log('saving ', data)

        Swal.fire({
            title: `Saving location changes for geo ar sites`,
            icon: 'info',
            didOpen: () => {
                Swal.showLoading()
            }
        })
        postSiteChanges({sites: site_data, stars: star_data, scans: scan_data})
            .then((response) => {
                Swal.close()
                // const r = JSON.parse(response)
                if (response.status === 200) {
                    if (response.data.success) {
                        Toast.fire({
                            icon: 'success',
                            title: 'Data saved succesfully!'
                        })
                        setSiteChanges({})
                        setStarChanges({})
                        setScanChanges({})
                        reloadMapData()
                    } else {
                        Toast.fire({
                            icon: 'error',
                            title: response.data.message
                        })
                    }
                } else {
                    Toast.fire({
                        icon: 'error',
                        title: 'There was an error saving the data!'
                    })
                }
                console.log(response);

            })
            .catch(function (error) {
                console.log(error);
                Swal.close()
                Toast.fire({
                    icon: 'error',
                    title: 'There was an error saving the data!'
                })
            });
    }

    const restoreBtn = () => {
        setSiteChanges({})
        setStarChanges({})
        setScanChanges({})
        Object.entries(cachedSites).forEach(([key, site]) => {
          const marker = cachedMarkers.current[site.id]
          marker.setLngLat(invertTuple(site.location))
        })
        Object.entries(cachedStars).forEach(([key, star]) => {
          const marker = cachedMarkers2.current[star.id]
          marker.setLngLat(invertTuple(star.location))
        })
        Object.entries(cachedScans).forEach(([key, scan]) => {
          const marker = cachedMarkers3.current[scan.id]
          marker.setLngLat(invertTuple(scan.location))
        })
    }

    const handleTypeSelectorChange = (type) => {
        return (ev) => {
            setSelectedTypes(prev => {
                if (!ev.target.checked) {
                    return prev.filter(st => st !== type)
                } else if (!prev.includes(type)) {
                    return [...prev, type]
                }
            })
        }
    }

    const handleMarkerDragEnd = (site) => {
        return (ev) => {
            const lngLat = ev.target.getLngLat();
            setSiteChanges((prev) => ({
                ...prev,
                [site.id]: [lngLat.lat, lngLat.lng]
            }))
        }
    }

    const handleStarMarkerDragEnd = (star, map) => {
        return (ev) => {
            const lngLat = ev.target.getLngLat();
            // const elevation = parseInt(map.queryTerrainElevation(lngLat));
            setStarChanges((prev) => ({
                ...prev,
                [star.id]: {
                    location: [lngLat.lat, lngLat.lng],
                    // elevation: null
                }
            }))
        }
    }

    const handleScanMarkerDragEnd = (scan, map) => {
        return (ev) => {
            const lngLat = ev.target.getLngLat();
            setScanChanges((prev) => ({
                ...prev,
                [scan.id]: {
                    location: [lngLat.lat, lngLat.lng],
                }
            }))
        }
    }

    const processMoreSites = (sites, sitesCache, map) => {
        sites.forEach((m) => {
            if (sitesCache[m.id]) {
                // console.log('id repetido ', m.id)
            }
            sitesCache[m.id] = m
        })
        Object.entries(sitesCache).forEach(([key, site]) => {
            if (!cachedMarkers.current[key]) {
                // console.log('creating marker for ', site.id, key)
                let color = ''
                switch (site?.type) {
                    case 'geo-tag':
                        color = 'rgb(102, 16, 242)'
                        break;

                    case 'band':
                        color = 'rgb(43,85,255)'
                        break;

                    case 'hunt':
                        color = 'rgb(22,136,4)'
                        break;

                    default:
                        break;
    }
                const marker = getStockMarker(invertTuple(site.location), color, props.static_root + '/M3.png')
                marker.on('dragend', handleMarkerDragEnd(site))

                marker.setPopup(getSitePopup(site))
                marker.addTo(map)
                cachedMarkers.current[key] = marker
            }
        })
    }

    const processMoreStars = (stars, starsCache, map) => {
        stars.forEach((m) => {
            if (starsCache[m.id]) {
                // console.log('id repetido ', m.id)
            }
            starsCache[m.id] = m
        })
        Object.entries(starsCache).forEach(([key, star]) => {
            if (!cachedMarkers2.current[key]) {
                // console.log('creating marker for ', star.id, key)
                const marker = getImagedMarker(invertTuple(star.location), props.static_root + '/pin_star_lq.png')
                marker.on('dragend', handleStarMarkerDragEnd(star, map))

                marker.setPopup(getStarPopup(star))
                marker.addTo(map)
                cachedMarkers2.current[key] = marker
            }
        })
    }

    const processMoreScans = (scans, scansCache, map) => {
        scans.forEach((m) => {
            if (scansCache[m.id]) {
                // console.log('id repetido ', m.id)
            }
            scansCache[m.id] = m
        })
        Object.entries(scansCache).forEach(([key, scan]) => {
            if (!cachedMarkers3.current[key]) {
                const marker = getStockMarker(invertTuple(scan.location), 'rgb(255,127,28)', props.static_root + '/M3.png')
                marker.on('dragend', handleScanMarkerDragEnd(scan))

                marker.setPopup(getScanPopup(scan))
                marker.addTo(map)
                cachedMarkers3.current[key] = marker
            }
        })
    }

    const loadSiteData = (page, bounds, othermap) => {
        let sitesCache = {}
        let starsCache = {}
        let scansCache = {}
        if (!page) {
            page = 1
            Object.values(cachedMarkers.current).forEach(marker => marker.remove())
            cachedMarkers.current = {}

            Object.values(cachedMarkers2.current).forEach(marker => marker.remove())
            cachedMarkers2.current = {}

            Object.values(cachedMarkers3.current).forEach(marker => marker.remove())
            cachedMarkers3.current = {}
        }else{
            sitesCache = cachedSites
            starsCache = cachedStars
            scansCache = cachedScans
        }
        setDataLoading(true)
        const params = {page, bounds}
        if (searchfield.trim() !== '') {
            params.filter = searchfield.trim()
        }
        params.types = selectedTypes
        dashboardData(params).then((response) => {
            if (response.status === 200) {
                if (response.data) {
                    let data = response.data.result
                    processMoreSites(data.sites, sitesCache, othermap)
                    setCachedSites({...sitesCache})
                    processMoreStars(data.stars, starsCache, othermap)
                    setCachedStars({...starsCache})
                    processMoreScans(data.scans, scansCache, othermap)
                    setCachedScans({...scansCache})

                    if (data?.pages !== data?.page) {
                        setTotalizerString(`${data?.page} / ${data?.pages}`)

                        setTimeout(() => {
                            loadSiteData(data.page + 1, bounds, othermap)
                        }, 50)
                    } else {
                        setTotalizerString(``)

                        setDataLoading(false)
                    }

                } else {
                    Toast.fire({
                        icon: 'error',
                        title: response.data.message
                    })
                }
            } else {
                Toast.fire({
                    icon: 'error',
                    title: 'There was an error getting sites data!'
                })
            }

        })
            .catch(function (error) {
                console.log(error);
                Swal.close()
                Toast.fire({
                    icon: 'error',
                    title: 'There was an error getting sites data!'
                })
            });
    }




    useEffect(() => {
        mapboxgl.accessToken = props.mapbox_token;
        let map = new mapboxgl.Map({
            attributionControl: false,
            container: 'mapinner',
            style: props.mapbox_style,
            center: MAP_CENTER,
            zoom: 9,
        });
        setMapx(map)

        map.on('style.load', () => {
            map.addSource('mapbox-dem', {
                'type': 'raster-dem',
                'url': 'mapbox://mapbox.terrain-rgb',
                'tileSize': 512,
                'maxzoom': 14
            });
            map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1 });
            console.log('style loaded')
        })


        map.on('render', () => {
            map.resize();
        })

        map.on('load', () => {
            setMapBounds(map.getBounds().toArray())
        })


        map.on('moveend', () => {
            setMapBounds(map.getBounds().toArray())
        });

    }, [])

    useEffect(() => {
        if (mapx) {
            mapx.setStyle(MAPBOX_STYLES[satMapStyle ? 'satellite' : 'default'])
        }
    }, [satMapStyle])

    useEffect(() => {
        console.log('searchfield changed', searchfield, selectedTypes)
        reloadMapData()
    }, [searchfield, selectedTypes])

    useEffect(() => {
        if (mapx && mapBounds) {
            console.log('bounds changed', searchfield, selectedTypes)
            loadSiteData(1, mapBounds, mapx)
        }
    }, [mapBounds, mapx])

    const debouncedChangeHandler = useMemo(() =>
            debounce((ev) => setSearchfield(ev.target.value), 300)
        , [searchfield]);

    const mapLoader = html`
        <div id="maploader" style=${STYLES.mapLoader}>
            <div class="card d-flex flex-column align-items-center justify-content-center">
                <div class="lds-ripple">
                    <div></div>
                    <div></div>
                </div>
                <span>Loading</span><span>${totalizerString}</span>
            </div>
        </div>`

    const typeSelector = html`
        <div id="typeselector" style=${STYLES.typeSelector} class="map-type-selector">
            <div class="card d-flex flex-column align-items-start justify-content-start p-3">
                <h5>Type of sites to include:</h5>
                
                ${['geo-tag', 'band', 'hunt', 'scans'].map((type, idx) => html`
                    <div class="d-flex flex-row align-items-center justify-content-start">
                        <input 
                                type="checkbox" 
                                id="${type}" 
                                name="${type}" 
                                class="map-type-selector-input" 
                                checked="${selectedTypes.includes(type)}"
                                onChange="${handleTypeSelectorChange(type)}"
                        />
                        <label for="${type}" class="map-type-selector-label">${capitalize(type)}</label>
                    </div>
                `)}
            </div>
        </div>`


    const pendingChanges = (Object.keys(siteChanges).length + Object.keys(starChanges).length + Object.keys(scanChanges).length) > 0

    return html`
        <div class="d-flex flex-row m-2">
            <div class="d-flex flex-column align-items-center">
                <a class="btn btn-primary" href="../../"><i class="fas fa-arrow-left mr-1"/> Go back </a>
            </div>
            <div class="d-flex flex-row flex-fill align-items-center justify-content-center">
                <h4 class="ml4 text-truncate" style="line-height: 36px;">Sites Location Editor</h4>
                <div class="flex-fill"></div>
                <h5 class="ml2 text-truncate me-5">Search:</h5>
                <input class="ms-3" id="filter" type="text" oninput=${debouncedChangeHandler}/>
            </div>
        </div>

        <div id="map" style=${STYLES.map}>
            <div id="mapinner" style=${STYLES.mapInner}></div>
            <div id="mapcontrols" style=${STYLES.mapControls}>
                <a class=${STYLES.buttonsClass} onClick=${() => setSatMapStyle(!satMapStyle)}><i
                        class="fa-solid fa-layer-group white"/></a>
                <a class="${STYLES.buttonsClass} mt4 ${pendingChanges ? 'bg-green' : 'bg-gray'}" onClick=${saveBtn}><i
                        class="fa-solid fa-floppy-disk black "/></a>
                <a class="${STYLES.buttonsClass} ${pendingChanges ? 'bg-red' : 'bg-gray'}" onClick=${restoreBtn}><i
                        class="fa-solid fa-rotate-left black "/></a>
            </div>
            ${dataLoading && mapLoader}
            ${typeSelector}
        </div>`;
}

render(html`
    <${App} ...${window.app_vars}/>`, document.getElementById('preactapp'));


