// Copyright 2010 Jair Trejo - Open sourced under an MIT License.
// See LICENSE.txt for more information.

/*
* User interface code for Routine (http://routine.jairtrejo.mx). Depends on JQuery 1.5
* Author: Jair Trejo (jair@jairtrejo.mx)
*/

// Google Maps API options.
var thecity;
var myOptions;

/*
*  Google Maps API objects
*/
// Maps
var home_map;
var stop_map;
var itin_map;

// Geocoder (performs address to location translation)
var geocoder;

// Itinerary line
var itin_line= null;

// Markers
var home_marker = null;

var start_marker = null;
var search_markers = [];

var starti_marker = null;
var itinerary_markers = [];


/*
*  Itinerary stops (business's ids array)
*/

var stops = [];

/*
* Itinerary stops sorted 
*/

var it = [];


/*
* Shows an error in the error panel.
* text - The text of the error.
*/
function show_error(text){
    $('.error').html('<p>' + text + '</p>');
    $('.error').fadeIn();
    setTimeout(function(){$('.error').fadeOut('slow');}, 2500);
}

/*
* Maps and geocoder initialization.
*/

function initialize(){
    // Boston, MA
    thecity = new google.maps.LatLng(42.354675,-71.066179);
    myOptions = {
      zoom: 12,
      center: thecity,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    home_map = new google.maps.Map(document.getElementById("home_map_canvas"), myOptions);
    stop_map = new google.maps.Map(document.getElementById("stop_map_canvas"), myOptions);
    geocoder = new google.maps.Geocoder();

}

/*
* 
*/

function manual_home_marker(){
    if(home_marker) return;
    geo.address_selector = 'input[name="address"]';
    home_marker = geo.create_marker();
    geo.place_marker(home_map, home_marker, thecity);
}

function clear_search(){
    for(k in search_markers){
        search_markers[k].setMap(null);
        search_markers[k] = null;
    }
    search_markers.length = 0;
}

function clear_itinerary(){
    for(k in itinerary_markers){
        itinerary_markers[k].setMap(null);
        itinerary_markers[k] = null;
    }
    itinerary_markers.length = 0;
    if(starti_marker) starti_marker.setMap(null);
    if(itin_line) itin_line.setMap(null);
    $('#ittitle').remove();
}

function get_itinerary(){
    clear_itinerary();
    $('p#wait_itinerary').show().text('Please wait a moment while your itinerary is computed.');
    $('p#thinking').show();
    $('#print').hide();
    try{
        var stopss = '';
        for(k in stops){
            stopss = stopss + stops[k] + ',';
        }
        stopss = stopss.substring(0, stopss.length - 1);
        $(document).append('<script type="text/javascript" async="async" src="http://api.routine.jairtrejo.mx/sort?lathome=' + start_marker.getPosition().lat() + '&lnghome=' + start_marker.getPosition().lng() + '&stops=' + stopss + '&cback=show_itinerary"></s' + 'cript>');
    }
    catch(e){
        $('input[name="business"]').removeClass('loading-field');
    }
}

function show_itinerary(data){
    itin_map = new google.maps.Map(document.getElementById("itin_map_canvas"), myOptions);
    line = [];

    if(!starti_marker) starti_marker = geo.create_marker();
    if(itin_map) geo.place_marker(itin_map, starti_marker, home_marker.position);
    starti_marker.setDraggable(false);

    var bounds = new google.maps.LatLngBounds();

    // The sever returns a list of businesses.
    it = data['bss'];

    $('#print_itinerary').html('<h2>Your itinerary</h2><h4>Starting point</h4>');
    $('#print_itinerary').append('<p>' + $('p#starting_point').html() + '</p>');
    $('#print_itinerary').append('<h4>Stops</h4>');
    $('#print_itinerary').append('<ol></ol>');
    
    for(i in it){
        var bs = it[i];
        if(bs.bubble != 'home'){
            var marker = geo.create_marker();
            marker.setIcon('http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png');
            geo.place_marker(itin_map, marker, new google.maps.LatLng(bs.lat, bs.lng));
            geo.add_infowindow(itin_map, marker, bs.bubble);
            search_markers.push(marker);
        }
        else{
            var marker = starti_marker;
            geo.add_infowindow(itin_map, marker, '<h3>Starting point</h3><p>' + $('p#starting_point').html() + '</p>');
        }
        marker.setDraggable(false);
        bounds.extend(marker.getPosition());
        line.push(marker.position);
        if(bs.bubble != 'home'){
            $('#print_itinerary ol').append('<li class="it-stop">' + bs.bubble + '</li>');
        }
    }
    bounds.extend(start_marker.getPosition());
    itin_map.fitBounds(bounds);

    bs = it[0];
    line.push(new google.maps.LatLng(bs.lat, bs.lng));
    itin_line = new google.maps.Polyline({
        path: line,
        strokeColor: '#A40802',
        strokeOpacity: 0.5,
        strokeWeight: 2
    });
    itin_line.setMap(itin_map);
    $('p#wait_itinerary').hide().before('<h2 id="ittitle">Your itinerary</h2>');
    $('p#thinking').hide();
    $('#print').show();
}

function print_itinerary(){
    $.facebox({div : "#print_itinerary"});
}

function search_bss(q_name, q_address){
    clear_search();
    geo.clear_infowindows();
    name = encodeURIComponent(q_name);
    address = encodeURIComponent(q_address);
    $('input[name="business"]').addClass('loading-field');
    $('input[name="search"]').attr('disabled', true);
    var latitude = start_marker.getPosition().lat();
    var longitude = start_marker.getPosition().lng();
    try{
        $(document).append('<script type="text/javascript" async="async" src="http://api.routine.jairtrejo.mx/search?' +
                           'nameortype=' + name +
                           '&address=' + address +
                           '&lat=' + latitude +
                           '&lng=' + longitude +
                           '&cback=show_search"></s' + 'cript>');
    }
    catch(e){
        show_error('There was a problem processing your request.');
        $('input[name="business"]').removeClass('loading-field');
        $('input[name="search"]').attr('disabled', false);
    }
}

function show_search(data){
    var bounds = new google.maps.LatLngBounds();
    bss = data['bss'];
    if(bss.length == 0){
        show_error('No results found. Try broadening your search.');
        $('input[name="business"]').removeClass('loading-field');
        $('input[name="search"]').attr('disabled', false);
        return;
    }
    for(i in bss){
        var bs = bss[i];
        var marker = geo.create_marker();
        marker.setIcon('http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png');
        geo.place_marker(stop_map, marker, new google.maps.LatLng(bs['lat'], bs['lng']));
        marker.setDraggable(false);
        geo.add_infowindow(stop_map, marker, bs['bubble']);
        bounds.extend(marker.getPosition());
        search_markers.push(marker);
    }
    bounds.extend(start_marker.getPosition());
    stop_map.fitBounds(bounds);
    $('input[name="business"]').removeClass('loading-field');
    $('input[name="search"]').attr('disabled', false);
}

function add_stop(uid, html){
    if($.inArray(uid, stops) != -1){
        show_error('You are already visiting that place.');
        return;
    }
    stops.push(uid);
    if($('li.astop').length == 0){
        $('ul#stopsl li').remove();
    }
    $('ul#stopsl').append('' +
    '<li class="astop" id="u' + uid + '"><a class="zp-10" href="javascript:remove_stop(\'' + uid + '\');">' +
        '<img src="images/remove.png" title="remove"/></a>' +
        '<div class="zp-90">' +
        html +
        '</div>' +
    '</li>')
    $('#u' + uid).hide().fadeIn();
}

function remove_stop(uid){
    $('li#u' + uid).fadeOut('normal', function(){
        $(this).remove();
        if($('li.astop').length == 0){
            $('ul#stopsl').append('<li>You haven\'t set any stops</li>');
        }
        stops.splice(stops.indexOf(uid), 1);
    });
}

$(document).ready(function(){
    initialize();
    $('.error').hide();
    $('#thinking').hide();
    $('#print').hide();

    $('#addr_form').submit(function(){
        var addr = $('input[name="address"]').val();
        if(addr == ''){
            show_error('Please specify an address.');
            return false;
        }
        $('input[name="search"]').attr('disabled', true);
        geocoder.geocode({address : addr, latLng : thecity}, function(results, status){
            $('input[name="search"]').attr('disabled', false);
            if(status == google.maps.GeocoderStatus.OK){
                geo.address_selector = 'input[name="address"]';
                if(!home_marker) home_marker = geo.create_marker();
                geo.place_marker(home_map, home_marker, results[0].geometry.location);
            }
            else{
                show_error("We encountered a problem processing that address: " + status);
            }
        });
        return false;
    });

    $('#search_form').submit(function(){
        search_bss($('input[name="business"]').val(), $('input[name="b_address"]').val());
        return false;
    });

    $('div#interface').scrollable({
        keyboard : false,
    }).bind('onBeforeSeek', function(){
        var ind = $("#interface").data("scrollable").getIndex();
        if(home_marker == null){
            show_error('Please specify a starting point.');
            return false;
        }
        if(!start_marker) start_marker = geo.create_marker();
        geo.place_marker(stop_map, start_marker, home_marker.position);
        start_marker.setDraggable(false);
        return true;
    }).bind('onSeek', function(){
        var ind = $("#interface").data("scrollable").getIndex();
        switch(ind){
            case 0:
                geo.address_selector = 'input[name="address"]';
                break;
            case 1:
                geo.address_selector = '';
                $('p#starting_point').text(geo.last_address);
                clear_search();
                break;
            case 2:
                geo.address_selector = '';
                if(stops.length > 0){
                    get_itinerary();
                }
                else{
                    clear_itinerary();
                    $('p#wait_itinerary').show().text('You haven\'t set any stops! Please go back and add some.');
                }
        }
        $('#steps li').removeClass('active');
        $('li#step' + (ind + 1)).addClass('active');
    });
});

