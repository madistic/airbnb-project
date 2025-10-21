    mapboxgl.accessToken = mapToken;

    const map = new mapboxgl.Map({
        container: 'map', // container ID
        center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 8 // starting zoom
    });

    const marker = new mapboxgl.Marker({ color: "black" })
  .setLngLat(listing.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
      <div class="popup-card">
        <h3>${listing.location}</h3>
        <p>Exact location will be provided after booking</p>
      </div>
    `)
  )
  .addTo(map);

