$(document).ready(function () {
    $("#change-data-button").click(function () {
        $("#form").attr("action", "/edit/profile");
        $("#form").submit();
    });
    $("#logout-button").click(function () {
        $("#form").attr("action", "/logout");
        $("#form").submit();
    });
});