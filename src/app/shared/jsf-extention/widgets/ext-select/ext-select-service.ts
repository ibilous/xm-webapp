import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { Principal } from '../../../auth/principal.service';
import { I18nNamePipe } from '../../../language/i18n-name.pipe';
import { ExtSelectOptions } from './ext-select-options.model';

@Injectable()
export class ExtSelectService {

    public static byString(o, s) {
        s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        s = s.replace(/^\./, '');           // strip a leading dot
        const a = s.split('.');
        for (let i = 0, n = a.length; i < n; ++i) {
            const k = a[i];
            if (k in o) {
                o = o[k];
            } else {
                return;
            }
        }
        return o;
    }

    constructor(
        private http: HttpClient,
        private principal: Principal,
        private i18nNamePipe: I18nNamePipe
    ) {}


    fetchData(options: ExtSelectOptions) {
        return this.http.get(options.url, {observe: 'response'}).pipe(
            map((response: HttpResponse<any>) => {
                const json = response.body;
                return this.mapArrayToView(json, options);
            }));
    }

    mapArrayToView(object: any, options: ExtSelectOptions) {
        let array = object;
        if (options.arrayField) {
            array = ExtSelectService.byString(object, options.arrayField);
        }
        array = array ? array : [];
        let elements = [];
        array.forEach(e => {
            let label = e;
            let value = e;
            if (options.labelField) {
                label = ExtSelectService.byString(e, options.labelField);
            }
            label = this.i18nNamePipe.transform(label, this.principal);
            if (options.valueField) {
                value = ExtSelectService.byString(value, options.valueField);
            }
            elements.push({
                label: label,
                value: value,
                object: e
            });
        });
        elements = elements.sort((a, b) => {
            const x = this.nullSafeLabel(a).toLowerCase();
            const y = this.nullSafeLabel(b).toLowerCase();
            if (x < y) {
                return -1;
            }
            if (x > y) {
                return 1;
            }
            return 0;
        });
        return elements;
    }

    nullSafeLabel(x) {
        return x ? '' + x.label ? '' + x.label : '' : '';
    }

}
