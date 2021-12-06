$(document).ready(function (){
    $(".updocs").click(function () {
        var id = $(this).attr("data-id");
        document.getElementById('alldocs').innerHTML = '';
        $.ajax({
            type: 'POST',
            url: '/uploadedDocumentCheck',
            data: {id: id},
            dataType: "json",
            success: function (response) {
                for (var i=0; i <response.data.length; i++) {
                    console.log(response.data[i]['file_name']);
                    var alldocs = document.getElementById('alldocs');
                    alldocs.innerHTML += '<div class="mydocuments-outer"><div class="documents-left">'+response.data[i]['file_name']+'</div><ul id="doc_list"><li><a href="uploads/pdf/'+response.data[i]['file_name']+'" class="blue-btn pdf_download" download>다운로드</a></li></ul></div>';
                }
                $("#modal_open").trigger('click');
            },
            error: function (res) {
                alert(res);
            }
        })
        
    });
    $("#download_all").click(function(){
        $("#doc_list li").each(function(){
            $(this).children(".pdf_download")[0].click();
        })
    })
})