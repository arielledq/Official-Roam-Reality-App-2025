document.addEventListener("DOMContentLoaded", function () {
  const elevField = document.getElementById("id_elevation");
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Get elevation";
  btn.style.marginLeft = "8px";
  elevField.parentNode.insertBefore(btn, elevField.nextSibling);

  btn.addEventListener("click", function () {
    const lat = document.getElementById("id_latitude").value;
    const lng = document.getElementById("id_longitude").value;

    // const raw = document.getElementById('id_location').value;
    // const point = JSON.parse(raw);
    // const [x, y] = point.coordinates;
    // const [lng, lat] = ol.proj.toLonLat([longitude, latitude]);

    const url =
      `https://api.mapbox.com/v4/` +
      `mapbox.mapbox-terrain-v2/tilequery/` +
      `${lng},${lat}.json` +
      `?layers=contour&limit=5` +
      `&access_token=${mapboxgl.accessToken}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.features && data.features.length) {
          const elevs = data.features.map((f) => f.properties.ele);
          elevField.value = Math.max(...elevs);
        } else {
          alert("No elevation data found for this point.");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Error fetching elevation: " + err.message);
      });
  });
});
