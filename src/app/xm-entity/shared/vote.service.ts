import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JhiDateUtils } from 'ng-jhipster';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { createRequestOption } from '../../shared/model/request-util';
import { SERVER_API_URL } from '../../xm.constants';
import { Vote } from './vote.model';

@Injectable()
export class VoteService {

    private resourceUrl = SERVER_API_URL + 'entity/api/votes';
    private resourceSearchUrl = SERVER_API_URL + 'entity/api/_search/votes';

    constructor(private http: HttpClient, private dateUtils: JhiDateUtils) {
    }

    create(vote: Vote): Observable<HttpResponse<Vote>> {
        const copy = this.convert(vote);
        return this.http.post<Vote>(this.resourceUrl, copy, {observe: 'response'}).pipe(
            map((res: HttpResponse<Vote>) => this.convertResponse(res)));
    }

    update(vote: Vote): Observable<HttpResponse<Vote>> {
        const copy = this.convert(vote);
        return this.http.put<Vote>(this.resourceUrl, copy, {observe: 'response'}).pipe(
            map((res: HttpResponse<Vote>) => this.convertResponse(res)));
    }

    find(id: number): Observable<HttpResponse<Vote>> {
        return this.http.get<Vote>(`${this.resourceUrl}/${id}`, {observe: 'response'}).pipe(
            map((res: HttpResponse<Vote>) => this.convertResponse(res)));
    }

    query(req?: any): Observable<HttpResponse<Vote[]>> {
        const options = createRequestOption(req);
        return this.http.get<Vote[]>(this.resourceUrl, {params: options, observe: 'response'}).pipe(
            map((res: HttpResponse<Vote[]>) => this.convertArrayResponse(res)));
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, {observe: 'response'});
    }

    search(req?: any): Observable<HttpResponse<Vote[]>> {
        const options = createRequestOption(req);
        return this.http.get<Vote[]>(this.resourceSearchUrl, {params: options, observe: 'response'}).pipe(
            map((res: HttpResponse<Vote[]>) => this.convertArrayResponse(res)));
    }

    private convertResponse(res: HttpResponse<Vote>): HttpResponse<Vote> {
        const body: Vote = this.convertItemFromServer(res.body);
        return res.clone({body});
    }

    private convertArrayResponse(res: HttpResponse<Vote[]>): HttpResponse<Vote[]> {
        const jsonResponse: Vote[] = res.body;
        const body: Vote[] = [];
        for (let i = 0; i < jsonResponse.length; i++) {
            body.push(this.convertItemFromServer(jsonResponse[i]));
        }
        return res.clone({body});
    }

    /**
     * Convert a returned JSON object to Vote.
     */
    private convertItemFromServer(vote: Vote): Vote {
        const copy: Vote = Object.assign({}, vote);
        copy.entryDate = this.dateUtils
            .convertDateTimeFromServer(vote.entryDate);
        return copy;
    }

    /**
     * Convert a Vote to a JSON which can be sent to the server.
     */
    private convert(vote: Vote): Vote {
        const copy: Vote = Object.assign({}, vote);

        copy.entryDate = this.dateUtils.toDate(vote.entryDate);
        return copy;
    }
}
