import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { JhiAlertService, JhiEventManager } from 'ng-jhipster';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { ResponseConfig, ResponseConfigItem, ResponseContext } from './response-config.model';
import { XmConfigService } from '../spec/config.service';
import { I18nNamePipe } from '../language/i18n-name.pipe';
import { Principal } from '../../shared/auth/principal.service';

declare let swal: any;
declare let $: any;

@Component({
    selector: 'xm-alert-error',
    templateUrl: './alert-error.component.html'
})
export class JhiAlertErrorComponent implements OnDestroy {

    alerts: any[];
    cleanHttpErrorListener: Subscription;
    rc: ResponseContext;
    responseConfig: ResponseConfig;

    /* tslint:disable */
    constructor(private alertService: JhiAlertService,
                private eventManager: JhiEventManager,
                private principal: Principal,
                protected router: Router,
                private i18nNamePipe: I18nNamePipe,
                private translateService: TranslateService,
                private specService: XmConfigService) {
        /* tslint:enable */
        this.alerts = [];

        this.cleanHttpErrorListener = eventManager.subscribe('xm.httpError', resp => {
            const response = this.processResponse(resp);
            this.specService.getUiConfig().subscribe(result => {
                if (result &&
                    result.responseConfig &&
                    result.responseConfig.responses &&
                    result.responseConfig.responses.length) {
                    this.rc = new ResponseContext(response.content, response.request);
                    this.responseConfig = new ResponseConfig(result.responseConfig.responses.map(e => {
                        return new ResponseConfigItem(
                            e.code,
                            e.codePath,
                            e.status,
                            e.type,
                            e.validationField,
                            e.validationFieldsExtractor,
                            e.outputMessage,
                            e.condition,
                            e.redirectUrl
                        );
                    }));
                    const respConfigEl = this.responseConfig.getResponseConfigItem(this.rc);
                    if (respConfigEl) {
                        this.configAndSendError(respConfigEl, response);
                    } else {
                        this.sendDefaultError(response);
                    }
                } else {
                    this.sendDefaultError(response);
                }
            });
        });
    }


    configAndSendError(config: ResponseConfigItem, response: any, params?: any) {
        const title = this.processMessage(config.outputMessage ?
            config.outputMessage :
            null, response);
        const messageSettings = config.type.split('.') || [];
        switch (messageSettings[0]) {
            case 'swal': {
                swal({
                    title: title,
                    width: '42rem',
                    type: messageSettings[1],
                    buttonsStyling: false,
                    confirmButtonClass: 'btn btn-primary'
                }).then((result) => {
                    if (result && config.redirectUrl) {
                        const redirect = (config.redirectUrl === '/') ? '' : config.redirectUrl;
                        this.router.navigate([redirect]);
                    }
                });
                break;
            }
            case 'ignore': {
                break;
            }
            case 'validation': {

                let errors = new Function('rc', config.validationFieldsExtractor)(this.rc);
                for (let key in errors) {
                    errors[key] = this.processMessage(errors[key] ? errors[key] : null, response);
                }
                this.eventManager.broadcast({name: 'xm.ValidationError', content: config, rc: this.rc, title: title, errors: errors});
                break;
            }
            case 'alert': {
                const type: any = messageSettings[1];
                $.notify({
                    message: title,
                }, {
                    type: messageSettings[1]
                });
                break;
            }
            default: {
                console.error('Wrong responseConfigItem type - sending default error');
                this.sendDefaultError(response);
            }
        }
    }

    processMessage(config, response) {
        if (!config) {
            return null;
        }
        switch (config.type) {
            case 'TRANSLATION_KEY': {
                return this.translateService.instant(config.value, {
                    rc: this.rc
                });
            }
            case 'TRANSLATION_KEY_PATH': {
                return this.translateService.instant('errors.' + this.getFromPath(this.rc.response, config.value), {
                    rc: this.rc
                });
            }
            case 'MESSAGE_PATH': {
                return this.getFromPath(this.rc.response.error, config.value);
            }
            case 'MESSAGE_OBJECT': {
                return this.i18nNamePipe.transform(config.value, this.principal);
            }
            default: {
                console.error('Wrong responseConfigItem outputMessage type - returning default message');
                if (response.content.error !== '' && response.content.error.error) {
                    return this.translateService.instant('errors.' + response.content.error.error);
                } else {
                    return this.translateService.instant('errors.' + response.content.error);
                }
            }
        }
    }

    ngOnDestroy() {
        if (this.cleanHttpErrorListener !== undefined && this.cleanHttpErrorListener !== null) {
            this.eventManager.destroy(this.cleanHttpErrorListener);
            this.alerts = [];
        }
    }

    sendDefaultError(response) {
        let i;
        const httpErrorResponse = response.content;
        switch (httpErrorResponse.status) {
            // connection refused, server not reachable
            case 0:
                this.addErrorAlert('Server not reachable', 'error.server.not.reachable');
                break;

            case 400:
                const arr = httpErrorResponse.headers.keys();
                let errorHeader = null;
                let entityKey = null;
                arr.forEach(entry => {
                    if (entry.endsWith('app-error')) {
                        errorHeader = httpErrorResponse.headers.get(entry);
                    } else if (entry.endsWith('app-params')) {
                        entityKey = httpErrorResponse.headers.get(entry);
                    }
                });
                if (errorHeader) {
                    const entityName = this.translateService.instant('global.menu.entities.' + entityKey);
                    this.addErrorAlert(errorHeader, errorHeader, {entityName});
                } else if (httpErrorResponse.error !== '' && httpErrorResponse.error.fieldErrors) {
                    const fieldErrors = httpErrorResponse.error.fieldErrors;
                    for (i = 0; i < fieldErrors.length; i++) {
                        const fieldError = fieldErrors[i];
                        // convert 'something[14].other[4].id' to 'something[].other[].id' so translations can be written to it
                        const convertedField = fieldError.field.replace(/\[\d*\]/g, '[]');
                        const fieldName = this.translateService.instant(
                            'jhipsterSampleApplicationApp.' + fieldError.objectName + '.' + convertedField
                        );
                        this.addErrorAlert('Error on field "' + fieldName + '"', 'errors.' + fieldError.message, {fieldName});
                    }
                } else if (httpErrorResponse.error !== '' && httpErrorResponse.error.error) {
                    console.log(this.translateService.instant('errors.' + httpErrorResponse.error.error));
                    this.addErrorAlert(
                        'errors.' + httpErrorResponse.error.error_description,
                        'errors.' + httpErrorResponse.error.error,
                        httpErrorResponse.error.params
                    );
                } else {
                    this.addErrorAlert('errors.' + httpErrorResponse.error);
                }
                break;

            case 404:
                this.addErrorAlert('Not found', 'errors.url.not.found');
                break;

            default:
                if (httpErrorResponse.error !== '' && httpErrorResponse.error.error) {
                    this.addErrorAlert('errors.' + httpErrorResponse.error.error);
                } else {
                    this.addErrorAlert('errors.' + httpErrorResponse.error);
                }
        }
    }

    addErrorAlert(message, key?, data?) {
        key = key && key !== null ? key : message;
        this.alerts.push(
            this.alertService.addAlert(
                {
                    type: 'danger',
                    msg: key,
                    params: data,
                    timeout: 5000,
                    toast: true,
                    scoped: true
                },
                this.alerts
            )
        );
    }

    private processResponse (resp: any): any {
        const requestType = resp.request.responseType;
        const respType = resp.content.headers.get('content-type');
        if (requestType === 'arraybuffer' && respType === 'application/json;charset=UTF-8') {
            try {
                const decodedString = String.fromCharCode.apply(null, new Uint8Array(resp.content.error));
                const error = JSON.parse(decodedString);
                resp.content.error = error;
                return resp;
            } catch (e) {
                console.error(e);
            }
        }
        try {
            const errorType = this.getVarType(resp.content.error);
            if (errorType && errorType === 'string') {
                resp.content.error = JSON.parse(resp.content.error);
            }
        } catch (e) {
            console.error(e);
        }
        return resp;
    }

    private getVarType(variable: any): any {
        return typeof variable;
    }

    private getFromPath(obj, path) {
        let paths = path.split('.')
            , current = obj
            , i;
        for (i = 0; i < paths.length; ++i) {
            if (current[paths[i]] == undefined) {
                return undefined;
            } else {
                current = current[paths[i]];
            }
        }
        return current;
    }
}
