/**
* Toggle sidebar show mode on/off
*/
function toggleSidebar() {
    $('#sidebar-toggle-btn').find('i').toggleClass('fa-arrow-right').toggleClass('fa-arrow-left');
    $('#content-wrapper').toggleClass('toggled');
    $('#sidebar').toggleClass('sidebar--toggled');
}


$('document').ready(function(){
    // Add event listener for the toggle button
    $('#sidebar-toggle-btn').click(toggleSidebar);
});
