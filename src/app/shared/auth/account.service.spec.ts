import {TestBed} from '@angular/core/testing';
import {AccountService} from './account.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {SERVER_API_URL} from '../../xm.constants';
import {ACCOUNT_LOGIN_UPDATE_URL, ACCOUNT_URL, ACCOUNT_TFA_ENABLE_URL, ACCOUNT_TFA_DISABLE_URL} from './auth.constants';
import {JhiDateUtils} from 'ng-jhipster';

describe('AccountService', () => {

    let service: AccountService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                AccountService,
                JhiDateUtils
            ]
        });
        httpTestingController = TestBed.get(HttpTestingController);
        service  = TestBed.get(AccountService);
    });

    describe('get()', () => {
        it('should call with correct URL', () => {
            service.get().subscribe((data) => {});
            const req = httpTestingController.expectOne(SERVER_API_URL + ACCOUNT_URL);
            req.flush({id: 1});
            httpTestingController.verify();
        });

    });


    describe('save()', () => {
        it('should call with correct URL', () => {
            service.save({id: 100}).subscribe((data) => {});
            const req = httpTestingController.expectOne(SERVER_API_URL + ACCOUNT_URL);
            req.flush({id: 1});
            httpTestingController.verify();
        });

    });


    describe('updateLogins()', () => {
        it('should call with correct URL', () => {
            service.updateLogins({id: 100}).subscribe((data) => {});
            const req = httpTestingController.expectOne(SERVER_API_URL + ACCOUNT_LOGIN_UPDATE_URL);
            req.flush({id: 1});
            httpTestingController.verify();
        });
    });

    describe('enableTFA()', () => {
        it('should call with correct URL', () => {
            service.enableTFA('test', 'test').subscribe((data) => {});
            const req = httpTestingController.expectOne(SERVER_API_URL + ACCOUNT_TFA_ENABLE_URL);
            req.flush({id: 1});
            httpTestingController.verify();
        });
    });

    describe('disableTFA()', () => {
        it('should call with correct URL', () => {
            service.disableTFA().subscribe((data) => {});
            const req = httpTestingController.expectOne(SERVER_API_URL + ACCOUNT_TFA_DISABLE_URL);
            req.flush({id: 1});
            httpTestingController.verify();
        });
    });

});
