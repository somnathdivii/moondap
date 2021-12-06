$(document).ready(function (){
    $("#upload_document").change(function(){
        $("#upload_doc").submit();
    });
    $("#upload_doc").submit(function (event) {
        event.preventDefault();
        var formData = new FormData(document.getElementById('upload_doc')); 
        $.ajax({
            type: 'POST',
            url: '/upload_doc',
            processData: false,
            contentType: false,
            data: formData,
            dataType: "json",
            success: function (response) {
                //alert("a");
                alert(response.message);
                // doclist();
                location.reload();
            },
            error: function () {
                alert(response.message);
            }
        })
    });
    $(".delete_doc").click(function(){
        var id = $(this).attr("data-id");
        $("#doc_delete_mod").trigger('click');
        $("#doc_delete_butn").attr("data-id", id);
    });
    $("#doc_delete_butn").click(function(){
        var id = $(this).attr("data-id");
        $.ajax({
            type: 'POST',
            url: '/docDelete',
            data: {id: id},
            dataType: "json",
            success: function (response) {
                //alert("a");
                // $("#my-documents-delet").hide();
                // doclist();
                alert(response.message);
                location.reload();
            },
            error: function () {
            }
        })
    });

});
function doclist(){
    $.ajax({
        type: 'POST',
        url: '/allDoc',
        dataType: "json",
        data: {},
        success: function (response) {
            console.log(response.docs);
            // for (var i=0; i <response.docs.docs.length; i++) {
                // document.getElementById('alldocs').html('<div class="mydocuments-outer"><div class="documents-left">'+docs[i]["file_name"]+'</div><ul> <li class="date">'+new Date(docs[i]["createdAt"]).getFullYear()+'-'+("0" + (new Date(docs[i]["createdAt"]).getMonth() + 1)).slice(-2)+'-'+("0" + new Date(docs[i]["createdAt"]).getDate()).slice(-2)+'</li><li> <div class="action-box"> <div class="dropdown"> <button class="dropdown-toggle" type="button" id="participantR" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> <img src="../assets/icons/icon-kebab-menu.svg"/> </button> <div class="dropdown-menu dropdown-menu-right" aria-labelledby="participantR"> <a class="dropdown-item" href="javascript:void(0)">바로 공유하기</a> <a class="dropdown-item" href="javascript:void(0)">문서 설정</a> <a class="dropdown-item delete_doc" href="javascript:void(0)" data-id="'+docs[i]["id"]+'">삭제</a> <a class="dropdown-item" href="/uploads/hwpuploads/pdf/'+docs[i]["file_name"]+'" download>내 기기에 저장</a> </div></div></div></li></ul> </div>');
            // }
        },
        error: function () {

        }
    })
}