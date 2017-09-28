$("#sidebar-toggle-btn").click(function(e) {
    $(this).find("i").toggleClass("fa-arrow-right").toggleClass("fa-arrow-left");
    $("#content-wrapper").toggleClass("toggled");
    $("#sidebar").toggleClass("sidebar--toggled");

    googleMap.map.setCenter(googleMap.center);
});
