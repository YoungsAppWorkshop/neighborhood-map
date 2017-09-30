function toggleSidebar() {
    $('#sidebar-toggle-btn').find('i').toggleClass('fa-arrow-right').toggleClass('fa-arrow-left');
    $('#content-wrapper').toggleClass('toggled');
    $('#sidebar').toggleClass('sidebar--toggled');
}


$('document').ready(function(){
    $('#sidebar-toggle-btn').click(toggleSidebar);
});
