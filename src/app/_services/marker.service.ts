import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { PopUpService } from './pop-up.service';
import 'leaflet.markercluster';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class MarkerService {
  // add &maxFeatures=50 to URL to limit number of features
  events: string =
    'http://human.zgis.at/geoserver/music_map/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=music_map:salzburg_info_api&outputFormat=application%2Fjson';
  organizers: string =
    'http://human.zgis.at/geoserver/music_map/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=music_map:musicmap_organizers&outputFormat=application%2Fjson';

  constructor(private http: HttpClient, private popupService: PopUpService) {}
  organizers_grp = L.layerGroup();
  events_grp = L.layerGroup();
  makeEventMarkers(map: L.map): void {
    var markerCount = 0;
    var date;
    var today = moment().format('YYYY-MM-DD');

    let cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
    });
    console.log('Creating markers...');
    this.http.get(this.events).subscribe((res: any) => {
      for (const c of res.features) {
        const datesJson = JSON.parse(c.properties.dates);
        for (let i = 0; i < datesJson.length; i++) {
          date = datesJson[i];
        }
        console.log(date.from + 'today is ' + today);
        if (date.to > moment().format('YYYY-MM-DD')) {
          const lat = c.geometry.coordinates[0];
          const lon = c.geometry.coordinates[1];
          const marker = L.marker([lon, lat]);

          marker.bindPopup(this.popupService.makeEventPopup(c));
          cluster.addLayer(marker);
          markerCount++;
        }
      }
      console.log('Created ' + markerCount + ' event markers');
    });
    // add event clusters/markers to map
    map.addLayer(cluster);
    
  }
  makeOrganizerMarkers(map: L.map): void {
    this.http.get(this.organizers).subscribe((org: any) => {
      console.log('creating organizer markers');
      for (const o of org.features) {
        const lat = o.geometry.coordinates[0];
        const lon = o.geometry.coordinates[1];
        const marker = L.marker([lon, lat]).addTo(map);
        marker.bindPopup(this.popupService.makeOrganizerPopup(o));
        this.organizers_grp.addLayer(marker);
      }
    });
  }
}
