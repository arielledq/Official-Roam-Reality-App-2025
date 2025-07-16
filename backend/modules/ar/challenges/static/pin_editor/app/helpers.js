
export const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})


export const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export const getStockMarker = (coords, img, w, h, prc) => {
    // return new mapboxgl.Marker(getMarkerEl(img, w, h, prc), )
    return new mapboxgl.Marker({color: 'rgb(102, 16, 242)'})
        .setLngLat(coords).setDraggable(true)

}

const getMarkerEl = (url, w, h, prc) => {
    const el = document.createElement('div');
    // const width = marker.properties.iconSize[0];
    // const height = marker.properties.iconSize[1];
    el.className = 'marker';
    el.style.backgroundImage = `url(${url})`;
    el.style.width = `${w || 26}px`;
    el.style.height = `${h || 35}px`;
    el.style.backgroundSize = `${prc || 100}%`
    return el
}

export const getImagedMarker = (coords, img, w, h, prc) => {
    return new mapboxgl.Marker(getMarkerEl(img, w, h, prc), )
    // return new mapboxgl.Marker({color: 'rgb(102, 16, 242)'})
        .setLngLat(coords).setDraggable(true)
}

export  const getSitePopup = (site) => {
    return new mapboxgl.Popup({offset: 25}).setHTML(
        `
            <h5><b>Site name:</b></h5>
            <h5>${site.name}</h5>
            <h6><b>Type: </b> ${capitalize(site.type)}</h6>
            <h6><a href="${site.edit_link}" target="_blank">Edit site</a></h6>
        `
    )
}

export const getStarPopup = (star) => {
    return new mapboxgl.Popup({offset: 25}).setHTML(
        `
            <h5><b>Star name:</b></h5>
            <h5>${star.name}</h5>
            <h6><b>Site: </b> ${star.site}</h6>
            <h6><a href="${star.edit_link}" target="_blank">Edit star</a></h6>
        `
    )
}