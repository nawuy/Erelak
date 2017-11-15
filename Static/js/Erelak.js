// This is the process when you click the button 'submit'
// after 'click', the...
var PLAYED = " views";
$('<div>').appendTo("body");
function nothing(){};

var isOnTop = false;

function fun() {
    if (!isOnTop) {
        isOnTop = true;
        $("#logo").addClass("newLogo");
        $("#header").addClass("newHeader");
        $("#glass_button").addClass("newbutton");
        $(function(){
            $("#logo").appendTo("#one");
            $("#search_box").appendTo("#two");
            $("#glass_button").appendTo("#three"); // this will move the box up to the header
        });
        var element= document.getElementById('search_box'); // the next 6 lines of focus will maintain autofocus
        element.focus();
        element.onblur = function() {
            setTimeout(function() {
                element.focus();
            }, 0);
        };
    }      
}

// After the browser has rendered the html document
$(document).ready(function() {

    var getData = function() {
        // Retrieve the value of the html element by the id of search_box
        var SearchText = $('#search_box').val();

        // Perform a http request to the server, requesting the path /URLsearch using the method post
        // passing the data search=SearchText
        $.ajax({
            method: 'GET',
            url: '/URLsearch',
            data:{
                q: SearchText // refer n. 1 in app.py
            }
        }).done(function(data) {
            console.log(data);

            var createContent = function(thumbUrl, linkUrl, userLink, views, title, name) {
                var dm_tr = $('<tr class="tr_content">');
                var dm_td = $('<td class="td_content">');
                var divthumb  = $('<div class="thumb_container">');
                var divText = $('<div class="text_container">');
                var divTitle  = $('<div class="title_video">');
                var divViews  = $('<div class="n_views">');
                var divChannel  = $('<div class="channel">');
                divText.append(divTitle).append(divViews).append(divChannel);
                var dm_a1 = $('<a class="thumb">').attr('href', linkUrl);
                var dm_a2 = $('<a class="title_video">').attr('href', linkUrl);
                var dm_a3 = $('<a>');
                var dm_a4 = $('<a class="channel">').attr('href', userLink);
                divthumb.append(dm_a1);
                divTitle.append(dm_a2);
                divViews.append(dm_a3);
                divChannel.append(dm_a4);

                dm_a1.append($('<img class="thumb-link" src="' + thumbUrl + '"/>'));
                dm_a2.text(title);
                dm_a3.append(views + PLAYED);
                
                dm_a4.text(name);
                dm_tr.append(dm_td);
                dm_td.append(divthumb).append(divText);
                return dm_tr;
             }

            $('.hidden-results').addClass('visible-results').removeClass('hidden-results').empty();
            var vimeoList = data.response_vimeo;
            for (var i = 0; i < vimeoList.length; i ++) {
                var vm_thumbs = vimeoList[i].thumbnails;
                var vm_thumb_url = vm_thumbs[vm_thumbs.length - 1].link;
                var vm_link = vimeoList[i].link;
                var vm_userLink = vimeoList[i].userlink;
                var vm_title_video = vimeoList[i].name;
                var vm_username = vimeoList[i].username;
                var vimeo_views = 0;
                try {
                    vimeo_views = vimeoList[i].views.toLocaleString();
                } catch(err) {
                    console.log(err);
                }
                var vm_tr = createContent(vm_thumb_url, vm_link, vm_userLink, vimeo_views, vm_title_video, vm_username)
                $('#results-vimeo').append(vm_tr);      
            }

            var dmList = data.response_dailymotion.list;
            for (var i = 0; i < dmList.length; i ++){
                var v_dailym = dmList[i].views_total;
                var views_dm = v_dailym.toLocaleString();
                var dm_thumb = dmList[i].thumbnail_url;
                var dm_tr = createContent(dm_thumb, dmList[i].url, dmList[i]["owner.url"], views_dm, dmList[i].title, dmList[i]["owner.screenname"]
                );  
                $('#results-dailymotion').append(dm_tr);
            }

            $("#websites").show();
        }) .fail(function( jqXHR, textStatus){
            console.log(jqXHR);
            console.log(textStatus);
            console.log('You failed');
        });
    }; // end of getData()

    $("#websites").hide();

    // create a on click handler on the html element by the id of glass_button
    $('#glass_button').on('click', function(event) {
        $("#websites").show();
        // prevent the button from actually submitting the form
        event.preventDefault();
        getData();
    });
    $('#search_box').keydown(function(event) {
        console.log(event);
        if(event.keyCode == 13){
            getData();
        }        

    });
}); // end of document.ready function