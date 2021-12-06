$(document).ready(function () {
    $("#registration").submit(function (event) {
        event.preventDefault();
        var formData = new FormData(document.getElementById('registration'));
        console.log(formData);
        $.ajax({
            type: 'POST',
            url: '/registration',
            processData: false,
            contentType: false,
            data: formData,
            dataType: "json",
            success: function (response) {
                //alert("a");
                console.log(response);
                $('#registration')[0].reset();

                document.getElementById("check").innerHTML = response.message;
                //ADD THIS CODE
                setTimeout(function () {
                    document.getElementById("check").innerHTML = "";
                }, 3000);
                if (response.message == "You are regestered,You can login now.") {
                    document.getElementById("loginaa").click();
                };
            },
            error: function () {
            }
        })
    });




    let imagesPreview = function (input, placeToInsertImagePreview) {
        if (input.files) {
            let filesAmount = input.files.length;
            for (i = 0; i < filesAmount; i++) {
                let reader = new FileReader();
                reader.onload = function (event) {
                    $($.parseHTML("<img class='pre-img'>"))
                        .attr("src", event.target.result)
                        .appendTo(placeToInsertImagePreview);
                };
                reader.readAsDataURL(input.files[i]);
            }
        }
    };
    $("#input-files").on("change", function () {
        imagesPreview(this, "div.preview-images");
    });







});