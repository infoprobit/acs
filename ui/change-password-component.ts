import { ClosureComponent, VnodeDOM } from 'mithril';
import * as notifications from './notifications.ts';
import { changePassword } from './store.ts';
import { m } from './components.ts';

interface Attrs {
    noAuth?: boolean;
    username?: string;
    onPasswordChange: () => void;
}

const component: ClosureComponent<Attrs> = () => {
    return {
        view: (vnode) => {
            const onPasswordChange = vnode.attrs.onPasswordChange;
            const enforceAuth      = !vnode.attrs.noAuth;
            const username         = vnode.attrs.username;

            if (username) vnode.state['username'] = username;

            const form = [
                m(
                    'div.row.mb-3',
                    m('label', {class: 'col-sm-3 col-form-label p-0', for: 'username'}, 'Username'),
                    m(
                        'div.col-sm-9',
                        m('input', {
                            name    : 'username',
                            type    : 'text',
                            value   : vnode.state['username'],
                            class   : 'form-control',
                            disabled: !!username,
                            oninput : (e) => {
                                vnode.state['username'] = e.target.value;
                            },
                            oncreate: (_vnode) => {
                                (_vnode.dom as HTMLSelectElement).focus();
                            },
                        }),
                    ),
                ),
            ];

            let fields = {
                newPassword    : 'New password',
                confirmPassword: 'Confirm password',
            };
            if (enforceAuth)
                fields = Object.assign({authPassword: 'Your password'}, fields);

            for (const [f, l] of Object.entries(fields)) {
                form.push(
                    m(
                        'div.row.mb-3',
                        m('label', {class: 'col-sm-3 col-form-label p-0', for: f}, l),
                        m(
                            'div.col-sm-9',
                            m('input', {
                                name   : f,
                                type   : 'password',
                                value  : vnode.state[f],
                                class  : 'form-control',
                                oninput: (e) => {
                                    vnode.state[f] = e.target.value;
                                },
                            }),
                        ),
                    ),
                );
            }

            const submit = m('button.btn.btn-primary', {type: 'submit'}, 'Change password') as VnodeDOM;

            form.push(m('.modal-footer.actions-bar', submit));

            const children = [
                m('.modal-header', m('h5.modal-title', 'Change password')),
                m(
                    '.modal-body',
                    m(
                        'form.row',
                        {
                            onsubmit: (e) => {
                                e.redraw = false;
                                e.preventDefault();
                                if (
                                    !vnode.state['username'] ||
                                    !vnode.state['newPassword'] ||
                                    (enforceAuth && !vnode.state['authPassword'])
                                ) {
                                    notifications.push('error', 'Please fill all fields');
                                } else if (
                                    vnode.state['newPassword'] !== vnode.state['confirmPassword']
                                ) {
                                    notifications.push(
                                        'error',
                                        'Password confirm doesn\'t match new password',
                                    );
                                } else {
                                    (submit.dom as HTMLFormElement).disabled = true;
                                    changePassword(
                                        vnode.state['username'],
                                        vnode.state['newPassword'],
                                        vnode.state['authPassword'],
                                    )
                                        .then(() => {
                                            notifications.push(
                                                'success',
                                                'Password updated successfully',
                                            );
                                            if (onPasswordChange) onPasswordChange();
                                            (submit.dom as HTMLFormElement).disabled = false;
                                        })
                                        .catch((err) => {
                                            notifications.push('error', err.message);
                                            (submit.dom as HTMLFormElement).disabled = false;
                                        });
                                }
                            },
                        },
                        form,
                    ),
                ),
            ];

            return m('div.modal-content', children);
        },
    };
};

export default component;
