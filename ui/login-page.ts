import { Children, ClosureComponent, Component } from 'mithril';
import { m } from './components.ts';
import * as store from './store.ts';
import * as notifications from './notifications.ts';
import * as overlay from './overlay.ts';
import changePasswordComponent from './change-password-component.ts';
import { LOGO_PNG } from '../build/assets.ts';

export function init(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    return Promise.resolve(args);
}

export const component: ClosureComponent = (): Component => {
    return {
        view: (vnode) => {
            if (window.username) m.route.set(vnode.attrs['continue'] || '/');

            document.title = 'Login - ProACS';
            return [
                m(
                    'div.d-flex.justify-content-center.py-4',
                    m('img', {class: 'logo d-flex align-items-center w-auto', src: LOGO_PNG}),
                ),
                m(
                    'div.card.mb-3',
                    m(
                        'div.card-body',
                        m(
                            'div.pt-4.pb-2',
                            m('h5.card-title.text-center.pb-0.fs-4', 'Sing In to Your Account'),
                            m('p.text-center.small', 'Enter your Username & Password to login'),
                        ),
                        m(
                            'form.row.g-3.needs-validation',
                            m(
                                'div.col-12',
                                m('label.form-label', {for: 'username'}, 'Username'),
                                m(
                                    'div.input-group.has-validation',
                                    m('span.input-group-text', '@'),
                                    m('input.form-control', {
                                        name    : 'username',
                                        type    : 'text',
                                        required: true,
                                        value   : vnode.state['username'],
                                        oncreate: (vnode2) => {
                                            (vnode2.dom as HTMLInputElement).focus();
                                        },
                                        oninput : (e) => {
                                            vnode.state['username'] = e.target.value;
                                        },
                                    }),
                                    m('div.invalid-feedback', 'Please enter your username!'),
                                ),
                            ),
                            m(
                                'div.col-12',
                                m('label.form-label', {for: 'password'}, 'Password'),
                                m('input.form-control', {
                                    name    : 'password',
                                    type    : 'password',
                                    required: true,
                                    value   : vnode.state['password'],
                                    oninput : (e) => {
                                        vnode.state['password'] = e.target.value;
                                    },
                                }),
                                m('div.invalid-feedback', 'Please enter your password!'),
                            ),
                            m(
                                'div.col-12',
                                m(
                                    'button.btn.btn-primary.w-100',
                                    {
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
                                    },
                                    'Login',
                                ),
                            ),
                            m(
                                'div.col-12.d-flex.justify-content-center',
                                m(
                                    'p.small.mb-0',
                                    m(
                                        'a',
                                        {
                                            onclick: () => {
                                                const cb = (): Children => {
                                                    const attrs = {
                                                        onPasswordChange: () => {
                                                            overlay.close(cb);
                                                            m.redraw();
                                                        },
                                                    };
                                                    return m(changePasswordComponent, attrs);
                                                };
                                                overlay.open(cb);
                                            },
                                        },
                                        'Change Password',
                                    ),
                                ),
                            ),
                        ),
                    ),
                ),
            ];
        },
    };
};
