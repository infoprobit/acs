import { ClosureComponent, Component } from 'mithril';
import { m } from './components.ts';
import * as store from './store.ts';
import * as notifications from './notifications.ts';
import { LOGO_PNG, LOGIN_BACKGROUND_JPG } from '../build/assets.ts';

export function init(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    return Promise.resolve(args);
}

export const component: ClosureComponent = (): Component => {
    return {
        view: (vnode) => {
            if (window.username) m.route.set(vnode.attrs['continue'] || '/');

            document.title = 'Login - ProACS';
            return [
                m.trust( '<style>body:before { content: " "; display: block; position: absolute; left: 0; top: 0; width: 100%; height: 100%; opacity: 0.6; background-image: url("' + LOGIN_BACKGROUND_JPG + '"); background-repeat: no-repeat; background-position: 50% 0; background-size: cover; }</style>'),
                m(
                    'div.card.mb-3',
                    m(
                        'div.card-body',
                        m('div.d-flex.justify-content-center.py-4', m('img', {class: 'logo-login', src: LOGO_PNG})),
                        m(
                            'form.row.g-3',
                            m('div.col-12', m('div.input-group', [
                                m('input.form-control', {
                                    name       : 'username',
                                    type       : 'text',
                                    required   : true,
                                    placeholder: 'Email',
                                    value      : vnode.state['username'],
                                    oncreate   : (vnode2) => {
                                        (vnode2.dom as HTMLInputElement).focus();
                                    },
                                    oninput    : (e) => {
                                        vnode.state['username'] = e.target.value;
                                    },
                                }),
                                m('span.input-group-text', m('span.bi.bi-person-fill')),
                            ])),

                            m('div.col-12', m('div.input-group', [
                                m('input.form-control', {
                                    name    : 'password',
                                    type    : 'Password',
                                    required: true,
                                    placeholder: 'Password',
                                    value   : vnode.state['password'],
                                    oninput : (e) => {
                                        vnode.state['password'] = e.target.value;
                                    },
                                }),
                                m('span.input-group-text', m('span.bi bi-lock-fill')),
                            ])),
                            m('div.col-12', m('button.btn.btn-primary.w-100', {
                                type   : 'submit',
                                onclick: (e) => {
                                    e.target.disabled = true;
                                    store
                                        .logIn(vnode.state['username'], vnode.state['password'])
                                        .then(() => {
                                            location.reload();
                                        })
                                        .catch((err) => {
                                            notifications.push('error', err.response || err.message);
                                            e.target.disabled = false;
                                        });
                                    return false;
                                },
                            }, 'Login')),
                        ),
                    ),
                ),
            ];
        },
    };
};
