import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JhiDateUtils } from 'ng-jhipster';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { createRequestOption } from '../../shared';
import { SERVER_API_URL } from '../../xm.constants';
import { Pocket } from './pocket.model';

@Injectable()
export class PocketService {

    private resourceUrl =  SERVER_API_URL + 'balance/api/pockets';

    constructor(private http: HttpClient, private dateUtils: JhiDateUtils) { }

    create(pocket: Pocket): Observable<HttpResponse<Pocket>> {
        const copy = this.convert(pocket);
        return this.http.post<Pocket>(this.resourceUrl, copy, { observe: 'response' }).pipe(
            map((res: HttpResponse<Pocket>) => this.convertResponse(res)));
    }

    update(pocket: Pocket): Observable<HttpResponse<Pocket>> {
        const copy = this.convert(pocket);
        return this.http.put<Pocket>(this.resourceUrl, copy, { observe: 'response' }).pipe(
            map((res: HttpResponse<Pocket>) => this.convertResponse(res)));
    }

    find(id: number): Observable<HttpResponse<Pocket>> {
        return this.http.get<Pocket>(`${this.resourceUrl}/${id}`, { observe: 'response'}).pipe(
            map((res: HttpResponse<Pocket>) => this.convertResponse(res)));
    }

    query(req?: any): Observable<HttpResponse<Pocket[]>> {
        const options = createRequestOption(req);
        return this.http.get<Pocket[]>(this.resourceUrl, { params: options, observe: 'response' }).pipe(
            map((res: HttpResponse<Pocket[]>) => this.convertArrayResponse(res)));
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response'});
    }

    private convertResponse(res: HttpResponse<Pocket>): HttpResponse<Pocket> {
        const body: Pocket = this.convertItemFromServer(res.body);
        return res.clone({body});
    }

    private convertArrayResponse(res: HttpResponse<Pocket[]>): HttpResponse<Pocket[]> {
        const jsonResponse: Pocket[] = res.body;
        const body: Pocket[] = [];
        for (let i = 0; i < jsonResponse.length; i++) {
            body.push(this.convertItemFromServer(jsonResponse[i]));
        }
        return res.clone({body});
    }

    /**
     * Convert a returned JSON object to Pocket.
     */
    private convertItemFromServer(pocket: Pocket): Pocket {
        const copy: Pocket = Object.assign({}, pocket);
        copy.startDateTime = this.dateUtils
            .convertDateTimeFromServer(pocket.startDateTime);
        copy.endDateTime = this.dateUtils
            .convertDateTimeFromServer(pocket.endDateTime);
        return copy;
    }

    /**
     * Convert a Pocket to a JSON which can be sent to the server.
     */
    private convert(pocket: Pocket): Pocket {
        const copy: Pocket = Object.assign({}, pocket);

        copy.startDateTime = this.dateUtils.toDate(pocket.startDateTime);

        copy.endDateTime = this.dateUtils.toDate(pocket.endDateTime);
        return copy;
    }
}
