import { StringMap } from '@angular/compiler/src/compiler_facade_interface';

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface PlaceLocation extends Coordinates {
    address: string;
    staticMapImagetUrl: string;
}
