var geo = {
    address_selector : null,
    last_address : null,
    infowindows : [],

    create_marker : function(){
        var marker = new google.maps.Marker();
        google.maps.event.addListener(marker, 'dragend', function(){
            geo.geocodePosition(marker.getPosition());
        });
        return marker;
    },

    place_marker : function(map, marker, pos){
        marker.setMap(map);
        marker.setPosition(pos);
        marker.setDraggable(true);
        map.setCenter(pos);
        map.setZoom(16);
        geo.geocodePosition(pos);
    },

    geocodePosition : function(pos){
        geocoder.geocode({ latLng: pos }, function(responses) {
            if(responses && (responses.length > 0)){
                if(geo.address_selector != '')
                    $(geo.address_selector).val(responses[0].formatted_address);
                geo.last_address = responses[0].formatted_address;
            }
            else{
                if(geo.address_selector != '')
                    $(geo.address_selector).val('Cannot determine address at this location.');
            }
        });
    },

    add_infowindow : function(map, marker, data){
        var infowindow = new google.maps.InfoWindow({
            content: data
        });
        google.maps.event.addListener(marker, 'click', function(){
            geo.close_infowindows();
            infowindow.open(map, marker);
        });
        geo.infowindows.push(infowindow);
    },

    close_infowindows : function(){
        for(i in geo.infowindows){
            geo.infowindows[i].close();
        }
    },

    clear_infowindows : function(){
        for(i in geo.infowindows){
            geo.infowindows[i].setMap(null);
            geo.infowindows[i] = null;
        }
        geo.infowindows.length = 0;
    }

}
